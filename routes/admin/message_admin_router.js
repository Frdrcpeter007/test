//On fait appel à express pour la gestion des routes
var express = require('express'),
    router = express.Router();

//Appel à la base de données
var  agent_admin_dao = agent_admin_dao = require("../../Models/admin/agent_admin_dao"),
     message_admin_dao = require("../../Models/admin/message_admin_dao");


/**
 * La route permettant la créatio d'un message
 */
router.post("/:id_agent/create", function(req, res) {
    
    var id_agent = req.params.id_agent,
    objet_retour = require("../objet_retour").ObjetRetour();

    agent_admin_dao.findOneById(id_agent, function (isAgentFound, messageResult, resultAgent) {
        
        if(isAgentFound){

            var message_entity = require("../../Models/entities/message_entity").Message();
            message_entity.expediteur = id_agent;
            message_entity.destinataire = req.body.id_client;
            message_entity.date = new Date();
            message_entity.sujet = req.body.sujet;
            message_entity.contenu = req.body.contenu;
            message_entity.status.etat = false;

             message_admin_dao.create(message_entity, function (isCreated, messageCreating, resultCreating) {
                //Si l'agent est crée, alors on attribut les valeurs des retour qui était en quelques sorte un JSON
                if (isCreated) {

                    objet_retour.getEtat = true;
                    objet_retour.getObjet = resultCreating;
                    
                    res.send(objet_retour);
                    
                } else { //On fait de même s'il n'est pas créer tout en précisant que si le resultat n'existe pas on mettra null à la place de celui-ci
                    objet_retour.getEtat = false;
                    objet_retour.getMessage = messageCreating;

                    res.send(objet_retour);
                }
            });

        }else{
            objet_retour.getEtat = false;
            objet_retour.getMessage = messageResult;
            objet_retour.getObjet = resultAgent;

            res.send(objet_retour)
        }
    })
})

/**
 * La route permettant de mettre à jour le status d'un message
 */
router.post("/:id_agent/updateContenuAndSujetById/:id_message", function(req, res) {
    
    var id_agent = req.params.id_agent,
        id_message = req.params.id_message,
    objet_retour = require("../objet_retour").ObjetRetour();

    agent_admin_dao.findOneById(id_agent, function (isAgentFound, messageResult, resultAgent) {
        
        if(isAgentFound){

            var sujet = req.body.sujet,
                contenu = req.body.contenu;

            message_admin_dao.updateContenuAndSujetById(id_message, sujet, contenu, function (isUpToDate, updateMessage, updateResult) {
                //Si l'agent est crée, alors on attribut les valeurs des retour qui était en quelques sorte un JSON
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

        }else{
            objet_retour.getEtat = false;
            objet_retour.getMessage = messageResult;
            objet_retour.getObjet = resultAgent;

            res.send(objet_retour)
        }
    })
})

module.exports = router;