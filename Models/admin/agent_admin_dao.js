//------------Définition des variables globales
//cette variable est destinée à contenir une référence à
//l'objet collection qui dérivera de "db_js"
var db_js = require("../db");

//Le modèle de données
var agent_dao = require("../agent_dao");

module.exports.findOneById = function (identifiant, callback) {
    
    agent_dao.initialize(db_js);
    agent_dao.findOneById(identifiant, function (isAgent, messageAgent, resultAgent) {
        
        if(isAgent){

            var role_admin_dao = require("./role_admin_dao");
            //role_admin_dao.initialize(db_js);

            role_admin_dao.findOneByIdForAgent(resultAgent, function(isAgentWithRole, messageRole, resultAgentWithRole) {
                
                if(isAgentWithRole){
                    callback(true, null, resultAgentWithRole)
                }else{
                    callback(false, messageRole, null)
                }
            })

        }else{
            callback(false, messageAgent, null)
        }
    })
}

/**
 * La fonction permettant de compter le nombre d'agents
 */
module.exports.countAll = function(callback) {
    
    agent_dao.countAllForAdmin(function(isCount, resultCount) {
        callback(isCount, resultCount)
    })
}

//La fonction permettant le login de l'agent
module.exports.login = function (username, password, callback) {
    
    agent_dao.initialize(db_js);
    agent_dao.login(username, password, function(isLogIn, resultLogIn) {
        
        if(isLogIn){
            callback(true, resultLogIn)
        }else{
            callback(false, resultLogIn)
        }
    })
}

/**
 * La fonction permettant de lister tous les agents 
 */
module.exports.getAll = function(gtDateAgent, callback) {
    
    agent_dao.initialize(db_js);
    agent_dao.getAllForAdmin(gtDateAgent, function(isAgent, messageAgent, resultAgent) {
        callback(isAgent, messageAgent, resultAgent)
    })
}

/**
 * La fonction permettant d'affcher les details d'un agent
 */
module.exports.findOneById = function(identifiant, callback) {
    
    agent_dao.initialize(db_js);
    agent_dao.findOneByIdForAdmin(identifiant, function(isAgent, resultAgent) {
        callback(isAgent, resultAgent)
    })
}

/**
 * La fonction permettant de creer un agent
 */
module.exports.create = function (new_agent, callback) {
    
    agent_dao.initialize(db_js);
    
    //on commence par verifier la disponibilitE du username
    agent_dao.checkUsername(new_agent.authentification.username[0].valeur, function(isFree, messageUsername) {

        if(isFree){// si le username est disponible

            agent_dao.generateMaricule(function (isMatricule, resultMatricule) {
                
                if(isMatricule){

                    new_agent.matricule = resultMatricule;
                    
                    agent_dao.create(new_agent, function(isCreated, messageCreate, resultCreate) {

                        if(isCreated){
                            callback(true, null, resultCreate)
                        }else{
                            callback(false, messageCreate, null)
                        }
    
                    })
                }else{
                    callback(false, resultMatricule, null)
                }
                
            })

        }else{//sinon le username n'est pas dispo
            callback(false, messageUsername, null)
        }
    })
}

/**
 * La fonction permettant d'affecter une commune à un agent
 */
 module.exports.addCommune = function (id_agent, commune_agent, callback) {

     agent_dao.initialize(db_js);
     agent_dao.addCommuneForAdmin(id_agent, commune_agent, function(isAdded, messageAdding, resultAdding) {
         callback(isAdded, messageAdding, resultAdding)
     })
 }