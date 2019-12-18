//------------Définition des variables globales
//cette variable est destinée à contenir une référence à
//l'objet collection qui dérivera de "db_js"
var db_js = require("../db"),
    commande_dao = require("../commande_dao");;
  
/**
 * La fonction permettant de compter le nombre de commande passées pour un produit
 */
module.exports.countCommandeByIdProduit = function(id_produit, callback) {
    
    commande_dao.initialize(db_js);

    commande_dao.countCommandeByIdProduitForAdmin(id_produit, function(isCounted, resultCount) {
        callback(isCounted, resultCount);
    })
}

/**
 * La fonction permettant de compter le nombre de commandes passées par un client
 */
module.exports.countCommandeByIdClient =  function(id_client, callback) {
    
    commande_dao.initialize(db_js);
    commande_dao.getCount(id_client, function(isCounted, resultCount) {
        callback(isCounted, resultCount);
    })
}

/**
 * La fonction permettant d'afficher toutes les commandes passées par un client
 */
module.exports.getAllByIdClient = function (id_client, callback) {
    
    commande_dao.initialize(db_js);
    commande_dao.getAllByIdClient(id_client, function (isMatched, messageMatched, resultMatched) {
        callback(isMatched, messageMatched, resultMatched);
    })
}

/**
 * La fonction permettant de lister toutes les commandes enregistrées
 */
module.exports.getAll = function (top, limit, callback) {
    
    commande_dao.initialize(db_js);
    commande_dao.getAllForAdmin(top, limit, function(isMatched, resultMatched) {
        callback(isMatched, resultMatched)
    })
}

/**
 * La fonction permettant d'avoir les détails d'une commande
 */
module.exports.getOneById = function(id_commande, callback) {
    
    commande_dao.initialize(db_js);
    commande_dao.getOneByIdForAdmin(id_commande, function(isMatched, resultMatched) {
        callback(isMatched, resultMatched)
    })
}

/**
 * La fonction permettant de lancer une recherche parmi les commandes, 
 * les différents étapes de recherche étant : id_commande, id_produit, intitule produit,
 *  id_client, nom/prenom client. 
 * Elle est utilisée dans l'administration 
 */
module.exports.searchCommande = function(valeur_recherche, callback) {
    
    commande_dao.initialize(db_js);
    commande_dao.searchCommandeForAdmin(valeur_recherche, function(isSearchMatched, resultSearch) {
        callback(isSearchMatched, resultSearch)
    })
}