//On fait appel à express pour la gestion des routes
var express = require('express'),
    router = express.Router();

//Appel à la collection
var agent_admin_dao = require("../../Models/admin/agent_admin_dao");

//La route permettant d'afficher tous les ads
router.post("/login", function (req, res) {
    
    var objet_retour = require("../objet_retour").ObjetRetour(),
        username = req.body.username,
        password = req.body.password;

        agent_admin_dao.login(username, password, function (isMatched,resultObject) {
        
        if(isMatched){

            objet_retour.getEtat = true;
            objet_retour.getObjet = resultObject;

            res.send(objet_retour);

        }else{

            objet_retour.getEtat = false;
            objet_retour.getMessage = resultObject;

            res.send(objet_retour)
        }
    })

})

//La route permettant d'avoir tous les dealers
router.get("/:id_agent/getall/:gtDateAgent", function (req, res) {
    
    var id_agent = req.params.id_agent,
        gtDateAgent = req.params.gtDateAgent,
        objet_retour = require("../objet_retour").ObjetRetour();

    agent_admin_dao.findOneById(id_agent, function (isAgentFound, messageResult, resultAgent) {
        
        if(isAgentFound){

            agent_admin_dao.getAll(gtDateAgent, function (isMatched, messageResult, resultMatched) {
                
                if(isMatched){

                    objet_retour.getEtat = true;
                    objet_retour.getMessage = messageResult;
                    objet_retour.getObjet = resultMatched;

                    res.send(objet_retour);

                }else{

                    objet_retour.getEtat = false;
                    objet_retour.getMessage = messageResult;
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

//La route permettant d'avoir le nombre de dealers
router.get("/:id_agent/findOneById/:id_agent", function (req, res) {
    
    var id_agent = req.params.id_agent,
        objet_retour = require("../objet_retour").ObjetRetour(),
        id_agent = req.params.id_agent;

    agent_admin_dao.findOneById(id_agent, function (isAgentFound, messageResult, resultAgent) {
        
        if(isAgentFound){

            agent_admin_dao.findOneById(id_agent, function (isAgent, resultAgent) {
                
                if(isAgent){

                    objet_retour.getEtat = true;
                    objet_retour.getObjet = resultAgent;

                    res.send(objet_retour);

                }else{

                    objet_retour.getEtat = false;
                    objet_retour.getMessage = resultAgent;

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

//La route permettant de creer un agent
router.post("/:id_agent/create", function (req, res) {

    var id_agent = req.params.id_agent,
        objet_retour = require("../objet_retour").ObjetRetour();

    agent_admin_dao.findOneById(id_agent, function (isAgentFound, messageResult, resultAgent) {

        if(isAgentFound){

            var agent_entity = require('../../Models/entities/agent_entity').Agent(),
                agent_username = require('../../Models/entities/agent_entity').AgentUsername(),
                agent_commune = require("../../Models/entities/agent_entity").AgentCommune(),
                agent_privilege = require("../../Models/entities/agent_entity").AgentPrivilege();

            agent_entity.nom = req.body.nom;
            agent_entity.prenom = req.body.prenom;
            agent_entity.sexe = req.body.sexe;
            agent_entity.date_naissance = req.body.date_naissance;
            agent_entity.lieu_naissance = req.body.lieu_naissance;

            agent_entity.creation.id_agent = id_agent;
            agent_entity.creation.date = new Date();

            agent_username.valeur = req.body.username;
            agent_username.etat = true;
            agent_entity.authentification.username.push(agent_username);
            agent_entity.authentification.telephone.push(req.body.telephone);

            agent_entity.authentification.password.push(req.body.password);

            agent_commune.date_debut_affect = new Date();
            agent_commune.flag = true;
            agent_commune.id_commune = req.body.id_commune;
            agent_commune.role = req.body.role_commune;
            agent_entity.commune.push(agent_commune);

            agent_privilege.valeur = require.body.privilege;
            agent_privilege.etat = true;
            agent_privilege.date_debut = new Date();
            agent_entity.privilege.push(agent_privilege);

            agent_admin_dao.create(agent_entity, function(isCreated, messageCreate, resultCreate) {
                
                if(isCreated){

                    objet_retour.getEtat = true;
                    objet_retour.getObjet = resultCreate;

                    res.send(objet_retour);
                    
                }else{
                    objet_retour.getEtat = false;
                    objet_retour.getMessage = messageCreate;

                    res.send(objet_retour);
                }
            })

        }else{

            objet_retour.getEtat = false;
            objet_retour.getMessage = messageResult;

            res.send(objet_retour);
        }

    })

})

//La route permettant d'affecter une commune à un agent
router.post("/:id_agent/addCommune", function (req, res) {

    var id_agent = req.params.id_agent,
        objet_retour = require("../objet_retour").ObjetRetour();

    agent_admin_dao.findOneById(id_agent, function (isAgentFound, messageResult, resultAgent) {

        if(isAgentFound){

            var agent_commune = require('../../Models/entities/agent_entity').AgentCommune(),
                id_agent_for_updating = req.body.id_agent_for_updating;

            agent_commune.id_commune = req.body.id_commune;
            agent_commune.role = req.body.role_commune;
            agent_commune.flag = true;
            agent_commune.date_debut_affect = new Date();

            agent_admin_dao.addCommune(id_agent_for_updating, agent_commune, function(isAdded, messageAdding, resultAdding) {
                
                if(isAdded){

                    objet_retour.getEtat = true;
                    objet_retour.getObjet = resultAdding;

                    res.send(objet_retour);
                    
                }else{
                    objet_retour.getEtat = false;
                    objet_retour.getMessage = messageAdding;

                    res.send(objet_retour);
                }
            })

        }else{

            objet_retour.getEtat = false;
            objet_retour.getMessage = messageResult;

            res.send(objet_retour);
        }

    })

})

module.exports = router;