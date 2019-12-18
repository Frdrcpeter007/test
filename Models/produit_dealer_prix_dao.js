//------------Définition des variables globales
//cette variable est destinée à contenir une référence à l'objet collection qui dérivera de "db_js"
var db_js = require("./db");

var collection = {
    value: null
}

//Ici on initialise la variable "collection" en lui passant
//la valeur provenant de "db_js". NB: cette fonction sera accessible
//en dehors de ce fichier
module.exports.initialize = function (db_js) {

    collection.value = db_js.get().collection("produit_dealer_prix");
}

/**
 * La fonction permettant de créer un document produit_dealer_prix
 */
module.exports.create = function(new_pdr, callback) {

    try{
        
        collection.value.create(new_pdr, function(err, result) {

            if(err){
                callback(false, "Une erreur est survenue lors de la création de l'objet <produit_dealer_prix> : "+err, null);
            }else{
                callback(true, null, result.ops[0]);
            }

        })
    }catch(exception){
        callback(false, "Une exception a été lévée lors de la création de l'objet <produit_dealer_prix> : "+exception, null);
    }

}

/**
 * La fonction permettant de vérifier ou créer un prix d'un produit pour un dealer
 */
module.exports.checkOrCreate = function(id_prod_deal_prix, new_prod_deal_prix, id_dealer, callback) {
    
    //On commence par vérifier l'existance de l'objet
    try{

        if(id_prod_deal_prix){//Si l'id du prix est fourni

            var _id = require("mongodb").ObjectID(id_prod_deal_prix),
            filter = {"_id" : _id};

            collection.value.findOne(filter, function(errFind, resultFind) {

                if(errFind){
                    callback(false,"Une erreur est survenue lors de la recherche de l'objet prod_deal_prix <"+id_prod_deal_prix+"> : "
                        +errFind, null);
                }else{
                    if(resultFind){//Si le prix existe 
                        callback(true, null, ""+resultFind._id);
                    }else{
                        //Si non le prix n'existe pas, donc on le crée
                        
                    }
                }
            })

        }else{//Si non l'id du prix n'est pas fourni

            collection.value.insertOne(new_prod_deal_prix, function(errInsert, resultInsert) {
                if(errInsert){
                    callback(false, "Une erreur est survenue lors de la création du prix du produit", null)
                }else{
                    //Si le prix a été ajouté, on recherche le précédant pour le desactiver
                    var _id = require("mongodb").ObjectID(""+resultInsert.ops[0]._id);
                    var filterRecherche = {
                            "_id" : {"$nin" : [_id]},
                            "id_produit_dealer" : resultInsert.ops[0].id_produit_dealer,
                            "flag" : true
                        },
                        update = {"$set" : 
                            {
                                "flag" : false,
                                "date_fin" : new Date()
                            }
                        };
                    
                    collection.value.updateMany(filterRecherche, update, 
                    function(errUpdate, resultUpdate) {
                        
                        if(errUpdate){

                            var admin_notification = require("../Models/entities/notification_entity").Notification();
                            admin_notification.date = new Date();
                            admin_notification.flag = false;
                            admin_notification.type = "alerte_systeme";
                            admin_notification.id_auteur =  id_dealer;
                            admin_notification.id_objet = ""+resultInsert.ops[0].id_produit_dealer;

                            var notification_message = "Une erreure est survenue lors de la mise à jour du prix. Cause : "+errUpdate;
                            notification_dao.createForAdminSystem(admin_notification,notification_message);

                            callback(false, "Une erreure est survenue lors de la mise à jour du prix", null)
                        }else{
                            callback(true, null, ""+resultInsert.ops[0]._id);
                        }
                        
                    })
                    
                }
            })
        }
        
    }catch(exception){
        callback(false,"Une exception a été lévée lors de la recherche de l'objet prod_deal_prix <"+id_prod_deal_prix+"> : "
        +exception, null);
    }
}

/**
 * La fonction permettant de rechercher un prix suivant l'entité "produit_dealer"
 */
module.exports.findOneByIdProduitDealer = function(prod_deal, callback) {
    
    try{

        var filter = {
            "id_produit_dealer" : ""+prod_deal._id,
            "flag" : true
        }

        collection.value.findOne(filter, function(err_prod_deal_prix, result_prod_deal_prix) {
            if(err_prod_deal_prix){
                callback(false, "Une erreur est survenue lors de la recherche du prix lié au produit_dealer <"+prod_deal.id_produit_dealer+"> :"
                    + err_prod_deal_prix, prod_deal, null);
            }else{
                if(result_prod_deal_prix){

                    //Si le prix est trouvé, on recherche l'équivalent en CDF
                    var taux_dao = require("./taux_dao");
                    taux_dao.initialize(db_js);

                    taux_dao.cdfUsdExchange(result_prod_deal_prix.montant, result_prod_deal_prix.devise,"CDF",
                    function(is_exchanged, message_exchange, result_exchange) {
                        if(is_exchanged){

                            callback(true, null, prod_deal, result_exchange)
                        }else{
                            callback(false, message_exchange, prod_deal, null);
                        }
                    })

                }else{
                    callback(false, "Aucun prix n'est associé au produit_dealer <"+prod_deal.id_produit_dealer+">", prod_deal, null);
                }
            }
        })

    }catch(exception){
        callback(false, "Une exception a été lévée lors de la recherche du prix lié au produit_dealer <"+prod_deal.id_produit_dealer+"> :"
            + exception, prod_deal, null);
    }
}

/**
 * La fonction permettant de rechercher un prix suivant id_produit_dealer
 * Elle est utilisée dans la fonction "getDetailsLivraisonCommande" de la DAO "Ligne_livraison"
 */
module.exports.findOneByIdProduitDealerFromCommande = function(produit, callback) {
    
    try{

        //var _id = require("mongodb").ObjectID(produit.id_produit_dealer),
        filter = {
            "id_produit_dealer" : produit.id_produit_dealer,
            "flag" : true
        }

        produit.prix_produit = null;

        collection.value.findOne(filter, function(err_prod_deal_prix, result_prod_deal_prix) {
            if(err_prod_deal_prix){
                callback(false, "Une erreur est survenue lors de la recherche du prix lié au produit_dealer <"+produit.id_produit_dealer+"> :"
                    + err_prod_deal_prix, produit);
            }else{
                if(result_prod_deal_prix){

                    //Si le prix est trouvé, on recherche l'équivalent en CDF
                    var taux_dao = require("./taux_dao");
                    taux_dao.initialize(db_js);

                    taux_dao.cdfUsdExchange(result_prod_deal_prix.montant, result_prod_deal_prix.devise,"CDF",
                    function(is_exchanged, message_exchange, result_exchange) {
                        if(is_exchanged){

                            produit.prix_produit = result_exchange;
                            callback(true, null, produit)
                        }else{
                            callback(false, message_exchange, produit);
                        }
                    })

                }else{
                    callback(false, "Aucun prix n'est associé au produit_dealer <"+produit.id_produit_dealer+">", produit);
                }
            }
        })

    }catch(exception){
        callback(false, "Une exception a été lévée lors de la recherche du prix lié au produit_dealer <"+produit.id_produit_dealer+"> :"
            + exception, produit);
    }
}

/**
 * La fonction permettant de rechercher le prix par l'id
 */
module.exports.findOneById = function(id_prod_deal_prix, callback) {
    
    try{

        var _id = require("mongodb").ObjectID(id_prod_deal_prix),
        filter = {
            "_id" : _id
        }

        collection.value.findOne(filter, function(err_prod_deal_prix, result_prod_deal_prix) {
            if(err_prod_deal_prix){
                callback(false, "Une erreur est survenue lors de la recherche du prix lié au produit_dealer <"+id_prod_deal_prix+"> :"
                    + err_prod_deal_prix, prod_deal, null);
            }else{
                if(result_prod_deal_prix){

                    //Si le prix est trouvé, on recherche l'équivalent en CDF
                    var taux_dao = require("./taux_dao");
                    taux_dao.initialize(db_js);

                    taux_dao.cdfUsdExchange(result_prod_deal_prix.montant, result_prod_deal_prix.devise,"CDF",
                    function(is_exchanged, message_exchange, result_exchange) {
                        if(is_exchanged){

                            callback(true, null,result_exchange)
                        }else{
                            callback(false, message_exchange, null);
                        }
                    })

                }else{
                    callback(false, "Aucun prix n'est associé au produit_dealer <"+id_prod_deal_prix+">", null);
                }
            }
        })

    }catch(exception){
        callback(false, "Une exception a été lévée lors de la recherche du prix lié au produit_dealer <"+id_prod_deal_prix+"> :"
            + exception, null);
    }
}