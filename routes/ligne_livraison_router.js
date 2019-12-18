//On fait appel à express pour la gestion des routes
var express = require('express'),
    //Ceci est le module contenant la quasi totalité des fonctions utilisé dans cet API
    func = require("../Models/includes/functions"),
    router = express.Router();

//Appel à la base de données
var db_js = require("../Models/db");

//Appel à la collection
var ligne_livraison_model = require("../Models/ligne_livraison_dao");


//La route permettant d'afficher au client les détails liés à la livraison : 
//adresse de livraison, les adresses de chaque produit, et la commune la plus éloignée d'où sera recupéré les produits.
//Il s'agit du premier niveau du processus de passation d'une commande. 
router.post("/getDetailsLivraisonCommande", function(req, res) {
    
    var pannier = require("../Models/includes/pannier").Pannier(),
        objet_retour = require("./objet_retour").ObjetRetour();

    pannier.id_client = req.body.id_client;
    pannier.id_beneficiaire = req.body.id_beneficiaire;
    pannier.id_adresse = req.body.id_adresse; //L'adresse de livraison
    pannier.produits = JSON.parse(req.body.produits);
    //pannier.produits = JSON.parse(req.body.produits);   //Liste de produits commandés (chaque item contient les propriétés : "id_produit","quantite", "id_operation_vente")

    ligne_livraison_model.initialize(db_js);
    ligne_livraison_model.getDetailsLivraisonCommande(pannier, function(is_details, message_details, result_details) {
        
        objet_retour.getEtat = is_details;
        objet_retour.getMessage = message_details;
        objet_retour.getObjet = result_details;

        res.send(objet_retour);
    })
})

module.exports = router;