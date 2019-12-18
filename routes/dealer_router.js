//On fait appel à express pour la gestion des routes
var express = require('express'),
    //Ceci est le module contenant la quasi totalité des fonctions utilisé dans cet API
    func = require("../Models/includes/functions"),
    router = express.Router();

//Appel à la base de données
var db_js = require("../Models/db");

//Appel à la collection
var dealer_model = require("../Models/dealer_dao");

//Route permettant de faire passer un client à dealer
router.post("/becomeDealer", function (req, res) {
    func.becomeDealer();
})

/////////////////////////A TESTER
//La route permettant d'ajouter un lieu de vente
router.post("/:id_dealer/addLieuVenteByIdDealer", function(req, res) {
    
    var objet_retour = require("./objet_retour").ObjetRetour(),
        new_lieu_vente = require("../Models/entities/dealer_entity").LieuVente(),
        id_dealer = req.params.id_dealer;

    new_lieu_vente.etat = true;
    new_lieu_vente.id_adresse = req.body.id_adresse;

    dealer_model.initialize(db_js);
    dealer_model.addLieuVenteByIdDealer(id_dealer, new_lieu_vente, function(isLieuVente, messageLieuVente, resultLieuVente) {
        objet_retour.getEtat = isLieuVente;
        objet_retour.getMessage = messageLieuVente;
        objet_retour.getObjet = resultLieuVente;

        res.send(objet_retour);
    })
})

//La route permettant de lister tous les lieux de vente d'un dealer
router.get("/:id_dealer/getAllLieuVenteByIdDealer", function(req, res) {
    
    var objet_retour = require("./objet_retour").ObjetRetour(),
        id_dealer = req.params.id_dealer;

    dealer_model.initialize(db_js);
    dealer_model.getAllLieuVenteByIdDealer(id_dealer, function(isLieuVente, messageLieuVente, resultLieuVente) {
        objet_retour.getEtat = isLieuVente;
        objet_retour.getMessage = messageLieuVente;
        objet_retour.getObjet = resultLieuVente;

        res.send(objet_retour);
    })
})

//La route permettant de gérer l'état d'un lieu de vente
router.post("/:id_dealer/manageFlagOfOneLieuVenteByIdDealer", function(req, res) {
    
    var objet_retour = require("./objet_retour").ObjetRetour(),
        id_dealer = req.params.id_dealer,
        id_adresse = req.body.id_adresse,
        index_lieu_vente = req.body.index_lieu_vente;


    dealer_model.initialize(db_js);
    dealer_model.manageFlagOfOneLieuVenteByIdDealer(id_dealer, id_adresse, index_lieu_vente, function(isLieuVente, messageLieuVente, resultLieuVente) {
        objet_retour.getEtat = isLieuVente;
        objet_retour.getMessage = messageLieuVente;
        objet_retour.getObjet = resultLieuVente;

        res.send(objet_retour);
    })
})

module.exports = router;
