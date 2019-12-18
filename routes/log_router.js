//On fait appel à express pour la gestion des routes
var express = require('express'),
    //Ceci est le module contenant la quasi totalité des fonctions utilisé dans cet API
    func = require("../Models/includes/functions"),
    router = express.Router();

//Appel à la base de données
var db_js = require("../Models/db");

//Appel à la collection
var log_model = require("../Models/log_dao");

//Route pour la traçabilité de déconnexion
router.post("/out", function (req, res) {
    func.logOut(db_js, log_model, req, res);
})

module.exports = router;
