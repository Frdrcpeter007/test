//------------Définition des variables globales
//cette variable est destinée à contenir une référence à
//l'objet collection qui dérivera de "db_js"
var db_js = require("../db"),
    ligne_livraison_dao = require("../ligne_livraison_dao");


/**
 * La fonction permettant de créer une ligne de livraison
 */
module.exports.create = function(new_line, callback) {
    ligne_livraison_dao.initialize(db_js);
    ligne_livraison_dao.createForAdmin(new_line, function(is_line, message_line, result_line) {
        callback(is_line, message_line, result_line)
    })
}

/**
 * La fonction permettant de rechercher les détails d'une ligne par son identifiant
 */
module.exports.findOneById = function(id_ligne, callback) {
    ligne_livraison_dao.initialize(db_js);
    ligne_livraison_dao.findOneById(id_ligne, function(is_line, message_line, result_line) {
        callback(is_line, message_line, result_line)
    })
}

/**
 * La fonction permettant de lister toute les lignes de livraison
 */
module.exports.getAll = function(callback) {
    
    ligne_livraison_dao.initialize(db_js);
    ligne_livraison_dao.getAllForAdmin(function(is_line, message_line, result_line) {
        callback(is_line, message_line, result_line)
    })
}

