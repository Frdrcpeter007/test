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

    collection.value = db_js.get().collection("media");
}


/**
 * La fonction qui permet de créer un nouveau média
 */
module.exports.create = function (new_media, callback) {

    try { //Si ce bloc passe

        //On insère un nouveau média
        collection.value.insertOne(new_media, function (err, result) {

            if (err) { //S'il y a erreur
                callback(false, "Une erreur est survenue lors de la création du média : " + err);
            } else { //S/il n'y pas erreur

                if (result) { //On verifie qu'il y a bel et bien un resultat

                    callback(true, "Le media est correctement créé", result.ops[0]);

                }else { //Si aucun resultat n'est renvoyer
                    callback(false, "Désolé, le média n'a pas été créé");
                }
            }
        })
    } catch (exception) { //Si le bloc try connait une erreur inattendu
        callback(false, "Une exception a été lévée lors de la création d'un média : " + exception);
    }
}

/**
 * La fonction permettant de créer un média destiné à un utilisateur
 * @param {*} new_media L'objet média à sauvegarder
 * @param {*} id_utilisateur L'identifiant de l'utilisateur pourvant être : client, agent ou partenaire
 * @param {*} type_utilisateur Le type d'utilisateur dont la valeur peut être : client, agent ou partenaire
 * @param {Function} callback La fonction de callback
 */
module.exports.createForUser = function (new_media, id_utilisateur, type_utilisateur, callback) {
    
    try{
        
        collection.value.insertOne(new_media, function(err, result) {
            
            if(err){
                callback(false, "Une erreur est survenue lors de la création du média lié à l'utilisateur <"+
                    id_utilisateur+"> : "+err);
            }else{

                var new_media_utilisateur = {
                        "id_utilisateur" : id_utilisateur,
                        "id_media" : ""+result.ops[0]._id,
                        "type" : type_utilisateur //(agent, client, partenaire)
                    },
                    media_user_dao = require("./media_user_dao");

                media_user_dao.initialize(db_js);
                media_user_dao.create(new_media_utilisateur, function(isMediaUserCreated, resultMediaUser) {
                    
                    if(isMediaUserCreated){
                        callback(true, result.ops[0])
                    }else{
                        callback(false, resultMediaUser)
                    }
                })
            }
        })

    }catch(exception){

        callback(false, "Une exception a été lévée lors de la création du média lié à l'utilisateur <"+
            id_utilisateur+"> : "+exception);

    }
}

/**
 * La fonction permettant de créer un média destiné à un utilisateur
 * @param {*} new_media L'objet média à sauvegarder
 * @param {*} id_produit L'identifiant du produit
 * @param {*} id_utilisateur L'identifiant de l'utilisateur pourvant être : client, agent ou partenaire
 * @param {Function} callback La fonction de callback
 */
module.exports.createForProduct = function(new_media, callback) {
    
    try{

        new_media.type ="profilProduit";
        new_media.date = new Date();

        collection.value.insertOne(new_media, function(err, result) {
            if(err){
                callback(false, "Une erreur est survenue lors de la création du média lié au produit : "+err);
            }else{
                if (result) {
                    callback(true, "ça y est", result.ops[0])
                } else {
                    callback(false, "Aucun enregistrement")
                }
            }
        })
    }catch(exception){
        callback(false, "Une exception a été lévée lors de la création du média lié au produit : "+exception);
    }
}

/**
 * La fonction permettant de mettre la mise à jour du lien couverture d'une catégorie, 
 * en créant un nouveau média. 
 */
module.exports.createForCategory = function (new_media, id_categorie, callback) {
    
    try{

        new_media.type ="profilCategorie";
        new_media.date = new Date();

        collection.value.insertOne(new_media, function(err, result) {
            
            if(err){
                callback(false, "Une erreur est survenue lors de la création de l'image dédiée à la couverture de la catégorie <"+id_categorie+"> : "+err);
            }else{

                var categorie_dao = require("./categorie_dao");
                categorie_dao.initialize(db_js);

                categorie_dao.updateCategoryCoverImageForAdmin(id_categorie, ""+result.ops[0]._id, function(isUpdate, resultUpdate) {
                    
                    callback(isUpdate, resultUpdate);
                })
            }
        })

    }catch(exception){
        callback(false, "Une exception a été lévée lors de la création de l'image dédiée à la couverture de la catégorie <"+id_categorie+"> : "+exception);
    }
}

/**
 * La fonction qui permet de trouver un média suivant son identifiant
 */
module.exports.findOneById = function (id_media, callback) {

    try {

        var _id = require("mongodb").ObjectID(id_media),
            filter = {
                "_id": _id
            };

        collection.value.findOne(filter, function (err, result) {

            if (err) {
                callback(false, "Une erreur est survenue lors de la recherche du média <" + id_media + "> : " + err)
            } else {

                if (result) {

                    callback(true, null, result);
                } else {
                    callback(false, "Aucun média ne correspond à l'identifiant : " + id_media);
                }
            }
        })
    } catch (exception) {
        callback(false, "Une exception a été lévée lors de la recherche du média <" + id_media + "> : " + exception);
    }
}

/**
 * La fonction qui permet de renvoyer le media correspondant à une catégorie
 */
module.exports.findOneFromCategorie = function (categorie, callback) {

    try {

       
        categorie.media = {
            "id" : null,
            "name" : null,
            "web_size" : null,
            "mobile_size" : null,
            "type" : null,
            "path" : null
        }

        var _id = require("mongodb").ObjectID(categorie.lien_couverture),
            filter = {
                "_id": _id
            };

        collection.value.findOne(filter, function (err, result) {

            if (err) {
                callback(true, categorie, "Une erreur est survenue lors de la recherche du média correspondant à la catégorie <" + categorie._id + " : " + err);
            } else {

                if (result) {

                    categorie.lien_couverture = result.name;

                    categorie.media.id = ""+result._id;
                    categorie.media.name = result.name;
                    categorie.media.web_size = result.web_size;
                    categorie.media.mobile_size = result.mobile_size;
                    categorie.media.type = result.type;
                    categorie.media.path = result.path;

                
                    if(result.path){
                       var  image_path = result.path.replace("public/","");
                       categorie.media.path = image_path;
                    }


                    callback(true, categorie, null);
                } else {

                    categorie.lien_couverture = "/images/category_default.jpg";
                    callback(true, categorie, "Aucun media ne correspond à l'identifiant : " + categorie.lien_couverture);
                }
            }
        })
    } catch (exception) {
        callback(false, categorie, "Une exception a été lévée lors de la recherche du média correspondant à la catégorie <" + categorie._id + " : " + exception);
    }
}

/**
 * La  fonction qui permet de renvoyer le média correspondant à un produit issu 
 * de la liste Top produits. 
 * Elle est utilisée dans la fonction "getTop" de la DAO "commande", et aussi dans media_produit
 */
module.exports.findOneByIdFromTopProduct = function (product_object, callback) {

    try {

        var _id = null;

        if(typeof(product_object) == "object"){

            if(product_object.lien_produit) {
                _id = require("mongodb").ObjectID(product_object.lien_produit)
            }else{
    
                if(product_object.infos_produit.lien_produit){
                    _id =  require("mongodb").ObjectID(product_object.infos_produit.lien_produit)
                }
            }

        }else{
            _id = require("mongodb").ObjectID(product_object);
        }
            
        var filter = {
            "_id": _id
        };

        collection.value.findOne(filter, function (err, result) {

            if (err) {
                callback(false, "Une erreur est survenue lors de la recherche du media associé au produit : " + err, product_object);
            } else {

                if (result) {

                    var image_path = result.path.replace("public/",""),
                        image_name = result.name,
                        objet_retour = {
                            "image_path" : null,
                            "image_name" : null
                        };

                    if(typeof(product_object) == "object"){

                        if(product_object.lien_produit) {

                            product_object.image_path = image_path;
                            product_object.image_name = image_name;
    
                        }else{
    
                            if(product_object.infos_produit.lien_produit){
    
                                product_object.infos_produit.image_path = image_path;
                                product_object.infos_produit.image_name = image_name;
                            }
                        }
                        callback(true, null, product_object);
                    }else{

                        objet_retour.image_name = image_name;
                        objet_retour.image_path = image_path;

                        callback(true, null, objet_retour);
                    }

                } else {

                    if(typeof(product_object) == "object"){
                        if(product_object.lien_produit) {

                            product_object.image_path = null;
                            product_object.image_name = null;
    
                        }else{
    
                            if(product_object.infos_produit.lien_produit){
    
                                product_object.infos_produit.image_path = null;
                                product_object.infos_produit.image_name = null;
                            }
                        }
                    }
                    
                    callback(false, null, product_object)
                }
            }
        })

    } catch (exception) {
        if(typeof(product_object) == "object"){
            if(product_object.lien_produit == null) {

                product_object.image_path = null;
                product_object.image_name = null;

            }else{

                if(product_object.infos_produit.lien_produit == null){

                    product_object.infos_produit.image_path = null;
                    product_object.infos_produit.image_name = null;
                }
            }
        }
        callback(false, "Une exception a été lévée lors de la recherche du media associé au produit : " + exception, product_object);
    }
}

/**
 * La fonction qui permet de rechecher un media suivant son id via l'extra
 * ELle est utilisée dans la fonction "" de la dao ""
 */
module.exports.findOneByIdFromMediaUserForExtra = function (extra, callback) {

    try {

        var filter = require("mongodb").ObjectID(extra.info_client.id_media);

        collection.value.findOne(filter, function (err, result) {

            if (err) {
                callback(false, "Une erreur est survenue lors de la recherche d'un media pour un extra : " + exception);
            } else {

                if (result) {

                    extra.path = result.path;
                    extra.name = result.name;
                    
                    callback(true, extra);
                } else {
                    callback(true, extra, null);
                }
            }
        })

    } catch (exception) {
        callback(false, "Une exception a été lévée lors de la recherche d'un media pour un extra : " + exception);
    }
}

/**
 * La fonction qui permet de rechecher un media suivant son id via l'extra
 * ELle est utilisée dans la fonction "" de la dao ""
 */
module.exports.findOneByIdFromExtra = function (extra, callback) {

    try {

        var filter = require("mongodb").ObjectID(extra.info_client.id_media);

        collection.value.findOne(filter, function (err, result) {

            if (err) {
                callback(false, "Une erreur est survenue lors de la recherche d'un media pour un extra : " + exception);
            } else {

                if (result) {

                    extra.path = result.path;
                    extra.name = result.name;
                    
                    callback(true, extra);
                } else {
                    callback(true, extra, null);
                }
            }
        })

    } catch (exception) {
        callback(false, "Une exception a été lévée lors de la recherche d'un media pour un extra : " + exception);
    }
}


/**
 * La fonction qui permet de trouver les images d'un ADS via l'identifiant du média
 * @param {*} ads L'ads qu'on recherche
 * @param {Function} callback La fonction de retour
 */
module.exports.findOneByIdFromAds = function (ads, callback) {

    try {

        var _id = require("mongodb").ObjectID(ads.id_media),
            filter = {
                "_id": _id
            };

        ads.lien_media = null;

        collection.value.aggregate([{
                $match: filter
            },
            {
                $project: {
                    _id: 0
                }
            }
        ]).toArray(function (err, result) {

            if (err) {
                callback(false, "Une erreur est survenue lors de la recherche du média <" + ads.id_media + "> : " + err, ads)
            } else {

                if (result) {

                    ads.lien_media = result[0];

                    callback(true, null, ads);
                } else {
                    callback(false, "Aucun média ne correspond à l'identifiant : " + ads.id_media, ads);
                }
            }
        })
    } catch (exception) {
        callback(false, "Une exception a été lévée lors de la recherche du média <" + ads.id_media + "> : " + exception, ads);
    }
}

/**
 * Cette fonction permet de récupérer les medias liés à un partenaire
 * @param {*} partenaire Le partenaire qu'on veut trouver le media
 * @param {Function} callback La fonction de retour
 */
module.exports.findOneByIdFromPartenaire = function (partenaire, callback) {
    try {
        var _id = require("mongodb").ObjectId(partenaire.id_media),
            filter = {
                "_id": _id
            };
        
        partenaire.path = null;
        partenaire.id_media = null;
        partenaire.name = null;

        collection.value.findOne(filter, function (err, result) {
            if (err) {
                callback(false, "Une erreur est survénue lors de la recherche des media du partenaire : " + err)
            } else {
                if (result) {
                    partenaire.path = result.path;
                    partenaire.id_media = "" + result._id;
                    partenaire.name = result.name;

                    callback(true, "Le media du partenaire a été renvoyé", partenaire)
                } else {
                    callback(false, "Aucun media n'a été répérer pour ce partenaire", partenaire)
                }
            }
        })
    } catch (exception) {
        callback(false, "Une exception a été lévée lors de la recherche du media du partenaire : " + exception)
    }
}

/**
 * La fonction qui permet de trouver un média suivant son identifiant
 */
module.exports.findOneByMedia = function (media, callback) {

    try {

        var _id = require("mongodb").ObjectID(media.avatar),
            filter = {
                "_id": _id
            };

        collection.value.findOne(filter, function (err, result) {

            if (err) {
                callback(false, "Une erreur est survenue lors de la recherche du média <" + media.avatar + "> : " + err, media)
            } else {
                var avatar = {
                    "name": null,
                    "size": null,
                    "path": null
                };

                if (result) {

                    avatar.name = result.name;
                    avatar.size = result.size;
                    avatar.path = result.path;

                    media.avatar = avatar;
                    callback(true, "Le media est trouvé", media);
                } else {

                    avatar.name = null;
                    avatar.path = null;

                    media.avatar = avatar;
                    callback(false, "Aucun média ne correspond à l'identifiant : " + media.avatar, media);
                }
            }
        })
    } catch (exception) {
        callback(false, "Une exception a été lévée lors de la recherche du média <" + id_media + "> : " + exception, media);
    }
}

/**
 * La fonction permettant de lister les médias 
 * Elle est utilisée dans l'administration
 */
module.exports.getAllForAdmin = function(type, top, limit, callback) {
    
    try{

        var filter = null;

        if(top != "null"){
            filter = {
                "date" : {
                    "$gt" : new Date(top)
                }
            }
        }else{
            filter = {}
        }

        if(type != "null"){
            filter.type = type
        }

        collection.value.find(filter).limit(limit).toArray(function(err, result) {
            if(err){
                callback(false, "Une erreur est survenue lors du listage de média : "+err)
            }else{
                if(result.length > 0){
                    callback(true, result)
                }else{
                    callback(false, "Il semble que les critères de recherche n'aient renvoyer aucun média");
                }
            }
        })

    }catch(exception){
        callback(false, "Une exception a été lévée lors du listage de média : "+exception)
    }
}

/**
 * La fonction permettant d'afficher les détails d'un média suivant son identifiant.
 * Elle est utilisée dans l'administration
 */
module.exports.findOneByIdForAdmin = function (id_media, callback) {
    
    try{

        var _id = require("mongodb").ObjectID(id_media),
            filter = {
                "_id" : _id
            };
        
        collection.value.findOne(filter, function(err, resultMedia) {
            
            if(err){//Si une erreur survenait lors de la recherche du média
                callback(false, "Une erreur est survenue lors de la recherche du média <"+id_media+"> : "+err);
            }else{//Sinon aucune erreur n'est survenue

                if(resultMedia){//Si le média recherché est trouvé

                    resultMedia.message_erreur = null;
                   
                    
                    //Sachant qu'il s'agit d'afficher tous les détails du média, 
                    //nous allons devoir vérifier son type afin de les ressortir.
                    
                    switch(resultMedia.type){
                        case "profilProduit" : //Cas où l'image est réliée à un produit
                            
                            var media_produit_dao = require("./media_produit_dao");
                            media_produit_dao.initialize(db_js);
                            media_produit_dao.findOneByIdMedia(""+resultMedia._id, function(isMediaProdMatched, resultMediaProduct) {
                                
                                if(isMediaProdMatched){
                                    resultMedia.media_produit = resultMediaProduct;
                                    
                                    //On recherche les détails sur le produit assigné et l'auteur ayant posté l'image
                                    findMediaProductAndAutorById(resultMedia, function (isProductAndAutorMatched, resultWithProductAndAutorMatched) {
                                        callback(true, resultWithProductAndAutorMatched)
                                    })
                                    
                                }else{
                                    resultMedia.message_erreur = resultMediaProduct;
                                }
                            })
                        break;
                        case "ads" : //Cas où l'image est réliée à un ADS
                            
                            var ads_dao = require("./ads_dao");
                            ads_dao.initialize(db_js);
                            ads_dao.findOneByIdMedia(""+resultMedia._id, function(isAdsMatched, resultAds){
                                
                                if(isAdsMatched){

                                    resultMedia.ads = resultAds;

                                    //On recherche les détails sur l'ads assigné et son auteur
                                    findAdsAutorById(resultMedia, function (isMediaAdsWithAgentDetails, resultMediaAdsWithAgentDetails) {
                                        callback(true, resultMediaAdsWithAgentDetails)
                                    })

                                }else{
                                    resultMedia.message_erreur = resultAds;
                                    callback(true, resultMedia);
                                }
                                
                            })
                        break;

                        case "profilPartenaire" : //Cas où l'image est réliée à un partenaire

                            //On commence par recherché l'entité media_user
                            var media_user_dao = require("./media_user_dao");
                            media_user_dao.initialize(db_js);
                            media_user_dao.findOneByIdMedia(""+resultMedia._id, function(isMediaUserMatched, resultMediaUser) {
                                
                                resultMedia.type_media_user = "agent";
                                resultMedia.partenaire = {};
                                resultMedia.partenaire.message_erreur = null;

                                if(isMediaUserMatched){//Si l'entité media_user est trouvée

                                    var partenaire_dao = require("./partenaire_dao");
                                    partenaire_dao.initialize(db_js);
                                    partenaire_dao.findOneById(resultMediaUser.id_utilisateur, function(isPartnerMatched, resultPartner) {
                                        
                                        if(isPartnerMatched){
                                            var details_partenaire = {
                                                "id" : ""+resultPartner._id,
                                                "intitule" : resultPartner.intitule,
                                                "description" : resultPartner.description
                                            };
                                            
                                            resultMedia.partenaire = details_partenaire;
                                        }else{
                                            resultMedia.partenaire.message_erreur = resultPartner
                                        }

                                        callback(true, resultMedia);
                                        
                                    })

                                }else{//Sinon l'entité media_user n'a pas été trouvée
                                    resultMedia.message_erreur =resultMediaUser
                                    callback(true, resultMedia)
                                }

                            })
                             
                        break;

                        case "profilClient" : //Cas où l'image est réliée à un client

                            //On commence par recherché l'entité media_user
                            var media_user_dao = require("./media_user_dao");
                            media_user_dao.initialize(db_js);
                            media_user_dao.findOneByIdMedia(""+resultMedia._id, function(isMediaUserMatched, resultMediaUser) {
                                
                                resultMedia.type_media_user = "client";
                                resultMedia.client = {};
                                resultMedia.client.message_erreur = null;

                                if(isMediaUserMatched){//Si l'entité media_user est trouvée

                                    var client_dao = require("./client_dao");
                                    client_dao.initialize(db_js);
                                    client_dao.findOneById(resultMediaUser.id_utilisateur, function(isClient, messageClient, resultClient) {
                                        
                                        if(isClient){
                                            var details_client = {
                                                "id" : ""+resultClient._id,
                                                "nom" : resultClient.nom,
                                                "prenom" : resultClient.prenom,
                                                "lien_profil" : resultClient.inscription.lien_profil
                                            };
                                            
                                            resultMedia.client = details_client;
                                        }else{
                                            resultMedia.client.message_erreur = resultPartner
                                        }

                                        callback(true, resultMedia);

                                    })

                                }else{//Sinon l'entité media_user n'a pas été trouvée
                                    resultMedia.message_erreur =resultMediaUser

                                    callback(true, resultMedia)
                                }

                            })

                        break;

                        case "profilAgent" : //profilAgent
                           
                           //On commence par recherché l'entité media_user
                           var media_user_dao = require("./media_user_dao");
                           media_user_dao.initialize(db_js);
                           media_user_dao.findOneByIdMedia(""+resultMedia._id, function(isMediaUserMatched, resultMediaUser) {
                               
                                resultMedia.type_media_user = "agent";
                                resultMedia.agent = {};
                                resultMedia.agent.message_erreur = null;

                               if(isMediaUserMatched){//Si l'entité media_user est trouvée

                                    var agent_dao = require("./agent_dao");
                                    agent_dao.initialize(db_js);
                                    agent_dao.findOneById(resultMediaUser.id_utilisateur, function (isAgentMatched, messageAgent, resultAgent) {
                                        
                                        if(isAgentMatched){
                                            var details_agent = {
                                                "nom" : resultAgent.nom,
                                                "prenom" : resultAgent.prenom,
                                                "matricule" : resultAgent.matricule
                                            };
                                
                                            resultMedia.agent.details_agent = details_agent;
                                        }else{
                                            resultMedia.agent.message_erreur = messageAgent
                                        }

                                        callback(true, resultMedia)
                                    })

                               }else{//Sinon l'entité media_user n'a pas été trouvée
                                   resultMedia.message_erreur =resultMediaUser;

                                   callback(true, resultMedia)
                               }

                           })

                        break;

                        default : 
                           callback(false, "Il semble que le type du média <"+id_media+"> => ("+resultMedia.type+") ne soit pas correct");
                    }
                }else{//Sinon aucun média n'a été trouvé
                    callback(false, "Aucun média ne correspond à l'identifiant <"+id_media+">")
                }
            }
        })

    }catch(exception){
        callback(false, "Une exception a été lévée lors de la recherche du média <"+id_media+"> : "+exception);
    }
}

/**
 * Fonction auxilliaire à "findOneByIdForAdmin"
 * @param {*} media 
 * @param {*} callback 
 */
function findMediaProductAndAutorById(media, callback) {

    media.media_produit.message_erreur_auteur = null;
    media.media_produit.message_erreur_produit = null;

    var dealer_dao = require("./dealer_dao");
    dealer_dao.initialize(db_js);
    dealer_dao.findOneByIdClient(media.media_produit.id_auteur, function(isDealer, messageDealer, resultDealer) {
        
        if(isDealer){
            //On commence par rechercher l'auteur de l'image
            var client_dao = require("./client_dao");
            client_dao.initialize(db_js);
            client_dao.findOneById(resultDealer.id_client, function(isAutorMatched, messageAutor, resultAutor) {
                
                if(isAutorMatched){
                    var details_autor = {
                        "id_client" : ""+resultAutor._id,
                        "nom" : resultAutor.nom,
                        "prenom" : resultAutor.prenom,
                        "lien_profil" : resultAutor.inscription.lien_profil
                    };
                    media.media_produit.details_auteur = details_autor;

                }else{   
                    media.media_produit.message_erreur_auteur = messageAutor;
                }

                //Puis on recherche les détails du produit
                var produit_dao = require("./produit_dao");
                produit_dao.initialize(db_js);

                produit_dao.findOneById(media.media_produit.id_produit, null, 
                function(isProductMatched, messageProduct, resultProduct){
                    
                    if(isProductMatched){
                        var details_product = {
                            "intitule"  : [],
                            "annotation" : resultProduct.annotation,
                            "lien_produit" : resultProduct.lien_produit
                        };

                        resultProduct.intitule.forEach(intitule => {
                            details_product.intitule.push(intitule)
                        });

                        media.media_produit.details_produit = resultProduct;

                    }else{
                        media.media_produit.message_erreur_produit = messageProduct
                    }

                    callback(true, media)
                })

            });

        }else{
            media.media_produit.message_erreur_auteur = messageDealer;
        }
    })

}

/**
 * Fonction auxilliaire à "findOneByIdForAdmin"
 * @param {*} media 
 * @param {*} callback 
 */
function findAdsAutorById(media, callback) {
    
    media.ads.message_erreur_agent = null;

    //On trouve l'agent
    var agent_dao = require("./agent_dao");
    agent_dao.initialize(db_js);

    agent_dao.findOneById(media.ads.id_agent, function(isAgentMatched, messageAgent, resultAgent) {
        
        if(isAgentMatched){
            var details_agent = {
                "nom" : resultAgent.nom,
                "prenom" : resultAgent.prenom,
                "matricule" : resultAgent.matricule
            };

            media.ads.details_agent = details_agent;
        }else{
            media.ads.message_erreur_agent = messageAgent
        }

        callback(true, media);
    })
}

/**
 * La fonction permettant de rechercher le média d'un client.
 * Elle est utilisée dans la fonction "getAllForAdmin" et "findOneByIdForAdmin" de la DAO "client"
 */
module.exports.findOneByIdFromClientForAdmin =  function (client, callback) {

    //Sachant que la présente fonction est appelée dans deux autres fonctions ayant des formes d'entités différentes, 
    //il va de soit que nous vérifions le bon emplacement de la propriété "lien_profil"
    if((client.infos && client.infos[0].lien_profil) || (client.inscription && client.inscription.lien_profil)){
        //Si la recherche de la propriété "lien_profil" aboutie positivement

        try{
            var _id, filter, matcher;

            if(client.infos && client.infos[0].lien_profil){//Le cas où la propriété "lien_profil" est contenue dans l'entité provenant de la Fx "findOneByIdForAdmin" de la DAO "client" 
                _id = require("mongodb").ObjectID(client.infos[0].lien_profil);
                filter = {"_id" : _id};
                matcher = true;
            }else{//Sinon la propriété "lien_profil" est contenue dans l'entité provenant de la Fx "getAllForAdmin" de la DAO "client" 

                if(client.inscription && client.inscription.lien_profil){
                    _id = require("mongodb").ObjectID(client.inscription.lien_profil);
                    filter = {"_id" : _id};
                    matcher = true;
                }else{
                    matcher = false;
                }
                
            }

            if(matcher){ //Si la propriété "lien_profil" a été trouvée dans l'un de cas de recherche précédant
                collection.value.findOne(filter, function(err, result) {
                    
                    //Dans le reste du code, pour chaque cas, on test le contexte dans lequel la fonction est appelée afin de renvoyer un résultat correspondant. 
                    if(err){
                        if(client.inscription){
                            callback(true, "Une erreur est survenue lors de la recherche du média <"+
                                client.inscription.lien_profil+"> : "+err, client);
                        }else{
                            callback(true, "Une erreur est survenue lors de la recherche du média <"+
                                client.infos[0].lien_profil+"> : "+err, client);
                        }
                        
                    }else{
                        if(result){

                            var image_path = null;

                            if(client.inscription){
                                client.inscription.lien_profil = result.name;
                                client.inscription.path_profil = null;
            
                                
                                if(result.path){
                                    image_path = result.path.replace("public/","");
                                }

                                client.inscription.path_profil = image_path;
                            }else{
                                client.infos[0].lien_profil = result.name;
                                client.infos[0].path_profil = "";
            
                                if(result.path){
                                    image_path = result.path.replace("public/","");
                                }                               
                                client.infos[0].path_profil = image_path;
                            }
                            
                        }else{
                            client.inscription.lien_profil = null                    
                        }
        
                        callback(true, null, client)
                    }
                })
            }else{//SInon la propriété "lien_profil" n'a été trouvée dans aucun de cas de recherche précédant.
                callback(true, null, client)
            }

        }catch(exception){

            if(client.inscription){
                callback(true, "Une exception a été lévée lors de la recherche du média <"+
                    client.inscription.lien_profil+"> : "+exception, client);
            }else{
                callback(true, "Une exception a été lévée lors de la recherche du média <"+
                    client.infos[0].lien_profil+"> : "+exception, client);
            }
        }
        
    }else{//Sinon la recherche de la propriété "lien_profil" n'a  pas abouti positivement
        
        callback(true,null, client)
    }
}

/**
 * Cette fonction permet de récupérer les medias liés à un favoris
 * @param {*} partenaire Le partenaire qu'on veut trouver le media
 * @param {Function} callback La fonction de retour
 */
module.exports.findOneByIdFromFavoris = function (favoris, callback) {
    
    try {
        var _id = require("mongodb").ObjectId(favoris.lien_produit),
            filter = {
                "_id": _id
            };
        
        favoris.image_path = null;
        favoris.image_name = null;

        collection.value.findOne(filter, function (err, result) {
            if (err) {
                callback(false, "Une erreur est survénue lors de la recherche des media du favoris : " + err, favoris)
            } else {
                if (result) {

                    var image_path = null;

                    if(result.path){
                        image_path = result.path.replace("public/","");
                    }
                    
                    favoris.image_path = image_path;
                    favoris.image_name = result.name;

                    callback(true, "Le media du favoris a été renvoyé", favoris)
                } else {
                    callback(false, "Aucun media n'a été répérer pour ce favoris", favoris)
                }
            }
        })
    } catch (exception) {
        callback(false, "Une exception a été lévée lors de la recherche du media du favoris : " + exception, favoris)
    }
}

/**
 * La fonction permettant de trouver un média provenant d'un dealer
 */
module.exports.findOneByIdfromDealer = function(dealer, callback) {

    dealer.image_name = null;
    dealer.image_path = null;

    if(dealer.lien_profil){
    
        try{

            var _id = require("mongodb").ObjectID(dealer.lien_profil),
                filter = {"_id" : _id};

            collection.value.findOne(filter, function(err, result) {
                
                if(err){
                    callback(false, "Une erreur est survenue lors de la recherche du média du dealer <"+dealer._id+"> : "+err, dealer);
                }else{

                    if(result){

                        dealer.image_name = result.name;

                        var image_path = result.path.replace("public/","");
                        dealer.image_path = image_path;

                        callback(true,null, dealer)
                    }else{
                        callback(false, "Aucun média ne correspond au média <"+dealer.lien_profil+"> définie pour le dealer <"+dealer._id+">", dealer);
                    }
                }
            })

        }catch(exception){
            callback(false, "Une exception a été lévée lors de la recherche du média du dealer <"+dealer._id+"> : "+exception, dealer);
        }

    }else{
        callback(false, "Aucun média profil n'a été définie pour le dealer <"+dealer._id+">", dealer);
    }
}

/**
 * La fonction permettant de trouver un média par id provenant d'un agent
 */
module.exports.findONeByIdFromAgent = function(agent, callback) {

    agent.image_name = null;
    agent.image_path = null;

    if(agent.lien_profil){
    
        try{

            var _id = require("mongodb").ObjectID(agent.lien_profil),
                filter = {"_id" : _id};

            collection.value.findOne(filter, function(err, result) {
                
                if(err){
                    callback(false, "Une erreur est survenue lors de la recherche du média de l'agent <"+agent._id+"> : "+err, agent);
                }else{

                    if(result){

                        agent.image_name = result.name;

                        var image_path = result.path.replace("public/","");
                        agent.image_path = image_path;

                        callback(true,null, agent)
                    }else{
                        callback(false, "Aucun média ne correspond au média <"+agent.lien_profil+"> définie pour l'agent <"+agent._id+">", agent);
                    }
                }
            })

        }catch(exception){
            callback(false, "Une exception a été lévée lors de la recherche du média du agent <"+agent._id+"> : "+exception, agent);
        }

    }else{
        callback(false, "Aucun média profil n'a été définie pour l'agent <"+agent._id+">", agent);
    }
}

/**
 * La fonction permettant d'avoir la couverture du produit qu'un dealer a soumis
 */
module.exports.findOneByIdFromOperationVenteForAdmin = function(operationVente, callback) {

    if(operationVente.lien_produit){
    
        try{

            var _id = require("mongodb").ObjectID(operationVente.lien_produit),
                filter = {"_id" : _id};

            collection.value.findOne(filter, function(err, result) {
                
                if(err){

                    operationVente.listeErreur.push("Une erreur est survenue lors de la recherche du média de l'operationVente <"+operationVente._id+"> : "+err);
                    callback(false, operationVente);
                }else{

                    if(result){

                        operationVente.image_name = result.name;

                        var image_path = result.path.replace("public/","");
                        operationVente.image_path = image_path;

                        callback(true, operationVente)
                    }else{

                        operationVente.listeErreur.push("Aucun média ne correspond au média <"+operationVente.lien_produit+"> définie pour l'operationVente <"+operationVente._id+">");
                        callback(false, operationVente);
                    }
                }
            })

        }catch(exception){

            operationVente.listeErreur.push("Une exception a été lévée lors de la recherche du média de l'operationVente <"+operationVente._id+"> : "+exception);
            callback(false, operationVente);
        }

    }else{

        operationVente.listeErreur.push("Aucun média profil n'a été définie pour l'operationVente <"+operationVente._id+">");
        callback(false, operationVente);
    }
}