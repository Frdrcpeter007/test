//On fait appel à express pour la gestion des routes
var express = require('express'),
    router = express.Router();

//Appel à la collection
var categorie_admin_model = require("../../Models/admin/categorie_admin_dao"),
    agent_admin_dao = require("../../Models/admin/agent_admin_dao");

//La route permettant d'afficher toutes les catégories
router.get("/:id_agent/getall", function (req, res) {
    
    var id_agent = req.params.id_agent,
        objet_retour = require("../objet_retour").ObjetRetour();

    agent_admin_dao.findOneById(id_agent, function (isAgentFound, messageResult, resultAgent) {
        
        if(isAgentFound){

            categorie_admin_model.getAllCategories(function (isMatched, resultMessage, resultObject) {
                
                if(isMatched){

                    objet_retour.getEtat = true;
                    objet_retour.getObjet = resultObject;
                    objet_retour.getMessage = resultMessage;

                    res.send(objet_retour);

                }else{

                    objet_retour.getEtat = false;
                    objet_retour.getObjet = resultObject;
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

//La route permettant de créer une catégorie
router.post("/:id_agent/create", function (req, res) {
    
    var id_agent = req.params.id_agent,
        objet_retour = require("../objet_retour").ObjetRetour();

    agent_admin_dao.findOneById(id_agent, function (isAgentFound, messageResult, resultAgent) {
        
        if(isAgentFound){

            var category_entity = require("../../Models/entities/categorie_entity").Categorie();

            category_entity.intitule = req.body.intitule;
            category_entity.description = req.body.description ? req.body.description : null;
            category_entity.creation.id_agent = id_agent;
            category_entity.creation.date = new Date();

            if (req.body.sous_categorie) {

                let splitValue = category_entity.intitule.split(" "),
                    id_value = "";

                splitValue.forEach(function(item) {
                    id_value += item+"_"
                });

                let sous_categorie = {
                    "id":  id_value+ 1,
                    "intitule": req.body.sous_categorie,
                    "details": req.body.details,
                    "flag" : true
                };

                category_entity.sous_categorie.push(sous_categorie);
            }

            categorie_admin_model.createNewCategory(category_entity, 
                function (isCreated, resultMessage, resultCreated) {
                
                if(isCreated){

                    objet_retour.getEtat = true;
                    objet_retour.getObjet = resultCreated;

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

//La route permettant de recherche les détails d'une catégorie
router.get("/:id_agent/getOneCategoryById/:id_categorie", function (req, res) {
    
    var id_agent = req.params.id_agent,
        objet_retour = require("../objet_retour").ObjetRetour(),
        id_categorie = req.params.id_categorie;

    agent_admin_dao.findOneById(id_agent, function (isAgentFound, messageResult, resultAgent) {
        
        if(isAgentFound){

            categorie_admin_model.getOneCategoryById(id_categorie,function (isMatched, resultMessage, resultMatched) {
                
                if(isMatched){

                    objet_retour.getEtat = true;
                    objet_retour.getMessage = resultMessage;
                    objet_retour.getObjet = resultMatched;

                    res.send(objet_retour);

                }else{

                    objet_retour.getEtat = false;
                    objet_retour.getMessage = resultMessage;
                    objet_retour.getObjet = resultMatched;

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

//La route permettant la mise à jour des infos d'une catégorie
router.post("/:id_agent/updateOneCategoryInfos/:id_categorie", function(req, res) {
    
    var id_agent = req.params.id_agent,
        objet_retour = require("../objet_retour").ObjetRetour(),
        id_categorie = req.params.id_categorie,
        newValue = {
            "intitule" : req.body.intitule,
            "description" : req.body.description
        };

    
        agent_admin_dao.findOneById(id_agent, function (isAgentFound, messageResult, resultAgent) {
        
        if(isAgentFound){

            categorie_admin_model.updateOneCategoryInfos(id_categorie, newValue, function (isUpdated, resultUpdated) {
                
                if(isUpdated){

                    objet_retour.getEtat = true;
                    objet_retour.getObjet = resultUpdated;

                    res.send(objet_retour);

                }else{

                    objet_retour.getEtat = false;
                    objet_retour.getMessage = resultUpdated;

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

//La route permettant de mettre à jour l'état de la catégorie
router.post("/:id_agent/updateCategoryFlag/:id_categorie", function(req, res) {
    
    var id_agent = req.params.id_agent,
        objet_retour = require("../objet_retour").ObjetRetour(),
        id_categorie = req.params.id_categorie;

    agent_admin_dao.findOneById(id_agent, function (isAgentFound, messageResult, resultAgent) {
        
        if(isAgentFound){

            categorie_admin_model.updateCategoryFlag(id_categorie,function (isUpdated, resultUpdate) {
                
                if(isUpdated){

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

//La route permettant d'afficher les détails d'une sous-catégorie
//Il s'agit des produits de cette dernière
router.get("/:id_agent/getOneUnderCategoryById/:id_sous_categorie", function(req, res) {
    
    var id_agent = req.params.id_agent,
        objet_retour = require("../objet_retour").ObjetRetour(),
        id_sous_categorie = req.params.id_sous_categorie;

    agent_admin_dao.findOneById(id_agent, function (isAgentFound, messageResult, resultAgent) {
        
        if(isAgentFound){

            categorie_admin_model.getOneUnderCategoryById(id_sous_categorie, function (isMatched, resultMatched) {
                
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

//La route permettant la mise à jour des infos d'une sous-catégorie
router.post("/:id_agent/updateOneUnderCategoryInfos/:id_categorie", function(req, res) {
    
    var id_agent = req.params.id_agent,
        objet_retour = require("../objet_retour").ObjetRetour(),
        id_categorie = req.params.id_categorie,
        newValue = {
            "intitule" : req.body.intitule,
            "details" : req.body.details
        },
        index_under_cat = req.body.index_under_cat;

    agent_admin_dao.findOneById(id_agent, function (isAgentFound, messageResult, resultAgent) {
        
        if(isAgentFound){

            categorie_admin_model.updateOneUnderCategoryInfos(id_categorie, index_under_cat, newValue, function (isUpdated, resultUpdate) {
                
                if(isUpdated){

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

//La router permettant de mettre à jour l'état de la sous-catégorie
router.put("/:id_agent/updateOneUnderCategoryFlag/:id_categorie", function(req, res) {
    
    var id_agent = req.params.id_agent,
        objet_retour = require("../objet_retour").ObjetRetour(),
        id_categorie = req.params.id_categorie,
        id_under_cat = req.body.id_under_cat,
        index_under_cat = req.body.index_under_cat;

    agent_admin_dao.findOneById(id_agent, function (isAgentFound, messageResult, resultAgent) {
        
        if(isAgentFound){

            categorie_admin_model.updateOneUnderCategoryFlag(id_categorie, id_under_cat, index_under_cat, 
                function (isUpdated, resultUpdate) {
                
                if(isUpdated){

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

//La router permettant d'afficher les infos(intitulé et description) d'une catégorie
router.get("/:id_agent/getCategorieInfosById/:id_categorie", function(req, res) {
    
    var id_agent = req.params.id_agent,
        objet_retour = require("../objet_retour").ObjetRetour(),
        id_categorie = req.params.id_categorie;

    agent_admin_dao.findOneById(id_agent, function (isAgentFound, messageResult, resultAgent) {
        
        if(isAgentFound){

            categorie_admin_model.getCategorieInfosById(id_categorie, function (isMatched, resultMatched) {
                
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

//La route permettant la mise à jour l'image de couverture d'une catégorie
router.post("/:id_agent/updateCategoryCoverImage/:id_categorie", function(req, res) {
    
    var id_agent = req.params.id_agent,
        objet_retour = require("../objet_retour").ObjetRetour(),
        id_categorie = req.params.id_categorie,
        newMedia = require("../../Models/entities/media_entity").Media();

        newMedia.name = req.body.image_name;
        newMedia.path = req.body.image_path;
        newMedia.mobile_size = req.body.image_mobile_size;
        newMedia.web_size = req.body.image_web_size;

    
        agent_admin_dao.findOneById(id_agent, function (isAgentFound, messageResult, resultAgent) {
        
        if(isAgentFound){

            categorie_admin_model.updateCategoryCoverImage(id_categorie, newMedia, function (isUpdated, resultUpdated) {
                
                if(isUpdated){

                    objet_retour.getEtat = true;
                    objet_retour.getObjet = resultUpdated;

                    res.send(objet_retour);

                }else{

                    objet_retour.getEtat = false;
                    objet_retour.getMessage = resultUpdated;

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

//La route permettant de lister les sous-catégories d'une catégorie
router.get("/:id_agent/getAllUnderCategoryByIdCategory/:id_categorie", function(req, res) {
    
    var id_agent = req.params.id_agent,
        objet_retour = require("../objet_retour").ObjetRetour(),
        id_categorie = req.params.id_categorie;

    
        agent_admin_dao.findOneById(id_agent, function (isAgentFound, messageResult, resultAgent) {
        
        if(isAgentFound){

            categorie_admin_model.getAllUnderCategoryByIdCategory(id_categorie, function (isUnderCat, messageUnderCat, resultUnderCat) {
                
                if(isUnderCat){

                    objet_retour.getEtat = true;
                    objet_retour.getMessage = messageUnderCat;
                    objet_retour.getObjet = resultUnderCat;

                    res.send(objet_retour);

                }else{

                    objet_retour.getEtat = false;
                    objet_retour.getMessage = messageUnderCat;

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

//La route permettant d'afficher les détails d'une sous-catégorie
router.get("/:id_agent/getOneUnderCategoryInfos/:id_categorie/:id_under_cat", function(req, res) {
    
    var id_agent = req.params.id_agent,
        objet_retour = require("../objet_retour").ObjetRetour(),
        id_categorie = req.params.id_categorie,
        id_under_cat = req.params.id_under_cat;

    
        agent_admin_dao.findOneById(id_agent, function (isAgentFound, messageResult, resultAgent) {
        
        if(isAgentFound){

            categorie_admin_model.getOneUnderCategoryInfos(id_categorie, id_under_cat, function (isUnderCat, resultUnderCat) {
                
                if(isUnderCat){

                    objet_retour.getEtat = true;
                    objet_retour.getObjet = resultUnderCat;

                    res.send(objet_retour);

                }else{

                    objet_retour.getEtat = false;
                    objet_retour.getMessage = resultUnderCat;

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

//La route permettant d'afficher les détails d'une sous-catégorie
router.post("/:id_agent/addSousCategorie", function(req, res) {
    
    var id_agent = req.params.id_agent,
        objet_retour = require("../objet_retour").ObjetRetour(),
        sous_categorie_entity = require('../../Models/entities/categorie_entity').SousCategorie(),
        id_categorie = req.body.id_categorie;

    
    agent_admin_dao.findOneById(id_agent, function (isAgentFound, messageResult, resultAgent) {
        
        if(isAgentFound){

            sous_categorie_entity.intitule = req.body.intitule;
            sous_categorie_entity.details = req.body.details;
            sous_categorie_entity.flag = true;

            categorie_admin_model.addSousCategorie(id_categorie, sous_categorie_entity, function (isUnderCat, messageUnderCat, resultUnderCat) {
                
                if(isUnderCat){

                    objet_retour.getEtat = true;
                    objet_retour.getMessage = messageUnderCat;
                    objet_retour.getObjet = resultUnderCat;

                    res.send(objet_retour);

                }else{

                    objet_retour.getEtat = false;
                    objet_retour.getMessage = messageUnderCat;

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

//La route permettant de mettre à jour l'image d'une sous-categorie
router.post("/:id_agent/updateOneUnderCategoryCoverImage", function(req, res) {
    
    var id_agent = req.params.id_agent,
        objet_retour = require("../objet_retour").ObjetRetour(),
        id_categorie = req.body.id_categorie,
        index_under_cat = req.body.index_under_cat,
        id_media = req.body.id_media;

    
    agent_admin_dao.findOneById(id_agent, function (isAgentFound, messageResult, resultAgent) {
        
        if(isAgentFound){

            categorie_admin_model.updateOneUnderCategoryCoverImage(id_categorie, index_under_cat, id_media, 
            function (isUnderCat, messageUnderCat, resultUnderCat) {
                
                if(isUnderCat){

                    objet_retour.getEtat = true;
                    objet_retour.getMessage = messageUnderCat;
                    objet_retour.getObjet = resultUnderCat;

                    res.send(objet_retour);

                }else{

                    objet_retour.getEtat = false;
                    objet_retour.getMessage = messageUnderCat;

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