var express = require('express');
var router = express.Router();

var model = require("../Models/media_produit_dao");
var modelProduit = require("../Models/produit_dao");
var db = require("../Models/db");

router.post("/create", (req, res) => {
    var entity = require("../models/entities/media_produit_entity").MediaProduit(),
        objetRetour = require("./objet_retour").ObjetRetour();

    entity.id_auteur = req.body.id_auteur;
    entity.id_media = req.body.id_media;
    entity.id_produit = req.body.id_produit;

    model.initialize(db);
    model.create(entity, (isCreated, message, result) => {
        objetRetour.getEtat = isCreated;
        objetRetour.getMessage = message;
        objetRetour.getObjet = result;

        res.status(200);
        res.send(objetRetour);
    })
})

router.post('/setImages', (req, res) => {
    var objetRetour = require("./objet_retour").ObjetRetour();

    var props = {
        "id_produit": req.body.id_produit,
        "id_auteur": req.body.id_auteur,
        "images": JSON.parse(req.body.images)
    };

    if (props.images.length > 0) {
        model.initialize(db);
        model.create(props, (isCreated, message, result) => {
            objetRetour.getEtat = isCreated;
            objetRetour.getMessage = message;
            objetRetour.getObjet = result;

            res.status(200);
            res.send(objetRetour); 
        })
    } else {
        objetRetour.getEtat = false;
        objetRetour.getMessage = "Aucun lien d'image n'a été énvoyé";

        res.status(200);
        res.send(objetRetour);
    }
})

module.exports = router;