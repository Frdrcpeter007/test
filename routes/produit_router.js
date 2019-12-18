//On fait appel à express pour la gestion des routes
var express = require('express'),
  //Ceci est le module contenant la quasi totalité des fonctions utilisé dans cet API
  func = require("../Models/includes/functions"),
  router = express.Router();

//Appel à la base de données
var db_js = require("../Models/db");

//Appel à la collection
var produit_model = require("../Models/produit_dao"),
  operation_model = require("../Models/operation_produit_dao");

//La route qui permet de créer un produit
router.post("/create", function (req, res) {

  //Dans le module contenant des fonctions on appel la fonctions addProduct
  func.addProduct(db_js, produit_model, req, res)

})

router.get("/details/:id_produit/:id_client", function (req, res) {
  func.detailProduct(db_js, produit_model, req, res)
})

//La route qui permet d'effectuer la smartResearch
router.post("/smartFindByIntitule", function (req, res) {

  //Dans le module contenant des fonctions on appel la fonctions smartFindByIntitule
  func.smartFindByIntitule(db_js, produit_model, req, res);

})

// La fonction qui permet de trouver la liste de produits appartenant à la même sous-catégorie
// Elle est utilisée lorsque l'utilisateur visualise les détails d'un produit donnée, le système
router.get("/findListByIdSousCategorie/:id_produit/:id_client", function (req, res) {

  //Dans le module contenant des fonctions on appel la fonctions findListByIdSousCategorie
  func.findProductListByIdSousCategorie(db_js, produit_model, req, res);

})

//La route qui permet de renvoyer la liste de produits d'une même sous-catégorie.
//Elle est utilisée lorsque le client visite les détails de la sous-catégorie
router.get("/findListByIdSousCategorieForSousCategorie/:id_sous_categorie/:id_client", function (req, res) {

  func.findProductListByIdSousCategorieForSousCategorie(db_js, produit_model, req, res);
  
})

// La route qui permet de trouver la liste de catégories contenant les sous-catégorie du produit
// Elle est utilisée lorsque l'utilisateur visualise les détails d'un produit donnée
router.get("/findListCategorieByIdProduct/:id_produit", function (req, res) {

  //Dans le module contenant des fonctions on appel la fonctions findListCategorieByIdProduct
  func.findListCategorieByIdProduct(db_js, produit_model, req, res);

})


router.get("/getNewProduct/:id_client", function (req, res) {

  //Dans le module contenant des fonctions on appel la fonctions findListCategorieByIdProduct
  func.getNewProduct(db_js, produit_model, req, res);

})

router.post("/getAllProductForDealer/:id_dealer", function (req, res) {

  //Dans le module contenant des fonctions on appel la fonctions getAllProductForDealer
  func.getSubmittedProductsByIdDealer(db_js, operation_model, req, res)
})

/**
 * La route permettant de compter le nombre des produits d'un dealer
 */
router.get("/countAllProduct/:id_dealer", function (req, res) {

  //Dans le module contenant des fonctions on appel la fonctions getAllProductForDealer
  func.countForDealer(db_js, operation_model, req, res)
})

router.post("/findProductInUnderCategory", (req, res) => {
    var objet_retour = require("./objet_retour").ObjetRetour();

    var product = {
        "sous_categorie": req.body.id_under,
        "intitule": req.body.intitule
    }

    produit_model.initialize(db_js);
    produit_model.smartFindInUnderCategory(product, (isFound, message, result) => {
        objet_retour.getEtat = isFound;
        objet_retour.getMessage = message;
        objet_retour.getObjet = result;

        res.status(200);
        res.send(objet_retour);
    })
})

module.exports = router; //On export la route pour pouvoir l'utiliser