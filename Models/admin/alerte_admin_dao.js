//------------Définition des variables globales
//cette variable est destinée à contenir une référence à
//l'objet collection qui dérivera de "db_js"
var db_js = require("../db");

//Le modèle de données
var alerte_dao = require("../alerte_dao");

/**
 * La fonction permettant de créer une alerte
 */
module.exports.create = function(new_alerte, callback) {
    
    alerte_dao.initialize(db_js);
    alerte_dao.create(new_alerte, function(isCreated, messageCreating, resultCreating) {
        
        callback(isCreated, messageCreating, resultCreating)
    })
}

/**
 * La fonction permettant de rechercher une alerte suivant son identifiant
 */
module.exports.findOneById = function(id_alerte, callback) {
    
    alerte_dao.initialize(db_js);
    alerte_dao.findOneById(id_alerte, function(isFound, messageFinding, resultFinding) {
        callback(isFound, messageFinding, resultFinding)
    })
}

/**
 * La fonction permettant de lister les alertes
 */
module.exports.getAll = function(limit, callback) {
    
    alerte_dao.initialize(db_js);
    alerte_dao.getAll(limit, function(isListed, listingMessage, listingResult) {
        callback(isListed, listingMessage, listingResult);
    })
}