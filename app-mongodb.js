const mongodb = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
const { env } = require('process');

const auth = `mongodb://${env.MONGODB_USER}:${env.MONGODB_PASSWORD}@${env.MONGODB_HOST}:${env.MONGODB_PORT}`;
const client = new mongodb.MongoClient(auth);

class MDB{
    constructor(){
    }

    async set(data){
        try {
            await client.connect();
            const database = client.db(env.MONGODB_DB);
            const table = database.collection(env.MONGODB_TABLE);
            data["_id"] = data["identifier"];
            await table.insertOne(data);
        }catch (e){
            console.log(`Error: ${e.message}`);
        }
    }
}

module.exports = new MDB();