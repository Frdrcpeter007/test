//On fait appel à express pour la gestion des routes
var express = require('express'),
    //Ceci est le module contenant la quasi totalité des fonctions utilisé dans cet API
    func = require("../Models/includes/functions"),
    router = express.Router();

//Appel à la base de données
var db_js = require("../Models/db");

//Appel à la collection
var produit_dealer_dao = require("../Models/produit_dealer_dao");

//La router permettant d'afficher les détails d'un produit
router.get("/findOneByIdWithAllDetails/:id_client/:id_produit_dealer", function (req, res) {
    
    var id_produit_dealer = req.params.id_produit_dealer,
        id_client = req.params.id_client,
        objet_retour = require("./objet_retour").ObjetRetour();

    produit_dealer_dao.initialize(db_js);
    produit_dealer_dao.findOneByIdWithAllDetails(id_produit_dealer, id_client, 
    function(is_details, message_details, result_details) {
        
        objet_retour.getEtat = is_details;
        objet_retour.getMessage = message_details;
        objet_retour.getObjet = result_details;

        res.send(objet_retour);
    })
})

/**
 * La route qui permet de renvoyer les détails des produits venant du panier
 * En gardant à l'esprit que cette route n'est liée a aucun DAO, mais utilise les module du DAO produit
 */
router.post("/getDetailsFromCart", function (req, res) {

    var produitsId = req.body.listProduit.split("/"),
        id_client = req.body.id_client,
        listProduitRetour = [],
        sortieProduit = 1;
    objetRetour = require("./objet_retour").ObjetRetour();


    produit_dealer_dao.initialize(db_js);

    if (produitsId.length > 2) {

        for (var indexProduit = 1; indexProduit < produitsId.length - 1; indexProduit++) {

            produit_dealer_dao.findOneByIdWithAllDetails(produitsId[indexProduit], id_client, function (isMatch, resultMessage, resultMatch) {

                sortieProduit++;    

                if (isMatch) {
                    listProduitRetour.push(resultMatch)
                }

                if (sortieProduit == produitsId.length - 1) {

                    if (listProduitRetour.length > 0) {
                        objetRetour.getObjet = listProduitRetour;
                        objetRetour.getEtat = true;


                        res.send(objetRetour)
                    } else {
                        objetRetour.getMessage = "Aucun produit n'a été trouvé";
                        objetRetour.getEtat = false;

                        res.send(objetRetour)

                    }
                }

            })
        }
    } else {
        objetRetour.getMessage = "Le panier est vide";
        objetRetour.getEtat = false;

        res.send(objetRetour)
    }
})

module.exports = router;