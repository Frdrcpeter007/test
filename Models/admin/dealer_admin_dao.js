//------------Définition des variables globales
//cette variable est destinée à contenir une référence à
//l'objet collection qui dérivera de "db_js"
var db_js = require("../db");

//Le modèle de données
var dealer_dao = require("../dealer_dao");

/**
 * La fonction permettant de lister tous les dealers
 */
module.exports.getAll = function (gtDateDealer, callback) {
    
    dealer_dao.initialize(db_js);
    dealer_dao.getAllForAdmin(gtDateDealer, function (isMatched, resultMatch) {
        
        callback(isMatched, resultMatch)
    })
}

/**
 * La fonction permettant de rechercher un dealer suivant ses noms
 */
module.exports.searchByNames = function (query, callback) {
    
    dealer_dao.initialize(db_js);
    dealer_dao.searchByNamesForAdmin(query, function (isMatched, resultMatch) {
        
        callback(isMatched, resultMatch);
    })
}

/**
 * La fonction permettant de compter le nombre de dealers
 */
module.exports.countAll = function (callback) {
    
    var clientDao = require("../client_dao");
    clientDao.initialize(db_js);

    clientDao.countByTypeForAdmin("dealer", function(isCounted, resultCount) {
        callback(isCounted, resultCount);
    })

}

/**
 * La fonction permettant de créer un dealer par un agent
 */
module.exports.create = function (new_client, id_agent, callback) {
    
    var clientDao = require("../client_dao");
    clientDao.initialize(db_js);

    dealer_dao.initialize(db_js);

    clientDao.create(new_client, function(isClient, messageClient, resultClient) {
        
        if(isClient){

            var dealer_entity = require("../entities/dealer_entity").Dealer(),
                story_content_entity = require("../entities/dealer_entity").StoryContent();

            dealer_entity.id_client = ""+new_client._id;
            dealer_entity.date = new Date();
            dealer_entity.creer_par = null;
            dealer_entity.creer_par = id_agent;
            
            story_content_entity.date = new Date();
            story_content_entity.flag = true;
            story_content_entity.agent = id_agent;

            dealer_entity.story.push(story_content_entity);
            

            dealer_dao.create(dealer_entity, function(isCreated, messageDealer,  resultDealer) {
                
                callback(isCreated, messageDealer, resultDealer);
            })

        }else{
            
            callback(false, messageClient, resultClient);
        }
    })

    


}

/**
 * La fonction permettant d'afficher les détails d'un dealer
 */
module.exports.findOneById = function(id_dealer, callback) {
    
    dealer_dao.initialize(db_js);
    dealer_dao.findOneById(id_dealer, function(isDealer, resultDealer) {
        callback(isDealer, resultDealer);
    })
}

/**
 * La fonction permettant de trouver les agents approuveur et/ou créateur d'un compte dealer
 */
module.exports.findCreatorAndApprover = function(id_dealer, callback) {
    
    dealer_dao.initialize(db_js);
    dealer_dao.findCreatorAndApproverForAdmin(id_dealer, function(isAgentsFound, resultAgents) {
        
        callback(isAgentsFound, resultAgents);
    })
}

/**
 * La fonction permettant de valider la demande d'un client
 */
module.exports.validateClientRequest = function(id_dealer, id_agent, callback) {
    
    dealer_dao.initialize(db_js);
    dealer_dao.validateClientRequestForAdmin(id_dealer, id_agent, function(isValidated, messageValidating, resultValidating) {
        callback(isValidated, messageValidating, resultValidating)
    })
}

/**
 * La fonction permettant de manager l'état d'un dealer
 */
module.exports.manageFlag = function(id_dealer, id_agent, callback) {
    
    dealer_dao.initialize(db_js);
    dealer_dao.manageFlagForAdmin(id_dealer, id_agent, function(isManaged, messageManagement, resultManagement) {
        callback(isManaged, messageManagement, resultManagement)
    })
}

/**
 * La fonction qui vérifie si une demande dealer par rapport à un client est en attente
 */
module.exports.checkPendingClientRequestByIdClient = function(id_client, callback) {
    
    dealer_dao.initialize(db_js);
    dealer_dao.checkPendingClientRequestByIdClientForAdmin(id_client, function(isChecked, messageCheckIn, resultCheckIn) {
        callback(isChecked, messageCheckIn, resultCheckIn)
    })
}

/**
 * La fonction permettant d'activer/désactiver le type dealer d'un compte client
 */
module.exports.managerDealerMode = function(id_dealer, id_agent, motif,  callback) {
    
    dealer_dao.initialize(db_js);
    dealer_dao.managerDealerModeForAdmin(id_dealer, id_agent, motif, function(isUpdate, messageUpdate, resultUpdate) {
        callback(isUpdate, messageUpdate, resultUpdate)
    })
}

/**
 * La fonction permettant de lister les demandes dealer en attente
 */
module.exports.getAllPendingRequests = function(last_date, limit, callback) {
    
    dealer_dao.initialize(db_js);
    dealer_dao.getAllPendingRequestsForAdmin(last_date, limit,function(isDealer, messageDealer, resultDealer) {
        callback(isDealer, messageDealer, resultDealer)
    })
}

/**
 * La fonction permettant de lister les dealers suspendus
 */
module.exports.getAllDisabledAccount = function(last_date, limit, callback) {
    
    dealer_dao.initialize(db_js);
    dealer_dao.getAllDisabledAccountForAdmin(last_date, limit, function(isDealer, messageDealer, resultDealer) {
        callback(isDealer, messageDealer, resultDealer)
    })
}

module.exports.countPendingRequests = function(callback) {
    
    dealer_dao.initialize(db_js);
    dealer_dao.countPendingRequestsForAdmin(function(isDealer, messageDealer, resultDealer) {
        callback(isDealer, messageDealer, resultDealer)
    })
}