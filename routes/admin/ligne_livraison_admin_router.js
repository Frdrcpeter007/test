//On fait appel à express pour la gestion des routes
var express = require('express'),
    router = express.Router();

//Appel à la collection
var ligne_livraison_admin_dao = require("../../Models/admin/ligne_livraison_admin_dao"),
    agent_admin_dao = require("../../Models/admin/agent_admin_dao");


//La route permettant de créer une nouvelle ligne de livraison
router.post("/:id_agent/create", function(req, res) {
    
    var id_agent = req.params.id_agent,
        objet_retour = require("../objet_retour").ObjetRetour();

    agent_admin_dao.findOneById(id_agent, function (isAgentFound, messageAgent, resultAgent) {
    
        if(isAgentFound){

            var new_delivery_line = require("../../Models/entities/ligne_livraison_entity").LigneLivraison();

            new_delivery_line._id = req.body.id_ligne;
            for (let index_commune = 0; index_commune < req.body.communes.length; index_commune++) {
                var commune_ligne = require("../Models/entities/ligne_livraison_entity").CommuneLigneLivraison();
                commune_ligne.etat = true;
                commune_ligne.id_commune =  req.body.communes[index_commune];
                new_delivery_line.communes.push(commune_ligne);
            }

            ligne_livraison_admin_dao.initialize(db_js);
            ligne_livraison_admin_dao.create(new_delivery_line, function(is_line, message_line, result_line) {
                
                objet_retour.getEtat = is_line;
                objet_retour.getMessage = message_line;
                objet_retour.getObjet = result_line;

                res.send(objet_retour);
            })

        }else{

            objet_retour.getEtat = false;
            objet_retour.getMessage = messageAgent;
            objet_retour.getObjet = resultAgent;

            res.send(objet_retour)
        }
    })
})


//La route permettant de rechercher une ligne suivant son identifiant
router.get("/:id_agent/findonebyid/:id_ligne", function(req, res) {
    
    var id_agent = req.params.id_agent,
        objet_retour = require("../objet_retour").ObjetRetour(), 
        id_ligne = req.params.id_ligne;
    
    agent_admin_dao.findOneById(id_agent, function (isAgentFound, messageAgent, resultAgent) {

        if(isAgentFound){

            ligne_livraison_admin_dao.initialize(db_js);
            ligne_livraison_admin_dao.findOneById(id_ligne, function(is_line, message_line, result_line) {
                
                objet_retour.getEtat = is_line;
                objet_retour.getObjet = result_line;
                objet_retour.getMessage = message_line;
                
                res.send(objet_retour)
            })

        }else{

            objet_retour.getEtat = false;
            objet_retour.getMessage = messageAgent;
            objet_retour.getObjet = resultAgent;

            res.send(objet_retour)
        }
    })
})

//La route permettant de lister toutes les lignes
router.get("/:id_agent/getall", function(req, res) {
    
    var id_agent = req.params.id_agent,
        objet_retour = require("../objet_retour").ObjetRetour();

    agent_admin_dao.findOneById(id_agent, function (isAgentFound, messageAgent, resultAgent) {

        if(isAgentFound){

            ligne_livraison_admin_dao.initialize(db_js);
            ligne_livraison_admin_dao.getAll(function(is_line, message_line, result_line) {
                
                objet_retour.getEtat = is_line;
                objet_retour.getMessage = message_line;
                objet_retour.getObjet = result_line;

                res.send(objet_retour);
            })
        }else{

            objet_retour.getEtat = false;
            objet_retour.getMessage = messageAgent;
            objet_retour.getObjet = resultAgent;

            res.send(objet_retour)
        }
    })
})



module.exports = router;