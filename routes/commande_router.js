//On fait appel à express pour la gestion des routes
var express = require('express'),
    //Ceci est le module contenant la quasi totalité des fonctions utilisé dans cet API
    func = require("../Models/includes/functions"),
    router = express.Router();

//Appel à la base de données
var db_js = require("../Models/db");

//Appel à la collection
var commande_model = require("../Models/commande_dao");


//La route qui permet d'effectuer des commande
router.post("/create", function (req, res) {

    //Dans le module contenant des fonctions on appel la fonctions newCommande
    func.newCommande(db_js, commande_model, req, res)
})

router.get("/gettop/:id_client/:top", function (req, res) {

    //Dans le module contenant des fonctions on appel la fonction getTopCommande
    func.getTopCommande(db_js, commande_model, req, res);

})

router.get("/getcount/:id_client", function (req, res) {
    func.getCountCommande(db_js, commande_model, req, res);
})

/**
 * Cette route permet la récupération des toutes les commandes qu'un utilisateur a passé
 */
router.get("/getall/:id_client", function (req, res) {
    func.getAllCommandeForThisClient(db_js, commande_model, req, res);
})

//La route qui permet de changer le flag d'une commande pour savoir ce qui est valide et qui ne l'est plus
router.post("/setoperation", function (req, res) {

    //Dans le module contenant des fonctions on appel la fonction setOperationForDelivery
    func.setOperationForDelivery(db_js, commande_model, req, res);
})

//La route qui permet de compter le nombre de commande effectuer pour ce dernier
router.get("/getCountCommand/:id_dealer", function (req, res) {
    func.getCountCommandeForProductsThisDealer(db_js, commande_model, req, res)
})

//La route qui permet de compter le nombre d'achat des produits effectuer pour ce dernier
router.get("/getCountAchat/:id_dealer", function (req, res) {
    func.getCountAchatForProductsThisDealer(db_js, commande_model, req, res)
})

//La route permettant de détarminer le montant gagné par le dealer sur la plateforme
router.get("/getAmount/:id_dealer", function (req, res) {
    func.getAmountThisDealer(db_js, commande_model, req, res)
})

//La route permettant d'afficher les détails d'une commande
router.get("/details/:id_commande", (req, res) => {
    func.getDetailsCommande(db_js, commande_model, req, res)
})

//La route permettant d'afficher le nombre de client ayant commandé ce produit
router.get("/getCountClientCommandeProduct/:id_produit", (req, res) => {
    func.getCountClientCommandeProduct(db_js, commande_model, req, res)
})

//La fonction permettant à un client de soumettre sont pannier
router.post("/submitCart", function(req, res) {
    
    var pannier = req.body.pannier,
        objet_retour = require("./objet_retour").ObjetRetour();

    commande_model.initialize(db_js);

    commande_model.submitCart(pannier,function(is_sublited, message_submit, result_submit) {
        objet_retour.getEtat = is_sublited;
        objet_retour.getMessage = message_submit;
        objet_retour.getObjet = result_submit;

        res.send(objet_retour);
    })
})

module.exports = router; //On export la route pour pouvoir l'utiliser