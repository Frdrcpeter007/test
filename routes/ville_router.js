//On fait appel à express pour la gestion des routes
var express = require('express'),
    //Ceci est le module contenant la quasi totalité des fonctions utilisé dans cet API
    func = require("../Models/includes/functions"),
    router = express.Router();

//Appel à la base de données
var db_js = require("../Models/db");

//Appel à la collection
var ville_model = require("../Models/ville_dao");


//La route qui permet de recupérer toutes les villes couvertes par e-bantu
router.get("/getAll", function (req, res) {
    //Dans le module contenant des fonctions on appel la fonction getAllTown
    func.getAllTown(db_js, ville_model, req, res)
})

module.exports = router; //On export la route pour pouvoir l'utiliser
