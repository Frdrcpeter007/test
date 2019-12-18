//On fait appel à express pour la gestion des routes
var express = require('express'),
    //Ceci est le module contenant la quasi totalité des fonctions utilisé dans cet API
    func = require("../Models/includes/functions"),
    router = express.Router();

//Appel à la base de données
var db_js = require("../Models/db");

//Appel à la collection
var beneficiaire_commande_model = require("../Models/beneficiaire_commande_dao");

//La route permettant de créer un bénéficiaire
router.post("/create", function(req, res) {
    
    var beneficiaire_entity = require("../Models/entities/beneficiaire_commande_entity").BeneficiaireCommande(),
        objet_retour = require('./objet_retour').ObjetRetour();

    beneficiaire_entity.nom = req.body.nom;
    beneficiaire_entity.prenom = req.body.prenom;
    beneficiaire_entity.genre = req.body.genre;
    beneficiaire_entity.telephone = req.body.telephone;
    beneficiaire_entity.email = req.body.email;
    beneficiaire_entity.id_adresse = req.body.id_adresse;
    beneficiaire_entity.creer_par = req.body.creer_par;
    beneficiaire_entity.date_creation = new Date();

    beneficiaire_commande_model.initialize(db_js);
    beneficiaire_commande_model.create(beneficiaire_entity, function(is_benef, message_benef, result_benef) {
        
        objet_retour.getEtat = is_benef;
        objet_retour.getMessage = message_benef;
        objet_retour.getObjet = result_benef;

        res.send(objet_retour);
    })
})

//La route permettant de rechercher un bénéficiaire par son identifiant
router.get("/findonebyid/:id_beneficiaire", function(req, res) {
    
    var id_beneficiaire = req.params.id_beneficiaire,
        objet_retour  = require("./objet_retour").ObjetRetour();

    beneficiaire_commande_model.initialize(db_js);
    beneficiaire_commande_model.findOneById(id_beneficiaire, function(is_benef, message_benef, result_benef) {
        
        objet_retour.getEtat = is_benef;
        objet_retour.getMessage = message_benef;
        objet_retour.getObjet = result_benef;

        res.send(objet_retour)
    })
})

//La route permettant de lister les bénéficiaires créés par un client
router.get("/getAllByCreator/:creer_par", function(req, res) {
    
    var creer_par = req.params.creer_par,
        objet_retour  = require("./objet_retour").ObjetRetour();

    beneficiaire_commande_model.initialize(db_js);
    beneficiaire_commande_model.getAllByCreator(creer_par, function(is_benef, message_benef, result_benef) {
        
        objet_retour.getEtat = is_benef;
        objet_retour.getMessage = message_benef;
        objet_retour.getObjet = result_benef;

        res.send(objet_retour)
    })
})

module.exports = router;