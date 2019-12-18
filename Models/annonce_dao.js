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

    collection.value = db_js.get().collection("annonce");
}

/**
 * La fonction qui permet de créer une annonce
 */
module.exports.create = function (newAnnouncement, callback) {

    try {

        collection.value.insert(newAnnouncement, function (err, result) {

            if (err) {
                callback(false, "Une erreur est survenue lors de la création d'une annonce : " + err);
            } else {
                callback(true, result.ops[0]);
            }
        })
    } catch (exception) {
        callback(false, "Une exception a été lévée lors de la création d'une annonce : " + exception);
    }
}

/**
 * La fonction qui permet de  rechercher une annonce suivant son identifiant
 */
module.exports.findOneById = function (id_annonce, callback) {

    try {

        var _id = require("mongodb").ObjectID(id_annonce),
            filter = {
                "_id": _id
            };

        collection.value.findOne(filter, function (err, result) {

            if (err) {
                callback(false, "Une erreur est survenue lors de la recherche de l'annonce '" + id_annonce + "' : " + err)
            } else {

                if (result) {
                    callback(true, result)
                } else {
                    callback(false, "Aucune annonce ne correspond à l'identifiant : " + id_annonce)
                }
            }
        })
    } catch (exception) {
        callback(false, "Une exception a été lévée lors de la recherche de l'annonce '" + id_annonce + "' : " + exception)
    }
}

/**
 * La fonction qui permet de renvoyer la liste de toutes les annonces
 */
module.exports.getAll = function (callback) {

    try {

        collection.value.find({}).toArray(function (err, result) {

            if (err) {
                callback(false, "Une erreur est survenue lors de la recherche de la liste de toutes les annonces : " + err);
            } else {

                if (result.length > 0) {
                    callback(true, result)
                } else {
                    callback(false, "Aucune annonce n'a été publiée")
                }
            }
        })

    } catch (exception) {
        callback(false, "Une exception est survenue lors de la recherche de la liste de toutes les annonces : " + exception);
    }
}

/**
 * La fonction qui permet de renvoyer la liste d'annonces publiées
 */
module.exports.getAllWhereFlagTrue = function (callback) {

    try {

        var filter = { "flag": true };

        collection.value.find(filter).toArray(function (err, result) {

            if (err) {
                callback(false, "Une erreur est survenue lors de la recherche de la liste d'annonces publiées : " + err);
            } else {

                if (result.length > 0) {
                    callback(true, result)
                } else {
                    callback(false, "Aucune annonce n'a été publiée")
                }
            }
        })

    } catch (exception) {
        callback(false, "Une exception est survenue lors de la recherche de la liste d'annonces publiées : " + exception);
    }
}

module.exports.getAllWhereFlagTrueByIdClient = function (id_client, callback) {

    try {

        var filter = { "flag": true };

        collection.value.find(filter).toArray(function (err, resultAnnonce) {

            if (err) {
                callback(false, "Une erreur est survenue lors de la recherche de la liste d'annonces publiées : " + err);
            } else {

                if (resultAnnonce.length > 0) {

                    var extra_model = require("./extra_dao"),
                        sortieExtra = 0,
                        listeSortieWithExtraState = [];

                    extra_model.initialize(db_js)

                    //On doit à présent vérifier l'état de lecture de chaque annonce pour le client
                    //Pour ce faire, on passe en boucle résultat
                    for (let indexAnnonce = 0; indexAnnonce < resultAnnonce.length; indexAnnonce++) {

                        extra_model.findOneTypeAnnonceByIdClient(id_client, resultAnnonce[indexAnnonce],
                            function (isChecked, resultWithExtraState) {

                                //On incrémente la variable de sortie
                                sortieExtra++;

                                if (isChecked) {
                                    listeSortieWithExtraState.push(resultWithExtraState)
                                }

                                //Puis on vérifie la condition de sortie
                                if (sortieExtra == resultAnnonce.length) {
                                    callback(true, listeSortieWithExtraState)
                                }
                            })
                    }
                } else {
                    callback(false, "Aucune annonce n'a été publiée")
                }
            }
        })

    } catch (exception) {
        callback(false, "Une exception est survenue lors de la recherche de la liste d'annonces publiées : " + exception);
    }
}

/**
 * Module permettant à un dealer de lancer une annonce 
 * @param {Object} newAnnouncementByDealer L'annonce lancée par le dealer
 * @param {Function} callback La fonction de retour
 */
module.exports.createForDealer = (newAnnouncementByDealer, callback) => {
    try {
        var dealer_dao = require("./dealer_dao");

        dealer_dao.initialize(db_js);
        dealer_dao.findOneByIdClient(newAnnouncementByDealer.id_dealer, (isFound, messageDealer, resultDealer) => {
            if (isFound) {
                newAnnouncementByDealer.flag = true;
                newAnnouncementByDealer.date = new Date();

                collection.value.insertOne(newAnnouncementByDealer, (err, result) => {
                    if (err) {
                        callback(false, "Une erreur est survenue lors de la creation de l'annonce par le dealer : " + err)
                    } else {
                        if (result) {
                            callback(true, "L'annonce a été publié par le dealer", result.ops[0])
                        } else {
                            callback(false, "Annonce non-publié")
                        }
                    }
                })
            } else {
                callback(false, messageDealer)
            }
        })
    } catch (exception) {
        callback(false, "Une exception a été lévée lors de la creation de l'annonce par le dealer : " + exception)
    }
}

/**
 * Module permettant la récupération des annonces d'un dealer
 * @param {Object} dealer L'objet du dealer
 * @param {Function} callback La fonction de retour
*/
module.exports.getAllWhereDealerSending = (dealer, callback) => {

    try {
        var dealer_dao = require("./dealer_dao");

        dealer_dao.initialize(db_js);
        dealer_dao.findOneByIdClient(dealer.id_client, (isFound, messageDealer, resultDealer) => {
            if (isFound) {
                collection.value.aggregate([
                    {
                        "$match": {
                            "id_dealer": { "$exists": 1 }
                        }
                    },
                    {
                        "$sort": {
                            "date": -1
                        }
                    }
                ]).toArray((err, resultAggr) => {
                    if (err) {
                        callback(false, "Une erreur est survenue lors de la récupération des annonces lancé par ce dealer : " + err)
                    } else {
                        if (resultAggr.length > 0) {
                            var objetFinal = {
                                "info_dealer": null,
                                "annonces": null
                            };

                            var client_dao = require("./client_dao");

                            client_dao.initialize(db_js);

                            client_dao.getOneByIdFromDealer(dealer, (isGet, resultClient) => {
                                if (isGet) {
                                    objetFinal.info_dealer = resultClient;

                                    var message_dao = require("./message_dao"),
                                        sortieAnnonce = 0,
                                        announceOut = [];

                                    message_dao.initialize(db_js);

                                    for (let index = 0; index < resultAggr.length; index++) {
                                        message_dao.getAllMessageForNotification(resultAggr[index], (isGet, message, result) => {
                                            sortieAnnonce++;
                                            announceOut.push(result)

                                            if (sortieAnnonce == resultAggr.length) {
                                                objetFinal.annonces = announceOut;
                                                callback(true, "Les annonces ont été renvoyé", objetFinal)
                                            }
                                        })
                                    }

                                } else {
                                    callback(false, resultClient)
                                }
                            })
                        } else {
                            callback(false, "Aucune annonce n'a été lancé")
                        }
                    }
                })
            } else {
                callback(false, messageDealer)
            }
        })

    } catch (exception) {
        callback(false, "Une exception a été lévée lors de la récupération des annonces lancé par ce dealer : " + exception)
    }
}

module.exports.findOneByObject = (Objet, callback) => {
    try {
        Objet.id_dealer = null;

        collection.value.aggregate([
            {
                "$match": {
                    "_id": require("mongodb").ObjectId(Objet.id_annonce)
                }
            }
        ]).toArray((err, resultAggr) => {
            if (err) {
                callback(false, "Une erreur est survenue lors de la recherche de l'annonce : " + err)
            } else {
                if (resultAggr.length > 0) {
                    Objet.id_dealer = resultAggr[0].id_dealer;

                    var client_dao = require("./client_dao");

                    client_dao.initialize(db_js);
                    client_dao.getOneByIdFromDealer(Objet, (isGet, result) => {

                        if (isGet) {
                            callback(true, "Notiif renvoyée", result)
                        } else {
                            callback(false, "Rien à été renvoyé")
                        }
                    })
                } else {
                    callback(false, "Aucun notif à l'id : " + Objet.id_annonce)
                }
            }
        })
    } catch (exception) {
        callback(false, "Une exception a été lévée lors de la recherche de l'annonce : " + exception)
    }
}

module.exports.getAllAnnounceSendingByAdmin = (callback) => {
    try {
        collection.value.aggregate([
            {
                "$match": {
                    "id_agent": {"$exists": 1},
                    "flag": true
                }
            },
            {
                "$project": {
                    "_id": 1,
                    "titre": 1,
                    "message": 1,
                    "date_modification": 1,
                    "id_agent": 1
                }
            },
            {
                "$sort": {"date_modification" : 1}
            },
            {
                "$limit": 5
            }
        ]).toArray((err, resultAggr) => {
            if (err) {
                callback(false, "Une erreur est survenue lors de la récupération des annonces passé par e-Bantu admin : " +err)
            } else {
                if (resultAggr.length > 0) {
                    var sortieAnnonce = 0,
                        announceOut = [],
                        agent_dao = require("./agent_dao");

                    agent_dao.initialize(db_js);

                    for (let index = 0; index < resultAggr.length; index++) {
                        agent_dao.getAgencyForAdminAgent(resultAggr[index], (isGet, messageAgence, resultWithAgency) => {
                            sortieAnnonce++;
                            if (isGet) {
                                announceOut.push(resultWithAgency);
                            }

                            if (sortieAnnonce == resultAggr.length) {
                                callback(true, "Les annonces propres à e-Bantu", announceOut)
                            }
                        })
                    }
                } else {
                    callback(false, "Aucune annonce")
                }
            }
        })
    } catch (exception) {
        callback(false, "Une exception a été lévée lors de la récupération des annonces passé par e-Bantu admin : " + exception)        
    }
}