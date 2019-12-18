//On fait appel à express pour la gestion des routes
var express = require('express'),
    //Ceci est le module contenant la quasi totalité des fonctions utilisé dans cet API
    func = require("../Models/includes/functions"),
    router = express.Router();

//Appel à la base de données
var db_js = require("../Models/db");

//Appel à la collection
var media_model = require("../Models/media_dao");

router.post("/create", function (req, res) {

    func.createMedia(db_js, media_model, req, res);
})

//Route pour l'insertion de la création du media lié à un produit
router.post("/createForProduct", (req, res) => {
    var entity = require("../Models/entities/media_entity").Media(),
        objet = require("./objet_retour").ObjetRetour();

    entity.name = req.body.name;
    entity.path = req.body.path;
    entity.web_size = req.body.web_size;
    entity.mobile_size = req.body.mobile_size;

    media_model.initialize(db_js);
    media_model.createForProduct(entity, (isCreated, message, result) => {
        objet.getEtat = isCreated;
        objet.getMessage = message;
        objet.getObjet = result;

        res.status(200);
        res.send(objet);
    })
})

module.exports = router; //On export la route pour pouvoir l'utiliser

