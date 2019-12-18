//On fait appel à express pour la gestion des routes
var express = require('express'),
    //Ceci est le module contenant la quasi totalité des fonctions utilisé dans cet API
    func = require("../Models/includes/functions"),
    router = express.Router();

//Appel à la base de données
var db_js = require("../Models/db");

//Appel à la collection
var favoris_model = require("../Models/favoris_dao");

//La route qui permet d'ajouter aux favoris un produit
router.post("/create", function (req, res) {

    //Dans le module contenant des fonctions on appel la fonction addToFavorite
    func.addToFavorite(db_js, favoris_model, req, res)
})

//La route qui permet de retirer un élément dans les favoris
router.post("/remove", function (req, res) {

    //Dans le module contenant des fonctions on appel la fonction removeToFavorite
    func.removeToFavorite(db_js, favoris_model, req, res);
})

/**
 * Cette route permet la récupération des tous les favoris d'un client
 */
router.get("/getall/:id_client", function (req, res) {
    func.getAllFavorisForThisClient(db_js, favoris_model, req, res);
})

router.get("/count/:id_client", function (req, res) {
    func.getCountFavoris(db_js, favoris_model, req, res);
})

//La route permettant de synchroniser les données du serveur vers l'appli mobile
router.post("/synchronizeFromApiToDb", function(req, res) {
	func.synchronizeFavoriteFromApiToDb(db_js, favoris_model, req, res);
})

module.exports = router; //On export la route pour pouvoir l'utiliser