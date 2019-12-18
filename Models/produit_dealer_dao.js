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

    collection.value = db_js.get().collection("produit_dealer");
}

/**
 * La fonction permettant de joindre un produit à un dealer
 */
module.exports.create = function(new_produit_dealer, callback) {
    
    try{

        var filter = {
            "id_dealer" : new_produit_dealer.id_dealer,
            "id_produit" : new_produit_dealer.id_produit,
            "id_lieu_vente" : new_produit_dealer.id_lieu_vente
        }

        collection.value.findOne(filter, function(err_find_one, result_find_one) {
            if(err_find_one){
                callback(false, "Une erreur est survenue lors de la recherche de l'entité produit_dealer <"
                    +filter+"> : "+exception, null)
            }else{
                if(result_find_one){
                    callback(true, null, result_find_one)
                }else{
                    collection.value.insertOne(new_produit_dealer, function(err, result) {
                        if(err){
                            callback(false, "Une erreur est survenue lors de la création de l'entité produit_dealer : "+err, null);
                        }else{
                            callback(true, null, result.ops[0]);
                        }    
                    })
                }
            }
        })
        

    }catch(exception){
        callback(false, "Une exception a été lors de la création de l'entité produit_dealer : "+exception, null);
    }
}

module.exports.findOneById = function(id_produit_dealer, callback) {
    
    try{
        var _id = require("mongodb").ObjectID(id_produit_dealer);
            filter = {"_id" : _id};
        
        collection.value.findOne(filter, function(err, result) {
            
            if(err){
                callback(false, "Une erreur est survenue lors de la recherche de l'entité produit_dealer <"+id_produit_dealer+"> :"
                    +err, null)
            }else{
                if(result){
                    callback(true, null, result);
                }else{
                    callback(false, "Aucune entité produit_dealer ne correspond à l'identifiant <"+id_produit_dealer+">", null);
                }
            }
        })
    }catch(exception){
        callback(false, "Une exception a été lévée lors de la recherche de l'entité produit_dealer <"+id_produit_dealer+"> :"
            +exception, null)
    }
}

/**
 * La fonction permettant de rechercher un produit lié à un dealer.
 */
module.exports.findOneByIdDealer = function(id_dealer, callback) {
    
    try{

        var filter = {"id_dealer" : id_dealer};
        collection.value.findOne(filter, function (err, result) {
            
            if(err){
                callback(false, "Une erreur est survenue lors de la recherche de l'entité produit_dealer correspondant à l'id_dealer <"+id_dealer+"> : "
                    +err, null);
            }else{

                if(result){
                    callback(true, null, result)
                }else{
                    callback(false, "Aucune entité produit_dealer n'a été trouvée pour l'id_dealer <"+id_dealer+">", null);
                }
            }

        })
    }catch(exception){
        callback(false, "Une exception a été lévée lors de la recherche de l'entité produit_dealer correspondant à l'id_dealer <"+id_dealer+"> : "
            +exception, null);
    }
}

/**
 * La fonction permettant de lister tous les dealers liés à un produit.
 * Elle est utilisée lorsque le client visite les détails d'une sous-catégorie. 
 */
module.exports.getAllByIdProduit = function(produit, callback) {
    
    try{

        var filter = { "id_produit" : null},
            id_produit = null;

        if(produit._id){
            id_produit = ""+produit._id;
        }else{
            id_produit  = ""+produit.id_produit;
        }

        filter.id_produit = id_produit;

        collection.value.find(filter).toArray(function(err_prod_deal, list_prod_deal) {

            if(err_prod_deal){
                callback(false, "Une erreur est survenue lors de la recherche des dealers vendant le produit <"+produit.id_produit+"> : "+err_prod_deal, null)
            }else{

                if(list_prod_deal.length > 0){//Si au moins un dealer vendant le produit recherché a été trouvé

                    //Pour chaque entité trouvée, on va rechercher les détails du dealer, l'adresse de vente ainsi que le stock dispo à l'adresse. 
                    var liste_retour = [],
                        liste_erreur = [],
                        sortie_prod_deal = 0,
                        dealer_dao = require("./dealer_dao"),
                        deal_infos = null; 

                    dealer_dao.initialize(db_js);

                    for (let index_prod_deal = 0; index_prod_deal < list_prod_deal.length; index_prod_deal++) {
                        
                        dealer_dao.findOneByIdForProductShowingDetails(produit, list_prod_deal[index_prod_deal], 
                        function(is_prod_deal_showing_details, message_prod_deal_showing_details, result_prod_deal_showing_details) {
                            
                            sortie_prod_deal++;
                            
                            if(is_prod_deal_showing_details){
                                result_prod_deal_showing_details.infos_produit = produit;
                                liste_retour.push(result_prod_deal_showing_details);
                            }else{
                                liste_erreur.push(message_prod_deal_showing_details)
                            }

                            if(sortie_prod_deal == list_prod_deal.length){
                                if(liste_retour.length > 0){
                                    callback(true, null, liste_retour)
                                }else{
                                    callback(false, liste_erreur, null)
                                }
                            }
                        })
                    }
                    

                }else{//Si non aucun dealer ne vend le produit recherché
                    callback(false, "Aucun dealer ne vend le produit <"+id_produit+">", null)
                }
            }
        })

    }catch(exception){
        callback(false, "Une exception a été lévée lors de la recherche des dealers vendant le produit <"+id_produit+"> : "+exception, null)
    }

}

/**
 * La fonction permettant de retrouver les détails de vente d'un produit par rapport
 * à son dealer et son lieu de vente. Elle est utilisée lorsqu'on affiche les produits
 * dans la deuxième étape de la commande. 
 * Mais elle peut aussi servir à previsualiser un produit. 
 */
module.exports.findOneByIdProduitIdDealerIdSalingPlace = function(produit, callback) {
    
    try{
        produit.infos_dealer = null;
        produit.error_infos_deal = null;

        var filter = { "id_produit" : ""+produit.id_produit,
                    "id_dealer" : produit.id_dealer,
                    "id_lieu_vente" : produit.id_lieu_vente};

        collection.value.findOne(filter, function(err_prod_deal, result_prod_dealer) {

            if(err_prod_deal){
                callback(false, "Une erreur est survenue lors de la recherche du dealer vendant le produit <"+produit.id_produit+"> : "+err_prod_deal, null)
            }else{

                if(result_prod_dealer){//Si au moins un dealer vendant le produit recherché a été trouvé

                    //Pour chaque entité trouvée, on va rechercher les détails du dealer, l'adresse de vente ainsi que le stock dispo à l'adresse. 
                    var dealer_dao = require("./dealer_dao");

                    dealer_dao.initialize(db_js);

                    dealer_dao.findOneByIdForProductShowingDetails(produit, result_prod_dealer, 
                        function(is_prod_deal_showing_details, message_prod_deal_showing_details, result_prod_deal_showing_details) {
                            
                            produit.infos_deal =result_prod_deal_showing_details;
                            produit.error_infos_deal = message_prod_deal_showing_details;
                            callback(true, null, produit)
                        })
                    

                }else{//Si non aucun dealer ne vend le produit recherché
                    
                    callback(false, "Aucun dealer ne vend le produit <"+produit.id_produit+"> à l'adresse <"+produit.id_lieu_vente+">", produit)
                }
            }
        })

    }catch(exception){
        callback(false, "Une exception a été lévée lors de la recherche du dealer vendant le produit <"+produit.id_produit+"> : "+exception, produit)
    }

}

/**
 * La fonction permettant d'afficher les détails d'un produit lié à un dealer spécifique. 
 * Elle est utilisée lorsqu'un client visualise un produit en détails.
 */
module.exports.findOneByIdWithAllDetails = function(id_produit_dealer, id_client, callback) {
    
    try{

        var _id = require("mongodb").ObjectID(id_produit_dealer),
            filter = {"_id" : _id},
            objet_retour = {
                "id_produit_dealer" : null,
                "id_dealer" : null,
                "id_lieu_vente" : null,
                "infos_dealer" : null,
                "infos_lieu_vente" : null,
                "stock" : null,
                "prix_produit" : null,
                "infos_produit" : {
                    "intitule" : null,
                    "annotation" : null,
                    "unite" : null,
                    "localisation" : null,
                    "lien_produit" : null,
                    "sous_categorie" : null,
                    "id_produit" : null,
                    "isThisInFavorite" : false
                },
                "images_container" : null,
                "errors" : []
            };

        collection.value.findOne(filter, function(errProdDeal, result_prod_dealer) {

            if(errProdDeal){
                callback(false, "Une erreur est survenue lors de la recherche du produit_dealer <"+id_produit_dealer+"> : "+
                    errProdDeal, null)
            }else{

                if(result_prod_dealer){//Si l'entité produit_dealer a été trouvée

                objet_retour.id_produit_dealer = ""+result_prod_dealer._id;

                    //On commence par trouver le produit
                    var produit_dao = require("./produit_dao");
                    produit_dao.initialize(db_js);

                    produit_dao.findOneById(result_prod_dealer.id_produit, id_client, 
                    function(is_produit, message_produit, result_produit) {
                        
                        if(is_produit){//Si le produit est trouvé
                            
                            //On recupère les infos sur le produit
                            objet_retour.infos_produit.intitule = result_produit.intitule;
                            objet_retour.infos_produit.annotation = result_produit.annotation;
                            objet_retour.infos_produit.unite = result_produit.unite;
                            objet_retour.infos_produit.localisation = result_produit.localisation;
                            objet_retour.infos_produit.lien_produit = result_produit.lien_produit;
                            objet_retour.infos_produit.sous_categorie = result_produit.sous_categorie;
                            objet_retour.infos_produit.id_produit = ""+result_produit._id;
                            
                            //On passe à la recherche des infos du dealer
                            var dealer_dao = require("./dealer_dao");
                            dealer_dao.initialize(db_js);

                            objet_retour.id_dealer = result_prod_dealer.id_dealer;
                            dealer_dao.findOneByIdForOperation(objet_retour, 
                            function(is_dealer, message_dealer, result_with_dealer) {
                                
                                if(is_dealer){//Si le dealer a été trouvé

                                    //On recherche le lieu de vente
                                    var adresse_dao = require("./adresse_dao");
                                    adresse_dao.initialize(db_js);

                                    result_with_dealer.id_lieu_vente = result_prod_dealer.id_lieu_vente;
                                    adresse_dao.findOneByIdFromOperation(result_with_dealer, 
                                    function(is_adresse, message_adresse, result_with_address) {
                                        
                                        if(is_adresse){//Si l'adresse est trouvé

                                            //On recherche le stock
                                            var operation_produit_dao = require("./operation_produit_dao");
                                                operation_produit_dao.initialize(db_js);

                                            var operation_produit_entity = {
                                                "id_produit" : result_with_address.infos_produit.id_produit, 
                                                "id_dealer" : result_with_address.id_dealer,
                                                "id_lieu_vente" : result_with_address.id_lieu_vente,
                                            }

                                            operation_produit_dao
                                                .checkAvailableProductByIdDealerAndIdProductForProductDetails(operation_produit_entity,
                                            function(is_stock, message_stock, containerStockDispo) {
                                            
                                                result_with_address.stock = {
                                                    "quantite" : 0,
                                                    "erreur" : null
                                                };

                                                if(is_stock){
                                                    result_with_address.stock.quantite = containerStockDispo
                                                }else{
                                                    result_with_address.stock.erreur =  message_stock
                                                }

                                                //On recherche le prix du produit
                                                var produit_dealer_prix_dao = require("./produit_dealer_prix_dao");
                                                produit_dealer_prix_dao.initialize(db_js);

                                                var short_prod_deal = {"_id" : ""+result_prod_dealer._id};
                                                produit_dealer_prix_dao.findOneByIdProduitDealer(short_prod_deal, 
                                                function(is_prod_deal_price, message_prod_deal_price, _, result_price) {
                                                    
                                                    if(is_prod_deal_price){//Si le prix est trouvé

                                                        result_with_address.prix_produit = result_price;

                                                        //On fini par rechercher les images liée au produit
                                                        var media_produit_dao = require("./media_produit_dao");
                                                        media_produit_dao.initialize(db_js);
                                                        
                                                        media_produit_dao.getAllByIdProduct(objet_retour.infos_produit.id_produit, 
                                                        function(is_media, message_media, result_media) {
                                                            
                                                            if(is_media){
                                                                objet_retour.images_container = result_media;

                                                                callback(true, null, objet_retour);
                                                            }else{
                                                                objet_retour.errors.push(message_media);
                                                                callback(false, message_media, objet_retour)
                                                            }
                                                        })

                                                    }else{//Sinon le prix du produit n'est par trouvé
                                                        objet_retour.errors.push(message_prod_deal_price);
                                                        callback(false, message_prod_deal_price, objet_retour)
                                                    }
                                                })

                                            })

                                        }else{//Si non l'adresse n'est pas trouvée

                                            objet_retour.errors.push(message_adresse);
                                            callback(false, message_adresse, objet_retour)
                                        }
                                    })

                                }else{//Si non le dealer n'a pas été trouvé
                                    objet_retour.errors.push(message_dealer);
                                    callback(false, message_dealer, null)
                                }
                            })

                        }else{//Sinon le produit n'est pas trouvé
                            callback(false, message_produit, null)
                        }
                    })

                }else{//Si non aucune entité produit_dealer n'a été trouvée.
                    callback(false, "Aucun produit dealer ne correspond à l'identifiant <"+id_produit_dealer+">", null);
                }
            }

        })

    }catch(exception){
        callback(false, "Une exception a été lévée lors de la recherche du produit_dealer <"+id_produit_dealer+"> : "+
            exception, null);
    }
}

/**
 * La fonction permettant de lister les entités produit_dealer liées à un dealer.
 * Elle est utilisée dans la fonction "countViewForDealer" de la DAO "extra"
 */
module.exports.getAllByIdDealer = function(id_dealer, callback) {
    
    try{

        var filter = {"id_dealer" : id_dealer},
            project = {"_id" : 1};
        collection.value.find(filter).toArray(function(err, result) {
            if(err){
                callback(false, "Une erreur est survenue lors du listage des entités produit_dealer liées au dealer <"+id_dealer+"> :  "+
                    err, null)
            }else{
                if(result.length > 0){
                    callback(true, null, result);
                }else{
                    callback(false, "Aucune entité produit_dealer n'est associé au dealer <"+id_dealer+">", null);
                }
            }
        })

    }catch(exception){
        callback(false, "Une exception a été lévée lors du listage des entités produit_dealer liées au dealer <"+id_dealer+"> :  "+
            exception, null)
    }
}

/**
 * La fonction permettant d'afficher les détails d'un produit lié à un dealer spécifique. 
 * Elle est utilisée pour afficher l'apperçu d'un top produit ou d'un nouveau produit.
 */
module.exports.findOneByIdWithAllDetailsForHomePage = function(operation, id_client, callback) {
    
    try{

        var _id = require("mongodb").ObjectID(operation.id_produit_dealer),
            filter = {"_id" : _id},
            objet_retour = {
                "id_produit_dealer" : null,
                "id_dealer" : null,
                "id_lieu_vente" : null,
                "infos_dealer" : null,
                "infos_lieu_vente" : null,
                "stock" : null,
                "prix_produit" : null,
                "infos_produit" : {
                    "intitule" : null,
                    "annotation" : null,
                    "unite" : null,
                    "localisation" : null,
                    "lien_produit" : null,
                    "sous_categorie" : null,
                    "id_produit" : null,
                    "isThisInFavorite" : false
                },
                "errors" : []
            };

        if(operation.total){
            objet_retour.achat_total = operation.total
        }

        collection.value.findOne(filter, function(errProdDeal, result_prod_dealer) {

            if(errProdDeal){
                callback(false, "Une erreur est survenue lors de la recherche du produit_dealer <"+id_produit_dealer+"> : "+
                    errProdDeal, null)
            }else{

                if(result_prod_dealer){//Si l'entité produit_dealer a été trouvée

                objet_retour.id_produit_dealer = ""+result_prod_dealer._id;

                    //On commence par trouver le produit
                    var produit_dao = require("./produit_dao");
                    produit_dao.initialize(db_js);

                    produit_dao.findOneById(result_prod_dealer.id_produit, id_client, 
                    function(is_produit, message_produit, result_produit) {
                        
                        if(is_produit){//Si le produit est trouvé
                            
                            //On recupère les infos sur le produit
                            objet_retour.infos_produit.intitule = result_produit.intitule;
                            objet_retour.infos_produit.annotation = result_produit.annotation;
                            objet_retour.infos_produit.unite = result_produit.unite;
                            objet_retour.infos_produit.localisation = result_produit.localisation;
                            objet_retour.infos_produit.lien_produit = result_produit.lien_produit;
                            objet_retour.infos_produit.sous_categorie = result_produit.sous_categorie;
                            objet_retour.infos_produit.id_produit = ""+result_produit._id;
                            
                            //On passe à la recherche des infos du dealer
                            var dealer_dao = require("./dealer_dao");
                            dealer_dao.initialize(db_js);

                            objet_retour.id_dealer = result_prod_dealer.id_dealer;
                            dealer_dao.findOneByIdForOperation(objet_retour, 
                            function(is_dealer, message_dealer, result_with_dealer) {
                                
                                if(is_dealer){//Si le dealer a été trouvé

                                    //On recherche le lieu de vente
                                    var adresse_dao = require("./adresse_dao");
                                    adresse_dao.initialize(db_js);

                                    result_with_dealer.id_lieu_vente = result_prod_dealer.id_lieu_vente;
                                    adresse_dao.findOneByIdFromOperation(result_with_dealer, 
                                    function(is_adresse, message_adresse, result_with_address) {
                                        
                                        if(is_adresse){//Si l'adresse est trouvé

                                            //On recherche le stock
                                            var operation_produit_dao = require("./operation_produit_dao");
                                                operation_produit_dao.initialize(db_js);

                                            var operation_produit_entity = {
                                                "id_produit" : result_with_address.infos_produit.id_produit, 
                                                "id_dealer" : result_with_address.id_dealer,
                                                "id_lieu_vente" : result_with_address.id_lieu_vente,
                                            }

                                            operation_produit_dao
                                                .checkAvailableProductByIdDealerAndIdProductForProductDetails(operation_produit_entity,
                                            function(is_stock, message_stock, containerStockDispo) {
                                            
                                                result_with_address.stock = {
                                                    "quantite" : 0,
                                                    "erreur" : null
                                                };

                                                if(is_stock){
                                                    result_with_address.stock.quantite = containerStockDispo
                                                }else{
                                                    result_with_address.stock.erreur =  message_stock
                                                }

                                                //On recherche le prix du produit
                                                var produit_dealer_prix_dao = require("./produit_dealer_prix_dao");
                                                produit_dealer_prix_dao.initialize(db_js);

                                                var short_prod_deal = {"_id" : ""+result_prod_dealer._id};
                                                produit_dealer_prix_dao.findOneByIdProduitDealer(short_prod_deal, 
                                                function(is_prod_deal_price, message_prod_deal_price, _, result_price) {
                                                    
                                                    if(is_prod_deal_price){//Si le prix est trouvé

                                                        result_with_address.prix_produit = result_price;

                                                        //On fini par rechercher les images liée au produit 
                                                        var media_dao = require("./media_dao");
                                                        media_dao.initialize(db_js);

                                                        media_dao.findOneByIdFromTopProduct(objet_retour.infos_produit, 
                                                        function(is_media, message_media, result_with_media) {
                                                            
                                                            objet_retour["infos_produit"] = result_with_media;

                                                            if(!is_media){
                                                                objet_retour.errors.push(message_media);
                                                            }

                                                            callback(true, null, objet_retour);
                                                        })

                                                    }else{//Sinon le prix du produit n'est par trouvé
                                                        objet_retour.errors.push(message_prod_deal_price);
                                                        callback(false, message_prod_deal_price, objet_retour)
                                                    }
                                                })

                                            })

                                        }else{//Si non l'adresse n'est pas trouvée

                                            objet_retour.errors.push(message_adresse);
                                            callback(false, message_adresse, objet_retour)
                                        }
                                    })

                                }else{//Si non le dealer n'a pas été trouvé
                                    objet_retour.errors.push(message_dealer);
                                    callback(false, message_dealer, null)
                                }
                            })

                        }else{//Sinon le produit n'est pas trouvé
                            callback(false, message_produit, null)
                        }
                    })

                }else{//Si non aucune entité produit_dealer n'a été trouvée.
                    callback(false, "Aucun produit dealer ne correspond à l'identifiant <"+operation.id_produit_dealer+">", operation);
                }
            }

        })

    }catch(exception){
        callback(false, "Une exception a été lévée lors de la recherche du produit_dealer <"+operation.id_produit_dealer+"> : "+
            exception, operation);
    }
}