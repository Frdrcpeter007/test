//------------Définition des variables globales
//cette variable est destinée à contenir une référence à
//l'objet collection qui dérivera de "db_js"
var db_js = require("../db"),
    produit_dao = require("../produit_dao");
    
/**
 * La fonction permettant de compter le nombre de stock en réserve d'un produit
 */
module.exports.countReserveStockByProductId = function (id_produit, callback) {
    
    var operation_produit_dao = require("../operation_produit_dao");

    operation_produit_dao.initialize(db_js);

    operation_produit_dao.countReserveStockByProductIdForAdmin(id_produit, function(isCounted, resultCount) {
        callback(isCounted, resultCount)
    })
}

/**
 * La fonction permettant de mettre à jour un intitulé d'un produit
 */
module.exports.updateProductLabel = function (id_produit, index_label, new_label, callback) {
    
    var produit_dao = require("../produit_dao");
    produit_dao.initialize(db_js);

    produit_dao.updateProductLabelForAdmin(id_produit, index_label, new_label, 
    function(isUpdate, resultUpdate){
        
        callback(isUpdate, resultUpdate)
    })
}

/**
 * La fonction permettant d'ajouter un nouvel intitulé dans la liste de produit
 */
module.exports.addProductLabel = function(id_produit, new_label, callback) {
    
    var produit_dao = require("../produit_dao");
    produit_dao.initialize(db_js);

    produit_dao.addProductLabelForAdmin(id_produit, new_label, function(isAdded, resultAdding) {
        callback(isAdded, resultAdding)
    })
}

/**
 * La fonction permettant de mettre à jour les détails d'un produit
 */
module.exports.updateProductDetails = function(id_produit, new_details, callback){
    
    var produit_dao = require("../produit_dao");
    produit_dao.initialize(db_js);

    produit_dao.updateProductDetailsForAdmin(id_produit, new_details, function(isUpdate, resultUpdate){
        
        callback(isUpdate, resultUpdate)
    })
}

/**
 * La fonction permettant de mettre à jour la sous-catégorie d'un produit
 */
module.exports.updateProductUnderCategory = function(id_produit, index_under_category, new_under_category, callback) {
    
    var produit_dao = require("../produit_dao");
    produit_dao.initialize(db_js);

    produit_dao.updateProductUnderCategoryForAdmin(id_produit, index_under_category, new_under_category, 
    function(isUpdate, resultUpdate){

        callback(isUpdate, resultUpdate)
    })
}

/**
 * La fonction permettant d'afficher la liste de produits d'une même sous-catégorie
 */
module.exports.findListByIdSousCategorie = function (id_sous_cat, callback) {
    
    produit_dao.initialize(db_js);
    produit_dao.findListByIdSousCategorieForAdmin(id_sous_cat, function(isMatch, resultMatch) {
        callback(isMatch, resultMatch);
    })
}

/**
 * La fonction permettant d'afficher les détails d'un produit
 */
module.exports.findOneById = function (id_produit, callback) {
    
    produit_dao.initialize(db_js);
    produit_dao.findOneByIdForAdmin(id_produit, function(isProduct, resultProduct) {
        callback(isProduct, resultProduct);
    })
}