//On fait appel à express pour la gestion des routes
var express = require('express'),
    router = express.Router();

//Appel à la collection
var produit_admin_model = require("../../Models/admin/produit_admin_dao"),
    agent_admin_dao = require("../../Models/admin/agent_admin_dao"),
    favoris_admin_dao = require("../../Models/admin/favoris_admin_dao"),
    commande_admin_dao = require("../../Models/admin/commande_admin_dao");

//La route permettant de compter la quantité des réserves en stock d'un produit
router.get("/:id_agent/countReserveStockByProductId/:id_product", function (req, res) {
    
    var id_agent = req.params.id_agent,
        objet_retour = require("../objet_retour").ObjetRetour(),
        id_product = req.params.id_product;

    agent_admin_dao.findOneById(id_agent, function (isAgentFound, messageResult, resultAgent) {
        
        if(isAgentFound){

            produit_admin_model.countReserveStockByProductId(id_product, function(isCounted, resultCount){
                
                if(isCounted){

                    objet_retour.getEtat = true;
                    objet_retour.getObjet = resultCount;

                    res.send(objet_retour);

                }else{

                    objet_retour.getEtat = false;
                    objet_retour.getMessage = resultCount;

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

//La route permettant de compter le nombre de mentions 'favoris' d'un produit
router.get("/:id_agent/countFavorisByIdProduit/:id_product", function (req, res) {
    
    var id_agent = req.params.id_agent,
        objet_retour = require("../objet_retour").ObjetRetour(),
        id_product = req.params.id_product;

    agent_admin_dao.findOneById(id_agent, function (isAgentFound, messageResult, resultAgent) {
        
        if(isAgentFound){

            favoris_admin_dao.countFavorisByIdProduit(id_product, function(isCounted, resultCount){
                
                if(isCounted){

                    objet_retour.getEtat = true;
                    objet_retour.getObjet = resultCount;

                    res.send(objet_retour);

                }else{

                    objet_retour.getEtat = false;
                    objet_retour.getMessage = resultCount;

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

//La route permettant de compter le nombre de commandes passées pour un produit
router.get("/:id_agent/countCommandeByIdProduit/:id_product", function (req, res) {
    
    var id_agent = req.params.id_agent,
        objet_retour = require("../objet_retour").ObjetRetour(),
        id_product = req.params.id_product;

    agent_admin_dao.findOneById(id_agent, function (isAgentFound, messageResult, resultAgent) {
        
        if(isAgentFound){

            commande_admin_dao.countCommandeByIdProduit(id_product, function(isCounted, resultCount){
                
                if(isCounted){

                    objet_retour.getEtat = true;
                    objet_retour.getObjet = resultCount;

                    res.send(objet_retour);

                }else{

                    objet_retour.getEtat = false;
                    objet_retour.getMessage = resultCount;

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

//La route permettant de mettre à jour l'intitulé d'un produit
router.put("/:id_agent/updateProductLabel/:id_product", function(req, res) {
    
    var id_agent = req.params.id_agent,
        objet_retour = require("../objet_retour").ObjetRetour(),
        id_product = req.params.id_product,
        index_label = req.body.index_label,
        new_label = req.body.new_label;


    agent_admin_dao.findOneById(id_agent, function (isAgentFound, messageResult, resultAgent) {
        
        if(isAgentFound){

            produit_admin_model.updateProductLabel(id_product, index_label, new_label, 
            function(isUpdated, resultUpdate) {
                
                if(isUpdated){
                    objet_retour.getEtat = true;
                    objet_retour.getObjet = resultUpdate;

                    res.send(objet_retour);                    
                }else{
                    objet_retour.getEtat = false;
                    objet_retour.getMessage = resultUpdate;

                    res.send(objet_retour);
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

//La route permettant d'ajouter un nouvel intitulé à un produit
router.put("/:id_agent/addProductLabel/:id_product", function(req, res) {
    
    var id_agent = req.params.id_agent,
        objet_retour = require("../objet_retour").ObjetRetour(),
        id_product = req.params.id_product,
        new_label = req.body.new_label;


    agent_admin_dao.findOneById(id_agent, function (isAgentFound, messageResult, resultAgent) {
        
        if(isAgentFound){

            produit_admin_model.addProductLabel(id_product, new_label, 
            function(isUpdated, resultUpdate) {
                
                if(isUpdated){
                    objet_retour.getEtat = true;
                    objet_retour.getObjet = resultUpdate;

                    res.send(objet_retour);                    
                }else{
                    objet_retour.getEtat = false;
                    objet_retour.getMessage = resultUpdate;

                    res.send(objet_retour);
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

//La route permettant de mettre à jour les détails d'un produit
router.put("/:id_agent/updateProductDetails/:id_product", function(req, res) {
    
    var id_agent = req.params.id_agent,
        objet_retour = require("../objet_retour").ObjetRetour(),
        id_product = req.params.id_product,
        annotation = req.body.annotation,
        localisation = req.body.localisation,
        pu = req.body.pu,
        unite = req.body.unite,
        lien_produit = req.body.lien_produit;
    
    var new_details = {
        "annotation" : annotation,
        "localisation" : localisation,
        "pu" : pu,
        "unite" : unite,
        "lien_produit" : lien_produit
    }


    agent_admin_dao.findOneById(id_agent, function (isAgentFound, messageResult, resultAgent) {
        
        if(isAgentFound){

            produit_admin_model.updateProductDetails(id_product, new_details, 
            function(isUpdated, resultUpdate) {
                
                if(isUpdated){
                    objet_retour.getEtat = true;
                    objet_retour.getObjet = resultUpdate;

                    res.send(objet_retour);                    
                }else{
                    objet_retour.getEtat = false;
                    objet_retour.getMessage = resultUpdate;

                    res.send(objet_retour);
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

//La route permettant de mettre à jour la sous-catégorie d'un produit
router.put("/:id_agent/updateProductUnderCategory/:id_product", function(req, res) {
    
    var id_agent = req.params.id_agent,
        objet_retour = require("../objet_retour").ObjetRetour(),
        id_product = req.params.id_product,
        index_under_category = req.body.index_under_category,
        new_under_category = req.body.new_under_category;


    agent_admin_dao.findOneById(id_agent, function (isAgentFound, messageResult, resultAgent) {
        
        if(isAgentFound){

            produit_admin_model.updateProductUnderCategory(id_product, index_under_category, new_under_category, 
            function(isUpdated, resultUpdate) {
                
                if(isUpdated){
                    objet_retour.getEtat = true;
                    objet_retour.getObjet = resultUpdate;

                    res.send(objet_retour);                    
                }else{
                    objet_retour.getEtat = false;
                    objet_retour.getMessage = resultUpdate;

                    res.send(objet_retour);
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

//////////// A TESTER \\\\\\\\\\\\\\\\\\\\\\\\\\

//La route permettant de lister les produits d'une sous-catégorie
router.get("/:id_agent/findListByIdSousCategorie/:id_under_cat", function (req, res) {
    
    var id_agent = req.params.id_agent,
        objet_retour = require("../objet_retour").ObjetRetour(),
        id_under_cat = req.params.id_under_cat;

    agent_admin_dao.findOneById(id_agent, function (isAgentFound, messageResult, resultAgent) {
        
        if(isAgentFound){

            produit_admin_model.findListByIdSousCategorie(id_under_cat, function(isFound, resultFound){
                
                if(isFound){

                    objet_retour.getEtat = true;
                    objet_retour.getObjet = resultFound;

                    res.send(objet_retour);

                }else{

                    objet_retour.getEtat = false;
                    objet_retour.getMessage = resultFound;

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

//La route permettant d'afficher les détails d'un produit
router.get("/:id_agent/findOneById/:id_product", function (req, res) {
    
    var id_agent = req.params.id_agent,
        objet_retour = require("../objet_retour").ObjetRetour(),
        id_product = req.params.id_product;

    agent_admin_dao.findOneById(id_agent, function (isAgentFound, messageResult, resultAgent) {
        
        if(isAgentFound){

            produit_admin_model.findOneById(id_product, function(isFound, resultFound){
                
                if(isFound){

                    objet_retour.getEtat = true;
                    objet_retour.getObjet = resultFound;

                    res.send(objet_retour);

                }else{

                    objet_retour.getEtat = false;
                    objet_retour.getMessage = resultFound;

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