//On fait appel à express pour la gestion des routes
var express = require('express'),
    //Ceci est le module contenant la quasi totalité des fonctions utilisé dans cet API
    func = require("../Models/includes/functions"),
    router = express.Router();

//Appel à la base de données
var db_js = require("../Models/db");

//Appel à la collection
var adresse_model = require("../Models/adresse_dao");

/**
 * Cette route permet de définir une adresse pour l'utilisateur
 */
router.post("/create", function (req, res) {
    func.createAdresse(db_js, adresse_model, req, res);
})

/**
 * Récupère l'adresse défini comme adresse par défaut
 */
router.get("/getCurrentCustomerAddress/:id_client", function (req, res) {
    func.getCurrentCustomerAddress(db_js, adresse_model, req, res)
})

/**
 * Route permettant la récupérationd de tous les adresse du client
 */
router.get("/getAll/:id_client", function (req, res) {
    func.getAllAdresse(db_js, adresse_model, req, res)
})

/**
 * Cette route permet de désactiver l'adresse
 */
router.post("/disable", function (req, res) {
    func.disableAdresse(db_js, adresse_model, req, res)
})

/**
 * Cette route permet de définir l'adresse comme étant l'adresse par défaut
 */
router.post("/setDefault", function (req, res) {
    func.setDefaultAdresse(db_js, adresse_model, req, res)
})

router.post("/setGeoLocation", function(req, res) {
    func.setAddressGeoLocation(db_js, adresse_model, req, res)
})

module.exports = router; //On export la route pour pouvoir l'utiliser