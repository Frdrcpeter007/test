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

    collection.value = db_js.get().collection("operation_produit");
}

/**
 * La fonction qui permet de créer une opération produit
 */
module.exports.create = function (new_operation_produit, callback) {

    try { //Si ce bloc passe

        //On appele la méthode insertOne (une methode propre à mongoDB) de notre collection qui doit prendre la structure de l'entité
        collection.value.insertOne(new_operation_produit, function (err, result) {

            //On test s'il y a erreur
            if (err) {
                callback(false, "Une erreur est survénue lors de la création de l'opération", "" + err);
            } else { //S'il n'y a pas erreur

                //On vérifie s'il y a des résultat renvoyé
                if (result) {
                    callback(true, "Opération créé avec succès", result.ops[0])
                } else { //Si non l'etat sera false et on envoi un message
                    callback(false, "Désolé, la création de cet opération a échoué")
                }
            }
        })

    } catch (exception) { //Si ce bloc ne passe pas on lève une exception
        callback(false, "Une exception a été lévée lors de la création du client : " + exception);
    }
}

/**
 * La fonction permettant à un dealer de soumettre un produit dans le système
 */
module.exports.submitProductByDealer= function(id_produit, quantite, id_dealer, id_lieu_vente, id_prod_deal_prix, new_prod_deal_prix, callback) {
    
    //Primo, on recherche le produit
    var produit_dao = require("./produit_dao");

    produit_dao.initialize(db_js);
    
    produit_dao.findOneByIdForSubmitingOperation(id_produit, function (isProductFound, messageProduct, resultProduct) {
        
        if(isProductFound){//Si le produit existe dans la bd : 

            try { //Si ce bloc passe

                //Puisqu'il s'agit d'une opération de vente, il nous faut joindre le produit au dealer
                //si bien sûr c'est la première vente
                var produit_dealer_dao = require("./produit_dealer_dao"),
                    produit_dealer_entity = require("./entities/produit_dealer_entity").ProduitDealer();
                
                produit_dealer_entity.id_dealer = id_dealer;
                produit_dealer_entity.id_produit = id_produit;
                produit_dealer_entity.id_lieu_vente = id_lieu_vente;
                produit_dealer_entity.etat = true;
                produit_dealer_entity.date = new Date();

                produit_dealer_dao.initialize(db_js);
                produit_dealer_dao.create(produit_dealer_entity, function(is_prod_deal, message_prod_deal, result_prod_deal) {    

                    if(is_prod_deal){//Si le produit est lié au dealer

                        //On recupère l'id produit_dealer
                        new_prod_deal_prix.id_produit_dealer = ""+result_prod_deal._id;

                        //On vérifie si le dealer a renseigné ou repris le prix
                        var prod_deal_prix_dao = require("./produit_dealer_prix_dao");
                        
                        prod_deal_prix_dao.initialize(db_js);
                        prod_deal_prix_dao.checkOrCreate(id_prod_deal_prix, new_prod_deal_prix, id_dealer,
                        function(is_price_checked, message_check_price, result_price) {

                            if(is_price_checked){//Si le prix est vérifié

                                //On procède donc à l'augmentation de la quantité
                                var new_operation = require("./entities/operation_produit_entity").OperationProduitVente();
                                
                                new_operation.id_produit = id_produit;
                                new_operation.type = "vente";
                                new_operation.id_produit_dealer_prix = result_price;
                                new_operation.quantite = quantite;
                                new_operation.id_dealer = id_dealer;
                                new_operation.date = new Date();
                                new_operation.validation  = false;
                                new_operation.etat  = "attente";
                                new_operation.id_produit_dealer = ""+result_prod_deal._id;
                                new_operation.id_lieu_vente = id_lieu_vente;                        

                                //On recupère l'identifiant de la commune de vente
                                var adresse_dao = require("../Models/adresse_dao");
                                adresse_dao.initialize(db_js);
                                adresse_dao.findOneById(id_lieu_vente, function (isAddressFound, messageAddress, resultAddress) {
                                    
                                    if(isAddressFound){//Si l'adresse est trouvée

                                        new_operation.id_commune = resultAddress.id_commune;

                                        //On appele la méthode insertOne (une methode propre à mongoDB) de notre collection qui doit prendre la structure de l'entité
                                        collection.value.insertOne(new_operation, function (err, result) {
                                
                                            //On test s'il y a erreur
                                            if (err) {
                                                callback(false, "Une erreur est survénue lors de la création de l'opération", "" + err, null);
                                            } else { //S'il n'y a pas erreur
                                
                                                //On vérifie s'il y a des résultat renvoyé
                                                if (result) {

                                                    //On notifie les agents en charge de la commune d'où a été soumis le produit
                                                    var notification_dao = require("./notification_dao"),
                                                        notification_entity = require("../Models/entities/notification_entity").Notification();

                                                    notification_entity.date = new Date();
                                                    notification_entity.flag = false;
                                                    notification_entity.type = "vente";
                                                    notification_entity.id_auteur = new_operation.id_dealer;
                                                    notification_entity.id_objet = ""+result.ops[0]._id;
                                                    notification_dao.createForAgentAfterDealerSubmitingProduct(notification_entity, result.ops[0].id_commune,
                                                    function(is_notified, message_notification, result_notification) {
                                                        
                                                        if(!is_notified){//Si la création des notifications n'a pas aboutie, on en informe les administrateurs.
                                                            var admin_notification = require("../Models/entities/notification_entity").Notification();
                                                            admin_notification.date = new Date();
                                                            admin_notification.flag = false;
                                                            admin_notification.type = "alerte_systeme";
                                                            admin_notification.id_auteur =  new_operation.id_dealer;
                                                            admin_notification.id_objet = ""+result.ops[0]._id;

                                                            var notification_message = "La création des notifications destinées aux agents après la soumission du produit n'a pas abouti. Cause : "+message_notification;
                                                            notification_dao.createForAdminSystem(admin_notification,notification_message)
                                                        }

                                                        callback(true, null, result.ops[0]);
                                                    })
                                                    
                                                } else { //Si non l'etat sera false et on envoi un message
                                                    callback(false, "Désolé, la création de cet opération a échoué", null)
                                                }
                                            }
                                        })

                                    }else{//Sinon l'adresse indiquant le lieu de vente n'est pas correcte
                                        callback(false, messageAddress, null)
                                    }
                                });

                            }else{//Si non le prix n'a pas été renseigné
                                callback(false, message_check_price, null)
                            }   
                        }) 
                        
                    }else{//Sinon le produit n'est pas lié au dealer
                        callback(false, message_prod_deal, null)
                    }
                })
        
            }catch (exception) { //Si ce bloc ne passe pas on lève une exception
                callback(false, "Une exception a été lévée lors de la création du client : " + exception, null);
            }

        }else{//Sinon le produit demandé n'existe pas dans la bd : 
            callback(false, messageProduct, null);
        }
    })
}

/**
 * La fonction qui permet de recuperer une opération produit faite par un dealer
 * suivant un produit spéfique
 * @param {*} id_produit Identifiant du produit
 * @param {Function} callback Fonction de retour
 */
module.exports.getAllProductForIdDealer = function (id_produit, callback) {

    try {

        var filter = {
            "id_produit": id_produit,
            "id_dealer": {
                "$exists": 1
            }
        };

        collection.value.findOne(filter, function (err, result) {

            if (err) {
                callback(false, "Une erreur est survenue lors de la recherche d'une opération produit portant sur le dealer : " + err);
            } else {

                if (result) {
                    callback(true, result);
                } else {
                    callback(false, "Aucune opération produit ne correspond aux critères de recherche portant sur le dealer pour le produit : " + id_produit);
                }
            }
        })

    } catch (exception) {

        callback(false, "Une exception a été lévée lors de la recherche d'une opération produit portant sur le dealer : " + exception);
    }
}

/**
 * Cette fonction permet de retourner tous les produits soumis par un dealer
 * @param {*} id_client_dealer L'identifiant du dealer
 * @param {Function} callback Une fonctionde retour 
 */
module.exports.getSubmittedProductsByIdDealer = function (id_client_dealer, callback) {
    try {
        var dealerDao = require("./dealer_dao");
        dealerDao.initialize(db_js);

        dealerDao.findOneByIdClient(id_client_dealer, function (isFound) {

            if (isFound) {

                collection.value.find({
                    "id_dealer": id_client_dealer,
                    "type" : "vente"
                }).toArray(function (err, result) {

                    if (err) {
                        callback(false, "Une erreur est survénue lors de la recherche des produits du dealer " + err, null)
                    } else {

                        if (result.length > 0) {
                            //callback(true, "Les commandes de ce client ont été renvoyées avec succès", result)

                            var sortieOperation = 0,
                                produit_dao = require("./produit_dao"),
                                returnListWithProductsDetails = [];


                            produit_dao.initialize(db_js);

                            
                            for (var indexOperation = 0; indexOperation < result.length; indexOperation++) {

                                
                                produit_dao.getAllProductHandlerDealer(result[indexOperation], function (isFound, resultOperation) {

                                    sortieOperation++;

                                    if (isFound) {
                                        result.id_produit = resultOperation;
                                        returnListWithProductsDetails.push(resultOperation);
                                    }

                                    if (sortieOperation == result.length) {                                        

                                        //On recherche la quantité du produit en stock

                                        var soriteCounting = 0,
                                            listSortieCounting = [];

                                        for (let indexOperationDetails = 0; indexOperationDetails < returnListWithProductsDetails.length; indexOperationDetails++) {
                                            
                                            module.exports.countReserveStockByProductIdForAdmin(returnListWithProductsDetails[indexOperationDetails], 
                                            function(isCount, messageCount, resultcounted) {
                                                
                                                soriteCounting++;

                                                if(!isCount){
                                                    resultcounted.quantiteStockDispo = null;
                                                    resultcounted.quantiteStockDispo = 0;
                                                    resultcounted.erreurQuantiteStockDispo = null;
                                                    resultcounted.erreurQuantiteStockDispo = messageCount;
                                                }

                                                listSortieCounting.push(resultcounted);

                                                if(soriteCounting == returnListWithProductsDetails.length){
                                                    callback(true, "Tous les produits gérer par ce dealer ont été renvoyés avec succès", listSortieCounting);
                                                }

                                            })
                                        }
                                        
                                    }
                                })

                            }

                        } else {
                            callback(false, "Ce dealer n'a aucun produit à gérér",null)
                        }
                    }
                })
            } else {
                callback(false, "Ce dealer n'existe pas",null);
            }
        })
    } catch (exception) {
        callback(false, "Une exception a été lévée lors de la recherche des produits de ce dealer : " + exception)
    }
}

/**
 * La fonction permettant d'afficher tous les produits d'un dealer
 */
module.exports.getAllProductByIdDealer = function(id_client_dealer, callback) {
    
    try{

        collection.value.aggregate([
            {"$match" : 
                {"type" : "vente", "id_dealer" : id_client_dealer}
            },
            {"$group" : 
                {"_id" :"$id_produit"}
            },
            {"$project" : {"id_produit" : '$_id'}
            }
        ]).toArray(function(errProduct, resultProduct) {
            
            if(errProduct){
                callback(false, "Une erreur est survenue lors du listage de produits du dealer : "+errProduct, null);
            }else{
                if(resultProduct.length > 0){
                    
                    var produit_dao = require("./produit_dao"),
                        sortieProduit = 0,
                        listeProduit = [];
                    produit_dao.initialize(db_js);

                    for (let indexProduit = 0; indexProduit < resultProduct.length; indexProduit++) {

                        produit_dao.findOneByIdForAllProductByDealer(resultProduct[indexProduit], 
                        function(isProductFoundWithDetails, messageProductDetails, resultProductDetails) {
                            
                            sortieProduit++;

                            listeProduit.push(resultProductDetails);

                            if(sortieProduit == resultProduct.length){
                                if(listeProduit.length > 0){
                                    callback(true,null, listeProduit)
                                }else{
                                    callback(false, "Aucun produit n'a été trouvé", null);
                                }
                            }

                        })          
                    }

                }else{
                    callback(false, "Le dealer <"+id_client_dealer+"> n'a soumis aucun produit", null);
                }
            }
        })
        
    }catch(exception){
        callback(false, "Une exception a été lévée lors du listage de produits du dealer : "+exception, null);
    }
}

/**
 * La fonction qui permet de trouver une opération par l'id du produit pour un dealer
 */
module.exports.findOneByIdProduitForIdDealer = function (id_produit, callback) {
    try {
        var filter = {
            "id_produit": id_produit
        };

        collection.value.findOne(filter, function (err, result) {
            if (err) {
                callback(false, "Une erreur est survénue lors de la recherche de l'identifiant du dealer pour ce produit : " + err)
            } else {
                if (result) {

                    callback(true, "Il existe un dealer pour ce produit", result)
                } else {
                    callback(false, "Aucun dealer pour ce produit", null)
                }
            }
        })
    } catch (exception) {
        callback(false, "Une exception a été lévée lors de la recherche de l'identifiant du dealer pour ce produit : " + exception)
    }
}

/**
 * Cette fonction permet de récupérer 4 récents produits
 * @param {*} id_client L'identifiant de l'utilisateur
 * @param {Function} callback La fonction de retour
 */
module.exports.getNewProduct = function (id_client, limit, callback) {
    try {

        var request = null;

        if(limit == null){
            request = [{
                    "$match": { //On ne récupère que ceux dont le type est vente
                        "type": "vente",
                        "validation" : true,
                        "etat" : "encours"
                    }
                },
                {
                    "$group": {
                        "_id": {
                            "date": "$date"
                        },
                        "operation" :{
                            "$addToSet": {
                                "id_operation" : "$_id",
                                "id_produit": "$id_produit",
                                "id_dealer": "$id_dealer",
                                "id_produit_dealer_prix": "$id_produit_dealer_prix",
                                "id_lieu_vente": "$id_lieu_vente",
                                "id_produit": "$id_produit",
                                "id_commune": "$id_commune"
                            }
                        }
                    }
                },
                {
                    "$sort": {
                        "_id.date": -1
                    }
                }
            ]
        }else{
            request = [{
                    "$match": { //On ne récupère que ceux dont le type est vente
                        "type": "vente",
                        "validation" : true,
                        "etat" : "encours"
                    }
                },
                {
                    "$group": {
                        "_id": {
                            "date": "$date"
                        },
                        "operation" :{
                            "$addToSet": {
                                "id_operation" : "$_id",
                                "id_produit": "$id_produit",
                                "id_dealer": "$id_dealer",
                                "id_produit_dealer_prix": "$id_produit_dealer_prix",
                                "id_lieu_vente": "$id_lieu_vente",
                                "id_produit": "$id_produit",
                                "id_commune": "$id_commune"
                            }
                        }
                    }
                },
                {
                    "$sort": {
                        "_id.date": -1
                    }
                },
                {
                    "$limit": limit
                }
            ]
        }
        
        //Une aggrégation pour la récupération des élément suvant les dates les plus récents
        collection.value.aggregate(request).toArray(function (err, resultNewProduit) {
            if (err) {
                callback(false, "Une erreur est survénue lors de la récupération des produits récent : " + err);
            } else {

                if (resultNewProduit.length > 0) {
                    //callback(true, "Les produits sont renvoyé", resultNewProduit)

                    var produit_dao = require("./produit_dao"),
                        listSortieOperation = [],
                        sortieOperation = 0;

                    produit_dao.initialize(db_js);

                    for (let indexOperation = 0; indexOperation < resultNewProduit.length; indexOperation++) {
                        produit_dao.findOneByIdFromOperation(id_client, resultNewProduit[indexOperation], function (isFound, result) {

                            sortieOperation++;

                            if (isFound) {
                                listSortieOperation.push(result)
                            }

                            if (sortieOperation == resultNewProduit.length) {

                                if (listSortieOperation.length > 0) {
                                    callback(true, listSortieOperation)
                                } else {
                                    callback(false, "Aucun produit n' a été trouvé")
                                }
                            }

                        })

                    }
                    
                } else {
                    callback(false, "Aucun nouveau produit répérer")
                }
            }
        })
    

    } catch (exception) {
        callback(false, "Une exception a été lévée lors de la récupération des 4 récents produits : " + exception)
    }
}

/**
 * La fonction qui permet d'avoir la quantité de produits mis en vente par le dealer
 */
module.exports.countOperationByIdDealer = function (id_dealer, callback) {

    if (id_dealer) {

        //On commence par trouver le dealer
        var dealerDao = require("./dealer_dao");
        dealerDao.initialize(db_js);
        dealerDao.findOneByIdClient(id_dealer, function (isFound, resultDealer) {

            if (isFound) { //Si le dealer a été trouvé


                collection.value.aggregate([{
                        "$match": {
                            'id_dealer': id_dealer
                        }
                    },
                    {
                        "$group": {
                            "_id": "$id_dealer",
                            "total": {
                                "$sum": "$quantite"
                            }
                        }
                    }
                ]).toArray(function (err, result) {

                    if (err) {
                        callback(false, "Une erreur est survenue lors du comptage de produits vendus par le dealer")
                    } else {
                        if (result.length > 0) {
                            callback(true, result[0].total)
                        } else {
                            callback(false, "Aucun produit fourni par le dealer")
                        }
                    }
                })

            } else { //Si non le dealer n'a pas été trouvé
                callback(false, resultDealer)
            }
        })

    } else {
        callback(false, "L'id dealer fourni n'est pas valide")
    }
}


/**
 * La fonction permettant de compter les opérations en attente de validation.
 * Elle est utilisée à l'administration
 */
module.exports.countPendindOperationForAdmin = function (callback) {
    
    var filter = {"id_dealer" : {"$exists" : 1}, "validation" : false};

    try{

        collection.value.count(filter, function (err, result) {
            
            if(err){
                callback(false, "Une erreur est survenue lors du comptage d'opération produit en attente de validation : "+err);
            }else{
                if(result > 0){
                    callback(true, result)
                }else{
                    callback(false, "Aucun produit n'est en attente.");
                }
            }
        })

    }catch(exception){

        callback(false, "Une exception a été lévée lors du comptage d'opération produit en attente de validation : "+exception);
    }
}

/**
 * La fonction permettant de mettre à jour la propriété validation d'une opération
 * Elle est utilisée dans l'administration
 */
module.exports.updateValidationValueForAdmin = function (id_operation, id_agent, callback) {
    
    try{

        var _id = require("mongodb").ObjectID(id_operation),
        filter ={
            "_id" : _id
        };

        //On recherche d'abord l'opération associée
        collection.value.findOne(filter, function (errFindOperation, resultFindOperation) {
            
            if(errFindOperation){
                callback(false, "Une erreur est survenue lors de la recherche de l'opération produit à mettre à jour dont l'identifiant est '"+id_operation+"' : "+exception);
            }else{

                if(resultFindOperation){//Si l'opération est trouvée

                    if(resultFindOperation.etat != "fini"){

                        var currentValidationValue = resultFindOperation.validation,
                            newValidationValue = !currentValidationValue,
                            update = {
                                "$set" : {
                                    "validation" : newValidationValue
                                }
                            };
                            
                            //On met à jour la propriété "validation"
                            collection.value.updateOne(filter,update, function (errUpdateOperation, resultUpdateOperation) {
                                
                                if(errUpdateOperation){
                                    callback(false, "Une erreur est survenue lors de la mise à jour de la propriété validation de l'opération produit '"+id_operation+"' : "+errUpdateOperation)
                                }else{

                                    createFromAdmin(id_operation, id_agent, newValidationValue, function(isOperationCreated, messageOperation, resultOperation) {
                                        
                                        //On verifie/met à jour le flag du produit
                                        var produit_dao = require("./produit_dao");
                                        produit_dao.initialize(db_js);

                                        produit_dao.updateFlagForAdmin(resultFindOperation.id_produit, true, 
                                        function(is_prod_flag, message_prod_flag, result_prod_flag) {
                                            
                                            var notification_dao = require("./notification_dao"), 
                                                notification_entity = require("../Models/entities/notification_entity").Notification();
                                            notification_dao.initialize(db_js);

                                            if(is_prod_flag){

                                                //On notifie de la mise à jour au dealer concerné par ladite opération
                                                
                                                notification_entity.date = new Date();
                                                notification_entity.flag = false;
                                                notification_entity.id_auteur = id_agent;
                                                notification_entity.id_objet = id_operation;
                                                notification_entity.id_recepteur = resultFindOperation.id_dealer;
                                                notification_entity.type = "update_validation_operation_vente";

                                                
                                                notification_dao.createForUpdateOperation(notification_entity, 
                                                function(is_notified, notification_message, notification_result) {
                                                console.log(notification_message);    
                                                });
                                                
                                            }else{
                                               
                                                notification_entity.date = new Date();
                                                notification_entity.flag = false;
                                                notification_entity.id_auteur = id_agent;
                                                notification_entity.id_objet = id_operation;
                                                notification_entity.type = "alerte_systeme";

                                                notification_dao.initialize(db_js);
                                                notification_dao.createForAdminSystem(notification_entity, message_prod_flag);
                                            }

                                            callback(isOperationCreated, messageOperation, resultOperation)
                                        })
                                    })

                                }
                            })
                    }else{
                        callback(false, "La mise à jour de la propriété validation a échoué car l'état de l'opération produit est 'fini'", null);
                    }

                }else{//Sinon l'opération n'est pas trouvée
                    callback(false, "Aucune opération produit ne correspond à l'identifiant '"+id_operation+"' passé pour l'opération produit à mettre à jour", null);
                }
            }
        })

    }catch(exception){

        callback(false, "Une exception a été lévée lors de la mise à jour de la propriété validation de l'opération produit '"+id_operation+"' : "+exception, null);
    }
}

/**
 * La fonction permettant de créer une opération à partir de l'administrattion. 
 * Elle sert juste à rétracer les mouvements des admiministrateurs sur les validations des produits
 * postés par les dealers
 */
function createFromAdmin(id_operation, id_agent, valeur_validation, callback) {
    
    try{

        var new_operation = require("./entities/operation_produit_entity").OperationProduitAdmin();

        new_operation.id_operation = id_operation;
        new_operation.type = "validation_vente";
        new_operation.id_agent = id_agent;
        new_operation.date = new Date();
        new_operation.valeur_validation = valeur_validation;

        //On recupère le lieu de vente et la commune
        var _id_recherche = require("mongodb").ObjectID(id_operation),
            filter_recherche = {"_id" : _id_recherche};
        collection.value.findOne(filter_recherche, function(err_recherche, result_recherche) {
            if(err_recherche){
                callback(false, "Une erreur est survenue lors de la recherche de l'opération <"+id_operation+"> pour la mise à jour de l'état : "+err, null);
            }else{
                if(result_recherche){
                    new_operation.id_lieu_vente = result_recherche.id_lieu_vente;
                    new_operation.id_commune = result_recherche.id_commune;

                    //A ce stade de l'opération on enregistre l'opération "validation_vente"
                    collection.value.insertOne(new_operation, function (err, result) {
                        
                        if(err){
                            callback(false, "Une erreur est survenue lors de la création d'une opération produit : "+err);
                        }else{//Si l'enregistrement de l'opéaration est effectué avec succès, on procède à la mise à jour 
                            //de l'état de cette opération.
            
                            var _id = require("mongodb").ObjectID(id_operation),
                                filter = {
                                    "_id" : _id
                                };
                            
                            collection.value.findOne(filter, function (errMatched, resultMatched) {
                                
                                if(errMatched){
                                    callback(false, "Une erreur est survenue lors de la recherche de l'opération <"+id_operation
                                    +"> pour la mise à jour de son état", null);
                                }else{
            
                                    if(resultMatched){//Si l'opération est trouvée
            
                                        var etat = null;
            
                                        if(resultMatched.etat == "attente"){
                                            etat = "encours"
                                        }else{
                                            etat = "encours"
                                        }
            
                                        var update = {
                                            "$set" : {
                                                "etat" : etat
                                            }
                                        };
            
                                        collection.value.updateOne(filter, update, function (errUpdate, resultUpdate) {
                                            if(errUpdate){
                                                callback(false, "Une erreur est survenue lors de la mise à jour de l'état de l'opération <"+id_operation+"> : "+errUpdate, null)
                                            }else{
                                                callback(true, null,  "La mise à jour à réussie");
                                            }
                                        })
                            
                                    }else{
                                        callback(false, "Aucune opération ne correspond à l'identifiant suivant : "+id_operation, null);
                                    }
                                }
                            })
                        }
                    })
                }else{
                    callback(false, "Aucune opération vente ne correpondant à l'identifiant <"+id_operation+"> n'a été trouvée pour la mise à jour de son état", null);
                }
            }
        })

    }catch(exception){
        callback(false, "Une exception a été lévée lors de la création d'une opération produit : "+exception, null);
    }
}

/**
 * La fonction qui permet de créer une opération produit,
 * elle est utilisée dans la fonction "create" de la DAO "Commande"
 */
module.exports.createFromCommande = function(new_operation, callback) {

    
    collection.value.insertOne(new_operation.operation, function (err, result) {
        
        if(err){
            callback(false, "Une erreur est survenue lors de la création d'une opération produit : "+err);
        }else{

            //
            if(new_operation.stock_dispo == new_operation.operation.quantite){

                var _id = require("mongodb").ObjectID(""+new_operation.operation.id_operation_vente),
                    filter = {
                        "_id" : _id
                    },
                    update = {
                        "$set" : {"etat" : "fini"}
                    };
                
                collection.value.updateOne(filter,update,function (errUpdate, resultUpdate) {
                    
                    if(errUpdate){
                        callback(false,"Une erreur est survenue lors de la mise à jour de l'état de l'opération vente <"+
                        new_operation.operation.id_operation_vente+">: "+errUpdate, null);
                    }else{
                        callback(true, null, "L'état de l'opération <"+new_operation.operation.id_operation_vente+"> a été mise à jour correctement");
                    }
                })
                
            }else{
                callback(true, null, result.ops[0])
            }
            
        }
    })
    
}

/**
 * La fonction permettant de compter la quantité des réserves en stock d'un produit
 * Elle est utilisée dans l'administratrion
 */
module.exports.countReserveStockByProductIdForAdmin = function(objet, callback) {
    
    try{

        var id_produit,
            match;

        if(typeof(objet) == "string"){
            id_produit = objet;
            match = {
                "id_produit" : id_produit,
                "type" : "vente",
                "validation" : true,
                "etat" : "encours"
            };
            
        }else{

            if(objet._id){
                id_produit = ""+objet._id;
            }else{
                id_produit = objet.id_produit;
            }
            
            //var _id = require("mongodb").ObjectID(id_produit);

            match = {
                "id_produit" : id_produit,
                "type" : "vente",
                "validation" : true,
                "etat" : "encours"
            };
        }

        //On commence d'abord par vérifier les réserves en cours
        collection.value.aggregate([
            {"$match": match
            },
            {"$sort":{
                    "date" : -1
                }
            },
            {"$group" : 
                {
                    "_id" : "$id_produit",
                    "operations" : {
                            "$addToSet" : {
                                    "_id" : "$_id",
                                    "quantite" : "$quantite"
                                }
                        },
                    "quantite_reserve" : {"$sum" : "$quantite"}
                }
            },
            {"$project" : {
                    "_id" : 0,
                    "id_produit" : "$_id",
                    "operations" : "$operations",
                    "quantite_reserve" : "$quantite_reserve"
                }
            }
        ]).toArray(function(errQuantiteReserve, resultQuantiteReserve) {
            
            if(errQuantiteReserve){//Si une erreur survenait lors de la recherche des réserves encours
                callback(false, "Une erreur est survenue lors du comptage du stock en reserve du produit <"+
                    id_produit+"> : "+errQuantiteReserve);
            }else{

                if(resultQuantiteReserve.length > 0){//Si au moins une réserve encours et valide est trouvée

                    //Pour chaque opération vente issue de la recherche des réserves valides et encours,
                    //on doit rechercher les ventes correspondantes afin de ressortir les restes en stock

                    var sortieOperationVente = 0,
                        quantiteStockVendu = 0;
                    for (let indexOperationVente = 0; indexOperationVente < resultQuantiteReserve[0].operations.length; indexOperationVente++) {               
                        collection.value.aggregate([
                            {"$match" : {
                                    "type" : "achat",
                                    "id_operation_vente" : ""+resultQuantiteReserve[0].operations[indexOperationVente]._id
                                }
                            },
                            {"$sort": {"date" : -1}
                            },
                            {"$group":{
                                "_id" : "$id_produit",
                                "quantite_vendue" : {"$sum" : "$quantite"}
                            }
                            }
                        ]).toArray(function(errQuantiteAchat, resultQuantiteAchat) {
                            
                            //On incrémenete la variable de sortie de la boucle
                            sortieOperationVente++;

                            if(errQuantiteAchat){//Si une erreur survenait lors du comptage des opérations achat liées à une opération vente,
                                                //cela sousentend que l'intégralité de la vérifications d'opérations vente à vérifier est fausse
             
                                if(typeof(objet) == "string"){
                                    callback(false, "Une erreur est survenue lors du comptage de produits vendus de la réserve de vente <"+
                                                        resultQuantiteReserve[0].operations[indexOperationVente - 1]+"> : ")
                                }else{
                                    callback(false, "Une erreur est survenue lors du comptage de produits vendus de la réserve de vente <"+
                                    resultQuantiteReserve[0].operations[indexOperationVente - 1]+"> : ", objet)
                                }

                            }else{

                                if(resultQuantiteAchat.length > 0){//Si au moins une opération achat a été trouvée
                                    quantiteStockVendu += resultQuantiteAchat[0].quantite_vendue;

                                }

                                //On vérifie la condition de sortie de la boucle de vérification vente
                                if(sortieOperationVente == resultQuantiteReserve[0].operations.length){

                                    var quantiteStockDispo = resultQuantiteReserve[0].quantite_reserve - quantiteStockVendu;

                                    if(quantiteStockDispo >= 0){

                                        if(typeof(objet) == "string"){
                                            callback(true, quantiteStockDispo);
                                        }else{
                                            objet.quantiteStockDispo = null;
                                            objet.quantiteStockDispo = quantiteStockDispo;
                                            callback(true,null, objet);
                                        }
                                        
                                    }else{

                                        if(typeof(objet) == "string"){
                                            callback(false, "La quantité en stock est de <"+quantiteStockDispo+">, elle n'est pas valide")
                                        }else{
                                            callback(false, "La quantité en stock est de <"+quantiteStockDispo+">, elle n'est pas valide", objet)
                                        }
                                        
                                    }
                                    
                                }
                            }

                        })
                    }

                }else{//Sinon aucune réserve encours et valide n'a été trouvée
                  

                    if(typeof(objet) == "string"){
                        callback(false, "Aucune réserve encours, ni valide n'a été trouvée pour le produit <"+id_produit+">")
                    }else{
                        callback(false, "Aucune réserve encours, ni valide n'a été trouvée pour le produit <"+objet.id_produit+">", objet)
                    }
                }
            }
        })

    }catch(exception){

            if(typeof(objet) == "string"){
                callback(false, "Une exception a été lévée lors du comptage du stock en reserve du produit <"+id_produit+"> : "+exception)
            }else{
                callback(false, "Une exception a été lévée lors du comptage du stock en reserve du produit <"+objet.id_produit+"> : "+exception, objet)
            }
    }
}

/**
 * La fonction permettant de lister toutes les opérations achats suivant une commande,
 * elle est utilisée  dans la fonction "getOneByIdForAdmin" de la DAO "commande"
 */
module.exports.getAllAchatByIdCommande = function(commande, callback) {
    
    var filter = {
        "id_produit" : null,
        "type" : "achat",
        "id_commande" : ""+commande._id
    },
    listWithOperation = [],
    sortieOperation = 0;

    commande.produit.forEach((produit, index_produit, tab_produit) => {
        
        findListAchatById(produit, filter, function(isListMatched, resultList) {
            
            sortieOperation++;

            listWithOperation.push(resultList);

            //On test la condition de sortie de la boucle
            if(sortieOperation == tab_produit.length){

                commande.produit = [];

                for (let indexProduit = 0; indexProduit < listWithOperation.length; indexProduit++) {
                    var produit = listWithOperation[indexProduit];
                    commande.produit.push(produit)
                }
                callback(true, commande)
            }
        })
    });

}

function findListAchatById(produit, filter, callback) {
    
    try{

        filter.id_produit = produit.id_produit;

        produit.sortie_stock = [];
        produit.message_erreur_sortie_stock = null;

        collection.value.find(filter).toArray(function(err, resultOperation) {
            
            if(err){
                produit.message_erreur_sortie_stock = "Une erreur est survenue lors de la recheche des <opérations achats> correspondants à la commande <"+
                    filter.id_commande+"> : "+err;
    
                callback(true, produit)
            }else{

                if(resultOperation.length > 0){

                    for (let indexOperation = 0; indexOperation < resultOperation.length; indexOperation++) {

                        var operation = {
                            "id_operation_vente" : resultOperation[indexOperation].id_operation_vente,
                            "id_operation_sortie" : ""+resultOperation[indexOperation]._id,
                            "quantite_sortie" : resultOperation[indexOperation].quantite,
                            "date" : resultOperation[indexOperation].date
                        };

                        produit.sortie_stock.push(operation)                        
                    }

                    callback(true, produit)
                }else{

                    produit.message_erreur_sortie_stock ="Il semble qu'aucune opération de sortie correspondant aux critères =>"+
                        filter+", n'a été trouvée";

                    callback(true, produit);
                }
            }
        })

    }catch(exception){
        produit.message_erreur_sortie_stock = "Une exception a été lévée lors de la recheche des <opérations achats> correspondants à la commande <"+
            filter.id_commande+"> : "+exception;

        callback(true, produit)
    }
}

/**
 * La fonction permet de tester si le produit qui lui est soumis appartient au dealer qui lui est aussi soumis
 */
module.exports.checkIfProductIsForDealer = function (produit, id_dealer, callback) {
    try {
        var filter = {
            "id_produit": produit._id,
            "id_dealer": id_dealer
        };
        
        collection.value.aggregate([
            {
                "$match": filter
            }
        ]).toArray(function (err, result) {
            if (err) {
                callback(false, "Une erreur est survenue lors du test de ce produit : " + err)
            } else {
                if (result.length > 0) {
                    callback(true, "Le produit appartient à ce dealer", produit)
                } else {
                    callback(false, "Ce produit n'appartient pas à ce dealer", {count: 0})
                }
            }
        })
    } catch (exception) {
        callback(false, "Une exception a été lors du test de ce produit : " +exception)
    }
}

/**
 * La fonction qui permet de compter les nombres d'opérations ventes d'un dealer
 */
module.exports.countAllSubmittedProductForDealer = function (id_dealer, callback) {
    try {
        var dealerDao = require("./dealer_dao");
        dealerDao.initialize(db_js);
        
        dealerDao.findOneByIdClient(id_dealer, function (isFound, messageDealer, resultDealer) {
            if (isFound) {
                collection.value.aggregate([
                    {
                        "$match": {
                            "id_dealer": id_dealer,
                            "type": "vente"
                        }
                    },
                    {
                        "$count" : "nbre"
                    }
                ]).toArray(function (err, result) {
                    if (err) {
                        callback(false, "Une erreur est survenue lors du comptage des produits du dealer : " +err, {nbre: 0})
                    } else {
                        if (result.length > 0) {
                            callback(true, "Le comptage est fini", result[0])
                        } else {
                            callback(false, "Le comptage est fini, et aucun produit trouvé", {nbre: 0})
                        }
                    }
                })
            } else {
                callback(false, messageDealer, {nbre: 0})
            }
        })
    } catch (exception) {
        callback(false, "Une exception a été lévée lors du comptage des produit du dealer : " +exception, {nbre: 0})
    }
}

/**
 * La fonction permettant de compter le nombre de produit liés à un dealer
 */
module.exports.countAllProductForDealer = function (id_dealer, callback) {
    try {
        var dealerDao = require("./dealer_dao");
        dealerDao.initialize(db_js);
        
        dealerDao.findOneByIdClient(id_dealer, function (isFound, messageDealer, resultDealer) {
            if (isFound) {
                collection.value.aggregate([
                    {"$match" : 
                        {"type" : "vente", "id_dealer" : id_dealer}
                    },
                    {"$group" : 
                        {"_id" :"$id_produit"}
                    },
                    {"$count" : "nbre"
                    }
                ]).toArray(function (err, result) {
                    if (err) {
                        callback(false, "Une erreur est survenue lors du comptage des produits du dealer : " +err, {nbre: 0})
                    } else {
                        if (result.length > 0) {
                            callback(true, "Le comptage est fini", result[0])
                        } else {
                            callback(false, "Le comptage est fini, et aucun produit trouvé", {nbre: 0})
                        }
                    }
                })
            } else {
                callback(false, messageDealer, {nbre: 0})
            }
        })
    } catch (exception) {
        callback(false, "Une exception a été lévée lors du comptage des produit du dealer : " +exception, {nbre: 0})
    }
}

/**
 * La fonction permettant de lister les opérations de validation d'un agent. 
 */
module.exports.getValidationOperationByIdAgentForAdmin = function(id_agent, gtValue, limit, callback) {
    
    try{

        limit = parseInt(limit);
        var filter  = {"type": "validation_vente", "id_agent" : id_agent};

        if(gtValue != "null"){
            var date_ = new Date(gtValue);

            filter["date"] =  {"$gt" : date_}
        }

        collection.value.find(filter)
        .sort({"date" : -1})
        .limit(limit)
        .toArray(function(errOperationValidation, resultListOperationValidation) {
            if(errOperationValidation){
                
                callback(false, "Une erreur est survenue lors de la recherche de la liste d'opérations validation des produits :"+errOperationValidation)
            
            }else{

                if(resultListOperationValidation.length > 0){

                    //Pour chaque opération vente, on doit chercher le nom du produit ainsi que celui du dealer

                    var listeSortieOperation = [],
                        sortieOperation = 0,
                        produit_dao = require("./produit_dao");

                    produit_dao.initialize(db_js);


                    resultListOperationValidation.forEach((operationValidation, indexOpValidation, tabOperationValidation) => {
                        
                        
                        //On recherche d'abord l'opération vente
                        var id_operation  = require("mongodb").ObjectID(""+operationValidation.id_operation),
                            filterOpVente = {"_id" :  id_operation};

                        collection.value.findOne(filterOpVente, function(errOpVente, resultOpVente) {
                                                       

                            //On recherche le produit
                            produit_dao.findOneByIdFromOperationVenteForAdmin(resultOpVente, function(isMatched, resultMatch) {
                                
                                resultMatch.valeur_validation = tabOperationValidation[sortieOperation].valeur_validation;
                                resultMatch.date = tabOperationValidation[sortieOperation].date;
                                sortieOperation++;

                                listeSortieOperation.push(resultMatch);

                                if(tabOperationValidation.length == sortieOperation){
                                    callback(true, listeSortieOperation);
                                }
                            })                          
                        })
                    });

                }else{
                    callback(false, "L'agent n'a validé aucune opération vente")
                }
            }
        })

    }catch(exception){
        callback(false, "Une exception a été lévée lors de la recherche de la liste d'opérations validation des produits :"+exception)
    }
}

/**
 * La fonction permettant d'avoir des informations sur la toute première opération vente 
 * d'un produit. Elle est utilisée dans la fonction "findOneByIdForAdmin" de la DAO "produit"
 */
module.exports.findInitialProductSalingByIdProductForAdmin = function(produit, callback) {
    
    produit.errorInitialSaling = null;

    try{

        collection.value.aggregate([
            {"$match" :
               {
                   "id_produit" : ""+produit._id,
                   "type" : "vente"
                } 
            },
            {"$sort" : 
                {"date" : 1}
            },
            {"$limit" : 1
            },
            {"$project" : 
                {
                    "_id" : 0,
                    "quantite" : 0,
                    "etat" : 0,
                    "validation" :0,
                    "type" : 0
                }
            }
        ]).toArray(function (errOpVente, resultOpVente) {
            
            if(errOpVente){
                produit.errorInitialSaling = "Une erreur est survenue lors de la recherche des infos sur l'opération vente initiale du produit : "+errOpVente;
                callback(false, produit);
            }else{
                if(resultOpVente.length > 0){//Si l'opération initiale est trouvée

                    produit.id_dealer = resultOpVente[0].id_dealer;
                    produit.date = resultOpVente[0].date;
                    callback(true, produit);

                }else{//Si non aucune opération n'a été trouvée
                    produit.errorInitialSaling = "Aucune opération vente initiale n'a été trouvée pour le produit <"+produit._id+">";
                    callback(false, produit);
                }
            }
        })
    }catch(exception){
        produit.errorInitialSaling = "Une exception a été lévée lors de la recherche des infos sur l'opération vente initiale du produit : "+exception;
        callback(false, produit);
    }
}

/**
 * La fonction permettant de lister les dealers liEs a un produit. 
 */
module.exports.getDealersForProduct = (id_produit, callback) => {
    try {
        collection.value.aggregate([
            {
                "$match": {
                    "id_produit": id_produit,
                    "type": "vente"
                }
            },
            {
                "$project": {
                    "_id": 0,
                    "id_dealer": 1
                }
            }
        ]).toArray((err, resultAggr) => {
            if (err) {
                callback(false, "Une erreur est survenue lors de la recherche de tous les dealer d'un produit : " +err)
            } else {
                
                if (resultAggr.length > 0) {
                    
                    callback(true, "Les dealer ont été renvoyé", resultAggr)
                } else {
                    callback(false, "Aucun dealer pour ce produit")
                }
            }
        })
    } catch (exception) {
        callback(false, "Une exception a été lévée lors de la recherche de tous les dealer d'un produit : " + exception)        
    }
}

/**
 * La fonction permettant de lister les opérations du type "vente" encours et suspendues 
 * pour un produit
 */
module.exports.getAllCurrentAvailableStockByIdProductForAdmin = (id_produit, callback) =>{

    try{

        //On commence par trouver les opérations vente qui sont soit encours, soit en attente. 
        var filterVente = {
            "id_produit" : id_produit,
            "type" : "vente",
            "etat" : {"$in" : ["encours", "attente"]}
        };

        collection.value.find(filterVente).toArray(function(err_opera_vente, result_opera_vente) {
            if(err_opera_vente){
                callback(false, "Une erreur est survenue lors du listage des opérations en stock du produit <"+id_produit+"> : "+err_opera_vente, null);
            }else{
                
                if(result_opera_vente.length > 0){

                }else{
                    callback(false, "Aucune opération vente encours, ni en attente n'a été trouvée pour le  produit <"+id_produit+">", null);
                }
            }
        })

    }catch(exception){
        callback(false, "Une exception a été lévée lors du listage des opérations en stock du produit <"+id_produit+"> : "+exception, null);
    }
}

/**
 * La fonction permettant de vérifier le stock encours du produit commandé.
 * Elle est utilisée dans le processus de validation de la commande par le client, 
 * lorsque l'utilisateur soumet le pannier.
 */
module.exports.checkAvailableProductByIdDealerAndIdProductForOrder = function(produit_commande, callback) {
    
    try{

        var listeOperationVente = [],
            containerStockDispo = 0;

        //On recherche la quantité de la reserve encour du produit
        collection.value.aggregate([
            {"$match": {
                    "id_produit" : produit_commande.id_produit, 
                    "id_dealer" : produit_commande.id_dealer,
                    "id_lieu_vente" :produit_commande.id_lieu_vente ? produit_commande.id_lieu_vente : produit_commande.adresse._id,
                    "type" : "vente",
                    "validation" : true,
                    "etat" : "encours"
                }
            },
            {"$sort":{
                "date" : 1
                }
            },
            {"$group" : 
                {
                    "_id" : "$id_produit",
                    "operations" : {
                            "$addToSet" : {
                                    "_id" : "$_id",
                                    "quantite" : "$quantite",
                                    "date": "$date",
                                    "id_lieu_vente" : "$id_lieu_vente",
                                    "id_commune" : "$id_commune"
                                }
                        },
                    "quantite_reserve" : {"$sum" : "$quantite"}
                }
            },
            {"$project" : {
                    "_id" : 0,
                    "id_produit" : "$_id",
                    "operations" : "$operations",
                    "quantite_reserve" : "$quantite_reserve"
                }
            },
            {"$unwind" : "$operations"
            },
            {"$sort" : {"operations.date" : -1}
            },
            {"$group" : {
                    "_id" : {
                        "id_produit" : "$id_produit",
                        "quantite_reserve" : "$quantite_reserve"
                    },
                    "operations" : {
                        "$addToSet" : {
                            "_id" : "$operations._id",
                            "quantite" : "$operations.quantite",
                            "date": "$operations.date",
                            "id_lieu_vente" : "$operations.id_lieu_vente",
                            "id_commune" : "$operations.id_commune"
                        }
                    }
                }
            }           
        ]).toArray(function(err_opera_vente, result_opera_vente) {

           
            if(err_opera_vente){
                callback(false, "Une erreur est survenue lors de la recherche du stock du produit <"+produit_commande.id_produit
                        +"> comptant pour le dealer <"+id_dealer+"> : "+err_opera_vente, null)
            }else{
                if(result_opera_vente.length > 0){//Si au moins une opération vente validée encours a été trouvée

                    //Pour chaque opération vente, on recherche les opérations d'achats liées pour en déduire la quantité restée
                    var sortieOperationVente = 0,
                        listeErreurOperationVente = [];

                    result_opera_vente[0].operations.forEach((operationVente, indexOperationVente, tabOperationVente) => {
                        
                        //On exécute la fonction de recherche des achats liés à cette opération vente
                        countAchatByIdOperationVente(operationVente, function(isQuantityAchat, resultQuantityAchat, operationVenteRetour) {

                            //On incrémente la condition de sortie de la boucle sur la recherche de la quantité du stock dispo
                            sortieOperationVente++;

                            if(isQuantityAchat){//Si la recherche sur les achats de l'opération vente est positive
                            
                                //On recupère le stock disponible pour la reserve encours
                                var valeur_stock_dispo = operationVenteRetour.quantite - resultQuantityAchat;

                                if(valeur_stock_dispo < 0){
                                    
                                    valeur_stock_dispo = 0 
                                }

                                if(valeur_stock_dispo != 0){

                                    //On met en mémoire le stock et l'identifiant de l'opération vente
                                    var stockByIdVente = {
                                        "id_commune" : operationVenteRetour.id_commune,
                                        "id_lieu_vente" : operationVenteRetour.id_lieu_vente,
                                        "id_operation_vente" : ""+operationVenteRetour._id,
                                        "stock_disponible" : valeur_stock_dispo,
                                        "ordre" : sortieOperationVente,
                                        "id_produit" : produit_commande.id_produit
                                    };

                                    listeOperationVente.push(stockByIdVente);
 
                                }

                                //On incrémente le container de stock disponible
                                containerStockDispo += valeur_stock_dispo;

                                //On vérifie la condition de sortie de la boucle de vérification du stock disponible par opération vente
                                if(sortieOperationVente == tabOperationVente.length){

                                    //On vérifie si la valeur du container de stock est supérieure à la quantité commandée
                                    if(containerStockDispo > produit_commande.quantite){

                                        callback(true, null, listeOperationVente, containerStockDispo, produit_commande)
                                    }else{

                                        if(containerStockDispo == produit_commande.quantite){

                                            callback(true, null, listeOperationVente, containerStockDispo, produit_commande);

                                        }else{

                                            callback(false, "La quantité en stock du produit <"+produit_commande.id_produit+"> est insuffisante "+
                                            (produit_commande.infos_dealer? 'chez le dealer <'+ produit_commande.infos_dealer.nom +'>' : 'chez votre vendeur') +" pour passer la commande", 
                                            listeOperationVente, containerStockDispo, produit_commande);
                                            
                                        }
                                    }

                                }
                            }else{//Sinon la recherche sur les achats de l'opération vente est négative
                                listeErreurOperationVente.push(resultQuantityAchat)
                            }
                        })

                    });

                }else{//Sinon aucune opération vente n'a été trouvée
                    callback(false, "Aucune opération vente validée encours pour le produit <"+produit_commande.id_produit+">", null, containerStockDispo, produit_commande)
                }
            }
        })
        
    }catch(exception){
        callback(false, "Une exception a été lévée lors de la recherche du stock du produit <"+produit_commande.id_produit
                +"> comptant pour le dealer <"+id_dealer+"> : "+exception, null, containerStockDispo, produit_commande);
    }
}

/**
 * La fonction permettant de vérifier le stock encours du produit commandé.
 * Elle est utilisée dans la fonction "create" de la DAO "commande". 
 * Il s'agit de la dernière étape confirmant le paiement. 
 */
module.exports.checkAvailableProductByIdDealerAndIdProductForOrderFromCommande = function(produit_commande, callback) {
    
    try{

        var listeOperationVente = [],
            containerStockDispo = 0;

        //On recherche la quantité de la reserve encour du produit
        collection.value.aggregate([
            {"$match": {
                    "id_produit" : produit_commande.id_produit, 
                    "id_dealer" : produit_commande.id_dealer,
                    "id_lieu_vente" : produit_commande.id_lieu_vente,
                    "type" : "vente",
                    "validation" : true,
                    "etat" : "encours"
                }
            },
            {"$sort":{
                "date" : 1
                }
            },
            {"$group" : 
                {
                    "_id" : "$id_produit",
                    "operations" : {
                            "$addToSet" : {
                                    "_id" : "$_id",
                                    "quantite" : "$quantite",
                                    "date": "$date",
                                    "id_lieu_vente" : "$id_lieu_vente",
                                    "id_commune" : "$id_commune"
                                }
                        },
                    "quantite_reserve" : {"$sum" : "$quantite"}
                }
            },
            {"$project" : {
                    "_id" : 0,
                    "id_produit" : "$_id",
                    "operations" : "$operations",
                    "quantite_reserve" : "$quantite_reserve"
                }
            },
            {"$unwind" : "$operations"
            },
            {"$sort" : {"operations.date" : -1}
            },
            {"$group" : {
                    "_id" : {
                        "id_produit" : "$id_produit",
                        "quantite_reserve" : "$quantite_reserve"
                    },
                    "operations" : {
                        "$addToSet" : {
                            "_id" : "$operations._id",
                            "quantite" : "$operations.quantite",
                            "date": "$operations.date",
                            "id_lieu_vente" : "$operations.id_lieu_vente",
                            "id_commune" : "$operations.id_commune"
                        }
                    }
                }
            }           
        ]).toArray(function(err_opera_vente, result_opera_vente) {

           
            if(err_opera_vente){
                callback(false, "Une erreur est survenue lors de la recherche du stock du produit <"+produit_commande.id_produit
                        +"> comptant pour le dealer <"+id_dealer+"> : "+err_opera_vente, null)
            }else{
                if(result_opera_vente.length > 0){//Si au moins une opération vente validée encours a été trouvée

                    //Pour chaque opération vente, on recherche les opérations d'achats liées pour en déduire la quantité restée
                    var sortieOperationVente = 0,
                        listeErreurOperationVente = [];

                    result_opera_vente[0].operations.forEach((operationVente, indexOperationVente, tabOperationVente) => {
                        
                        //On exécute la fonction de recherche des achats liés à cette opération vente
                        countAchatByIdOperationVente(operationVente, function(isQuantityAchat, resultQuantityAchat, operationVenteRetour) {

                            //On incrémente la condition de sortie de la boucle sur la recherche de la quantité du stock dispo
                            sortieOperationVente++;

                            if(isQuantityAchat){//Si la recherche sur les achats de l'opération vente est positive
                            
                                //On recupère le stock disponible pour la reserve encours
                                var valeur_stock_dispo = operationVenteRetour.quantite - resultQuantityAchat;

                                if(valeur_stock_dispo < 0){
                                    
                                    valeur_stock_dispo = 0 
                                }

                                if(valeur_stock_dispo != 0){

                                    //On met en mémoire le stock et l'identifiant de l'opération vente
                                    var stockByIdVente = {
                                        "id_commune" : operationVenteRetour.id_commune,
                                        "id_lieu_vente" : operationVenteRetour.id_lieu_vente,
                                        "id_operation_vente" : ""+operationVenteRetour._id,
                                        "stock_disponible" : valeur_stock_dispo,
                                        "ordre" : sortieOperationVente,
                                        "id_produit" : produit_commande.id_produit
                                    };

                                    listeOperationVente.push(stockByIdVente);
 
                                }

                                //On incrémente le container de stock disponible
                                containerStockDispo += valeur_stock_dispo;

                                //On vérifie la condition de sortie de la boucle de vérification du stock disponible par opération vente
                                if(sortieOperationVente == tabOperationVente.length){

                                    //On vérifie si la valeur du container de stock est supérieure à la quantité commandée
                                    if(containerStockDispo > produit_commande.quantite){

                                        callback(true, null, listeOperationVente, containerStockDispo, produit_commande)
                                    }else{

                                        if(containerStockDispo == produit_commande.quantite){

                                            callback(true, null, listeOperationVente, containerStockDispo, produit_commande);

                                        }else{
                                            callback(false, "La quantité en stock du produit <"+produit_commande.id_produit+"> est insuffisante chez le dealer <"+produit_commande.id_dealer
                                                +"> pour passer la commande", listeOperationVente, containerStockDispo, produit_commande);
                                        }
                                    }

                                }
                            }else{//Sinon la recherche sur les achats de l'opération vente est négative
                                listeErreurOperationVente.push(resultQuantityAchat)
                            }
                        })

                    });

                }else{//Sinon aucune opération vente n'a été trouvée
                    callback(false, "Aucune opération vente validée encours pour le produit <"+produit_commande.id_produit+">", null, containerStockDispo, produit_commande)
                }
            }
        })
        
    }catch(exception){
        callback(false, "Une exception a été lévée lors de la recherche du stock du produit <"+produit_commande.id_produit
                +"> comptant pour le dealer <"+id_dealer+"> : "+exception, null, containerStockDispo, produit_commande);
    }
}

/**
 * La fonction permettant de vérifier le stock encours du produit visité.
 * Elle est utilisée dans la fonction "findOneByIdForProductShowingDetails" de la DAO "dealer".
 */
module.exports.checkAvailableProductByIdDealerAndIdProductForProductDetails = function(produit_dealer, callback) {
    
    try{

        var containerStockDispo = 0;

        //On recherche la quantité de la reserve encour du produit
        collection.value.aggregate([
            {"$match": {
                    "id_produit" : produit_dealer.id_produit, 
                    "id_dealer" : produit_dealer.id_dealer,
                    "id_lieu_vente" : produit_dealer.id_lieu_vente,
                    "type" : "vente",
                    "validation" : true,
                    "etat" : "encours"
                }
            },
            {"$sort":{
                "date" : 1
                }
            },
            {"$group" : 
                {
                    "_id" : "$id_produit",
                    "operations" : {
                            "$addToSet" : {
                                    "_id" : "$_id",
                                    "quantite" : "$quantite",
                                    "date": "$date",
                                    "id_lieu_vente" : "$id_lieu_vente",
                                    "id_commune" : "$id_commune"
                                }
                        },
                    "quantite_reserve" : {"$sum" : "$quantite"}
                }
            },
            {"$project" : {
                    "_id" : 0,
                    "id_produit" : "$_id",
                    "operations" : "$operations",
                    "quantite_reserve" : "$quantite_reserve"
                }
            },
            {"$unwind" : "$operations"
            },
            {"$sort" : {"operations.date" : -1}
            },
            {"$group" : {
                    "_id" : {
                        "id_produit" : "$id_produit",
                        "quantite_reserve" : "$quantite_reserve"
                    },
                    "operations" : {
                        "$addToSet" : {
                            "_id" : "$operations._id",
                            "quantite" : "$operations.quantite",
                            "date": "$operations.date",
                            "id_lieu_vente" : "$operations.id_lieu_vente",
                            "id_commune" : "$operations.id_commune"
                        }
                    }
                }
            }           
        ]).toArray(function(err_opera_vente, result_opera_vente) {
           
            if(err_opera_vente){
                callback(false, "Une erreur est survenue lors de la recherche du stock du produit <"+produit_dealer.id_produit
                        +"> comptant pour le dealer <"+id_dealer+"> : "+err_opera_vente, null)
            }else{
                if(result_opera_vente.length > 0){//Si au moins une opération vente validée encours a été trouvée

                    //Pour chaque opération vente, on recherche les opérations d'achats liées pour en déduire la quantité restée
                    var sortieOperationVente = 0,
                        listeErreurOperationVente = [];

                    result_opera_vente[0].operations.forEach((operationVente, indexOperationVente, tabOperationVente) => {
                        
                        //On exécute la fonction de recherche des achats liés à cette opération vente
                        countAchatByIdOperationVente(operationVente, function(isQuantityAchat, resultQuantityAchat, operationVenteRetour) {

                            //On incrémente la condition de sortie de la boucle sur la recherche de la quantité du stock dispo
                            sortieOperationVente++;

                            if(isQuantityAchat){//Si la recherche sur les achats de l'opération vente est positive
                            
                                //On recupère le stock disponible pour la reserve encours
                                var valeur_stock_dispo = operationVenteRetour.quantite - resultQuantityAchat;

                                if(valeur_stock_dispo < 0){
                                    
                                    valeur_stock_dispo = 0 
                                }

                                //On incrémente le container de stock disponible
                                containerStockDispo += valeur_stock_dispo;

                                //On vérifie la condition de sortie de la boucle de vérification du stock disponible par opération vente
                                if(sortieOperationVente == tabOperationVente.length){
                                    //On vérifie si la valeur du container de stock est supérieure à 0
                                    if(containerStockDispo > 0){

                                        callback(true, null,containerStockDispo)
                                    }else{

                                        callback(false, "La quantité en stock du produit <"+produit_dealer.id_produit+"> est insuffisante chez le dealer <"+produit_dealer.id_dealer
                                                +"> pour passer la commande", containerStockDispo);
                                    }

                                }
                            }else{//Sinon la recherche sur les achats de l'opération vente est négative
                                listeErreurOperationVente.push(resultQuantityAchat)
                            }
                        })

                    });

                }else{//Sinon aucune opération vente n'a été trouvée
                    callback(false, "Aucune opération vente validée encours pour le produit <"+produit_dealer.id_produit+">", containerStockDispo)
                }
            }
        })
        
    }catch(exception){
        callback(false, "Une exception a été lévée lors de la recherche du stock du produit <"+produit_dealer.id_produit
                +"> comptant pour le dealer <"+id_dealer+"> : "+exception, containerStockDispo);
    }
}

function countAchatByIdOperationVente(operationVente, callback) {
    
    try{

        collection.value.aggregate([
            {"$match" : {
                    "type" : "achat",
                    "id_operation_vente" : ""+operationVente._id
                }
            },
            {"$sort": {"date" : -1}
            },
            {"$group":{
                "_id" : "$id_produit",
                "operation" : {
                    "$addToSet" : {
                        "id_operation" : "$_id",
                        "quantite" : "$quantite"
                    }
                },
                "quantite_vendue" : {"$sum" : "$quantite"}
               }
            }
        ]).toArray(function (err, result) {
            
            if(err){
                callback(false, "Une erreur est survenue lors de la recherche d'opérations achat liées à l'opération vente <"+operationVente._id+"> : "+err, operationVente);
            }else{
                if(result.length > 0){
                    callback(true, result[0].quantite_vendue, operationVente);
                }else{
                    callback(true, 0, operationVente);
                }
            }
        })
    }catch(exception){
        callback(false, "Une exception a été lévée lors de la recherche d'opérations achat liées à l'opération vente <"+operationVente._id+"> : "+exception, operationVente);
    }
}

/**
 * La fonction permettant de lister les produit-dealer populaires (les plus achetés)
 */
module.exports.getPopularProductDealer = function(id_client, callback) {
    
    var listeErreur = [];
    try{

        collection.value.aggregate([{"$match" : 
            {
                "type" : "achat"
            }
            },
            {"$group" : 
                {
                    "_id" : "$id_produit_dealer",
                    "total" : {"$sum" : "$quantite"}
                }
            },
            {"$project" : 
                { 
                    "id_produit_dealer" : "$_id" ,
                    "total"  : "$total"
                }
            },
            {"$limit" : 20},
            {"$sort" : {"total" : -1}}
        ]).toArray(function(errOperation, resultOperation) {
            if(errOperation){//Si une erreur d'opération survient lors de la recherche
                listeErreur.push("Une erreur est survenue lors de la recherche de produits populaires : "+errOperation);
                callback(false, listeErreur, null);
            }else{

                if(resultOperation.length > 0){//Si au moins un produit a été acheté

                    //Pour chaque produit-dealer, on doit rechercher ses infos
                    var produit_dealer_dao = require("./produit_dealer_dao"),
                        sortieOperation = 0,
                        listeSortie =  [];

                    produit_dealer_dao.initialize(db_js);
                    
                    for (let index_operation = 0; index_operation < resultOperation.length; index_operation++) {
                       
                        produit_dealer_dao.findOneByIdWithAllDetailsForHomePage(
                        resultOperation[index_operation], id_client, 
                        function(isProduct, messageProduct, resultProduct) {
                            
                            sortieOperation++;

                            if(isProduct){
                                listeSortie.push(resultProduct);
                            }else{
                                listeErreur.push(messageProduct);
                            }

                            if(sortieOperation == resultOperation.length){

                                if(listeSortie.length > 0){
                                    callback(true, listeErreur, listeSortie);
                                }else{
                                    listeErreur.push("Aucun produit trouvé n'a été ajouté à la liste de sortie");
                                    callback(false,listeErreur, false);
                                }
                            }
                        })
                    }
                }else{//Sinon aucun produit n'a été renvoyé
                    listeErreur.push("Aucun produit n'a été acheté jusqu'à présent");
                    callback(false, listeErreur, null);
                }
            }
        })
    }catch(exception){
        listeErreur.push("Une exception est survenue lors de la recherche de produits populaires : "+exception);
        callback(false, listeErreur, null);
    }
}

/**
 * La fonction permettant de lister les dernières publications produit-dealer
 */
module.exports.getLastestProductDealer = function(id_client, callback) {
    
    var listeErreur = [];

    try{

        collection.value.aggregate([
            {"$match" : 
                {
                    "type" : "vente"
                }
            },
            {"$project":
                {
                    "id_produit_dealer" : "$id_produit_dealer"
                }
            },
            {"$limit" : 20},
            {"$sort" : {"date" : -1}}
        ]).toArray(function(errOperation, resultOperation) {
            
            if(errOperation){
                listeErreur.push("Une erreur est survenue lors du listage des produits récemments ajoutés : "+errOperation);
                callback(false, listeErreur, null);
            }else{

                if(resultOperation.length > 0){//Si au moins un produit a été soumis en vente

                    //Pour chaque produit-dealer, on doit rechercher ses infos
                    var produit_dealer_dao = require("./produit_dealer_dao"),
                        sortieOperation = 0,
                        listeSortie =  [];

                    produit_dealer_dao.initialize(db_js);
                    
                    for (let index_operation = 0; index_operation < resultOperation.length; index_operation++) {
                       
                        produit_dealer_dao.findOneByIdWithAllDetailsForHomePage(
                        resultOperation[index_operation], id_client, 
                        function(isProduct, messageProduct, resultProduct) {
                            
                            sortieOperation++;

                            if(isProduct){
                                listeSortie.push(resultProduct);
                            }else{
                                listeErreur.push(messageProduct);
                            }

                            if(sortieOperation == resultOperation.length){

                                if(listeSortie.length > 0){
                                    callback(true, listeErreur, listeSortie);
                                }else{
                                    listeErreur.push("Aucun produit trouvé n'a été ajouté à la liste de sortie");
                                    callback(false,listeErreur, false);
                                }
                            }
                        })
                    }
                }else{//Sinon aucun produit n'a été soumis pour la vente
                    listeErreur.push("Aucun produit n'a été mise en vente");
                    callback(false, listeErreur, null);
                }
            }
        })
    }catch(exception){

        listeErreur.push("Une exception a été lévée lors du listage des produits récemments ajoutés : "+exception);
        callback(false, listeErreur, null);
    }
}