//------------Définition des variables globales
//cette variable est destinée à contenir une référence à
//l'objet collection qui dérivera de "db_js"
var db_js = require("./db");

var collection = {
    value: null
}

//Ici on initialise la variable "collection" en lui passant
//la valeur provenant de "db_js". NB: cette fonction sera accessible en dehors de ce fichier
module.exports.initialize = function (db_js) {

    collection.value = db_js.get().collection("log");
}

/**
 * Module permettant de créer la traçabilté lors du login
 */
module.exports.createLogin = function (client, callback) {
    try {
        var login_entity = require("./entities/log_entity").Log();
        
        login_entity.id_client = "" + client._id;
        login_entity.type = "login";
        login_entity.date = new Date();
        
        collection.value.insertOne(login_entity, function (err, result) {
            if (err) {
                callback(false, "Une erreur est survenue lors de la traçabilité du client : " +err)
            } else {
                if (result) {
                    callback(true, "Le client a été tracé avec succès", client)
                } else {
                    callback(false, "La traçabilté n'a pas abouti", client)
                }
            }
        })
    } catch (exception) {
        callback(false, "Une exception a été lévée lors de la traçabilité du client : " +err)
    }
}

/**
 * Module permettant de créer la traçabilité lors du logout
 */
module.exports.createLogout = function (newLogout, callback) {
    
    try {
        newLogout.date = new Date();
        newLogout.type = "logout";
        collection.value.insertOne(newLogout, function (err, result) {
            if (err) {
                callback(false, "Une erreur est survenue lors de la traçabilité de deconnexion : " +err)
            } else {
                if (result) {
                    callback(true, "La taçabilté a reussi de deconnexion a réussi avec succès", result.ops[0])
                } else {
                    callback(false, "Traçabilté pas établie")
                }
            }
        })
    } catch (exception) {
        callback(false, "Une exception a été lévée lors de la traçabilité de deconnexion : " +err)
    }
}