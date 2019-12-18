/* By Zaya Africa 2018 */

'use strict';

//#region ADS

/**
 * Cette méthode a pour but de renvoyé des média pour une utilisation sur les medias à la une défilante
 * @param {*} database Introduisez la variable qui nous connecte à la base de données
 * @param {*} modelAds Introduisez la variable contenant le model de la collection
 * @param {*} request Variable qui envoi des requête
 * @param {*} response Variable qui fournit la (les) reponse
 */
module.exports.getMediaForSlider = function getMediaForSlider(database, modelAds, request, response) {

    var type = request.params.type,
        objetRetour = require("../../routes/objet_retour").ObjetRetour();

    modelAds.initialize(database);
    modelAds.getSlider(type, function (isSliderMatched, resultSlider) {

        if (isSliderMatched) {
            objetRetour.getEtat = true;
            objetRetour.getObjet = resultSlider;
            response.send(objetRetour);
        } else {
            objetRetour.getEtat = false;
            objetRetour.getMessage = resultSlider;
            response.send(objetRetour);
        }
    });
}

//#endregion

//#region Adresse

/**
 * Cette fonction permet de définir une adresse
 * @param {*} database Introduisez la variable qui nous connecte à la base de données
 * @param {*} modelAdresse Introduisez la variable contenant le model de la table ou de l 'objet   
 * @param {*} request Variable qui envoi des requête
 * @param {*} response Variable qui fournit la reponse
 */
module.exports.createAdresse = function createAdresse(database, modelAdresse, request, response) {

    //On appel les modules necessaire pour cette fonction
    var objetRetour = require("../../routes/objet_retour").ObjetRetour(),
        adresse_entity = require("../entities/adresse_entity").Adresse();

    adresse_entity.flag = true;
    adresse_entity.id_client = request.body.id_client ? request.body.id_client : null;
    adresse_entity.id_commune = request.body.id_commune ? request.body.id_commune : null;
    adresse_entity.numero = request.body.numero ? request.body.numero : null;
    adresse_entity.quartier = request.body.quartier ? request.body.quartier : null;
    adresse_entity.avenue = request.body.avenue ? request.body.avenue : null;
    adresse_entity.reference = request.body.reference ? request.body.reference : null;
    adresse_entity.type = request.body.type ? request.body.type : "Domicile";

    //On initialise le modèle de données
    modelAdresse.initialize(database);

    //Puis on éxécute la méthode create du modèle
    modelAdresse.create(adresse_entity, function (isCreated, message_adresse, result_adresse) {

        //Si l'agent est crée, alors on attribut les valeurs des retour qui était en quelques sorte un JSON
        if (isCreated) {

            objetRetour.getEtat = true;
            objetRetour.getObjet = result_adresse;
            objetRetour.getMessage = message_adresse;
            response.send(objetRetour);

        } else { //On fait de même s'il n'est oas créer tout en précisant que si le resultat n'existe pas on mettra null à la place de celui-ci

            objetRetour.getEtat = false;
            result_adresse ? objetRetour.getObjet = result_adresse : null;
            objetRetour.getMessage = message_adresse;
            response.send(objetRetour);
        }
    });

}

/**
 * Méthode qui permet de trouver l'adresse en cours d'un client
 * @param {*} database Introduisez la variable qui nous connecte à la base de données 
 * @param {*} modelAdresse Introduisez la variable contenant le model de la table ou de l'objet  
 * @param {*} request Variable qui envoi des requête
 * @param {*} response Variable qui fournit la reponse
 */
module.exports.getCurrentCustomerAddress = function getCurrentCustomerAddress(database, modelAdresse, request, response) {

    //On appel les modules necessaire pour cette fonction
    var objetRetour = require("../../routes/objet_retour").ObjetRetour(),
        id_client = request.params.id_client;
    //On initialise le modèle de données
    modelAdresse.initialize(database);
    //Puis on éxécute la méthode  du modèle
    modelAdresse.findCurrentCustomerAddress(id_client, function (isMatched, message_adresse, result_adresse) {

        //Si le client est crée, alors on attribut les valeurs des retour qui était en quelques sorte un JSON
        if (isMatched) {

            objetRetour.getEtat = true;
            objetRetour.getObjet = result_adresse;
            objetRetour.getMessage = message_adresse;
            response.send(objetRetour);

        } else { //Si le client est crée, alors on attribut les valeurs des retour qui était en quelques sorte un JSON

            objetRetour.getEtat = false;
            result_adresse ? objetRetour.getObjet = result_adresse : null;
            objetRetour.getMessage = message_adresse;
            response.send(objetRetour);
        }
    });
}

/**
 * Méthode qui permet de trouver les adresses d'un client
 * @param {*} database Introduisez la variable qui nous connecte à la base de données 
 * @param {*} modelAdresse Introduisez la variable contenant le model de la table ou de l'objet  
 * @param {*} request Variable qui envoi des requête
 * @param {*} response Variable qui fournit la reponse
 */
module.exports.getAllAdresse = function getAllAdresse(database, modelAdresse, request, response) {

    //On appel les modules necessaire pour cette fonction
    var objetRetour = require("../../routes/objet_retour").ObjetRetour(),
        id_client = request.params.id_client;
    //On initialise le modèle de données
    modelAdresse.initialize(database);
    //Puis on éxécute la méthode createDealer du modèle
    modelAdresse.getAll(id_client, function (isMatched, message_adresse, result_adresse) {

        //Si le client est crée, alors on attribut les valeurs des retour qui était en quelques sorte un JSON
        if (isMatched) {

            objetRetour.getEtat = true;
            objetRetour.getObjet = result_adresse;
            objetRetour.getMessage = message_adresse;
            response.send(objetRetour);

        } else { //Si le client est crée, alors on attribut les valeurs des retour qui était en quelques sorte un JSON

            objetRetour.getEtat = false;
            result_adresse ? objetRetour.getObjet = result_adresse : null;
            objetRetour.getMessage = message_adresse;
            response.send(objetRetour);
        }
    });
}

/**
 * Méthode qui permet de désactiver l'adresse d'un client
 * @param {*} database Introduisez la variable qui nous connecte à la base de données 
 * @param {*} modelAdresse Introduisez la variable contenant le model de la table ou de l'objet  
 * @param {*} request Variable qui envoi des requête
 * @param {*} response Variable qui fournit la reponse
 */
module.exports.disableAdresse = function disableAdresse(database, modelAdresse, request, response) {

    //On appel les modules necessaire pour cette fonction
    var objetRetour = require("../../routes/objet_retour").ObjetRetour(),
        id_client = request.body.id_client,
        adresse = {
            "id_adresse": request.body.id_adresse,
            "flag": request.body.flag
        };
    //On initialise le modèle de données
    modelAdresse.initialize(database);
    //Puis on éxécute la méthode createDealer du modèle
    modelAdresse.changeFlag(adresse, id_client, function (isMatched, message_adresse, result_adresse) {

        //Si le client est crée, alors on attribut les valeurs des retour qui était en quelques sorte un JSON
        if (isMatched) {

            objetRetour.getEtat = true;
            objetRetour.getObjet = result_adresse;
            objetRetour.getMessage = message_adresse;
            response.send(objetRetour);

        } else { //Si le client est crée, alors on attribut les valeurs des retour qui était en quelques sorte un JSON

            objetRetour.getEtat = false;
            result_adresse ? objetRetour.getObjet = result_adresse : null;
            objetRetour.getMessage = message_adresse;
            response.send(objetRetour);
        }
    });
}

/**
 * Méthode qui permet de définir une adresse comme defaut
 * @param {*} database Introduisez la variable qui nous connecte à la base de données 
 * @param {*} modelAdresse Introduisez la variable contenant le model de la table ou de l'objet  
 * @param {*} request Variable qui envoi des requête
 * @param {*} response Variable qui fournit la reponse
 */
module.exports.setDefaultAdresse = function setDefaultAdresse(database, modelAdresse, request, response) {

    //On appel les modules necessaire pour cette fonction
    var objetRetour = require("../../routes/objet_retour").ObjetRetour(),
        id_client = request.body.id_client,
        id_adresse = request.body.id_adresse;
    //On initialise le modèle de données
    modelAdresse.initialize(database);
    //Puis on éxécute la méthode createDealer du modèle
    modelAdresse.setDefault(id_adresse, id_client, function (isMatched, message_adresse, result_adresse) {

        //Si le client est crée, alors on attribut les valeurs des retour qui était en quelques sorte un JSON
        if (isMatched) {

            objetRetour.getEtat = true;
            objetRetour.getObjet = result_adresse;
            objetRetour.getMessage = message_adresse;
            response.send(objetRetour);

        } else { //Si le client est crée, alors on attribut les valeurs des retour qui était en quelques sorte un JSON

            objetRetour.getEtat = false;
            result_adresse ? objetRetour.getObjet = result_adresse : null;
            objetRetour.getMessage = message_adresse;
            response.send(objetRetour);
        }   
    });
}

/**
 * La fonction permettant la mise à jour des coordonnées de l'adresse.
 */
module.exports.setAddressGeoLocation = function setAddressGeoLocation(database, modelAdresse, request, response) {

    //On appel les modules necessaire pour cette fonction
    var objetRetour = require("../../routes/objet_retour").ObjetRetour(),
        latitude = request.body.latitude,
        longitude = request.body.longitude,
        id_adresse = request.body.id_adresse;

    //On initialise le modèle de données
    modelAdresse.initialize(database);

    //Puis on éxécute la méthode de mise à jour
    modelAdresse.setGeoLocation(id_adresse, latitude, longitude, function (isMatched, message_adresse, result_adresse) {

        
        if (isMatched) {

            objetRetour.getEtat = true;
            objetRetour.getObjet = result_adresse;
            objetRetour.getMessage = message_adresse;
            response.send(objetRetour);

        } else { 

            objetRetour.getEtat = false;
            objetRetour.getObjet = result_adresse;
            objetRetour.getMessage = message_adresse;
            response.send(objetRetour);
        }   
    });
}


/**
 * Méthode qui permet de définir une adresse comme defaut
 * @param {*} database Introduisez la variable qui nous connecte à la base de données 
 * @param {*} modelAdresse Introduisez la variable contenant le model de la table ou de l'objet  
 * @param {*} request Variable qui envoi des requête
 * @param {*} response Variable qui fournit la reponse
 */
module.exports.setAvatarById = function setAvatarById(database, modelAdresse, request, response) {

    //On appel les modules necessaire pour cette fonction
    var objetRetour = require("../../routes/objet_retour").ObjetRetour(),
        id_client = request.body.id_client,
        id_media = request.body.id_media;
    //On initialise le modèle de données
    modelAdresse.initialize(database);
    //Puis on éxécute la méthode createDealer du modèle
    modelAdresse.setAvatarById(id_client, id_media, function (isMatched, message_avatar, result_avatar) {

        //Si le client est crée, alors on attribut les valeurs des retour qui était en quelques sorte un JSON
        if (isMatched) {

            objetRetour.getEtat = true;
            objetRetour.getObjet = result_avatar;
            objetRetour.getMessage = message_avatar;
            response.send(objetRetour);

        } else { //Si le client est crée, alors on attribut les valeurs des retour qui était en quelques sorte un JSON

            objetRetour.getEtat = false;
            result_avatar ? objetRetour.getObjet = result_avatar : null;
            objetRetour.getMessage = message_avatar;
            response.send(objetRetour);
        }   
    });
}

//#endregion

//#region Agent

/**
 * La méthode que vous avez appelé permet de chercher un agent via son identifiant, alors utiliser cela en suivant les instructions de ces paramètres
 * @param {*} database Introduisez la variable qui nous connecte à la base de données
 * @param {*} modelAgent Introduisez la variable contenant le model de la table ou de l 'objet
 * @param {*} request Variable qui envoi des requêtes
 * @param {*} response Variable qui fournit la reponse
 */
module.exports.findAgentById = function findAgentById(database, modelAgent, request, response) {

    //On appel le module necessaire pour cette fonction
    var objetRetour = require("../../routes/objet_retour").ObjetRetour(),
        //Cette variable contient l'identifiant de l'agent passé en URL
        id_agent = request.params.id_agent;

    //On initialise le modèle de données
    modelAgent.initialize(database);
    //Puis on éxécute la méthode findOneById du modèle
    modelAgent.findOneById(id_agent, function (isFound, message_agent, result_agent) {

        //Si l'identifiant de l'agent passé en URL à été trouvé, alors on attribut les valeurs des retour qui est en quelques sorte un JSON
        if (isFound) {

            objetRetour.getEtat = true;
            objetRetour.getObjet = result_agent;
            objetRetour.getMessage = message_agent;
            response.send(objetRetour);

        } else { //On fait de même s'il n'est pas trouvé tout en précisant que si le resultat n'existe pas on mettra null à la place de celui-ci
            objetRetour.getEtat = false;
            result_agent ? objetRetour.getObjet = result_agent : null;
            objetRetour.getMessage = message_agent;
            response.send(objetRetour);
        }
    });
}

//#endregion

//#region Annonce


/**
 * La fonction qui permet de créer une annonce
 * @param {*} database Introduisez la variable qui nous connecte à la base de données
 * @param {*} modelAnnonce Introduisez la variable contenant le model de la table ou de l 'objet
 * @param {*} request Variable qui des requêtes
 * @param {*} response Variable qui fournit les reponses
 */
module.exports.createAnnonce = function createAnnonce(database, modelAnnonce, request, response) {

    var objetRetour = require("../../routes/objet_retour").ObjetRetour(),
        annonce_entity = require("../../Models/entities/annonce_entity").Annonce();

    annonce_entity.lien_couverture = request.body.lien_couverture;
    annonce_entity.titre = request.body.titre;
    annonce_entity.message = request.body.message;
    annonce_entity.date_creation = new Date();
    annonce_entity.flag = request.body.flag;

    modelAnnonce.initialize(database);
    modelAnnonce.create(annonce_entity, function (isCreated, resultCreation) {

        if (isCreated) {
            objetRetour.getEtat = true;
            objetRetour.getObjet = resultCreation;

            response.send(objetRetour)
        } else {

            objetRetour.getEtat = false;
            objetRetour.getMessage = resultCreation;

            response.send(objetRetour)
        }
    })

}

/**
 * La fonction qui permet de rechercher une annonce spécifique suivant son identifiant
 * @param {*} database Introduisez la variable qui nous connecte à la base de données
 * @param {*} modelAnnonce Introduisez la variable contenant le model de la table ou de l 'objet
 * @param {*} request Variable qui des requêtes
 * @param {*} response Variable qui fournit les reponses
 */
module.exports.findAnnonceById = function findAnnonceById(database, modelAnnonce, request, response) {

    var id_annonce = request.params.id_annonce,
        objetRetour = require("../../routes/objet_retour").ObjetRetour();

    modelAnnonce.initialize(database);
    modelAnnonce.findOneById(id_annonce, function (isFound, resultAnnonce) {

        if (isFound) {
            objetRetour.getEtat = true;
            objetRetour.getObjet = resultAnnonce;

            response.send(objetRetour);
        } else {

            objetRetour.getEtat = false;
            objetRetour.getMessage = resultAnnonce;

            response.send(objetRetour);
        }
    })
}

/**
 * La fonction qui permet de renvoyer la liste de toutes les annonces
 * @param {*} database Introduisez la variable qui nous connecte à la base de données
 * @param {*} modelAnnonce Introduisez la variable contenant le model de la table ou de l 'objet
 * @param {*} request Variable qui des requêtes
 * @param {*} response Variable qui fournit les reponses
 */
module.exports.getAllAnnonce = function getAllAnnonce(database, modelAnnonce, request, response) {

    var objetRetour = require("../../routes/objet_retour").ObjetRetour();

    modelAnnonce.initialize(database);
    modelAnnonce.getAll(function (isFound, resultAnnonce) {

        if (isFound) {
            objetRetour.getEtat = true;
            objetRetour.getObjet = resultAnnonce;

            response.send(objetRetour);
        } else {

            objetRetour.getEtat = false;
            objetRetour.getMessage = resultAnnonce;

            response.send(objetRetour);
        }
    })
}

/**
 * La fonction qui permet de rechercher les annonces publiées
 * @param {*} database Introduisez la variable qui nous connecte à la base de données
 * @param {*} modelAnnonce Introduisez la variable contenant le model de la table ou de l 'objet
 * @param {*} request Variable qui des requêtes
 * @param {*} response Variable qui fournit les reponses
 */
module.exports.getAllAnnonceWhereFlagTrue = function getAllAnnonceWhereFlagTrue(database, modelAnnonce, request, response) {

    var objetRetour = require("../../routes/objet_retour").ObjetRetour();

    modelAnnonce.initialize(database);
    modelAnnonce.getAllWhereFlagTrue(function (isFound, resultAnnonce) {

        if (isFound) {
            objetRetour.getEtat = true;
            objetRetour.getObjet = resultAnnonce;

            response.send(objetRetour);
        } else {

            objetRetour.getEtat = false;
            objetRetour.getMessage = resultAnnonce;

            response.send(objetRetour);
        }
    })
}

module.exports.getAllAnnonceWhereFlagTrueByIdClient = function getAllAnnonceWhereFlagTrueByIdClient(database, modelAnnonce, request, response) {

    var id_client = request.params.id_client,
        objetRetour = require("../../routes/objet_retour").ObjetRetour();

    modelAnnonce.initialize(database);
    modelAnnonce.getAllWhereFlagTrueByIdClient(id_client, function (isFound, result) {

        if (isFound) {
            objetRetour.getEtat = true;
            objetRetour.getMessage = result;

            response.send(objetRetour)
        } else {

            objetRetour.getEtat = false;
            objetRetour.getMessage = result;

            response.send(objetRetour)
        }
    })
}

/**
 * La fonction qui permet de créer une annonce
 * @param {*} database Introduisez la variable qui nous connecte à la base de données
 * @param {*} modelAnnonce Introduisez la variable contenant le model de la table ou de l 'objet
 * @param {*} request Variable qui des requêtes
 * @param {*} response Variable qui fournit les reponses
 */
module.exports.createAnnonceByDealer = function createAnnonceByDealer(database, modelAnnonce, request, response) {

    var objetRetour = require("../../routes/objet_retour").ObjetRetour(),
        annonce_entity = require("../../Models/entities/annonce_entity").AnnonceByDealer();

    annonce_entity.id_dealer = request.body.id_dealer;
    annonce_entity.intitule_produit = request.body.produit;
    annonce_entity.annotation = request.body.annotation;
    annonce_entity.date_recolte = new Date(request.body.date);
    annonce_entity.qte = parseFloat(request.body.qte);
    annonce_entity.unite = request.body.unite;

    modelAnnonce.initialize(database);
    modelAnnonce.createForDealer(annonce_entity, function (isCreated, resultCreation) {

        if (isCreated) {
            objetRetour.getEtat = true;
            objetRetour.getObjet = resultCreation;

            response.send(objetRetour)
        } else {

            objetRetour.getEtat = false;
            objetRetour.getMessage = resultCreation;

            response.send(objetRetour)
        }
    })

}

/**
 * La fonction qui permet de récupérer les annonce d'un dealer
 * @param {*} database Introduisez la variable qui nous connecte à la base de données
 * @param {*} modelAnnonce Introduisez la variable contenant le model de la table ou de l 'objet
 * @param {*} request Variable qui des requêtes
 * @param {*} response Variable qui fournit les reponses
 */
module.exports.getAllWhereDealerSending = function getAllWhereDealerSending(database, modelAnnonce, request, response) {

    var objetRetour = require("../../routes/objet_retour").ObjetRetour(),
        dealer = {
            "id_client": request.params.id_dealer
        };

    modelAnnonce.initialize(database);
    modelAnnonce.getAllWhereDealerSending(dealer, function (isFound, message, result) {

        if (isFound) {
            objetRetour.getEtat = true;
            objetRetour.getMessage = message;
            objetRetour.getObjet = result;

            response.send(objetRetour)
        } else {

            objetRetour.getEtat = false;
            objetRetour.getMessage = message;

            response.send(objetRetour)
        }
    })
}

/**
 * La fonction qui permet de récupérer les annonce d'un dealer
 * @param {*} database Introduisez la variable qui nous connecte à la base de données
 * @param {*} modelAnnonce Introduisez la variable contenant le model de la table ou de l 'objet
 * @param {*} request Variable qui des requêtes
 * @param {*} response Variable qui fournit les reponses
 */
module.exports.getAllForEbantuSending = function getAllForEbantuSending(database, modelAnnonce, request, response) {

    var objetRetour = require("../../routes/objet_retour").ObjetRetour();

    modelAnnonce.initialize(database);
    modelAnnonce.getAllAnnounceSendingByAdmin((isFound, message, result) => {

        if (isFound) {
            objetRetour.getEtat = true;
            objetRetour.getMessage = message;
            objetRetour.getObjet = result;

            response.send(objetRetour)
        } else {

            objetRetour.getEtat = false;
            objetRetour.getMessage = message;

            response.send(objetRetour)
        }
    })
}
/**
 * La fonction qui permettant d'envoyé un message lors des annonces
 * @param {*} database Introduisez la variable qui nous connecte à la base de données
 * @param {*} modelAnnonce Introduisez la variable contenant le model de la table ou de l 'objet
 * @param {*} request Variable qui des requêtes
 * @param {*} response Variable qui fournit les reponses
 */
module.exports.sendMessageForAnnounce = function sendMessageForAnnounce(database, modelAnnonce, request, response) {

    var objetRetour = require("../../routes/objet_retour").ObjetRetour(),
        message_entity = require("../../Models/entities/annonce_entity").messageContent();

    message_entity.contenu = request.body.contenu,
        message_entity.date = new Date();
    message_entity.flag = true;
    message_entity.id_sender = request.body.id;
    var id_annonce = request.body.id_annonce;

    modelAnnonce.initialize(database);
    modelAnnonce.sendMessageForAnnounce(id_annonce, message_entity, (isCreated, messageSend, resultSend) => {

        if (isCreated) {
            objetRetour.getEtat = true;
            objetRetour.getMessage = messageSend;
            objetRetour.getObjet = resultSend;

            response.send(objetRetour)
        } else {

            objetRetour.getEtat = false;
            objetRetour.getMessage = messageSend;

            response.send(objetRetour)
        }
    })

}

//#endregion

//#region Categorie

/**
 * La méthode que vous avez appelé permet de récupérer toutes les catégories, alors utiliser cela en suivant les instructions de ces paramètres
 * @param {*} database Introduisez la variable qui nous connecte à la base de données
 * @param {*} modelCategory Introduisez la variable contenant le model de la table ou de l'objet
 * @param {*} request Variable qui envoi les requêtes
 * @param {*} response Variable qui fournit les reponses
 */
module.exports.getAllCategories = function getAllCategories(database, modelCategory, request, response) {

    //On appel le module necessaire pour cette fonction
    var objetRetour = require("../../routes/objet_retour").ObjetRetour(),
        nbre = parseInt(request.params.nbre) ? parseInt(request.params.nbre) : null;

    //On initialise le modèle de données
    modelCategory.initialize(database);
    //Puis on éxécute la méthode getAll du modèle
    modelCategory.getAll(nbre, function (isFound, message_category, result_category) {

        //Si les catégories ont été trouvées, alors on attribut les valeurs des retour qui était en quelques sorte un JSON
        if (isFound) {

            objetRetour.getEtat = true;
            objetRetour.getObjet = result_category;
            objetRetour.getMessage = message_category;
            response.send(objetRetour);

        } else { //On fait de même si elles ne sont pas trouvé tout en précisant que si le resultat n'existe pas on mettra null à la place de celui-ci
            objetRetour.getEtat = false;
            result_category ? objetRetour.getObjet = result_category : null;
            objetRetour.getMessage = message_category;
            response.send(objetRetour);
        }
    });
}


/**
 * La méthode que vous avez appelé permet de récupérer les sous-catégories du catégories, alors utiliser cela en suivant les instructions de ces paramètres
 * @param {*} database Introduisez la variable qui nous connecte à la base de données
 * @param {*} modelCategory Introduisez la variable contenant le model de la table ou de l'objet
 * @param {*} request Variable qui envoi les requêtes
 * @param {*} response Variable qui fournit les reponses
 */
module.exports.getUnderCategory = function getUnderCategory(database, modelCategory, request, response) {

    //On appel le module necessaire pour cette fonction
    var objetRetour = require("../../routes/objet_retour").ObjetRetour(),
        id_categorie = request.params.id_categorie;

    //On initialise le modèle de données
    modelCategory.initialize(database);
    //Puis on éxécute la méthode getAll du modèle
    modelCategory.getAllUnderCategoryByIdCategory(id_categorie, function (isFound, message_category, result_category) {

        //Si les catégories ont été trouvées, alors on attribut les valeurs des retour qui était en quelques sorte un JSON
        if (isFound) {

            objetRetour.getEtat = true;
            objetRetour.getObjet = result_category;
            objetRetour.getMessage = message_category;
            response.send(objetRetour);

        } else { //On fait de même si elles ne sont pas trouvé tout en précisant que si le resultat n'existe pas on mettra null à la place de celui-ci
            objetRetour.getEtat = false;
            result_category ? objetRetour.getObjet = result_category : null;
            objetRetour.getMessage = message_category;
            response.send(objetRetour);
        }
    });
}


/**
 * La méthode que vous avez appelé permet de récupérer toutes les catégories pour le mobile, alors utiliser cela en suivant les instructions de ces paramètres
 * @param {*} database Introduisez la variable qui nous connecte à la base de données
 * @param {*} modelCategory Introduisez la variable contenant le model de la table ou de l'objet
 * @param {*} request Variable qui envoi les requêtes
 * @param {*} response Variable qui fournit les reponses
 */
module.exports.getAllCategoriesForMobile = function getAllCategoriesForMobile(database, modelCategory, request, response) {

    //On appel le module necessaire pour cette fonction
    var objetRetour = require("../../routes/objet_retour").ObjetRetour();

    //On initialise le modèle de données
    modelCategory.initialize(database);
    //Puis on éxécute la méthode getAll du modèle
    modelCategory.getAllForMobile(function (isFound, message_category, result_category) {

        //Si les catégories ont été trouvées, alors on attribut les valeurs des retour qui était en quelques sorte un JSON
        if (isFound) {

            objetRetour.getEtat = true;
            objetRetour.getObjet = result_category;
            objetRetour.getMessage = message_category;
            response.send(objetRetour);

        } else { //On fait de même si elles ne sont pas trouvé tout en précisant que si le resultat n'existe pas on mettra null à la place de celui-ci
            objetRetour.getEtat = false;
            result_category ? objetRetour.getObjet = result_category : null;
            objetRetour.getMessage = message_category;
            response.send(objetRetour);
        }
    });
}

//#endregion

//#region Client

/**
 * La méthode que vous avez appelé permet de créer un simple client mais aussi un dealer, alors utiliser cela en suivant les instructions de ces paramètre
 * @param {*} database Introduisez la variable qui nous connecte à la base de données 
 * @param {*} modelClient Introduisez la variable contenant le model de la table ou de l'objet  
 * @param {*} request Variable qui envoi des requête
 * @param {*} response Variable qui fournit la reponse
 */
module.exports.createClient = function createClient(database, modelClient, request, response) {

    //On appel les modules necessaire pour cette fonction
    var objetRetour = require("../../routes/objet_retour").ObjetRetour(),
        client_entity = require("../entities/client_entity").Client(),
        username  = require("../entities/client_entity").ClientUsername();
    var name, size;
            
    username.valeur = request.body.username;
    username.etat = true;
    username.type =  request.body.type;      

    //On attribut des valeurs aux propriété de client_entity
    client_entity.nom = request.body.nom;
    client_entity.prenom = request.body.prenom;
    client_entity.sexe = request.body.sexe;
    client_entity.inscription.type_paiement.push(request.body.type_paiement);
    client_entity.inscription.username.push(username);
    client_entity.inscription.password.push(request.body.password);
    //client_entity.adresse.push(adresse_domicile);
    client_entity.inscription.date = new Date();
    client_entity.type = request.body.type_client ? request.body.type_client : null;

    //On initialise le modèle de données
    modelClient.initialize(database);
    //Puis on éxécute la méthode create du modèle
    modelClient.create(client_entity, function (isCreated, message_client, result_client) {

        //Si le client est crée, alors on attribut les valeurs des retour qui était en quelques sorte un JSON
        if (isCreated) {

            objetRetour.getEtat = true;
            objetRetour.getObjet = result_client;
            objetRetour.getMessage = message_client;
            response.send(objetRetour);

        } else { //On fait de même s'il n'est pas créer tout en précisant que si le resultat n'existe pas on mettra null à la place de celui-ci

            objetRetour.getEtat = false;
            result_client ? objetRetour.getObjet = result_client : null;
            objetRetour.getMessage = message_client;
            response.send(objetRetour);
        }
    });
}

/**
 * La méthode permettant d'activer un compte
 * @param {*} database Introduisez la variable qui nous connecte à la base de données 
 * @param {*} modelClient Introduisez la variable contenant le model de la table ou de l'objet  
 * @param {*} request Variable qui envoi des requête
 * @param {*} response Variable qui fournit la reponse
 */
module.exports.activateAccount = function activateAccount(database, modelClient, request, response) {

    //On appel les modules necessaire pour cette fonction
    var objetRetour = require("../../routes/objet_retour").ObjetRetour(),
        id_client = request.body.id_client,
        code = request.body.code;

    //On initialise le modèle de données
    modelClient.initialize(database);
    //Puis on éxécute la méthode create du modèle
    modelClient.activateAccount(id_client, code, function (isActive, message_client, result_client) {

        //Si le client est crée, alors on attribut les valeurs des retour qui était en quelques sorte un JSON
        if (isActive) {

            objetRetour.getEtat = true;
            objetRetour.getObjet = result_client;
            objetRetour.getMessage = message_client;
            response.send(objetRetour);

        } else { //On fait de même s'il n'est pas créer tout en précisant que si le resultat n'existe pas on mettra null à la place de celui-ci

            objetRetour.getEtat = false;
            result_client ? objetRetour.getObjet = result_client : null;
            objetRetour.getMessage = message_client;
            response.send(objetRetour);
        }
    });
}

/**
 * La méthode permettant la demande d'un nouveau code
 * @param {*} database Introduisez la variable qui nous connecte à la base de données 
 * @param {*} modelClient Introduisez la variable contenant le model de la table ou de l'objet  
 * @param {*} request Variable qui envoi des requête
 * @param {*} response Variable qui fournit la reponse
 */
module.exports.requestNewCode = function requestNewCode(database, modelClient, request, response) {

    //On appel les modules necessaire pour cette fonction
    var objetRetour = require("../../routes/objet_retour").ObjetRetour(),
        id_client = request.params.id_client;

    //On initialise le modèle de données
    modelClient.initialize(database);
    //Puis on éxécute la méthode create du modèle
    modelClient.requestNewCode(id_client, (isResponse, message_client, result_client) => {

        //Si le client est crée, alors on attribut les valeurs des retour qui était en quelques sorte un JSON
        if (isResponse) {

            objetRetour.getEtat = true;
            objetRetour.getObjet = result_client;
            objetRetour.getMessage = message_client;
            response.send(objetRetour);

        } else { //On fait de même s'il n'est pas créer tout en précisant que si le resultat n'existe pas on mettra null à la place de celui-ci

            objetRetour.getEtat = false;
            result_client ? objetRetour.getObjet = result_client : null;
            objetRetour.getMessage = message_client;
            response.send(objetRetour);
        }
    });
}

/**
 * Méthode qui permet de trouver toutes les informations sur le client actuelle
 * @param {*} database Introduisez la variable qui nous connecte à la base de données 
 * @param {*} modelClient Introduisez la variable contenant le model de la table ou de l'objet  
 * @param {*} request Variable qui envoi des requête
 * @param {*} response Variable qui fournit la reponse
 */
module.exports.getAllInfoClient = function getAllInfoClient(database, modelClient, request, response) {

    //On appel les modules necessaire pour cette fonction
    var objetRetour = require("../../routes/objet_retour").ObjetRetour(),
        id_client = request.params.id_client;
    //On initialise le modèle de données
    modelClient.initialize(database);
    //Puis on éxécute la méthode createDealer du modèle
    modelClient.getAllInfo(id_client, function (isMatched, message_client, result_client) {

        //Si le client est crée, alors on attribut les valeurs des retour qui était en quelques sorte un JSON
        if (isMatched) {

            objetRetour.getEtat = true;
            objetRetour.getObjet = result_client;
            objetRetour.getMessage = message_client;
            response.send(objetRetour);

        } else { //Si le client est crée, alors on attribut les valeurs des retour qui était en quelques sorte un JSON

            objetRetour.getEtat = false;
            result_client ? objetRetour.getObjet = result_client : null;
            objetRetour.getMessage = message_client;
            response.send(objetRetour);
        }
    });
}

/**
 * Méthode qui permet de trouver toutes les informations sur le client actuelle
 * @param {*} database Introduisez la variable qui nous connecte à la base de données 
 * @param {*} modelClient Introduisez la variable contenant le model de la table ou de l'objet  
 * @param {*} request Variable qui envoi des requête
 * @param {*} response Variable qui fournit la reponse
 */
module.exports.getAllAvatar = function getAllAvatar(database, modelClient, request, response) {

    //On appel les modules necessaire pour cette fonction
    var objetRetour = require("../../routes/objet_retour").ObjetRetour(),
        id_client = request.body.id_client;
    //On initialise le modèle de données
    modelClient.initialize(database);
    //Puis on éxécute la méthode createDealer du modèle
    modelClient.getAllAvatar(id_client, function (isMatched, message_client, result_client) {

        //Si le client est crée, alors on attribut les valeurs des retour qui était en quelques sorte un JSON
        if (isMatched) {

            objetRetour.getEtat = true;
            objetRetour.getObjet = result_client;
            objetRetour.getMessage = message_client;
            response.send(objetRetour);

        } else { //Si le client est crée, alors on attribut les valeurs des retour qui était en quelques sorte un JSON

            objetRetour.getEtat = false;
            result_client ? objetRetour.getObjet = result_client : null;
            objetRetour.getMessage = message_client;
            response.send(objetRetour);
        }
    });
}

/**
 * La fonction qui permet de vérifier le numéro de téléphone ou l'email de l'utilisateur
 * Lors de la création du compte
 */
module.exports.checkPhoneOrEmailWhenRegister = function checkPhoneOrEmailWhenRegister(database, modelClient, request, response) {

    var valeur_entree = request.body.valeur_entree,
        objetRetour = require("../../routes/objet_retour").ObjetRetour();

    modelClient.initialize(database);
    modelClient.checkPhoneOrEmailWhenRegister(valeur_entree, function (isMatched, result) {

        if (isMatched) {
            objetRetour.getEtat = true;
            objetRetour.getObjet = result;

            response.send(objetRetour);
        } else {
            objetRetour.getEtat = false;
            objetRetour.getMessage = result;

            response.send(objetRetour);
        }
    })

}


/**
 * La fonction qui permet de vérifier le numéro de téléphone ou l'email de l'utilisateur
 * Lors de la récupération de son compte 
 */
module.exports.checkPhoneOrEmail = function checkPhoneOrEmail(database, modelClient, request, response) {

    var valeur_entree = request.body.valeur_entree,
        objetRetour = require("../../routes/objet_retour").ObjetRetour();

    modelClient.initialize(database);
    modelClient.checkPhoneOrEmail(valeur_entree, function (isMatched, result) {

        if (isMatched) {
            objetRetour.getEtat = true;
            objetRetour.getObjet = result;

            response.send(objetRetour);
        } else {
            objetRetour.getEtat = false;
            objetRetour.getMessage = result;

            response.send(objetRetour);
        }
    })

}

/**
 * La fonction qui permet de vérifier le numéro de téléphone ou l'email de l'utilisateur
 * Lors de la récupération de son compte 
 */
module.exports.updatePassWord = function updatePassWord(database, modelClient, request, response) {

    var valeur_username = request.body.valeur_username,
        code_validation = request.body.code_validation,
        nouveau_password = request.body.nouveau_password,
        objetRetour = require("../../routes/objet_retour").ObjetRetour();

    modelClient.initialize(database);
    modelClient.updatePassWord(valeur_username, code_validation, nouveau_password,
        function (isPwdUpdate, resultPwd) {

            if (isPwdUpdate) {
                objetRetour.getEtat = true;
                objetRetour.getObjet = resultPwd;

                response.send(objetRetour);
            } else {

                objetRetour.getEtat = false;
                objetRetour.getMessage = resultPwd;

                response.send(objetRetour);
            }
        })

}

/**
 * La fonction qui permet au client de se loguer
 */
module.exports.login = function login(database, modelClient, request, response) {

    var objetRetour = require("../../routes/objet_retour").ObjetRetour(),
        valeur_username = request.body.valeur_username,
        password = request.body.password;

    modelClient.initialize(database);
    modelClient.login(valeur_username, password, function (isValid, resultLogin) {

        if (isValid) {
            objetRetour.getEtat = true;
            objetRetour.getObjet = resultLogin;

            response.send(objetRetour);
        } else {

            objetRetour.getEtat = false;
            objetRetour.getMessage = resultLogin;

            response.send(objetRetour);
        }
    })

}

/**
 * 
 * @param {*} database Introduisez la variable qui nous connecte à la base de donnée
 * @param {*} modelClient Introduisez la variable contenant le model de la table ou de l'objet
 * @param {*} request Variable qui envoi des requête
 * @param {*} response Variable qui fournit la reponse
 */
module.exports.updateAvatar = function updateAvatar(database, modelClient, request, response) {

    var id_user = request.body.id_user,
        path = request.body.path,
        name = request.body.name,
        web_size = request.body.web_size,
        mobile_size = request.body.mobile_size,
        objetRetour = require("../../routes/objet_retour").ObjetRetour();

    modelClient.initialize(database);
    modelClient.updateAvatar(id_user, path, name, web_size, mobile_size, function (isAvatarUpdate, messageAvatar, resultAvatar) {

            if (isAvatarUpdate) {
                objetRetour.getEtat = true;
                objetRetour.getObjet = resultAvatar;
                objetRetour.getMessage = messageAvatar
                response.send(objetRetour);
            } else {

                objetRetour.getEtat = false;
                objetRetour.getObjet = resultAvatar ? resultAvatar : null;
                objetRetour.getMessage = messageAvatar;

                response.send(objetRetour);
            }
        })

}

/**
 * Cette fonction permet la mise à jour de l'adresse d'un client donné
 * @param {*} database Introduisez la variable qui nous connecte à la base de donnée
 * @param {*} modelClient Introduisez la variable contenant le model de la table ou de l'objet
 * @param {*} request Variable qui envoi des requête
 * @param {*} response Variable qui fournit la reponse
 */
module.exports.updateAdress = function updateAdress(database, modelClient, request, response) {

    var id_client = request.body.id_client,
        adresse = {
            "id" : null,
            "province" : request.body.province ? request.body.province : null,
            "ville": request.body.ville ? request.body.ville : null,
            "commune": request.body.commune ? request.body.commune : null,
            "quartier": request.body.quartier ? request.body.quartier : null,
            "avenue": request.body.avenue ? request.body.avenue : null,
            "numero": request.body.numero ? request.body.numero : null,
            "reference": request.body.reference ? request.body.reference : null,
            "type": request.body.type_ ? request.body.type_ : null,
            "flag": request.body.flag ? request.body.flag : null
        },
        objetRetour = require("../../routes/objet_retour").ObjetRetour();

    modelClient.initialize(database);
    modelClient.updateAdress(id_client, adresse, function (isAdressUpdate, upToDateAdressResult) {

        if (isAdressUpdate) {
            objetRetour.getEtat = true;
            objetRetour.getObjet = upToDateAdressResult
            response.send(objetRetour);
        } else {

            objetRetour.getEtat = false;
            objetRetour.getMessage = upToDateAdressResult;

            response.send(objetRetour);
        }
    })

}

/**
 * 
 * @param {*} database Introduisez la variable qui nous connecte à la base de donnée
 * @param {*} modelClient Introduisez la variable contenant le model de la table ou de l'objet
 * @param {*} request Variable qui envoi des requête
 * @param {*} response Variable qui fournit la reponse
 */
module.exports.updateInfoClient = function updateInfoClient(database, modelClient, request, response) {

    var info = {
            "id_client": request.body.id_client,
            "prenom": request.body.prenom ? request.body.prenom : null,
            "nom": request.body.nom ? request.body.nom : null,
            "type": request.body.type_client ? request.body.type_client : null
        },
        objetRetour = require("../../routes/objet_retour").ObjetRetour();

    modelClient.initialize(database);
    modelClient.updateInfo(info, function (isInfoUpdate, messageInfoUpdate, resultInfoUpdate) {

        if (isInfoUpdate) {
            objetRetour.getEtat = true;
            objetRetour.getMessage = messageInfoUpdate;
            objetRetour.getObjet = resultInfoUpdate;
            response.send(objetRetour);
        } else {

            objetRetour.getEtat = false;
            objetRetour.getMessage = messageInfoUpdate;
            objetRetour.getObjet = resultInfoUpdate ? resultInfoUpdate : null;

            response.send(objetRetour);
        }
    })

}

/**
 * La fonction permettant de mettre à jour le username d'un client
 * @param {*} database Introduisez la variable qui nous connecte à la base de donnée
 * @param {*} modelClient Introduisez la variable contenant le model de la table ou de l'objet
 * @param {*} request Variable qui envoi des requête
 * @param {*} response Variable qui fournit la reponse
 */
module.exports.updateUsernameClient = function updateUsernameClient(database, modelClient, request, response) {
    
    var username = {
        "valeur" : request.body.valeur,
        "etat" : true,
        "type" : request.body.type
    },

    id_client = request.body.id_client,
    objetRetour = require("../../routes/objet_retour").ObjetRetour();

    modelClient.initialize(database);
    modelClient.updateUsername(id_client, username, function (isUsernameUpdated, resultUsernameUpdated) {

        if (isUsernameUpdated) {
            objetRetour.getEtat = true;
            objetRetour.getObjet = resultUsernameUpdated;
            response.send(objetRetour);
        } else {

            objetRetour.getEtat = false;
            objetRetour.getMessage = resultUsernameUpdated ? resultUsernameUpdated : null;

            response.send(objetRetour);
        }
    })
}

/**
 * La fonction permettant de mettre à jour le type_paiement d'un client
 * @param {*} database Introduisez la variable qui nous connecte à la base de donnée
 * @param {*} modelClient Introduisez la variable contenant le model de la table ou de l'objet
 * @param {*} request Variable qui envoi des requête
 * @param {*} response Variable qui fournit la reponse
 */
module.exports.updateTypePaiementClient = function updateTypePaiementClient(database, modelClient, request, response) {
    
    var type_paiment = {
        "pin" : request.body.pin,
        "intitule" : request.body.intitule,
        "default" : request.body.default
    },
    id_client = request.body.id_client,
    objetRetour = require("../../routes/objet_retour").ObjetRetour();

    modelClient.initialize(database);
    modelClient.updateTypePaiement(id_client, type_paiment, function (isTypePaiementUpdated, resultTypePaiementUpdated) {

        if (isTypePaiementUpdated) {
            objetRetour.getEtat = true;
            objetRetour.getObjet = resultTypePaiementUpdated;
            response.send(objetRetour);
        } else {

            objetRetour.getEtat = false;
            objetRetour.getMessage = resultTypePaiementUpdated ? resultTypePaiementUpdated : null;

            response.send(objetRetour);
        }
    })
}

/**
 * Méthode qui permet de trouver toutes les informations sur le client actuelle
 * @param {*} database Introduisez la variable qui nous connecte à la base de données 
 * @param {*} modelClient Introduisez la variable contenant le model de la table ou de l'objet  
 * @param {*} request Variable qui envoi des requête
 * @param {*} response Variable qui fournit la reponse
 */
module.exports.clientBecomeDealer = function clientBecomeDealer(database, modelClient, request, response) {

    //On appel les modules necessaire pour cette fonction
    var objetRetour = require("../../routes/objet_retour").ObjetRetour(),
        id_client = request.params.id_client,
        details_dealer = require("../../Models/entities/dealer_entity").Details();

    details_dealer.rccm = request.body.rccm;
    details_dealer.id_nat = request.body.id_nat;
    details_dealer.description = request.body.description;
    details_dealer.web_site = request.body.web_size;
    details_dealer.facebook = request.body.facebook;
    details_dealer.twitter = request.body.twitter;
    details_dealer.instagram = request.body.instagram;

    //On initialise le modèle de données
    modelClient.initialize(database);
    modelClient.becomeDealer(id_client, details_dealer, function(isDealer, messageDealer, resultDealer) {
        
        if(isDealer){
            objetRetour.getEtat = true; 
            objetRetour.getMessage = messageDealer;
            objetRetour.getObjet = resultDealer;

            response.send(objetRetour);
        }else{

            objetRetour.getEtat = false; 
            objetRetour.getMessage = messageDealer;
            objetRetour.getObjet = resultDealer;

            response.send(objetRetour);
        }
    })
}

/**
 * Méthode qui permet de trouver toutes les informations sur le client actuelle
 * @param {*} database Introduisez la variable qui nous connecte à la base de données 
 * @param {*} modelClient Introduisez la variable contenant le model de la table ou de l'objet  
 * @param {*} request Variable qui envoi des requête
 * @param {*} response Variable qui fournit la reponse
 */
module.exports.testAccountActive = function testAccountActive(database, modelClient, request, response) {

    //On appel les modules necessaire pour cette fonction
    var objetRetour = require("../../routes/objet_retour").ObjetRetour(),
        id_client = request.params.id_client;
    //On initialise le modèle de données
    modelClient.initialize(database);
    modelClient.testIsActive(id_client, function(isActive, message_client, result_client) {
        
        if(isActive){
            objetRetour.getEtat = true; 
            objetRetour.getMessage = message_client;
            objetRetour.getObjet = result_client;

            response.send(objetRetour);
        }else{

            objetRetour.getEtat = false; 
            objetRetour.getMessage = message_client;
            objetRetour.getObjet = result_client;

            response.send(objetRetour);
        }
    })
}

//#endregion

//#region Commande

/**
 * La méthode que vous avez appelé permet d'effectuer une commande, alors utiliser cela en suivant les instructions de ces paramètres
 * @param {*} database Introduisez la variable qui nous connecte à la base de données
 * @param {*} modelCommande Introduisez la variable contenant le model de la table ou de l 'objet
 * @param {*} request Variable qui des requêtes
 * @param {*} response Variable qui fournit les reponses
 */
module.exports.newCommande = function newCommande(database, modelCommande, request, response) {

    //On appel les modules necessaire pour cette fonction
    var objetRetour = require("../../routes/objet_retour").ObjetRetour(),
        commande_entity = require("../entities/commande_entity").Commande();

    //On attribut des valeurs aux propriétés de commande_entity
    commande_entity.date = new Date();
    commande_entity.client.id = request.body.id_client;
    commande_entity.client.localisation_livraison = request.body.adresse_livraison;
    commande_entity.client.id_beneficiaire = request.body.id_beneficiaire;

    //On recupère les produits commandés
    var montant_total_commande =  0;
    if(request.body.produits.length > 0){
        request.body.produits.forEach(function (produit) {

            var produit_commande =  require("../entities/commande_entity").ProduitCommande();
            
            produit_commande.id_produit = produit.id_produit;
            produit_commande.id_lieu_vente = produit.id_lieu_vente;
            produit_commande.id_commune = produit.adresse.id_commune;
            produit_commande.id_dealer = produit.id_dealer;
            produit_commande.quantite = produit.quantite;
            produit_commande.pu = produit.details.pu;
            produit_commande.unite = produit.details.unite;
    
            commande_entity.produits.push(produit_commande);
    
            //On incrémente le montant total de la facture
            montant_total_commande += (produit_commande.pu * produit_commande.quantite);
    
        }, this);
    }
    
    //Si le client a renseigné la livraison
    if(request.body.duree_livraison){
        var paiement_livraison = require("../entities/commande_entity").PaiementLivraison();
        paiement_livraison.duree = request.body.duree_livraison;
        paiement_livraison.cout = request.body.cout_livraison;
        paiement_livraison.devise = "USD";
        
        commande_entity.paiement.livraison = paiement_livraison;

        //On met à jour le montant total à payer
        montant_total_commande += paiement_livraison.cout; 
    }

    //L'entité de paiement de la commande
    var paiement_commande = require("../entities/commande_entity").PaiementCommande();
    paiement_commande.date = new Date();
    paiement_commande.pin = request.body.pin_paiement;
    paiement_commande.cout = montant_total_commande;

    commande_entity.paiement.commande = paiement_commande;
    
    //On initialise le modèle de données
    modelCommande.initialize(database);
    //Puis on éxécute la méthode create du modèle
    modelCommande.create(commande_entity, function (isCreated, message_commande, result_commande) {

        //Si la commande est crée, alors on attribut les valeurs des retour qui était en quelques sorte un JSON
        if (isCreated) {

            objetRetour.getEtat = true;
            objetRetour.getObjet = result_commande;
            objetRetour.getMessage = message_commande;
            response.send(objetRetour);

        } else { //On fait de même s'il n'est pas créer tout en précisant que si le resultat n'existe pas on mettra null à la place de celui-ci

            objetRetour.getEtat = false;
            result_commande ? objetRetour.getObjet = result_commande : null;
            objetRetour.getMessage = message_commande;
            response.send(objetRetour);
        }
    });
}

/**
 * La méthode qui permet d'afficher les top des commandes : meilleurs produits et leurs catégories
 * @param {*} database Introduisez la variable qui nous connecte à la base de données
 * @param {*} modelCommande Introduisez la variable contenant le model de la table ou de l 'objet
 * @param {*} request Variable qui des requêtes
 * @param {*} response Variable qui fournit les reponses
 */
module.exports.getTopCommande = function getTopCommande(database, modelCommande, request, response) {

    var objetRetour = require("../../routes/objet_retour").ObjetRetour(),
        top = parseInt(request.params.top),
        id_client = request.params.id_client;

    modelCommande.initialize(database);
    modelCommande.getTop(id_client, top, function (isTopMatched, resultTop) {

        if (isTopMatched) {

            objetRetour.getEtat = true;
            objetRetour.getObjet = resultTop;

            response.send(objetRetour);
        } else {
            objetRetour.getEtat = false;
            objetRetour.getMessage = resultTop;

            response.send(objetRetour);
        }
    })
}


/**
 * La méthode qui permet d'afficher le nombre de commande passé par un client
 * @param {*} database Introduisez la variable qui nous connecte à la base de données
 * @param {*} modelCommande Introduisez la variable contenant le model de la table ou de l 'objet
 * @param {*} request Variable qui des requêtes
 * @param {*} response Variable qui fournit les reponses
 */
module.exports.getCountCommande = function getCountCommande(database, modelCommande, request, response) {

    var objetRetour = require("../../routes/objet_retour").ObjetRetour(),
        id_client = request.params.id_client;

    modelCommande.initialize(database);
    modelCommande.getCount(id_client, function (isCountMatched, result) {

        if (isCountMatched) {

            objetRetour.getEtat = true;
            objetRetour.getMessage = result;

            response.send(objetRetour);
        } else {
            objetRetour.getEtat = false;
            objetRetour.getMessage = result;

            response.send(objetRetour);
        }
    })
}

/**
 * Méthode qui permet de trouver toutes les commandes que le client à passé genre un historique
 * @param {*} database Introduisez la variable qui nous connecte à la base de données 
 * @param {*} modelCommande Introduisez la variable contenant le model de la table ou de l'objet  
 * @param {*} request Variable qui envoi des requête
 * @param {*} response Variable qui fournit la reponse
 */
module.exports.getAllCommandeForThisClient = function getAllCommandeForThisClient(database, modelCommande, request, response) {

    //On appel les modules necessaire pour cette fonction
    var objetRetour = require("../../routes/objet_retour").ObjetRetour(),
        id_client = request.params.id_client;
    //On initialise le modèle de données
    modelCommande.initialize(database);
    //Puis on éxécute la méthode createDealer du modèle
    modelCommande.getAllByIdClient(id_client, function (isMatched, message_commande, result_commande) {

        //Si le client est crée, alors on attribut les valeurs des retour qui était en quelques sorte un JSON
        if (isMatched) {

            objetRetour.getEtat = true;
            objetRetour.getObjet = result_commande;
            objetRetour.getMessage = message_commande;
            response.send(objetRetour);

        } else { //Si le client est crée, alors on attribut les valeurs des retour qui était en quelques sorte un JSON

            objetRetour.getEtat = false;
            result_commande ? objetRetour.getObjet = result_commande : null;
            objetRetour.getMessage = message_commande;
            response.send(objetRetour);
        }
    });
}

/**
 * La méthode qui permet permet l'assignation d'un agent de livraison pour livrer une commande
 * Et aussi au client de confirmer la livraison
 * @param {*} database Introduisez la variable qui nous connecte à la base de données
 * @param {*} modelCommande Introduisez la variable contenant le model de la table ou de l 'objet
 * @param {*} request Variable qui envoi des requêtes
 * @param {*} response Variable qui fournit les reponses
 */
module.exports.setOperationForDelivery = function setOperationForDelivery(database, modelCommande, request, response) {

    var objetRetour = require("../../routes/objet_retour").ObjetRetour(),
        id_commande = request.body.id_commande,
        id_agent = request.body.id_agent;

    modelCommande.initialize(database);

    modelCommande.setOperation(id_commande, id_agent, function (isSet, message_commande, result_commande) {

        if (isSet) {
            objetRetour.getEtat = true;
            objetRetour.getObjet = result_commande;
            objetRetour.getMessage = message_commande;
            response.send(objetRetour);
        } else {
            objetRetour.getEtat = false;
            result_commande ? objetRetour.getObjet = result_commande : null;
            objetRetour.getMessage = message_commande;
            response.send(objetRetour);
        }
    })
}

/**
 * Méthode qui permet de trouver le nombre de commande éffectuer pour les produits de ce dealer
 * @param {*} database Introduisez la variable qui nous connecte à la base de données 
 * @param {*} modelCommande Introduisez la variable contenant le model de la table ou de l'objet  
 * @param {*} request Variable qui envoi des requête
 * @param {*} response Variable qui fournit la reponse
 */
module.exports.getCountCommandeForProductsThisDealer = function getCountCommandeForProductsThisDealer(database, modelCommande, request, response) {

    //On appel les modules necessaire pour cette fonction
    var objetRetour = require("../../routes/objet_retour").ObjetRetour(),
        id_dealer = request.params.id_dealer;
    //On initialise le modèle de données
    modelCommande.initialize(database);
    //Puis on éxécute la méthode createDealer du modèle
    modelCommande.getCountCommandeTheProductOfThisDealer(id_dealer, function (isMatched, message_commande, result_commande) {

        //Si le client est crée, alors on attribut les valeurs des retour qui était en quelques sorte un JSON
        if (isMatched) {

            objetRetour.getEtat = true;
            objetRetour.getObjet = result_commande;
            objetRetour.getMessage = message_commande;
            response.send(objetRetour);

        } else { //Si le client est crée, alors on attribut les valeurs des retour qui était en quelques sorte un JSON

            objetRetour.getEtat = false;
            result_commande ? objetRetour.getObjet = result_commande : null;
            objetRetour.getMessage = message_commande;
            response.send(objetRetour);
        }
    });
}

/**
 * Méthode qui permet de trouver le nombre de commande éffectuer pour les produits de ce dealer
 * @param {*} database Introduisez la variable qui nous connecte à la base de données 
 * @param {*} modelCommande Introduisez la variable contenant le model de la table ou de l'objet  
 * @param {*} request Variable qui envoi des requête
 * @param {*} response Variable qui fournit la reponse
 */
module.exports.getCountAchatForProductsThisDealer = function getCountAchatForProductsThisDealer(database, modelCommande, request, response) {

    //On appel les modules necessaire pour cette fonction
    var objetRetour = require("../../routes/objet_retour").ObjetRetour(),
        id_dealer = request.params.id_dealer;
    //On initialise le modèle de données
    modelCommande.initialize(database);
    //Puis on éxécute la méthode createDealer du modèle
    modelCommande.getCountAchatTheProductOfThisDealer(id_dealer, function (isMatched, message_commande, result_commande) {

        //Si le client est crée, alors on attribut les valeurs des retour qui était en quelques sorte un JSON
        if (isMatched) {

            objetRetour.getEtat = true;
            objetRetour.getObjet = result_commande;
            objetRetour.getMessage = message_commande;
            response.send(objetRetour);

        } else { //Si le client est crée, alors on attribut les valeurs des retour qui était en quelques sorte un JSON

            objetRetour.getEtat = false;
            result_commande ? objetRetour.getObjet = result_commande : null;
            objetRetour.getMessage = message_commande;
            response.send(objetRetour);
        }
    });
}

/**
 * Méthode qui permet de trouver le nombre de commande éffectuer pour les produits de ce dealer
 * @param {*} database Introduisez la variable qui nous connecte à la base de données 
 * @param {*} modelCommande Introduisez la variable contenant le model de la table ou de l'objet  
 * @param {*} request Variable qui envoi des requête
 * @param {*} response Variable qui fournit la reponse
 */
module.exports.getAmountThisDealer = function getAmountThisDealer(database, modelCommande, request, response) {

    //On appel les modules necessaire pour cette fonction
    var objetRetour = require("../../routes/objet_retour").ObjetRetour(),
        id_dealer = request.params.id_dealer;
    //On initialise le modèle de données
    modelCommande.initialize(database);
    //Puis on éxécute la méthode createDealer du modèle
    modelCommande.getAmounOfSale(id_dealer, function (isMatched, message_commande, result_commande) {

        //Si le client est crée, alors on attribut les valeurs des retour qui était en quelques sorte un JSON
        if (isMatched) {

            objetRetour.getEtat = true;
            objetRetour.getObjet = result_commande;
            objetRetour.getMessage = message_commande;
            response.send(objetRetour);

        } else { //Si le client est crée, alors on attribut les valeurs des retour qui était en quelques sorte un JSON

            objetRetour.getEtat = false;
            result_commande ? objetRetour.getObjet = result_commande : null;
            objetRetour.getMessage = message_commande;
            response.send(objetRetour);
        }
    });
}


/**
 * Méthode qui permet de récupérer les détails d'une commande quelconque
 * @param {*} database Introduisez la variable qui nous connecte à la base de données 
 * @param {*} modelCommande Introduisez la variable contenant le model de la table ou de l'objet  
 * @param {*} request Variable qui envoi des requête
 * @param {*} response Variable qui fournit la reponse
 */
module.exports.getDetailsCommande = function getDetailsCommande(database, modelCommande, request, response) {

    //On appel les modules necessaire pour cette fonction
    var objetRetour = require("../../routes/objet_retour").ObjetRetour(),
        id_commande = request.params.id_commande;
    //On initialise le modèle de données
    modelCommande.initialize(database);
    //Puis on éxécute la méthode createDealer du modèle
    modelCommande.getDetailsForCommande(id_commande, function (isMatched, message_commande, result_commande) {

        //Si le client est crée, alors on attribut les valeurs des retour qui était en quelques sorte un JSON
        if (isMatched) {

            objetRetour.getEtat = true;
            objetRetour.getObjet = result_commande;
            objetRetour.getMessage = message_commande;
            response.send(objetRetour);

        } else { //Si le client est crée, alors on attribut les valeurs des retour qui était en quelques sorte un JSON

            objetRetour.getEtat = false;
            result_commande ? objetRetour.getObjet = result_commande : null;
            objetRetour.getMessage = message_commande;
            response.send(objetRetour);
        }
    });
}

/**
 * Méthode qui permet de récupérer le nombre de personnes ayant commandé ce produit
 * @param {*} database Introduisez la variable qui nous connecte à la base de données 
 * @param {*} modelCommande Introduisez la variable contenant le model de la table ou de l'objet  
 * @param {*} request Variable qui envoi des requête
 * @param {*} response Variable qui fournit la reponse
 */
module.exports.getCountClientCommandeProduct = function getCountClientCommandeProduct(database, modelCommande, request, response) {

    //On appel les modules necessaire pour cette fonction
    var objetRetour = require("../../routes/objet_retour").ObjetRetour(),
        id_produit = request.params.id_produit;
    //On initialise le modèle de données
    modelCommande.initialize(database);
    //Puis on éxécute la méthode createDealer du modèle
    modelCommande.getCountClientCommandeProduct(id_produit, (isGet, message_commande, result_commande) => {

        //Si le client est crée, alors on attribut les valeurs des retour qui était en quelques sorte un JSON
        if (isGet) {

            objetRetour.getEtat = true;
            objetRetour.getObjet = result_commande;
            objetRetour.getMessage = message_commande;
            response.send(objetRetour);

        } else { //Si le client est crée, alors on attribut les valeurs des retour qui était en quelques sorte un JSON

            objetRetour.getEtat = false;
            result_commande ? objetRetour.getObjet = result_commande : null;
            objetRetour.getMessage = message_commande;
            response.send(objetRetour);
        }
    });
}

//#endregion

//#region Commune

/**
 * La méthode que vous avez appelé permet de lister toutes les commune liées à une ville, alors utiliser cela en suivant les instructions de ces paramètres
 * @param {*} database Introduisez la variable qui nous connecte à la base de données
 * @param {*} modelCommune Introduisez la variable contenant le model de la table ou de l 'objet
 * @param {*} request Variable qui des requêtes
 * @param {*} response Variable qui fournit les reponses
 */
module.exports.findAllCommuneByIdVille = function findAllCommuneByIdVille(database, modelCommune, request, response) {
    
    //On appel les modules necessaire pour cette fonction
    var objetRetour = require("../../routes/objet_retour").ObjetRetour(),
        id_ville = request.params.id_ville;

    //On initialise le modèle de données
    modelCommune.initialize(database);

    modelCommune.findAllByIdVille(id_ville, function(isFound, messageFound, resultFound) {
        
        objetRetour.getEtat = isFound;
        objetRetour.getMessage = messageFound;
        objetRetour.getObjet = resultFound;

        response.send(objetRetour);
    })
}

//#endregion 

//#region Contact

/**
 * L améthode qui permet de contacter l'administration e-Bantu
 * @param {*} database Introduisez la variable qui nous connecte à la base de données 
 * @param {*} modelContact Introduisez la variable contenant le model de la table ou de l'objet  
 * @param {*} request Variable qui envoi des requête
 * @param {*} response Variable qui fournit la reponse
 */
module.exports.contactUs = function contactUs(database, modelContact, request, response) {

    //On appel les modules necessaire pour cette fonction
    var objetRetour = require("../../routes/objet_retour").ObjetRetour(),
        contact_entity = require("../entities/contact_entity").Contact(),
        id_client = request.body.id_client;

    contact_entity.noms = request.body.noms;
    contact_entity.email = request.body.email;
    contact_entity.objet = request.body.objet;
    contact_entity.message = request.body.message;
    
    //On initialise le modèle de données
    modelContact.initialize(database);
    //Puis on éxécute la méthode create du modèle
    modelContact.create(id_client, contact_entity, function (isCreated, messageContact, resultContact) {

        //Si le client est crée, alors on attribut les valeurs des retour qui était en quelques sorte un JSON
        if (isCreated) {

            objetRetour.getEtat = true;
            objetRetour.getObjet = resultContact;
            objetRetour.getMessage = messageContact;
            response.send(objetRetour);

        } else { //On fait de même s'il n'est pas créer tout en précisant que si le resultat n'existe pas on mettra null à la place de celui-ci

            objetRetour.getEtat = false;
            resultContact ? objetRetour.getObjet = resultContact : null;
            objetRetour.getMessage = messageContact;
            response.send(objetRetour);
        }
    });
}
//#endregion

//#region Dealer

/**
 * La méthode qui permet de compter la quantité de produit soumis par un dealer
 * @param {*} database Introduisez la variable qui nous connecte à la base de données
 * @param {*} modelOperation Introduisez la variable contenant le model de la table ou de l 'objet
 * @param {*} request Variable qui des requêtes
 * @param {*} response Variable qui fournit les reponses
 */
module.exports.countOperationByIdDealer = function countOperationByIdDealer(database, modelOperation, request, response) {
    var id_dealer = request.params.id_dealer,
        objetRetour = require("../../routes/objet_retour").ObjetRetour();

    modelOperation.initialize(database);
    modelOperation.countOperationByIdDealer(id_dealer, function (isCount, resultCount) {

        if (isCount) {
            objetRetour.getEtat = true;
            objetRetour.getObjet = resultCount;

            response.send(objetRetour);

        } else {
            objetRetour.getEtat = false;
            objetRetour.getMessage = resultCount;

            response.send(objetRetour);
        }

    })
}

//#endregion

//#region Extra

/**
 * La méthode qui permet de créer un extra
 * @param {*} database Introduisez la variable qui nous connecte à la base de données
 * @param {*} modelExtra Introduisez la variable contenant le model de la table ou de l 'objet
 * @param {*} request Variable qui des requêtes
 * @param {*} response Variable qui fournit les reponses
 */
module.exports.createExtra = function create(database, modelExtra, request, response) {
    //On déclare les variables 
    var objetRetour = require("../../routes/objet_retour").ObjetRetour(),
        extra_entity = require("../../Models/entities/extra_entity").Extra();

    //On vérifie l'existance de la propriété contenu
    if (request.body.contenu) {
        extra_entity.contenu = request.body.contenu
    }

    //On affecte des valeurs à l'objet extra_entity
    extra_entity.date = new Date();
    extra_entity.flag = true;
    extra_entity.id_auteur = request.body.id_auteur;
    extra_entity.id_produit_dealer = request.body.id_produit_dealer;
    extra_entity.type = request.body.type;

    //On initialize le modèle de donnée extra
    modelExtra.initialize(database);

    //Puis on exécute la foncion de création de l'extra
    modelExtra.create(extra_entity, function (isExtraCreated, resultCreatedExtra) {

        if (isExtraCreated) {

            objetRetour.getEtat = true;
            objetRetour.getObjet = resultCreatedExtra;
            objetRetour.getMessage = "L'extra a été créé avec succès";

            response.send(objetRetour);
        } else {

            objetRetour.getEtat = false;
            objetRetour.getMessage = resultCreatedExtra;

            response.send(objetRetour);
        }
    })
}

/**
 * La méthode qui permet de trouver la liste d'extras d'un produit suivant un type spécifique
 * @param {*} database Introduisez la variable qui nous connecte à la base de données
 * @param {*} modelExtra Introduisez la variable contenant le model de la table ou de l 'objet
 * @param {*} request Variable qui des requêtes
 * @param {*} response Variable qui fournit les reponses
 */
module.exports.findListExtraByIdProduitAndType = function findListExtraByIdProduitAndType(database, modelExtra, request, response) {

    //On déclare les variables
    var id_produit_dealer = request.body.id_produit_dealer,
        type = request.body.type,
        objetRetour = require("../../routes/objet_retour").ObjetRetour();

    modelExtra.initialize(database);

    modelExtra.findListByIdProduitAndType(id_produit_dealer, type, function (isExtraMatched, resultExtra) {

        if (isExtraMatched) {
            objetRetour.getEtat = true;
            objetRetour.getObjet = resultExtra;

            response.send(objetRetour);
        } else {
            objetRetour.getEtat = false;
            objetRetour.getMessage = resultExtra;

            response.send(objetRetour);
        }
    })

}

/**
 * La méthode qui permet de synchroniser les extras du serveur vers la bd locale de l'appli mobile
 * @param {*} database Introduisez la variable qui nous connecte à la base de données
 * @param {*} modelExtra Introduisez la variable contenant le model de la table ou de l 'objet
 * @param {*} request Variable qui des requêtes
 * @param {*} response Variable qui fournit les reponses
 */
 module.exports.synchroniseExtrasFromApiToDb = function synchroniseExtrasFromApiToDb(database, modelExtra, request, response) {
     
     var id_client = request.body.id_client,
        last_date = request.body.last_date,
        objetRetour = require("../../routes/objet_retour").ObjetRetour();

    modelExtra.initialize(database);

    modelExtra.synchroniseFromApiToDb(id_client, last_date, function (isSynchronised, resultSynchro) {
        
        if(isSynchronised){

            objetRetour.getEtat = true;
            objetRetour.getObjet = resultSynchro;

            response.send(objetRetour);

        }else{
            objetRetour.getEtat = false;
            objetRetour.getMessage = resultSynchro

            response.send(objetRetour)
        }
    })
 }

  /**
 * La méthode qui permet de synchroniser les extras du serveur vers la bd locale de l'appli mobile
 * @param {*} database Introduisez la variable qui nous connecte à la base de données
 * @param {*} modelExtra Introduisez la variable contenant le model de la table ou de l 'objet
 * @param {*} request Variable qui des requêtes
 * @param {*} response Variable qui fournit les reponses
 */
module.exports.getCountExtraByType = function getCountExtraByType(database, modelExtra, request, response) {
     
    var id_produit_dealer = request.params.id_produit_dealer,
       type = request.params.type,
       objetRetour = require("../../routes/objet_retour").ObjetRetour();

   modelExtra.initialize(database);

   if (request.params.allOrNot != "null") {
    modelExtra.getCountExtraByAuteur(id_produit_dealer, type, function (isCountMatched, resultCount) {
       
        if(isCountMatched){
 
            objetRetour.getEtat = true;
            objetRetour.getObjet = resultCount;
 
            response.send(objetRetour);
 
        }else{
            objetRetour.getEtat = false;
            objetRetour.getObjet = resultCount
 
            response.send(objetRetour)
        }
    })  
   }else{
     modelExtra.countExtra(id_produit_dealer, type, function (isCountMatched, resultCount) {

         if (isCountMatched) {

             objetRetour.getEtat = true;
             objetRetour.getObjet = resultCount;

             response.send(objetRetour);

         } else {
             objetRetour.getEtat = false;
             objetRetour.getObjet = resultCount

             response.send(objetRetour)
         }
     })
   }
   
}

/**
 * La méthode qui permet de créer un extra Vue
 * @param {*} database Introduisez la variable qui nous connecte à la base de données
 * @param {*} modelExtra Introduisez la variable contenant le model de la table ou de l 'objet
 * @param {*} request Variable qui des requêtes
 * @param {*} response Variable qui fournit les reponses
 */
module.exports.createExtraVue = function createExtraVue(database, modelExtra, request, response) {
    //On déclare les variables 
    var objetRetour = require("../../routes/objet_retour").ObjetRetour(),
        extra_entity = require("../../Models/entities/extra_entity").ExtraView();

        extra_entity.id_client = request.body.id_client;
        extra_entity.id_produit_dealer = request.body.id_produit_dealer;
        extra_entity.type = "vue";
        extra_entity.flag = true;
        extra_entity.date = new Date();
        
        modelExtra.initialize(database);
        modelExtra.createView(extra_entity, function (isAdded, message_extra, result_extra) {

            //Si le produit est bien ajouté aux favoris, alors on attribut les valeurs des retour qui était en quelques sorte un JSON
            if (isAdded) {
    
                objetRetour.getEtat = true;
                objetRetour.getObjet = result_extra;
                objetRetour.getMessage = message_extra;
                response.send(objetRetour);
    
            } else { //On fait de même s'il n'est pas ajouté tout en précisant que si le resultat n'existe pas on mettra null à la place de celui-ci
    
                objetRetour.getEtat = false;
                result_extra ? objetRetour.getObjet = result_extra : null;
                objetRetour.getMessage = message_extra;
                response.send(objetRetour);
            }
        });
        
}

/**
 * Méthode permettant de compter le nombre d'extra par type pour tous les produis d'un dealer
 * @param {*} database Introduisez la variable qui nous connecte à la base de données 
 * @param {*} modelExtra Introduisez la variable contenant le model de la table ou de l'objet  
 * @param {*} request Variable qui envoi des requête
 * @param {*} response Variable qui fournit la reponse
 */
module.exports.countAllExtraByTypeForDealer = function countAllExtraByTypeForDealer(database, modelExtra, request, response) {

    //On appel les modules necessaire pour cette fonction
    var objetRetour = require("../../routes/objet_retour").ObjetRetour(),
        type_extra = request.params.type_extra,
        id_dealer = request.params.id_dealer;
    //On initialise le modèle de données
    modelExtra.initialize(database);
    //Puis on éxécute la méthode createDealer du modèle
    modelExtra.countAllExtraByTypeForDealer(id_dealer, type_extra, function (isMatched, message_extra, result_extra) {

        //Si le client est crée, alors on attribut les valeurs des retour qui était en quelques sorte un JSON
        if (isMatched) {

            objetRetour.getEtat = true;
            objetRetour.getObjet = result_extra;
            objetRetour.getMessage = message_extra;
            response.send(objetRetour);

        } else { //Si le client est crée, alors on attribut les valeurs des retour qui était en quelques sorte un JSON

            objetRetour.getEtat = false;
            result_extra ? objetRetour.getObjet = result_extra : null;
            objetRetour.getMessage = message_extra;
            response.send(objetRetour);
        }
    });
}

/**
 * La méthode qui permet de créer un extra Evaluation
 * @param {*} database Introduisez la variable qui nous connecte à la base de données
 * @param {*} modelExtra Introduisez la variable contenant le model de la table ou de l 'objet
 * @param {*} request Variable qui des requêtes
 * @param {*} response Variable qui fournit les reponses
 */
module.exports.createEvaluation = function createEvaluation(database, modelExtra, request, response) {
    //On déclare les variables 
    var objetRetour = require("../../routes/objet_retour").ObjetRetour(),
        extra_entity = require("../../Models/entities/extra_entity").ExtraEvaluation();

    extra_entity.id_client = request.body.id_client;
    extra_entity.id_produit_dealer = request.body.id_produit_dealer;
    extra_entity.evaluation.push({
        "note": parseInt(request.body.note, 10),
        "date": new Date()
    })

    modelExtra.initialize(database);
    modelExtra.createEvaluation(extra_entity, function (isAdded, message_extra, result_extra) {

        //Si le produit est bien ajouté aux favoris, alors on attribut les valeurs des retour qui était en quelques sorte un JSON
        if (isAdded) {

            objetRetour.getEtat = true;
            objetRetour.getObjet = result_extra;
            objetRetour.getMessage = message_extra;
            response.send(objetRetour);

        } else { //On fait de même s'il n'est pas ajouté tout en précisant que si le resultat n'existe pas on mettra null à la place de celui-ci

            objetRetour.getEtat = false;
            result_extra ? objetRetour.getObjet = result_extra : null;
            objetRetour.getMessage = message_extra;
            response.send(objetRetour);
        }
    });

}


/**
 * Méthode qui permet de récupérer la note d'un client donné par rapport à un produit
 * @param {*} database Introduisez la variable qui nous connecte à la base de données 
 * @param {*} modelExtra Introduisez la variable contenant le model de la table ou de l'objet  
 * @param {*} request Variable qui envoi des requête
 * @param {*} response Variable qui fournit la reponse
 */
module.exports.getNoteOfEvaluate = function getNoteOfEvaluate(database, modelExtra, request, response) {

    //On appel les modules necessaire pour cette fonction
    var objetRetour = require("../../routes/objet_retour").ObjetRetour(),
        info = {
            "id_client": request.params.id_client,
            "id_produit_dealer": request.params.id_produit_dealer
        };
    //On initialise le modèle de données
    modelExtra.initialize(database);
    //Puis on éxécute la méthode createDealer du modèle
    modelExtra.getNoteEvaluationForClient(info, function (isGet, message_extra, result_extra) {

        //Si le client est crée, alors on attribut les valeurs des retour qui était en quelques sorte un JSON
        if (isGet) {

            objetRetour.getEtat = true;
            objetRetour.getObjet = result_extra;
            objetRetour.getMessage = message_extra;
            response.send(objetRetour);

        } else { //Si le client est crée, alors on attribut les valeurs des retour qui était en quelques sorte un JSON

            objetRetour.getEtat = false;
            result_extra ? objetRetour.getObjet = result_extra : null;
            objetRetour.getMessage = message_extra;
            response.send(objetRetour);
        }
    });
}

/**
 * Méthode qui permet de récupérer la moyenne des évalutions par rapport à un produit
 * @param {*} database Introduisez la variable qui nous connecte à la base de données 
 * @param {*} modelExtra Introduisez la variable contenant le model de la table ou de l'objet  
 * @param {*} request Variable qui envoi des requête
 * @param {*} response Variable qui fournit la reponse
 */
module.exports.getAverageEvaluation = function getAverageEvaluation(database, modelExtra, request, response) {

    //On appel les modules necessaire pour cette fonction
    var objetRetour = require("../../routes/objet_retour").ObjetRetour(),
        id_produit_dealer = request.params.id_produit_dealer;
    //On initialise le modèle de données
    modelExtra.initialize(database);
    //Puis on éxécute la méthode createDealer du modèle
    modelExtra.getAverageEvaluationForProduct(id_produit_dealer, function (isGet, message_extra, result_extra) {

        //Si le client est crée, alors on attribut les valeurs des retour qui était en quelques sorte un JSON
        if (isGet) {

            objetRetour.getEtat = true;
            objetRetour.getObjet = result_extra;
            objetRetour.getMessage = message_extra;
            response.send(objetRetour);

        } else { //Si le client est crée, alors on attribut les valeurs des retour qui était en quelques sorte un JSON

            objetRetour.getEtat = false;
            result_extra ? objetRetour.getObjet = result_extra : null;
            objetRetour.getMessage = message_extra;
            response.send(objetRetour);
        }
    });
}

//#endregion

//#region Favoris

/**
 * La méthode que vous avez appelé permet d'ajouter un produit parmis les favoris d'un client, alors utiliser cela en suivant les instructions de ces paramètres
 * @param {*} database Introduisez la variable qui nous connecte à la base de données
 * @param {*} modelFavoris Introduisez la variable contenant le model de la table ou de l 'objet
 * @param {*} request Variable qui des requêtes
 * @param {*} response Variable qui fournit les reponses
 */
module.exports.addToFavorite = function addToFavorite(database, modelFavoris, request, response) {

    //On appel les modules necessaire pour cette fonction
    var objetRetour = require("../../routes/objet_retour").ObjetRetour(),
        favoris_entity = require("../entities/favoris_entity").Favoris();

    //On attribut des valeurs aux propriétés de favoris_entity
    favoris_entity.id_client = request.body.id_client;
    favoris_entity.id_produit = request.body.id_produit;
    favoris_entity.date = new Date();
    favoris_entity.flag = true;

    //On initialise le modèle de données
    modelFavoris.initialize(database);
    //Puis on éxécute la méthode create du modèle
    modelFavoris.create(favoris_entity, function (isAdded, message_client, result_favoris) {

        //Si le produit est bien ajouté aux favoris, alors on attribut les valeurs des retour qui était en quelques sorte un JSON
        if (isAdded) {

            objetRetour.getEtat = true;
            objetRetour.getObjet = result_favoris;
            objetRetour.getMessage = message_client;
            response.send(objetRetour);

        } else { //On fait de même s'il n'est pas ajouté tout en précisant que si le resultat n'existe pas on mettra null à la place de celui-ci

            objetRetour.getEtat = false;
            result_favoris ? objetRetour.getObjet = result_favoris : null;
            objetRetour.getMessage = message_client;
            response.send(objetRetour);
        }
    });
}

/**
 * La méthode qui permet de rétirer un produit dans la liste des favoris d'un client
 * @param {*} database Introduisez la variable qui nous connecte à la base de données
 * @param {*} modelFavoris Introduisez la variable contenant le model de la table ou de l 'objet
 * @param {*} request Variable qui envoi des requêtes
 * @param {*} response Variable qui fournit les reponses
 */
module.exports.removeToFavorite = function removeToFavorite(database, modelFavoris, request, response) {

    var objetRetour = require("../../routes/objet_retour").ObjetRetour(),
        id_client = request.body.id_client,
        id_produit = request.body.id_produit;

    modelFavoris.initialize(database);

    modelFavoris.remove(id_client, id_produit, function (isRemove, message_favoris, result_favoris) {

        if (isRemove) {
            objetRetour.getEtat = true;
            objetRetour.getObjet = result_favoris;
            objetRetour.getMessage = message_favoris;
            response.send(objetRetour);
        } else {
            objetRetour.getEtat = false;
            result_favoris ? objetRetour.getObjet = result_favoris : null;
            objetRetour.getMessage = message_favoris;
            response.send(objetRetour);
        }
    })
}

/**
 * La méthode qui permet d'afficher le nombre de produit en favoris pour un client
 * @param {*} database Introduisez la variable qui nous connecte à la base de données
 * @param {*} modelCommande Introduisez la variable contenant le model de la table ou de l 'objet
 * @param {*} request Variable qui des requêtes
 * @param {*} response Variable qui fournit les reponses
 */
module.exports.getCountFavoris = function getCountCommande(database, modelCommande, request, response) {

    var objetRetour = require("../../routes/objet_retour").ObjetRetour(),
        id_client = request.params.id_client;

    modelCommande.initialize(database);
    modelCommande.countFavoriteForUser(id_client, function (isCountMatched, message, result) {

        if (isCountMatched) {

            objetRetour.getEtat = true;
            objetRetour.getObjet = result;
            objetRetour.getMessage = message;

            response.send(objetRetour);
        } else {
            objetRetour.getEtat = false;
            objetRetour.getObjet = result ? result : 0;
            objetRetour.getMessage = message;

            response.send(objetRetour);
        }
    })
}

/**
 * Méthode qui permet de trouver toutes les commandes que le client à passé genre un historique
 * @param {*} database Introduisez la variable qui nous connecte à la base de données 
 * @param {*} modelFavoris Introduisez la variable contenant le model de la table ou de l'objet  
 * @param {*} request Variable qui envoi des requête
 * @param {*} response Variable qui fournit la reponse
 */
module.exports.getAllFavorisForThisClient = function getAllFavorisForThisClient(database, modelFavoris, request, response) {

    //On appel les modules necessaire pour cette fonction
    var objetRetour = require("../../routes/objet_retour").ObjetRetour(),
        id_client = request.params.id_client;
    //On initialise le modèle de données
    modelFavoris.initialize(database);
    //Puis on éxécute la méthode createDealer du modèle
    modelFavoris.getAll(id_client, function (isMatched, message_favoris, result_favoris) {

        //Si le client est crée, alors on attribut les valeurs des retour qui était en quelques sorte un JSON
        if (isMatched) {

            objetRetour.getEtat = true;
            objetRetour.getObjet = result_favoris;
            objetRetour.getMessage = message_favoris;
            response.send(objetRetour);

        } else { //Si le client est crée, alors on attribut les valeurs des retour qui était en quelques sorte un JSON

            objetRetour.getEtat = false;
            result_favoris ? objetRetour.getObjet = result_favoris : null;
            objetRetour.getMessage = message_favoris;
            response.send(objetRetour);
        }
    });
}

/**
 * Méthode qui permet de synchroniser les données du serveur vers l'appli mobile 
 * @param {*} database Introduisez la variable qui nous connecte à la base de données 
 * @param {*} modelFavoris Introduisez la variable contenant le model de la table ou de l'objet  
 * @param {*} request Variable qui envoi des requête
 * @param {*} response Variable qui fournit la reponse
 */
module.exports.synchronizeFavoriteFromApiToDb = function synchronizeFavoriteFromApiToDb(database, modelFavoris, request, response) {
    
    //On appel les modules necessaire pour cette fonction
    var objetRetour = require("../../routes/objet_retour").ObjetRetour(),
        id_client = request.body.id_client,
        last_date = request.body.last_date;

    //On initialise le modèle de données
    modelFavoris.initialize(database);

    modelFavoris.synchronizeToAppDb(id_client, last_date, function(isSynchronised, resultSynchro) {
        
        if(isSynchronised){

            objetRetour.getEtat = true;
            objetRetour.getObjet = resultSynchro;
            response.send(objetRetour);

        }else{

            objetRetour.getEtat = false;
            objetRetour.getMessage = resultSynchro;
            response.send(objetRetour);

        }
    })
}

//#endregion

//#region Log
/**
 * La méthode permettant de tracé la deconnexion
 * @param {*} database Introduisez la variable qui nous connecte à la base de données
 * @param {*} modelLog Introduisez la variable contenant le model de la table ou de l 'objet   
 * @param {*} request Variable qui envoi des requête
 * @param {*} response Variable qui fournit la reponse
 */
module.exports.logOut = function logOut(database, modelLog, request, response) {

    var objetRetour = require("../../routes/objet_retour").ObjetRetour(),
        log_entity = require("../entities/log_entity").Log();
        
    log_entity.id_client = request.body.id_client;

    modelLog.initialize(database);
    modelLog.createLogout(log_entity, function (isCreated, messageLog, resultLog) {
        //Si l'agent est crée, alors on attribut les valeurs des retour qui était en quelques sorte un JSON
        if (isCreated) {
            objetRetour.getEtat = true;
            objetRetour.getObjet = resultLog;
            objetRetour.getMessage = messageLog;
            response.send(objetRetour);
        } else { //On fait de même s'il n'est oas créer tout en précisant que si le resultat n'existe pas on mettra null à la place de celui-ci
            objetRetour.getEtat = false;
            resultLog ? objetRetour.getObjet = resultLog : null;
            objetRetour.getMessage = messageLog;
            response.send(objetRetour);
        }
    });
}
//#endregion


//#region Media

/**
 * La méthode que vous avez appelé permet de créer un nouveau media , alors utiliser cela en suivant les instructions de ces paramètres
 * @param {*} database Introduisez la variable qui nous connecte à la base de données
 * @param {*} modelAgent Introduisez la variable contenant le model de la table ou de l 'objet   
 * @param {*} request Variable qui envoi des requête
 * @param {*} response Variable qui fournit la reponse
 */
module.exports.createMedia = function createMedia(database, mediaModel, request, response) {

    var objetRetour = require("../../routes/objet_retour").ObjetRetour(),
        media_entity = require("../entities/media_entity").Media(),
        etat = request.body.etat,
        type_ads = request.body.type_ads;

    if (!etat) {
        etat = false;
    }
    media_entity.name = request.body.name;
    media_entity.type = request.body.type;
    media_entity.size = request.body.size;
    media_entity.path = request.body.path;
    media_entity.date = new Date();


    mediaModel.initialize(database);
    mediaModel.create(media_entity, etat, type_ads, function (isCreated, message_media, result_media) {
        //Si l'agent est crée, alors on attribut les valeurs des retour qui était en quelques sorte un JSON
        if (isCreated) {
            objetRetour.getEtat = true;
            objetRetour.getObjet = result_media;
            objetRetour.getMessage = message_media;
            response.send(objetRetour);
        } else { //On fait de même s'il n'est oas créer tout en précisant que si le resultat n'existe pas on mettra null à la place de celui-ci
            objetRetour.getEtat = false;
            result_media ? objetRetour.getObjet = result_media : null;
            objetRetour.getMessage = message_media;
            response.send(objetRetour);
        }
    });
}

//#endregion

//#region Produit

/**
 * La méthode que vous avez appelé permet d'ajouter un produit parmis la liste des produits existants, alors utiliser cela en suivant les instructions de ces paramètres
 * @param {*} database Introduisez la variable qui nous connecte à la base de données
 * @param {*} modelProduct Introduisez la variable contenant le model de la table ou de l 'objet
 * @param {*} request Variable qui des requêtes
 * @param {*} response Variable qui fournit les reponses
 */
module.exports.addProduct = function addProduct(database, modelProduct, request, response) {

    //On appel les modules necessaire pour cette fonction
    var objetRetour = require("../../routes/objet_retour").ObjetRetour(),
        produit_entity = require("../entities/produit_entity").Produit(),
        id_dealer = request.body.id_dealer,
        images_container = [],
        quantite = request.body.quantite,
        id_lieu_vente = request.body.id_lieu_vente,
        prix_unitaire = request.body.prix_unitaire,
        devise = request.body.devise;
    
    if(request.body.images_container){
        request.body.images_container.forEach(image => {
            images_container.push(image)
        });
    }

    //On attribue des valeurs aux autres propriétés de l'entité
    produit_entity.intitule.push(request.body.intitule);
    produit_entity.annotation = request.body.annotation;
    produit_entity.sous_categorie.push(request.body.sous_categorie);
    produit_entity.localisation = request.body.localisation;
    produit_entity.unite = request.body.unite;

    //on recupère la commune
    var id_commune = request.body.id_commune;

    //On initialise le modèle de données
    modelProduct.initialize(database);
    //Puis on exécute la fonction de création 
    modelProduct.create(produit_entity, id_dealer, quantite, images_container, id_lieu_vente, id_commune, prix_unitaire, devise,
    function (isAdded, message_product, result_product) {
        //On test le résulat renvoyé lors de la création du produit
        if (isAdded) { //si l'opération s'est déroulée avec succès
            objetRetour.getEtat = true;
            objetRetour.getObjet = result_product;
            objetRetour.getMessage = message_product;
            response.send(objetRetour);
        } else { //Sinon l'opération n'a pas aboutie avec succès
            objetRetour.getEtat = false;
            result_product ? objetRetour.getObjet = result_product : null;
            objetRetour.getMessage = message_product;

            //On renvoie la notification à l'administration
            /*var notification_entity = require("./entities/notification_entity").Notification();
            notification_entity.date = new Date();
            notification_entity.flag = false;
            notification_entity.id_auteur = id_dealer;
            notification_entity.id_objet = resultProduit.ops[0]._id;
            notification_entity.type = "alerte_systeme";

            var notification_message = "Le processus de création du produit <"+resultProduit.ops[0]._id+"> n'a pas abouti."+ 
                " Cause : "+message_product_dealer;
            notification_dao.createForAdminSystem(admin_notification,notification_message);*/

            response.send(objetRetour);
        }
    });
}

/**
 * La méthode que vous avez appelé permet d'ajouter un produit parmis la liste des produits existants, alors utiliser cela en suivant les instructions de ces paramètres
 * @param {*} database Introduisez la variable qui nous connecte à la base de données
 * @param {*} modelProduct Introduisez la variable contenant le model de la table ou de l 'objet
 * @param {*} request Variable qui des requêtes
 * @param {*} response Variable qui fournit les reponses
 */
module.exports.detailProduct = function detailProduct(database, modelProduct, request, response) {

    //On appel les modules necessaire pour cette fonction
    var objetRetour = require("../../routes/objet_retour").ObjetRetour(),
        //Cette variable sera l'identifiant du dealer qui souhaite ajouter un produit pour la vente
        id_produit = request.params.id_produit,
        id_client;

    if (request.params.id_client) {
        id_client = request.params.id_client
    } else {
        id_client = null
    }


    //On initialise le modèle de données
    modelProduct.initialize(database);
    //Puis on exécute la fonction de création 
    modelProduct.findOneById(id_produit, id_client, function (isFound, message_product, result_product) {
        //On test le résulat renvoyé lors de la création du produit
        if (isFound) { //si l'opération s'est déroulée avec succès
            objetRetour.getEtat = true;
            objetRetour.getObjet = result_product;
            objetRetour.getMessage = message_product;
            response.send(objetRetour);
        } else { //Sinon l'opération n'a pas aboutie avec succès
            objetRetour.getEtat = false;
            result_product ? objetRetour.getObjet = result_product : null;
            objetRetour.getMessage = message_product;
            response.send(objetRetour);
        }
    });
}

/**
 * La méthode qui permet de faire la smartResearch sur la BD
 * @param {*} database Introduisez la variable qui nous connecte à la base de données
 * @param {*} modelProduit Introduisez la variable contenant le model de la table ou de l 'objet
 * @param {*} request Variable qui des requêtes
 * @param {*} response Variable qui fournit les reponses
 */
module.exports.smartFindByIntitule = function smartFindByIntitule(database, modelProduit, request, response) {

    var valeur_recherche = request.body.valeur_recherche,
        objetRetour = require("../../routes/objet_retour").ObjetRetour(),
        id_client = request.body.id_client,
        localisation = request.body.localisation;

    modelProduit.initialize(database);
    modelProduit.smartFindByIntitule(valeur_recherche, id_client, localisation, false, function (isMatched, resultMatched) {

        if (isMatched) {
            objetRetour.getEtat = true;
            objetRetour.getObjet = resultMatched;

            response.send(objetRetour);
        } else {
            objetRetour.getEtat = false;
            objetRetour.getMessage = resultMatched;

            response.send(objetRetour);
        }
    })
}

/**
 * La fonction qui permet de trouver la liste de produits appartenant à la même sous-catégorie
 * Elle est utilisée lorsque l'utilisateur visualise les détails d'un produit donnée, le système
 * @param {*} database Introduisez la variable qui nous connecte à la base de données
 * @param {*} modelProduit Introduisez la variable contenant le model de la table ou de l 'objet
 * @param {*} request Variable qui des requêtes
 * @param {*} response Variable qui fournit les reponses
 */
module.exports.findProductListByIdSousCategorie = function findProductListByIdSousCategorie(database, modelProduit, request, response) {

    var id_produit = request.params.id_produit,
        id_client = request.params.id_client,
        objetRetour = require("../../routes/objet_retour").ObjetRetour();

    modelProduit.initialize(database);
    modelProduit.findListByIdSousCategorie(id_client, id_produit, function (isMatched, resultMatched) {

        if (isMatched) {
            objetRetour.getEtat = true;
            objetRetour.getObjet = resultMatched;

            response.send(objetRetour);
        } else {
            objetRetour.getEtat = false;
            objetRetour.getMessage = resultMatched;

            response.send(objetRetour);
        }
    })
}

/**
 * La fonction qui permet de trouver la liste de produits appartenant à la même sous-catégorie
 * Elle est utilisée lorsque l'utilisateur visualise les détails d'un produit donnée, le système
 * @param {*} database Introduisez la variable qui nous connecte à la base de données
 * @param {*} modelProduit Introduisez la variable contenant le model de la table ou de l 'objet
 * @param {*} request Variable qui des requêtes
 * @param {*} response Variable qui fournit les reponses
 */
module.exports.findListCategorieByIdProduct = function findListCategorieByIdProduct(database, modelProduit, request, response) {

    var id_produit = request.params.id_produit,
        objetRetour = require("../../routes/objet_retour").ObjetRetour();

    modelProduit.initialize(database);
    modelProduit.findListCategorieByIdProduct(id_produit, function (isMatched, resultMatched) {

        if (isMatched) {
            objetRetour.getEtat = true;
            objetRetour.getObjet = resultMatched;

            response.send(objetRetour);
        } else {
            objetRetour.getEtat = false;
            objetRetour.getMessage = resultMatched;

            response.send(objetRetour);
        }
    })
}

/**
 * La route qui permet de renvoyer la liste de produits d'une même sous-catégorie.
 * Elle est utilisée lorsque le client visite les détails de la sous-catégorie
 * @param {*} database Introduisez la variable qui nous connecte à la base de données
 * @param {*} modelProduit Introduisez la variable contenant le model de la table ou de l 'objet
 * @param {*} request Variable qui des requêtes
 * @param {*} response Variable qui fournit les reponses
 */
module.exports.findProductListByIdSousCategorieForSousCategorie = function findProductListByIdSousCategorieForSousCategorie(database, modelProduit, request, response) {

    var id_sous_categorie = request.params.id_sous_categorie,
        id_client = request.params.id_client,
        objetRetour = require("../../routes/objet_retour").ObjetRetour();

    modelProduit.initialize(database);
    modelProduit.findListByIdSousCategorieForSousCategorie(id_client, id_sous_categorie, function (isFound, messageProducts, resultProducts) {

        objetRetour.getEtat = isFound;
        objetRetour.getObjet = resultProducts;
        objetRetour.getMessage = messageProducts;

        response.send(objetRetour)
    })

}

/**
 * Méthode qui permet de trouver toutes les commandes que le client à passé genre un historique
 * @param {*} database Introduisez la variable qui nous connecte à la base de données 
 * @param {*} modelOperation Introduisez la variable contenant le model de la table ou de l'objet  
 * @param {*} request Variable qui envoi des requête
 * @param {*} response Variable qui fournit la reponse
 */
module.exports.getSubmittedProductsByIdDealer = function getSubmittedProductsByIdDealer(database, modelOperation, request, response) {

    //On appel les modules necessaire pour cette fonction
    var objetRetour = require("../../routes/objet_retour").ObjetRetour(),
        id_dealer = request.params.id_dealer;
    //On initialise le modèle de données
    modelOperation.initialize(database);
    //Puis on éxécute la méthode createDealer du modèle
    modelOperation.getSubmittedProductsByIdDealer(id_dealer, function (isMatched, message_operation_produit, result_operation_produit) {

        //Si le client est crée, alors on attribut les valeurs des retour qui était en quelques sorte un JSON
        if (isMatched) {

            objetRetour.getEtat = true;
            objetRetour.getObjet = result_operation_produit;
            objetRetour.getMessage = message_operation_produit;
            response.send(objetRetour);

        } else { //Si le client est crée, alors on attribut les valeurs des retour qui était en quelques sorte un JSON

            objetRetour.getEtat = false;
            result_operation_produit ? objetRetour.getObjet = result_operation_produit : null;
            objetRetour.getMessage = message_operation_produit;
            response.send(objetRetour);
        }
    });
}

/**
 * Méthode qui permet de trouver toutes les commandes que le client à passé genre un historique
 * @param {*} database Introduisez la variable qui nous connecte à la base de données 
 * @param {*} modelOperation Introduisez la variable contenant le model de la table ou de l'objet  
 * @param {*} request Variable qui envoi des requête
 * @param {*} response Variable qui fournit la reponse
 */
module.exports.getNewProduct = function getNewProduct(database, modelOperation, request, response) {

    //On appel les modules necessaire pour cette fonction
    var objetRetour = require("../../routes/objet_retour").ObjetRetour(),
        id_client = request.params.id_client ? request.params.id_client : null,
        limit = parseInt(request.params.limit) ? parseInt(request.params.limit) : null;

    //On initialise le modèle de données
    modelOperation.initialize(database);
    //Puis on éxécute la méthode createDealer du modèle
    modelOperation.getNewProduct(id_client, limit, function (isMatched, result_operation_produit) {

        //Si le client est crée, alors on attribut les valeurs des retour qui était en quelques sorte un JSON
        if (isMatched) {

            objetRetour.getEtat = true;
            objetRetour.getObjet = result_operation_produit;
            response.send(objetRetour);

        } else { //Si le client est crée, alors on attribut les valeurs des retour qui était en quelques sorte un JSON

            objetRetour.getEtat = false;
            result_operation_produit ? objetRetour.getObjet = result_operation_produit : null;
            response.send(objetRetour);
        }
    });
}

/**
 * Méthode qui permet de compter les nombres des produit dont un dealer à soumis en vente
 * @param {*} database Introduisez la variable qui nous connecte à la base de données 
 * @param {*} modelOperation Introduisez la variable contenant le model de la table ou de l'objet  
 * @param {*} request Variable qui envoi des requête
 * @param {*} response Variable qui fournit la reponse
 */
module.exports.countForDealer = function countForDealer(database, modelOperation, request, response) {

    //On appel les modules necessaire pour cette fonction
    var objetRetour = require("../../routes/objet_retour").ObjetRetour(),
        id_dealer = request.params.id_dealer;
    //On initialise le modèle de données
    modelOperation.initialize(database);
    //Puis on éxécute la méthode createDealer du modèle
    modelOperation.countAllSubmittedProductForDealer(id_dealer, function (isMatched, message_operation_produit, result_operation_produit) {

        //Si le client est crée, alors on attribut les valeurs des retour qui était en quelques sorte un JSON
        if (isMatched) {

            objetRetour.getEtat = true;
            objetRetour.getObjet = result_operation_produit;
            objetRetour.getMessage = message_operation_produit;
            response.send(objetRetour);

        } else { //Si le client est crée, alors on attribut les valeurs des retour qui était en quelques sorte un JSON

            objetRetour.getEtat = false;
            result_operation_produit ? objetRetour.getObjet = result_operation_produit : null;
            objetRetour.getMessage = message_operation_produit;
            response.send(objetRetour);
        }
    });
}
//#endregion

//#region Partenaire

/**
 * La méthode que vous avez appelé permet de créer un simple client mais aussi un dealer, alors utiliser cela en suivant les instructions de ces paramètre
 * @param {*} database Introduisez la variable qui nous connecte à la base de données 
 * @param {*} modelPartenaire Introduisez la variable contenant le model de la table ou de l'objet  
 * @param {*} request Variable qui envoi des requête
 * @param {*} response Variable qui fournit la reponse
 */
module.exports.createPartenaire = function createPartenaire(database, modelPartenaire, request, response) {

    //On appel les modules necessaire pour cette fonction
    var objetRetour = require("../../routes/objet_retour").ObjetRetour(),
        partenaire_entity = require("../entities/partenaire_entity").Partenaire();

    var image = partenaire_entity = require("../entities/media_entity").Media();
    
    image.name = request.body.image_name;
    image.size = request.body.image_size;
    image.path = request.body.image_path;
   

    partenaire_entity.intitule = request.body.intitule;
    partenaire_entity.description = request.body.description ? request.body.description : null;
    partenaire_entity.site_web = request.body.site_web ? request.body.site_web : null;
    //On initialise le modèle de données
    modelPartenaire.initialize(database);
    //Puis on éxécute la méthode create du modèle
    modelPartenaire.create(partenaire_entity, image, function (isCreated, message_partenaire, result_partenaire) {

        //Si le client est crée, alors on attribut les valeurs des retour qui était en quelques sorte un JSON
        if (isCreated) {

            objetRetour.getEtat = true;
            objetRetour.getObjet = result_partenaire;
            objetRetour.getMessage = message_partenaire;
            response.send(objetRetour);

        } else { //On fait de même s'il n'est pas créer tout en précisant que si le resultat n'existe pas on mettra null à la place de celui-ci

            objetRetour.getEtat = false;
            result_partenaire ? objetRetour.getObjet = result_partenaire : null;
            objetRetour.getMessage = message_partenaire;
            response.send(objetRetour);
        }
    });
}

/**
 * Méthode qui permet de trouver toutes les commandes que le client à passé genre un historique
 * @param {*} database Introduisez la variable qui nous connecte à la base de données 
 * @param {*} modelPartenaire Introduisez la variable contenant le model de la table ou de l'objet  
 * @param {*} request Variable qui envoi des requête
 * @param {*} response Variable qui fournit la reponse
 */
module.exports.getAllPartenaire = function getAllPartenaire(database, modelPartenaire, request, response) {

    //On appel les modules necessaire pour cette fonction
    var objetRetour = require("../../routes/objet_retour").ObjetRetour();
    //On initialise le modèle de données
    modelPartenaire.initialize(database);
    //Puis on éxécute la méthode createDealer du modèle
    modelPartenaire.getAllPartenaire(function (isMatched, message_partenaire, result_partenaire) {

        //Si le client est crée, alors on attribut les valeurs des retour qui était en quelques sorte un JSON
        if (isMatched) {

            objetRetour.getEtat = true;
            objetRetour.getObjet = result_partenaire;
            objetRetour.getMessage = message_partenaire;
            response.send(objetRetour);

        } else { //Si le client est crée, alors on attribut les valeurs des retour qui était en quelques sorte un JSON

            objetRetour.getEtat = false;
            result_partenaire ? objetRetour.getObjet = result_partenaire : null;
            objetRetour.getMessage = message_partenaire;
            response.send(objetRetour);
        }
    });
}

/**
 * La méthode que vous avez appelé permet de créer un simple client mais aussi un dealer, alors utiliser cela en suivant les instructions de ces paramètre
 * @param {*} database Introduisez la variable qui nous connecte à la base de données 
 * @param {*} modelPartenaire Introduisez la variable contenant le model de la table ou de l'objet  
 * @param {*} request Variable qui envoi des requête
 * @param {*} response Variable qui fournit la reponse
 */
module.exports.updateInfoPartenaire = function updateInfoPartenaire(database, modelPartenaire, request, response) {

    //On appel les modules necessaire pour cette fonction
    var objetRetour = require("../../routes/objet_retour").ObjetRetour(),
        partenaire_entity = require("../entities/partenaire_entity").Partenaire();

    var partenaire = {
        "id": request.body.id,
        "intitule": request.body.intitule ? request.body.intitule : null,
        "description": request.body.description ? request.body.description : null,
        "site_web": request.body.site_web ? request.body.site_web : null,
        "image": {
            "name": request.body.path ? (request.body.name ? request.body.name : null) : null,
            "size": request.body.path ? (request.body.size ? request.body.size : null) : null,
            "path": request.body.path ? request.body.path : null
        }
    }

    //On initialise le modèle de données
    modelPartenaire.initialize(database);
    //Puis on éxécute la méthode create du modèle
    modelPartenaire.updateInfos(partenaire, function (isCreated, message_partenaire, result_partenaire) {

        //Si le client est crée, alors on attribut les valeurs des retour qui était en quelques sorte un JSON
        if (isCreated) {

            objetRetour.getEtat = true;
            objetRetour.getObjet = result_partenaire;
            objetRetour.getMessage = message_partenaire;
            response.send(objetRetour);

        } else { //On fait de même s'il n'est pas créer tout en précisant que si le resultat n'existe pas on mettra null à la place de celui-ci

            objetRetour.getEtat = false;
            result_partenaire ? objetRetour.getObjet = result_partenaire : null;
            objetRetour.getMessage = message_partenaire;
            response.send(objetRetour);
        }
    });
}

/**
 * La méthode qui permet de rétirer un produit dans la liste des favoris d'un client
 * @param {*} database Introduisez la variable qui nous connecte à la base de données
 * @param {*} modelPartenaire Introduisez la variable contenant le model de la table ou de l 'objet
 * @param {*} request Variable qui envoi des requêtes
 * @param {*} response Variable qui fournit les reponses
 */
module.exports.setFlagPartenaire = function setFlagPartenaire(database, modelPartenaire, request, response) {

    var objetRetour = require("../../routes/objet_retour").ObjetRetour(),
        partenaire = {
            "id": request.params.id_partenaire
        }

    modelPartenaire.initialize(database);

    modelPartenaire.setFlag(partenaire, function (isSet, message_partenaire, result_partenaire) {

        if (isSet) {
            objetRetour.getEtat = true;
            objetRetour.getObjet = result_partenaire;
            objetRetour.getMessage = message_partenaire;
            response.send(objetRetour);
        } else {
            objetRetour.getEtat = false;
            result_partenaire ? objetRetour.getObjet = result_partenaire : null;
            objetRetour.getMessage = message_partenaire;
            response.send(objetRetour);
        }
    })
}


//#endregion

//#region recupération

/**
 * La fonction qui permet de vérifier si un code de confirmation correspond à une valeur d'un username
 * @param {*} database Introduisez la variable qui nous connecte à la base de données
 * @param {*} modelRecuperation Introduisez la variable contenant le model de la table ou de l 'objet
 * @param {*} request Variable qui des requêtes
 * @param {*} response Variable qui fournit les reponses
 */
module.exports.checkCode = function checkCode(database, modelRecuperation, request, response) {

    var objetRetour = require("../../routes/objet_retour").ObjetRetour(),
        code_validation = request.body.code_validation,
        valeur_username = request.body.valeur_username;

    modelRecuperation.initialize(database);
    modelRecuperation.checkCode(code_validation, valeur_username, function (isChecked, resultChecked) {

        if (isChecked) {
            objetRetour.getEtat = true;
            objetRetour.getObjet = resultChecked;

            response.send(objetRetour);
        } else {

            objetRetour.getEtat = false;
            objetRetour.getMessage = resultChecked;

            response.send(objetRetour);
        }
    })
}

//#endregion

//#region Taux
/**
 * La fonction qui permet de créer une devise et définir le taux
 * @param {*} database Introduisez la variable qui nous connecte à la base de données
 * @param {*} modelTaux Introduisez la variable contenant le model de la table ou de l 'objet
 * @param {*} request Variable qui des requêtes
 * @param {*} response Variable qui fournit les reponses
 */
module.exports.createRate = function createRate(database, modelTaux, request, response) {

    var objetRetour = require("../../routes/objet_retour").ObjetRetour(),
        taux_entity = require("../../Models/entities/taux_entity").Taux();

    taux_entity.denomination = request.body.denomination;
    taux_entity.valeur = request.body.short_denomination;
    taux_entity.devise_equivalente = request.body.devise_equivalente;
    taux_entity.unite = parseInt(request.body.unite);
    taux_entity.montant_equivalent = request.body.montant_equivalent;
    taux_entity.flag = request.body.flag;
    taux_entity.date_creation = new Date();

    modelTaux.initialize(database);
    modelTaux.create(taux_entity, function (isCreated, message, resultCreation) {

        if (isCreated) {
            objetRetour.getEtat = true;
            objetRetour.getMessage = message;
            objetRetour.getObjet = resultCreation;

            response.send(objetRetour)
        } else {

            objetRetour.getEtat = false;
            objetRetour.getMessage = message;
            objetRetour.getObjet = resultCreation;

            response.send(objetRetour)
        }
    })

}

/**
 * La fonction qui permet de créer une annonce
 * @param {*} database Introduisez la variable qui nous connecte à la base de données
 * @param {*} modelTaux Introduisez la variable contenant le model de la table ou de l 'objet
 * @param {*} request Variable qui des requêtes
 * @param {*} response Variable qui fournit les reponses
 */
module.exports.findOneRateByDenominationInAndOut = function findOneRateByDenominationInAndOut(database, modelTaux, request, response) {

    var objetRetour = require("../../routes/objet_retour").ObjetRetour(),
        short_denomination = request.body.short_denomination,
        devise_equivalente = request.body.devise_equivalente;

    modelTaux.initialize(database);
    modelTaux.findOneByDenominationInAndOut(short_denomination, devise_equivalente, 
    function (is_found, message, result_found) {

        if (is_found) {
            objetRetour.getEtat = true;
            objetRetour.getMessage = message;
            objetRetour.getObjet = result_found;

            response.send(objetRetour)
        } else {

            objetRetour.getEtat = false;
            objetRetour.getMessage = message;
            objetRetour.getObjet = result_found;

            response.send(objetRetour)
        }
    })

}
//#endregion

//#region ville

/**
 * Méthode qui permet de trouver toutes les commandes que le client à passé genre un historique
 * @param {*} database Introduisez la variable qui nous connecte à la base de données 
 * @param {*} modelVille Introduisez la variable contenant le model de la table ou de l'objet  
 * @param {*} request Variable qui envoi des requête
 * @param {*} response Variable qui fournit la reponse
 */
module.exports.getAllTown = function getAllTown(database, modelVille, request, response) {

    //On appel les modules necessaire pour cette fonction
    var objetRetour = require("../../routes/objet_retour").ObjetRetour();
    //On initialise le modèle de données
    modelVille.initialize(database);
    //Puis on éxécute la méthode createDealer du modèle
    modelVille.getAll(function (isMatched, messageVille, resultVille) {

       
        if (isMatched) {

            objetRetour.getEtat = true;
            objetRetour.getObjet = resultVille;
            objetRetour.getMessage = messageVille;
            response.send(objetRetour);

        } else { 
            
            objetRetour.getEtat = false;
            resultVille ? objetRetour.getObjet = resultVille : null;
            objetRetour.getMessage = messageVille;
            response.send(objetRetour);
        }
    });
}
//#endregion