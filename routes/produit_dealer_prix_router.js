//On fait appel à express pour la gestion des routes
var express = require('express'),
    //Ceci est le module contenant la quasi totalité des fonctions utilisé dans cet API
    func = require("../Models/includes/functions"),
    router = express.Router();

//Appel à la base de données
var db_js = require("../Models/db");

//Appel à la collection
var produit_dealer_prix_model = require("../Models/produit_dealer_prix_dao");

//La route permettant de mettre à jour le prix d'un produit par un dealer
router.post("/update", function(req, res) {
    
    var id_produit_dealer = req.body.id_produit_dealer,
        montant = req.body.montant,
        devise = req.body.devise,
        id_dealer= req.body.id_dealer,
        new_prod_deal_price = require('../Models/entities/produit_dealer_prix_entity').ProduitDealerPrix(),
        objet_retour = require("./objet_retour").ObjetRetour(),
        taux_dao = require("../Models/taux_dao");
    
    taux_dao.initialize(db_js);

    //On procède à la convertion monétaire
    var in_balance = montant,
    in_currency = devise,
    out_currency = in_currency == "USD" ? "CDF" : "USD";
    taux_dao.cdfUsdExchange(in_balance, in_currency, out_currency, 
    function(is_exchanged, message_exchange, result_exchage) {

        if(is_exchanged){

            new_prod_deal_price.date_creation = new Date();
            new_prod_deal_price.flag = true;
            new_prod_deal_price.id_produit_dealer = id_produit_dealer;

            //Parce qu'il est convenu que l'unité monétaire est le "USD", on recupère la somme convertie et l'abréviation. 
            new_prod_deal_price.devise = result_exchage.in_balance.currency == "USD" ? result_exchage.in_balance.currency : result_exchage.out_balance.currency;
            new_prod_deal_price.montant = result_exchage.in_balance.currency == "USD" ? result_exchage.in_balance.balance : result_exchage.out_balance.balance; 
            
            produit_dealer_prix_model.initialize(db_js);
            produit_dealer_prix_model.checkOrCreate(null, new_prod_deal_price, id_dealer, 
            function(is_prod_deal_price, message_prod_deal_price, result_prod_deal_price) {

                objet_retour.getEtat = is_prod_deal_price;
                objet_retour.getMessage = message_prod_deal_price;
                objet_retour.getObjet = result_prod_deal_price;

                res.send(objet_retour);
            })

        }else{

            objet_retour.getEtat = false;
            objet_retour.getMessage = message_exchange;

            res.send(objet_retour);
        }

    });
})

module.exports = router;