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

    collection.value = db_js.get().collection("ads");
}

/**
 * La fonction qui permet de créer un ads
 */
module.exports.createForAdmin = function (new_ads, media_ads,  callback) {

    try { //Si ce bloc passe

        //On appele la méthode insertOne (une methode propre à mongoDB) de notre collection qui doit prendre la structure de l'entité
        collection.value.insertOne(new_ads, function (err, result) {

            //On test s'il y a erreur
            if (err) {
                callback(false, "Une erreur est survenue lors création de l'ads : " + err);
            } else { //S'il n'y a pas erreur

                //On vérifie s'il y a des résultat renvoyé
                if (result.ops[0]) {
                    

                    //On enregistre l'image assignée à l'ads
                    var media_dao = require("./media_dao"),
                        media = require("./entities/media_entity").Media();

                    media.name = media_ads.name;
                    media.path = media_ads.path;
                    media.size = media_ads.size;
                    media.type = media_ads.type; //ads
                    media.date = new Date();

                    media_dao.initialize(db_js);
                    media_dao.create(media, function(isMediaCreated, messageMedia, resultMedia) {
                        
                        if(isMediaCreated){

                            var filter = {"_id" : result.ops[0]._id},
                                update = {"$set" : {"id_media" : ""+resultMedia._id}};
                            
                            collection.value.updateOne(filter, update, function(errUpdate, resultUpdate) {
                                
                                if(errUpdate){
                                    callback(false, "Une erreur est survenue lors de l'ajout de l'image à l'ads : "+errUpdate)
                                }else{
                                    callback(true, result.ops[0])
                                }
                            })

                        }else{
                            callback(false, messageMedia)
                        }
                    })

                } else { //Si non l'etat sera false et on envoi un message
                    callback(false, "Désolé, l'ads n'a pas été crée")
                }
            }
        })

    } catch (exception) { //Si ce bloc ne passe pas on lève une exception
        callback(false, "Une exception a été lévée lors de la création de l'agent : " + exception);
    }
}

/**
 * La fonction permettant de lister les Ads
 */
module.exports.getAllForAdmin = function (top, limit, callback) {
    
    try{

        var filter = null;

        if(!isNaN(top)){
            filter = {
                "date" : {
                    "$gt" : new Date(top)
                }
            }
        }else{
            filter = {}
        };

        collection.value.find(filter).limit(limit).toArray(function (errAds, resultAds) {
            
            if(errAds){
                callback(false, "Une erreur est survenue lors du listage de  tous les Ads : "+errAds);
            }else{

                if(resultAds.length > 0){//Si au moins un ads a été trouvé
                    
                    callback(true, resultAds)

                }else{//Aucun ads n'est dans la BD
                    callback(false, "Aucun ads n'a été trouvé dans la BD");
                }
            }
        })
    }catch(exception){
        callback(false, "Une exception a été lévée lors du listage de  tous les Ads : "+exception);
    }
}

/**
 * La fonction qui permet de recupérer une liste d'ads suivant le type
 */
module.exports.getSlider = function (type, callback) {

    try {

        var now = new Date(),
            filter = {
                "type": type,
                "etat": true,
                "date_debut_publication": {
                    "$lte": now
                },
                "date_fin_publication": {
                    "$gte": now
                }

            };

        collection.value.find(filter).toArray(function (err, resultAds) {

            if (err) {
                callback(false, "Une erreur est survenue lors de la recherche des ads du type <" + type + "> : " + exception);
            } else {

                if (resultAds.length > 0) { //Si au moins un ads correspondant aux critères de cherche a été trouvé
                    //on passe à la recherche de médias correspondant : 

                    var media_model = require("./media_dao"),
                        listeMediaSlider = [],
                        sortieAds = 0;

                    //On initialize le modèle média
                    media_model.initialize(db_js);

                    //On passe en boucle tous les ads
                    for (var indexAds = 0; indexAds < resultAds.length; indexAds++) {

                        //On exécute la fonction de recherche du média
                        media_model.findOneByIdFromAds(resultAds[indexAds], 
                            function (isMediaMatched, resultMessage, resultWithMedia) {

                            //on incrémente la variable de sortie de la liste ads
                            sortieAds++;

                            listeMediaSlider.push(resultWithMedia)

                            //On test la condition de sortie
                            if (sortieAds == resultAds.length) {

                                if (listeMediaSlider.length > 0) {
                                    callback(true, listeMediaSlider)
                                } else {
                                    callback(false, "Aucun média n'a été trouvé");
                                }
                            }

                        })
                    }
                } else {
                    callback(false, "Aucun ads n'est disponible");
                }
            }
        })

    } catch (exception) {
        callback(false, "Une exception a été lévée lors de la recherche des ads du type <" + type + "> : " + exception);
    }
}

/**
 * La fonction permettant de trouver un ads suivant un ads donné
 * Elle est utilisée dans la fonction "findOneByIdForAdmin" de la DAO "media"
 */
module.exports.findOneByIdMedia = function (id_media, callback) {
    
    try{

        var filter = {"id_media" : id_media};
        collection.value.findOne(filter, function(err, result) {
            
            if(err){
                callback(false, "Une erreur est survenue lors de la recherche de l'ads lié au média <"+id_media+"> : "+err)
            }else{
                if(result){
                    callback(true, result)
                }else{
                    callback(false, "Aucun média ne correspond au média <"+id_media+">");
                }
            }
        })
    }catch(exception){
        callback(false, "Une exception a été lévée lors de la recherche de l'ads lié au média <"+id_media+"> : "+exception)
    }
}

/**
 * La fonction permettant de trouver un ads suivant son identifiant
 */
module.exports.findOneByIdForAdmin = function(id_ads, callback) {
    
    try{
        var _id = require("mongodb").ObjectID(id_ads),
            filter = {"_id" : _id};

        collection.value.findOne(filter, function(err, resultAds) {
            
            if(err){
                callback(false, "Une erreur est survenue lors de la recherche de l'ads <"+id_ads+"> : "+err);
            }else{
                if(resultAds){///Si l'ads est trouvé

                    resultAds.message_erreur = null;

                    //On recherche le média associé
                    var media_dao = require("./media_dao");
                    media_dao.initialize(db_js);
                    media_dao.findOneById(resultAds.id_media, function(isMediaMatched, messageMedia, resultMedia) {
                        
                        if(isMediaMatched){//Si le média est trouvé

                            var details_media = {
                                "name" : resultMedia.name,
                                "path" : resultMedia.path,
                            };

                            resultAds.details_media = details_media;

                            //Puis on recherche l'agent ayant enregistré
                            var agent_dao = require("./agent_dao");
                            agent_dao.initialize(db_js);
                            agent_dao.findOneById(resultAds.id_agent, function(isAgent, messageAgent, resultAgent) {
                                
                                if(isAgent){

                                    var details_agent = {
                                        "nom" : resultAgent.nom,
                                        "prenom" : resultAgent.prenom,
                                        "matricule" : resultAgent.matricule,
                                        "lien_profil" : null
                                    };

                                    //On rechercher le lien_profil de l'agent
                                    media_dao.findOneById(resultAgent.authentification.lien_profil, 
                                    function name(isMediaInnerMatched, messageInnerMedia, resultInnerMedia) {
                                        
                                        if(isMediaInnerMatched){
                                            details_agent.lien_profil = resultInnerMedia.path;
                                            resultAds.details_agent = details_agent
                                            callback(true, resultAds)
                                        }else{
                                            resultAds.message_erreur = messageInnerMedia;
                                            callback(true, resultAds)
                                        }
                                    })
                                }else{
                                    resultAds.message_erreur = messageAgent;
                                    callback(true, resultAds)
                                }
                            })

                        }else{//Sinon le média associé à l'ads n'a pas été trouvé
                            resultAds.message_erreur = messageMedia;
                            callback(true, resultAds)
                        }
                    })

                }else{//Sinon aucun ads ne correspond à l'identifiant passé
                    callback(false, "Aucun ads ne correspond à l'identifiant <"+id_ads+">");
                }
            }
        })

    }catch(exception){
        callback(false, "Une exception a été lévée lors de la recherche de l'ads <"+id_ads+"> : "+exception);
    }
}

/**
 * La fonction permettant de mettre à jour les infos d'un ads
 * @param {*} id_ads L'indentifiant de l'ads à modifier
 * @param {*} infosToUpdate L'object d'infos à mettre à jour (date début pub, date fin pub, type, annotation) 
 * @param {*} callback  La fonction d'appel
 */
module.exports.updateInfosForAdmin =  function(id_ads, infosToUpdate, callback) {
    
    try{

        var _id = require("mongodb").ObjectID(id_ads),
            filter = {"_id" : _id},
            update = { "$set" :
                {
                    "type" : infosToUpdate.type,
                    "date_debut_publication" : infosToUpdate.date_debut_publication,
                    "date_fin_publication" : infosToUpdate.date_fin_publication,
                    "annotation" : infosToUpdate.annotation
                }
            };
        
        collection.value.updateOne(filter, update, function(err, result) {
            
            if(err){
                callback(false, "Une erreur est survenue lors de la mise à jour des infos de l'ads <"+id_ads+"> : "+ exception);
            }else{
                callback(true, "La mise à jour a été effectuée avec succès");
            }
        })
    }catch(exception){
        callback(false, "Une exception a été lévée lors de la mise à jour des infos de l'ads <"+id_ads+"> : "+ exception);
    }
}

/**
 * La fonction qui permet de modifier l'état de l'ads
 */
module.exports.updateStateForAdmin = function (id_ads, callback) {

    try {
        var _id = require("mongodb").ObjectID(id_ads),
            filter = {
                "_id": _id
            };

        collection.value.findOne(filter, function(errFindAds, resultFindAds) {//On commence par rechercher l'ads
            
            if(errFindAds){//Si une erreur survenait lors de la recheche de cet ads
                callback(false, "Une erreur a été lévée lors de la recherche de l'ads <"+id_ads+"> à mettre à jour : "+errFindAds)
            }else{//Sinon aucune erreur n'est survenue lors de la recherche

                if(resultFindAds){//Si l'ads à modifier est retrouvé

                    //On recupère son état actuel
                    var current_state = resultFindAds.etat,
                        new_state = null;

                    if(current_state){
                        new_state = false;
                    }else{
                        new_state = true
                    }

                    var update = {"$set" : 
                        {"etat" : new_state}
                    }

                    collection.value.updateOne(filter, update, function(errUpdate, resultUpdate) {
                        if(errUpdate){
                            callback(false, "Une erreur est survenue lors de la mise à jour de l'état de l'ads <"+id_ads+"> : "+errUpdate);
                        }else{
                            callback(true, "L'état de l'ads <"+id_ads+"> a été correctement mise à jour à <"+new_state+">");
                        }
                    })

                }else{//Sinon l'ads à modifier n'a pas été trouvé
                    callback(false, "Aucun ads à modifier ne correspond à l'identifiant <"+id_ads+">")
                }
            }
        })

    } catch (exception) {
        callback(false, "Une exception à été lévée lors du changement d'état de l'ads <"+id_ads+"> :" + exception);
    }
    
}
