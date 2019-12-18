//On fait appel à express pour la gestion des routes
var express = require('express'),
    //Ceci est le module contenant la quasi totalité des fonctions utilisé dans cet API
    func = require("../Models/includes/functions"),
    router = express.Router();

//Appel à la base de données
var db_js = require("../Models/db");

//Appel à la collection
var contact_model = require("../Models/contact_dao");

router.post("/send", (req, res) => {
    func.contactUs(db_js, contact_model, req, res)
})

module.exports = router;
