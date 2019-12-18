var db_js = require("./db");

var collection = {
    value: null
}

module.exports.initialize = function (db_js) {

    collection.value = db_js.get().collection("code");
}

/**
 * Module permettant de générer le code d'activation du compte au moment de l'inscription
 */
module.exports.create = function (client, callback) {
    try {
        var newCode = {
            "id_client": "" + client._id,
            "code": "Z-" + Math.floor(Math.random() * 100000),
            "flag": true,
            "date": new Date()
        }
        collection.value.insertOne(newCode, function (err, result) {
            if (err) {
                callback(false, "Une erreur est survenue lors de la génération du code de confirmation : " + err)
            } else {
                if (result) {
                    client.code = result.ops[0].code
                    callback(true, "Le code est générer avec succès", client)
                } else {
                    callback(false, "Aucun code n'a été générer", client)
                }
            }
        })
    } catch (exception) {
        callback(false, "Une exception a été lévée lors de la génération du code de confirmation : " + exception)
    }
}

/**
 * Module qui permet de trouver le code d'activation d'un utilisateur
 */
module.exports.findCodeForUser = function (id_client, callback) {
    try {
        var filter = {
            "id_client": id_client,
            "flag": true
        };
        
        collection.value.aggregate([
            {
                "$match": filter
            }
        ]).toArray(function (err, resultAggr) {
            if (err) {
                callback(false, "Une erreur est survenue lors de la recherche du code d'activation : " +err)
            } else {
                if (resultAggr.length > 0) {
                    callback(true, "Le code est trouvé", resultAggr[0])
                } else {
                    callback(false, "Aucun code n'a été trouvé pour cet utilisateur, demandez un autre code")
                }
            }
        })
    } catch (exception) {
        callback(false, "Une exception a été lévée lors de la recherche du code d'activation : " +exception)        
    }
}

/**
 * Permet la desactivation des anciens codes
 * @param {Object} client L'utilisateur en question
 * @param {Function} callback La fonction de retour
 */
module.exports.disableAllCodeForUser = function (client, callback) {
    try {
        var filter = {
            "id_client": "" + client._id
        },
        update = {
            "$set":{
                "flag": false                
            }
        };
        
        collection.value.updateMany(filter, update, function (err, result) {
            if (err) {
                callback(false, "Une erreur est survenue lors de la désactivation des codes : " +err)
            } else {
                if (result) {
                    callback(true, "Les codes ont été désactiver avec succès", client)
                } else {
                    callback(false, "Les codes n'ont pas été désactivés")
                }
            }
        })
    } catch (exception) {
        callback(false, "Une exception a été lévée lors de la désactivation des codes : " +exception)        
    }
}