require('dotenv').config();
const WebSocket = require('ws');
const { env } = require('process');
const app_redis = require('./app-redis');
const app_mongodb = require('./app-mongodb');

async function setRedis(key, data){
    app_redis.set("connected:" + key, data);
}

async function chkAccessToken(key){
    return await app_redis.get("accessToken:" + key);
}

async function sendMetricsToServer(key){
    const data = await app_redis.get("connected:" + key);
    if(data){
        ws_data = JSON.parse(data);
        const fp_score = ((ws_data.s > 0 ? 1 : 0) +
        ((ws_data.c > 0 ? 1 : 0)*2) +
        (ws_data.m > 0 ? 1 : 0) +
        ((ws_data.d > 0 ? 1 : 0)*2))/6*100;
        metric = {};
        metric.id_link = ws_data.id;
        metric.date_time = ws_data.date_time;
        metric.scrolls = ws_data.s;
        metric.clicks = ws_data.c;
        metric.moves = ws_data.m;
        metric.reading = ws_data.d;
        metric.closed = ws_data.closed;
        metric.time = ws_data.time;
        metric.referrer = ws_data.ref;
        metric.ip = ws_data.ip;
        metric.demografia = ws_data.demografia;
        metric.device = ws_data.device;
        metric.fp = ws_data.fp.toString();
        metric.fp_score = fp_score;
        metric.events = {};
        metric.token = key;
        //app_rdb.setRDB(metric);
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
            const metrics = JSON.stringify(obj.metrics);
            setRedis(wstoken, metrics);
        }
        ws.send(JSON.stringify({"Analytika": "ok"}));
    }catch(e){
        ws.send(JSON.stringify({"Analytika": "error", "msg": e.message}));
    }
}

function onConnection(ws, req) {
    //check permission
    const accessToken = req.url;
    console.log("chkToken: " + accessToken);
    chkAccessToken(accessToken).then((access)=>{
        console.log(access);
        if(!access){

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