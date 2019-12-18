//------------Définition des variables globales
//cette variable est destinée à contenir une référence à
//l'objet collection qui dérivera de "db_js"
var db_js = require("../db"),
    ville_dao = require("../ville_dao");

/**
 * La fonction permettant de créer une ville.
 */
module.exports.create = function (new_ville, callback) {
    ville_dao.initialize(db_js);
    ville_dao.createForAdmin(new_ville, function(isCreated, messageCreating, resultCreating) {
        callback(isCreated, messageCreating, resultCreating);
    })
}

/**
 * La fonction permettant de lister toutes les villes
 */
module.exports.getAll = function (callback) {
    ville_dao.initialize(db_js);
    ville_dao.getAll(function(isFound, messageFinding, resultFinding) {
        callback(isFound, messageFinding, resultFinding)
    })
}

/**
 * La fonction permettant d'afficher les détails d'une ville.
 */
module.exports.findOne = function (id_ville, callback) {
    ville_dao.initialize(db_js);
    ville_dao.findOne(id_ville, function (isFound, messageFinding, resultFinding) {
        callback(isFound, messageFinding, resultFinding);
    })
}