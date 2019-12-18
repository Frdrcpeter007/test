//------------Définition des variables globales
//cette variable est destinée à contenir une référence à
//l'objet collection qui dérivera de "db_js"
var db_js = require("./db");

var collection = {
    value: null
}

//Ici on initialise la variable "collection" en lui passant
//la valeur provenant de "db_js". NB: cette fonction sera accessible
//en dehors de ce fichier
module.exports.initialize = function (db_js) {

    collection.value = db_js.get().collection("dealer");
}

/**
 * La fonction qui permet de créer un agent
 */
module.exports.create = (newDealer, callback) => {
    try {
        module.exports.findOneByIdClient(newDealer.id_client, (isFound, messageFound, resultFound) => {
            if (!isFound) {
                collection.value.insertOne(newDealer, (err, result) => {
                    if (err) {
                        callback(false, "Une erreur est survenue lors de la création du dealer : " + err)
                    } else {
                        if (result) {
                            callback(true, "La validation est en cours de processus", result.ops[0])
                        } else {
                            callback(false, "Demande non-soumis")
                        }
                    }
                })
            } else {
                callback(false, "Vous êtes déjà dealer, faut pas en abuser")
            }
        })

    } catch (exception) {
        callback(false, "Une exception a été lévée lors de la création du dealer : " + exception)
    }
}

/**
 * La fonction permettant d'avoir les détails d'un dealer suivant son identifiant
 */
module.exports.findOneById = function(id_dealer, callback) {
    
    try{

        var _id = require("mongodb").ObjectID(id_dealer),
            filter = {"_id" : _id};

        collection.value.findOne(filter, function(err, result) {
            
            if(err){
                callback(false, "Une erreur est survenue lors de la recherche du dealer <"+id_dealer+"> : "+err);
            }else{
                if(result){

                    var clientDao = require("./client_dao");
                    clientDao.initialize(db_js);
                    
                    clientDao.findOneByIdForAdmin(result.id_client, function(isClient, resultClient) {
                        
                        result.infos_client = null;

                        if(isClient){
                            result.infos_client = resultClient;

                            callback(true, result);
                        }else{
                            callback(false, "Auncun client ne correspond à l'id_client <"+
                                result.id_client+">, du dealer <"+result._id+">");
                        }
                    })
                }else{
                    callback(false, "Aucun dealer ne correspond à l'identifiant <"+id_dealer+">");
                }
            }
        })

    }catch(exception){
        callback(false, "Une exception a été lévée lors de la recherche du dealer <"+id_dealer+"> : "+exception);
    }
}

/**
 * La fonction permettant de retrouver les détails d'un dealer, informatios 
 * à afficher lors de la visualisation d'un produit. 
 */
module.exports.findOneByIdFromProduct = function(details_produit, callback) {
    
    try{
        var _id = require("mongodb").ObjectID(details_produit.id_dealer),
            filter = {"_id" : _id};
        collection.value.findOne(filter, function(params) {
            
        })
        
    }catch(exception){
        callback(false, "Une exception a été lévée lors de la recherche du dealer <"+details_produit.id_dealer+"> : "+exception, null)
    }
}

/**
 * Cette fonction permet la recherche d'un dealer via son identifiant (id_dealer) 
 * @param {*} id Identifiant du dealer
 * @param {Function} callback Fonction de retour
 */
module.exports.findOneByIdClient = function (id_client, callback) {
    try {

        var filter = {
            "id_client": id_client
        };

        collection.value.findOne(filter, function (err, result) {
            if (err) {
                callback(false, "Une erruer est survénue lors de la recherche du dealer : " + err)
            } else {
                if (result) {
                    callback(true, "Le dealer a été identifié avec succès", result)
                } else {
                    callback(false, "Il n'existe pas de dealer avec cet identifiant")
                }
            }
        })
    } catch (exception) {
        callback(false, "Une exception a été lévée lors de la recherche du dealer : " + exception)
    }
}

/**
 * La fonction permettant de lister les dealers
 * Elle est utilisée dans l'administration
 */
module.exports.getAllForAdmin = function (gtDateDealer, callback) {
    
    try{

        var filter = {},
            sort = {"date" : -1};

        if(gtDateDealer != "null"){

            var dateDealer = new Date(gtDateDealer);
            filter = {"date" : {"$lt" : dateDealer}}
        }

        collection.value.find(filter)
        .sort(sort)
        .limit(20).toArray(function (err, resultDealer) {
            if(err){
                callback(false, "Une erreur est survenue lors du listage des dealers : "+err)
            }else{
                if(resultDealer.length > 0){

                    var listeDealerWithClientInfos = [],
                        sortieDealer = 0,
                        clientDao = require("./client_dao");

                    clientDao.initialize(db_js);

                    for (let indexDealer = 0; indexDealer < resultDealer.length; indexDealer++) {
                          
                        clientDao.getOneByIdFromDealer(resultDealer[indexDealer],
                            function(isClientFound, resultClient) {
                                
                                sortieDealer++;

                                if(isClientFound){
                                    listeDealerWithClientInfos.push(resultClient)
                                }

                                if(sortieDealer == resultDealer.length){

                                    if(listeDealerWithClientInfos.length > 0){
                                        callback(true, listeDealerWithClientInfos)
                                    }else{
                                        callback(false, "Aucun client ne correspond aux dealers")
                                    }
                                }
                        })                     
                    }
                    
                }else{
                    callback(false, "Aucun dealer n'a été trouvé")
                }
            }
        })

    }catch(exception){
        callback(false, "Une exception a été lévée lors du listage des dealers : "+exception)
    }
}

/**
 * La fonction permettant de rechercher un dealer suivant ses noms
 * Elle est utilisée dans l'administration
 */
module.exports.searchByNamesForAdmin = function (query, callback) {
    
    //on commence par rechercher parmi les clients
    //Sachant qu'un dealer est avant tout un client

    var client_dao = require("./client_dao");
        sortieClient = 0,
        listeSortieWithDealer = [];

    client_dao.initialize(db_js);
    client_dao.searchByNames(query, function (isMatched, resultMatch) {
        
        if(isMatched){


            //On passe en boucle le resultat de la recherche afin de vérifier si les clients
            //trouvés sont dealers ou non
            for (let indexClient = 0; indexClient < resultMatch.length; indexClient++) {
                
            
                findOneByIdClientForResearch(resultMatch[indexClient], function (isDealer, resultDealer) {
                    
                    sortieClient++;

                    if(isDealer){
                        listeSortieWithDealer.push(resultDealer)
                    }

                    if(sortieClient == resultMatch.length){
                        if(listeSortieWithDealer.length){

                            callback(true, listeSortieWithDealer)
                        }else{
                            callback(false, "Aucun dealer n'a été trouvé");
                        }
                    }
                })
            }
        }else{
            callback(false, "Aucun dealer ne correspond à la valeur recherchée")
        }

    })
}

//Cette fonction est une fonction interne à la DAO, elle est utilisée dans 
//la fonction "searchByNamesForAdmin"
module.exports.findOneByIdClientForResearch = function(client, callback) {
    
    try{

        var filter = {
            "id_client" : ""+client._id
        };

        collection.value.findOne(filter, function (err, result) {
            
            if(err){
                callback(false, "Une erreur est suvenue lors de la recherche du dealer par id_client : "+err);
            }else{

                if(result){

                    client.id_dealer = ""+result._id;
                    client.date_becoming_dealer = result.date;

                    callback(true, client)
                }else{
                    callback(false, "Aucun dealer ne correspond à l'id client passé")
                }
            }
        })

    }catch(exception){
        callback(false, "Une exception a été lévée lors de la recherche du dealer par id_client : "+exception);
    }
}

/**
 * La fonction permettant de trouver les agents approuveur et/ou créateur d'un compte dealer.
 * Elle est utilisée dans l'administration
 */
module.exports.findCreatorAndApproverForAdmin = function(id_dealer, callback) {
    
    try{

        var _id = require("mongodb").ObjectID(id_dealer),
            filter = {"_id" : _id},
            objetRetour = {
                creer_par : null,
                approuver_par : null
            };

        //On commence par rechercher le dealer
        collection.value.findOne(filter, function(errDealer, resultDealer) {
            
            if(errDealer){

                callback(false, "Une erreur est survenue lors de la recherche des agents créateurs/approuveurs du dealer <"+
                    id_dealer+"> : "+errDealer);

            }else{
                
                if(resultDealer){//Si le dealer est trouvé

                    var agent_dao = require("./agent_dao");
                    agent_dao.initialize(db_js);

                    if(resultDealer.creer_par){//Si le dealer a été créé par un agent

                        //On procède à la recherche de l'agent créateur
                        agent_dao.findOneById(resultDealer.creer_par, function(isAgentCreator, messageAgentCreator, resultAgentCreator) {
                            
                            if(isAgentCreator){//Si l'agent créateur est trouvé

                                //On recupère les infos de l'agent créateur du dealer
                                var agentCreateur = {
                                    prenom : null,
                                    nom : null,
                                    id_agent : null
                                }

                                agentCreateur.prenom = resultAgentCreator.prenom;
                                agentCreateur.nom = resultAgentCreator.nom;
                                agentCreateur.id_agent = ""+resultAgentCreator._id;
                                objetRetour.creer_par = agentCreateur;

                                //Puis on recherche les infos de l'agent ayant approuvé, si le compte est 
                                //déjà fonctionnel
                                if(resultDealer.story.length > 0){

                                    agent_dao.findOneById(resultDealer.story[0].agent, function(isAgentApprover, messageAgentApprover, resultAgentApprover) {
                                        
                                        if(isAgentApprover){

                                            var agentApprouveur = {
                                                prenom : null,
                                                nom : null,
                                                id_agent : null
                                            }
            
                                            agentApprouveur.prenom = resultAgentApprover.prenom;
                                            agentApprouveur.nom = resultAgentApprover.nom;
                                            agentApprouveur.id_agent = ""+resultAgentApprover._id;

                                            objetRetour.approuver_par = agentApprouveur;
                                            callback(true, objetRetour);

                                        }else{

                                            callback(true, objetRetour)
                                        }
                                    })

                                }else{
                                    callback(true, objetRetour)
                                }
                            }else{//Sinon l'agent créateur n'existe pas, on recherche donc l'agent approuveur

                                //On vérifie bien si le compte a été déjà approuvé
                                if(resultDealer.approuve.agent && resultDealer.approuve.date){

                                    agent_dao.findOneById(resultDealer.approuve.agent, function(isAgentApprover, messageAgentApprover, resultAgentApprover) {
                                        
                                        if(isAgentApprover){

                                            var agentApprouveur = {
                                                prenom : null,
                                                nom : null,
                                                id_agent : null
                                            }
            
                                            agentApprouveur.prenom = resultAgentApprover.prenom;
                                            agentApprouveur.nom = resultAgentApprover.nom;
                                            agentApprouveur.id_agent = ""+resultAgentApprover._id;

                                            objetRetour.approuver_par = agentApprouveur;
                                            callback(true, objetRetour);

                                        }else{

                                            callback(false, "Aucun n'identifiant d'agent ayant approuvé ce compte ne correspond à l'identifiant <"+
                                                resultDealer.approuve.agent+">");
                                        }
                                    })

                                }else{
                                    callback(false, "Compte créé par demande du client, et non encore approuvé");
                                }
                            }
                        })

                    }else{//Sinon le dealer decoule d'une demande d'un client

                        //On vérifie bien si le compte a été déjà approuvé
                        var storyLength = resultDealer.story.length,
                            lastStory;

                        if(storyLength > 0){
                            lastStory = resultDealer.story[storyLength - 1];

                        }
                        if(storyLength > 0 && lastStory){

                            agent_dao.findOneById(lastStory.agent, function(isAgentApprover, messageAgentApprover, resultAgentApprover) {
                                
                                if(isAgentApprover){

                                    var agentApprouveur = {
                                        prenom : null,
                                        nom : null,
                                        id_agent : null
                                    }

                                    agentApprouveur.prenom = resultAgentApprover.prenom;
                                    agentApprouveur.nom = resultAgentApprover.nom;
                                    agentApprouveur.id_agent = ""+resultAgentApprover._id;

                                    objetRetour.approuver_par = agentApprouveur;
                                    callback(true, objetRetour);

                                }else{

                                    callback(false, "Aucun n'identifiant d'agent ayant approuvé ce compte ne correspond à l'identifiant <"+
                                        lastStory.agent+">");
                                }
                            })

                        }else{
                            callback(false, "Compte créé par demande du client, et non encore approuvé");
                        }
                    }
                }else{//Sinon aucun dealer ne correspond à l'identifiant passé
                    callback(false, "Aucun dealer ne correspond à l'identiiant <"+id_dealer+">");
                }
            }
        })

    }catch(exception){
        callback(false, "Une exception a été lévée lors de la recherche des agents créateurs/approuveurs du dealer <"+
            id_dealer+"> : "+exception);
    }
}

/**
 * La fonction permettant de trouver un produit spécifique issu d'une opération vente.
 */
module.exports.findOneByIdFromOperationVenteForAdmin = function (operationVente, callback) {
    
    try{

        var _id = require("mongodb").ObjectID(operationVente.id_dealer),
            filter = {"_id" : _id};
        
        collection.value.findOne(filter, function(err, result) {

            
            
            if(err){
                operationVente.listeErreur.push("Une erreur est survenue lors de la recherche du dealer <"+operationVente.id_dealer+"> : "+err)
                callback(false, operationVente);
            }else{

                if(result){

                    operationVente.id_client = result.id_client;

                    //On recherche les détails du dealer
                    var clientDao = require("./client_dao");
                    clientDao.initialize(db_js);
                    clientDao.findOneByIdFromOperationVenteForAdmin(operationVente, function(isClient, resultWithClient) {
                        
                        callback(isClient, resultWithClient)
                    })

                }else{
                    operationVente.listeErreur.push("Aucun dealer ne correspond à l'identifiant <"+operationVente.id_dealer+">")
                    callback(false, operationVente)
                }
            }
        })
    }catch(exception){

        operationVente.listeErreur.push("Une exception a été lévée lors de la recherche du dealer <"+operationVente.id_dealer+"> : "+exception);
        
        callback(false, operationVente);
    }
}

/**
 * La fonction permettant de rechercher le dealer ayant fait objet d'une alerte
 */
module.exports.findOneFromAlerteForAdmin = function(alerte, callback) {
    
    try{

        alerte.infos_dealer = null;

        var _id = require("mongodb").ObjectID(alerte.id_objet),
            filter = {"_id" : _id};

        collection.value.findOne(filter, function(err, result) {
            
            if(err){
                callback(false, "Une erreur est survenue lors de la recherche du dealer <"+alerte.id_objet+"> : "+err, null);
            }else{
                if(result){

                    var clientDao = require("./client_dao");
                    clientDao.initialize(db_js);
                    
                    clientDao.findOneByIdForAdmin(result.id_client, function(isClient, resultClient) {

                        if(isClient){
                            var infos_dealer = {
                                "id_dealer" : ""+result._id,
                                "nom" : resultClient.infos[0].nom,
                                "prenom" : resultClient.infos[0].prenom,
                                "sexe" : resultClient.infos[0].sexe,
                                "image_name" : resultClient.infos[0].lien_profil? resultClient.infos[0].lien_profil : null,
                                "image_path" : resultClient.infos[0].path_profil? resultClient.infos[0].path_profil : null
                            }
                            alerte.infos_dealer = infos_dealer;
                            callback(true, null, alerte);
                        }else{
                            callback(false, "Auncun client ne correspond à l'id_client <"+
                                result.id_client+">, du dealer <"+result._id+">", null);
                        }
                    })
                }else{
                    callback(false, "Aucun dealer ne correspond à l'identifiant <"+alerte.id_objet+">");
                }
            }
        })

    }catch(exception){
        callback(false, "Une exception a été lévée lors de la recherche du dealer <"+alerte.id_objet+"> : "+exception);
    }
}

/**
 * La fonction permettant de valider la demande d'un client pour devenir dealer
 */
module.exports.validateClientRequestForAdmin = function(id_dealer, id_agent, callback) {
    
    try{

        var _id = require("mongodb").ObjectID(id_dealer),
            filter = {"_id" : _id},
            update = {"$push" : {
                    "story" : {
                        "date" : new Date(),
                        "flag" : true, 
                        "agent" : id_agent
                    }
                }
            }
        
        collection.value.updateOne(filter, update, function(err, result) {
            
            if(err){
                callback(false, "Une erreur est survenue lors de la validation de la demande client : "+err, null);
            }else{

                module.exports.managerDealerModeForAdmin(id_dealer, id_agent, function (isManaged, messageManagement, resultManagent) {
                    
                    if(isManaged){
                        callback(true, null, "Demande client validée avec succès");
                    }else{
                        callback(false, messageManagement, resultManagent)
                    }
                })
            }
        })

    }catch(exception){
        callback(false, "Une exception a été lévée lors de la validation de la demande client : "+exception, null);
    }
}

/**
 * La fonction permettant d'activer / désactiver un compte dealer
 */
module.exports.manageFlagForAdmin = function (id_dealer, id_agent,callback) {
    
    try{

        var _id = require("mongodb").ObjectID(id_dealer),
            filter = {"_id" : _id};
            
        
        collection.value.findOne(filter, function(errFind, resultFind) {
            
            if(errFind){
                callback(false, "Une erreur est survenue lors de la recherche du dealer <"+id_dealer+"> : "+errFind, null);
            }else{
                if(resultFind){

                    var lastStory = null,
                        update = null;

                    if(resultFind.story.length > 0){
                    
                        lastStory = resultFind.story[resultFind.story.length - 1]
                        update = {"$push" : {
                                "story" : {
                                    "date" : new Date(),
                                    "flag" : lastStory.flag? false : true, 
                                    "agent" : id_agent
                                }
                            }
                        }
                    }else{
                        update = {"$push" : {
                                "story" : {
                                    "date" : new Date(),
                                    "flag" : true, 
                                    "agent" : id_agent
                                }
                            }
                        }
                    }
                    collection.value.updateOne(filter, update, function(err, result) {
            
                        if(err){
                            callback(false, "Une erreur est survenue lors de la validation de la demande client : "+err, null);
                        }else{

                            var response = null;
                            if(lastStory){
                                response = lastStory.flag? false : true
                            }else{
                                response = true
                            }
                            callback(true, "Mise à jour de l'état du dealer mise à jour avec succès", response)
                        }
                    })

                }else{
                    callback(false, "Aucun dealer ne correspond à l'identifiant <"+id_dealer+">", null)
                }
            }
        })

    }catch(exception){
        callback(false, "Une exception a été lévée lors de la recherche du dealer <"+id_dealer+"> : "+exception);
    }
}

/**
 * La fonction qui vérifie si une demande dealer par rapport à un client est en attente
 */
module.exports.checkPendingClientRequestByIdClientForAdmin = function(id_client, callback) {
    
    try{

        var filter = {"id_client" : id_client};

        collection.value.findOne(filter, function(errClient, result) {
            
            if(errClient){
                callback(false, "Une erreur est survenue lors de la vérification du mode dealer : "+errClient, null);
            }else{
                if(result){
                    var storyLength = result.story.length;

                    var objetRetour = {
                        "request_pending" : null,
                        "id_dealer" : ""+result._id
                    }

                    if(storyLength > 0){  
                        objetRetour.request_pending = false;                      
                        callback(true, null, objetRetour);
                    }else{
                        objetRetour.request_pending = true;
                        callback(true, null, objetRetour);
                    }
                }else{
                    callback(false, "Aucun dealer ne correspond à l'identifiant du client <"+id_client+">", null)
                }
            }
        })

    }catch(exception){
        callback(false, "Une exception a été lévée lors de la vérification du mode dealer : "+exception, null);
    }
}

/**
 * La fonction permettant d'activer/désactiver le type dealer d'un compte client
 */
module.exports.managerDealerModeForAdmin = function(id_dealer, id_agent, motif,  callback) {
    
    try{

        var _id = require("mongodb").ObjectID(id_dealer),
            filter = {"_id" : _id};

        collection.value.findOne(filter, function(err, result) {
            
            if(err){
                callback(false, "Une est survenue lors de la recherche du dealer <"+id_dealer+"> a désactiver le mode dealer : "+err, null)
            }else{
                if(result){

                    var clientDao = require("./client_dao");
                    clientDao.initialize(db_js);
                    clientDao.updateType2FromDealerForAdmin(result.id_client, id_agent, motif,id_dealer, function(isUpdate, messageUpdate, resultUpdate) {
                        callback(isUpdate, messageUpdate, resultUpdate)
                    })

                }else{
                    callback(false, "Aucun dealer ne correspond à l'identifiant <"+id_dealer+">", null)
                }
            }
        })

    }catch(exception){
        callback(false, "Une exception a été lévée lors de la recherche du dealer <"+id_dealer+"> a désactiver le mode dealer : "+exception, null)
    }
}

module.exports.updateStoryFromClientTypeManagerForAdmin = function(update_story_dealer, id_dealer, callback) {
    
    try{

        var _id = require("mongodb").ObjectID(id_dealer),
            filter = {"_id" : _id};

            collection.value.updateOne(filter, update_story_dealer, function(err, result) {
                
                if(err){
                    callback(false, "Une erreur est survenue lors de la mise a jour de l'historiaue du dealer <"+id_dealer+">", null)
                }else{
                    callback(true, null, "Compte dealer mise a  jour correctement");
                }
            });
        
    }catch(ex){
        callback(false, "Une exception a été lévée lors de la mise à de l'historique du dealer <"+id_dealer+"> : "+ex, null)
    }
}

/**
 * La fonction permettant de compter les deamndes dealers en attente
 */
module.exports.countPendingRequestsForAdmin = function(callback) {
    
    try{
        
        collection.value.aggregate([
            {"$match" : {"story" : {"$size" : 0}}},
            {"$sort" : {"date" : -1}},
        ]).toArray(function(errDealer, resultDealer) {
            if(errDealer){
                callback(false, "Une erreur est survenue lors du listage de demandes en attente : "+errDealer, null)
            }else{
                if(resultDealer.length > 0){

                    //Si au moins une demande est en attente
                    var objetRetour = 0,
                        objetRetourError = [],
                        sortieDealer = 0,
                        clientDao = require("./client_dao");
                    
                    clientDao.initialize(db_js);
                    
                    var counter = 0;
                    for (let indexDealer = 0; indexDealer < resultDealer.length; indexDealer++) {
                        
                        clientDao.getOneByIdFromDealer(resultDealer[indexDealer], function(isDealer, dealerFromClient) {
                            sortieDealer++;

                            if(isDealer){
                                counter++;
                            }else{
                                objetRetourError.push(dealerFromClient)
                            }                        

                            if(sortieDealer == resultDealer.length){

                                if(counter > 0){
                                    callback(true, null, counter)
                                }else{
                                    callback(false, "Aucun client ne correspond aux demandes de dealers en attente",objetRetourError)
                                }
                            }
                        })
                    }
                }else{
                    callback(false, "Aucune demande n'est en attente", null)
                }
            }
        })

    }catch(exception){
        callback(false, "Une exception a été lévée lors du listage de demandes en attente : "+exception, null)
    }
}

/**
 * La fonction permettant de lister les demandes dealer en attente.
 */
module.exports.getAllPendingRequestsForAdmin = function(date, limit, callback) {
    
    try{
        
        var date_iso = new Date(date);
        collection.value.aggregate([
            {"$match" : {"story" : {"$size" : 0}}},
            {"$sort" : {"date" : -1}},
            {"$match" : {"date" : {"$lt" : date_iso} }},
            {"$limit" : limit}
        ]).toArray(function(errDealer, resultDealer) {
            if(errDealer){
                callback(false, "Une erreur est survenue lors du listage de demandes en attente : "+errDealer, null)
            }else{
                if(resultDealer.length > 0){

                    //Si au moins une demande est en attente
                    var objetRetour = [],
                        objetRetourError = [],
                        sortieDealer = 0,
                        clientDao = require("./client_dao");
                    
                    clientDao.initialize(db_js);
                    
                    for (let indexDealer = 0; indexDealer < resultDealer.length; indexDealer++) {
                        
                        clientDao.getOneByIdFromDealer(resultDealer[indexDealer], function(isDealer, dealerFromClient) {
                            sortieDealer++;

                            if(isDealer){
                                objetRetour.push(dealerFromClient);
                            }else{
                                objetRetourError.push(dealerFromClient)
                            }                        

                            if(sortieDealer == resultDealer.length){

                                if(objetRetour.length > 0){
                                    callback(true, null, objetRetour)
                                }else{
                                    callback(false, "Aucun client ne correspond aux demandes de dealers en attente",objetRetourError)
                                }
                            }
                        })
                    }
                }else{
                    callback(false, "Aucune demande n'est en attente", null)
                }
            }
        })

    }catch(exception){
        callback(false, "Une exception a été lévée lors du listage de demandes en attente : "+exception, null)
    }
}

/**
 * La fonction permettant de lister les dealers suspendus
 */
module.exports.getAllDisabledAccountForAdmin = function (date, limit, callback) {
    
    try{

        var iso_date = new Date(date);
        collection.value.aggregate([
            {"$match" : {"story" : {"$gte" : {"$size" : 1}}}},
            {"$project" : 
                {
                    "_id" : "$_id",
                    "id_client" : "$id_client",
                    "date" : "$date",
                    "story" : {
                        "$slice" : ["$story", -1]
                    }
                }
            },
            {"$unwind" : "$story"},
            {"$sort" : {"story.date" : -1}},
            {"$match" : {
                "story.flag" : false,
                "story.date" : {
                    "$lte" : iso_date
                    }
                }
            },
            {"$limit" : limit}
        ]).toArray(function(errDealer, resultDealer) {
            if(errDealer){
                callback(false, "Une erreur est survenue lors du listage de dealers suspendus : "+errDealer, null)
            }else{
                if(resultDealer.length > 0){

                    //Si au moins une demande est en attente
                    var objetRetour = [],
                        objetRetourError = [],
                        sortieDealer = 0,
                        clientDao = require("./client_dao");
                    
                    clientDao.initialize(db_js);
                    
                    for (let indexDealer = 0; indexDealer < resultDealer.length; indexDealer++) {
                        
                        clientDao.getOneByIdFromDealer(resultDealer[indexDealer], function(isDealer, dealerFromClient) {
                            sortieDealer++;

                            if(isDealer){
                                objetRetour.push(dealerFromClient);
                            }else{
                                objetRetourError.push(dealerFromClient)
                            }                        

                            if(sortieDealer == resultDealer.length){

                                if(objetRetour.length > 0){
                                    callback(true, null, objetRetour)
                                }else{
                                    callback(true, "Aucun client ne correspond aux dealers suspendus",objetRetourError)
                                }
                            }
                        })
                    }
                }else{
                    callback(false, "Aucun dealer suspendu n'a été trouvé", null)
                }
            }
        })

    }catch(exception){
        callback(false, "Une exception a été lévée lors du listage des dealers suspendus : "+exception, null)
    }

}

/**
 * La fonction permettant d'ajouter un nouveau lieu de vente
 */
module.exports.addLieuVenteByIdDealer = function (id_dealer, new_lieu_vente, callback) {
    
    try{

        var _id = require("mongodb").ObjectID(id_dealer),
            filter = {"_id" : _id},
            update = {"$add" : { "lieu_vente" : new_lieu_vente}};

        collection.value.updateOne(filter, update, function (errUpdate, resultUpdate) {
            if(errUpdate){
                callback(false, "Une erreur est survenue lors de l'ajout du nouveau lieu de vente du dealer <"+id_dealer+"> : "+errUpdate, null)
            }else{
                callback(true, null, "Nouveau lieu de vente ajouté avec succès");
            }
        })
    }catch(exception){
        callback(false, "Une exception a été lévée lors de l'ajout du nouveau lieu de vente du dealer <"+id_dealer+"> : "+exception, null)
    }
}

/**
 * La fonction permettant de lister les lieux de vente d'un dealer
 */
module.exports.getAllLieuVenteByIdDealer = function (id_dealer, callback) {
    
    try{

        var _id = require("mongodb").ObjectID(id_dealer),
            filter = {"_id" : _id},
            project = {"_id" : 0, "lieu_vente" : 1};
        
        collection.value.findOne(filter, project, function (err, result) {
            
            if(err){
                callback(false, "Une erreur est survenue lors du listage de lieux de vente du dealer <"+id_dealer+"> : "+err, null)
            }else{
                if(result){
                    if(result.lieu_vente.length > 0){//Si au moins un lieu de vente a été trouver

                        //On recupere les détails de chaque lieu
                        var adresse_dao = require("./adresse_dao"),
                            commune_dao = require("./commune_dao"),
                            list_lieu_vente_details = [],
                            list_erreur_lieu_vente_details = [],
                            sortie_lieu_vente = 0;

                        adresse_dao.initialize(db_js);
                        commune_dao.initialize(db_js)

                        for (let index_lieu_vente = 0; index_lieu_vente < result.lieu_vente.length; index_lieu_vente++) {

                           adresse_dao.findOneById(result.lieu_vente[index_lieu_vente].id_adresse, function(isAddress, message_details_add, result_details_add) {
                                                               
                                if(isAddress){
                                    result_details_add.etat = result.lieu_vente[sortie_lieu_vente].etat;
                                    list_lieu_vente_details.push(result_details_add)
                                }else{
                                    list_erreur_lieu_vente_details.push(message_details_add)
                                }                               

                                //on incrémente la variable de sortie
                                sortie_lieu_vente++;

                                //On vérifie la condition de sortie
                                if(sortie_lieu_vente == result.lieu_vente.length){
                                    var result_retour = {
                                        "lieu_vente" : list_lieu_vente_details,
                                        "erreur" : list_erreur_lieu_vente_details
                                    };

                                    callback(true, null, result_retour);
                                }
                           })

                        }

                    }else{
                        callback(false, "Aucun lieu de vente n'a été défini par le dealer", null)
                    }
                }else{
                    callback(false, "Aucun dealer ne correspond à l'identifiant <"+id_dealer+">", null);
                }
            }
        })
        
    }catch(exception){
        callback(false, "Une exception a été lévée lors du listage de lieux de vente du dealer <"+id_dealer+"> : "+exception, null)
    }
}

/**
 * La fonction permettant de mettre à jour l'état d'un lieu de vente d'un dealer
 */
module.exports.manageFlagOfOneLieuVenteByIdDealer = function (id_dealer, id_adresse, index_lieu_vente, callback) {
    
    try{
        var _id = require("mongodb").ObjectID(id_dealer),
            filter = {"_id" : _id, "lieu_vente.id_adresse" : id_adresse};
        
        //On commence d'abord par rechercher l'item à modifier
        collection.value.findOne(filter, function (errFind, resultFind) {
            if(errFind){
                callback(false, "Une erreur est survenue lors de la recherche du lieu de vente à mettre à jour : "+ errFind, null)
            }else{
                if(resultFind){
                    if(resultFind.lieu_vente.length > 0){

                        //A ce niveau la mise à jour peut avoir lieu
                        var etat_encours = resultFind.lieu_vente[index_lieu_vente].etat,
                            nouvel_etat = etat_encours ? false : true,
                            key = "lieu_vente."+index_lieu_vente+".etat",
                            update = {"$set" : {key : nouvel_etat}};

                        collection.value.updateOne(filter, update, function (errUpdate, resultUpdate) {

                            if(errUpdate){
                                callback(false, "Une erreur est survenue lors de la mise à jour de l'état du lieu de vente du dealer <"+id_dealer+"> : "+errUpdate);
                            }else{
                                callback(true, null, "Etat du lieu de vente correctement mis à jour");
                            }
                        })

                    }else{
                        callback(false,"Il se pourrait que le dealer <"+id_dealer+"> ait défini aucun lieu de vente", null)
                    }
                }else{
                    callback(false, "Aucun resultat ne correspond aux critères de recherche pour la mise à jour du lieu de vente", null);
                }
            }
        })
    }catch(exception){
        callback(false, "Une exception a été lévée lors de la mise à jour de l'été du lieu de vente : "+exception, null);
    }
}

/**
 * La fonction permettant de rechercher les details du dealer de qui le produit est ajouté au pannier par le client.
 */
module.exports.findOneByIdForAdresseLivraison = function(id_dealer, callback) {
    
    try{

        var _id = require("mongodb").ObjectID(id_dealer),
            filter = {"_id" : _id},
            project ={"id_client" : 1};

        collection.value.findOne(filter, project, function(errDealer, resultDealer) {
            if(errDealer){
                callback(false, "Une erreur est survenue lors de la recherche du dealer <"+id_dealer+"> : "+errDealer, id_dealer)
            }else{
                if(resultDealer){

                    var short_dealer = {
                        "_id" : resultDealer._id,
                        "id_client" : resultDealer.id_client
                    }
                    //On recupère les détails du compte client du dealer
                    var client_dao = require("./client_dao");
                    client_dao.initialize(db_js);

                    client_dao.getOneByIdFromDealer(short_dealer, function(is_client, message_client, result_client) {
                        
                        callback(is_client, message_client, result_client);
                    })

                }else{
                    callback(false, "Aucun dealer ne correspond à l'identifiant <"+id_dealer+">", null);
                }
            }
        })
    }catch(exception){
        callback(false, "Une exception a été lévée lors de la recherche du dealer <"+id_dealer+"> : "+exception, null)
    }
}

/**
 * La fonction permettant de rechercher les détails du dealer de qui les détails du produit sont affichés
 */
module.exports.findOneByIdForProductShowingDetails = function(produit, produit_dealer, callback) {

    //Sachant que le produit à afficher possède sa tarification définie par le dealer, 
    //et aussi qu'elle est reférenciée par l'objet en argument (produit_dealer), on fait d'une pierre deux coûts.
    var produit_dealer_prix = require("./produit_dealer_prix_dao");
    produit_dealer_prix.initialize(db_js);
    produit_dealer_prix.findOneByIdProduitDealer(produit_dealer,
    function(is_price, message_price, _, result_price) {

        try{
            var _id = require("mongodb").ObjectID(produit_dealer.id_dealer),
                filter = {"_id" : _id},
                project ={"id_client" : 1};

            collection.value.findOne(filter, function(errDealer, resultDealer) {
                if(errDealer){
                    callback(false, "Une erreur est survenue lors de la recherche du dealer <"+produit_dealer.id_dealer+"> : "+errDealer, produit_dealer.id_dealer)
                }else{
                    if(resultDealer){

                        var short_dealer = {
                            "_id" : resultDealer._id,
                            "id_client" : resultDealer.id_client
                        }
                        //On recupère les détails du compte client du dealer
                        var client_dao = require("./client_dao");
                        client_dao.initialize(db_js);

                        client_dao.getOneByIdFromDealer(short_dealer, function(is_client, message_client, result_client) {
                            
                            if(is_client){//Si les détails du compte client lié au dealer sont trouvés

                                //on recupère les détails du dealer
                                produit_dealer.infos_dealer = result_client;

                                //Puis on passe à la recherche des détails de l'adresse de vente du produit
                                var adresse_dao = require("./adresse_dao");
                                adresse_dao.initialize(db_js);
                                adresse_dao.findOneById(produit_dealer.id_lieu_vente,
                                function(is_adresse, message_adresse, result_adresse) {
                                    
                                    if(is_adresse){
                                        produit_dealer.infos_lieu_vente = result_adresse;

                                        //Puis on recherche le stock
                                        var operation_produit_dao = require("./operation_produit_dao");
                                        operation_produit_dao.initialize(db_js);

                                        var operation_produit_entity = {
                                            "id_produit" : produit_dealer.id_produit, 
                                            "id_dealer" : produit_dealer.id_dealer,
                                            "id_lieu_vente" : produit_dealer.id_lieu_vente,
                                        }
                                        operation_produit_dao
                                            .checkAvailableProductByIdDealerAndIdProductForProductDetails(operation_produit_entity, 
                                        function(is_stock, message_stock, containerStockDispo) {
                                                
                                            produit_dealer.stock = {
                                                "quantite" : 0,
                                                "erreur" : null
                                            };

                                            if(is_stock){
                                                produit_dealer.stock.quantite = containerStockDispo
                                            }else{
                                                produit_dealer.stock.erreur =  message_stock
                                            }

                                            var deal_infos = {
                                                "id_produit_dealer" : "" +produit_dealer._id,
                                                "id_dealer" : produit_dealer.id_dealer,
                                                "id_lieu_vente" : produit_dealer.id_lieu_vente,
                                                "infos_dealer" : produit_dealer.infos_dealer,
                                                "infos_lieu_vente" : {
                                                    "quartier": produit_dealer.infos_lieu_vente.quartier,
                                                    "avenue": produit_dealer.infos_lieu_vente.avenue,
                                                    "numero": produit_dealer.infos_lieu_vente.numero,
                                                    "reference": produit_dealer.infos_lieu_vente.reference,
                                                    "type": produit_dealer.infos_lieu_vente.type,
                                                    "flag": produit_dealer.infos_lieu_vente.flag,
                                                    "coordonnees": produit_dealer.infos_lieu_vente.coordonnees,
                                                    "commune" : {
                                                        "nom" : produit_dealer.infos_lieu_vente.commune.nom,
                                                        "localisation" : produit_dealer.infos_lieu_vente.commune.location,
                                                        "ville" : {
                                                            "nom" : produit_dealer.infos_lieu_vente.commune.ville.ville
                                                        }
                                                    }
                                                },
                                                "stock" : produit_dealer.stock ? produit_dealer.stock : 0,
                                                "prix_produit" : is_price? result_price : null
                                            }

                                            //deal_infos.produit = produit;

                                            callback(true, null, deal_infos)
                                        })
                                        
                                    }else{
                                        callback(false, message_adresse, null)
                                    }
                                })

                            }else{//Sinon les détails du compte client lié au dealer ne sont pas trouvés
                                callback(false, message_client, result_client);
                            }
                            
                        })

                    }else{
                        callback(false, "Aucun dealer ne correspond à l'identifiant <"+produit_dealer.id_dealer+">", null);
                    }
                }
            })
        }catch(exception){
            callback(false, "Une exception a été lévée lors de la recherche du dealer <"+produit_dealer.id_dealer+"> : "+exception, null)
        }
    })
}

/**
 * La fonction permettant de rechercher les détails d'un dealer.
 * Elle est dédiée au dealer ayant effectué une nouvelle opération.
 */
module.exports.findOneByIdForOperation = function(operation, callback) {
    
    try{

        var _id = require("mongodb").ObjectID(operation.id_dealer),
            filter = {"_id" : _id},
            project ={"id_client" : 1};

        collection.value.findOne(filter, project, function(errDealer, resultDealer) {
            if(errDealer){
                callback(false, "Une erreur est survenue lors de la recherche du dealer <"+operation.id_dealer+"> : "+errDealer, operation)
            }else{
                if(resultDealer){

                    var short_dealer = {
                        "_id" : resultDealer._id,
                        "id_client" : resultDealer.id_client
                    }
                    //On recupère les détails du compte client du dealer
                    var client_dao = require("./client_dao");
                    client_dao.initialize(db_js);

                    client_dao.getOneByIdFromDealer(short_dealer, function(is_client, message_client, result_client) {
                        
                        if(is_client){
                            operation.infos_dealer = result_client
                        }

                        callback(is_client, message_client, operation);
                    })

                }else{
                    callback(false, "Aucun dealer ne correspond à l'identifiant <"+operation.id_dealer+">", operation);
                }
            }
        })
    }catch(exception){
        callback(false, "Une exception a été lévée lors de la recherche du dealer <"+id_dealer+"> : "+exception, operation)
    }
}