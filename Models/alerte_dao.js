
//------------Définition des variables globales
//cette variable est destinée à contenir une référence à
//l'objet collection qui dérivera de "db_js"
var db_js = require("./db");

var collection = {
    value: null
}

/**
 * Ici on initialise la variable "collection" en lui passant
 * la valeur provenant de "db_js". NB: cette fonction sera accessible en dehors de ce fichier
 */
module.exports.initialize = function (db_js) {

    collection.value = db_js.get().collection("alerte");
}

/**
 * La fonction qui permet de créer une alerte
 */
module.exports.create = function (new_alerte, callback) {

    try {

        collection.value.insertOne(new_alerte, function(err, result) {
            if(err){
                callback(false,"Une erreure est survenue lors de la création d'une alerte : "+err, null);
            }else{
                callback(true, null, result.ops[0])
            }
        })

    } catch (exception) {
        callback(false, "Une exception a été lévée lors de la création d'une alerte : " + exception, null);
    }
}

/**
 * La fonction permettant de rechercher une alerte par son identifiant
 */
module.exports.findOneById = function(id_alerte, callback) {
    
    try{

        var _id = require("mongodb").ObjectID(id_alerte),
            filter = {"_id" : _id};

        collection.value.findOne(filter, function(err, result) {
            if(err){
                callback(false, "Une erreur est survenue lors de la recherche de l'alerte <"+id_alerte+"> : "+err, null);
            }else{
                
                if(result){//Si l'alerte a été trouvée

                    //On recherche l'objet y associé
                    switch (result.type) {
                        case "agent":
                            
                            var agent_dao = require("./agent_dao");
                            agent_dao.initialize(db_js);
                            agent_dao.findOneByIdFromAlerte(result, function(isAgent, messageWithAgent, resultWithAgent) {
                                
                                callback(isAgent, messageWithAgent, resultWithAgent)
                            })
                            break;
                        
                        case "client" : 

                            var client_dao = require("./client_dao");
                            client_dao.initialize(db_js);
                            client_dao.findOneByIdFromAlerte(result, function(isClient, messageWithClient, resultWithClient) {
                                
                                callback(isClient, messageWithClient, resultWithClient)
                            })  
                            break;  
                            
                        case "dealer":

                            var dealer_dao = require("./dealer_dao");
                            dealer_dao.initialize(db_js);
                            dealer_dao.findOneFromAlerteForAdmin(result, function(isDealer, messageDealer, resultDealer) {
                                callback(isDealer, messageDealer, resultDealer)
                            })
                            break;
                        
                        case "produit" : 
                            
                            var produit_dao = require("./produit_dao");
                            produit_dao.initialize(db_js);
                            produit_dao.findOneByIdFromAlerte(result, function(isProduct, messageWithProduct, resultWithProduct) {
                                callback(isProduct, messageWithProduct, resultWithProduct)
                            })
                            break;
                        default:
                            callback(false, "Le type de l'alerte n'est par réconu", null)
                            break;
                    }
                }else{//Sinon aucune alerte ne correspond au critère de recherche
                    callback(false, "Aucune alerte ne correspond à l'identifiant <"+id_alerte+">", null)
                }
            }
        })
    }catch(exception){
        callback(false, "Une exception a été lévée lors de la recherche de l'alerte <"+id_alerte+"> : "+exception, null)
    }
}

/**
 * La fonction permettant de lister toutes les alertes
 */
module.exports.getAll = function(limit, callback) {
    
    try{
        collection.value
            .find({})
            .limit(limit)
            .toArray(function (err, result) {
                
            if(err){
                callback(false, "Une erreur a été lévée lors du listage des alertes : "+err, null)
            }else{

                if(result.length > 0){

                    var alerteListWithDetails = [],
                        sortieAlerte = 0;

                    result.forEach((alerte, index, alerte_tab) => {

                        module.exports.findOneById(""+alerte._id, function(isAlerteFound, messageAlerte, resultAlerte) {
                            sortieAlerte++;

                            alerteListWithDetails.push(resultAlerte)

                            if(sortieAlerte== alerte_tab.length){
                                callback(true, null, alerteListWithDetails)
                            }
                        })
                    });
                }else{
                    callback(false, "Aucune alerte n'a été trouvée", null)
                }
            }
            
        })
    }catch(exception){
        callback(false, "Une exception a été lévée lors du listage des alertes : "+exception, null)
    }
}