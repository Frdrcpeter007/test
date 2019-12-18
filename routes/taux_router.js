//On fait appel à express pour la gestion des routes
var express = require('express'),
  //Ceci est le module contenant la quasi totalité des fonctions utilisé dans cet API
  func = require("../Models/includes/functions"),
  router = express.Router();

//Appel à la base de données
var db_js = require("../Models/db");

//Appel à la collection
var taux_model = require("../Models/taux_dao");

//Définir une devise et son taux
router.post("/create", (req, res ) => {
    func.createRate(db_js, taux_model, req, res)
})

router.post("/findOneByDenominationInAndOut", (req, res) => {
    func.getRate(db_js, taux_model, req, res)
})

module.exports = router;