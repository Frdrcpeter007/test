//------------Définition des variables globales
//cette variable est destinée à contenir une référence à
//l'objet collection qui dérivera de "db_js"
var db_js = require("../db");

//Le modèle de données
var message_dao = require("../message_dao");

/**
 * La fonction permettant de créer un message
 */
module.exports.create = function(new_message, callback) {
    
    message_dao.initialize(db_js);
    message_dao.create(new_message, function(isMessage, messageResult, responseResult) {
        callback(isMessage, messageResult, responseResult)
    })
}

/**
 * La fonction permettant de mettre à jour le status d'un message
 */
module.exports.updateStatusEtatById = function (id_message, callback) {
    
    message_dao.initialize(db_js);
    message_dao.updateStatusEtatById(id_message, function (isUpTodate, updateMessage, updateResult) {
        
        callback(isUpTodate, updateMessage, updateResult)
    })
}

/**
 * La fonction permettant de mettre à jour les infos d'un message
 */
module.exports.updateContenuAndSujetById = function (id_message, sujet, contenu, callback) {
    
    message_dao.initialize(db_js);
    message_dao.updateContenuAndSujetById(id_message, sujet, contenu, function (isUpTodate, updateMessage, updateResult) {
        
        callback(isUpTodate, updateMessage, updateResult)
    })
}