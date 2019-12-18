//------------Définition des variables globales
//cette variable est destinée à contenir une référence à
//l'objet collection qui dérivera de "db_js"
var db_js = require("../db");

//Le modèle de données
var client_dao = require("../client_dao");

/**
 * La fonction permettant de récuperer tous les clients
 */
module.exports.getAll = function (gtDateClient, callback) {
    
    client_dao.initialize(db_js);
    client_dao.getAllForAdmin(gtDateClient, function (isMatched, resultMatch) {
        callback(isMatched, resultMatch)
    })
}

/**
 * La fonction permettant de rechercher un client suivant ses appelations
 */
module.exports.searchByNames = function (query, callback) {
    
    client_dao.initialize(db_js);
    client_dao.searchByNames(query,function (isMatched, resultMatch) {
        callback(isMatched, resultMatch)
    })
}

/**
 * La fonction permettant d'afficher les détails d'un client : Avatar, infos et adresses. 
 */
module.exports.findOneById = function (identifiant, callback) {
    
    client_dao.initialize(db_js);
    client_dao.findOneByIdForAdmin(identifiant, function (hasInfos, resultInfos) {
        
        if(hasInfos){

            callback(true, resultInfos)
            
        }else{
            callback(false, resultInfos)
        }
    })
}

/**
 * La fonction permettant de mettre à jour le flag d'un compte
 */
module.exports.updateFlag = function(id_client, id_agent, callback) {
    
    client_dao.initialize(db_js);
    client_dao.updateFlagForAdmin(id_client, id_agent, function(isUpTodate, messageUpdate, resultUpdate) {
        callback(isUpTodate, messageUpdate, resultUpdate)
    })
}