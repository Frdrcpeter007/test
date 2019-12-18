//------------Définition des variables globales
//cette variable est destinée à contenir une référence à
//l'objet collection qui dérivera de "db_js"
var db_js = require("../db");

//Le modèle de données
var taux_dao = require("../taux_dao");

/**
 * La fonction permettant de créer un nouveau taux
 */
module.exports.create = function(new_rate, callback) {
    taux_dao.initialize(db_js);
    taux_dao.create(new_rate, function(is_created, message, result) {
        callback(is_created, message, result);
    })
}