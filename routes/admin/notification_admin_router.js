//On fait appel à express pour la gestion des routes
var express = require('express'),
    router = express.Router();

//Appel à la base de données
var db_js = require("../../Models/db");

//Appel à la collection
var notification_admin_model = require("../../Models/admin/notification_admin_dao"),
    agent_admin_dao = require("../../Models/admin/agent_admin_dao");

//La route permettant d'avoir le nombre de clients inscrits
router.get("/:id_agent/countClient", function (req, res) {
    
    var id_agent = req.params.id_agent,
        objet_retour = require("../objet_retour").ObjetRetour();

    agent_admin_dao.findOneById(id_agent, function (isAgentFound, messageResult, resultAgent) {
        
        if(isAgentFound){

            notification_admin_model.countClient(function (isCounted, resultCounted) {
                
                if(isCounted){

                    objet_retour.getEtat = true;
                    objet_retour.getObjet = resultCounted;

                    res.send(objet_retour);

                }else{

                    objet_retour.getEtat = false;
                    objet_retour.getMessage = resultCounted;

                    res.send(objet_retour)
                }
            })

        }else{
            objet_retour.getEtat = false;
            objet_retour.getMessage = messageResult;
            objet_retour.getObjet = resultAgent;

            res.send(objet_retour)
        }
    })

})

//La route permettant d'avoir le nombre de commande reçues par les clients
router.get("/:id_agent/countValidateCommande", function (req, res) {
    
    var id_agent = req.params.id_agent,
        objet_retour = require("../objet_retour").ObjetRetour();

    agent_admin_dao.findOneById(id_agent, function (isAgentFound, messageResult, resultAgent) {
        
        if(isAgentFound){

            notification_admin_model.countValidateCommande(function (isCounted, resultCounted) {
                
                if(isCounted){

                    objet_retour.getEtat = true;
                    objet_retour.getObjet = resultCounted;

                    res.send(objet_retour);

                }else{

                    objet_retour.getEtat = false;
                    objet_retour.getMessage = resultCounted;

                    res.send(objet_retour)
                }
            })

        }else{
            objet_retour.getEtat = false;
            objet_retour.getMessage = messageResult;
            objet_retour.getObjet = resultAgent;

            res.send(objet_retour)
        }
    })

})

//La route permettant d'afficher le mot clé le plus recherché sans avoir eu de réponse positive
router.get("/:id_agent/topNotFoundResearch", function (req, res) {
    
    var id_agent = req.params.id_agent,
        objet_retour = require("../objet_retour").ObjetRetour();

    agent_admin_dao.findOneById(id_agent, function (isAgentFound, messageResult, resultAgent) {
        
        if(isAgentFound){

            notification_admin_model.topNotFoundResearch(function (isResearchMatched, resultResearche) {
                
                if(isResearchMatched){

                    objet_retour.getEtat = true;
                    objet_retour.getObjet = resultResearche;

                    res.send(objet_retour);

                }else{

                    objet_retour.getEtat = false;
                    objet_retour.getMessage = resultResearche;

                    res.send(objet_retour)
                }
            })

        }else{
            objet_retour.getEtat = false;
            objet_retour.getMessage = messageResult;
            objet_retour.getObjet = resultAgent;

            res.send(objet_retour)
        }
    })

})

//La route permettant d'avoir le nombre d'opération produit attendant la validation des administrateurs
router.get("/:id_agent/countPendindOperationProduct", function (req, res) {
    
    var id_agent = req.params.id_agent,
        objet_retour = require("../objet_retour").ObjetRetour();

    agent_admin_dao.findOneById(id_agent, function (isAgentFound, messageResult, resultAgent) {
        
        if(isAgentFound){

            notification_admin_model.countPendindOperationProduct(function (isCounted, resultCounted) {
                
                if(isCounted){

                    objet_retour.getEtat = true;
                    objet_retour.getObjet = resultCounted;

                    res.send(objet_retour);

                }else{

                    objet_retour.getEtat = false;
                    objet_retour.getMessage = resultCounted;

                    res.send(objet_retour)
                }
            })

        }else{
            objet_retour.getEtat = false;
            objet_retour.getMessage = messageResult;
            objet_retour.getObjet = resultAgent;

            res.send(objet_retour)
        }
    })
})

//La route permettant d'avoir le nombre de dealers
router.get("/:id_agent/countDealer", function (req, res) {
    
    var id_agent = req.params.id_agent,
        objet_retour = require("../objet_retour").ObjetRetour();

    agent_admin_dao.findOneById(id_agent, function (isAgentFound, messageResult, resultAgent) {
        
        if(isAgentFound){

            notification_admin_model.countDealer(function (isCounted, resultCounted) {
                
                if(isCounted){

                    objet_retour.getEtat = true;
                    objet_retour.getObjet = resultCounted;

                    res.send(objet_retour);

                }else{

                    objet_retour.getEtat = false;
                    objet_retour.getMessage = resultCounted;

                    res.send(objet_retour)
                }
            })

        }else{
            objet_retour.getEtat = false;
            objet_retour.getMessage = messageResult;
            objet_retour.getObjet = resultAgent;

            res.send(objet_retour)
        }
    })

})

//La route permettant d'avoir le nombre de dealers
router.get("/:id_agent/countAgent", function (req, res) {
    
    var id_agent = req.params.id_agent,
        objet_retour = require("../objet_retour").ObjetRetour();

    agent_admin_dao.findOneById(id_agent, function (isAgentFound, messageResult, resultAgent) {
        
        if(isAgentFound){

            notification_admin_model.countAgent(function (isCounted, resultCounted) {
                
                if(isCounted){

                    objet_retour.getEtat = true;
                    objet_retour.getObjet = resultCounted;

                    res.send(objet_retour);

                }else{

                    objet_retour.getEtat = false;
                    objet_retour.getMessage = resultCounted;

                    res.send(objet_retour)
                }
            })

        }else{
            objet_retour.getEtat = false;
            objet_retour.getMessage = messageResult;
            objet_retour.getObjet = resultAgent;

            res.send(objet_retour)
        }
    })

})

module.exports = router;