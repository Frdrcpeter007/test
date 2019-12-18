//On fait appel à express pour la gestion des routes
var express = require('express'),
    //Ceci est le module contenant la quasi totalité des fonctions utilisé dans cet API
    func = require("../Models/includes/functions"),
    router = express.Router();

//Appel à la base de données
var db_js = require("../Models/db");

//Appel à la collection
var annonce_model = require("../Models/annonce_dao");


//La route qui permet de créer une annonce
router.post("/create", function (req, res) {
    
    func.createAnnonce(db_js,annonce_model,req,res)
})


//La route qui renvoie une annonce spécifique suivant son identifiant
router.get("/findOneById/:id_annonce", function (req, res) {
    
    func.findAnnonceById(db_js,annonce_model,req,res)
})

//La route qui renvoie toutes les annonces
router.get("/getall", function (req, res) {
    
    func.getAllAnnonce(db_js,annonce_model,req, res)

})

//La route qui renvoie les annonces publiées, elles seront lues par tout visiteur ordinaire
router.get("/getAllWhereFlagTrue", function (req, res) {
    func.getAllAnnonceWhereFlagTrue(db_js,annonce_model,req, res);
})

//La route qui renvoie les annonces publiées, elles seront lues par un client
router.get("/getAllWhereFlagTrueByIdClient/:id_client", function (req, res) {
    
    func.getAllAnnonceWhereFlagTrueByIdClient(db_js,annonce_model,req,res);
    
})

//La route permettant à un dealer de lancer aussi une annonce vers l'administration e-Bantu
router.post("/createByDealer", (req, res) => {
    func.createAnnonceByDealer(db_js, annonce_model, req, res)
})

//La route permettant la récupération des annonces d'un dealer
router.get("/getAllForDealerSending/:id_dealer", (req, res) => {
    func.getAllWhereDealerSending(db_js, annonce_model, req, res)
})

router.get("/getAllForEbantuSending", (req, res) => {
    func.getAllForEbantuSending(db_js, annonce_model, req, res)
})

module.exports = router;