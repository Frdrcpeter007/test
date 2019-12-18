//On fait appel à express pour la gestion des routes
var express = require('express'),
    router = express.Router();

//Appel à la collection
var role_admin_model = require("../../Models/admin/role_admin_dao"),
    agent_admin_dao = require("../../Models/admin/agent_admin_dao");


//La route permettant d'avoir le nombre de clients inscrits
router.get("/:id_agent/getall", function (req, res) {
    
    var id_agent = req.params.id_agent,
        objet_retour = require("../objet_retour").ObjetRetour();

    agent_admin_dao.findOneById(id_agent, function (isAgentFound, messageResult, resultAgent) {
        
        if(isAgentFound){

            role_admin_model.getAll(function (isMatched, resultMatched) {
                
                if(isMatched){

                    objet_retour.getEtat = true;
                    objet_retour.getObjet = resultMatched;

                    res.send(objet_retour);

                }else{

                    objet_retour.getEtat = false;
                    objet_retour.getMessage = resultMatched;

                    res.send(objet_retour)
                }
            })

        }else{
            objet_retour.getEtat = false;
            objet_retour.getMessage = messageResult;
            objet_retour.getObjet = resultAgent;

            res.send(objet_retour)
        }
    })

})


module.exports = router;