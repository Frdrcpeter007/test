//On fait appel à express pour la gestion des routes
var express = require('express'),
    //Ceci est le module contenant la quasi totalité des fonctions utilisé dans cet API
    func = require("../Models/includes/functions"),
    router = express.Router();

//Appel à la base de données
var db_js = require("../Models/db");

//Appel à la collection
var message_model = require("../Models/message_dao");

/**
 * La fonction permettant de mettre à jour le status d'un message
 */
router.get("/updateStatusEtatById/:id_message", function (req, res) {

    var id_message = req.params.id_message,
        objet_retour = require("../objet_retour").ObjetRetour();

    message_model.initialize(db_js);
    message_model.updateStatusEtatById(id_message, function (isUpToDate, updateMessage, updateResult) {

        if (isUpToDate) {

            objet_retour.getEtat = true;
            objet_retour.getObjet = updateResult;

            res.send(objet_retour);

        } else { //On fait de même s'il n'est pas créer tout en précisant que si le resultat n'existe pas on mettra null à la place de celui-ci
            objet_retour.getEtat = false;
            objet_retour.getMessage = updateMessage;

            res.send(objet_retour);
        }
    });

})

/**
 *La fonction permettant de lister les message d'un client
 */
router.get("/getAllByDestinataire/:destinataire/:limit", function (req, res) {

    var destinataire = req.params.destinataire,
        limit = req.params.limit,
        objet_retour = require("./objet_retour").ObjetRetour();

    message_model.initialize(db_js);
    message_model.getAllByDestinataire(destinataire, limit, function (isMatched, messageResult, resultContent) {

        if (isMatched) {
            objet_retour.getEtat = true;
            objet_retour.getObjet = resultContent;

            res.send(objet_retour)
        } else {
            objet_retour.getEtat = false;
            objet_retour.getMessage = messageResult;

            res.send(objet_retour)
        }
    })
})

/**
 *La fonction permettant d'afficher les détails d'un message
 */
router.get("/findOneById/:id_message", function (req, res) {

    var id_message = req.params.id_message,
        objet_retour = require("./objet_retour").ObjetRetour();

    message_model.initialize(db_js);
    message_model.findOneById(id_message, function (isMatched, messageResult, resultContent) {

        if (isMatched) {
            objet_retour.getEtat = true;
            objet_retour.getObjet = resultContent;

            res.send(objet_retour)
        } else {
            objet_retour.getEtat = false;
            objet_retour.getMessage = messageResult;

            res.send(objet_retour)
        }
    })
})

/**
 *La fonction permettant d'afficher les détails d'un message
 */
router.post("/sendMessageForNotification", (req, res) => {

    var message_entity = require("../Models/entities/message_entity").MessageForAnnonce(),
        objet_retour = require("./objet_retour").ObjetRetour();

    message_entity.id_annonce = req.body.id_annonce;
    message_entity.expediteur = req.body.id_expediteur;
    message_entity.sujet = "Annonce";
    message_entity.contenu = req.body.contenu;
    message_entity.date = new Date();

    message_model.initialize(db_js);
    message_model.sendMessageForAnnoonce(message_entity, (isSend, messageResult, resultContent) => {

        if (isSend) {
            objet_retour.getEtat = true;
            objet_retour.getObjet = resultContent;

            res.send(objet_retour)
        } else {
            objet_retour.getEtat = false;
            objet_retour.getMessage = messageResult;

            res.send(objet_retour)
        }
    })
})

module.exports = router;