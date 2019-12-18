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

    collection.value = db_js.get().collection("extras");
}

/**
 * La fonction qui permet de créer un extra
 */
module.exports.create = function (new_extra, callback) {

    try {

        var client_model = require("./client_dao");

        //On initialise le modèle de données client
        client_model.initialize(db_js);

        client_model.findOneById(new_extra.id_auteur, function (isFound, messageFoundClient, resultFoundClient) {
            if (resultFoundClient) {
                collection.value.insert(new_extra, function (err, result) {

                    if (err) {
                        callback(false, "Une erreur est survenue lors de la création d'un extras : " + err);
                    } else {

                        if (result) {
                            //callback(true, result.ops[0]); 
                            var extra = result.ops[0];

                            //On exécute la fonction de recherche du client
                            client_model.getOneByIdFromExtra(extra,
                                function (isCustomerMatched, resultWithCustomer) {

                                    //On test le résultat
                                    if (isCustomerMatched) {

                                        if (resultWithCustomer.id_auteur != resultWithCustomer.id_dealer) {
                                            var notification_entity = require("./entities/notification_entity").Notification();
                                            notification_entity.id_objet = resultWithCustomer.id_produit_dealer;
                                            notification_entity.id_auteur = resultWithCustomer.id_auteur;
                                            notification_entity.type = "avis";

                                            //On recherche le recepteur de la notification
                                            var produit_dealer_dao = require("./produit_dealer_dao");
                                            produit_dealer_dao.initialize(db_js);
                                            produit_dealer_dao.findOneById(resultWithCustomer.id_produit_dealer, 
                                            function(is_prod_deal, message_prod_deal, result_prod_deal) {

                                                var notification_dao = require("./notification_dao");                                                    
                                                notification_dao.initialize(db_js);
                                                
                                                if(is_prod_deal){//Si le produit_deal est trouvé

                                                    notification_entity.id_recepteur = result_prod_deal.id_dealer;
                                                    notification_dao.createFromExtra(notification_entity, (isCreated, message_created, resultNoootif) => {
                                                        callback(true, resultWithCustomer);
                                                    })

                                                }else{//Sinon le produit deal n'est pas trouvé.

                                                    //On notifie le système de l'échec de la recherche portée sur l'entité prod_deal
                                                    var notification_sys_entity = require("./entities/notification_entity").Notification();

                                                    notification_sys_entity.date = new Date();
                                                    notification_sys_entity.flag = false;
                                                    notification_sys_entity.id_auteur = resultWithCustomer.id_auteur;
                                                    notification_sys_entity.id_objet = resultWithCustomer.id_produit_dealer;
                                                    notification_sys_entity.type = "alerte_systeme";
                                                    notification_dao.createForAdminSystem(notification_sys_entity, message_prod_deal);

                                                    callback(true, resultWithCustomer);
                                                }
                                            })

                                        } else {
                                            callback(true, resultWithCustomer);
                                        }

                                    } else {
                                        callback(false, "Cet utilisateur est fictif")
                                    }
                                })
                        } else {
                            callback(false, "Extra non créé")
                        }
                    }
                })
            } else {
                callback(false, "Aucun n'utilisateur porte cet identifiant")
            }
        })

    } catch (exception) {
        callback(false, "Une exception a été lévée lors de la création d'un extras : " + exception);
    }
}

/**
 * La fonction qui permet de trouver une liste extra suivant un produit spécifique
 */
module.exports.findListByIdProduitAndType = function (id_produit_dealer, type, callback) {

    try {

        //On déclare le filtre
        var filter = {
            "id_produit_dealer": id_produit_dealer,
            "type": type,
            "flag": true
        };

        //Sachant qu'il y a trois type d'extras : les vus et les favoris seront juste comptés
        //alors que les avis seront affichés pour lecture.
        //D'où on procède au test avant d'exécute la requête à la BD

        if (type == "avis") { //S'il s'agit des avis

            collection.value.aggregate([{
                "$match": filter
            },
            {
                "$sort": {
                    "date": 1
                }

            }
            ]).toArray(function (err, result) {

                if (err) {
                    callback(false, "Une erreur est survenue lors de la recherche listes d'extras 'avis' suivant un produit : " + err);
                } else {

                    if (result.length > 0) { //Si au moins un avis a été trouvé

                        //On doit rechercher les infos du client ayant émis cet avis
                        //Pour cela, on passe en boucle le résultat trouvé

                        var listeRetourWithClientInfo = [],
                            sortieAvis = 0,
                            client_model = require("./client_dao");

                        //On initialise le modèle de données client
                        client_model.initialize(db_js);

                        for (var indexAvis = 0; indexAvis < result.length; indexAvis++) {

                            //On exécute la fonction de recherche du client
                            client_model.getOneByIdFromExtra(result[indexAvis],
                                function (isCustomerMatched, resultWithCustomer) {

                                    //On incrémente la variable de sortie de la boucle
                                    sortieAvis++;

                                    //On test le résultat
                                    if (isCustomerMatched) {
                                        listeRetourWithClientInfo.push(resultWithCustomer);
                                    }

                                    //On test la condition de sortie de la boucle
                                    if (sortieAvis == result.length) {

                                        if (listeRetourWithClientInfo.length > 0) {
                                            callback(true, listeRetourWithClientInfo);
                                        } else {
                                            callback(false, "Aucun client n'a été trouvé lors de la recherche des avis");
                                        }
                                    }
                                })
                        }

                    } else { //Sinon aucun avis n'a été trouvé

                        callback(false, "Aucun extra 'avis' n'a été émit pour le produit en cours");
                    }

                }
            })

        } else { //Sinon il s'agit soit de vus ou des favoris

            collection.value.count(filter, function (err, result) {

                if (err) {
                    callback(false, "Une erreur est survenue lors de la recherche du nombre d'extra '" + type + "' : " + err);
                } else {
                    if (result) {
                        callback(true, result)
                    } else {
                        callback(false, "Aucun extra '" + type + "' n'a été trouvé pour ce produit ");
                    }
                }
            })
        }

    } catch (exception) {

        callback(false, "Une exception a été lévée lors de la recherche d'un extra suivant un produit : " + exception);
    }
}

/**
 * La fonction qui sert à vérifier l'état de lecture d'une annonce par rapport à un client
 * Elle est utilisée dans la fonction "getAllWhereFlagTrueByIdClient" de la DAO "annonce"
 */
module.exports.findOneTypeAnnonceByIdClient = function (id_client, annonce, callback) {

    try {

        var filter = {
            "flag": true,
            "id_annonce": "" + annonce._id,
            "id_client": id_client
        };

        collection.value.findOne(filter, function (err, result) {

            annonce.message = annonce.message.substr(0, 100);

            if (err) {
                annonce.deja_lu = false;
                callback(true, annonce)

            } else {

                if (result) {
                    annonce.deja_lu = true;
                    callback(true, annonce)
                } else {
                    annonce.deja_lu = false;
                    callback(true, annonce)
                }
            }
        })

    } catch (exception) {
        callback(false, "Une exception a été lévée lors de la recherche d'un extra suivant une annonce : " + exception);
    }
}

/**
 * La fonction servant de synchroniser les extras du serveur vers la bd locale de l'appli mobile
 * Elle est utilisée lorsque le client synchronise les données
 */
module.exports.synchroniseFromApiToDb = function (id_client, last_date, callback) {

    try {

        var filter = {
            "$or": [{
                "id_dealer": id_client
            },
            {
                "id_client": id_client
            }
            ],
            "date": {
                "$gt": new Date(last_date)
            }
        };

        collection.value.find(filter).toArray(function (err, result) {

            if (err) {
                callback(false, "Une erreur est survenue lors de la recherche des extras venant de la synchronisation : " + err);
            } else {
                if (result.length > 0) {
                    callback(true, result)
                } else {
                    callback(false, "Aucun extras trouvé lors de la synchronisation");
                }
            }
        })

    } catch (exception) {
        callback(false, "Une exception a été lévée lors de la synchronisation des données liées aux extras : " + exception);
    }
}

/**
 * Permet de trouver le nombre d'extra
 */
module.exports.countExtra = function (id_produit_dealer, typeExtra, callback) {
    try {

        var filter = {
            "id_produit_dealer": id_produit_dealer,
            "type": typeExtra,
            "flag": true
        };

        collection.value.aggregate([{
            "$match": filter
        },
        {
            "$count": "nbre"
        }
        ]).toArray(function (err, result) {
            if (err) {
                callback(false, "Une erreur est survenue lors du comptage des " + typeExtra + " : " + err)
            } else {

                if (result.length > 0) {
                    callback(true, result)
                } else {
                    callback(false, [{
                        "nbre": 0
                    }])
                }
            }
        })
    } catch (exception) {
        callback(false, "Une exception a été lévée lors du comptage : " + exception)
    }
}

/**
 * Fonction qui permet de compter le nombre des personnes ayant commenter un produit
 */
module.exports.getCountExtraByAuteur = function (id_produit_dealer, type, callback) {
    try {

        var filter = {
            "id_produit_dealer": id_produit_dealer,
            "type": type,
            "flag": true
        };

        collection.value.aggregate([{
            "$match": filter
        },
        {
            "$group": {
                "_id": {
                    "id_user": "$id_auteur"
                }
            }
        },
        {
            "$count": "nbre"
        }
        ]).toArray(function (err, result) {
            if (err) {
                callback(false, "Une erreur est survenue lors du comptage des " + typeExtra + " : " + err)
            } else {

                if (result.length > 0) {
                    callback(true, result)
                } else {
                    callback(false, [{
                        "nbre": 0
                    }])
                }
            }
        })
    } catch (exception) {
        callback(false, "Une exception a été lévée lors du comptage : " + exception)
    }
}

/**
 * Fonction qui permet d'inscrire la vue parmis les extras
 */
module.exports.createView = function (newView, callback) {
    try {

        var filter = {
            "id_client": newView.id_client,
            "id_produit_dealer": newView.id_produit_dealer,
            "type": "vue"
        };

        collection.value.findOne(filter, function (err, result) {
            if (err) {
                callback(false, "Une erreur est survenue lors de la recherche de l'extra Vue : " + err)
            } else {
                if (!result) {

                    collection.value.insertOne(newView, function (err, resultInsert) {
                        if (err) {
                            callback(false, "Une erreur est survenue lors de l'insert de la vue du produit : " + err)
                        } else {
                            if (resultInsert) {

                                //On recherche l'entité produit_dealer associé à l'extra pour des fins de notification
                                var produit_dealer_dao = require("./produit_dealer_dao");
                                produit_dealer_dao.initialize(db_js);

                                produit_dealer_dao.findOneById(resultInsert.ops[0].id_produit_dealer, 
                                function(is_prod_deal, message_prod_deal, result_prod_deal) {
                                    
                                    var notification_dao = require("./notification_dao");
                                    notification_dao.initialize(db_js);


                                    if(is_prod_deal){//Si l'entité produit dealer est trouvé

                                        var notification_entity = require("./entities/notification_entity").Notification();
                                        notification_entity.date = new Date();
                                        notification_entity.flag = false;
                                        notification_entity.type = "vue";
                                        notification_entity.id_auteur = newView.id_client;
                                        notification_entity.id_recepteur = result_prod_deal.id_dealer;
                                        notification_entity.id_objet = ""+result_prod_deal._id;

                                        notification_dao.createFromExtra(notification_entity,function(is_notified, message_notif, result_notif) {
                                            
                                        });
                                        callback(true, "Vue correctement enregistrée");

                                    }else{//Si non la recherche de l'entité produit dealer n'a pas abouti positivement

                                        //On notifie le système de l'échec de la recherche portée sur l'entité prod_deal
                                        var notification_sys_entity = require("./entities/notification_entity").Notification();

                                        notification_sys_entity.date = new Date();
                                        notification_sys_entity.flag = false;
                                        notification_sys_entity.id_auteur = newView.id_client;
                                        notification_sys_entity.id_objet = resultInsert.ops[0].id_produit_dealer;
                                        notification_sys_entity.type = "alerte_systeme";
                                        notification_dao.createForAdminSystem(notification_sys_entity, message_prod_deal);
                                        callback(true, "Vue non enregistrée, une notification au système a été émise");
                                    }
                                })

                            } else {
                                callback(false, "L'insertion de la vue n'a pas abouti")
                            }
                        }
                    })
                } else {
                    callback(false, "Le client a déja insérer cette vue")
                }
            }
        })

    } catch (exception) {
        callback(false, "Une exception a été lévée lors de l'insertion de la vue : " + exception)
    }
}

/**
 * Module permettant de compter le nombre de type d'un extra pour tous les produis d'un dealer
 * @param {String} id_dealer L'identifiant du dealer
 * @param {Function} callback La fonction de retour
 */
module.exports.countAllExtraByTypeForDealer = (id_dealer, type, callback) => {

    //On commence par lister les entités produit_dealer d'un dealer
    var liste_erreur = [],
        sortie_prod_deal = 0,
        countTotal = 0,
        produit_dealer_dao = require("./produit_dealer_dao");

    produit_dealer_dao.initialize(db_js);
    produit_dealer_dao.getAllByIdDealer(id_dealer, 
    function(is_prod_deal, message_prod_deal, result_prod_deal) {
        
        if(is_prod_deal){//Si au moins une entité produit_dealer est trouvée

            //Pour chaque produit_dealer on doit rechercher les vues correspondantes
            for (let index_prod_deal = 0; index_prod_deal < result_prod_deal.length; index_prod_deal++) {

                try{

                    var test = ""+result_prod_deal[index_prod_deal]._id;

                    collection.value.aggregate([{
                        "$match": {
                            "type": type,
                            "id_produit_dealer" : ""+result_prod_deal[index_prod_deal]._id,
                            "flag" : true
                        }
                        },
                        {
                            "$group": {
                                "_id": "$id_produit_dealer",
                                "count": {
                                    "$sum": 1
                                }
                            }
                        }
                    ]).toArray(function (err, result_inner_extra) {

                        if (err) {
                            liste_erreur.push("Une erreur est survenue lors du comptage du type <"+type+">  extras pour le dealer <"+id_dealer+">: " + err);

                        } else {

                            if (result_inner_extra.length > 0) {

                                for (let index = 0; index < result_inner_extra.length; index++) {
                                    countTotal = countTotal + result_inner_extra[index].count;
                                }

                            } else {
                                liste_erreur.push("Aucune extra du type <"+type+"> n'est liée à l'entié produit_dealer <"+result_prod_deal[sortie_prod_deal]._id+">")
                            }
                        }

                        sortie_prod_deal++;

                        if(sortie_prod_deal == result_prod_deal.length){

                            if(countTotal == 0){
                                liste_erreur.push("Aucun extra de type <"+type+"> n'a été enregistrée aux produits en vente par le dealer <"+id_dealer+">");
                            }
                            callback(true, liste_erreur, countTotal);
                        }
                    })

                }catch(exception){

                    liste_erreur.push("Une exception a été lévée lors du comptage du type <"+type+">  extras pour le dealer <"+id_dealer+">: " + exception);

                    sortie_prod_deal++;

                    if(sortie_prod_deal == result_prod_deal.length){

                        if(countTotal > 0){
                            objet_retour.sum = countTotal;
                        }else{
                            liste_erreur.push("Aucun extra du type <"+type+"> pour le dealer <"+id_dealer+"> n'a été enregistrée aux produits en vente par le dealer <"+id_dealer+">");
                        }
                        callback(true, liste_erreur, countTotal);
                    }
                }
            }
        }else{//Sinon aucune entité produit_dealer n'est trouvée.
            
            liste_erreur.push(message_prod_deal);
            callback(false, liste_erreur, countTotal);
        }
    })

}

/**
 * Module permettant l'évaluation d'un produit
 * @param {Objet} newEvaluation L'objet pour l'évaluation
 * @param {Function} callback La fonction de retour
 */
module.exports.createEvaluation = (newEvaluation, callback) => {
    try {
        var client_dao = require("./client_dao");
        client_dao.initialize(db_js);

        //On vérifie l'existance du client
        client_dao.findOneById(newEvaluation.id_client, (isFound, messageClient, resultClient) => {
            
            if (isFound) {//Si le client est trouvé

                //Ici on peut déjà declencher les alerts aux dealers
                var filter = {
                    "id_client": newEvaluation.id_client,
                    "id_produit_dealer": newEvaluation.id_produit_dealer,
                    "type": "star"
                };

                collection.value.aggregate([
                    {
                        "$match": filter
                    }
                ]).toArray((err, resultAggr) => {
                    if (err) {
                        callback(false, "Une erreur est survenue lors de la recherche de l'évaluation : " + err)
                    } else {
                        if (resultAggr.length > 0) {
                            var update = {
                                "$push": {
                                    "evaluation": {
                                        "note": newEvaluation.evaluation[0].note,
                                        "date": new Date()
                                    }
                                }
                            };

                            collection.value.updateOne(filter, update, (err, result) => {
                                if (err) {
                                    callback(false, "Une erreur est survenue lors de la mise à jour de la note : " + err)
                                } else {
                                    if (result) {
                                        callback(true, "L'evaluation a été mis à jour !", result)
                                    } else {
                                        callback(false, "La mise à jour a échoué")
                                    }
                                }
                            })
                        } else {

                            newEvaluation.type = "star";

                            collection.value.insertOne(newEvaluation, (err, result) => {
                                if (err) {
                                    callback(false, "Une erreur est survenue lors de l'insertion de l'évaluation : " + err)
                                } else {
                                    if (result) {
                                        
                                        //On notifie le dealer concerné
                                        var produit_dealer_dao = require("./produit_dealer_dao");
                                        produit_dealer_dao.initialize(db_js);
                                        produit_dealer_dao.findOneById(result.ops[0].id_produit_dealer, 
                                        function(is_prod_deal, message_prod_deal, result_prod_deal) {
                                            
                                            var notification_dao = require("./notification_dao");
                                            notification_dao.initialize(db_js);

                                            if(is_prod_deal){
                                                var notification_entity = require("./entities/notification_entity").Notification();

                                                notification_entity.date = new Date();
                                                notification_entity.flag = false;
                                                notification_entity.id_auteur = newEvaluation.id_client;
                                                notification_entity.id_objet = ""+result_prod_deal._id;
                                                notification_entity.id_recepteur = result_prod_deal.id_dealer;
                                                notification_entity.type = "evaluation";

                                                notification_dao.createFromExtra(notification_entity, 
                                                function(is_notified, notification_message, result_notfication) {
                                                    
                                                });

                                                callback(true, "L'évaluation a réussi avec succès", result.ops[0])

                                            }else{
                                                var notification_sys_entity = require("./entities/notification_entity").Notification();

                                                notification_sys_entity.date = new Date();
                                                notification_sys_entity.flag = false;
                                                notification_sys_entity.id_auteur = newEvaluation.id_client;
                                                notification_sys_entity.id_objet = newEvaluation.id_produit_dealer;
                                                notification_sys_entity.type = "alerte_systeme";
                                                notification_dao.createForAdminSystem(notification_sys_entity, notification_message);

                                                callback(true, "L'évaluation a réussi avec succès", result.ops[0])
                                            }
                                        }) 

                                    } else {

                                        notification_sys_entity.date = new Date();
                                        notification_sys_entity.flag = false;
                                        notification_sys_entity.id_auteur = newEvaluation.id_client;
                                        notification_sys_entity.id_objet = newEvaluation.id_produit_dealer;
                                        notification_sys_entity.type = "alerte_systeme";
                                        notification_dao.createForAdminSystem(notification_sys_entity, notification_message);

                                        callback(false, "L'insertion a échoué")
                                    }
                                }
                            })
                        }
                    }
                })

            } else {
                callback(false, messageClient)
            }
        })
    } catch (exception) {
        callback(false, "Une exception a été lévée lors de l'insertion de l'évaluation : " + exception)
    }
}

/**
 * Le module permettant de récupérer la dernière évaluation d'un client sur un produit
 * @param {Oject} objet L'objet qui comporte des élément de recupération de la note
 * @param {Function} callback La fonction de retour
*/
module.exports.getNoteEvaluationForClient = (objet, callback) => {
    try {
        var filter = {
            "id_client": objet.id_client,
            "id_produit_dealer": objet.id_produit_dealer,
            "type": "star"
        };

        collection.value.aggregate([
            {
                "$match": filter
            }
        ]).toArray((err, resultAggr) => {
            if (err) {
                callback(false, "Une erreur est survenue lors de la récuperation de la note du client sur ce produit: " + err)
            } else {
                if (resultAggr.length > 0) {
                    callback(true, "Voici la dernière note de sa part", { note: parseInt(resultAggr[0].evaluation[resultAggr[0].evaluation.length - 1].note, 10) })
                } else {
                    callback(false, "Aucune note de sa part", { note: 0 })
                }
            }
        })
    } catch (exception) {
        callback(false, "Une exception a été lévé lors de la récuperation de la note du client sur ce produit: " + exception)
    }
}

/**
 * La fonction permettant de calculer la moyenne des évaluation
 * @param {String} id_produit L'identifiant du produit
 * @param {Function} callback La fonction de retour
*/
module.exports.getAverageEvaluationForProduct = (id_produit_dealer, callback) => {
    try {
        collection.value.aggregate([
            {
                "$match": {
                    "id_produit_dealer": id_produit_dealer,
                    "type": "star"
                }
            },
            {
                "$project": {
                    "_id": 0,
                    "id_produit_dealer": 1,
                    "evaluation": {
                        "$arrayElemAt": ["$evaluation", -1]
                    }
                }
            },
            {
                "$group": {
                    "_id": "$id_produit_dealer",
                    "moyenne": {
                        "$avg": "$evaluation.note"
                    }
                }
            }
        ]).toArray((err, resultAggr) => {
            if (err) {
                callback(false, "Une erreur est survenue lors de l'établissement de la moyenne de l'évaluation : " +err)
            } else {
                if (resultAggr.length > 0) {
                    callback(true, "La moyenne a été établie", resultAggr[0])
                } else {
                    callback(false, "Moyenne nulle", { "_id": "id_produit_dealer", "moyenne": parseFloat(0) })
                }
            }
        })
    } catch (exception) {
        callback(false, "Une erreur est survenue lors de l'établissement de la moyenne de l'évaluation : " + err)        
    }
}