//On fait appel à express pour la gestion des routes
var express = require('express'),
    router = express.Router();

//Appel à la collection
var ads_admin_model = require("../../Models/admin/ads_admin_dao"),
    agent_admin_model = require("../../Models/admin/agent_admin_dao");

//La route permettant de créer un ads
router.post("/:id_agent/create", function (req, res) {

    var id_agent = req.params.id_agent,
        objet_retour = require("../objet_retour").ObjetRetour(),
        ads_entity = require("../../Models/entities/ads_entity").Ads();

    ads_entity.type = req.body.type_ads;
    ads_entity.date_creation = new Date();
    ads_entity.date_debut_publication = new Date(req.body.date_debut_publication);
    ads_entity.date_fin_publication = new Date(req.body.date_fin_publication);
    ads_entity.etat = false;
    ads_entity.id_agent = id_agent;
    ads_entity.annotation = req.body.annotation;

    var image_name = req.body.image_name,
        image_path = req.body.image_path,
        image_size = req.body.image_size;
    
    
    agent_admin_model.findOneById(id_agent, function (isAgentFound, messageResult, resultAgent) {
        
        if(isAgentFound){

            ads_admin_model.create(ads_entity, image_name, image_path, image_size, function (isCreated, resultCreated) {
                
                if(isCreated){

                    objet_retour.getEtat = true;
                    objet_retour.getObjet = resultCreated;

                    res.send(objet_retour);

                }else{

                    objet_retour.getEtat = false;
                    objet_retour.getMessage = resultCreated;

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

//La route permettant d'afficher tous les ads
router.get("/:id_agent/getall/:top/:limit", function (req, res) {
    
    var id_agent = req.params.id_agent,
        objet_retour = require("../objet_retour").ObjetRetour(),
        top = req.params.top,
        limit = req.params.limit;

    top = parseInt(top);
    limit = parseInt(limit);

    
    agent_admin_model.findOneById(id_agent, function (isAgentFound, messageResult, resultAgent) {
        
        if(isAgentFound){

            ads_admin_model.getAll(top, limit, function (isMatched,resultObject) {
                
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

        }else{
            objet_retour.getEtat = false;
            objet_retour.getMessage = messageResult;
            objet_retour.getObjet = resultAgent;

            res.send(objet_retour)
        }
    })

})

//La router permettant d'afiicher les détais d'un ads
router.get("/:id_agent/findOneById/:id_ads", function (req, res) {
    
    var id_agent = req.params.id_agent,
        objet_retour = require("../objet_retour").ObjetRetour(),
        id_ads = req.params.id_ads;


    
    agent_admin_model.findOneById(id_agent, function (isAgentFound, messageResult, resultAgent) {
        
        if(isAgentFound){

            ads_admin_model.findOneById(id_ads, function (isMatched,resultObject) {
                
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

        }else{
            objet_retour.getEtat = false;
            objet_retour.getMessage = messageResult;
            objet_retour.getObjet = resultAgent;

            res.send(objet_retour)
        }
    })

})

//La fonction permettant de mettre à jour les infos de l'ads
router.put("/:id_agent/updateInfos/:id_ads", function (req, res) {
    
    var id_agent = req.params.id_agent,
        objet_retour = require("../objet_retour").ObjetRetour(),
        id_ads = req.params.id_ads,
        type_ads = req.body.type_ads,
        date_debut = new Date(req.body.date_debut_ads),
        date_fin = new Date(req.body.date_fin_ads),
        annotation_ads = req.body.annotation_ads;


    
    agent_admin_model.findOneById(id_agent, function (isAgentFound, messageResult, resultAgent) {
        
        if(isAgentFound){

            ads_admin_model.updateInfos(id_ads, type_ads, date_debut, date_fin,
            annotation_ads, function (isUpdate,resultUpdate) {
                
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

//La router permettant de mettre à jour l'état d'un ads
router.put("/:id_agent/updateState/:id_ads", function (req, res) {
    
    var id_agent = req.params.id_agent,
        objet_retour = require("../objet_retour").ObjetRetour(),
        id_ads = req.params.id_ads;


    
    agent_admin_model.findOneById(id_agent, function (isAgentFound, messageResult, resultAgent) {
        
        if(isAgentFound){

            ads_admin_model.updateState(id_ads, function (isUpdate,resultUpdate) {
                
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