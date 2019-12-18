//On fait appel à express pour la gestion des routes
var express = require('express'),
    //Ceci est le module contenant la quasi totalité des fonctions utilisé dans cet API
    func = require("../Models/includes/functions"),
    router = express.Router();

//Appel à la base de données
var db_js = require("../Models/db");

//Appel à la collection
var categorie_model = require("../Models/categorie_dao");

//La route qui permet de créer une catégorie
/*router.post("/create", function (req, res) {

    //Dans le module contenant des fonctions on appel la fonctions createCategorie
    func.createCategorie(db_js, categorie_model, req, res);

})*/

//La route qui permet de récupérer toutes les catégories
router.get("/getAll/:nbre", function (req, res) {

    //Dans le module contenant des fonctions on appel la fonctions getAllCategories
    func.getAllCategories(db_js, categorie_model, req, res)

})

//La route qui permet de récupérer toutes les catégories pour le mobile
router.get("/getAllForMobile", function (req, res) {
    
    //Dans le module contenant des fonctions on appel la fonctions getAllCategories
    func.getAllCategoriesForMobile(db_js, categorie_model, req, res)

})

//La route qui permet de récupérer les intitulés de catégories
router.get("/getAllIntitules", function (req, res) {
    
    var objetRetour = require("./objet_retour").ObjetRetour();
    categorie_model.initialize(db_js);

    categorie_model.getAllIntitules(function (isIntitulesFind, resultIntitules) {
        
        if(isIntitulesFind){
            objetRetour.getEtat = true;
            objetRetour.getObjet = resultIntitules;
            res.send(objetRetour);
        }else{

            objetRetour.getEtat = false;
            objetRetour.getMessage = resultIntitules;

            res.send(objetRetour);
        }
    })
    
})

//La route qui permet de rechercher une catégorie spécifique par son identifiant
router.get("/findOneById/:id_categorie", function (req, res) {
    
    var id_categorie = req.params.id_categorie,
        objetRetour = require("./objet_retour").ObjetRetour();

    categorie_model.initialize(db_js);
    categorie_model.getOneById(id_categorie, function (isFound, resultCategorie) {
        
        if(isFound){

            objetRetour.getEtat = true;
            objetRetour.getObjet = resultCategorie;

            res.send(objetRetour);

        }else{

            objetRetour.getEtat = false;
            objetRetour.getMessage = resultCategorie;

            res.send(objetRetour);
        }
    })
})

/**
 * Route qui permet de récupérer les sous-catégories d'une catégorie
 */
router.get("/getUnderCategory/:id_categorie", function (req, res) {
    func.getUnderCategory(db_js, categorie_model, req, res)
})

module.exports = router; //On export la route pour pouvoir l'utiliser