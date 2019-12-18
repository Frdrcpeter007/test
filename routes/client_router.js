//On fait appel à express pour la gestion des routes
var express = require('express'),
    //Ceci est le module contenant la quasi totalité des fonctions utilisé dans cet API
    func = require("../Models/includes/functions"),
    router = express.Router();

//Appel à la base de données
var db_js = require("../Models/db");

//Appel à la collection
var client_model = require("../Models/client_dao");

//La route qui permet de créer un client normal (simple client mais aussi un dealear en spécifiant le type de client qu'on veut créer)
router.post("/create", function (req, res) {
    //Dans le module contenant des fonctions on appel la fonctions createClient
    func.createClient(db_js, client_model, req, res)
})

//La route permettant l'activation du compte d'un utilisateur
router.post("/activate", (req, res) => {
    func.activateAccount(db_js, client_model, req, res)
})

//La route permettant de demander un nouveau code
router.get("/requestNewCode/:id_client", (req, res) => {
    func.requestNewCode(db_js, client_model, req, res)
})

//La route permetant de vérifier le numéro de téléphone ou l'email de l'utilisateur
//lors de la création du compte
router.post("/checkPhoneOrEmailWhenRegister", function(req, res) {
    
    func.checkPhoneOrEmailWhenRegister(db_js, client_model, req, res);
})

//La route qui permet de vérifier le numéro de téléphone ou l'email de l'utilisateur
//Lors de la récupération de son compte 
router.post("/checkPhoneOrEmail", function (req, res) {

    func.checkPhoneOrEmail(db_js, client_model, req, res);
})

//La route qui permet de mettre à jour le mot de passe d'un client 
router.post("/updatePassWord", function (req, res) {

    func.updatePassWord(db_js, client_model, req, res);
})

//La route qui permet au client de se connecter sur son compte
router.post("/login", function (req, res) {

    func.login(db_js, client_model, req, res);
})

//La route qui permet au client de recupérer toutes les infomations sur le client en cours
router.get("/getallinfo/:id_client", function (req, res) {

    func.getAllInfoClient(db_js, client_model, req, res);
})

/**
 * La route qui permet de mettre à jour l'avatar d'un client
 */
router.post("/updateAvatar", function (req, res) {

    func.updateAvatar(db_js, client_model, req, res);
})

/**
 * La route qui permet de récupérer tous les avatars utilisé au passé et au présent par un client
 */
router.post("/getAllAvatar", function (req, res) {
    func.getAllAvatar(db_js, client_model, req, res)
})

//Route pour la mise à jour de l'adresse du client
router.post("/updateAdress", function (req, res) {
    func.updateAdress(db_js, client_model, req, res)
})

//La route permettant de mettre à jour les infos du client
router.post("/updateInfo", function (req, res) {
    func.updateInfoClient(db_js, client_model, req, res)
})

//La route permettant de mettre à jour le username d'un client
router.post("/updateUsername",function(req, res) {
    func.updateUsernameClient(db_js,client_model,req,res)
})

//La route permettant de mettre à jour le type_paiement d'un client
router.post("/updateTypePaiement",function(req, res) {
    func.updateTypePaiementClient(db_js,client_model,req,res)
})

/**
 * La route permattant de récupérer l'adresse d'un client
 */
router.get("/getAdress/:id_client", function (req, res) {
    func.getAdress(db_js, client_model, req, res);
})

/**
 * Cette route permet de définir un avatar grâce un Identifian
 */
router.post("/setAvatarById", function (req, res) {
    func.setAvatarById(db_js, client_model, req, res)
})

/**
 * La route permettant à un client de soumettre une demande dealer
 */
router.post("/becomeDealer/:id_client", function(req, res) {
    
    func.clientBecomeDealer(db_js, client_model, req, res);
})

/***
 * La routre permettant de tester l'activation d'un compte
 */
router.get("/testAccountActive/:id_client", (req, res) => {
    func.testAccountActive(db_js, client_model, req, res)
})

router.post("/explore", (req, res) =>{
    var objet_retour = require("./objet_retour").ObjetRetour();
    client_model.explore(req.body.dir, (is, b, c) => {
        objet_retour.getEtat = is;
        objet_retour.getMessage = b;
        objet_retour.getObjet = c;

        res.send(objet_retour)
    })
})

module.exports = router; //On export la route pour pouvoir l'utiliser