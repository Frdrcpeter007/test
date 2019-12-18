//------------Définition des variables globales
//cette variable est destinée à contenir une référence à
//l'objet collection qui dérivera de "db_js"
var db_js = require("./db");

var collection = {
    value: null
}

//Ici on initialise la variable "collection" en lui passant
//la valeur provenant de "db_js". NB: cette fonction sera accessible en dehors de ce fichier
module.exports.initialize = function (db_js) {

    collection.value = db_js.get().collection("message");
}

/**
 * La fonction qui permet de créer un agent
 */
module.exports.create = function (new_message, callback) {

    try { //Si ce bloc passe

        //On appele la méthode insertOne (une methode propre à mongoDB) de notre collection qui doit prendre la structure de l'entité
        collection.value.insertOne(new_message, function (err, result) {

            //On test s'il y a erreur
            if (err) {
                callback(false, "Une erreur est survenue lors création du message", "" + err);
            } else { //S'il n'y a pas erreur

                //On vérifie s'il y a des résultat renvoyé
                if (result) {
                    callback(true, "Message correctement créé", result.ops[0])
                } else { //Si non l'etat sera false et on envoi un message
                    callback(false, "Désolé, le message n'a pas été crée")
                }
            }
        })

    } catch (exception) { //Si ce bloc ne passe pas on lève une exception
        callback(false, "Une exception a été lévée lors de la création du message : " + exception);
    }
}

/**
 * La fonction permettant de mettre à jour l'état d'un message
 */
module.exports.updateStatusEtatById = function(id_message, callback) {
    
    try{

        var _id = require("mongodb").ObjectID(id_message),
            filter = {"_id" : _id},
            update = {"$set" : {
                    "status.etat" : true,
                    "status.date_lecture" : new Date()
                }
            };
        
        collection.value.updateOne(filter, update, function(err, result) {
            if(err){
                callback(false, "Une erreur est survenue lors de la mise à jour du statut du message <"+id_message+"> : "+err, null)
            }else{
                callback(true, "Status du message mise à jour correctement", result.result);
            }
        })

    }catch(exception){
        callback(false, "Une exception a été lévée lors de la mise à jour du statut du message <"+id_message+"> : "+exception, null);
    }
}

/**
 * La fonction permettant de mettre à jour les informations du message
 */
module.exports.updateContenuAndSujetById = function(id_message, sujet, contenu, callback) {
    
    try{

        var _id = require("mongodb").ObjectID(id_message),
            filter = {"_id" : _id},
            update = {"$set" : {
                    "sujet" : sujet,
                    "contenu" : contenu
                }
            };
        
        collection.value.updateOne(filter, update, function(err, result) {
            if(err){
                callback(false, "Une erreur est survenue lors de la mise à jour du statut du message <"+id_message+"> : "+err, null)
            }else{
                callback(true, "Status du message mise à jour correctement", result.result);
            }
        })

    }catch(exception){
        callback(false, "Une exception a été lévée lors de la mise à jour du statut du message <"+id_message+"> : "+exception, null);
    }
}

/**
 * La fonction permettant de rechercher un message par son identifiant
 */
module.exports.findOneById = function(id_message, callback) {
    
    try{

        var _id = require("mongodb").ObjectID(id_message),
            filter = {"_id" : _id};
        
        collection.value.findOne(filter, function(err, result) {
            
            if(err){
                callback(false, "Une erreur est survenue lors de la recherche du message <"+id_message+"> : "+err, null);
            }else{

                if(result){
                    callback(true, null, result)
                }else{
                    callback(false, "Aucun message ne correspond à l'identifiant <"+id_message+">", null);
                }
            }
        })

    }catch(exception){
        callback(false, "Une exception a été lévée lors de la recherche du message <"+id_message+"> : "+exception, null);
    }
}

/**
 * La fonction permettant de lister les messages adressés à un client
 */
module.exports.getAllByDestinataire = function(destinataire, limit, callback) {
    
    try{

        var filter = {"destinataire" : destinataire};
        
        collection.value.find(filter).limit(limit).toArray(function(err, result) {
            
            if(err){
                callback(false, "Une erreur est survenue lors de la recherche des messages addressés au destinataire <"+destinataire+"> : "+err, null);
            }else{

                if(result.length > 0){
                    callback(true, null, result)
                }else{
                    callback(false, "Aucun message ne correspond à l'identifiant <"+destinataire+">", null);
                }
            }
        })

    }catch(exception){
        callback(false, "Une exception a été lévée lors de la recherche des messages addressés au destinataire <"+destinataire+"> : "+exception, null);
    }
}

/**
 * La fonction permettant d'envoyer un message dans les annonces
 */
module.exports.sendMessageForAnnoonce = (new_message, callback) => {
    try {
        collection.value.insertOne(new_message, (err, result) => {
            if (err) {
                callback(false, "Une erreur est survenue lors de l'insertion du message : " +err)
            } else {
                if (result) {
                    callback(true, "Message a été insérer", result.ops[0])
                } else {
                    callback(false, "Message non-envoyé")
                }
            }
        })
    } catch (exception) {
        callback(false, "Une exception a été lévée lors de l'insertion du message : " + exception)        
    }
}

module.exports.getAllMessageForNotification = (objet, callback) => {
    try {
        
        collection.value.aggregate([
            {
                "$match": {
                    "id_annonce": { "$exists": 1 },
                    "id_annonce": "" + objet._id
                }
            },
            {
                "$sort": {
                    "date": -1
                }
            }
        ]).toArray((err, resultAggr) => {
            
            if (err) {
                callback(false, "Une erreur est survenue lors de la récupération des messages liés à une annonce : " +err)
            } else {
                if (resultAggr.length > 0) {

                    objet.messages = null;

                    var sortieMessage = 0,
                        messageOut = [],
                        annonce_dao = require("./annonce_dao");
                    
                    annonce_dao.initialize(db_js);

                    for (let index = 0; index < resultAggr.length; index++) {
                        annonce_dao.findOneByObject(resultAggr[index], (isFound, message, result) => {
                            
                            sortieMessage++;
                            if (isFound) {
                                messageOut.push(result)
                            } else {
                                
                            }

                            if (sortieMessage == resultAggr.length) {
                                objet.messages = messageOut;
                                callback(true, "Les messages ont été renvoyé", objet)
                            }
                        })
                    }
                } else {
                    callback(false, "Aucun message pour cet annonce", objet)
                }
            }
        })
    } catch (exception) {
        callback(false, "Une exception a été lévée lors de la récupération des messages liés à une annonce : " + exception)        
    }
}