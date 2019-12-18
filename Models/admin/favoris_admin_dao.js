//------------Définition des variables globales
//cette variable est destinée à contenir une référence à
//l'objet collection qui dérivera de "db_js"
var db_js = require("../db"),
    favoris_dao = require("../favoris_dao");
    
/**
 * La fonction permettant de compter le nombre de mention favoris d'un produit
 */
module.exports.countFavorisByIdProduit = function(id_produit, callback) {
    
    favoris_dao.initialize(db_js);
    favoris_dao.countFavorisByIdProduitForAdmin(id_produit, function(isCounted, resultCount) {
        callback(isCounted, resultCount);
    })
}

/**
 * La fonction permettant d'obtenir la liste de produits favoris d'un client
 */
module.exports.getAllByIdClient = function (idClient, callback) {
    
    favoris_dao.initialize(db_js);
    favoris_dao.getAll(idClient, function (isFavorite, messageFavorite, resultFavorite) {
        callback(isFavorite, messageFavorite, resultFavorite);
    })
}

/**
 * La fonction permettnat de compter le nombre de produits favoris par un client
 */
module.exports.countFavoriteByIdClient = function (idClient, callback) {
    
    favoris_dao.initialize(db_js);
    favoris_dao.countFavoriteForUser(idClient, function(isCounted, messageFavorite, resultCount) {
        callback(isCounted, messageFavorite, resultCount)
    })

}