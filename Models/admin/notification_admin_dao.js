//------------Définition des variables globales
//cette variable est destinée à contenir une référence à
//l'objet collection qui dérivera de "db_js"
var db_js = require("../db");

/**
 * La fonction permettant de renvoyer le nombre de client inscrit
 */
module.exports.countClient = function (callback) {
    
    var client_dao = require("../client_dao");
    client_dao.initialize(db_js);

    client_dao.countClientForAdmin(function (isCounted, resultCount) {
        
        callback(isCounted, resultCount);
    })
}

/**
 * La méthode permettant de compter le nombre de commandes validées
 */
module.exports.countValidateCommande = function (callback) {
    
    var commande_dao = require("../commande_dao");
        commande_dao.initialize(db_js);
    
    commande_dao.countReceivedForAdmin(function (isCounted, resultCount) {
        
        callback(isCounted, resultCount)
    })
}

/**
 * La fonction permettant de renvoyer le produit le plus recherché sans succès
 */
module.exports.topNotFoundResearch = function (callback) {
    
    var recherche_dao = require("./recherche_dao"),
        produit_dao = require("../produit_dao");

    recherche_dao.initialize(db_js);
    produit_dao.initialize(db_js);

    recherche_dao.topNotFoundResearch(function (isKeywordMatched, resultKeyword) {
        
        if(isKeywordMatched){//Si le recherche renvoie un résultat positif

            //Il faut vérifier l'inexistance du produit dans la collection produit avant de renvoyer le résultat
            //à l'administrateur
            produit_dao.smartFindByIntitule(resultKeyword[0]._id, null, null, true, function (isQueryMatched, resultQueryMatched) {
                
                if(isQueryMatched){
                    callback(false, "Le mot clé recherché <"+resultKeyword[0]._id+"> a été ajouté dans la base de données")
                }else{
                    callback(true, resultKeyword[0])
                }
            })

        }else{//Sinon il n'y a aucun résultat positif renvoyé par la recherche
            callback(false, resultKeyword)
        }
    })

    


}

/**
 * La fonction permettant de compter les opérations produits en attente de validation
 */
module.exports.countPendindOperationProduct = function (callback) {
    
    var operation_produit_dao = require("../operation_produit_dao");

    operation_produit_dao.initialize(db_js);
    operation_produit_dao.countPendindOperationForAdmin(function (isCounted, resultCount) {
        
        callback(isCounted, resultCount)
    })
}

/**
 * La fonction permettant de compter le nombre de dealers
 */
module.exports.countDealer = function (callback) {
    
    var dealer_dao = require("./dealer_admin_dao");
    
    dealer_dao.countAll(function (isCounted, resultCount) {
        
        callback(isCounted, resultCount);
    })
}

/**
 * La fonction permettant de compter le nombre de dealers
 */
module.exports.countAgent = function (callback) {
    
    var agent_dao = require("../agent_dao");
    agent_dao.initialize(db_js);

    agent_dao.countAllForAdmin(function (isCounted, resultCount) {
        
        callback(isCounted, resultCount);
    })
}