//On fait appel à express pour la gestion des routes
var express = require('express'),
    //Ceci est le module contenant la quasi totalité des fonctions utilisé dans cet API
    func = require("../Models/includes/functions"),
    router = express.Router();

//Appel à la base de données
var db_js = require("../Models/db");

//Appel à la collection
var notification_model = require("../Models/notification_dao");

//La route permettant de créer une notification
router.post("/create", function(req, res) {
	
	var newNotification = require("../Models/entities/notification_entity").Notification(),
		objet_retour = require("./objet_retour").ObjetRetour();

	newNotification.id_objet = req.body.id_objet;
	newNotification.id_auteur = req.body.id_auteur;
	newNotification.id_recepteur = req.body.id_recepteur;
	newNotification.type = req.body.type;
	newNotification.flag = true;
	newNotification.date = new Date();

	notification_model.initialize(db_js);
	notification_model.create(newNotification, function(isNotifCreated, resultCreated) {
		
		if(isNotifCreated){
			objet_retour.getEtat = true;
			objet_retour.getObjet = resultCreated;

			res.send(objet_retour);
		}else{

			objet_retour.getEtat = false;
			objet_retour.getMessage = resultCreated;

			res.send(objet_retour);	
		}
	});
})

//La route permettant de renvoyer la liste de notifications d'un client
router.get("/findAllByIdClient/:id_client/:limit", function(req, res) {
	
	var id_client = req.params.id_client,
		limit = !isNaN(limit) ? parseInt(req.params.limit, 10) : req.params.limit,
		objet_retour = require("./objet_retour").ObjetRetour();

	notification_model.initialize(db_js);
	notification_model.findAllByIdClient(id_client, limit, function(isNotifFound, message, resultNotif) {
		
		if(isNotifFound){
			objet_retour.getEtat = true;
			objet_retour.getMessage = message;			
			objet_retour.getObjet = resultNotif;

			res.send(objet_retour)
		}else{
			objet_retour.getEtat = false;
			objet_retour.getMessage = message;
			objet_retour.getObjet = resultNotif;
			
			res.send(objet_retour)
		}
	})
})

//La route permettant de mettre à jour une notification
router.put("/setFlagFalse/:id_notification", function(req, res) {
	
	var id_notification = req.params.id_notification,
		objet_retour = require("./objet_retour").ObjetRetour();

	notification_model.initialize(db_js);
	notification_model.setFlagFalse(id_notification, function (isNotifUpToDate, resultNotifUpToDate) {
		
		if(isNotifUpToDate){
			objet_retour.getEtat = true;
			objet_retour.getObjet = resultNotifUpToDate;

			res.send(objet_retour);
		}else{

			objet_retour.getEtat = false;
			objet_retour.getMessage = resultNotifUpToDate;

			res.send(objet_retour);
		}
	})
})

//La route permettant de compter les notifications non consulter
router.get("/countNotification/:id_client", function(req, res) {
	
	var objet_retour = require("./objet_retour").ObjetRetour();

	notification_model.initialize(db_js);
	notification_model.getNbre(req.params.id_client, (isGet, message, resultCount) => {
		
		if(isGet){
			objet_retour.getEtat = true;
			objet_retour.getObjet = resultCount;
			objet_retour.getMessage = message;
			
			res.send(objet_retour);
		}else{

			objet_retour.getEtat = false;
			objet_retour.getMessage = message;
			objet_retour.getObjet = resultCount;

			res.send(objet_retour);
		}
	})
})


module.exports = router; //On export la route pour pouvoir l'utiliser