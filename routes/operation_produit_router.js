//On fait appel à express pour la gestion des routes
var express = require('express'),
  //Ceci est le module contenant la quasi totalité des fonctions utilisé dans cet API
  func = require("../Models/includes/functions"),
  router = express.Router();

//Appel à la base de données
var db_js = require("../Models/db");

//Appel à la collection
var operation_produit_model = require("../Models/operation_produit_dao");

//La route renvoyant la liste d'opérations effectuées par un dealer
router.post("/getAll", function (req, res) {
  func.getSubmittedProductsByIdDealer(db_js, operation_produit_model, req, res)
})

//La route renvoyant la liste de derniers produits ajoutées sur la plate-forme
router.get("/getNewProduct/:id_client/:limit", function (req, res) {

  //Dans le module contenant des fonctions on appel la fonctions findListCategorieByIdProduct
  func.getNewProduct(db_js, operation_produit_model, req, res);

})

/**
 * La route qui permet d'avoir la quantité de produits mis en vente par le dealer
 */
router.get("/countOperationByIdDealer/:id_dealer", function (req, res) {
  
  func.countOperationByIdDealer(db_js,operation_produit_model,req,res)
})

//La route permetant à un dealer d'augmenter la quantité du stock d'un produit
router.post("/submitProductByDealer", function (req, res) {
  
  var id_produit = req.body.id_produit,
      id_dealer = req.body.id_dealer,
      quantite = req.body.quantite,
      id_lieu_vente = req.body.id_lieu_vente,
      id_prod_deal_prix = req.body.id_prod_deal_prix;

  var objetRetour = require("./objet_retour").ObjetRetour(),
      new_prod_deal_prix = require("../Models/entities/produit_dealer_prix_entity").ProduitDealerPrix();

  var taux_dao = require("../Models/taux_dao"), 
      operation_produit_model = require("../Models/operation_produit_dao");

  operation_produit_model.initialize(db_js);
  taux_dao.initialize(db_js);

  if(!req.body.id_prod_deal_prix){//Si le prix du produit est nouveau

    //On procède à la convertion monétaire
    var in_balance = JSON.parse(req.body.prod_deal_prix).montant,
        in_currency = JSON.parse(req.body.prod_deal_prix).devise,
        out_currency = in_currency == "USD" ? "CDF" : "USD" ;

    taux_dao.cdfUsdExchange(in_balance, in_currency, out_currency, function(is_exchanged, message_exchange, result_exchage) {

      if(is_exchanged){//Si la conversion monétaire aboutie

        new_prod_deal_prix.date_creation = new Date();        
        new_prod_deal_prix.flag = true;

        //Parce qu'il est convenu que l'unité monétaire est le "USD", on recupère la somme convertie et l'abréviation. 
        new_prod_deal_prix.devise = result_exchage.in_balance.currency == "USD" ? result_exchage.in_balance.currency : result_exchage.out_balance.currency;
        new_prod_deal_prix.montant = result_exchage.in_balance.currency == "USD" ? result_exchage.in_balance.balance : result_exchage.out_balance.balance; 
        

        //Puis l'on soumet le produit dans la bd
        operation_produit_model.submitProductByDealer(id_produit, quantite, id_dealer, id_lieu_vente, 
          id_prod_deal_prix, new_prod_deal_prix, function (isSubmited, messageSubmitting, resultOperation) {
          
            if(isSubmited){
              objetRetour.getEtat = true;
              objetRetour.getObjet = resultOperation;

              res.send(objetRetour)
            }else{

              objetRetour.getEtat = false;
              objetRetour.getMessage = messageSubmitting;

              res.send(objetRetour)

            }
        })
      }else{//Si non la conversion monétaire n'a pas aboutie

        objetRetour.getEtat = false;
        objetRetour.getMessage = message_exchange;

        res.send(objetRetour)
      }
    })

  }else{//Si non il s'agit d'un ancien prix
  
    
    operation_produit_model.submitProductByDealer(id_produit, quantite, id_dealer, id_lieu_vente, 
      id_prod_deal_prix, new_prod_deal_prix, function (isSubmited, messageSubmitting, resultOperation) {
      
        if(isSubmited){
          objetRetour.getEtat = true;
          objetRetour.getObjet = resultOperation;

          res.send(objetRetour)
        }else{

          objetRetour.getEtat = false;
          objetRetour.getMessage = messageSubmitting;

          res.send(objetRetour)

        }
    })
  }     
})

//La route permettant de vérifier la disponibilité des produits du pannier. 
//Elle constitue le première étape de la commande. 
router.post("/checkAvailableProductInCart", function(req, res) {
  console.log(req.body);
  
  //var pannier = JSON.parse(req.body.panier),
  var pannier = JSON.parse(req.body.panier),
      objet_retour = require("./objet_retour").ObjetRetour();

  operation_produit_model.initialize(db_js);

  //On passe en boucle les items du pannier
  var sortie_pannier = 0,
      liste_temp = [],
      produit_dao = require("../Models/produit_dao");

  produit_dao.initialize(db_js);
  
  var sortie_pannier = 0, 
    liste_temp = [], 
    liste_retour = [], 
    is_retour = true;

  for (let index_pannier = 0; index_pannier < pannier.length; index_pannier++) {
    operation_produit_model
      .checkAvailableProductByIdDealerAndIdProductForOrder(pannier[index_pannier], function (is_available, message_available, _, available_quantity, produit_commande) {
        sortie_pannier++;
        produit_commande.is_available = is_available;
        produit_commande.available_message = message_available;
        produit_commande.available_quantity = available_quantity;
        if (is_available == false) {
          is_retour = false;
        }
        liste_temp.push(produit_commande);

        //on vérifie la condition de sortie
        if (sortie_pannier == pannier.length) {

          var sortie_temp = 0, 
            produit_dao = require("../Models/produit_dao");

          produit_dao.initialize(db_js);
          for (let index_temp = 0; index_temp < liste_temp.length; index_temp++) {

            produit_dao.findOneFromCart(liste_temp[index_temp], null, function (is_product, message_product, result_product) {
              sortie_temp++;
              if (is_product == false) {
                result_product.error = message_product;
              }
              liste_retour.push(result_product);

              if(sortie_temp == liste_temp.length){

                objet_retour.getEtat = is_retour;
                objet_retour.getObjet = liste_retour;

                res.send(objet_retour);
              }

            });

          }
        }
      });
  }

})

//La route permettant d'afficher les produits populaires
router.get("/getPopularProductDealer/:id_client", function(req, res) {

  var objet_retour = require("./objet_retour").ObjetRetour(),
      id_client = req.params.id_client;

  operation_produit_model.initialize(db_js);
  operation_produit_model.getPopularProductDealer(id_client, function(is_product, message, result) {
    
    objet_retour.getEtat = is_product;
    objet_retour.getMessage = message;
    objet_retour.getObjet = result;

    res.send(objet_retour);
  })

})

//La route permettant d'afficher les produits récents
router.get("/getLastestProductDealer/:id_client", function(req, res) {

  var objet_retour = require("./objet_retour").ObjetRetour(),
      id_client = req.params.id_client;

  operation_produit_model.initialize(db_js);
  operation_produit_model.getLastestProductDealer(id_client, function(is_product, message, result) {
    
    objet_retour.getEtat = is_product;
    objet_retour.getMessage = message;
    objet_retour.getObjet = result;

    res.send(objet_retour);
  })

})


module.exports = router; //On export la route pour pouvoir l'utiliser

