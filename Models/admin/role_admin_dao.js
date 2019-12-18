//------------Définition des variables globales
//cette variable est destinée à contenir une référence à
//l'objet collection qui dérivera de "db_js"
var db_js = require("../db");

//Le modèle de données
var role_dao = require("../role_dao");

/**
 * La fonction permettant de créer un nouveau rôle
 */
module.exports.create = function (new_role, callback) {
    
    role_dao.initialize(db_js);
    role_dao.create(new_role, function(isCreated, resultRole) {
        
        callback(isCreated, resultRole)
    })    
}

/**
 * La fonction permettant de trouver l'intitulé du rôle d'un agent
 */
module.exports.findOneByIdForAgent = function (agent, callback) {
    
    role_dao.initialize(db_js);
    role_dao.findLastByIdFromAgent(agent, function(isRole, messageRole, resultWithRole) {
        callback(isRole, messageRole, resultWithRole)
    })
}

/**
 * La fonction permettant de lister tous les rôles.
 */
module.exports.getAll = function(callback) {
    
    role_dao.initialize(db_js);
    role_dao.getAll(function(isRole, resultRole) {
        callback(isRole, resultRole)
    })
}