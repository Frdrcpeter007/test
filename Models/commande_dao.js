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

    collection.value = db_js.get().collection("commande");
}

/**
 * La fonction qui permet de créer une commande
 */
module.exports._create = function (new_commande, callback) {

    try { //Si le bloc passe

        //On commance juste par tester si le client a activer son compte, sinon il n'a pas le droit de commander
        var client_dao = require("./client_dao");

        client_dao.initialize(db_js);
        client_dao.testIsActive(new_commande.id_client, (isActive, messageClient, resultClient) => {
            if (isActive) {

                //On recherche la commune d'où sera livrée la commande, en fonction de laquelle on va recherché 
                //le stock de produits à vendre.
                var adresse_dao = require("../Models/adresse_dao");
                adresse_dao.initialize(db_js);
                adresse_dao.findOneById(new_commande.client.localisation_livraison, function(isAdressFound, messageAdress, resultAdress) {
                    
                    if(isAdressFound){//Si l'adresse de livraison est trouvée

                        var sortieProduit = 0,
                        operation_produit_dao = require("./operation_produit_dao"),
                        listeErreurGlobale = [],
                        listeOperationAchatGlobale = [];

                        operation_produit_dao.initialize(db_js);

                        //On commence par passer en boucle les produits commandés afin de vérifier leur quantité en stock
                        //Cette dernière sanctionnera la validation de la commande ou non
                        for (let indexProdiut = 0; indexProdiut < new_commande.produit.length; indexProdiut++) {

                            //Pour ce faire, on exécute la fonction de vérification qui renvoie à chaque fois : 
                            //une liste d'erreurs et une autre d'opération achats
                            operation_produit_dao.verificationStockDispoParProduitCommande(new_commande.produit[indexProdiut], new_commande.client.id, resultAdress.id_commune,
                                function (listeErreurs, listeOperationAchats) {

                                    //On incrémente la variable de sortie
                                    sortieProduit++;

                                    //On vérifie la liste d'erreurs 
                                    if (listeErreurs.length > 0) { //Si elle contient des erreurs, on ajoute celles-ci dans la liste d'erreurs globale

                                        listeErreurs.forEach(erreur => {
                                            listeErreurGlobale.push(erreur)
                                        });
                                    }

                                    //On vérifie la liste d'achats
                                    if (listeOperationAchats.length > 0) {

                                        listeOperationAchats.forEach(operation_achat => {
                                            listeOperationAchatGlobale.push(operation_achat)
                                        });
                                    }

                                    //Puis on vérifie la condition de sortie
                                    if (sortieProduit == new_commande.produit.length) {

                                        //A la sortie on commence par vérifier la liste d'erreurs globale
                                        if (listeErreurGlobale.length > 0) { //Si elle contient au moins une erreur

                                            //On annule la commande
                                            callback(false, listeErreurGlobale)

                                        } else { //Sinon on enregistre la commande

                                            db_js.getNextSequenceValue("commande_id", function (isNext, resultNext) {

                                                if (isNext) {

                                                    new_commande.numero = resultNext.value.sequence_value;
                                                    collection.value.insertOne(new_commande, function (errCommande, resultCommande) {

                                                        //On vérifie s'il y a eu erreur lors de l'enregistrement de la commande
                                                        if (errCommande) {
                                                            callback(false, "Une erreur est survenue lors de la sauvegarde de commande : " + errCommande);
                                                        } else {

                                                            //On recupère l'identifiant de la commande sauvegardée
                                                            var id_commande = "" + resultCommande.ops[0]._id,
                                                                sortieOperation = 0,
                                                                id_client = new_commande.client.id;


                                                            //Pour chaque opération achat dans la liste y afférant, on doit associer l'identifiant de la commande
                                                            for (let indexOperationAchat = 0; indexOperationAchat < listeOperationAchatGlobale.length; indexOperationAchat++) {

                                                                operation_produit_dao.createFromCommande(listeOperationAchatGlobale[indexOperationAchat], id_client, id_commande, resultAdress.id_commune,
                                                                    function (isOperationSaved, resultOperation) {

                                                                        //On incrémente la variable de sortie 
                                                                        sortieOperation++;

                                                                        if (!isOperationSaved) { //Si jamais l'opération n'a pas aboutie
                                                                            listeErreurGlobale.push(resultOperation);
                                                                        }

                                                                        //On test la condition de sortie
                                                                        if (sortieOperation == listeOperationAchatGlobale.length) {

                                                                            if (listeErreurGlobale.length > 0) {
                                                                                callback(true, "La commande est passée mais au moins une erreur est survenue sur les opérations achats : " + listeErreurGlobale, resultCommande)
                                                                            } else {
                                                                                callback(true, "La commande est passée avec succès!!!", resultCommande)
                                                                            }
                                                                        }

                                                                    })
                                                            }
                                                        }
                                                    })
                                                } else {

                                                    callback(false, "Une erreur est survenue lors de la génération du numéro de la commande : " + resultNext);
                                                }
                                            })
                                        }
                                    }

                            })

                        }

                    }else{//Sinon l'adresse de livraison n'est pas trouvée
                        callback(false, messageAdress, null)
                    }
                })

                
            } else {
                callback(false, messageClient)
            }
        })


    } catch (exception) { //Si ce bloc ne passe pas on lève une exception
        callback(false, "Une exception a été lévée lors de la passation de la commande : " + exception);
    }
}

module.exports.create = function(new_commande, callback) {
    
    try{

        //On commence par vérifier si le compte du cliet est actif
        var client_dao = require("./client_dao");

        client_dao.initialize(db_js);
        client_dao.testIsActive(new_commande.client.id, (isActive, messageClient, resultClient) => {

            if(isActive){//Si le compte client est actif

                if(new_commande.produits.length > 0){

                
                    //On vérifie le stock dispo pour chaque produit commandé
                    var operation_produit_dao = require("./operation_produit_dao"),
                        sortie_produit = 0,
                        liste_erreur_produit = [],
                        liste_operation_achat = [];
                    
                    operation_produit_dao.initialize(db_js);
                    for (let index_produit = 0; index_produit < new_commande.produits.length; index_produit++) {
                        
                        operation_produit_dao.
                        checkAvailableProductByIdDealerAndIdProductForOrderFromCommande(new_commande.produits[index_produit], 
                        function(is_product_available, message_stock, liste_operation_vente_stock, container_stock_dispo, produit_commande) {
                                
                            //On incrémente la condition de sortie de la boucle de vérification du stock
                            sortie_produit++;

                            if(is_product_available){//Si le produit est dispo

                                //On crée les opérations d'achats en fonction des opérations vente dispo liées au produit
                                var sortie_operation_vente = 0,
                                    quantite_achat_commande = produit_commande.quantite;

                                liste_operation_vente_stock.sort((a, b) =>{
                                    return a
                                })

                                for (let index_operation_vente = 0; index_operation_vente < liste_operation_vente_stock.length; index_operation_vente++) {
                                    
                                    const operation_vente = liste_operation_vente_stock[index_operation_vente];
                                    
                                    var operation_achat = require("./entities/operation_produit_entity").OperationProduitAchat();
                                    operation_achat.id_produit = produit_commande.id_produit;
                                    operation_achat.type = "achat";
                                    operation_achat.id_client = new_commande.client.id;

                                    //On recupère la quantité d'achat
                                    if(operation_vente.stock_disponible <= quantite_achat_commande){
                                        quantite_achat_commande = quantite_achat_commande - operation_vente.stock_disponible;
                                        operation_achat.quantite = operation_vente.stock_disponible;
                                    }else{
                                        operation_achat.quantite = quantite_achat_commande;
                                        quantite_achat_commande = quantite_achat_commande - quantite_achat_commande;
                                    }

                                    
                                    operation_achat.date = new Date();
                                    operation_achat.id_operation_vente = operation_vente.id_operation_vente;
                                    operation_achat.id_lieu_vente = operation_vente.id_lieu_vente;
                                    operation_achat.id_commune = operation_vente.id_commune;

                                    var new_operation_achat = {
                                        "operation" : operation_achat,
                                        "stock_dispo" : container_stock_dispo
                                    }
                                    
                                    //On insère l'opération d'achat dans la liste d'opérations achat
                                    liste_operation_achat.push(new_operation_achat);

                                }                                    
    
                                
                            }else{//Sinon le produit n'est pas dispo

                                var erreur = {
                                    "is_stock_dispo" : false,
                                    "id_produit" : produit_commande.id_produit,
                                    "details" : message_stock
                                };

                                liste_erreur_produit.push(erreur);
                            }

                            //On vérifie la condition de sortie
                            if(sortie_produit == new_commande.produits.length){

                                //Si la vérification du stock a renvoyé au moins un résultat négatif,
                                //la commande ne sera pas validée.
                                if(liste_erreur_produit.length > 0){
                                    callback(false, liste_erreur_produit, null);
                                }else{//Sinon le traitement de la commande se poursuit. 

                                    db_js.getNextSequenceValue("commande_id", function(isNext, resultNext) {
                                        
                                        if(isNext){

                                            //On recupère le numéro de la commande
                                            new_commande.numero = resultNext.value.sequence_value;

                                            //Puis finalement on insère la commande dans la bd
                                            collection.insertOne(new_commande, function(errCommande, resultCommande) {
                                                
                                                if(errCommande){//Si une erreur survient lors de la création de la commande
                                                    callback(false, "Une erreur est survenue lors de la création de la commande : "+errCommande, null);
                                                }else{//Si non l'insertion s'est bien passée

                                                    //ICI ON DOIT PROCEDER AU LA TRANSACTION BANCAIRE
                                                    /**
                                                     * UTILISATION DE L'API POUR PAIEMENT
                                                     */

                                                    //On recupère l'identifiant de la commande sauvegardée
                                                    //dans le but de mettre à jour les opérations achat précédemment créées.
                                                    var id_commande = "" + resultCommande.ops[0]._id,
                                                        sortie_creation_ope_achat = 0;

                                                    //Pour chaque opération achat, on lui attribue l'identifiant de la commande
                                                    for (let index_operation_achat_ = 0; index_operation_achat_ < liste_operation_achat.length; index_operation_achat_++) {

                                                        liste_operation_achat[index_operation_achat_].operation.id_commande = id_commande; 
                                                        operation_produit_dao.createFromCommande(liste_operation_achat[index_operation_achat_], 
                                                        function(is_operation_achat, message_operation, result_operation) {
                                                            
                                                            //On incrémente la condition de sortie 
                                                            sortie_creation_ope_achat++;

                                                            if(is_operation_achat == false){
                                                                liste_erreur_produit.push(message_operation)
                                                            }

                                                            if(sortie_creation_ope_achat == liste_operation_achat.length){

                                                                callback(true, liste_erreur_produit, "la commande a été soumise avec succès")
                                                            }
                                                        })                                                           
                                                    }
                                                }
                                            })
                                        }else{
                                            callback(false, "Une erreur est survenue lors de la génération du numéro de la commande : " + resultNext, null);
                                        }
                                    })
                                }
                            }
                        })
                    }

                }else{
                    callback(false, "La commande ne contient aucun produit", null);
                }

            }else{//Sinon le compte client n'est pas actif
                callback(false, messageClient, null);
            }
        })

    }catch(exception){
        callback(false, "Une exception a été lévée lors de la création de la commande : "+exception, null);
    }
}

/**
 * La fonction permettant d'avoir les détails d'une commande suivant son identifiant. 
 */
module.exports.findOneById = function (id_commande, callback) {
    try {
        var _id = require("mongodb").ObjectId(id_commande),
            filter = {
                "_id": _id
            };

        collection.value.findOne(filter, function (err, result) {
            if (err) {
                callback(false, "Une erreur lors de la recherche des détails sur cette commande " + err)
            } else {
                if (result) {
                    callback(true, "Tous les détails sur ce commande ont été renvoyés", result)
                }
            }
        })
    } catch (exception) {
        callback(false, "Une exception a été lévée lors de la récupération des détails d'une commande")
    }
}

/**
 * La fonction qui permet d'avoir le top 10 de produits les plus commandés
 * Cette fonction est utilisée dans la méthode "getTop" du modèle "Categorie_dao"
 */
module.exports.getTop = function (id_client, top, callback) {

    try {

        //On commence par exécuter la fonction "aggregate" qui effectue une requête dans la bd
        collection.value.aggregate([{
                "$unwind": "$produit"
            },
            {
                "$group": {
                    "_id": "$produit.id_produit",
                    "count": {
                        "$sum": "$produit.quantite"
                    }
                }
            },
            {
                "$project": {
                    _id: 0,
                    "id_produit": "$_id",
                    "count": "$count"
                }
            },
            {
                "$limit": top
            },
            {
                "$sort": {
                    "count": -1
                }
            }
        ]).toArray(function (err, resultCommande) {

            //On vérifie s'il y a eu une erreur lors de l'exécution
            if (err) {

                callback(false, "Une erreur est survenue lors de la recherche de top 1O commandes : " + err)

            } else { //Si non aucune erreur n'est survenue

                if (resultCommande.length > 0) { //Si le résultat renvoyé contient au moins une commande

                    //On déclare les variables 
                    var produit_model = require("./produit_dao"),
                        sortieCommande = 0,
                        listProduit = [];

                    //on initialise le modèle de données
                    produit_model.initialize(db_js);

                    //On passe en boucle le résultats de commande trouver afin de trouver les produits 
                    //correspondant.
                    for (var indexCommande = 0; indexCommande < resultCommande.length; indexCommande++) {

                        //On exécute la fonction de recherche du produit
                        produit_model.findOneByIdFromCommande(resultCommande[indexCommande], function (isProduitMatched, resultProduit) {

                            //On incrémente la variable de sortie de la boucle commande
                            sortieCommande++;

                            if (isProduitMatched) { //Si le produit est trouvé

                                //on l'ajoute dans la liste de produits à retourner
                                listProduit.push(resultProduit);
                            }

                            //On vérifie la condition de sortie de la boucle
                            if (sortieCommande == resultCommande.length) { //Si elle est remplie

                                //On vérifie si au moins un produit a été trouvé
                                if (listProduit.length > 0) {

                                    //On procede à la recheche de la catégorie de chaque produit trouvé
                                    var categorie_model = require("./categorie_dao"),
                                        listProduitCategorie = [],
                                        sortieProduit = 0;

                                    //on initialise le modèle catégorie
                                    categorie_model.initialize(db_js);

                                    //On parcourt la liste de produit
                                    for (var indexProduit = 0; indexProduit < listProduit.length; indexProduit++) {

                                        //On exécute la fonction de recherche de la catégorie
                                        categorie_model.getOneByIdUnderCategoryFromProduct(listProduit[indexProduit],
                                            function (isCategoryMatched, resultWithCategory) {

                                                //On incrémente la variable de sortie de la boucle produit
                                                sortieProduit++;

                                                if (isCategoryMatched) { //Si la catégorie a été trouvée
                                                    //On ajoute le résultat trouvé dans la liste contenant produit-catégorie 
                                                    listProduitCategorie.push(resultWithCategory);
                                                }

                                                //On vérifie la condition de sortie de la boucle
                                                if (sortieProduit == listProduit.length) {

                                                    if (listProduitCategorie.length > 0) {

                                                        //callback(true, listProduitCategorie);

                                                        var mediaDao = require("./media_dao"),
                                                            sortieMedia = 0,
                                                            listProduitWithMedia = [];

                                                        mediaDao.initialize(db_js);

                                                        for (let indexProduit = 0; indexProduit < listProduitCategorie.length; indexProduit++) {

                                                            mediaDao.findOneByIdFromTopProduct(listProduitCategorie[indexProduit], function (isFound, messageMedia, resultWithMedia) {
                                                                sortieMedia++;
                                                                if (isFound) {
                                                                    listProduitWithMedia.push(resultWithMedia);
                                                                } else {

                                                                    resultWithMedia.lien_produit = null;
                                                                    listProduitWithMedia.push(resultWithMedia);
                                                                }

                                                                if (sortieMedia == listProduitCategorie.length) {
                                                                    var favorisDao = require("./favoris_dao"),
                                                                        sortieFavorite = 0,
                                                                        listProduitWithFavorite = [];
                                                                    favorisDao.initialize(db_js)
                                                                    //callback(true, listProduitCategorieWithMedia);

                                                                    for (let indexTop = 0; indexTop < listProduitWithMedia.length; indexTop++) {
                                                                        favorisDao.isThisInFavoriteForCommande(id_client, listProduitWithMedia[indexTop], function (isFound, messageFavorite, resultWithFavorite) {
                                                                            sortieFavorite++;

                                                                            listProduitWithFavorite.push(resultWithFavorite)

                                                                            if (sortieFavorite == listProduitWithMedia.length) {
                                                                                callback(true, listProduitWithFavorite)
                                                                            }


                                                                        })
                                                                    }

                                                                }


                                                            })

                                                        }
                                                    } else {
                                                        callback(false, "Aucune catégorie n'a été trouvé");
                                                    }
                                                }
                                            })
                                    }

                                } else { //Sinon aucun produit n'a été trouvé

                                    callback(false, "Aucun produit n'a été trouvé parmi ceux de top commandes");
                                }

                            }
                        })

                    }
                } else { //Sinon aucune commande n'a été trouvé

                    callback(false, "Aucun resultat n'est renvoyé lors de la recherche de top commandes");
                }
            }
        })

    } catch (exception) {
        callback(false, "Une exception a été lévée lors de la recherche de top commandes : " + exception);
    }
}

/**
 * La fonction sert à compter les commandes qu'un client à déjà passé
 * @param {*} id_client L'identifiant du client
 * @param {Function} callback La fonction de retour
 */
module.exports.getCount = function (id_client, callback) {
    try {

        var filter = {
            "client.id": id_client
        };

        collection.value.count(filter, function (err, result) {
            if (err) {
                callback(false, "Une erreur est survénue lors de l'obtention du nombre de commande du client : " + err);
            } else {
                callback(true, result);
            }
        })

    } catch (exception) {
        callback(false, "Une exception a été lévée lors de l'obtention du nombre de commande : " + exception);
    }
}

/**
 * Cette fonction permet la récupération de toutes les commandes passés par le client passé ou présent
 * @param {*} id_client L'identifiant du client
 * @param {Function} callback La fonction de retour
 */
module.exports.getAllByIdClient = function (id_client, callback) {
    try {
        var filter = {
            "client.id": id_client
        };

        collection.value.find(filter).toArray(function (err, result) {
            if (err) {
                callback(false, "Une erreur est survénue lors de la récupération des tous les commandes pour ce client : " + err)
            } else {
                if (result.length > 0) {
                    //callback(true, "Les commandes de ce client ont été renvoyées avec succès", result)

                    var sortieCommande = 0,
                        produit_dao = require("./produit_dao");

                    produit_dao.initialize(db_js);

                    for (var indexCommande = 0; indexCommande < result.length; indexCommande++) {
                        var sortieProduit = 0;

                        for (var indexProduit = 0; indexProduit < result[indexCommande].produit.length; indexProduit++) {


                            produit_dao.findOneByIdForGetAllDetailProduct(result[indexCommande].produit[indexProduit], function (isFound, resultProduct) {


                                if (isFound) {

                                    if (sortieCommande < result.length) {
                                        result[sortieCommande].produit[sortieProduit] = resultProduct;
                                    }

                                }

                                sortieProduit++;

                                if (sortieCommande < result.length) {
                                    if (sortieProduit == result[sortieCommande].produit.length) {

                                        sortieCommande++;

                                        if (sortieCommande == result.length) {
                                            callback(true, "Toutes les commandes de ce client ont été revoyées avec succès", result);
                                        }
                                    }
                                }

                            })

                        }

                    }

                } else {
                    callback(false, "Ce client n'a passé aucune commande", null)
                }
            }
        })

    } catch (exception) {
        callback(false, "Une exception a été lévée lors de la récupération des tous les commandes pour ce client : " + exception, null)
    }
}

/**
 * Cette fonction permet l'archivage d'une commande après que celle-ci ait eu une facture
 * @param {*} id_commande L'identifiant de la commande
 * @param {Function} callback La fonction de retour
 */
module.exports.remove = function (id_commande, callback) {
    try {
        //On se crée un id en utilisant l'ObjectId pour le cryptage
        var _id = require("mongodb").ObjectId(id_commande),

            //Ici on créer le fitre afin de modifié cette commande après la sortie de la facture
            /**
             * le filtre comporte seux compartiment dans ce cas 
             * On recupère l'id du favoris que l'on veut modifié le flag
             * ensuite vient la variable update qui défini la propriété qu'on veut modifié 
             */
            filter = {
                "_id": _id
            },
            update = {
                "$set": {
                    "flag": false
                }
            };

        collection.value.updateOne(filter, update, function (err, result) {
            if (err) {
                callback(false, "Une erreur est survénue lors du changement du flag de cette commande : " + err)
            } else {
                if (result) {
                    callback(true, "Commande archivé avec succès", result)
                } else {
                    callback(false, "Cette commande pose un problème lors de son archivage");
                }
            }
        })

    } catch (exception) {
        callback(false, "Une exception est survénue lors du changement du flag de cette commande : " + exception)
    }
}

/**
 * Cette fonction permet l'assignation d'un agent de livraison pour livrer une commande
 * Et aussi au client de valider la livraison
 */
module.exports.setOperation = function (id_commande, concerne, id_concerne, callback) {
    try {

        var _id = require("mongodb").ObjectId(id_commande),
            filter = {
                "_id": _id
            },
            update = {"$push" :{
                "operation" : {
                        "type" : null,
                        "date" : null
                    }
                } 
            };

            update[concerne] = id_concerne;

        collection.value.updateOne(filter, update, function (err, result) {
            if (err) {
                callback(false, "Une erreur est survenue lors de l'ajout d'une opération à la commande :  " + err);
            } else {
                if (result) {

                    var agent_dao = require("./agent_dao");

                    agent_dao.initialize(db_js);
                    agent_dao.findOneById(id_concerne, function (isFound, messageAgent, resultAgent) {
                        if (isFound) {
                            callback(true, "L'agent " + resultAgent.nom + " a été bien assigné pour la livraison de cette commande")
                        }
                    })

                }
            }
        })

    } catch (exception) {
        callback(false, "Une exception a été lévée lors de l'ajout d'une opération à la commande :  " + exception)
    }
}

/**
 * La fonction permettant de compter les commandes reçues par les clients
 * Elle est utilisée dans l'administration
 */
module.exports.countReceivedForAdmin = function(callback) {
    
    try{

        var filter = {"operation.type" : "reception"};

        collection.value.count(filter, function (err, result) {
            
            if(err){
                callback(false, "Une erreur est survenue lors du comptage de commandes reçues par les clients : "+err);
            }else{
                callback(true, result);
            }
        })

    }catch(exception){
        callback(false, "Une exception a été lévée lors du comptage de commandes reçues par les clients : "+exception);
    }
}

/**
 * La fonction permettant de compter le nombre de commande passées pour un produit
 * Elle est utilisée dans l'administration
 */
module.exports.countCommandeByIdProduitForAdmin = function(id_produit, callback) {
    
    try{

        var filter = {"produit.id_produit" : id_produit};
        
        collection.value.count(filter, function(err, result) {
            
            if(err){
                callback(false, "Une erreur est survenue lors du comptage de commandes passées pour le produit <"+id_produit+"> : "+exception)
            }else{
                callback(true, result)
            }
        })

    }catch(exception){
        callback(false, "Une exception a été lévée lors du comptage de commandes passées pour le produit <"+id_produit+"> : "+exception)
    }
}

/**
 * La fonction permettant de compter le nombre de commande passées pour un produit
 * Elle est utilisée dans la fonction  findListByIdSousCategorieForAdmin de la DAO "Produit"
 */
module.exports.countCommandeByIdProduitForProdAdmin = function(produit, callback) {
    
    produit.errCommande = null;
    produit.sumCommande = null;

    try{
        var filter = {"produit.id_produit" : ""+produit._id};
        
        collection.value.count(filter, function(err, result) {
            
            if(err){

                produit.errCommande = "Une erreur est survenue lors du comptage de commandes passées pour le produit <"+produit._id+"> : "+exception;
                callback(false, produit)
            }else{

                produit.sumCommande = result;
                callback(true, produit)
            }
        })

    }catch(exception){

        produit.errCommande = "Une exception a été lévée lors du comptage de commandes passées pour le produit <"+produit._id+"> : "+exception;
        callback(false, produit)
    }
}

/**
 * La fonction permettant de lister toutes les commandes
 */
module.exports.getAllForAdmin = function (top, limit, callback) {
    
    try{

        var filter = null;

        if(top != "null"){
            filter = {
                "date" : {
                    "$gt" : new Date(top)
                }
            }
        }else{
            filter = {}
        };

        collection.value.find(filter).limit(limit).toArray(function(errCommande, resultCommande) {
            
            if(errCommande){//Si une erreur survenait lors du listage de commandes
                
                callback(false, "Une erreur est survenue lors de la recupération de toutes les commandes : "+errCommande)
            
            }else{//Sinon aucune erreur n'est survenue
                
                if(resultCommande.length > 0){//Si au moins une commande a été enregistrée

                    //Pour chaque commande, on commence par rechercher les détails du client 
                    var listWithCustomerDetails = [],
                        sortieClient = 0,
                        client_dao = require("./client_dao");
                    
                    client_dao.initialize(db_js);
                    resultCommande.forEach((commande, indexCommande, tabCommande) => {
                        
                        //On exécute la fonction de recherche du client
                        client_dao.getOneByIdFromCommande(commande, function(isClientMatched, resultWithClient) {
                            
                            //On incrémente la variable de sortie de la boucle de recherches des clients
                            sortieClient++;

                            //On insère le résultat de la recherche dans la liste correpondante
                            listWithCustomerDetails.push(resultWithClient);

                            //On vérifie la condition de sortie
                            if(sortieClient == tabCommande.length){

                                //Ayant fini les recherches des clients, à présente il faudrait associer les 
                                //noms des produits à chaque commande. 

                                var listWithProductsDetails = [],
                                    sortieProduit = 0,
                                    produit_dao = require("./produit_dao");

                                produit_dao.initialize(db_js);
                                listWithCustomerDetails.forEach((commande2, indexCommande2, tabCommande2) => {

                                    produit_dao.findOneByIdFromCommande2(commande2,
                                    function(isProduitMatched, resultWithProducts) {
                                        
                                        sortieProduit++;
                                        listWithProductsDetails.push(resultWithProducts);

                                        if(listWithCustomerDetails.length == sortieProduit){

                                            callback(true, listWithProductsDetails)
                                        }
                                    })
                                })
                                
                            }
                        })

                    });
                }else{//Sinon aucune commande n'a été enregistrée
                    callback(false, "Aucune commande n'a été passée");
                }

            }
        })
    }catch(exception){
        callback(false, "Une exception a été lévée lors de la recupération de toutes les commandes : "+exception)
    }
}

/**
 * La fonction permettant de recupérer les détails d'une commande suivant son identifiant,
 * elle est utilisée dans l'administration
 */
module.exports.getOneByIdForAdmin = function(id_commande, callback) {
    
    try{

        var _id = require("mongodb").ObjectID(id_commande),
            filter = {
                "_id" : _id
            };
        
        collection.value.findOne(filter, function(err, resultCommande) {
            
            if(err){
                callback(false, "Une une erreur est survenue lors de la recherche de la commande correspondant à l'identifiant <"+
                    id_commande+"> : "+err);
            }else{
                if(resultCommande){//Si la commande est trouvée

                    //On recherche les détails du client
                    var client_dao = require("./client_dao");
                    client_dao.initialize(db_js);

                    client_dao.getOneByIdFromCommande(resultCommande, function(isCommandeClient, resultCommandeClient) {
                      
                        if(isCommandeClient){//Si les détails du client sont trouvés

                            //On passe à la recherche des détails de chaque produit commandé
                            var produit_dao = require("./produit_dao");
                            produit_dao.initialize(db_js);
                            produit_dao.findOneByIdFromCommande2(resultCommandeClient, 
                            function(isProductsMatched, resultCommandeProduit) {

                                if(isProductsMatched){//Si la recherche sur les produits aboutis

                                    //On associe à chaque produit ses opérations correspondantes
                                    var operation_produit_dao = require("./operation_produit_dao");
                                    operation_produit_dao.initialize(db_js);

                                    operation_produit_dao.getAllAchatByIdCommande(resultCommandeProduit, 
                                    function(isCommandeOperation, resultCommandeOperation){

                                        callback(isCommandeOperation, resultCommandeOperation)
                                    })
                                }else{//Sinon la recherche sur les produits n'a pas aboutie
                                    callback(false, resultCommandeProduit)
                                }
                            })
                        }else{//Sinon les détails du client ne sont pas trouvés
                            callback(false, resultCommandeClient)
                        }
                    })
                }else{//Sinon aucune commande ne correspond à l'identifiant passé
                    callback(false, "Aucune commande ne correspond à l'identifiant <"+id_commande+">");
                }
            }
        })
    }catch(exception){
        callback(false, "Une exception a été lévée lors de la recherche de la commande correspondant à l'identifiant <"+
            id_commande+"> : "+exception);
    }
}

/**
 * La fonction permettant de lancer une recherche parmi les commandes, 
 * les différents étapes de recherche étant : id_commande, id_produit, intitule produit,
 *  id_client, nom/prenom client. 
 * Elle est utilisée dans l'administration 
 */
module.exports.searchCommandeForAdmin = function (valeur_recherche, callback) {
    
    var filterIdCommande = null,
        listeRetour = [];

    try{

        var _id = require("mongodb").ObjectID(valeur_recherche);

        filterIdCommande = {
            "_id" : _id
        }

    }catch(exception){

        filterIdCommande = {
            "_id" : valeur_recherche
        }
        console.log("Une exception a été lévée lors de la recherche de la valeur <"+valeur_recherche+">dans la collection commande : "+exception);
    }

    //On commence par rechercher la commande suivant un identifiant spécifique
    collection.value.findOne(filterIdCommande, function(errCommandeOne, resultCommandeOne) {
        
        if(errCommandeOne == null && resultCommandeOne != null){//Si le résultat de la recheche 
                //a trouvé une commande dont l'identifiant correspond à la valeur recherchée

                //On recherche les détails du client
                var client_dao = require("./client_dao");
                client_dao.initialize(db_js);

                client_dao.getOneByIdFromCommande(resultCommandeOne, function(isCommandeClient, resultCommandeClient) {
                    
                    if(isCommandeClient){//Si les détails du client sont trouvés

                        //On passe à la recherche des détails de chaque produit commandé
                        var produit_dao = require("./produit_dao");
                        produit_dao.initialize(db_js);
                        produit_dao.findOneByIdFromCommande2(resultCommandeClient, 
                        function(isProductsMatched, resultCommandeProduit) {

                            if(isProductsMatched){//Si la recherche sur les produits aboutis

                                //On associe à chaque produit ses opérations correspondantes
                                var operation_produit_dao = require("./operation_produit_dao");
                                operation_produit_dao.initialize(db_js);

                                operation_produit_dao.getAllAchatByIdCommande(resultCommandeProduit, 
                                function(isCommandeOperation, resultCommandeOperation){

                                    listeRetour.push(resultCommandeOperation);
                                    callback(isCommandeOperation, listeRetour)
                                })
                            }else{//Sinon la recherche sur les produits n'a pas aboutie
                                callback(false, resultCommandeProduit)
                            }
                        })
                    }else{//Sinon les détails du client ne sont pas trouvés
                        callback(false, resultCommandeClient)
                    }
                })

        }else{//Sinon l'identifiant passé ne correspond à aucune commande

            //On passe la recherche sur les produits correspondants
            var filterIdProduit = {
                "produit.id_produit" : valeur_recherche
            };

            collection.value.find(filterIdProduit).limit(50).toArray(function(errCommandeIdProduct, 
            resultCommandeIdProduct) {
                
                if(errCommandeIdProduct == null && resultCommandeIdProduct.length > 0){//Si le résultat issu de la recherche au niveau de l'id_produit renvoie au moins une commande 

                    //Pour chaque commande, on commence par rechercher les détails du client 
                    var listWithCustomerDetails = [],
                    sortieClient = 0,
                    client_dao = require("./client_dao");
                
                    client_dao.initialize(db_js);
                    resultCommandeIdProduct.forEach((commande, indexCommande, tabCommande) => {
                        
                        //On exécute la fonction de recherche du client
                        client_dao.getOneByIdFromCommande(commande, function(isClientMatched, resultWithClient) {
                            
                            //On incrémente la variable de sortie de la boucle de recherches des clients
                            sortieClient++;

                            //On insère le résultat de la recherche dans la liste correpondante
                            listWithCustomerDetails.push(resultWithClient);

                            //On vérifie la condition de sortie
                            if(sortieClient == tabCommande.length){

                                //Ayant fini les recherches des clients, à présente il faudrait associer les 
                                //noms des produits à chaque commande. 

                                var listWithProductsDetails = [],
                                    sortieProduit = 0,
                                    produit_dao = require("./produit_dao");

                                produit_dao.initialize(db_js);
                                listWithCustomerDetails.forEach((commande2, indexCommande2, tabCommande2) => {

                                    produit_dao.findOneByIdFromCommande2(commande2,
                                    function(isProduitMatched, resultWithProducts) {
                                        
                                        sortieProduit++;
                                        listWithProductsDetails.push(resultWithProducts);

                                        if(listWithCustomerDetails.length == sortieProduit){

                                            callback(true, listWithProductsDetails)
                                        }
                                    })
                                })
                                
                            }
                        })

                    });

                }else{//Sinon aucune commande n'est issue de la recherche par "id_produit",
                    
                    //On passe la recherche au niveau du produit en se basant sur les intitulés
                    var produit_dao = require("./produit_dao");
                    produit_dao.initialize(db_js);

                    produit_dao.findListByIntituleFromCommande(valeur_recherche,
                    function(isProductsByIntituleMatched, resultProductsByIntituleMatched) {
                        
                        if(isProductsByIntituleMatched){//Si la recherche de produits suivant sur les intitulés renvoie au moins un produit
                            
                            var sortieProduitByIntitule = 0,
                                resultCommandeIntituleProduct = [];

                            //Pour chaque produit retrouvé, on va rechercher les commandes correspondantes
                            resultProductsByIntituleMatched.forEach((produitByIntitule, indexProduit, tabProduitByIntitule) => {
                                

                                findListByIdProduct(""+produitByIntitule._id, function(isListByIdProduct, resultListCommandeByIdProduct) {
                                    
                                    sortieProduitByIntitule++;

                                    if(isListByIdProduct){//Si la recherche des commandes ayant les produits issu de la recherche sur leurs intitulés
                                        //est positive

                                        for (let indexCommande = 0; indexCommande < resultListCommandeByIdProduct.length; indexCommande++) {
                                            
                                            resultCommandeIntituleProduct.push(resultListCommandeByIdProduct[indexCommande]);
                                        }
                                    }

                                    //On vérifie la condition de sortie de la boucle
                                    if(sortieProduitByIntitule == tabProduitByIntitule.length){

                                        if(resultCommandeIntituleProduct.length > 0){//Si la liste de commande issue de la recherche de produits par leurs intitulés
                                            //renvoie au moins une commande

                                            //Sachant qu'une intitulé d'un produit peut être le nom d'un client dans un cas ou un autre,
                                            //il est envisageable de rechercher aussi parmi les clients ayant passés de commandes dont les noms peuvent
                                            //correspondre à la valeur de recherche. 

                                            findListByClientName(valeur_recherche, function(isCommandeClient, resultCommandeClient) {
                                                
                                                if(isCommandeClient){//Si au moins une commande a été passée par un client dont le nom/prenom correspond à la valeur de recherche
                
                                                    var listeTestDoublon = [];
                                                    for (let indexCmdIntituleProd = 0; indexCmdIntituleProd < resultCommandeIntituleProduct.length; indexCmdIntituleProd++) {
                                                        const idCmdIntituleProd = ""+resultCommandeIntituleProduct[indexCmdIntituleProd]._id;
                                                        listeTestDoublon.push(idCmdIntituleProd);
                                                    }

                                                    for (let indexCmdClient = 0; indexCmdClient < resultCommandeClient.length; indexCmdClient++) {
                                                                        
                                                            if(listeTestDoublon.includes(""+resultCommandeClient[indexCmdClient]._id) == false){

                                                                resultCommandeIntituleProduct.push(resultCommandeClient[indexCmdIntituleProd]);
                                                            }
                                                    }

                                                    callback(true, resultCommandeIntituleProduct);

                                                }else{//Sinon aucune une commande n'a été passée par un client dont le nom/prenom correspond à la valeur de recherche
                                                    callback(true, resultCommandeIntituleProduct)
                                                }
                                            })


                                        }else{//Sinon la liste de commande issue de la recherche de produits par leurs intitulés
                                            //n'a renvoyé aucune commande

                                            //On va recherché tout simplement les commandes passées par les clients (id_client et noms/prenoms)
                                            findListByClientIdOrName(valeur_recherche, function(isCommandeByClient, resultCommandeClientIdOrName) {
                                                
                                                if(isCommandeByClient){
                                                    callback(true, resultCommandeClientIdOrName);
                                                }else{
                                                    callback(false, resultCommandeClientIdOrName)
                                                }
                                            })
                                        }
                                    }
                                        
                                    
                                })
                            });

                        }else{//Sinon aucun produit n'a été renvoyé par la recherche des produits sur les intitulés

                            //On va recherché tout simplement les commandes passées par les clients (id_client et noms/prenoms)
                            findListByClientIdOrName(valeur_recherche, function(isCommandeByClient, resultCommandeClientIdOrName) {
                                                
                                if(isCommandeByClient){
                                    callback(true, resultCommandeClientIdOrName);
                                }else{
                                    callback(false, resultCommandeClientIdOrName)
                                }
                            })
                        }
                    })
                }
            })
        }
    })
}

//#region Fonctions auxilliaires à la fonction "searchCommandeForAdmin"

/**
 * Fonction auxilliaire à la fonction "searchCommandeForAdmin
 * @param {*} id_produit 
 * @param {*} callback 
 */
function findListByIdProduct(id_produit, callback) {
    
    try{
        var filter = {
            "produit.id_produit" : id_produit
        };

        collection.value.find(filter).limit(25).toArray(function(err, result) {
            
            if(err){
                callback(false, "Une erreur est survenue lors de la recherche de la liste commande suivant le produit <"+id_produit+"> : "+err);
            }else{
                if(result.length > 0){
                    var sortieCommande = 0,
                        listeCommandeWithDetails = [];
                        
                    for (let indexCommande = 0; indexCommande < result.length; indexCommande++) {
                        
                        findDetailsCommandeByidInner(""+result[indexCommande]._id, function(isCommandeDetails, resultCommandeDetails) {
                            
                            sortieCommande++;

                            if(isCommandeDetails){
                                listeCommandeWithDetails.push(resultCommandeDetails);
                            }

                            if(sortieCommande == result.length){

                                if(listeCommandeWithDetails.length > 0){
                                    callback(true, listeCommandeWithDetails)
                                }else{
                                    callback(true, "Aucune commande ne correspond à l'identifiant du produit <"+id_produit+">")
                                }
                                
                            }
                        })
                    }

                }else{

                    callback(false, "Aucune commande ne possède le produit <"+id_produit+">")
                }
            }
        })
        
    }catch(exception){
        callback(false, "Une exception a été lévée lors de la recherche de la liste commande suivant le produit <"+id_produit+"> : "+exception);
    }
}

/**
 * Fonction auxilliaire à la fonction "searchCommandeForAdmin
 * @param {*} id_commande 
 * @param {*} callback 
 */
function findDetailsCommandeByidInner(id_commande, callback) {
    
    try{

        var _id = require("mongodb").ObjectID(id_commande),
            filter = {
                "_id" : _id
            };
        
        collection.value.findOne(filter, function(err, resultCommande) {
            
            if(err){
                callback(false, "Une une erreur est survenue lors de la recherche de la commande correspondant à l'identifiant <"+
                    id_commande+"> : "+err);
            }else{
                if(resultCommande){//Si la commande est trouvée

                    //On recherche les détails du client
                    var client_dao = require("./client_dao");
                    client_dao.initialize(db_js);

                    client_dao.getOneByIdFromCommande(resultCommande, function(isCommandeClient, resultCommandeClient) {
                      
                        if(isCommandeClient){//Si les détails du client sont trouvés

                            //On passe à la recherche des détails de chaque produit commandé
                            var produit_dao = require("./produit_dao");
                            produit_dao.initialize(db_js);
                            produit_dao.findOneByIdFromCommande2(resultCommandeClient, 
                            function(isProductsMatched, resultCommandeProduit) {

                                if(isProductsMatched){//Si la recherche sur les produits aboutis

                                    //On associe à chaque produit ses opérations correspondantes
                                    var operation_produit_dao = require("./operation_produit_dao");
                                    operation_produit_dao.initialize(db_js);

                                    operation_produit_dao.getAllAchatByIdCommande(resultCommandeProduit, 
                                    function(isCommandeOperation, resultCommandeOperation){

                                        callback(isCommandeOperation, resultCommandeOperation)
                                    })
                                }else{//Sinon la recherche sur les produits n'a pas aboutie
                                    callback(false, resultCommandeProduit)
                                }
                            })
                        }else{//Sinon les détails du client ne sont pas trouvés
                            callback(false, resultCommandeClient)
                        }
                    })
                }else{//Sinon aucune commande ne correspond à l'identifiant passé
                    callback(false, "Aucune commande ne correspond à l'identifiant <"+id_commande+">");
                }
            }
        })
    }catch(exception){
        callback(false, "Une exception a été lévée lors de la recherche de la commande correspondant à l'identifiant <"+
            id_commande+"> : "+exception);
    }
}

/**
 * Fonction auxilliaire à la fonction "searchCommandeForAdmin
 * @param {*} valeur_recherche 
 * @param {*} callback 
 */
function findListByClientName(valeur_recherche, callback) {
    
    //On commence tout d'abord par rechercher les clients dont les noms / prenoms correspondent
    //à la valeur de recherche

    var client_dao = require("./client_dao");
    client_dao.initialize(db_js);

    client_dao.searchByNames(valeur_recherche, function(isClientMatched, resultClient) {
        
        if(isClientMatched){//Si au moins un client a été trouvé

            var sortieClient = 0,
                listeCommandeByIdClient = [];
            //Pour chaque client trouvé il faudra à présent chercher ses commandes passées
            resultClient.forEach((client, indexClient, tabClient) => {
                
                findListByIdClient(""+client._id, function(isListCommandeMatched, resultListCommande) {
                    
                    sortieClient++;

                    if(isListCommandeMatched){
                        listeCommandeByIdClient.push(resultListCommande);
                    }

                    if(sortieClient == tabClient.length){

                        if(listeCommandeByIdClient.length > 0){
                            callback(true, listeCommandeByIdClient)
                        }else{
                            callback(false, "Aucune commande n'a été passée par le client <"+valeur_recherche+">");
                        }
                    }
                })
            });

        }else{//Sinon aucun client n'a été trouvé
            callback(false, resultClient)
        }
    })
}

/**
 * Fonction auxilliaire à la fonction "searchCommandeForAdmin
 * @param {*} id_client 
 * @param {*} callback 
 */
function findListByIdClient(id_client, callback) {
    
    
    try{
        var filter = {
            "client.id" : id_client
        };

        collection.value.find(filter).limit(25).toArray(function(err, result) {
            
            
            if(err){
                callback(false, "Une erreur est survenue lors de la recherche de la liste commande suivant le client <"+id_client+"> : "+err);
            }else{
                if(result.length > 0){

                    var sortieCommande = 0,
                        listeCommandeWithDetails = [];
                        
                    for (let indexCommande = 0; indexCommande < result.length; indexCommande++) {
                        
                        findDetailsCommandeByidInner(""+result[indexCommande]._id, function(isCommandeDetails, resultCommandeDetails) {
                           

                            sortieCommande++;

                            if(isCommandeDetails){
                                listeCommandeWithDetails.push(resultCommandeDetails);
                            }

                            if(sortieCommande == result.length){

                                if(listeCommandeWithDetails.length > 0){
                                    callback(true, listeCommandeWithDetails)
                                }else{
                                    callback(true, "Aucune commande ne correspond à l'identifiant du client <"+id_client+">")
                                }
                                
                            }
                        })
                    }
                }else{

                    callback(false, "Aucune commande n'a été passée par le client <"+id_client+">")
                }
            }
        })
        
    }catch(exception){
        callback(false, "Une exception a été lévée lors de la recherche de la liste commande suivant le client <"+id_produit+"> : "+exception);
    }
}

/**
 * Fonction auxilliaire à la fonction "searchCommandeForAdmin
 * @param {*} valeur_recherche 
 * @param {*} callback 
 */
function findListByClientIdOrName(valeur_recherche, callback) {
    
    //On commence par rechercher les commandes dont l'identifiant du client correspond à la valeur de recherche
    var filterCommandeIdClient = {
        "client.id" : valeur_recherche
    };

    collection.value.find(filterCommandeIdClient).limit(25).toArray(function(errCommandeIdClient, resultCommandeIdClient) {
        
        if(errCommandeIdClient){
            callback(false, "Une erreur est survenue lors de la recherche de la liste commande suivant le client <"+valeur_recherche+"> : "+errCommandeIdClient);
        }else{
            if(resultCommandeIdClient.length > 0){

                var sortieCommande = 0,
                    listeCommandeWithDetails = [];
                    
                for (let indexCommande = 0; indexCommande < resultCommandeIdClient.length; indexCommande++) {
                    
                    findDetailsCommandeByidInner(""+resultCommandeIdClient[indexCommande]._id, function(isCommandeDetails, resultCommandeDetails) {
                        
                        sortieCommande++;

                        if(isCommandeDetails){
                            listeCommandeWithDetails.push(resultCommandeDetails);
                        }

                        if(sortieCommande == resultCommandeIdClient.length){

                            if(listeCommandeWithDetails.length > 0){
                                callback(true, listeCommandeWithDetails)
                            }else{
                                callback(true, "Aucune commande ne correspond à l'identifiant du client <"+valeur_recherche+">")
                            }
                            
                        }
                    })
                }

            }else{

                findListByClientName(valeur_recherche, function(isCommandeNameClient, commandeNameClient) {
                    
                    if(isCommandeNameClient){
                        callback(true, commandeNameClient)
                    }else{
                        callback(false, "Il semble que la valeur de recherche <"+valeur_recherche+"> ne corresponde à aucun client ayant commandé...");
                    }
                })
            }
        }
    })
}

//#endregion

/**
 * La fonction qui permet de compter le nombre de produit du dealer qui ont été commandé
 */
module.exports.getCountCommandeTheProductOfThisDealer = function (id_dealer, callback) {
    try {
        
        collection.value.aggregate([
            {
                "$unwind" : "$produit"
            },
            {
                "$group" : {
                    "_id": "$produit.id_produit",
                    "count": {"$sum" : 1}
                }
            }
        ]).toArray(function (err, result) {
        
            
            if (err) {
                callback(false, "Une erreur est survenue lors du comptage des commandes des produit de ce delear : " +err)
            } else {
                if (result.length > 0) {
                    var operation_produit_dao = require("./operation_produit_dao"),
                        sortieProduit = 0,
                        countTotal = 0;
                    
                    operation_produit_dao.initialize(db_js);
                    for (let index = 0; index < result.length; index++) {
                        operation_produit_dao.checkIfProductIsForDealer(result[index], id_dealer, function (isCheck, messageCheck, resultCheck) {
                            
                            sortieProduit = sortieProduit + 1;
                            countTotal = countTotal + resultCheck.count;
                            
                            if (sortieProduit == result.length) {
                                callback(true, "Le comptage est fini", {count: countTotal})
                            }
                        })
                    }
                } else {
                    callback(false, "Aucun commande n'a été éffectué", {count: 0})
                }
            }
        })
    } catch (exeption) {
        callback(false, "Une exception a été lévée lors du comptage de commande effectué au produits de ce dealer : " + exeption)
    }
}

/**
 * La fonction qui permet de compter le nombre d'achat des produits d'un dealer
 */
module.exports.getCountAchatTheProductOfThisDealer = function (id_dealer, callback) {
    try {
        
        collection.value.aggregate([
            {
                "$unwind" : "$produit"
            },
            {
                "$group" : {
                    "_id": "$produit.id_produit",
                    "count": {"$sum" : "$produit.quantite"}
                }
            }
        ]).toArray(function (err, result) {
        
            
            if (err) {
                callback(false, "Une erreur est survenue lors du comptage des achat des produit de ce delear : " +err)
            } else {
                if (result.length > 0) {
                    var operation_produit_dao = require("./operation_produit_dao"),
                        sortieProduit = 0,
                        countTotal = 0;
                    
                    operation_produit_dao.initialize(db_js);
                    for (let index = 0; index < result.length; index++) {
                        operation_produit_dao.checkIfProductIsForDealer(result[index], id_dealer, function (isCheck, messageCheck, resultCheck) {
                            
                            sortieProduit = sortieProduit + 1;
                            countTotal = countTotal + resultCheck.count;
                            
                            if (sortieProduit == result.length) {
                                callback(true, "Le comptage est fini", {count: countTotal})
                            }
                        })
                    }
                } else {
                    callback(false, "Aucun commande n'a été éffectué", {count: 0})
                }
            }
        })
    } catch (exeption) {
        callback(false, "Une exception a été lévée lors du comptage de commande effectué au produits de ce dealer : " + exeption)
    }
}

module.exports.getAmounOfSale = (id_dealer, callback) => {
    try {
        var dealerDao = require("./dealer_dao");

        dealerDao.initialize(db_js);
        dealerDao.findOneByIdClient(id_dealer, (isFound, messageDealer, resultDealer) => {
            if (isFound) {
                collection.value.aggregate(
                    {
                        "$unwind": "$produit"
                    }, 
                    {
                        "$project": {
                            "_id": 0,
                            "produit.id_produit": 1,
                            "produit.quantite": 1
                        }
                    }, 
                    {
                        "$group": {
                            "_id": {
                                "produit": "$produit.id_produit",
                            },
                            "quantite": {
                                "$sum": "$produit.quantite"
                            }
                        }
                    }
                ).toArray((err, resultAggr) => {
                    if (err) {
                        callback(false, "Une erreur est survenue lors de la récupération des produit et quantité : " + err)
                    } else {
                        if (resultAggr.length > 0) {
                            
                            var sortieProduit = 0,
                                productDealer = [],
                                operation_produit_dao = require("./operation_produit_dao");
                                
                            operation_produit_dao.initialize(db_js);
                            for (let index = 0; index < resultAggr.length; index++) {
                                
                                var produit = {
                                    "_id": resultAggr[index].produit.id_produit,
                                    "quantite": resultAggr[index].produit.quantite
                                }
                                
                                operation_produit_dao.checkIfProductIsForDealer(produit, id_dealer, (isCheck, messageOperation, resultOperation) => {
                                    sortieProduit++;
                                    if (isCheck) {
                                        productDealer.push(resultOperation)
                                    }
                                    
                                    if (sortieProduit == resultAggr.length) {
                                        var sortieProduitDealer = 0,
                                            total = 0,
                                            produit_dao = require("./produit_dao");
                                            
                                        produit_dao.initialize(db_js);
                                        for (let index = 0; index < productDealer.length; index++) {
                                           produit_dao.findProductForCommandeStat(productDealer[index], (isFound, messageProduit, resultProduit) => {
                                               sortieProduitDealer++;
                                               if (isFound) {
                                                   total = total + (resultProduit.montant * resultProduit.quantite);
                                               }
                                               
                                               if (sortieProduitDealer == productDealer.length) {
                                                   callback(true, "La somme des revenues a été calculé", {"amount": total})
                                               }
                                           })
                                        }
                                    }
                                })
                            }
                        } else {
                            callback(false, "Aucun produit n'a été vendue", {"amount": 0})
                        }
                    }
                })
            } else {
                callback(false, messageDealer)
            }
        })
    } catch (exception) {
        callback(false, "Une exception a été lévée lors de la récupération des produit et quantité : " + exception)        
    }
}

/**
 * Module permettant de faire apparaitre les détails d'une commande
 * @param {String} id_commande L'identifiant de la commande
 * @param {Function} callback La fonction de retour
 */
module.exports.getDetailsForCommande = (id_commande, callback) => {
    try {
        collection.value.aggregate([
            {
                "$match": {
                    "_id": require("mongodb").ObjectId(id_commande)
                }
            }
        ]).toArray((err, resultAggr) => {
            if (err) {
                callback(false, "Une erreur ets survenue lors de la recheche des détails de la commande : " +err)
            } else {
                if (resultAggr.length > 0) {
                    
                    var sortieCommande = 0,
                        commandeWithProduct = null,
                        produit_dao = require("./produit_dao");
                        
                    produit_dao.initialize(db_js);
                    for (let index = 0; index < resultAggr.length; index++) {
                        produit_dao.findOneByIdFromCommande2(resultAggr[0], (isFound, resultWithProduct) => {
                            sortieCommande++;
                            if (isFound) {
                                commandeWithProduct = resultWithProduct;
                            }
                            
                            if (sortieCommande == resultAggr.length) {
                                callback(true, "Les détails ont été renvoyé avec succès", commandeWithProduct)
                            }
                        })
                    }
                   
                } else {
                    callback(false, "Cette commande n'existe pas")
                }
            }
        })
    } catch (exception) {
        callback(false, "Une exception a été lévée lors de la recheche des détails de la commande : " +exception)        
    }
}

/**
 * Module permettant de compter le nombre de client ayant commandé un produit donné
 * @param {String} id_produit L'identifiant du produit
 * @param {Function} callback La fonction de retour
*/
module.exports.getCountClientCommandeProduct = (id_produit, callback) => {
    try {
        collection.value.aggregate([
            {
                "$unwind": "$produit"
            },
            {
                "$match": {
                    "produit.id_produit": id_produit
                }
            },
            {
                "$group": {
                    "_id": "$client.id"
                }
            },
            {
                "$count": "nbre"
            }
        ]).toArray((err, resultAggr) => {
            if (err) {
                callback(false, "Une erreur est survenue lors du comptage de personne ayant commande ce produit : " +err)
            } else {
                if (resultAggr.length > 0) {
                    callback(true, "Le nombre de personne ayant commande est renvoyé", resultAggr[0])
                } else {
                    callback(false, "Personne n'a effectué de commande de ce produit", {nbre : 0})
                }
            }
        })
    } catch (exception) {
        callback(false, "Une exception a été lévée lors du comptage de personne ayant commande ce produit : " + exception)        
    }
}

/**
 * La fonction permettant de soumettre le pannier pour vérification du stock.
 * Elle intervient après que le client ait obtenu les détails de livraison
 * et avant le paiement de la facture. 
 */
module.exports.submitCart = function(pannier, callback) {
    
    //Sachant qu'il s'agit de la deuxième étape dans le processus de passation d'une commande,
    //on vérifie l'état du produit en stock. 

    var operation_produit_dao = require("./operation_produit_dao");
    operation_produit_dao.initialize(db_js);

    //On passe en boucle les produits commandés pour vérifier le stock
    var sortie_produit = 0,
        liste_produit_commande_with_stock = [],
        liste_erreur = [];

    for (let index_produit = 0; index_produit < pannier.produits.length; index_produit++) {

        operation_produit_dao.checkAvailableProductByIdDealerAndIdProductForOrder(pannier.produits[index_produit], 
        function(is_product_available, message_stock, liste_operation_vente_stock, container_stock_dispo, produit_commande) {
            
            //On incrémente la condition de sortie
            sortie_produit++;

            //On crée l'objet retraçant l'état du stock
            var stock = {
                "is_stock_dispo" : is_product_available,
                "quantite_stock" : container_stock_dispo,
                "liste_operation_vente" : liste_operation_vente_stock,
                "erreurs" : message_stock
            }

            //On ratache l'état du stock au produit
            produit_commande.stock = stock;

            //On rajoute le produit à la liste de sortie
            liste_produit_commande_with_stock.push(produit_commande);

            if(sortie_produit == pannier.produits.length){//On vérifie l'état de sortie
                pannier.produits = null;
                pannier.produits = liste_produit_commande_with_stock;
                callback(true, null, pannier);
            }
        })
        
    }
}