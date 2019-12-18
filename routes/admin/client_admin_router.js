//On fait appel à express pour la gestion des routes
var express = require('express'),
    router = express.Router();


//Appel à la collection
var client_admin_model = require("../../Models/admin/client_admin_dao"),
    agent_admin_dao = require("../../Models/admin/agent_admin_dao");


//La route permettant de recuperer tous les clients
router.get("/:id_agent/getall/:gt_date_client", function (req, res) {
    
    var id_agent = req.params.id_agent,
        gtDateClient= req.params.gt_date_client,
        objet_retour = require("../objet_retour").ObjetRetour();

    agent_admin_dao.findOneById(id_agent, function (isAgentFound, messageResult, resultAgent) {
        
        if(isAgentFound){

            client_admin_model.getAll(gtDateClient, function (isMatched, resultMatched) {
                
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

//La route permettant de rechercher un client suivant ses appelations
router.post("/:id_agent/searchbynames", function (req, res) {
    
    var id_agent = req.params.id_agent,
        objet_retour = require("../objet_retour").ObjetRetour();

    agent_admin_dao.findOneById(id_agent, function (isAgentFound, messageResult, resultAgent) {
        
        if(isAgentFound){

            var query = req.body.valeur_recherchee;

            client_admin_model.searchByNames(query, function (isMatched, resultMatched) {
                
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

//La route permettant d'afficher les détails d'un client
router.get("/:id_agent/findOneById/:id_client", function(req, res) {
    
    var id_agent = req.params.id_agent,
    objet_retour = require("../objet_retour").ObjetRetour(),
    id_client = req.params.id_client;

    agent_admin_dao.findOneById(id_agent, function (isAgentFound, messageResult, resultAgent) {
        
        if(isAgentFound){

            client_admin_model.findOneById(id_client, function (isMatched, resultMatched) {
                
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

// La route permettant de mettre à jour le flag d'un client
router.get("/:id_agent/updateFlag/:id_client", function(req, res) {
    
    var id_agent = req.params.id_agent,
    objet_retour = require("../objet_retour").ObjetRetour(),
    id_client = req.params.id_client;

    agent_admin_dao.findOneById(id_agent, function (isAgentFound, messageResult, resultAgent) {
        
        if(isAgentFound){

            client_admin_model.updateFlag(id_client, id_agent, function (isMatched, messageResult, resultMatched) {
                
                if(isMatched){

                    objet_retour.getEtat = true;
                    objet_retour.getObjet = resultMatched;
                    objet_retour.getMessage = messageResult;

                    res.send(objet_retour);

                }else{

                    objet_retour.getEtat = false;
                    objet_retour.getMessage = messageResult;

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