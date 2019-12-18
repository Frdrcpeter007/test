//On fait appel à express pour la gestion des routes
var express = require('express'),
//Ceci est le module contenant la quasi totalité des fonctions utilisé dans cet API
func = require("../Models/includes/functions"),
router = express.Router();

//Appel à la base de données
var db_js = require("../Models/db");

//Appel à la collection
var recuperation_model = require("../Models/recuperation_dao");

//La route qui permet de vérifier si un code de confirmation correspond à une valeur d'un username
router.post("/checkCode", function (req, res) { 
    func.checkCode(db_js,recuperation_model, req, res);
})


module.exports = router; //On export la route pour pouvoir l'utiliser