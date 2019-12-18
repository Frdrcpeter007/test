//On fait appel à express pour la gestion des routes
var express = require('express'),
    router = express.Router();

//Appel à la base de données
var agent_admin_dao = require("../../Models/admin/agent_admin_dao"),
    media_model = require("../../Models/admin/media_admin_dao");

//La route permettant de lister les médias suivants des critères
router.get("/:id_agent/getall/:type_media/:top/:limit", function (req, res) {

    var id_agent = req.params.id_agent,
        objet_retour = require("../objet_retour").ObjetRetour(),
        type = req.params.type_media,
        top = req.params.top,
        limit = req.params.limit;

    limit = parseInt(limit);
    
    agent_admin_dao.findOneById(id_agent, function (isAgentFound, messageResult, resultAgent) {
        
        if(isAgentFound){

            media_model.getAll(type, top, limit, function(isMatched, resultMatche){
                
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

//La route permettant aux administrateurs de créer des images
router.post("/:id_agent/create", function(req, res) {
    
    var id_agent = req.params.id_agent,
    objet_retour = require("../objet_retour").ObjetRetour(),

    media_entity = require("../../Models/entities/media_entity").Media(),
    etat = req.body.etat,
    type_ads = req.body.type_ads;

    if (!etat) {
        etat = false;
    }
    media_entity.name = req.body.name;
    media_entity.type = req.body.type;
    media_entity.size = req.body.size;
    media_entity.path = req.body.path;
    media_entity.date = new Date();

    agent_admin_dao.findOneById(id_agent, function (isAgentFound, messageResult, resultAgent) {
        
        if(isAgentFound){

            media_model.create(media_entity, etat, type_ads, id_agent, function (isCreated, result_media) {
                //Si l'agent est crée, alors on attribut les valeurs des retour qui était en quelques sorte un JSON
                if (isCreated) {

                    objet_retour.getEtat = true;
                    objet_retour.getObjet = result_media;
                    
                    res.send(objet_retour);
                    
                } else { //On fait de même s'il n'est pas créer tout en précisant que si le resultat n'existe pas on mettra null à la place de celui-ci
                    objet_retour.getEtat = false;
                    objet_retour.getMessage = result_media;

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

//La router permettant d'afficher les détails d'un média
router.get("/:id_agent/findOneById/:id_media", function(req, res) {
    
    var id_agent = req.params.id_agent,
    objet_retour = require("../objet_retour").ObjetRetour(),
    id_media = req.params.id_media;


    agent_admin_dao.findOneById(id_agent, function (isAgentFound, messageResult, resultAgent) {
        
        if(isAgentFound){

            media_model.findOneById(id_media, function (isMatched, result_media) {
                //Si l'agent est crée, alors on attribut les valeurs des retour qui était en quelques sorte un JSON
                if (isMatched) {

                    objet_retour.getEtat = true;
                    objet_retour.getObjet = result_media;
                    
                    res.send(objet_retour);
                    
                } else { //On fait de même s'il n'est pas créer tout en précisant que si le resultat n'existe pas on mettra null à la place de celui-ci
                    objet_retour.getEtat = false;
                    objet_retour.getMessage = result_media;

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