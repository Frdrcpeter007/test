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

    collection.value = db_js.get().collection("partenaire");
}

/**
 * Cette fonction permet de créer un partenaire avec son image et tout et tout
 * @param {*} new_partenaire Les informations du nouveau partenaaire
 * @param {*} image Les informations de l'image qui est lié au partenaire       
 * @param {Function} callback La fonction de retour
 */
module.exports.create = function (new_partenaire, image, callback) {
    try {


        collection.value.insertOne(new_partenaire, function (err, resultPartenaire) {
            if (err) {
                callback(false, "Une erreur est survénue de la création de ce partenaire : " + err)
            } else {
                if (resultPartenaire.ops[0]) {

                    var media = require("./entities/media_entity").Media(),
                        media_dao = require("./media_dao");

                    media.name = image.name;
                    media.size = image.size;
                    media.type = "profilPartenaire";
                    media.path = image.path;
                    media.date = new Date();

                    media_dao.initialize(db_js);
                    media_dao.createForUser(media, "" + resultPartenaire.ops[0]._id, "partenaire",
                        function (isMediaCreated, resultMedia) {

                            if (isMediaCreated) {

                                var filter = {
                                        "_id": resultPartenaire.ops[0]._id
                                    },
                                    update = {
                                        "$set": {
                                            "id_media": "" + resultMedia._id
                                        }
                                    };

                                collection.value.updateOne(filter, update, function (errUpdatePartner, resultUpdatePartner) {

                                    if (errUpdatePartner) {
                                        callback(false, "Une erreur est survenue lors de l'ajout de l'image au partenaire : " + errUpdatePartner);
                                    } else {
                                        callback(true, "Le partenaire a été créer avec succès", resultPartenaire.ops[0])
                                    }
                                })

                            } else {
                                callback(false, resultMedia, null);
                            }
                        })

                } else {
                    callback(false, "Le partenaire n'a pas été créer")
                }
            }
        })


    } catch (exception) {
        callback(false, "Une exception a été lévée lors de la création du partenaire : " + exception);
    }
}

/**
 * Cette fonction permet de récupérer tous les partenaires et leurs informations
 * @param {Function} callback La fonction de retour
 */
module.exports.getAllPartenaire = function (callback) {
    try {
        var filter = {
            "flag": true
        };

        /* collection.value.find(filter).toArray(function (err, result) {
            if (err) {
                callback(false, "Une erreur est survénue lors de la recherche des partenaire : " + err)
            } else {
                if (result.length > 0) {
                    var media_dao = require("./media_dao"),
                        sortiePartenaire = 0,
                        listPartenaire = [];
                    console.log(result)
                    media_dao.initialize(db_js);
                    for (let indexPartenaire = 0; indexPartenaire < result.length; indexPartenaire++) {
                        media_dao.findOneByIdFromPartenaire(result[indexPartenaire], function (isFound, messagePartenaire, resultWithMedia) {
                            sortiePartenaire++;

                            if (isFound) {
                                listPartenaire.push(resultWithMedia)
                            }

                            if (sortiePartenaire == result.length) {
                                callback(true, "Tous les partenaires ont été renvoyés avec succès", listPartenaire)
                            }
                        })
                    }

                } else {
                    callback(false, "Aucun partenaire en vue")
                }
            }
        }) */

        collection.value.aggregate([{
                "$match": filter
            },
            {
                "$project": {
                    "_id": 0,
                    "intitule": 1,
                    "description": 1,
                    "id_media": 1,
                    "site_web": 1
                }
            }
        ]).toArray(function (err, resultPartenaire) {
            if (err) {
                callback(false, "Une erreur est survénue lors de la recherche des partenaire : " + err)
            } else {
                if (resultPartenaire.length > 0) {
                    var media_dao = require("./media_dao"),
                        sortiePartenaire = 0,
                        listPartenaire = [];

                    media_dao.initialize(db_js);
                    for (let index = 0; index < resultPartenaire.length; index++) {

                        media_dao.findOneByIdFromPartenaire(resultPartenaire[index], function (isFound, messageMedia, resultWithMediaPartenaire) {
                            sortiePartenaire++;
                            listPartenaire.push(resultWithMediaPartenaire);

                            if (sortiePartenaire == resultPartenaire.length) {
                                callback(true, "Les partenaires sont renvoyés", listPartenaire)
                            }
                        })

                    }
                }

            }
        })
    } catch (exception) {
        callback(false, "Une exception a été lévée lors de la recherche de tous les partenaires : " + exception)
    }
}

/**
 * La fonction qui permet de mettre à jour les informations du partenaire
 * @param {*} partenaire Le partenaire en question
 * @param {Function} callback La fonction de retour
 */
module.exports.updateInfos = function (partenaire, callback) {
    try {
        var _id = require("mongodb").ObjectId(partenaire.id),
            filter = {
                "_id": _id
            };

        collection.value.findOne(filter, function (err, resultFound) {
            if (err) {
                callback(false, "Une erreur est survénue lors de la recherche de ce partenaire : " + err)
            } else {
                if (resultFound) {
                    if (partenaire.image.path) {

                        var media = require("./entities/media_entity").Media(),
                            media_dao = require("./media_dao");

                        media.name = partenaire.image.name;
                        media.size = partenaire.image.size;
                        media.type = "Profile partenaire";
                        media.path = partenaire.image.path ? partenaire.image.path : '/images/defaults_partenaire.jpg';
                        media.date = new Date();

                        media_dao.initialize(db_js);
                        media_dao.createForUser(media, partenaire.id, "partenaire", function (isCreated, resultMedia) {
                            if (isCreated) {

                                var update = {
                                    "$set": {
                                        "intitule": !partenaire.intitule ? resultFound.intitule : partenaire.intitule,
                                        "description": !partenaire.description ? resultFound.description : partenaire.description,
                                        "site_web": !partenaire.site_web ? resultFound.site_web : partenaire.site_web,
                                        "id_media": "" + resultMedia._id
                                    }
                                };

                                collection.value.updateOne(filter, update, function (err, result) {
                                    if (err) {
                                        callback(false, "Une erreur est survénue lors de la mise à jour du partenaire : " + err)
                                    } else {
                                        if (result) {
                                            callback(true, "Les informations de ce partenaire à été mise à jour avec succès", result)
                                        } else {
                                            callback(false, "Les informations n'ont pas été moduifié")
                                        }
                                    }
                                })
                            } else {
                                callback(false, "Le partenaire n'a pas été mis à jour suite à la mauvaise création du media")
                            }
                        })

                    } else {
                        var update = {
                            "$set": {
                                "intitule": !partenaire.intitule ? resultFound.intitule : partenaire.intitule,
                                "description": !partenaire.description ? resultFound.description : partenaire.description,
                                "site_web": !partenaire.site_web ? resultFound.site_web : partenaire.site_web
                            }
                        };

                        collection.value.updateOne(filter, update, function (err, result) {
                            if (err) {
                                callback(false, "Une erreur est survénue lors de la mise à jour du partenaire : " + err)
                            } else {
                                if (result) {
                                    callback(true, "Les informations de ce partenaire à été mise à jour avec succès", result)
                                } else {
                                    callback(false, "Les informations n'ont pas été moduifié")
                                }
                            }
                        })
                    }

                } else {
                    callback(false, "Ce partenaire n'existe pas !!!")
                }
            }
        })
    } catch (exception) {
        callback(false, "Une exception a été lévée lors de la mise à jour des infos du partenaire : " + exception)
    }
}

module.exports.setFlag = function (partenaire, callback) {
    try {
        var _id = require("mongodb").ObjectId(partenaire.id),
            filter = {
                "_id": _id
            };

        collection.value.findOne(filter, function (err, resultPartenaire) {
            if (err) {
                callback(false, "Une erreur est suvénue lors de la recheche du partenaire : " + err)
            } else {
                if (resultPartenaire) {
                    var update = {
                        "$set": {
                            "flag": resultPartenaire.flag == true ? false : true
                        }
                    };

                    collection.value.updateOne(filter, update, function (err, result) {
                        if (err) {
                            callback(false, "Une erreur est survénue lors de la définition du nouveau flag : " + err)
                        } else {
                            if (result) {
                                callback(true, "La nouvelle valeur de flag a été mise à jour", result)
                            } else {
                                callback(false, "La définition du nouveau flag n'a pas été faite")
                            }
                        }
                    })
                } else {
                    callback(false, "Aucun partenaire n'a été trouvé")
                }
            }
        })
    } catch (exception) {
        callback(false, "Une exception a été lévée lors de la définition du nouveau flag : " + exception)
    }
}

module.exports.findOneById = function (id_partenaire, callback) {

    try {

        var _id = require("mongodb").ObjectID(id_partenaire),
            filter = {
                "_id": _id
            };

        collection.value.findOne(filter, function (err, result) {

            if (err) {
                callback(false, "Une erreur est survenue lors de la recherche du partenaire <" + id_partenaire + "> : " + err);
            } else {
                if (result) {
                    callback(true, result)
                } else {
                    callback(false, "Aucun partenaire ne correspond à l'identifiant <" + id_partenaire + ">")
                }
            }
        })
    } catch (exception) {
        callback(false, "Une exception a été lévée lors de la recherche du partenaire <" + id_partenaire + "> : " + exception);
    }
}