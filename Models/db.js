var mongodb = require("mongodb");

var state = {
    db: null
}


module.exports.connect = function (url, callback) {

    if (state.db) {
        callback(true, "Une connexion existe déjà!");
    } else {

        if (url) {
            mongodb.MongoClient.connect(url, { useUnifiedTopology: true, useNewUrlParser: true },function (err, client) {
                if (err) {
                    callback(false, "Une erreur est survenue lors de la connection : " + err);
                } else {

                    state.db = client.db("ebantu");
                    callback(true, "connection établie avec succès")
                }
            })
        } else {
            callback(false, "La chaine de connexion est null");
        }
    }
}

module.exports.get = function () {
    return state.db;
}


module.exports.getNextSequenceValue = function(sequenceName, callback) {
    
    state.db.collection("commande_counter").findOneAndUpdate(
        { "_id" : sequenceName},
        {"$inc" : {"sequence_value" : 1}}, 
        {upsert : true, new : true},
        function(err, result) {
        
            if(err){
                callback(false, err)
            }else{
                callback(true, result)
            }
        }
    );

}