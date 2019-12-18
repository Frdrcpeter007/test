//------------Définition des variables globales
//cette variable est destinée à contenir une référence à
//l'objet collection qui dérivera de "db_js"
var db_js = require("./db");

var collection = {
    value: null
}

//Ici on initialise la variable "collection" en lui passant
//la valeur provenant de "db_js". NB: cette fonction sera accessible en dehors de ce fichier
module.exports.initialize = function (db_js) {

    collection.value = db_js.get().collection("adresse");
}

/**
 * La fonction qui permet de créer une adresse pour un utilisateur
 */
module.exports.create = function (newAdresse, callback) {
    try {

        var client_dao = require("./client_dao");

        client_dao.initialize(db_js);
        client_dao.findOneById(newAdresse.id_client, function (isFound, messageClient, resultClient) {

            if (isFound) {

                collection.value.insertOne(newAdresse, function (err, result) {

                    if (err) {
                        callback(false, "Une erreur est survenue lors de la création de l'adresse : " + err)
                    } else {
                        if (result) {
                            //callback(true, "L'adresse a été enregistrer avec succès", result.ops[0])
                            client_dao.setAdress(result.ops[0], function (isSet, message, result) {
                                if (isSet) {
                                    callback(true, "L'adresse a été enregistrer avec succès", result)
                                } else {
                                    callback(false, message, null)
                                }
                            })
                        } else {
                            callback(false, "L'adresse n'a pas été enregistrer", null)
                        }
                    }
                })
            } else {
                callback(false, messageClient, null)
            }
        })


    } catch (exception) {
        callback(false, "Une exception a été lévée lors de la création de l'adresse : " + exception)
    }
}

/**
 * La fonction permettant de recherche une adresse suivant son identifiant
 */
module.exports.findOneById = function (id_adresse, callback) {
    
    try{

        var _id = require("mongodb").ObjectID(id_adresse),
            filter = {"_id" : _id};
        collection.value.findOne(filter, function (err, result) {
            if(err){
             callback(false, "Une erreur est survenue lors de la recherche de l'adresse dont l'identifiant est <"+id_adresse+"> : " + err, null);

            }else{
                if(result){
                    
                    //On recupère la commune
                    var commune_dao = require("./commune_dao");
                    commune_dao.initialize(db_js);

                    commune_dao.findOneById(result.id_commune, function(isCommune, messageCommune, resultCommune) {
                        if(isCommune){
                            
                            result.commune = resultCommune;
                            callback(true, null, result);
                        }else{
                            callback(false, messageCommune, null);
                        }
                    })
                }else{
                    callback(false, "Aucune adresse ne correspond à l'identifiant <"+id_adresse+">", null);
                }
            }
        })
    }catch(exception){
        callback(false, "Une exception est a été lévée lors de la recherche de l'adresse dont l'identifiant est <"+id_adresse+"> : " + exception, null);
    }
}

/**
 * La fonction permettant de rechercher une adresse suivant son identifiant.
 * ELle est utilisée pour afficher les détails de l'adresse de livraison.
 */
module.exports.findOneByIdForAdresseLivraison = function (id_adresse, callback) {
    
    try{

        var _id = require("mongodb").ObjectID(id_adresse),
            filter = {"_id" : _id},
            project = {"id_client" :0};
        collection.value.findOne(filter, project, function (err, result) {
            if(err){
             callback(false, "Une erreur est survenue lors de la recherche de l'adresse dont l'identifiant est <"+id_adresse+"> : " + err, null);

            }else{
                if(result){
                    
                    //On recupère la commune
                    var commune_dao = require("./commune_dao");
                    commune_dao.initialize(db_js);

                    commune_dao.findOneByIdForAdresseLivraison(result.id_commune, function(isCommune, messageCommune, resultCommune) {
                        if(isCommune){
                            
                            result.commune = resultCommune;
                           callback(true, null, result);

                        }else{
                            callback(false, messageCommune, null);
                        }
                    })
                }else{
                    callback(false, "Aucune adresse ne correspond à l'identifiant <"+id_adresse+">", null);
                }
            }
        })
    }catch(exception){
        callback(false, "Une exception est a été lévée lors de la recherche de l'adresse dont l'identifiant est <"+id_adresse+"> : " + exception, null);
    }
}

/**
 * La fonction permettant de retrouver les infos detaillées d'un produit passé dans le pannier. 
 * Elle est utilisée dans le processus de passation d'une commande. 
 */
module.exports.findOneByIdForProduitLivraison = function (produit_pannier, callback) {
    
    try{

        var _id = require("mongodb").ObjectID(produit_pannier.id_lieu_vente),
            filter = {"_id" : _id},
            project = {"id_client" :0};
        collection.value.findOne(filter, project, function (err, result) {
            if(err){
             callback(false, "Une erreur est survenue lors de la recherche de l'adresse dont l'identifiant est <"+produit_pannier.id_lieu_vente+"> : " + err, produit_pannier);

            }else{
                if(result){
                    
                    //On recupère la commune
                    var commune_dao = require("./commune_dao");
                    commune_dao.initialize(db_js);

                    commune_dao.findOneByIdForAdresseLivraison(result.id_commune, function(isCommune, messageCommune, resultCommune) {
                        if(isCommune){
                            
                            result.commune = resultCommune;
                            produit_pannier.adresse = result;

                            //On passe à la recherche des détails du produit
                            var produit_dao = require("./produit_dao");
                            produit_dao.initialize(db_js);

                            produit_dao.findOneByIdForAdresseLivraison(produit_pannier, function(is_product, message_product, produit_pannier_with_product) {
                                
                                if(is_product){

                                    //On recherche les détails du dealer
                                    var dealer_dao = require("./dealer_dao");
                                    dealer_dao.initialize(db_js);
                                    dealer_dao.findOneByIdForAdresseLivraison(produit_pannier_with_product.id_dealer, function(is_dealer, message_dealer, resultWithDealerInfos) {

                                        if(is_dealer){
                                            produit_pannier_with_product.infos_dealer = resultWithDealerInfos;
                                        }else{
                                            produit_pannier_with_product.erreur_infos_dealer = message_dealer;
                                        }

                                        callback(true, null, produit_pannier_with_product);
                                    })
                                    
                                }else{
                                    callback(false, message_product, produit_pannier)
                                }
                            })

                        }else{
                            callback(false, messageCommune, produit_pannier);
                        }
                    })
                }else{
                    callback(false, "Aucune adresse ne correspond à l'identifiant <"+produit_pannier.id_lieu_vente+">", produit_pannier);
                }
            }
        })
    }catch(exception){
        callback(false, "Une exception est a été lévée lors de la recherche de l'adresse dont l'identifiant est <"+produit_pannier.id_lieu_vente+"> : " + exception, produit_pannier);
    }
}

/**
 * La fonction qui permet de cherche les informations de l'adresse en cours du client
 */
module.exports.findCurrentCustomerAddress = function (id_client, callback) {
    try {
        var client_dao = require("./client_dao");

        client_dao.initialize(db_js);

        client_dao.findOneById(id_client, function(isFound, messageClient, resultClient) {

            if (isFound) {
                var _id = require("mongodb").ObjectId(resultClient.adresse),
                    filter = {
                        _id: _id
                    };
                collection.value.findOne(filter, function (err, result) {
                    if (err) {
                        callback(false, "Une erreur est survenue lors de la recherche de l'adresse : " + err)
                    } else {
                        if (result) {

                            var ville_dao = require("./ville_dao");

                            ville_dao.initialize(db_js);
                            ville_dao.findOneByIdFromAdress(result, function (isFound, messageVille, resultWithTown) {
                                callback(true, "L'adresse a été trouvé", resultWithTown)
                            })

                        } else {
                            callback(false, "Aucun adresse  n'a été renvoyé", null)
                        }
                    }
                })
            } else {
                callback(false, messageClient, null)
            }
        })

    } catch (exception) {
        callback(false, "Une exception a été lévée lors de la recherche de l'adresse : " + err)
    }
}

/**
 * La fonction qui permet de récupérer tous les adresses d'un utilisateur
 */
module.exports.getAll = function (id_client, callback) {
    try {
        var client_dao = require("./client_dao");

        client_dao.initialize(db_js);

        client_dao.findOneById(id_client, function (isFound, messageClient, resultClient) {
            if (isFound) {
                collection.value.aggregate([{
                        "$match": {
                            "id_client": id_client,
                            "flag": true
                        }
                    },
                    {
                        "$project": {
                            "id_client": 0
                        }
                    }
                ]).toArray(function (err, result) {
                    if (err) {
                        callback(false, "Une erreur est survenue lors de la récupération de la liste des adresse : " + err)
                    } else {
                        if (result.length > 0) {
                            var ville_dao = require("./ville_dao"),
                                sortieAdress = 0,
                                resultWithTown = [];

                            ville_dao.initialize(db_js);

                            for (let index = 0; index < result.length; index++) {

                                ville_dao.findOneByIdFromAdress(result[index], function (isFound, messageTown, resultTown) {
                                    sortieAdress++;

                                    resultTown.isDefault = null;

                                    if (""+resultTown._id == resultClient.adresse) {
                                        resultTown.isDefault = true
                                    }else{
                                        resultTown.isDefault = false
                                    }

                                    resultWithTown.push(resultTown)
                                    

                                    if (sortieAdress == result.length) {
                                        callback(true, "Les adresses ont été renvoyées", resultWithTown)
                                    }
                                })
                            }
                        } else {
                            callback(false, "Aucune adresse n'a été trouvé")
                        }
                    }
                })
            } else {
                callback(false, messageClient, null)
            }
        })
    } catch (exception) {

    }
}

/**
 * Modification du flag de l'adresse
 */
module.exports.changeFlag = function (adresse, id_client, callback) {
    try {
        var client_dao = require("./client_dao");

        client_dao.initialize(db_js);

        client_dao.findOneById(id_client, function (isFound, message_client, result_client) {
            if (isFound) {
                if (result_client.adresse != adresse.id_adresse) {

                    var _id = require("mongodb").ObjectId(adresse.id_adresse),
                        filter = {
                            "_id": _id,
                            "id_client": id_client
                        },
                        update = {
                            "$set": {
                                "flag": false
                            }
                        };

                    collection.value.updateOne(filter, update, function (err, result) {
                        if (err) {
                            callback(false, "Une erreur est survenue lors du changement du flag : " + err)
                        } else {
                            if (result) {
                                callback(true, "La modification a été faite avec succès", result)
                            } else {
                                callback(false, "Modification non executé", null)
                            }
                        }
                    })

                } else {
                    callback(false, "Cet adresse est l'adresse qui est défini par défaut, définissez un autre puis désactivez", null)
                }

            } else {
                callback(false, message_client, null)
            }
        })
    } catch (exception) {
        callback(false, "Une exception a été lévée lors du changement du flag : " + err)
    }
}

/**
 * Définition de l'adresse comme adresse par défaut
 */
module.exports.setDefault = function (id_adresse, id_client, callback) {
    try {
        var client_dao = require("./client_dao");

        client_dao.initialize(db_js);

        client_dao.findOneById(id_client, function (isFound, messageClient, resultClient) {
            if (isFound) {
                collection.value.aggregate([{
                        "$match": {
                            "id_client": id_client,
                            "flag": true
                        }
                    },
                    {
                        "$project": {
                            "_id": 1
                        }
                    }
                ]).toArray(function (err, result) {
                    if (err) {
                        callback(false, "Une erreur est survenue lors de la récupération de la liste des adresse : " + err)
                    } else {
                        if (result.length > 0) {

                            var adresseIdDoublons = [];
                            for (let index = 0; index < result.length; index++) {
                                adresseIdDoublons.push("" + result[index]._id)
                            }

                            if (adresseIdDoublons.includes(id_adresse)) {
                                var adresse = {
                                    "id_client": id_client,
                                    "_id": id_adresse
                                };

                                client_dao.setAdress(adresse, function (isSet, messageClient, resultClient) {
                                    if (isSet) {
                                        callback(true, messageClient, resultClient)
                                    } else {
                                        callback(false, messageClient, null)
                                    }
                                })
                            } else {
                                callback(false, "Cet adresse n'est pas repertorié parmi vos adresse", null)
                            }
                        } else {
                            callback(false, "Aucune adresse n'a été trouvé")
                        }
                    }
                })
            } else {
                callback(false, messageClient, null)
            }
        })
    } catch (exception) {
        callback(false, "Une exception a été lévée lors de la définition de l'adresse comme par défaut : " + exception)
    }

}

/**
 * La fonction permettant de renseigner les coordonnées d'un adresse
 * Ecriture google {latitude, longitude}. Ecriture mongoDb {longitude, latitude}
 */
module.exports.setGeoLocation = function (id_adresse, latitude, longitude, callback) {
    
try{
    var _id = require("mongodb").ObjectID(id_adresse),
        filter = {"_di" : _id},
        updateLocation = {"$set" : 
                    {"flag" : true, "coordonnees" : [longitude, latitude]} 
                };

    collection.value.updateOne(filter, updateLocation, function(errLocation, result) {
        
        if(errLocation){
            callback(false, "Une erreur est survenue lors de la mise à jour des coordonnées de l'adresse <"+id_adresse+"> : "+errLocation, null);
        }else{

            callback(true, null, "Les coordonnées de l'adresse ont été mise à jour avec succès");
        }
    })
        
}catch(exception){
    callback(false, "Une exception a été lévée lors de la mise à jour des coordonnées de l'adresse <"+id_adresse+"> : "+exception, null);
}
}

/**
 * La fonction permettant de recuperer l'id de la commune associée à l'adresse.
 * Elle est utilisée dans le processus de passation d'une commande. 
 */
module.exports.getIdCommuneFromCommande = function(id_adresse, old_id_commune, callback) {
    
    if(old_id_commune == null){

        try{

            var _id = require("mongodb").ObjectID(id_adresse),
                filter = {"_id" : _id};
            collection.value.findOne(filter, function (err, result) {
                if(err){
                 callback(false, "Une erreur est survenue lors de la recherche de l'adresse dont l'identifiant est <"+id_adresse+"> : " + err, null);
    
                }else{
                    if(result){
                        callback(true, null, ""+result.id_commune);
                    }else{
                        callback(false, "Aucune adresse ne correspond à l'identifiant <"+id_adresse+">", null);
                    }
                }
            })
        }catch(exception){
            callback(false, "Une exception est a été lévée lors de la recherche de l'adresse dont l'identifiant est <"+id_adresse+"> : " + exception, null);
        }

    }else{
        callback(true, null, old_id_commune)
    }
}  

/**
 * La fonction permettant de retrouver une adresse de vente d'un nouveau produit (stock)
 */
module.exports.findOneByIdFromOperation = function (operation, callback) {
    
    try{

        var _id = require("mongodb").ObjectID(operation.id_lieu_vente),
            filter = {"_id" : _id};
        collection.value.findOne(filter, function (err, result) {
            if(err){
             callback(false, "Une erreur est survenue lors de la recherche de l'adresse dont l'identifiant est <"+id_adresse+"> : " + err, operation);

            }else{
                if(result){
                    
                    //On recupère la commune
                    var commune_dao = require("./commune_dao");
                    commune_dao.initialize(db_js);

                    commune_dao.findOneById(result.id_commune, function(isCommune, messageCommune, resultCommune) {
                        if(isCommune){
                            
                        delete result.id_client;
                        delete result.id_commune;

                         result.commune = {
                            "nom": resultCommune.nom,
                            "localisation": resultCommune.localisation,
                            "ville": {
                                "nom": {
                                    "_id": ''+resultCommune.ville.ville._id,
                                    "intitule": resultCommune.ville.ville.intitule,
                                    "coordonees": resultCommune.ville.ville.coordonees
                                }
                            }
                        };

                        operation.infos_lieu_vente = result;
                        callback(true, null, operation);

                        }else{
                            callback(false, messageCommune, operation);
                        }
                    })
                }else{
                    callback(false, "Aucune adresse ne correspond à l'identifiant <"+id_adresse+">", operation);
                }
            }
        })
    }catch(exception){
        callback(false, "Une exception est a été lévée lors de la recherche de l'adresse dont l'identifiant est <"+id_adresse+"> : " + exception, operation);
    }
}