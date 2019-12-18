//------------Définition des variables globales
//cette variable est destinée à contenir une référence à
//l'objet collection qui dérivera de "db_js"
var db_js = require("../db"),
    commune_dao = require("../commune_dao");

/**
 * La fonction permettant la création d'une commune
 */
module.exports.create = function (new_commune, callback) {
    
    commune_dao.initialize(db_js);
    commune_dao.createForAdmin(new_commune, function(isCreated, messageCreating, resultCreating) {
        callback(isCreated, messageCreating, resultCreating)
    })
}

/**
 * La fonction permettant de lister toutes les communes liées à une ville. 
 */
module.exports.findAllByIdVille = function(id_ville, callback) {
    commune_dao.initialize(db_js);
    commune_dao.findAllByIdVille(id_ville, function(isFound, messageFinding, resultFinding) {
        callback(isFound, messageFinding, resultFinding);
    })
}