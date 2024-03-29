require('dotenv').config();
var dateTime = require('node-datetime');
var md5 = require('md5');
const WebSocket = require('ws');
const { env } = require('process');
const app_redis = require('./app-redis');
const app_mongodb = require('./app-mongodb');

async function setRedis(key, data){
    app_redis.set("connected:" + key, data);
}

async function chkAccessToken(key){
    return await app_redis.get("tokenAccess:" + key);
}

async function sendMetricsToServer(key){
    const data = await app_redis.get("connected:" + key);
    if(data){
        ws_data = JSON.parse(data);
        var dt = dateTime.create();
        const fp_score = (((ws_data.s > 0 ? 1 : 0) +
        ((ws_data.c > 0 ? 1 : 0) * 2) +
        (ws_data.m > 0 ? 1 : 0) +
        (ws_data.InitiateCheckout * 3)) / 7 * 100);
        if(!ws_data.InitiateCheckout) ws_data.events = {};
        metric = {};
        metric.id_link = ws_data.id;
        metric.date_time = dt.format('Y-m-d H:M:S');
        metric.scrolls = ws_data.s;
        metric.clicks = ws_data.c;
        metric.moves = ws_data.m;
        metric.reading = ws_data.d;
        metric.closed = ws_data.closed;
        metric.time = ws_data.time;
        metric.referrer = ws_data.ref;
        metric.ip = ws_data.ip;
        metric.userAgent = ws_data.userAgent;
        metric.demografia = ws_data.demografia;
        metric.device = ws_data.device;
        metric.InitiateCheckout = ws_data.InitiateCheckout;
        metric.Lead = ws_data.Lead;
        metric.Purchase = 0,
        metric.fp = ws_data.fp.toString();
        metric.fp_score = fp_score;
        metric.events = ws_data.events;
        metric.token = key;
        metric.identifier = ws_data.identifier;
        metric.hashIdentifier = md5(ws_data.identifier);
        app_mongodb.set(metric);
    }
}

function onError(ws, err) {
    console.error(`onError: ${err.message}`);
}

function onClose(ws, req){
    const wstoken = req.headers["sec-websocket-key"];
    sendMetricsToServer(wstoken);
    console.log(`Client Disconnected`);
}

function onMessage(ws, data, req) {
    try{
        const wstoken = req.headers["sec-websocket-key"];
        obj = JSON.parse(data);
        if(obj.metrics){
            if((obj.metrics.time / 1000 / 60) >= 45) ws.terminate();
            setRedis(wstoken, JSON.stringify(obj.metrics));
        }
        ws.send(JSON.stringify({"Analytika": "ok"}));
    }catch(e){
        ws.send(JSON.stringify({"Analytika": "error", "msg": e.message}));
    }
}

function onConnection(ws, req) {
    //check permission
    const accessToken = req.url;
    console.log("[?]chkToken: " + accessToken);
    chkAccessToken(accessToken).then((access)=>{
        if(!access){
            console.log(`[!] Client not authorized`);
            ws.terminate()
        }else{
            console.log(`Client authorized`);
        }
    }, (err)=>{console.error(err)});
    //end: check permission
    ws.on('message', data => onMessage(ws, data, req));
    ws.on('error', error => onError(ws, error));
    ws.on('close', ()=> onClose(ws, req));
    console.log(`Client Connected`);
}

module.exports = () => {
    const wsServer = new WebSocket.WebSocketServer({ port: env.WS_PORT });

    wsServer.on('connection', onConnection);

    console.log(`Analytika is running!`);
    return wsServer;
}