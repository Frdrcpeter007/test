var db_js = require("./db");

var collection = {
    value: null
}

module.exports.initialize = function (db_js) {

    collection.value = db_js.get().collection("contact");
}

/**
 * Envoi d'un message à l'administration
 * @param {Object} newMessage Le message a envoyé
 * @param {Function } callback La fonction de retour
 */
module.exports.create = (id_client, newMessage, callback) => {
    try {
        newMessage.date = new Date();
        newMessage.id_client = id_client;
        var clientDao = require("./client_dao");
        
        clientDao.initialize(db_js);
        clientDao.findOneById(id_client, (isFound, message, result) => {
            if (isFound) {
                
                newMessage.noms = result.prenom + " " + result.nom;
                newMessage.email = /email/i.test(result.inscription.username[result.inscription.username.length - 1].type) != null ? result.inscription.username[result.inscription.username.length - 1].valeur : null;
                
                insertMessage(newMessage, callback);
                
            } else {
                
                insertMessage(newMessage, callback)
            }
            
        })
        
    } catch (exception) {
        callback(false, "Une exception a été lévée lors de l'envoi du message " +exception)        
    }
}

function insertMessage(newMessage, callback) {
    collection.value.insertOne(newMessage, (err, result) => {
        if (err) {
            callback(false, "Une erreur est survenue lors de l'envoi du message " + err);
        }
        else {
            
            if (result) {
                
                callback(true, "Message envoyé avec succèss", result.ops[0]);
            }
            else {
                callback(false, "Message non-envoyé");
            }
        }
    });
}