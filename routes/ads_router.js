//On fait appel à express pour la gestion des routes
var express = require('express'),
    //Ceci est le module contenant la quasi totalité des fonctions utilisé dans cet API
    func = require("../Models/includes/functions"),
    router = express.Router();

//Appel à la base de données
var db_js = require("../Models/db");

//Appel à la collection
var ads_model = require("../Models/ads_dao");

//Cette route récupère des medias pour les images à la une
router.get("/getSlider/:type", function (req, res) {

    //Dans le module contenant des fonctions on appel la fonction getMediaForSlider
    func.getMediaForSlider(db_js, ads_model, req, res);
})


module.exports = router; //On export la route pour pouvoir l'utiliser