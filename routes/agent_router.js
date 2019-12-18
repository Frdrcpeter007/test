//On fait appel à express pour la gestion des routes
var express = require('express'),
    //Ceci est le module contenant la quasi totalité des fonctions utilisé dans cet API
    func = require("../Models/includes/functions"),
    router = express.Router();

//Appel à la base de données
var db_js = require("../Models/db");

//Appel à la collection
var agent_model = require("../Models/agent_dao");

router.put("/updateAvatar/:id_agent", function (req, res) {
    
    var id_agent = req.params.id_agent,
        path = req.body.image_path,
        name = req.body.image_name,
        size = req.body.image_size,
        objetRetour = require("./objet_retour").ObjetRetour();

    agent_model.initialize(db_js);
    agent_model.updateAvatarForAdmin(id_agent, path, name, size, 
    function name(isUpdate, resultUpdate) {
        
        if(isUpdate){
            objetRetour.getEtat = true;
            objetRetour.getObjet = resultUpdate;

            res.send(objetRetour);
        }else{
            objetRetour.getEtat = false;
            objetRetour.getMessage = resultUpdate;

            res.send(objetRetour);
        }
    })
})

//La route qui permet de rechercher un agent par identifiant
router.get("/findOneById/:id_agent", function (req, res) {
    //Dans le module contenant des fonctions on appel la fonctions findAgentyId
    func.findAgentById(db_js, agent_model, req, res)
})


module.exports = router; //On export la route pour pouvoir l'utiliser