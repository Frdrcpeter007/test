//On fait appel à express pour la gestion des routes
var express = require('express'),
    //Ceci est le module contenant la quasi totalité des fonctions utilisé dans cet API
    func = require("../Models/includes/functions"),
    router = express.Router();

//Appel à la base de données
var db_js = require("../Models/db");

//Appel à la collection
var partenaire_model = require("../Models/partenaire_dao");

router.post("/create", function (req, res) {
    //Appel à la fonction de création d'un partenaire
    func.createPartenaire(db_js, partenaire_model, req, res);
})

router.get("/getAll", function (req, res) {
    //Appel à la fonction de récupération de tous les partenaires
    func.getAllPartenaire(db_js, partenaire_model, req, res);
})

router.post("/updateInfo", function (req, res) {
    //Appel à la fonction de mise à jour des informations du partenaire
    func.updateInfoPartenaire(db_js, partenaire_model, req, res);
})

router.get("/setFlag/:id_partenaire", function (req, res) {
    //Appel à la fonction de mise à jour du flag
    func.setFlagPartenaire(db_js, partenaire_model, req, res);
})

module.exports = router;