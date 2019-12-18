//------------Définition des variables globales
//cette variable est destinée à contenir une référence à
//l'objet collection qui dérivera de "db_js"
var db_js = require("../db"),
    operation_produit_dao = require("../operation_produit_dao");
    
/**
 * La fonction permettant de lister les ventes soumises par un dealer
 */
module.exports.getSubmittedProductsByIdDealer = function(id_dealer, callback) {
    
    operation_produit_dao.initialize(db_js);
    operation_produit_dao.getSubmittedProductsByIdDealer(id_dealer, function(isProduct, messageProduct, resultProduct) {
        
        callback(isProduct, messageProduct, resultProduct);
    })
}

/**
 * La fonction permettant de lister les produits d'un dealer
 */
module.exports.getAllProductByIdDealer = function(id_dealer, callback) {
    
    operation_produit_dao.initialize(db_js);
    operation_produit_dao.getAllProductByIdDealer(id_dealer, function(isProduct, messageProduct, resultProduct) {
        
        callback(isProduct, messageProduct, resultProduct);
    })
}

/**
 * La fonction permettant de compter le nombre d'opérations vente d'un dealer
 */
module.exports.countAllSubmittedProductForDealer = function(id_client_dealer, callback) {
    
    operation_produit_dao.initialize(db_js);
    operation_produit_dao.countAllSubmittedProductForDealer(id_client_dealer, function(isCount, messageCount, resultCount) {
        
        callback(isCount, messageCount, resultCount);
    })
}

/**
 * La fonction permettant de compter le nombre de produits liés à un dealer
 */
module.exports.countAllProductForDealer = function(id_client_dealer, callback) {
    
    operation_produit_dao.initialize(db_js);
    operation_produit_dao.countAllProductForDealer(id_client_dealer, function(isCount, messageCount, resultCount) {
        callback(isCount, messageCount, resultCount);
    })
}

/**
 * La fonction permettant de mettre à jour la propriété validation d'une opération
 */
module.exports.updateValidationValue = function (id_operation, id_agent, callback) {
    
    operation_produit_dao.initialize(db_js);
    operation_produit_dao.updateValidationValueForAdmin(id_operation, id_agent, function(isUpdate, ResultUpdate) {
        callback(isUpdate, ResultUpdate);
    })
}

/**
 * La fonction permettant de lister les opérations validation d'un agent
 */
module.exports.getValidationOperationByIdAgent = function(id_agent, gtValue, limit, callback){

    operation_produit_dao.initialize(db_js);
    operation_produit_dao.getValidationOperationByIdAgentForAdmin(id_agent, gtValue, limit, function(isMatched, resultMatch) {
        
        callback(isMatched, resultMatch);
    })
}