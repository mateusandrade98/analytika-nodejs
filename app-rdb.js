const rdb = require('rethinkdb');
const { env } = require('process');

class RDB{
    constructor(){
        this.conn = this.conn()
    }

    async conn(){
        return rdb.connect(
            {
                host: env.RDB_HOST, 
                port: env.RDB_PORT,
                password: env.RDB_PASSWORD
            });
    }

    setRDB(data){
        this.conn.then(conn => {
            rdb.db(env.RDB_DB).table(env.RDB_TABLE).filter({"fp": data["fp"], "id_link": data["id_link"]}).run(conn, function(err, cursor) {
                if (err) throw err;
                    cursor.toArray(function(err, result) {
                        if (err) throw err;
                        if(result.length){
                            rdb.db(env.RDB_DB).table(env.RDB_TABLE).get(result[0]["id"]).update(data).run(conn, function(err, result) {
                                if (err) throw err;
                                // update
                                // console.log(JSON.stringify(result, null, 2));
                            });
                        }else{
                            rdb.db(env.RDB_DB).table(env.RDB_TABLE).insert(data).run(this.conn, function(err, result) {
                                if (err) throw err;
                                // insert
                                // console.log(JSON.stringify(result, null, 2));
                            });
                        }
                    });
            });
        }, function(err){
            console.error(err);
        });
    }
}

module.exports = new RDB();