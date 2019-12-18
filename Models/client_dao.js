//------------Définition des variables globales
//cette variable est destinée à contenir une référence à
//l'objet collection qui dérivera de "db_js"
var db_js = require("./db"),
    nodeMailer = require("nodemailer"),
    bcrypt = require("bcrypt"),
    testyfile = require("testyfile"),
    fs = require("fs");

var collection = {
    value: null
}

/**
 * Ici on initialise la variable "collection" en lui passant
 * la valeur provenant de "db_js". NB: cette fonction sera accessible en dehors de ce fichier
 */
module.exports.initialize = function (db_js) {

    collection.value = db_js.get().collection("client");
}

/**
 * La fonction qui permet de créer un client
 */
module.exports.create = function (new_client, callback) {

    try { //Si ce bloc passe


        //On commence par crypter le mot de passe        
        var valeur_pwd = "za" + new_client.inscription.password[0] + "eb";

        bcrypt.hash(valeur_pwd, 10, function (errHash, hashePwd) {

            if (errHash) { //Si une erreure survient lors du hashage du mot de passe
                callback(false, "Une erreur est survenue lors du hashage du mot de passe : " + errHash, null);
            } else { //Si non le mot de passe a été bien hashé

                new_client.inscription.password[0] = hashePwd;

                //On appele la méthode insertOne (une methode propre à mongoDB) de notre collection qui doit prendre la structure de l'entité
                collection.value.insertOne(new_client, function (err, result) {

                    //On test s'il y a erreur
                    if (err) {
                        callback(false, "Une erreur est survénue lors de la création du client", "" + err);
                    } else { //S'il n'y a pas erreur

                        //On vérifie s'il y a des résultat renvoyé
                        if (result) {

                            var loginDao = require("./log_dao");
                            loginDao.initialize(db_js);
                            loginDao.createLogin(result.ops[0], function (isCreated, messageLogin, resultLogin) {

                                var codeDao = require("./code_dao");

                                codeDao.initialize(db_js);
                                codeDao.create(resultLogin, (isGenerate, message, result) => {
                                    if (isGenerate) {

                                        if (/email|e-mail|mail/i.test(result.inscription.username[0].type)) {
                                            sendCode(result, (isSend, messageSend, resultSend) => {
                                                if (isSend) {
                                                    callback(true, "Le code a été énvoyé avec succès", resultSend)
                                                } else {
                                                    callback(true, "Le code n'a pas été envoyé, demandez un nouveau code", resultSend)
                                                }
                                            })
                                        } else {
                                            callback(true, "Le code a été générer", result)
                                        }
                                    } else {
                                        callback(true, "Le code n'a pas été générér, demandez un nouveau", result)
                                    }
                                })
                            });

                        } else { //Si non l'etat sera false et on envoi un message
                            callback(false, "Désolé, client non enregistrer", null)
                        }
                    }
                })

            }
        })

    } catch (exception) { //Si ce bloc ne passe pas on lève une exception
        callback(false, "Une exception a été lévée lors de la création du client : " + exception);
    }
}

/**
 * Cette fonction permet d'envoyer un mail avec un code de confirmation
 * @param {Object} account Les information de l'utilisateur
 * @param {Function} callback La fonction de retour
 */
function sendCode(account, callback) {
    
    const output = 'Votre code de confirmation : <b style="color: #ff4500; font-family: Century Gothic; font-size: 1.4em">' + account.code + '</b><br>e-Bantu, votre parcours commence maintenant',
        auth = require("./includes/init").Auth();

    let transporter = nodeMailer.createTransport({
        host: "smtp.live.com",
        port: 587,
        secure: false,
        auth: {
            user: auth.email,
            pass: auth.password
        },
        tls: {
            rejectUnauthorized: false
        }
    });

    let mailOptions = {
        from: '"e-Bantu / Le côté magique du commerce" <' + auth.email + '>',
        to: account.inscription.username[0].valeur,
        subject: "Activation de compte",
        html: output
    };

    transporter.sendMail(mailOptions, (error, info) => {

        if (error) {
            console.log("Erreur d'envoi de mail");
            console.log(error);
            callback(false, "Code de confirmation non-envoyé : " + error, account)
        } else {
            console.log("Mail envoyé avec succès");
            callback(true, "Code envoyé avec succès", account)
        }

        transporter.close();

    })
}

/**
 * Module permettant d'activer son compte
 */
module.exports.activateAccount = function (id_client, code, callback) {
    try {
        var codeDao = require("./code_dao");

        codeDao.initialize(db_js);
        codeDao.findCodeForUser(id_client, function (isFound, messageCode, resultCode) {

            if (isFound) {
                var codeFound = resultCode.code;
                if (code == codeFound) {
                    var filter = {
                        "_id": require("mongodb").ObjectId(id_client)
                    },
                        update = {
                            "$set": {
                                "flag": true
                            }
                        };

                    collection.value.updateOne(filter, update, function (err, result) {
                        if (err) {
                            callback(false, "Une erreur est survenue lors de l'activation du compte : " + err)
                        } else {
                            if (result) {
                                callback(true, "Compte activer avec succès", result)
                            } else {
                                callback(false, "Echec d'activation du compte")
                            }
                        }
                    })
                } else {
                    callback(false, "Le code entrer n'est pas correct")
                }
            } else {
                callback(false, messageCode)
            }
        })
    } catch (exception) {
        callback(false, "Une exception a été lévée lors de l'activation du compte : " + exception)
    }
}

/**
 * Module permettant la demande d'un nouveau code d'activation
 */
module.exports.requestNewCode = function (id_client, callback) {
    try {
        var filter = {
            "_id": require("mongodb").ObjectId(id_client),
            "$or": [
                { "flag": { "$exists": 0 } },
                { "flag": false }
            ]
        };

        collection.value.aggregate([{
            "$match": filter
        }]).toArray(function (err, resultAggr) {
            if (err) {
                callback(false, "Une erreur est survenue lors de la demande d'un nouveau code : " + err)
            } else {
                if (resultAggr.length > 0) {
                    var codeDao = require("./code_dao");

                    codeDao.initialize(db_js);
                    codeDao.disableAllCodeForUser(resultAggr[0], function (isDisable, messageCode, resultUser) {
                        if (isDisable) {
                            codeDao.create(resultUser, function (isGenerated, messageCode, resultCode) {
                                if (isGenerated) {
                                    sendCode(resultCode, function (isSend, messageSend, resultSend) {
                                        if (isSend) {
                                            callback(true, "Code d'activation bien générer et code d'activation envoyé à son email", resultSend)
                                        } else {
                                            callback(true, "Code d'activation bien générer et code d'activation non-envoyé, demander un nouveau code", resultSend)
                                        }
                                    })
                                } else {
                                    callback(true, "Code d'activation non-générer, demandez un code", resultCode)
                                }
                            })
                        } else {
                            callback(false, "Réessayer s'il vous plaît")
                        }
                    })
                } else {
                    callback(false, "Aucun utilisateur n'a été trouvé, ou son compte est déjà activer")
                }
            }
        })
    } catch (exception) {
        callback(false, "Une exception a été lévée lors de la demande d'un nouveau code : " + exception)
    }
}

/**
 * La fonction permet de trouvé un client via son indentifiant
 * @param {*} id L'identifiant du client ou du dealer rechercher
 * @param {Function} callback La fonction callback
 */
module.exports.findOneById = function (id, callback) {
    try {
        var _id = require("mongodb").ObjectId(id),
            filter = {
                "_id": _id
            };

        collection.value.findOne(filter, function (err, result) {
            if (err) {
                callback(false, "une erreur est survenue lors de la recherche du client : " + err)
            } else {
                if (result) {
                    callback(true, "Client trouvé avec succès", result)
                } else {
                    callback(false, "Aucun client ne possède l'identifiant " + id)
                }
            }
        })
    } catch (exception) {
        callback(false, "une erreur a été lévée lors de la recherche du client : " + exception)
    }
}

/**
 * La fonction permettant de rechercher un client suivant ses appelations
 * Elle est utilisée dans l'administration ainsi que dans la recherche de client ayant passés de commande
 */
module.exports.searchByNames = function (valeur_recherche, callback) {

    try {
        var filter = {
            "$or":
                [
                    { "prenom": new RegExp(valeur_recherche, "i") },
                    { "nom": new RegExp(valeur_recherche, "i") }
                ]
        },
            project = { "nom": 1, "prenom": 1, "inscription.username": 1 };

        // new RegExp('^'+valeur_recherche+'$', "i")
        collection.value.find(filter).project(project).toArray(function (err, result) {

            if (err) {
                callback(false, "Une erreur est survenue lors de la recherche d'un client par ses appelations : " + err);
            } else {
                if (result.length > 0) {
                    callback(true, result)
                } else {
                    callback(false, "Aucun client n'a été trouvé");
                }
            }
        })

    } catch (exception) {
        callback(false, "Une exception a été lévée lors de la recherche d'un client par ses appelations : " + exception);
    }

}

/**
 * La fonction qui permet de chercher un client ayant émit un avis sur un produit
 */
module.exports.getOneByIdFromExtra = function (extra, callback) {

    try {

        var _id = require("mongodb").ObjectID(extra.id_auteur),
            filter = {
                "_id": _id
            };

        collection.value.findOne(filter, function (err, result) {

            if (err) {
                callback(false, "Une erreur est survenue lors de la recherche d'un client ayant émit un avis : " + err);
            } else {

                if (result) { //Si le client a été trouvé

                    //On recupère les infos dont nous avons besoin
                    var info_client = {
                        "id_client": "" + result._id,
                        "nom": result.nom,
                        "prenom": result.prenom,
                        "id_media": result.inscription.lien_profil
                    };

                    //On rattache les infos du client à l'extra
                    extra.info_client = info_client;

                    var media_dao = require("./media_dao");

                    media_dao.initialize(db_js);
                    media_dao.findOneByIdFromExtra(extra, function (isFound, resultWithExtra) {

                        callback(true, resultWithExtra)
                    })

                } else {
                    callback(false, "Aucun client ne correspond à l'identifiant : " + extra.id_auteur);
                }
            }
        })
    } catch (exception) {
        callback(false, "Une exception a été lévée lors de la recherche d'un client ayant émit un avis : " + exception);
    }
}

/**
 * La fonction permetant de retrouver les details d'un dealer
 * Elle est utilisée dans la fonction "getAllForAdmin" de la dao "dealer"
 */
module.exports.getOneByIdFromDealer = function (dealer, callback) {

    try {

        var _id = require("mongodb").ObjectID(dealer.id_client),
            filter = {
                "_id": _id
            },
            project = { "nom": 1, "prenom": 1, "inscription.username": 1 };

        collection.value.findOne(filter, project, function (err, result) {

            if (err) {
                callback(false, "Une erreur est survenue lors de la recherche du client lié au dealer : " + err, dealer);
            } else {
                if (result) {
                    dealer.prenom = result.prenom;
                    dealer.nom = result.nom;
                    dealer.lien_profil = result.inscription.lien_profil;
                    dealer.type_client = result.type;

                    var media_dao = require("./media_dao");
                    media_dao.initialize(db_js);
                    media_dao.findOneByIdfromDealer(dealer, function (isMedia, messageMedia, resultWithMedia) {

                        callback(true, null, resultWithMedia);
                    })

                } else {
                    callback(false, "Aucun client ne correspond à l'identifiant passé", dealer)
                }
            }
        })

    } catch (exception) {

        callback(false, "Une exception a été lévée lors de la recherche du client lié au dealer : " + exception);
    }
}

/**
 * La fonction qui permet de vérifier le numéro de téléphone ou l'email de l'utilisateur
 * Lors de la création du compte
 */
module.exports.checkPhoneOrEmailWhenRegister = function (valeur_entree, callback) {

    collection.value.aggregate([{
        "$match": {
            "inscription.username": {
                $elemMatch: {
                    "etat": true,
                    "valeur": valeur_entree
                }
            }
        }
    },
    {
        "$unwind": "$inscription.username"
    },
    {
        "$match": {
            "inscription.username.valeur": valeur_entree,
            "inscription.username.etat": true,
        }
    },
    {
        "$project": {
            "inscription.username": 1
        }
    }
    ]).toArray(function (err, result) {

        if (err) {
            callback(false, "Une erreur est survenue lors de la vérification du username : " + err);
        } else {
            if (result.length > 0) {
                callback(true, "Le username a été trouvé et est utilisé par un autre client");
            } else {
                callback(false, "Aucun username ne correspond à la valeur entrée");
            }
        }
    })
}

/**
 * La fonction qui permet de vérifier le numéro de téléphone ou l'email de l'utilisateur
 * Lors de la récupération de son compte
 */
module.exports.checkPhoneOrEmail = function (valeur_entree, callback) {

    try {

        collection.value.aggregate([{
            "$match": {
                "inscription.username": {
                    $elemMatch: {
                        "etat": true,
                        "valeur": valeur_entree
                    }
                }
            }
        },
        {
            "$unwind": "$inscription.username"
        },
        {
            "$match": {
                "inscription.username.valeur": valeur_entree,
                "inscription.username.etat": true,
            }
        },
        {
            "$project": {
                "inscription.username": 1
            }
        }
        ]).toArray(function (err, resultCompteClient) {

            if (err) { //Si une erreur survenait lors de la recherche
                callback(false, "Une erreur est survenue lors de la recherche de l'email ou du téléphone du client : " + err);
            } else { //Si non aucune erreur n'est survenue

                if (resultCompteClient.length > 0) { //Si au moins un compte correspond aux critères de recherche

                    //On déclare l'entité de recupération et son modèle
                    var newRecuperation = require("./entities/recuperation_entity").Recuperation(),
                        recuperation_model = require("./recuperation_dao");

                    //On affecte des valeurs à ses propriétés
                    newRecuperation.username = resultCompteClient[0].inscription.username.valeur;
                    newRecuperation.date = new Date();
                    newRecuperation.etat = true;
                    newRecuperation.code_validation = recuperation_model.genererCode();

                    //On initialise le modèle de données
                    recuperation_model.initialize(db_js);

                    //On exécute la fonction de création du code de validation 
                    recuperation_model.create(newRecuperation, function (isCodeCreated, resultCode) {

                        if (isCodeCreated) { //Si le code est bien créé

                            //On recupère les infos issues de la création du code de validation
                            var valeurUsername = resultCompteClient[0].inscription.username.valeur,
                                typeUsername = resultCompteClient[0].inscription.username.valeur,
                                code_validation = resultCode.code_validation;

                            //en fonction du type de la valeur du username, 
                            if (typeUsername == "email") { //On envois un email au client avec le code de validation
                                SendEmail(valeurUsername, code_validation);
                            } else { //Sinon on lui envoi un sms avec le code de validation

                            }

                            var objetRetour = {
                                'id_client': "" + resultCompteClient[0]._id,
                                'resultat_code': resultCode
                            }

                            callback(true, objetRetour);

                        } else { //Si non un problème est survenu et le code n'a pas été créé
                            callback(false, resultCode);
                        }
                    })

                } else { //Si non aucun compte n'a été trouvé lors de la recherche
                    callback(false, "Aucune donnée n'a été trouvée lors de la recherche de l'email ou du téléphone du client");
                }
            }
        })
    } catch (exception) {
        callback(false, "Une exception a été lévée lors de la vérification phone/email : " + exception);
    }
}

//La fonction qui permet d'envoyer le code de validation par email au client
//pour récuperer son compte
function SendEmail(email_user, code_validation) {

    nodeMailer.createTestAccount((err, account) => {

        let transporter = nodeMailer.createTransport({
            host: "smtp.live.com",
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: 'frdrcpeter@hotmail.com', // generated ethereal user
                pass: 'tubemate123' // generated ethereal password
            }
        });

        // setup email data with unicode symbols
        let mailOptions = {
            from: '"Ebantu" <frdrcpeter@hotmail.com>', // sender address
            to: '' + email_user + '', // list of receivers
            subject: 'Code de validation', // Subject line
            text: 'Votre code de validation : ' + code_validation // plain text body
        };

        // send mail with defined transport object
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return console.log(error);
            }
            console.log('Message sent: %s', info.messageId);
            // Preview only available when sending through an Ethereal account
            console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

            // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
            // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
        });

    })
}

/**
 * La fonction qui permet à l'utilisateur de modifier son mot de passe
 */
module.exports.updatePassWord = function (valeur_username, code_validation, nouveau_password, callback) {

    try {

        //On commence par vérifier le code de confirmation
        var recuperation_model = require("./recuperation_dao");
        recuperation_model.initialize(db_js);

        recuperation_model.checkCode(code_validation, valeur_username,
            function (isCodeChecked, resultCode) {

                if (isCodeChecked) { //Si le test sur le code de validation est positif

                    //On crypte le nouveau mot de passe
                    var clearPwd = "za" + nouveau_password + "eb";

                    bcrypt.hash(clearPwd, 10, function (errHash, hash) {

                        if (errHash) {
                            callback(false, "Une erreur est survenue lors du cryptage du nouveau mot de passe : " + errHash);
                        } else {

                            //On ajoute le nouveau mot de passe dans la liste de mot de passe
                            var filter = {
                                "inscription.username":
                                {
                                    "$elemMatch":
                                    {
                                        "valeur": valeur_username,
                                        "etat": true
                                    }
                                }
                            },

                                update = {
                                    "$push": {
                                        "inscription.password": hash
                                    }
                                };

                            collection.value.updateOne(filter, update, function (err, result) {

                                if (err) { //Si une erreur survient lors de l'ajout du nouveau mot de passe
                                    callback(false, "Une erreur est survenue lors de la mise à jour du mot de passe de l'utilisateur : " + err);

                                } else { //Si non aucune erreur n'est survenue lors de l'ajout

                                    //On passe l'etat du code de validation à faux pour ne plus qu'il soit réutilisé
                                    recuperation_model.setCodeFalse(resultCode, function (isCodeSetFalse, resultCondeSetFalse) {

                                        if (isCodeSetFalse) {
                                            callback(true, resultCondeSetFalse);
                                        } else {
                                            callback(false, resultCondeSetFalse);
                                        }
                                    })

                                }
                            })

                        }

                    })

                } else { //si non le test du code est négatif
                    callback(false, resultCode)
                }
            })
    } catch (exception) {
        callback(false, "Une exception a été lévée lors de la mise à jour du mot de passe de l'utilisateur : " + exception);
    }
}

/**
 * La fonction qui permet à un client de se connecter sur son compte
 */
module.exports.login = function (valeur_username, password, callback) {

    try {

        collection.value.aggregate([{
            "$match": {
                "inscription.username":
                {
                    "$elemMatch":
                    {
                        "valeur": new RegExp(valeur_username, "i"),
                        "etat": true
                    }
                }
            }
        },
        {
            "$project": {
                "password": {
                    "$arrayElemAt": ["$inscription.password", -1]
                }
            }
        }
        ]).toArray(function (errAggr, resultAggr) {

            if (errAggr) {
                callback(false, "Une erreur est survenue lors de la connexion du client : " + errAggr);
            } else {

                if (resultAggr.length > 0) {

                    var clearPwd = "za" + password + "eb";

                    bcrypt.compare(clearPwd, resultAggr[0].password, function (errCompareCrypt, resultCompareCrypt) {


                        if (errCompareCrypt) {
                            callback(false, "Une erreur est survenue lors du décryptage du mot de passe : " + errCompareCrypt);
                        } else {
                            if (resultCompareCrypt) {

                                var id_client = "" + resultAggr[0]._id,
                                    objetRetour = {
                                        "id_client": id_client,
                                        "id_dealer" : null
                                    },
                                    loginDao = require("./log_dao"),
                                    dealerDao = require("./dealer_dao");

                                dealerDao.initialize(db_js);
                                dealerDao.findOneByIdClient(objetRetour.id_client, (isFound, message, resultDealer) => {
                                    if (isFound) {
                                        objetRetour.id_dealer = "" + resultDealer._id;
                                    }

                                    loginDao.initialize(db_js);
                                    loginDao.createLogin(resultAggr[0], function (isCreated, messageLogin, resultLogin) {

                                        module.exports.testIsActive(objetRetour.id_client, (isActive, messageUser, resultUser) => {
                                            if (resultUser.authorization) {
                                                objetRetour.active = true;
                                                callback(true, objetRetour)
                                            } else {
                                                objetRetour.active = false;
                                                callback(true, objetRetour)
                                            }
                                        })
                                    })
                                })



                            } else {
                                callback(false, "Le mot de passe est incorrect");
                            }
                        }
                    });

                } else {
                    callback(false, "Adresse e-mail ou numéro de téléphone incorrect");
                }
            }
        })

    } catch (exception) {
        callback(false, "Une exception a été lors de la connexion du client : " + exception);
    }
}


/**
 * La fonction qui permet de recupérer les informations nécessaires pour un client 
 * @param {*} id_client l'identifiant du client qu'on veut avoir des informations
 * @param {Function} callback La fonctionde retour en cas de réussite ou non, même en cas d'exception
 */
module.exports.getAllInfo = function (id_client, callback) {
    try {

        var _id = require("mongodb").ObjectId(id_client);

        var filter = {
            "_id": _id
        }

        collection.value.findOne(filter, function (err, result) {
            if (err) {
                callback(false, "Une erreur est survénue lors de la récupération des informations sur ce client : " + err)
            } else {
                if (result) {
                    var info = {
                        "prenom": result.prenom,
                        "nom": result.nom,
                        "username": result.inscription.username[result.inscription.username.length - 1],
                        "avatar": result.inscription.lien_profil,
                        "paiement": result.inscription.type_paiement,
                        "type": result.type ? result.type : null
                    },
                        media_dao = require("./media_dao");
                    media_dao.initialize(db_js);

                    media_dao.findOneByMedia(info, function (isFound, messageMedia, resultWithMedia) {
                        callback(true, "Les informations sur ce client ont été renvoyées avec succès", resultWithMedia)
                    })
                } else {
                    callback(false, "Aucun client n'a été trouvé")
                }
            }
        })
    } catch (exception) {
        callback(false, "Une exception a été lévée lors de la récupération des informations sur ce client : " + exception)
    }
}
/**
 * Cette fonction permet de modifier la photo de profile de l'utilisateur
 * @param {*} id_utilisateur L'identifiant de l'utilisateur
 * @param {*} path Le chemin absolue du fichier
 * @param {*} name Le nom u fichier
 * @param {*} size La taille du fichier
 * @param {Function} callback La fontion de retour
 */
module.exports.updateAvatar = function (id_utilisateur, path, name, web_size, mobile_size, callback) {
    try {
        var media = require("./entities/media_entity").Media(),
            media_dao = require("./media_dao");

        media.name = name;
        media.web_size = web_size;
        media.mobile_size = mobile_size;
        media.type = "profilClient";
        media.path = path;
        media.date = new Date();

        media_dao.initialize(db_js);
        media_dao.createForUser(media, id_utilisateur, "client", function (isCreated, resultMedia) {
            if (isCreated) {

                var _id = require("mongodb").ObjectID(id_utilisateur),
                    filter = { "_id": _id },
                    update = {
                        "$set":
                        {
                            "inscription.lien_profil": "" + resultMedia._id
                        }
                    };

                collection.value.updateOne(filter, update, function (err, result) {
                    if (err) {
                        callback(false, "Une erreur est survneue lors de la mise à jour de la photo profile : " + err);
                    } else {
                        callback(true, resultMedia)
                    }
                })

            } else {
                callback(false, resultMedia)
            }
        })
    } catch (exception) {
        callback(false, "Une exception a été lévée lors de la mise à jour de la photo profile : " + exception);
    }
}

/**
 * Cette fonction permet de récupérer tous les avatars qu'un client a déja utilisé 
 * @param {*} id_user L'identifiant de l'utilisateur
 * @param {Function} callback La fonction de retour
 */
module.exports.getAllAvatar = function (id_user, callback) {
    try {
        var _id = require("mongodb").ObjectId(id_user),
            filter = {
                "_id": _id
            };

        collection.value.findOne(filter, function (err, result) {
            if (err) {
                callback(false, "Une erreur est survenue lors de la recherche du client : " + err)
            } else {
                if (result) {
                    //callback(true, "Le client trouvé est " + result.nom, result)
                    var media_user_dao = require("./media_user_dao");

                    media_user_dao.initialize(db_js);
                    media_user_dao.findByIdUser(id_user, function (isFound, message_media_user, result_media_user) {
                        if (isFound) {

                            if (result_media_user.length > 0) {
                                //callback(true, "Les avatars de " + result.nom + " ont été renvoyé avec succès", result_media_user)
                                var sortieMedia = 0,
                                    media = [],
                                    media_dao = require("./media_dao");

                                media_dao.initialize(db_js);

                                for (let indexMedia = 0; indexMedia < result_media_user.length; indexMedia++) {

                                    media_dao.findOneById(result_media_user[indexMedia].id_media, function (isFound, message_media, result_media) {
                                        sortieMedia++;
                                        if (isFound) {
                                            media.push(result_media);
                                        }

                                        if (sortieMedia == result_media_user.length) {
                                            callback(true, "Les avatars de " + result.nom + " ont été renvoyé avec succès", media)
                                        }
                                    })

                                }

                            } else {
                                callback(false, "Aucun avatar pour " + result.nom + " n'a été trouvé")
                            }

                        } else {
                            callback(false, message_media_user)
                        }

                    })

                } else {
                    callback(false, "Aucun client ne possède cet identifiant \"" + id_user + "\"")
                }
            }
        })
    } catch (exception) {
        callback(false, "Une exception a été lévée lors de recherche des avatars du client : " + exception)
    }
}

/**
 * Cette Fonction permet de faire la mise à jour sur les élément d'adresse souhaiter
 * @param {*} identifiant L'identifiant de l'utilisateur
 * @param {*} adresse L'adresse qu'on veut modifié avec tous les éléments possible qui sont tous optionnels
 * @param {Function} callback La fonction de retour
 */
module.exports.updateAdress = function (identifiant, adresse, callback) {
    try {
        var _id = require("mongodb").ObjectID(identifiant),
            filter = {
                "_id": _id
            };

        collection.value.findOne(filter, function (err, resultUserFind) {
            if (err) {
                callback(false, "Une erreur est survénue lors de la recherche du client " + err)
            } else {
                if (resultUserFind) {

                    collection.value.aggregate([
                        {
                            "$match": filter
                        },
                        {
                            "$project":
                            {
                                'size': {
                                    "$size": "$adresse"
                                }
                            }
                        }
                    ]).toArray(function (errAggr, resultAggr) {

                        if (errAggr) {
                            callback(false, "Une erreur est survenue lors de la mise à jour de l'adresse client : " + errAggr)
                        } else {

                            var positionAdress = resultAggr[0].size > 0 ? resultAggr[0].size : 0;
                            adresse.id = {
                                "client": identifiant,
                                "adresse": positionAdress
                            };

                            var update = {
                                "$push": {
                                    "adresse": adresse
                                }
                            };


                            collection.value.updateOne(filter, update, function (errPush, resultPush) {

                                if (errPush) {
                                    callback(false, "Une erreur est survenue lors de la mise à jour de l'adresse client : " + errPush)
                                } else {
                                    adresse.id_client = identifiant;

                                    callback(true, adresse)
                                }
                            })
                        }
                    })

                } else {
                    callback(false, "Aucun client n'a été trouvé")
                }
            }
        })
    } catch (exception) {
        callback(false, "Une exception a été lévée lors de la recherche du client " + exception);
    }
}

/**
 * La fonction permettant de modifier les infos du client
 */
module.exports.updateInfo = function (info, callback) {
    try {
        var _id = require("mongodb").ObjectId(info.id_client),
            filter = {
                "_id": _id
            };

        collection.value.findOne(filter, function (err, resultFound) {
            if (err) {
                callback(false, "Une erreur est survénue lors de la recherche du client : " + err)
            } else {
                if (resultFound) {
                    var update = {
                        "$set": {
                            "prenom": info.prenom ? info.prenom : resultFound.prenom,
                            "nom": info.nom ? info.nom : resultFound.nom,
                            "type": info.type ? info.type : resultFound.type
                        }
                    };

                    collection.value.updateOne(filter, update, function (err, result) {
                        if (err) {
                            callback(false, "Une erreur s'est produit lors de la mise à jour de ses infos : " + err)
                        } else {
                            if (result) {

                                callback(true, "Les informations de " + resultFound.nom + " ont été mise à jour", info)
                            } else {
                                callback(false, "Un petit problème lors de la mise à jours de ses infos")
                            }
                        }
                    })
                } else {
                    callback(false, "Aucun client n'a été trouvé")
                }
            }
        })
    } catch (exception) {
        callback(false, "Une exception a été lévée lors de la mise à jour des informations du client : " + exception)
    }
}

/**
 * La fonction permettant de mettre à jour les username du client
 */
module.exports.updateUsername = function (identifiant, username, callback) {

    console.log(username);

    try {

        var _id = require("mongodb").ObjectId(identifiant),
            filter = {
                "_id": _id
            },
            project = {
                "inscription.username": 1
            };

        //On commence par vérifier s'il existe d'autres username du même type que le nouveau
        //cela afin de passer son état à false car on ne peut pas avoir deux username du même type actifs

        collection.value.findOne(filter, project, function (errRecherche, resultRecherche) {

            if (errRecherche) {
                callback(false, "Une erreur est survenue lors de la mise à jour du username : " + errRecherche);
            } else {

                //On vérifie si le client recherché existe
                if (resultRecherche) {

                    //On vérifie si le resultat a renvoyé au moins un username
                    if (resultRecherche.inscription.username.length > 0) {

                        //Sachant que deux username du même type ne peuvent pas avoir l'état "true",
                        //On passe en revu le résult afin de passer à "false" tout autre du même type que 
                        //le nouveau
                        resultRecherche.inscription.username.forEach(function (oldUsername, indexOldUsername) {

                            //Si on trouve un username ayant le même type que le nouveau dont l'état est "true"
                            if (oldUsername.type == username.type && oldUsername.etat == true) {

                                var field = "inscription.username." + indexOldUsername + ".etat",
                                    update = {};
                                update[field] = false;

                                collection.value.updateOne(filter, {
                                    "$set": update
                                })
                            }

                        });

                        //Et on ajoute donc notre nouveau username
                        //Dans ce cas, on ne fera qu'ajouter le nouveau username dans la liste

                        var updatePush = {};
                        updatePush["inscription.username"] = username;

                        collection.value.updateOne(filter,
                            {
                                "$push": updatePush
                            },
                            function (errPush, resultPush) {

                                if (errPush) {
                                    callback(false, "Une erreur est survenue lors de l'ajout du nouveau username : " + username)
                                } else {

                                    username.id_client = identifiant;

                                    callback(true, username)
                                }
                            }
                        )

                    } else {//Si non aucun username n'a été renvoyé

                        //Dans ce cas, on ne fera qu'ajouter le nouveau username dans la liste
                        collection.value.updateOne(filter,
                            {
                                "$push":
                                {
                                    "inscription.username": username
                                }
                            },
                            function (errPush, resultPush) {

                                if (errPush) {
                                    callback(false, "Une erreur est survenue lors de l'ajout du nouveau username : " + username)
                                } else {
                                    username.id_client = identifiant;
                                    callback(true, username)
                                }
                            }
                        )
                    }

                } else {//Si non aucun client ne correspond à l'identifiant fourni

                    callback(false, "Aucun client ne correspond à l'identifiant fourni")
                }

            }
        })


    } catch (exception) {
        callback(false, "Une exception a été lévée lors de la mise à jour du username : " + exception);
    }
}

/**
 * La fonction permettant de mettre à jour les type de paiement du client
 */
module.exports.updateTypePaiement = function (identifiant, type_paiement, callback) {
    try {

        var _id = require("mongodb").ObjectId(identifiant),
            filter = {
                "_id": _id
            },
            project = {
                "inscription.type_paiement": 1
            };

        //On commence par vérifier s'il existe d'autres type_paiement du même type que le nouveau
        //cela afin de passer son état à false car on ne peut pas avoir deux type_paiement du même type actifs

        collection.value.findOne(filter, project, function (errRecherche, resultRecherche) {

            if (errRecherche) {
                callback(false, "Une erreur est survenue lors de la mise à jour du type_paiement : " + errRecherche);
            } else {

                //On vérifie si le client recherché existe
                if (resultRecherche) {

                    //On vérifie si le resultat a renvoyé au moins un type_paiement
                    if (resultRecherche.inscription.type_paiement.length > 0) {

                        //Sachant que deux type_paiement du même type ne peuvent pas avoir l'état "true",
                        //On passe en revu le résult afin de passer à "false" tout autre du même type que 
                        //le nouveau
                        resultRecherche.inscription.type_paiement.forEach(function (oldtype_paiement, indexOldtype_paiement) {

                            //Si on trouve un type_paiement ayant le même type que le nouveau dont l'état est "true"
                            if (oldtype_paiement.intitule == type_paiement.intitule && oldtype_paiement.default == true) {

                                var field = "inscription.type_paiement." + indexOldtype_paiement + ".default",
                                    update = {};
                                update[field] = false;

                                collection.value.updateOne(filter, {
                                    "$set": update
                                })
                            }

                        });

                        //Et on ajoute donc notre nouveau type_paiement
                        //Dans ce cas, on ne fera qu'ajouter le nouveau type_paiement dans la liste

                        var updatePush = {};
                        updatePush["inscription.type_paiement"] = type_paiement;

                        collection.value.updateOne(filter,
                            {
                                "$push": updatePush
                            },
                            function (errPush, resultPush) {

                                if (errPush) {
                                    callback(false, "Une erreur est survenue lors de l'ajout du nouveau type_paiement : " + type_paiement)
                                } else {
                                    type_paiement.id_client = identifiant;

                                    callback(true, type_paiement)
                                }
                            }
                        )

                    } else {//Si non aucun type_paiement n'a été renvoyé

                        //Dans ce cas, on ne fera qu'ajouter le nouveau type_paiement dans la liste
                        collection.value.updateOne(filter,
                            {
                                "$push":
                                {
                                    "inscription.type_paiement": type_paiement
                                }
                            },
                            function (errPush, resultPush) {

                                if (errPush) {
                                    callback(false, "Une erreur est survenue lors de l'ajout du nouveau type_paiement : " + type_paiement)
                                } else {
                                    type_paiement.id_client = identifiant;

                                    callback(true, type_paiement)
                                }
                            }
                        )
                    }

                } else {//Si non aucun client ne correspond à l'identifiant fourni

                    callback(false, "Aucun client ne correspond à l'identifiant fourni")
                }

            }
        })


    } catch (exception) {
        callback(false, "Une exception a été lévée lors de la mise à jour du type_paiement : " + exception);
    }
}

/**
 * La fonction permettant de revoyer le nombre d'inscription
 * Elle est utilisée dans l'administration
 */
module.exports.countClientForAdmin = function (callback) {

    try {

        collection.value.estimatedDocumentCount({}, function (err, result) {

            if (err) {
                callback(false, "Une erreur est survenue lors du comptage du nombre de client : " + err);
            } else {
                callback(true, result)
            }
        })
    } catch (exception) {
        callback(false, "Une exception a été lévée lors du comptage du nombre de client : " + exception);
    }
}

/**
 * La fonction permettant de lister les clients
 * Elle est utilisée dans l'administration
 */
module.exports.getAllForAdmin = function (gtDateClient, callback) {

    try {

        var filter = {},
            project = { "_id": 1, "prenom": 1, "nom": 1, "inscription.lien_profil": 1, "inscription.date": 1 },
            sort = { "inscription.date": -1 };

        if (gtDateClient != "null") {

            var dateClient = new Date(gtDateClient);

            filter = { "inscription.date": { "$lt": dateClient } }
        }

        collection.value.find(filter)
            .project(project)
            .sort(sort)
            .limit(2).toArray(function (err, result) {

                if (err) {
                    callback(false, "Une erreur est survenue lors du listage de clients : " + err);
                } else {
                    if (result.length > 0) {

                        var media_dao = require("./media_dao"),
                            listRetourWithMedia = [],
                            sortieMedia = 0;

                        media_dao.initialize(db_js);

                        result.forEach((client, index, client_tab) => {

                            media_dao.findOneByIdFromClientForAdmin(client, function (isMedia, messageMedia, resultWithMedia) {

                                sortieMedia++;

                                listRetourWithMedia.push(resultWithMedia);

                                if (sortieMedia == client_tab.length) {
                                    callback(true, listRetourWithMedia)
                                }
                            })
                        });
                    } else {
                        callback(false, "Aucun client n'a été trouvé");
                    }
                }
            })

    } catch (exception) {
        callback(false, "Une exception a été lévée lors du listage de clients : " + exception);
    }
}

/**
 * La fonction permettant d'afficher les détails d'un client. 
 * Elle est utilisée dans l'administration
 */
module.exports.findOneByIdForAdmin = function (identifiant, callback) {

    try {

        var _id = require("mongodb").ObjectID(identifiant);

        collection.value.aggregate([
            {
                "$match": {
                    "_id": _id
                }
            },
            {
                "$unwind": "$inscription.username"

            },
            {
                "$match":
                {
                    "inscription.username.etat": true
                }
            },
            {
                "$group":
                {
                    "_id": "$_id",
                    "client": {
                        "$push": {
                            "_id": "$_id",
                            "nom": "$nom",
                            "prenom": "$prenom",
                            "type": "$type",
                            "sexe": "$sexe",
                            "inscription": "$inscription",
                            "flag": "$flag"
                        }
                    }
                }
            },
            {
                "$project":
                {
                    "_id": 0
                }
            },
            {
                "$unwind": "$client"
            },
            {
                "$group":
                {
                    "_id": "$client._id",
                    "infos": {
                        "$addToSet": {
                            "nom": "$client.nom",
                            "prenom": "$client.prenom",
                            "sexe": "$client.sexe",
                            "lien_profil": "$client.inscription.lien_profil",
                            "date_inscription": "$client.inscription.date",
                            "type_client": "$client.type",
                            "type_paiement": "$client.inscription.type_paiement",
                            "flag": "$client.flag"
                        }
                    },
                    "username": {
                        "$addToSet": "$client.inscription.username"
                    }
                }
            }
        ]).toArray(function (err, result) {

            if (err) {
                callback(false, "Une est survenue lors de la recheche des infos du client <" + identifiant + "> : " + err)
            } else {
                if (result.length > 0) {

                    var client = result[0];

                    //Ici on recupère l'avatar de l'utilisateur

                    var media_dao = require("./media_dao");
                    media_dao.initialize(db_js);
                    media_dao.findOneByIdFromClientForAdmin(client, function (isMedia, messageMedia, resultWithMedia) {

                        if (isMedia) {
                            callback(true, resultWithMedia)
                        } else {
                            resultWithMedia.erreur = messageMedia
                            callback(true, resultWithMedia)
                        }
                    })
                } else {
                    callback(false, "Aucun cliet ne correspond à l'identifiant <" + identifiant + ">")
                }
            }
        })

    } catch (exception) {
        callback(false, "Une exception a été lévée lors de la recheche des infos du client <" + identifiant + "> : " + exception)
    }
}


/**
 * La fonction permettant de recupérer les détails d'un client suivant son identifiant
 * Elle est utilisée dans la fonction "getAllForAdmin" de la  DAO "commande"
 */
module.exports.getOneByIdFromCommande = function (commande, callback) {

    try {

        var _id = require("mongodb").ObjectID(commande.client.id),
            filter = {
                "_id": _id
            };

        commande.client.nom = null;
        commande.client.prenom = null;
        commande.client.lien_profil = null;
        commande.client.message_erreur = null;

        collection.value.findOne(filter, function (err, result) {

            if (err) {
                commande.client.message_erreur = "Une erreur est survenue lors de la recherche du client ayant passé la commande <" + commande._id + "> : " + err;

                callback(true, commande)

            } else {

                if (result) {
                    commande.client.nom = result.nom;
                    commande.client.prenom = result.prenom;
                    commande.client.lien_profil = result.inscription.lien_profil;
                    commande.client.message_erreur = null;

                    callback(true, commande);
                } else {

                    commande.client.message_erreur = "Il semble l'identifiant <" + commande.client.id + "> du client ayant passé la commande <" + commande._id + "> ne correspond à aucun client";
                    callback(true, commande)
                }
            }
        })
    } catch (exception) {

        commande.client.message_erreur = "Une exception a été lévée lors de la recherche du client ayant passé la commande <" + commande._id + "> : " + exception;
        callback(true, commande)
    }
}

/**
 * La fonction permettant de lister les adresses d'un client
 */
module.exports.getAdress = function (id_client, callback) {
    try {
        var _id = require("mongodb").ObjectId(id_client),
            filter = {
                "_id": _id
            }
            ;

        collection.value.aggregate([
            {
                "$unwind": "$adresse"
            },
            {
                "$match": filter

            },
            {
                "$project": {
                    "adresse": 1,
                    "_id": 0
                }
            }
        ]).toArray(function (err, resultAdress) {
            if (err) {
                callback(false, "Une erreur est survenue lors de la recherche d'adresse")
            } else {

                if (resultAdress.length > 0) {
                    //callback(true, "Les adresses ont été renvoyer avec succès", resultAdress)

                    var villeDao = require("./ville_dao"),
                        sortieAdresse = 0,
                        adressWithTown = [];

                    villeDao.initialize(db_js);

                    for (let indexAdress = 0; indexAdress < resultAdress.length; indexAdress++) {

                        villeDao.findOneByIdFromAdress(resultAdress[indexAdress], function (isFound, messageAdress, resultAdressWithTown) {
                            sortieAdresse++;

                            adressWithTown.push(resultAdressWithTown);

                            if (sortieAdresse == resultAdress.length) {

                                callback(true, "Les adresses ont été renvoyer avec succès", adressWithTown);
                            }

                        })

                    }
                } else {
                    callback(false, "Pas d'adresse spécifier")
                }
            }
        })
    } catch (exception) {
        callback(false, "Une exception a été lévée lors de la recherche des adresses de ce dernier : " + exception)
    }
}

module.exports.setAdress = function (adresse, callback) {
    try {
        var _id = require("mongodb").ObjectId(adresse.id_client),
            filter = {
                _id: _id
            },
            update = {
                "$set": {
                    "adresse": "" + adresse._id
                }
            };

        collection.value.updateOne(filter, update, function (err, result) {
            if (err) {
                callback(false, "Une erreur est survenue lors de la définition de l'adresse vers le client : " + exception)
            } else {
                if (result) {
                    callback(true, "La définition a réussi", adresse)
                } else {
                    callback(false, "La définition de l'adresse a échoué")
                }
            }
        })

    } catch (exception) {
        callback(false, "Une exception a été lévée lors de la définition de l'adresse vers le client : " + exception)
    }
}

/**
 * Cette méthode permet de définir un avatar par un avatar déjà utilisé
 */
module.exports.setAvatarById = function (id_user, id_media, callback) {
    try {
        var media_user_dao = require("./media_user_dao");

        media_user_dao.initialize(db_js);

        media_user_dao.findByIdUser(id_user, function (isFound, message_media_user, result_media_user) {
            if (isFound) {
                var idMediaDoublon = [];

                for (let index = 0; index < result_media_user.length; index++) {
                    idMediaDoublon.push(result_media_user[index].id_media)
                }

                if (idMediaDoublon.includes(id_media)) {
                    var _id = require("mongodb").ObjectId(id_user),
                        filter = {
                            "_id": _id
                        },
                        update = {
                            "$set": {
                                "inscription.lien_profil": id_media
                            }
                        }
                        ;

                    collection.value.updateOne(filter, update, function (err, result) {
                        if (err) {
                            callback(false, "Une erreur est survenue lors de la définition de l'avatar : " + err)
                        } else {
                            if (result) {
                                callback(true, "Avatar mis à jour avec succès", result)
                            } else {
                                callback(false, "La modification n'a pas été faite", null)
                            }
                        }
                    })
                } else {
                    callback(false, "Ce media n'est pas repertorié", null)
                }
            } else {
                callback(false, message_media_user, null)
            }
        })
    } catch (exception) {
        callback(false, "Une exception a été lévée lors de la définition de l'avatar : " + exception)
    }
}

/**
 * La fonction permettant de mettre à jour le type d'un client.
 * Elle est utilisée dans la fonction "create" de la DAO "dealer"
 */
module.exports.updateTypeFromDealer = function (dealer, callback) {

    try {

        var _id = require("mongodb").ObjectID(dealer.id_client),
            filter = { "_id": _id },
            update = { "$set": { "type": "dealer" } };

        collection.value.updateOne(filter, update, function (err, result) {

            if (err) {
                callback(false, "Une une erreur est survenue lors de la mise à jour du type du client <" + id_client + "> : " + err)
            } else {
                callback(true, dealer)
            }
        })

    } catch (exception) {
        callback(false, "Une exception a été lévée lors de la mise à jour du type du client <" + id_client + "> : " + exception)
    }
}

/**
 * La fonction permettant de mettre à jour le type d'un client.
 * Elle est utilisée dans la fonction "managerDealerModeForAdmin" de la DAO "dealer"
 */
module.exports.updateType2FromDealerForAdmin = function (id_client, id_agent, motif, id_dealer, callback) {

    try {

        var _id = require("mongodb").ObjectID(id_client),
            filter = { "_id": _id },
            project = { "type": 1 };

        collection.value.findOne(filter, project, function (errFind, resultFind) {

            if (errFind) {
                callback(false, "Une erreur est survenue lors de la recherche du client <" + id_client + "> : " + errFind, null);
            } else {

                var update_story_dealer = null;

                if (resultFind) {

                    if (resultFind.type) {
                        var update_story = {
                            "$set": { "type": null }, "$push":
                            {
                                "story":
                                {
                                    "date": new Date(),
                                    "type": null,
                                    "motif": "Desactivation type <dealer>, Motif : " + motif + "",
                                    "agent": id_agent
                                }
                            }
                        }

                        update_story_dealer = {
                            "$push": {
                                "story": {
                                    "date": new Date(),
                                    "flag": false,
                                    "agent": id_agent
                                }
                            }

                        }

                    } else {

                        var update_story = {
                            "$set": { "type": "dealer" }, "$push":
                            {
                                "story":
                                {
                                    "date": new Date(),
                                    "type": "dealer",
                                    "agent": id_agent
                                }
                            }
                        }

                        update_story_dealer = {
                            "$push": {
                                "story": {
                                    "date": new Date(),
                                    "flag": true,
                                    "agent": id_agent
                                }
                            }
                        }
                    }

                    collection.value.updateOne(filter, update_story, function (errOne, result) {

                        if (errOne) {
                            callback(false, "Une une erreur est survenue lors de la mise à jour du type du client <" + id_client + "> : " + errOne, null)
                        } else {

                            var dealer_dao = require('./dealer_dao');

                            dealer_dao.initialize(db_js);
                            dealer_dao.updateStoryFromClientTypeManagerForAdmin(update_story_dealer, id_dealer, function (isUpdate, messageUpdate, resultUpdate) {

                                if (isUpdate) {
                                    callback(true, null, "La mise à jour a été effectuée avec succès")
                                } else {
                                    callback(false, messageUpdate, null);
                                }
                            });

                        }
                    })

                } else {
                    callback(false, "Aucun client ne correspond à l'identifiant <" + id_client + ">", null);
                }
            }
        })

    } catch (exception) {
        callback(false, "Une exception a été lévée lors de la mise à jour du type du client <" + id_client + "> : " + exception)
    }
}

/**
 * La fonction permettant de compter le nombre de clients suivant un type precis
 */
module.exports.countByTypeForAdmin = function (type_client, callback) {

    try {

        collection.value.count({ "type": type_client }, function (err, result) {

            if (err) {
                callback(false, "Une erreur est survenue lors du comptage du nombre de dealer : " + err);
            } else {
                callback(true, result)
            }
        })

    } catch (exception) {
        callback(false, "Une exception a été lévée lors du comptage de dealer : " + exception);
    }
}

/**
 * La fonction permettant à un client de soumettre une demande dealer.
 */
module.exports.becomeDealer = function (id_client, details_dealer, callback) {

    try {
        module.exports.findOneById(id_client, (isFound, message, result) => {
            if (isFound) {
                var dealer_entity = require("./entities/dealer_entity").Dealer(),
                    dealer_dao = require("./dealer_dao");

                dealer_entity.id_client = "" + result._id;
                dealer_entity.date = new Date();
                dealer_entity.details = details_dealer;

                dealer_dao.initialize(db_js);

                dealer_dao.create(dealer_entity, (isCreated, messageDealer, resultDealer) => {
                    if (isCreated) {
                        callback(true, "La demande a été transféré avec succès", resultDealer)
                    } else {
                        callback(false, messageDealer)
                    }
                })
            } else {
                callback(false, message)
            }
        })
    } catch (exception) {
        callback(false, "Une exception a été lévée lors de la passation de demande : " + exception)
    }

}
/**
 * Le module permettant d'effectuer le test si compte activer
 */
module.exports.testIsActive = (id_client, callback) => {
    try {
        collection.value.aggregate([
            {
                "$match": {
                    "_id": require("mongodb").ObjectId(id_client),
                    "flag": true
                }
            }
        ]).toArray((err, resultAggr) => {
            if (err) {
                callback(false, "Une erreur est survenue lors du test de l'activation du compte : " + err, null)
            } else {
                if (resultAggr.length > 0) {
                    callback(true, "Compte est actif", { "authorization": true })
                } else {
                    callback(false, "Compte pas encore actif", { "authorization": false })
                }
            }
        })
    } catch (exception) {
        callback(false, "Une exception a été lévée lors du test de l'activation du compte : " + exception, null)
    }
}

/**
 * La fonction permettant de trouver les détails d'un dealer ayant soumis un produit.
 */
module.exports.findOneByIdFromOperationVenteForAdmin = function (operationVente, callback) {

    try {

        var _id = require("mongodb").ObjectID(operationVente.id_client),
            filter = {
                "_id": _id
            },
            project = { "nom": 1, "prenom": 1 };

        collection.value.findOne(filter, project, function (err, result) {

            if (err) {
                operationVente.listeErreur.push("Une erreur est survenue lors de la recherche du client lié au dealer : " + err);
                callback(false, operationVente);
            } else {
                if (result) {

                    operationVente.nom_dealer = result.prenom + " " + result.nom;

                    var media_dao = require("./media_dao");
                    media_dao.initialize(db_js);
                    media_dao.findOneByIdFromOperationVenteForAdmin(operationVente, function (isMedia, resultWithMedia) {

                        callback(isMedia, resultWithMedia);
                    })

                } else {
                    operationVente.listeErreur.push("Aucun client ne correspond à l'identifiant passé");
                    callback(false, operationVente)
                }
            }
        })

    } catch (exception) {

        operationVente.listeErreur.push("Une exception a été lévée lors de la recherche du client lié au dealer : " + exception);
        callback(false, operationVente);
    }
}

/**
 * La fonction permettant de mettre à jour le flag du compte client. 
 * Elle est utilisée dans l'administrattion
 */
module.exports.updateFlagForAdmin = function (id_client, id_agent, callback) {

    try {

        var _id = require("mongodb").ObjectID(id_client),
            filter = { "_id": _id },
            update = null;

        //on commence par tester l'état actuel du compte
        module.exports.testIsActive(id_client, function (isEnabled, enableMessage, resultEnable) {

            if (isEnabled) {
                update = {
                    "$set": { "flag": false }, "$push":
                    {
                        "story":
                        {
                            "date": new Date(),
                            "flag": false,
                            "agent": id_agent
                        }
                    }
                }
            } else {
                if (resultEnable) {
                    update = {
                        "$set": { "flag": true }, "$push":
                        {
                            "story":
                            {
                                "date": new Date(),
                                "flag": true,
                                "agent": id_agent
                            }
                        }
                    }
                }
            }

            if (update) {
                collection.value.updateOne(filter, update, function (err, result) {
                    if (err) {
                        callback(false, "Une erreur est survenue lors de la mise à jour du flag du client: " + exception, null)
                    } else {
                        callback(true, "Le compte du client <" + id_client + "> a été correctement mise à jour", !isEnabled)
                    }
                })
            } else {
                callback(false, enableMessage, null)
            }
        })
    } catch (exception) {
        callback(false, "Une exception a été lévée lors de la mise à jour du flag du client : " + exception, null);
    }
}

/**
 * La fonction permettant de rechercher un client ayant fait objet d'une alerte
 */
module.exports.findOneByIdFromAlerte = function (alerte, callback) {

    try {

        var _id = require("mongodb").ObjectID(alerte.id_objet),
            filter = {
                "_id": _id
            };

        collection.value.findOne(filter, function (err, result) {

            if (err) {
                callback(false, "Une erreur est survenue lors de la recherche d'un client ayant fait objet d'une alerte : " + err);
            } else {

                if (result) { //Si le client a été trouvé

                    var media_dao = require("./media_dao");

                    media_dao.initialize(db_js);
                    media_dao.findOneByIdFromClientForAdmin(result, function (isFound, messageMedia, resultWithMedia) {

                        //On recupère les infos dont nous avons besoin
                        var infos_client = {
                            "id_client": "" + result._id,
                            "nom": result.nom,
                            "prenom": result.prenom,
                            "sexe": result.sexe,
                            "image_name": resultWithMedia.inscription.lien_profil ? resultWithMedia.inscription.lien_profil : null,
                            "image_path": resultWithMedia.inscription.path_profil ? resultWithMedia.inscription.path_profil : null
                        };

                        alerte.infos_client = infos_client;

                        callback(true, null, alerte)
                    })

                } else {
                    callback(false, "Aucun client ne correspond à l'identifiant : " + alerte.id_objet);
                }
            }
        })
    } catch (exception) {
        callback(false, "Une exception a été lévée lors de la recherche d'un client ayant émit un avis : " + exception);
    }
}

/**
 * Module permettant la simulation d'un explorateur
 * @param {String} path Le chemin relatif du répretoire 
 * @param {Function} callback La fonction de retour 
 */
module.exports.explore = (path, callback) => {

    try {
        fs.readdir(path, (err, obj) => {

            if (err) return callback(false, "Error : " + err);

            if (obj.length > 0) {
                var listOut = [],
                    sortie = 0;

                for (let index = 0; index < obj.length; index++) {

                    testyfile.verify(`${path + "/" + obj[index]}`, (isOkay, message, result) => {
                        sortie++;
                        if (isOkay) {

                            listOut.push({
                                "name": obj[index],
                                "extension": obj[index].split(".").length > 1 ? "." + obj[index].split(".")[obj[index].split(".").length - 1] : null,
                                "type": obj[index].split(".").length > 1 ? "File" : "Folder",
                                "created_at": result.created_at,
                                "size": result.size,
                                "accessLink": path + "/" + obj[index]
                            })
                        }

                        if (sortie == obj.length) {
                            callback(true, `Le repertoire ${path} contient ces éléments`, listOut)
                        }

                    })


                }

            } else {
                callback(false, "Ce dossier est vide...")
            }

        })
    } catch (e) {
        callback(false, "Une exception est survenue lors du parcour du repertoire : " + e)
    }
}
