//On fait appel à express pour la gestion des routes
var express = require('express'),
//Ceci est le module contenant la quasi totalité des fonctions utilisé dans cet API
func = require("../Models/includes/functions"),
router = express.Router();

//Appel à la base de données
var db_js = require("../Models/db");

//Appel à la collection
var extra_model = require("../Models/extra_dao");

//La route qui permet de créer un extra
router.post("/createAvis", function (req, res) {
    
    //Dans le module contenant des fonctions on appel la fonctions createExtra
    func.createExtra(db_js,extra_model,req, res);

});

//La route qui permet de créer un extra-annonce
router.post("/createForAnnonce", function (req, res) {
    
    var extra_annonce_entity = require("../Models/entities/extra_entity").ExtraAnnonce(),
        objetRetour  = require("./objet_retour").ObjetRetour();

    extra_annonce_entity.type = "annonce";
    extra_annonce_entity.flag = true;
    extra_annonce_entity.id_annonce = req.body.id_annonce;
    extra_annonce_entity.id_client = req.body.id_client;
    extra_annonce_entity.date = new Date();

    extra_model.initialize(db_js);
    extra_model.create(extra_annonce_entity,function (isCreated, resultCreation) {
        
        if(isCreated){
            objetRetour.getEtat = true;
            objetRetour.getObjet = resultCreation;

            res.send(objetRetour);
        }else{
            objetRetour.getEtat = false;
            objetRetour.getMessage = resultCreation;

            res.send(objetRetour);
        }
    })
})

//la route qui permet de chercher les extras d'un produit et cela par type
router.post("/findListByIdProduitDealAndType", function (req, res) {
    
    //Dans le module contenant des fonctions on appel la fonctions findListExtraByIdProduitAndType, quel nom kilométrique !!!
    func.findListExtraByIdProduitAndType(db_js,extra_model, req, res);
});

//La route permettant de faire la synchronisation des extras du serveur vers la bd locale
router.post("/synchroniseFromApiToDb", function(req, res) {
    
    func.synchroniseExtrasFromApiToDb(db_js, extra_model, req, res);
})

//La route permettant de compter le nombre de personnes étant les auteurs des extras par type
router.get("/count/:id_produit_dealer/:type/:allOrNot", function(req, res) {
    
    func.getCountExtraByType(db_js, extra_model, req, res);
})

//La route qui permet de créer un extra
router.post("/createView", function (req, res) {
    //Dans le module contenant des fonctions on appel la fonctions createExtra
    func.createExtraVue(db_js,extra_model,req, res);
});

//Route permettant de compter le nombre d'extra par type pour tous les produis d'un dealer
router.get("/countAllExtraByTypeForDealer/:id_dealer/:type_extra", function (req, res) {
    func.countAllExtraByTypeForDealer(db_js, extra_model, req, res);
})

//La route qui permet d'évaluer 
router.post("/createEvaluation", (req, res) => {
    func.createEvaluation(db_js, extra_model, req, res)
})

//La route permettant de récupérer la note du client pour un produit donné
router.get("/getNote/:id_client/:id_produit_dealer", (req, res) => {
    func.getNoteOfEvaluate(db_js, extra_model, req, res)
})

//La route permettant de récupérer la moyenne des évaluations d'un produit donné
router.get("/getAverageEvaluation/:id_produit_dealer", (req, res) => {
    func.getAverageEvaluation(db_js, extra_model, req, res)
})

module.exports = router; //On export la route pour pouvoir l'utiliser