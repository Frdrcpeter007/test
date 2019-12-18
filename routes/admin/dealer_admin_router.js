//On fait appel à express pour la gestion des routes
var express = require('express'),
    router = express.Router();

//Appel à la collection
var dealer_admin_model = require("../../Models/admin/dealer_admin_dao"),
    agent_admin_dao = require("../../Models/admin/agent_admin_dao");

//La route permettant d'avoir tous les dealers
router.get("/:id_agent/getall/:gtDateDealer", function (req, res) {
    
    var id_agent = req.params.id_agent,
        gtDateDealer = req.params.gtDateDealer,
        objet_retour = require("../objet_retour").ObjetRetour();

    agent_admin_dao.findOneById(id_agent, function (isAgentFound, messageResult, resultAgent) {
        
        if(isAgentFound){

            dealer_admin_model.getAll(gtDateDealer, function (isMatched, resultMatched) {
                
                if(isMatched){

                    objet_retour.getEtat = true;
                    objet_retour.getObjet = resultMatched;

                    res.send(objet_retour);

                }else{

                    objet_retour.getEtat = false;
                    objet_retour.getMessage = resultMatched;

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

//La route permettant de rechercher un dealer par ses noms
router.post("/:id_agent/searchbynames", function(req, res) {
    
    var id_agent = req.params.id_agent,
        objet_retour = require("../objet_retour").ObjetRetour();

    agent_admin_dao.findOneById(id_agent, function (isAgentFound, messageResult, resultAgent) {
        
        if(isAgentFound){

            var query = req.body.valeur_recherchee;

            dealer_admin_model.searchByNames(query, function (isMatched, resultMatched) {
                
                if(isMatched){

                    objet_retour.getEtat = true;
                    objet_retour.getObjet = resultMatched;

                    res.send(objet_retour);

                }else{

                    objet_retour.getEtat = false;
                    objet_retour.getMessage = resultMatched;

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

//La route permettant de compter les dealers
router.get("/:id_agent/countall", function (req, res) {
    
    var id_agent = req.params.id_agent,
        objet_retour = require("../objet_retour").ObjetRetour();

    agent_admin_dao.findOneById(id_agent, function (isAgentFound, messageResult, resultAgent) {
        
        if(isAgentFound){

            dealer_admin_model.countAll(function (isMatched, resultMatched) {
                
                if(isMatched){

                    objet_retour.getEtat = true;
                    objet_retour.getObjet = resultMatched;

                    res.send(objet_retour);

                }else{

                    objet_retour.getEtat = false;
                    objet_retour.getMessage = resultMatched;

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

//La route permettant à un agent de créer un dealer
router.post("/:id_agent/create", function(req, res) {
    
    var id_agent = req.params.id_agent,
    objet_retour = require("../objet_retour").ObjetRetour();

    agent_admin_dao.findOneById(id_agent, function (isAgentFound, messageResult, resultAgent) {
        
        if(isAgentFound){

            var client_entity = require("../../Models/entities/client_entity").Client(),
                username = {
                    "valeur": req.body.username,
                    "etat": true,
                    "type": req.body.type
                };

            //On attribut des valeurs aux propriété de client_entity
            client_entity.nom = req.body.nom;
            client_entity.prenom = req.body.prenom;
            client_entity.sexe = req.body.sexe;
            client_entity.inscription.username.push(username);
            client_entity.inscription.password.push(req.body.password);
            client_entity.inscription.date = new Date();
            dealer_admin_model.create(client_entity, id_agent, function (isCreated, messageDealer, resultDealer) {
                
                if(isCreated){

                    objet_retour.getEtat = true;
                    objet_retour.getObjet = resultDealer;
                    objet_retour.getMessage = messageDealer;
            
                    res.send(objet_retour);

                }else{

                    objet_retour.getEtat = false;
                    objet_retour.getObjet = resultDealer;
                    objet_retour.getMessage = messageDealer;

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

//La route permettant d'avoir les détails d'un dealer
router.get("/:id_agent/findOneById/:id_dealer", function(req, res) {
    
    var id_agent = req.params.id_agent,
    id_dealer = req.params.id_dealer,
    objet_retour = require("../objet_retour").ObjetRetour();

    agent_admin_dao.findOneById(id_agent, function (isAgentFound, messageResult, resultAgent) {
        
        if(isAgentFound){
            
            dealer_admin_model.findOneById(id_dealer, function (isMatched, resultMatched) {
                
                if(isMatched){

                    objet_retour.getEtat = true;
                    objet_retour.getObjet = resultMatched;
            
                    res.send(objet_retour);

                }else{

                    objet_retour.getEtat = false;
                    objet_retour.getMessage = resultMatched;

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

//La route permettant d'avoir les agents approuveur et/ou créateur d'un compte
router.get("/:id_agent/findCreatorAndApprover/:id_dealer", function(req, res) {
    
    var id_agent = req.params.id_agent,
    id_dealer = req.params.id_dealer,
    objet_retour = require("../objet_retour").ObjetRetour();

    agent_admin_dao.findOneById(id_agent, function (isAgentFound, messageResult, resultAgent) {
        
        if(isAgentFound){
            
            dealer_admin_model.findCreatorAndApprover(id_dealer, function (isMatched, resultMatched) {
                
                if(isMatched){

                    objet_retour.getEtat = true;
                    objet_retour.getObjet = resultMatched;
            
                    res.send(objet_retour);

                }else{

                    objet_retour.getEtat = false;
                    objet_retour.getMessage = resultMatched;

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

//La route permettant de valider la demande d'un client
router.get("/:id_agent/validateClientRequest/:id_dealer", function(req, res) {
    
    var id_agent = req.params.id_agent,
    id_dealer = req.params.id_dealer,
    objet_retour = require("../objet_retour").ObjetRetour();

    agent_admin_dao.findOneById(id_agent, function (isAgentFound, messageResult, resultAgent) {
        
        if(isAgentFound){
            
            dealer_admin_model.validateClientRequest(id_dealer, id_agent, function (isValidate, messageValidating, resultValidating) {
                
                if(isValidate){

                    objet_retour.getEtat = true;
                    objet_retour.getObjet = resultValidating;
            
                    res.send(objet_retour);

                }else{

                    objet_retour.getEtat = false;
                    objet_retour.getMessage = messageValidating;

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

//La route permettant d'activer/désactiver l'état d'un dealer
router.get("/:id_agent/manageFlag/:id_dealer", function(req, res) {
    
    var id_agent = req.params.id_agent,
    id_dealer = req.params.id_dealer,
    objet_retour = require("../objet_retour").ObjetRetour();

    agent_admin_dao.findOneById(id_agent, function (isAgentFound, messageResult, resultAgent) {
        
        if(isAgentFound){
            
            dealer_admin_model.manageFlag(id_dealer, id_agent, function (isManaged, messageManagement, resultManagement) {
                
                if(isManaged){

                    objet_retour.getEtat = true;
                    objet_retour.getObjet = resultManagement;
            
                    res.send(objet_retour);

                }else{

                    objet_retour.getEtat = false;
                    objet_retour.getMessage = messageManagement;

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

//La route qui vérifie si une demande dealer par rapport à un client est en attente
router.get("/:id_agent/checkPendingClientRequestByIdClient/:id_client", function(req, res) {
    
    var id_agent = req.params.id_agent,
    id_client = req.params.id_client,
    objet_retour = require("../objet_retour").ObjetRetour();

    agent_admin_dao.findOneById(id_agent, function (isAgentFound, messageResult, resultAgent) {
        
        if(isAgentFound){
            
            dealer_admin_model.checkPendingClientRequestByIdClient(id_client, function (isManaged, messageManagement, resultManagement) {
                
                if(isManaged){

                    objet_retour.getEtat = true;
                    objet_retour.getObjet = resultManagement;
            
                    res.send(objet_retour);

                }else{

                    objet_retour.getEtat = false;
                    objet_retour.getMessage = messageManagement;

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

//La route permettant d'activer/désactiver l'état d'un dealer
router.post("/:id_agent/managerDealerMode/:id_dealer", function(req, res) {
    
    var id_agent = req.params.id_agent,
    id_dealer = req.params.id_dealer,
    motif = req.body.motif,
    objet_retour = require("../objet_retour").ObjetRetour();

    agent_admin_dao.findOneById(id_agent, function (isAgentFound, messageResult, resultAgent) {
        
        if(isAgentFound){
            
            dealer_admin_model.managerDealerMode(id_dealer, id_agent, motif, function (isManaged, messageManagement, resultManagement) {
                
                if(isManaged){

                    objet_retour.getEtat = true;
                    objet_retour.getObjet = resultManagement;
            
                    res.send(objet_retour);

                }else{

                    objet_retour.getEtat = false;
                    objet_retour.getMessage = messageManagement;

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

//--------------------------- A RELIER DANS L'ADMINISTRATION-----------------------

//La route permettant de lister les demandes dealers en attente
router.post("/:id_agent/getAllPendingRequests/:limit", function(req, res) {
    
    var id_agent = req.params.id_agent,
    last_date = req.body.last_date,
    limit = req.params.limit,
    objet_retour = require("../objet_retour").ObjetRetour();

    limit = parseInt(limit);

    agent_admin_dao.findOneById(id_agent, function (isAgentFound, messageResult, resultAgent) {
        
        if(isAgentFound){
            
            dealer_admin_model.getAllPendingRequests(last_date, limit, function (isManaged, messageManagement, resultManagement) {
                
                if(isManaged){

                    objet_retour.getEtat = true;
                    objet_retour.getObjet = resultManagement;
            
                    res.send(objet_retour);

                }else{

                    objet_retour.getEtat = false;
                    objet_retour.getMessage = messageManagement;

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

//La route permettant de lister les demandes dealers en attente
router.get("/:id_agent/countPendingRequests", function(req, res) {
    
    var id_agent = req.params.id_agent,
    objet_retour = require("../objet_retour").ObjetRetour();

    agent_admin_dao.findOneById(id_agent, function (isAgentFound, messageResult, resultAgent) {
        
        if(isAgentFound){
            
            dealer_admin_model.countPendingRequests(function (isManaged, messageManagement, resultManagement) {
                
                if(isManaged){

                    objet_retour.getEtat = true;
                    objet_retour.getObjet = resultManagement;
            
                    res.send(objet_retour);

                }else{

                    objet_retour.getEtat = false;
                    objet_retour.getMessage = messageManagement;

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

//La route permettant de lister les dealers suspendus
router.post("/:id_agent/getAllDisabledAccount/:limit", function(req, res) {
    
    var id_agent = req.params.id_agent,
    last_date = req.body.last_date,
    limit = req.params.limit,
    objet_retour = require("../objet_retour").ObjetRetour();

    limit = parseInt(limit);

    agent_admin_dao.findOneById(id_agent, function (isAgentFound, messageResult, resultAgent) {
        
        if(isAgentFound){
            
            dealer_admin_model.getAllDisabledAccount(last_date, limit, function (isManaged, messageManagement, resultManagement) {
                
                if(isManaged){

                    objet_retour.getEtat = true;
                    objet_retour.getObjet = resultManagement;
            
                    res.send(objet_retour);

                }else{

                    objet_retour.getEtat = false;
                    objet_retour.getMessage = messageManagement;

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