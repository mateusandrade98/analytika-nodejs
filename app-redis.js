const redis = require('redis');
const { env, exit } = require('process');

class Redis{
    constructor(){
        this.conn = this.conn()
    }
    
    conn(){
        const conn = redis.createClient({
            'url': `redis://root:${env.REDIS_PASSWORD}@${env.REDIS_HOST}:${env.REDIS_PORT}`
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