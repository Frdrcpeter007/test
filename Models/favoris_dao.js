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

    collection.value = db_js.get().collection("favoris");
}

/**
 * La fonction qui permet de créer un favoris
 */
module.exports.create = function (new_favoris, callback) {

    try { //Si ce bloc passe

        var operation_produit_dao = require("./operation_produit_dao");

        operation_produit_dao.initialize(db_js);
        operation_produit_dao.findOneByIdProduitForIdDealer(new_favoris.id_produit, (operationMatched, messageOperation, resultOperation) => {
            if (operationMatched) {
                var id_client = new_favoris.id_client,
                    id_produit = new_favoris.id_produit,
                    filter = {
                        "id_client": id_client,
                        "id_produit": id_produit,
                        "flag": true
                    };

                collection.value.find(filter).toArray(function (err, result) {
                    if (err) {
                        callback(false, "Une erreeur est surtvénu lors de la recheche des la combinaison client/produit : " + err)
                    } else {
                        if (result.length > 0) {
                            var update = {
                                "$set": {
                                    "flag": false,
                                    "date": new Date()
                                }
                            };

                            collection.value.update(filter, update, function (err, result) {
                                if (err) {
                                    callback(false, "Une erreur est survénue lors de la modification du flag " + err)
                                } else {
                                    callback(true, "Produit rétirer de la liste des favoris avec succès", null)
                                }
                            })
                        } else {

                            var filter2 = {
                                "id_client": id_client,
                                "id_produit": id_produit,
                                "flag": false
                            };

                            collection.value.find(filter2).toArray(function (err, res) {
                                if (err) {
                                    callback(false, "Une erreeur est surtvénu lors de la recheche des la combinaison client/produit")
                                } else {
                                    if (res.length > 0) {
                                        var update = {
                                            "$set": {
                                                "flag": true,
                                                "date": new Date()
                                            }
                                        };

                                        collection.value.update(filter2, update, function (err, resultUpdate) {
                                            if (err) {
                                                callback(false, "Une erreur est survénue lors de la modification du flag " + err)
                                            } else {
                                                callback(true, "Produit correctement ajouté aux favoris", null)
                                            }
                                        })
                                    } else {
                                        //On appele la méthode insertOne (une methode propre à mongoDB) de notre collection qui doit prendre la structure de l'entité
                                        collection.value.insertOne(new_favoris, function (err, result) {

                                            //On test s'il y a erreur
                                            if (err) {
                                                callback(false, "Une erreur est survenue lors de l'ajout de ce produit dans vos favoris", "" + err);
                                            } else { //S'il n'y a pas erreur

                                                //On vérifie s'il y a des résultat renvoyé
                                                if (result) {
                                                    
                                                    if (result.ops[0].id_auteur != resultOperation.id_dealer) {
                                                        var notification_dao = require("./notification_dao"),
                                                            notification_entity = require("./entities/notification_entity").Notification();
                                                        notification_entity.id_objet = result.ops[0].id_produit;
                                                        notification_entity.id_auteur = result.ops[0].id_client;
                                                        notification_entity.id_recepteur = resultOperation.id_dealer;
                                                        notification_entity.type = "favoris";

                                                        notification_dao.initialize(db_js);
                                                        notification_dao.create(notification_entity, (isCreated, message_created, resultNoootif) => {
                                                            callback(true, "Produit correctement ajouté aux favoris", result.ops[0]);
                                                        })
                                                    }else{
                                                        callback(true, "Produit correctement ajouté aux favoris", result.ops[0]);
                                                    }

                                                } else { //Si non l'etat sera false et on envoi un message
                                                    callback(false, "Malheureusement, le produit n'a pas été ajouté aux favoris comme il faut")
                                                }
                                            }
                                        })
                                    }
                                }
                            })

                        }
                    }
                })
            } else {
                callback(false, "Produit non-régularisé")
            }
        })


    } catch (exception) { //Si ce bloc ne passe pas on lève une exception
        callback(false, "Une exception a été lévée lors de l'ajout du produit dans les favoris : " + exception);
    }
}

/**
 * Cette méthode permet de désactiver un favoris faisant office de retirer à la liste des favoris
 */
module.exports.remove = function (id_client, id_produit, callback) {

    try { //Si ce bloc passe

        //Ici on créer le fitre afin de modifié cet élément qui est aux favoris
        /**
         * le filtre comporte deux compartiment dans ce cas 
         * On recupère l'id du produit
         * On recupère l'id du client
         * ensuite vient la variable update qui défini la propriété qu'on veut modifié 
         */
        var filter = {
                "id_client": id_client,
                "id_produit": id_produit,
                "flag": true
            },
            update = {
                "$set": {
                    "flag": false,
                    "date": new Date()
                }
            };


        //Ensuite on fait l'updateOne qui permet de modifié un élément, on lui passe le filtre et l'élément à modifié
        collection.value.updateOne(filter, update, function (err, result) {

            //S'il y a erreur on affiche un message 
            if (err) {
                callback(false, "Une erreur est suvernenue lors de la supression...");
            } else { //Sinon on affiche aussi un message de succès
                callback(true, "Le produit a été rétiré des favoris avec succès", null);
            }
        })

    } catch (exception) { //Si le le bloc try ne passe pas alors on lève une exception
        callback(false, "Une exception à été lévée lors de la suppression dans la liste des favoris : " + exception);
    }
}


module.exports.getAll = function (id_client, callback) {
    try {
        var filter = {
            "id_client": id_client,
            "flag": true
        };

        collection.value.find(filter).toArray(function (err, result) {
            if (err) {
                callback(false, "Une erreur est survénue lors de la récupération des favoris : " + err, null)
            } else {
                if (result.length > 0) {
                    //callback(true, "Les commandes de ce client ont été renvoyées avec succès", result)

                    var sortieFavoris = 0,
                        produit_dao = require("./produit_dao");


                    produit_dao.initialize(db_js);

                    for (var indexCommande = 0; indexCommande < result.length; indexCommande++) {

                        produit_dao.findOneByIdForGetAllDetailProduct(result[indexCommande], function (isFound, resultProduit) {

                            sortieFavoris++;

                            if (isFound) {
                                result.id_produit = resultProduit;
                            }

                            if (sortieFavoris == result.length) {
                                //callback(true, "Tous les produits dans les favoris de ce client ont été renvoyés avec succès", result);
                                var favoris_dao = require("./favoris_dao"),
                                    sortieListe = 0,
                                    listeProductWithFavoriteState = [];

                                favoris_dao.initialize(db_js);
                                for (let indexListe = 0; indexListe < result.length; indexListe++) {
                                    favoris_dao.isThisInFavorite(id_client, result[indexListe], function (isMatched, message, resultProductWithFavoriteState) {

                                        listeProductWithFavoriteState.push(resultProductWithFavoriteState);
                                        sortieListe++;

                                        if (sortieListe == result.length) {

                                            //On procède à la recherche de média
                                            var listWithMedia = [],
                                                sortieMedia = 0,
                                                mediaDao = require("./media_dao");
                                                mediaDao.initialize(db_js);

                                            for (let indexWithMedia = 0; indexWithMedia < listeProductWithFavoriteState.length; indexWithMedia++) {
                                               
                                                mediaDao.findOneByIdFromFavoris(listeProductWithFavoriteState[indexWithMedia], 
                                                function(isMediaMatched, messageMedia, reusltWithMedia) {
                                                    
                                                    sortieMedia++;
                                                    listWithMedia.push(reusltWithMedia);

                                                    if(sortieMedia == listeProductWithFavoriteState.length){
                                                        callback(true, "Tous les produits dans les favoris de ce client ont été renvoyés avec succès" , listWithMedia);
                                                    }
                                                })
                                            }
                                        }
                                    })
                                }

                            }
                        })

                    }

                } else {
                    callback(false, "La liste des favoris de ce client est vide", null)
                }
            }
        })
        
    } catch (exception) {
        callback(false, "Une exception est survénue lors de la récupération des favoris : " + exception, null)
    }
}

/**
 * Permettant de savoir si le produit est dans le favoris d'un user
 * @param {*} id_client 
 * @param {*} produit 
 * @param {*} callback 
 */
module.exports.isThisInFavorite = function (id_client, produit, callback) {

    produit.isThisInFavorite = false;
    try {
        if (id_client == null) {
            callback(false, "Aucun utilisateur en cours", produit)
        } else {
            filter = {
                "id_produit": produit.id_produit,
                "id_client": id_client,
                "flag": true
            };

            collection.value.find(filter).toArray(function (err, result) {
                if (err) {
                    callback(false, "Une erreur est survénue lors de la determination des favoris : " + err, produit)
                } else {

                    if (result.length > 0) {
                        produit.isThisInFavorite = true;
                        callback(true, "Ce produit est dans les favoris de ce client", produit)
                    } else {
                        callback(false, "Ce produit n'est pas dans les feavoris de ce client", produit)
                    }
                }
            })
        }

    } catch (exception) {
        callback(false, "Une exception a été lévée lors de la determination des favoris : " + exception, produit)
    }
}

/**
 * Permettant de savoir si le produit est dans le favoris d'un user
 * @param {*} id_client 
 * @param {*} produit 
 * @param {*} callback 
 */
module.exports.isThisInFavoriteFromOperation = function (id_client, content_product, callback) {

    
    try {
        if (id_client == null) {
            callback(false, "Aucun utilisateur en cours", produit)
        } else {
            filter = {
                "id_produit": content_product.infos_produit.id_produit,
                "id_client": id_client,
                "flag": true
            };

            collection.value.find(filter).toArray(function (err, result) {
                if (err) {
                    callback(false, "Une erreur est survénue lors de la determination des favoris : " + err, content_product)
                } else {

                    if (result.length > 0) {
                        content_product.infos_produit.isThisInFavorite = true;
                        callback(true, "Ce produit est dans les favoris de ce client", content_product)
                    } else {
                        callback(false, "Ce produit n'est pas dans les feavoris de ce client", content_product)
                    }
                }
            })
        }

    } catch (exception) {
        callback(false, "Une exception a été lévée lors de la determination des favoris : " + exception, content_product)
    }
}

/**
 * Permettant de savoir si le produit est dans le favoris d'un user
 * @param {*} id_client 
 * @param {*} produit 
 * @param {*} callback 
 */
module.exports.isThisInFavoriteForCommande = function (id_client, produit, callback) {

    produit.isThisInFavorite = false;
    try {
        if (id_client == null) {
            callback(false, "Aucun utilisateur en cours", produit)
        } else {
            var _id = require("mongodb").ObjectID(produit._id),
                filter = {
                    "id_produit": "" + _id,
                    "id_client": id_client,
                    "flag": true
                };

            collection.value.find(filter).toArray(function (err, result) {
                if (err) {
                    callback(false, "Une erreur est survénue lors de la determination des favoris : " + err, produit)
                } else {

                    if (result.length > 0) {
                        produit.isThisInFavorite = true;
                        callback(true, "Ce produit est dans les favoris de ce client", produit)
                    } else {
                        callback(false, "Ce produit n'est pas dans les feavoris de ce client", produit)
                    }
                }
            })
        }

    } catch (exception) {
        callback(false, "Une exception a été lévée lors de la determination des favoris : " + exception, produit)
    }
}

/**
 * La fonction qui permet de compter le nombre d'élément qui sont en favoris de ce client
 * @param {*} id_client L'identifiant du client
 * @param {Function} callback La fonction de retour
 */
module.exports.countFavoriteForUser = function (id_client, callback) {
    try {

        var client_dao = require("./client_dao");

        client_dao.initialize(db_js);
        client_dao.findOneById(id_client, function (isFound, message, resultClient) {

            if (isFound) {

                collection.value.aggregate([{
                        $match: {
                            "id_client": id_client,
                            "flag": true
                        }
                    },
                    {
                        $count: "countFavoris"
                    }

                ]).toArray(function (err, result) {
                    if (err) {
                        callback(false, "Une erreur est survénue lors du comptage de nombre de produit en favoris : " + err)
                    } else {
                        if (result.length > 0) {
                            callback(true, null, result[0].countFavoris)
                        } else {
                            callback(false, null, 0)
                        }
                    }
                })
            } else {
                callback(false, "Ce client n'existe pas", 0)
            }
        })


    } catch (exception) {
        callback(false, "Une exception a été lévée lors du comptage de nombre de produit en favoris : " + exception)

    }
}

/**
 * La fonction qui permet de synchroniser les données venant du serveur vers la bd de l'app
 * @param {*} id_client L'identifiant du client
 * @param {Function} callback La fonction de retour
 */
 module.exports.synchronizeToAppDb = function (id_client, last_date, callback) {
     
     try{

        var filter = {
            "id_client" : id_client,
            "$or" : [
                {
                    "date" : {
                        "$gt" : new Date(last_date)
                    }
                },
                {
                    "modified_date" : {
                        "$gt" : new Date(last_date)
                    }
                }
            ]
        };

        collection.value.find(filter).toArray(function(err, result) {
            
            if(err){
                callback(false, "Une erreur est survénue lors de la synchronisation des favoris vers l'app : "+err);
            }else{
                if(result){
                    callback(true, result)
                }else{
                    callback(false, "Aucun favoris antérieur trouvé");
                }
            }
        })

     }catch(exception){
        callback(false, "Une exception a été lévée lors de la synchronisation vers la bd de l'app : "+exception)
     }
 }


 /**
  * La fonction permettant de compter le nombre de mention favoris d'un produit
  * Elle est utilisée dans l'administration
  */
 module.exports.countFavorisByIdProduitForAdmin = function (id_produit, callback) {
     
    try{

        var filter = {
            "id_produit" : id_produit,
            "flag" : true
        }

        collection.value.count(filter, function(err, result) {
            
            if(err){
                callback(false, "Une exception a été lévée lors du comptage de mentions 'favoris' du produit <"+
                    id_produit+"> : "+exception);
            }else{

                callback(true, result)
            }
        })
    }catch(exception){
        callback(false, "Une exception a été lévée lors du comptage de mentions 'favoris' du produit <"+
            id_produit+"> : "+exception);
    }
 }

/**
 * La fonction permettant de compter le nombre de favoris liés à un produit.
 * Elle est utilisée dans la fonction "findListByIdSousCategorieForAdmin" de la DAO "produit"
 */
module.exports.countFavorisForProduitForAdmin = function (produit, callback) {
    
produit.sum_favoris = null;
produit.error_favoris = null;

try{

    var filter = {
        "id_produit" : ""+produit._id,
        "flag" : true
    }

    collection.value.count(filter, function(err, result) {
        
        if(err){

            produit.error_favoris = "Une exception a été lévée lors du comptage de mentions 'favoris' du produit <"+
                                    produit._id+"> : "+exception;

            callback(false, produit);
        }else{
            
            produit.sum_favoris = result;
            callback(true, produit)
        }
    })
}catch(exception){

    produit.error_favoris ="Une exception a été lévée lors du comptage de mentions 'favoris' du produit <"+
                            produit._id+"> : "+exception;

    callback(false, produit);
}
}