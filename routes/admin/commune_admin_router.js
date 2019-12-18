//On fait appel à express pour la gestion des routes
var express = require('express'),
    router = express.Router();

//Appel à la base de données
var agent_admin_dao = require("../../Models/admin/agent_admin_dao"), 
    commune_admin_dao = require("../../Models/admin/commune_admin_dao");

//La route permettant de lister toutes les commandes enregistrées
router.post("/:id_agent/create", function (req, res) {

    var id_agent = req.params.id_agent,
        objet_retour = require("../objet_retour").ObjetRetour(),
        commune_entity = require("../../Models/entities/commune_entity").Commune();

    commune_entity.id_ville = req.body.id_ville;
    commune_entity.nom = req.body.nom_ville;
    commune_entity.coordonnees = req.body.coordonnees;

    
    agent_admin_dao.findOneById(id_agent, function (isAgentFound, messageResult, resultAgent) {
        
        if(isAgentFound){

            commune_admin_dao.create(commune_entity, function(isCreated, messageCreating, resultCreating){
                
                if(isCreated){

                    objet_retour.getEtat = true;
                    objet_retour.getObjet = resultCreating;

                    res.send(objet_retour);

                }else{

                    objet_retour.getEtat = false;
                    objet_retour.getMessage = messageCreating;

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

//La route permettant de lister toutes les communes d'une ville
router.post("/:id_agent/findAllByIdVille/:id_ville", function (req, res) {

    var id_agent = req.params.id_agent,
        objet_retour = require("../objet_retour").ObjetRetour(),
        id_ville = req.params.id_ville;

    
    agent_admin_dao.findOneById(id_agent, function (isAgentFound, messageResult, resultAgent) {
        
        if(isAgentFound){

            commune_admin_dao.findAllByIdVille(id_ville, function(isFound, messageFinding, resultFinding){
                
                if(isFound){

                    objet_retour.getEtat = true;
                    objet_retour.getObjet = resultFinding;

                    res.send(objet_retour);

                }else{

                    objet_retour.getEtat = false;
                    objet_retour.getMessage = messageFinding;

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