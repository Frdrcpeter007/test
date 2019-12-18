//On fait appel à express pour la gestion des routes
var express = require('express'),
    router = express.Router();

//Appel à la collection
var taux_admin_model = require("../../Models/admin/taux_admin_dao"),
    agent_admin_dao = require("../../Models/admin/agent_admin_dao");


//La route permettant d'avoir le nombre de clients inscrits
router.post("/:id_agent/create", function (req, res) {
    
    var id_agent = req.params.id_agent,
        objet_retour = require("../objet_retour").ObjetRetour();

    agent_admin_dao.findOneById(id_agent, function (isAgentFound, messageResult, resultAgent) {
        
        if(isAgentFound){

            var new_rate = require("../../Models/entities/taux_entity").Taux();
            new_rate.denomination = req.body.denomination;
            new_rate.short_denomination = req.body.short_denomination;
            new_rate.devise_equivalente = req.body.devise_equivalente;
            new_rate.unite = req.body.unite;
            new_rate.montant_equivalent = req.body.montant_equivalent;
            new_rate.flag = req.body.flag;
            new_rate.date_creation = new Date();

            taux_admin_model.create(new_rate, function (is_created, message_result, creating_result) {
                
                if(is_created){

                    objet_retour.getEtat = true;
                    objet_retour.getObjet = creating_result;

                    res.send(objet_retour);

                }else{

                    objet_retour.getEtat = false;
                    objet_retour.getMessage = message_result;

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