//On fait appel à express pour la gestion des routes
var express = require('express'),
    //Ceci est le module contenant la quasi totalité des fonctions utilisé dans cet API
    func = require("../Models/includes/functions"),
    router = express.Router();

//Appel à la base de données
var db_js = require("../Models/db");

//Appel à la collection
var unite_model = require("../Models/unite_mesure_dao");

router.get('/getAll', (req, res) => {
    var objetRetour = require("./objet_retour").ObjetRetour();

    unite_model.initialize(db_js);
    unite_model.getAll((isGet, message, result) => {
        objetRetour.getEtat = isGet;
        objetRetour.getMessage = message;
        objetRetour.getObjet = result;

        res.status(200);
        res.send(objetRetour)
    })

})

module.exports = router;