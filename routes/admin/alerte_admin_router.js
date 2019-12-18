//On fait appel à express pour la gestion des routes
var express = require('express'),
    router = express.Router();

//Appel à la collection
var alerte_admin_dao = require("../../Models/admin/alerte_admin_dao"),
    agent_admin_dao = require("../../Models/admin/agent_admin_dao");

//La route permettant la création d'une alerte
router.post("/:id_agent/create", function(req, res) {
    
    var id_agent = req.params.id_agent,
        objet_retour = require("../objet_retour").ObjetRetour(),
        alerte_entity = require("../../Models/entities/alerte_entity").Alerte();

    alerte_entity.id_objet = req.body.id_objet;
    alerte_entity.id_auteur = id_agent;
    alerte_entity.niveau = req.body.niveau;
    alerte_entity.type = req.body.type;
    alerte_entity.descriptif = req.body.descriptif;
    alerte_entity.date = new Date();
    alerte_entity.flag = false;
    
    
    agent_admin_dao.findOneById(id_agent, function (isAgentFound, messageResult, resultAgent) {
        
        if(isAgentFound){

        
            alerte_admin_dao.create(alerte_entity, function (isCreated, resultMessage, resultCreating) {
                
                if(isCreated){

                    objet_retour.getEtat = true;
                    objet_retour.getMessage = resultMessage;
                    objet_retour.getObjet = resultCreating;

                    res.send(objet_retour);

                }else{

                    objet_retour.getEtat = false;
                    objet_retour.getMessage = resultMessage;

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

//La route permettant la création d'une alerte
router.get("/:id_agent/findonebyid/:id_alerte", function(req, res) {
    
    var id_agent = req.params.id_agent,
        id_alerte = req.params.id_alerte,
        objet_retour = require("../objet_retour").ObjetRetour();
    
    
    agent_admin_dao.findOneById(id_agent, function (isAgentFound, messageResult, resultAgent) {
        
        if(isAgentFound){

        
            alerte_admin_dao.findOneById(id_alerte, function (isFound, resultMessage, resultAlerte) {
                
                if(isFound){

                    objet_retour.getEtat = true;
                    objet_retour.getObjet = resultAlerte;
                    objet_retour.getMessage = resultMessage;

                    res.send(objet_retour);

                }else{

                    objet_retour.getEtat = false;
                    objet_retour.getMessage = resultMessage;

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

//La route permettant la création d'une alerte
router.get("/:id_agent/getall/:limit", function(req, res) {
    
    var id_agent = req.params.id_agent,
        limit = req.params.limit,
        objet_retour = require("../objet_retour").ObjetRetour();
    
        limit = parseInt(limit);
    
    agent_admin_dao.findOneById(id_agent, function (isAgentFound, messageResult, resultAgent) {
        
        if(isAgentFound){

        
            alerte_admin_dao.getAll(limit, function (isFound, resultMessage, resultAlerte) {
                
                if(isFound){

                    objet_retour.getEtat = true;
                    objet_retour.getObjet = resultAlerte;

                    res.send(objet_retour);

                }else{

                    objet_retour.getEtat = false;
                    objet_retour.getMessage = resultMessage;

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