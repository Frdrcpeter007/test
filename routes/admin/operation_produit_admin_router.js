//On fait appel à express pour la gestion des routes
var express = require('express'),
    router = express.Router();


//Appel à la collection
var operation_prodiuit_admin_model = require("../../Models/admin/operation_produit_admin_dao"),
    agent_admin_dao = require("../../Models/admin/agent_admin_dao");

//La route permettant d'avoir le nombre de clients inscrits
router.get("/:id_agent/getSubmittedProductsByIdDealer/:id_dealer", function (req, res) {
    
    var id_agent = req.params.id_agent,
        id_dealer = req.params.id_dealer,
        objet_retour = require("../objet_retour").ObjetRetour();

    agent_admin_dao.findOneById(id_agent, function (isAgentFound, messageResult, resultAgent) {
        
        if(isAgentFound){

            operation_prodiuit_admin_model.getSubmittedProductsByIdDealer(id_dealer,function (isMatched, messageMatch,  resultMatch) {
                
                if(isMatched){

                    objet_retour.getEtat = true;
                    objet_retour.getMessage = messageMatch;
                    objet_retour.getObjet = resultMatch;

                    res.send(objet_retour);

                }else{

                    objet_retour.getEtat = false;
                    objet_retour.getMessage = messageMatch;
                    objet_retour.getObjet = resultMatch;

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

//La route permettant d'avoir la liste de produit d'une dealer
router.get("/:id_agent/getAllProductByIdDealer/:id_dealer", function (req, res) {
    
    var id_agent = req.params.id_agent,
        id_dealer = req.params.id_dealer,
        objet_retour = require("../objet_retour").ObjetRetour();

    agent_admin_dao.findOneById(id_agent, function (isAgentFound, messageResult, resultAgent) {
        
        if(isAgentFound){

            operation_prodiuit_admin_model.getAllProductByIdDealer(id_dealer,function (isMatched, messageMatch,  resultMatch) {
                
                if(isMatched){

                    objet_retour.getEtat = true;
                    objet_retour.getMessage = messageMatch;
                    objet_retour.getObjet = resultMatch;

                    res.send(objet_retour);

                }else{

                    objet_retour.getEtat = false;
                    objet_retour.getMessage = messageMatch;
                    objet_retour.getObjet = resultMatch;

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

//La route permettant de compter le nombre d'opérations vente d'un dealer
router.get("/:id_agent/countAllSubmittedProductForDealer/:id_dealer", function (req, res) {
    
    var id_agent = req.params.id_agent,
        id_dealer = req.params.id_dealer,
        objet_retour = require("../objet_retour").ObjetRetour();

    agent_admin_dao.findOneById(id_agent, function (isAgentFound, messageResult, resultAgent) {
        
        if(isAgentFound){

            operation_prodiuit_admin_model.countAllSubmittedProductForDealer(id_dealer,function (isMatched, messageMatch,  resultMatch) {
                
                if(isMatched){

                    objet_retour.getEtat = true;
                    objet_retour.getMessage = messageMatch;
                    objet_retour.getObjet = resultMatch;

                    res.send(objet_retour);

                }else{

                    objet_retour.getEtat = false;
                    objet_retour.getMessage = messageMatch;
                    objet_retour.getObjet = resultMatch;

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

//La route permettant de compter le nombre de produits liés à un dealer
router.get("/:id_agent/countAllProductForDealer/:id_dealer", function (req, res) {
    
    var id_agent = req.params.id_agent,
        id_dealer = req.params.id_dealer,
        objet_retour = require("../objet_retour").ObjetRetour();

    agent_admin_dao.findOneById(id_agent, function (isAgentFound, messageResult, resultAgent) {
        
        if(isAgentFound){

            operation_prodiuit_admin_model.countAllProductForDealer(id_dealer,function (isMatched, messageMatch,  resultMatch) {
                
                if(isMatched){

                    objet_retour.getEtat = true;
                    objet_retour.getMessage = messageMatch;
                    objet_retour.getObjet = resultMatch;

                    res.send(objet_retour);

                }else{

                    objet_retour.getEtat = false;
                    objet_retour.getMessage = messageMatch;
                    objet_retour.getObjet = resultMatch;

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

//La route permettant de mettre à jour l'état d'une opération produit. 
router.post("/:id_agent/updateValidationValue/:id_operation", function (req, res) {
    
    var id_agent = req.params.id_agent,
        id_operation = req.params.id_operation,
        objet_retour = require("../objet_retour").ObjetRetour();

    agent_admin_dao.findOneById(id_agent, function (isAgentFound, messageResult, resultAgent) {
        
        if(isAgentFound){

            operation_prodiuit_admin_model.updateValidationValue(id_operation, id_agent, function (isUpdate,  resultUpdate) {
                
                if(isUpdate){

                    objet_retour.getEtat = true;
                    objet_retour.getObjet = resultUpdate;

                    res.send(objet_retour);

                }else{

                    objet_retour.getEtat = false;
                    objet_retour.getMessage = resultUpdate;

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

//La route permettant de lister les opérations validation d'un agent
router.post("/:id_agent/getValidationOperationByIdAgent", function (req, res) {
    
    var id_agent = req.params.id_agent,
        gtValue = req.body.gtValue,
        limit = req.body.limit,
        id_showing_agent = req.body.id_agent,
        objet_retour = require("../objet_retour").ObjetRetour();

    agent_admin_dao.findOneById(id_agent, function (isAgentFound, messageResult, resultAgent) {
        
        if(isAgentFound){

            operation_prodiuit_admin_model.getValidationOperationByIdAgent(id_showing_agent, gtValue, limit,function (isUpdate,  resultUpdate) {
                
                if(isUpdate){

                    objet_retour.getEtat = true;
                    objet_retour.getObjet = resultUpdate;

                    res.send(objet_retour);

                }else{

                    objet_retour.getEtat = false;
                    objet_retour.getMessage = resultUpdate;

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