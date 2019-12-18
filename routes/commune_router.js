//On fait appel à express pour la gestion des routes
var express = require('express'),
    //Ceci est le module contenant la quasi totalité des fonctions utilisé dans cet API
    func = require("../Models/includes/functions"),
    router = express.Router();

//Appel à la base de données
var db_js = require("../Models/db");

//Appel à la collection
var commune_dao = require("../Models/commune_dao");


//La route permettant de lister toutes les communes liées à une ville
router.get("/findallbyidville/:id_ville", function(req, res) {
    
    func.findAllCommuneByIdVille(db_js,commune_dao,req, res);

})

module.exports = router;