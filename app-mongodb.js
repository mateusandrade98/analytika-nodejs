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
            const filter = {
                "fp": data["fp"],
                "id_link": data["id_link"]
            }
            const get = await table.findOne(filter);
            data["_id"] = data["id_link"] + "_" + data["fp"] + "_ip=" + data["ip"] + "_token=" + data["token"];
            if(!get){
                //insert
                await table.insertOne(data);
                //await client.close();
            }else{
                //update
                await table.updateOne(
                    {_id: get["_id"]},
                    {$set:data}
                );
                //await client.close();
            }
          } finally {
            
          }
    }
}

module.exports = new MDB();