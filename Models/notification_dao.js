//------------Définition des variables globales
//cette variable est destinée à contenir une référence à
//l'objet collection qui dérivera de "db_js"
var db_js = require("./db");

var collection = {
    value: null
}

//Ici on initialise la variable "collection" en lui passant
//la valeur provenant de "db_js". NB: cette fonction sera accessible
//en dehors de ce fichier
module.exports.initialize = function (db_js) {

    collection.value = db_js.get().collection("notification");
}

/**
 * La fonction qui permet de créer une notification
 */
module.exports.create = function (newNotification, callback) {

    try {
        newNotification.date = new Date();
        newNotification.trash = false;

        var operation_produit_dao = require("./operation_produit_dao");

        operation_produit_dao.initialize(db_js);
        operation_produit_dao.getDealersForProduct(newNotification.id_objet, (isGet, messageOperation, resultOperation) => {
            
            if (isGet) {
                var sortieDealer = 0,
                    listeEnvoie = [];
                    
                //Envoie en broadcast à tous les dealer de ce produit
                for (let index = 0; index < resultOperation.length; index++) {

                    newNotification.id_recepteur = resultOperation[index].id_dealer;

                    insertNewNotification(newNotification, (isOk, result) => {
                        sortieDealer++;

                        if (isOk) {
                            listeEnvoie.push(result);
                        }

                        if (sortieDealer == resultOperation.length) {
                            callback(true, listeEnvoie)
                        }
                    });
                }    
                    
            }
        })


    } catch (exception) {
        console.log("Une exception a été lévée lors de la création d'une notification : " + exception);
    }
}

function insertNewNotification(newNotification, callback) {
    collection.value.insertOne(newNotification, function (err, result) {
        if (err) {
            callback(false, "Une erreure est survenue lors de la création d'une notification : " + err);
        }
        else {
            callback(true, result.ops[0]);
        }
    });
}

/**
 * La fonction permettant de créer une notification pour le dealer dont l'extra concerne.
 */
module.exports.createFromExtra = function(new_notification, callback) {
    new_notification.date = new Date();

    var produit_dealer_dao = require("./produit_dealer_dao");
    produit_dealer_dao.initialize(db_js);

    produit_dealer_dao.findOneById(new_notification.id_objet, 
    function(is_prod_deal, message_prod_deal, result_prod_deal){
        
        if(is_prod_deal){
            new_notification.id_recepteur = result_prod_deal.id_dealer;

            try{
                collection.value.insertOne(new_notification, function(err, result) {
                    if(err){
                        callback(false, "Une erreur est survenue lors de la création de la notification pour le dealer <"+
                            new_notification.id_recepteur+"> : "+err, null);
                    }else{
                        callback(true, null, result.ops[0])
                    }
                })
            }catch(exception){
                callback(false, "Une exception a été lévée lors de la création de la notification pour le dealer <"+
                    new_notification.id_recepteur+"> : "+exception, null);
            }
        }else{
            callback(false, message_prod_deal, null)
        }
    })

}

/**
 * La fonction qui permet de trouver la liste de notifications par client
 */
module.exports.findAllByIdClient = function (idClient, limit, callback) {

    //On commence par rechercher le client
    var clientModel = require("./client_dao");
    clientModel.initialize(db_js);

    clientModel.findOneById(idClient, function (isClientFound, messageClient, resultClient) {

        if (isClientFound) { //Si le client est trouvé

            var filter = {
                "id_recepteur": idClient
            },
            pipelineLimit = !isNaN(limit) ? {"$limit": parseInt(limit)} : {"$match": filter};

            collection.value.aggregate([
                {
                    "$match": filter
                },
                {
                    "$sort": {"date": -1}
                },
                pipelineLimit
            ]).toArray((errNotif, resultNotif) => {

                    if (errNotif) {
                        callback(false, "Une erreur est survenue lors de la recherche des notifications du client : " + errNotif)
                    } else {

                        if (resultNotif.length > 0) {
                            
                            var produitDao = require("./produit_dao"),
                                sortieNotif = 0,
                                listWithDetails = [];
                            
                            produitDao.initialize(db_js);
                            for (let index = 0; index < resultNotif.length; index++) {
                                produitDao.findProductForNotification(resultNotif[index], (isFound, messageFound, resultWithDetails) => {
                                    sortieNotif++;
                                    if (isFound) {
                                        listWithDetails.push(resultWithDetails)
                                    }
                                    
                                    if (sortieNotif == resultNotif.length) {
                                        
                                        /* callback(true, "Notification renvoyée", listWithDetails) */
                                        var sortieDetail = 0,
                                            listWithDetailsAndInfoClient = [],
                                            client_dao = require("./client_dao");
                                            
                                        client_dao.initialize(db_js);
                                        for (let index = 0; index < listWithDetails.length; index++) {
                                            client_dao.getOneByIdFromExtra(listWithDetails[index], (isGet, resultClient) => {
                                                sortieDetail++;
                                                if (isGet) {
                                                   listWithDetailsAndInfoClient.push(resultClient) 
                                                }
                                                
                                                if (sortieDetail == listWithDetails.length) {                               
                                                    callback(true, "Notification renvoyée", listWithDetailsAndInfoClient)
                                                }
                                            })
                                        }
                                    }
                                })
                            }
                        } else {
                            callback(false, "Aucune notification n'est trouvée pour le client");
                        }
                    }
                })

        } else { //Sinon le client n'est pas trouvé
            callback(false, resultClient)
        }
    })
}

/**
 * La fonction qui permet mettre à jour une notification
 */

 module.exports.setFlagFalse = function (idNotification, callback) {
     
     try{

        var _id = require("mongodb").ObjectId(idNotification),
        filter = {
            "_id" : _id
        },
        update = {
            "$set" : {
                "flag" : false
            }
        };

        collection.value.updateOne(filter, update, function(err, result) {
            if(err){
                callback(false, "Une erreure est survenue lors de la mise à jour de la notification : "+err);
            }else{
                callback(true, "La notification a été correctement mise à jour")
            }
        })

     }catch(exception){
        callback("Une exception a été lévée lors de la mise à jour de la notification : "+exception);
     }
 }

 /**
 * La fonction qui permet de compter le nombre de notification non consulter
 */
module.exports.getNbre = (id_client, callback) => {
    try {
        collection.value.aggregate([{
                "$match": {
                    "id_recepteur": id_client,
                    "flag": true
                }
            },
            {
                "$count": "nbre"
            }
        ]).toArray((err, resultAggr) => {
            if (err) {
                callback(false, "Une erreur est survenue lors du comptage des notification actif : " + err,{"nbre": 0})
            } else {
                if (resultAggr.length > 0) {
                    callback(true, "Le comptage est fini", resultAggr[0])
                } else {
                    callback(false, "Aucune nouvelle notification", {"nbre": 0})
                }
            }
        })
    } catch (exception) {
        callback(false, "Une exception a été lévée lors du comptage des notification actif : " + exception, {"nbre": 0})        
    }

}

/**
 * La fonction permettant de créer la notification à l'attention des agents 
 * affectés à une commune, cela après la soumission d'un produit par un dealer.
 */
 module.exports.createForAgentAfterDealerSubmitingProduct = function(new_notification, id_commune, callback) {
     
    try{

        //On recherche les agents concernés
        var agent_dao = require("../Models/agent_dao");
        
        agent_dao.initialize(db_js);
        agent_dao.getAllByIdCommune(id_commune, function(isAgent, message_agent, result_agent) {
            if(isAgent){

                var sortie_notification = 0,
                    liste_retour_notification = [],
                    liste_erreur_notification = [];
                //Pour chaque agent trouvé, on crée la notification
                for (let index_agent = 0; index_agent < result_agent.length; index_agent++) {

                    new_notification.id_recepteur = ""+result_agent[index_agent]._id;
                    
                    module.exports.initialize(db_js);
                    insertNewNotification(new_notification, function(isInserted, resultInserting) {

                        sortie_notification++;
                        if(isInserted){
                            liste_retour_notification.push(resultInserting)
                        }else{
                            liste_erreur_notification.push(resultInserting);
                        }

                        if(sortie_notification == result_agent.length){
                            var objet_retour = {
                                "retour" : liste_retour_notification,
                                "erreur" : liste_erreur_notification
                            }

                            callback(true, null, objet_retour);
                        }
                    })
                    
                }
            }else{
                callback(false, message_agent, null)
            }
        })

    }catch(exception){
        callback(false, "Une exception a été lévée lors de la création des notifications destinées aux agents après la soumission du produit <"+new_notification.id_objet+"> : "
            +exception, null)
    }
 }

 /**
  * La fonction permettant de créer la notification d'alerte système aux administrateurs du système.
  * Elle est utilisée pour signer des failles du système.
  */
 module.exports.createForAdminSystem = function (new_notification, message) {
     
    new_notification.message = message;

    try{

        //On recherche les agents ayant les privilèges administrateurs et super-administrateur
        var agent_dao = require("./agent_dao");
        agent_dao.initialize(db_js);

        agent_dao.getAllWherePrivilegeSuperAdminAndAdmin(function(is_agent, message_agent, result_agent) {

            if(is_agent){

                //Pour chaque agent trouvé, on crée la notification
                for (let index_agent = 0; index_agent < result_agent.length; index_agent++) {

                   new_notification.id_recepteur = ""+result_agent[index_agent]._id;
                   
                   module.exports.initialize(db_js);
                   insertNewNotification(new_notification, function(isNotified, result_notification) {
                       console.log(result_notification);
                   })
                }
            }else{
                console.log(message_agent);
            }
        })

    }catch(exception){
        console.log("Une exception a été lévée lors de la création d'une notification système : "+exception);
    }
 }

 /**
  * La fonction permettant de créer une notification liée à la mise à jour d'une opération vente.
  * Elle est utilisée dans la DAO "operation_produit"
  */
module.exports.createForUpdateOperation = function(new_notification, callback) {
    try{

        collection.value.insertOne(new_notification, function(err, result) {
            if(err){
                callback(false, "Une erreur est survenue lors de la création de la notification sur la mise à jour de l'opération vente : "+err, null);
            }else{
                callback(true, null, result.ops[0])
            }
        })
    }catch(exception){
        callback(false, "Une exception a été lévée lors de la création de la notification sur la mise à jour de l'opération vente : "+exception, null);
    }
}