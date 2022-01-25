const redis = require('redis');
const { env, exit } = require('process');
var ping = require('ping');

console.log(env.REDIS_HOST);
console.log(env.REDIS_PORT);

console.log(ping.sys.probe("127.0.0.1"));
console.log(ping.sys.probe("srv-captain--redis"));
console.log(ping.sys.probe("srv-captain--mongodb"));
console.log(ping.sys.probe("srv-captain--analytika"));

exit();

class Redis{
    constructor(){
        this.conn = this.conn()
    }
    
    conn(){
        const conn = redis.createClient({
            host: env.REDIS_HOST,
            port: env.REDIS_PORT,
            password: env.REDIS_PASSWORD
        });
        conn.on('error', (err) => console.log('Redis Client Error', err));
        conn.connect();
        return conn;
    }

    async get(key){
        return this.conn.get(key);
    }

    set(key, data, expire=60){
        this.conn.set(key, data);
        this.conn.expire(key, expire);
    }

    del(key){
        this.conn.del(key);
    }
}

module.exports = new Redis();