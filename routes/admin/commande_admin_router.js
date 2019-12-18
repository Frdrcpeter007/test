//On fait appel à express pour la gestion des routes
var express = require('express'),
    router = express.Router();

//Appel à la base de données
var agent_admin_dao = require("../../Models/admin/agent_admin_dao"),
    commande_admin_dao = require("../../Models/admin/commande_admin_dao");

//La route permettant de lister toutes les commandes enregistrées
router.get("/:id_agent/getall/:top/:limit", function (req, res) {

    var id_agent = req.params.id_agent,
        objet_retour = require("../objet_retour").ObjetRetour(),
        top = req.params.top,
        limit = req.params.limit;

    top = parseInt(top);
    limit = parseInt(limit);
    
    agent_admin_dao.findOneById(id_agent, function (isAgentFound, messageResult, resultAgent) {
        
        if(isAgentFound){

            commande_admin_dao.getAll(top, limit, function(isMatched, resultMatche){
                
                if(isMatched){

                    objet_retour.getEtat = true;
                    objet_retour.getObjet = resultMatche;

                    res.send(objet_retour);

                }else{

                    objet_retour.getEtat = false;
                    objet_retour.getMessage = resultMatche;

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

//La route permettant d'afficher les détails d'une commande suivant son identifiant
router.get("/:id_agent/getOneById/:id_commande/", function (req, res) {

    var id_agent = req.params.id_agent,
        objet_retour = require("../objet_retour").ObjetRetour(),
        id_commande = req.params.id_commande;
    
    agent_admin_dao.findOneById(id_agent, function (isAgentFound, messageResult, resultAgent) {
        
        if(isAgentFound){

            commande_admin_dao.getOneById(id_commande, function(isMatched, resultMatche){
                
                if(isMatched){

                    objet_retour.getEtat = true;
                    objet_retour.getObjet = resultMatche;

                    res.send(objet_retour);

                }else{

                    objet_retour.getEtat = false;
                    objet_retour.getMessage = resultMatche;

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

//La route permettant de lancer une recherche sur les commandes enregistrées
router.post("/:id_agent/searchCommande", function (req, res) {

    var id_agent = req.params.id_agent,
        objet_retour = require("../objet_retour").ObjetRetour(),
        valeur_recherche = req.body.valeur_recherche;
    
    agent_admin_dao.findOneById(id_agent, function (isAgentFound, messageResult, resultAgent) {
        
        if(isAgentFound){

            commande_admin_dao.searchCommande(valeur_recherche, function(isMatched, resultMatche){
                
                if(isMatched){

                    objet_retour.getEtat = true;
                    objet_retour.getObjet = resultMatche;

                    res.send(objet_retour);

                }else{

                    objet_retour.getEtat = false;
                    objet_retour.getMessage = resultMatche;

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

//La route permettant de compter les commandes passées par un client
router.get("/:id_agent/countbyidclient/:id_client", function (req, res) {

    var id_agent = req.params.id_agent,
        objet_retour = require("../objet_retour").ObjetRetour(),
        id_client = req.params.id_client;
    
    agent_admin_dao.findOneById(id_agent, function (isAgentFound, messageResult, resultAgent) {
        
        if(isAgentFound){

            commande_admin_dao.countCommandeByIdClient(id_client, function(isMatched, resultMatche){
                
                if(isMatched){

                    objet_retour.getEtat = true;
                    objet_retour.getObjet = resultMatche;

                    res.send(objet_retour);

                }else{

                    objet_retour.getEtat = false;
                    objet_retour.getMessage = resultMatche;

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

//La route permettant de lancer une recherche sur les commandes enregistrées
router.get("/:id_agent/getAllByIdClient/:id_client", function (req, res) {

    var id_agent = req.params.id_agent,
        id_client = req.params.id_client,
        objet_retour = require("../objet_retour").ObjetRetour();
    
    agent_admin_dao.findOneById(id_agent, function (isAgentFound, messageResult, resultAgent) {
        
        if(isAgentFound){

            commande_admin_dao.getAllByIdClient (id_client, function(isMatched,messageResult, resultMatche){
                
                if(isMatched){

                    objet_retour.getEtat = true;
                    objet_retour.getObjet = resultMatche;

                    res.send(objet_retour);

                }else{

                    objet_retour.getEtat = false;
                    objet_retour.getMessage = resultMatche;

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