const redis = require('redis');
const { env, eventNames } = require('process');

const auth = `redis://${env.REDIS_HOST}:${env.REDIS_PORT}`;

class Redis{
    constructor(){
        this.conn = this.conn()
    }
    
    conn(){
        const conn = redis.createClient({
            url: auth,
            auth_pass: env.REDIS_PASSWORD
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