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

    collection.value = db_js.get().collection("produit");
}

/**
 * La fonction qui permet d'ajouter un produit
 * @param {*} new_product Le nouveau produit à sauvegarder
 * @param {*} id_dealer L'identifiant du dealer 
 * @param {*} quantite La quantité à soumettre
 * @param {*} images_container Le container des images associées au produit, ces items n'ont que les propriétés : name, size et path
 * @param {*} id_lieu_vente Le lieu de vente du produit
 * @param {*} id_commune La commune de vente du produit
 * @param {*} prix_unitaire Le prix unitaire du produit
 * @param {*} devise La divise du prix unitaire
 */
module.exports.create = function (new_product, id_dealer, quantite, images_container, id_lieu_vente, id_commune, prix_unitaire, devise, callback) {

    try { //Si ce bloc passe


        var notification_dao = require("./notification_dao");
        notification_dao.initialize(db_js);


        //On appele la méthode insertOne (une methode propre à mongoDB) de notre collection qui doit prendre la structure de l'entité
        collection.value.insertOne(new_product, function (err, resultProduit) {

            //On test s'il y a erreur
            if (err) {
                callback(false, "Une erreur est survénue lors de l'ajout du produit", "" + err);
            } else { //S'il n'y a pas erreur

                //On vérifie s'il y a des résultat renvoyé
                if (resultProduit.ops[0]) {

                    //Après l'insertion du produit, on passe à la jointure de ce dernier au dealer
                    var new_produit_dealer = require("./entities/produit_dealer_entity").ProduitDealer();
                    new_produit_dealer.date = new Date();
                    new_produit_dealer.etat = true;
                    new_produit_dealer.id_dealer = id_dealer;
                    new_produit_dealer.id_lieu_vente = id_lieu_vente;
                    new_produit_dealer.id_produit = "" + resultProduit.ops[0]._id;


                    var produit_dealer_dao = require("./produit_dealer_dao");
                    produit_dealer_dao.initialize(db_js);
                    produit_dealer_dao.create(new_produit_dealer,
                        function (is_product_dealer, message_product_dealer, result_product_dealer) {

                            if (is_product_dealer) {//Si la jointure du produit au dealer a abouti

                                //On procède à la recupération du prix
                                var produit_dealer_prix_dao = require("./produit_dealer_prix_dao"),
                                    taux_dao = require("../Models/taux_dao"),
                                    new_prod_deal_prix = require("./entities/produit_dealer_prix_entity").ProduitDealerPrix();

                                produit_dealer_prix_dao.initialize(db_js);
                                taux_dao.initialize(db_js);

                                //On procède à la convertion monétaire
                                var in_balance = prix_unitaire,
                                    in_currency = devise,
                                    out_currency = in_currency == "USD" ? "CDF" : "USD";

                                taux_dao.cdfUsdExchange(in_balance, in_currency, out_currency,
                                    function (is_exchanged, message_exchange, result_exchage) {

                                        if (is_exchanged) {

                                            new_prod_deal_prix.date_creation = new Date();
                                            new_prod_deal_prix.flag = true;
                                            new_prod_deal_prix.id_produit_dealer = "" + result_product_dealer._id;

                                            //Parce qu'il est convenu que l'unité monétaire est le "USD", on recupère la somme convertie et l'abréviation. 
                                            new_prod_deal_prix.devise = result_exchage.in_balance.currency == "USD" ? result_exchage.in_balance.currency : result_exchage.out_balance.currency;
                                            new_prod_deal_prix.montant = result_exchage.in_balance.currency == "USD" ? result_exchage.in_balance.balance : result_exchage.out_balance.balance;

                                            produit_dealer_prix_dao.checkOrCreate(null, new_prod_deal_prix, id_dealer,
                                                function (is_prod_deal_price, message_prod_deal_price, result_prod_deal_price) {

                                                    if (is_prod_deal_price) {//Si le prix est enregistré

                                                        //On peut à ce stade enregistrer l'opération produit
                                                        var operation_propduit_dao = require("./operation_produit_dao"),
                                                            new_operation = require("./entities/operation_produit_entity").OperationProduitVente();

                                                        new_operation.id_produit = "" + resultProduit.ops[0]._id;
                                                        new_operation.type = "vente";
                                                        new_operation.id_dealer = id_dealer;
                                                        new_operation.quantite = quantite;
                                                        new_operation.date = new Date();
                                                        new_operation.validation = false;
                                                        new_operation.etat = "attente";
                                                        new_operation.id_commune = id_commune;
                                                        new_operation.id_lieu_vente = id_lieu_vente;
                                                        new_operation.id_produit_dealer_prix = result_prod_deal_price;

                                                        operation_propduit_dao.initialize(db_js);
                                                        //Puis on éxecute la méthode create du modèle du operation_produit
                                                        operation_propduit_dao.create(new_operation, function (isOperationCreated, messageOperation, resultOPeration) {
                                                            //Si la dealer est crée, alors on renvoie une fonction callback
                                                            if (isOperationCreated) {

                                                                //Puis on enregiste les images associées au produit
                                                                if (images_container.length > 0) {

                                                                    var sortieImage = 0,
                                                                        mediaDao = require("./media_dao"),
                                                                        lien_produit = null;
                                                                    mediaDao.initialize(db_js);


                                                                    for (let indexImage = 0; indexImage < images_container.length; indexImage++) {

                                                                        mediaDao.createForProduct(images_container[indexImage], "" + resultProduit.ops[0]._id,
                                                                            id_dealer, function (isMediaCreated, resultatMedia) {

                                                                                sortieImage++;

                                                                                if (isMediaCreated == true && sortieImage == 1) {
                                                                                    lien_produit = "" + resultatMedia._id;
                                                                                }


                                                                                if (sortieImage == images_container.length) {//Une fois l'enregistrement d'images fini

                                                                                    //On modifie le produit nouvellement créé afin de lui attribuer l'avatar
                                                                                    var filter = { "_id": resultProduit.ops[0]._id },
                                                                                        update = { "$set": { "lien_produit": lien_produit } };

                                                                                    collection.value.updateOne(filter, update, function (errUpdate, resultUpdate) {

                                                                                        if (errUpdate) {
                                                                                            callback(false, "Une erreur est survenue lors de l'ajout de l'image par defaut du produit : " + errUpdate);
                                                                                        } else {
                                                                                            callback(true, messageOperation, resultOPeration)
                                                                                        }
                                                                                    })

                                                                                }
                                                                            })
                                                                    }
                                                                } else {
                                                                    callback(true, messageOperation, resultOPeration)
                                                                }

                                                            } else {
                                                                callback(false, messageOperation, resultOPeration)
                                                            }
                                                        })

                                                    } else {//Si non l"enregistrement du prix n'a pas abouti
                                                        callback(false, message_prod_deal_price, null);
                                                    }
                                                })

                                        } else {
                                            callback(false, message_exchange, null)
                                        }
                                    })

                            } else {//Sinon la jointure du produit au dealer n'a pas abouti

                                callback(false, message_product_dealer, null)
                            }
                        })

                } else { //Si non l'etat sera false et on envoi un message
                    callback(false, "Aucun produit n'a été rajouté", null)
                }
            }
        })

    } catch (exception) { //Si ce bloc ne passe pas on lève une exception
        callback(false, "Une exception a été lévée lors de l'ajout du produit : " + exception, null);
    }
}

/**
 * La fonction permet de trouver tous ce qui tient lieu aux details du produit
 */
module.exports.findOneById = function (id_produit, id_client, callback) {

    try { //Si ce bloc passe

        //On se crée une variable qui transformera l'identifiant passé en ObjetID (disons en crypté)
        var _id = require("mongodb").ObjectID(id_produit),
            filter = {
                "_id": _id
            }; //Ici on crée le filtre pour faire la recherche

        //On appele la méthode findOne (une methode propre à mongoDB) de notre collection qui doit prendre le filtre afin de recherche à ce propos
        collection.value.aggregate([{
            $match: filter
        },
        {
            $project: {
                _id: 1,
                "id_produit": id_produit,
                "intitule": 1,
                "annotation": 1,
                "localisation": 1,
                "unite": 1,
                "lien_produit": 1,
                "sous_categorie": 1
            }
        }
        ]).toArray(function (err, result) {

            //S'il y a erreur
            if (err) {
                callback(false, "Une erreur est survenue lors de la recheche du produit", "" + err);

            } else { //Si non

                //On test s'il y a des résulats trouvé
                if (result) {

                    var favoris_dao = require("./favoris_dao");

                    favoris_dao.initialize(db_js);
                    favoris_dao.isThisInFavorite(id_client, result[0], function (isFound, messageFound, resultFound) {

                        callback(true, "Le produit a été trouvé avec succès", resultFound)

                    })


                } else { //Si non l'etat sera a false et y envoie un message
                    callback(false, "Aucun Produit ne correspond à cet identifiant : " + identifiant)
                }
            }
        })

    } catch (exception) { //Si ce bloc là ne passe pas alors on lève une exception
        callback(false, "Une exception a été lévée lors de la recheche de l'agent par son identifiant : " + exception);
    }
}
/**
 * La fonction qui permet de rechercher un produit spécifique suivant son identifiant
 * Elle est utilisée dans la méthode "getTop" de la DAO "commande"
 */
module.exports.findOneByIdFromCommande = function (produit, callback) {

    try {

        var _id = require("mongodb").ObjectID(produit.id_produit),
            filter = {
                "_id": _id
            };

        collection.value.findOne(filter, function (err, result) {

            if (err) {
                callback(false, "Une erreur est survenue lors de la recherche du produit dont l'identifiant est <" +
                    produit.id_produit + "> :" + err)
            } else {

                if (result) {
                    result.count = produit.count;
                    callback(true, result);
                } else {
                    callback(false, "Aucun produit ne correspond à l'identifiant : " + produit.id_produit);
                }
            }
        })

    } catch (exception) {
        callback(false, "Une exception a été léve lors de la recherche du produit de l'identifiant" + exception);
    }
}

/**
 * La fonction permettant de rechercher les détails d'un produit passé dans le pannier.
 */
module.exports.findOneByIdForAdresseLivraison = function (produit, callback) {

    try {
        var _id = require("mongodb").ObjectID(produit.id_produit),
            filter = { "_id": _id };

        collection.value.findOne(filter, function (errProduct, resultProduct) {
            if (errProduct) {
                callback(false, "Une erreur est survenue lors de la recherche du produit <" + produit.id_produit + "> : " + errProduct, null)
            } else {
                if (resultProduct) {//Si le produit recherché est trouvé

                    var details_produit = {
                        "intitule": resultProduct.intitule,
                        "pu": resultProduct.pu,
                        "unite": resultProduct.unite,
                        "medias": null
                    }


                    var media_produit_dao = require("./media_produit_dao");
                    media_produit_dao.initialize(db_js);
                    media_produit_dao.findMediaForProductByObject(produit, (isFound, messageMediaProduct, resultProductWithMedias) => {
                        if (isFound) {
                            details_produit.medias = resultProductWithMedias.medias;
                        }

                        produit.details = details_produit;

                        callback(true, messageMediaProduct, produit);
                    })

                } else {//Sinon le produit recherché n'est pas trouvé
                    callback(false, "Aucun produit ne correspond à l'identifiant <" + produit.id_produit + ">", null);
                }
            }
        })
    } catch (exception) {
        callback(false, "Une exception a été lévée lors de la recherche du produit <" + produit.id_produit + "> : " + exception, null)
    }
}
/**
 * La fonction permettant de vérifier l'identifiant du produit soumis par le dealer dans le système.
 * Elle est utilisée dans la DAO "operation_produit"
 */
module.exports.findOneByIdForSubmitingOperation = function (id_produit, callback) {
    try {
        var _id = require("mongodb").ObjectID(id_produit),
            filter = { "_id": _id },
            project = { "_id": 1 };

        collection.value.findOne(filter, project, function (err, result) {

            if (err) {
                callback(false, "Une erreur est survenue lors de la recherche du produit <" + id_produit + "> : " + err, null)
            } else {
                if (result) {
                    callback(true, null, "" + result._id);
                } else {
                    callback(false, "Aucun produit ne correspond à l'identifiant : <" + id_produit + ">", null);
                }
            }
        })
    } catch (exception) {
        callback(false, "Une exception  a été lévée lors de la recherche du produit <" + id_produit + "> : " + exception, null)
    }
}
/**
 * La fonction permettant d'avoir les détails d'un produit,
 * ELle est utilisée dans la fonction "getAllForAdmin" de la DAO "commande"
 */
module.exports.findOneByIdFromCommande2 = function (commande, callback) {

    //On vérifie si la commande possède bien des produits
    if (commande.produit.length > 0) {

        var listWithProductsDetails = [],
            sortieProduit = 0;

        commande.produit.forEach((produit, index_produit, tab_produit) => {


            findOneByIdFromCommande2Inner(produit, "" + commande._id, function (isMatched, result) {

                sortieProduit++;
                listWithProductsDetails.push(result);

                if (sortieProduit == commande.produit.length) {

                    commande.produit = [];

                    for (let indexProduitDetails = 0; indexProduitDetails < listWithProductsDetails.length; indexProduitDetails++) {
                        var produit_details = listWithProductsDetails[indexProduitDetails];
                        commande.produit.push(produit_details)
                    }

                    callback(true, commande);
                }
            })

        });

    } else {
        callback(true, commande)
    }
}

function findOneByIdFromCommande2Inner(produit, id_commande, callback) {

    try {

        var _id = require("mongodb").ObjectID(produit.id_produit),
            filter = {
                "_id": _id
            };

        produit.intitule = [];
        produit.message_erreur = null;
        produit.medias = null;
        produit.unite = null;
        produit.pu = null;

        collection.value.findOne(filter, function (err, result) {

            if (err) {
                produit.message_erreur = "Une erreur est survenue lors de la recherche de détails du produit <" +
                    produit.id_produit + "> de la commande <" + id_commande + ">: " + err;

                callback(true, produit);

            } else {

                if (result) {
                    produit.unite = result.unite;
                    produit.pu = result.pu;

                    for (let indexIntitule = 0; indexIntitule < result.intitule.length; indexIntitule++) {
                        produit.intitule.push(result.intitule[indexIntitule])
                    }

                    var media_produit_dao = require("./media_produit_dao");

                    media_produit_dao.initialize(db_js);
                    media_produit_dao.findMediaForProductByObject(produit, (isFound, messageMediaProduct, resultProductWithMedias) => {
                        produit.medias = resultProductWithMedias.medias;
                        callback(true, produit);
                    })


                } else {
                    produit.message_erreur = "Il semble que l'identifiant <" +
                        produit.id_produit + "> du produit de la commande <" + id_commande + "> ne correspond à aucun produit";

                    callback(true, produit);
                }
            }

        })

    } catch (exception) {

        produit.message_erreur = "Une exception a été lévée lors de la recherche de détails du produit <" +
            produit.id_produit + "> de la commande <" + id_commande + ">: " + exception;

        callback(true, produit)
    }
}

/**
 * La fonction qui permet de rechercher les details d'un produit spécifique suivant son identifiant
 */
module.exports.findOneByIdForGetAllDetailProduct = function (produit, callback) {

    try {

        var _id = require("mongodb").ObjectID(produit.id_produit),
            filter = {
                "_id": _id
            };

        collection.value.findOne(filter, function (err, result) {

            if (err) {
                callback(false, "Une erreur est survenue lors de la recherche du produit dont l'identifiant est <" +
                    produit.id_produit + "> :" + err)
            } else {

                if (result) {

                    /* produit.intitule = []

                    result.intitule.forEach(function (item) {
                        produit.intitule.push(item)
                    }) */

                    produit.intitule = result.intitule;
                    produit.annotation = result.annotation;
                    produit.pu = result.pu;
                    produit.lien_produit = result.lien_produit;
                    produit.sous_categorie = result.sous_categorie;

                    callback(true, produit);
                } else {
                    callback(false, "Aucun produit ne correspond à l'identifiant : " + produit.id_produit);
                }
            }
        })

    } catch (exception) {
        callback(false, "Une exception a été léve lors de la recherche du produit de l'identifiant" + exception);
    }
}

/**
 * La foction qui s'occupe de la recherche intelligente
 */
module.exports.smartFindByIntitule = function (valeur_recherche, id_client, localisation, isFromAdmin, callback) {
    try {

        //La recherche se fait sur trois niveau : 1. Catégorie , 2. Sous-catégorie , 3. Produit
        //C'est la raison d'être de cet objet avec ces trois liste : 

        var objetList = {
            listeResultatCategorie: [],
            listeResultatSousCategorie: [],
            listeResultatProduit: []
        }

        //On procède au premier niveau de recherche
        var categorie_model = require("./categorie_dao");
        categorie_model.initialize(db_js);


        //On exécute la fonction de la smartSearch catégorie
        categorie_model.findListByIntitule(valeur_recherche, function (isCategoriesMatched, resultCategories) {

            if (isCategoriesMatched) { //si la smartResearch sur les catégories a renvoyé au moins une catégorie

                var sortieCategorie = 0;

                //On passe en boucle les catégories
                for (var indexCategorie = 0; indexCategorie < resultCategories.length; indexCategorie++) {

                    //Puis on recherche tous les produits liés aux sous-catégories de la catégorie en cours
                    //de lecture
                    categorie_model.findListProduitFromIdCategory(resultCategories[indexCategorie],
                        function (isProduitFromCategoryMatched, resultProduitFromCategory) {

                            //On incrémente la variable de sortie de la boucle catégorie
                            sortieCategorie++;

                            var objetCategorie = {
                                intitule: null,
                                listeProduit: []
                            };

                            //On recupère l'intitule de la catégorie
                            objetCategorie.intitule = resultProduitFromCategory.intitule_categorie;

                            //Et si la recherche a renvoyé au moins un produit
                            if (isProduitFromCategoryMatched) {

                                //On passe en boucle ces produits et on les ajoute dans la liste leurs étant destinée
                                for (var indexProduitFromCate = 0; indexProduitFromCate < resultProduitFromCategory.listProduit.length; indexProduitFromCate++) {

                                    objetCategorie.listeProduit.push(resultProduitFromCategory.listProduit[indexProduitFromCate])
                                }
                            }

                            //On ajoute l'ensemble de résultats sur la catégorie encours à la liste globale 
                            objetList.listeResultatCategorie.push(objetCategorie);

                            //Et on vérifie la condition de sortie de la boucle sur la smartSearch sur les catégories
                            if (sortieCategorie == resultCategories.length) {

                                //On passe à la recherche des sous-catégories
                                categorie_model.findUnderCategoryListByIntitule(valeur_recherche,
                                    function (isUnderCatMatched, resultUnderCategories) {


                                        if (isUnderCatMatched) { //si au moins une sous-catégories est trouvée

                                            for (var indexResultSousCategorie = 0; indexResultSousCategorie < resultUnderCategories.length; indexResultSousCategorie++) {
                                                var element = resultUnderCategories[indexResultSousCategorie];

                                                objetList.listeResultatSousCategorie.push(element);

                                            }

                                            //Puis on passe à la recherche des produits
                                            var filter = {
                                                "intitule": new RegExp(valeur_recherche, "i"),
                                                "flag": true
                                            };

                                            collection.value.find(filter).toArray(function (errProduct, resultProduct) {

                                                if (errProduct) {
                                                    callback(false, "Une erreur est survenue lors de la smartSearch sur les produits :" + errProduct);
                                                } else {
                                                    if (resultProduct.length > 0) {

                                                        for (var indexProd = 0; indexProd < resultProduct.length; indexProd++) {
                                                            var itemProd = resultProduct[indexProd];
                                                            objetList.listeResultatProduit.push(itemProd);
                                                        }

                                                        if (isFromAdmin == false) {
                                                            saveResearch(id_client, valeur_recherche, true, localisation)
                                                        }
                                                        callback(true, objetList);

                                                    } else {

                                                        if (isFromAdmin == false) {
                                                            saveResearch(id_client, valeur_recherche, false, localisation)
                                                        }
                                                        callback(false, objetList);
                                                    }
                                                }
                                            })

                                        } else {

                                            //Puis on passe à la recherche des produits
                                            var filter = {
                                                "intitule": new RegExp(valeur_recherche, "i"),
                                                "flag": true
                                            };

                                            collection.value.find(filter).toArray(function (errProduct, resultProduct) {

                                                if (errProduct) {
                                                    callback(false, "Une erreur est survenue lors de la smartSearch sur les produits :" + errProduct);
                                                } else {
                                                    if (resultProduct.length > 0) {

                                                        for (var indexProd = 0; indexProd < resultProduct.length; indexProd++) {
                                                            var itemProd = resultProduct[indexProd];
                                                            objetList.listeResultatProduit.push(itemProd);
                                                        }

                                                        if (isFromAdmin == false) {
                                                            saveResearch(id_client, valeur_recherche, true, localisation)
                                                        }
                                                        callback(true, objetList);

                                                    } else {

                                                        if (isFromAdmin == false) {
                                                            saveResearch(id_client, valeur_recherche, false, localisation)
                                                        }
                                                        callback(false, objetList);
                                                    }
                                                }
                                            })
                                        }

                                    })

                            }

                        })
                }

            } else { //Sinon aucune catégorie n'a été trouvée

                //Dans ce cas on passe à la recherche portant sur les sous-catégorie
                categorie_model.findUnderCategoryListByIntitule(valeur_recherche,
                    function (isUnderCatMatched, resultUnderCategories) {


                        if (isUnderCatMatched) { //si au moins une sous-catégories est trouvée

                            for (var indexResultSousCategorie = 0; indexResultSousCategorie < resultUnderCategories.length; indexResultSousCategorie++) {
                                var element = resultUnderCategories[indexResultSousCategorie];

                                objetList.listeResultatSousCategorie.push(element);

                            }

                            //Puis on passe à la recherche des produits
                            var filter = {
                                "intitule": new RegExp(valeur_recherche, "i"),
                                "flag": true
                            };

                            collection.value.find(filter).toArray(function (errProduct, resultProduct) {

                                if (errProduct) {

                                    callback(false, "Une erreur est survenue lors de la smartSearch sur les produits :" + errProduct);
                                } else {
                                    if (resultProduct.length > 0) {

                                        for (var indexProd = 0; indexProd < resultProduct.length; indexProd++) {
                                            var itemProd = resultProduct[indexProd];
                                            objetList.listeResultatProduit.push(itemProd);
                                        }

                                        if (isFromAdmin == false) {
                                            saveResearch(id_client, valeur_recherche, true, localisation)
                                        }
                                        callback(true, objetList);

                                    } else {

                                        if (isFromAdmin == false) {
                                            saveResearch(id_client, valeur_recherche, false, localisation)
                                        }
                                        callback(false, objetList);
                                    }
                                }
                            })

                        } else { //Sinon aucune sous-catégorie n'a été trouvée, on passe à la recherche des produits

                            var filter = {
                                "intitule": new RegExp(valeur_recherche, "i"),
                                "flag": true
                            };


                            collection.value.find(filter).toArray(function (errProduct, resultProduct) {

                                if (errProduct) {

                                    callback(false, "Une erreur est survenue lors de la smartSearch sur les produits :" + errProduct);
                                } else {
                                    if (resultProduct.length > 0) {

                                        var sortie_produit = 0,
                                        liste_erreur = [],
                                        produit_dealer_dao = require("./produit_dealer_dao");

                                        produit_dealer_dao.initialize(db_js);

                                        // for (var indexProd = 0; indexProd < resultProduct.length; indexProd++) {
                                        //     var itemProd = resultProduct[indexProd];
                                        //     objetList.listeResultatProduit.push(itemProd);
                                        // }
                                        //START HERE
                                        for (var indexProd = 0; indexProd < resultProduct.length; indexProd++) {
                                            produit_dealer_dao.getAllByIdProduit(resultProduct[indexProd], 
                                            function(is_prod_deal, message_prod_deal, result_product_dealer) {
                                                
                                                sortie_produit++;
                    
                                                if(is_prod_deal){
                    
                                                    for (let index_prod_deal = 0; index_prod_deal < result_product_dealer.length; index_prod_deal++) {
                                                        //liste_retour.push(result_product_dealer[index_prod_deal]);
                                                        objetList.listeResultatProduit.push(result_product_dealer[index_prod_deal]);
                                                    }
                                                    
                                                }else{
                                                    liste_erreur.push(message_prod_deal);
                                                }
                    
                                                if(sortie_produit == resultProduct.length){

                                                    if (isFromAdmin == false) {
                                                        saveResearch(id_client, valeur_recherche, true, localisation)
                                                    }
                    
                                                    //sous_categorie.listeProduit = liste_retour;
                                                    if(objetList.listeResultatProduit.length > 0){
                                                        
                                                        callback(true, objetList);
                    
                                                    }else{
                    
                                                        liste_erreur.push("Aucun produit trouvé n'a été rajouté à la liste de retour");
                                                        callback(false, liste_erreur);
                                                    }
                                                }
                                            });
                                        }
                                        //END HERE
                                        // if (isFromAdmin == false) {
                                        //     saveResearch(id_client, valeur_recherche, true, localisation)
                                        // }
                                        // callback(true, objetList);

                                    } else {

                                        if (isFromAdmin == false) {
                                            saveResearch(id_client, valeur_recherche, false, localisation)
                                        }

                                        callback(false, objetList);
                                    }
                                }
                            })
                        }

                    })

            }
        })

    } catch (exception) {
        callback(false, "Une exception a été lors de la smartSearch : " + exception);
    }
}

function saveResearch(id_client, keyword, researchState, localisation) {

    var recheche_dao = require("./admin/recherche_dao"),
        rechreche_entity = require("./entities/recherche_entity").Recherche();

    rechreche_entity.id_client = id_client;
    rechreche_entity.valeur = keyword;
    rechreche_entity.date = new Date();

    if (researchState) {
        rechreche_entity.etat = "found"
    } else {
        rechreche_entity.etat = "not_found"
    }

    rechreche_entity.localisation = localisation;


    recheche_dao.initialize(db_js);
    recheche_dao.create(rechreche_entity, function (isResearchSaved, resultSavingResearch) {

        console.log(resultSavingResearch)
    })

}

/**
 * La fonction qui permet de recherche la liste de produits correspondants à une sous-catégorie spécifique
 * Elle est utilisée dans la méthode "findUnderCategoryListByIntitule" de la DAO "CATEGORIE"
 */
module.exports.findListByIdSousCategorieFromCategorie = function (sous_categorie, callback) {

    var liste_erreur = [];
    try {

        var filter = {
            "sous_categorie": sous_categorie.id,
            "flag": true
        };

        collection.value.find(filter).toArray(function (err, result) {

            if (err) {
                callback(false, "Une erreur est survenue lors de la recherche des produits correspondants à une sous-catégorie : " + err);
            } else {

                if (result.length > 0) {

                    

                    var produit_dealer_dao = require("./produit_dealer_dao");

                    produit_dealer_dao.initialize(db_js);

                    var liste_retour = [],
                        sortie_produit = 0;

                    for (let index_produit = 0; index_produit < result.length; index_produit++) {
                                      
                        
                        produit_dealer_dao.getAllByIdProduit(result[index_produit], 
                        function(is_prod_deal, message_prod_deal, result_product_dealer) {
                            
                            sortie_produit++;

                            if(is_prod_deal){

                                for (let index_prod_deal = 0; index_prod_deal < result_product_dealer.length; index_prod_deal++) {
                                    liste_retour.push(result_product_dealer[index_prod_deal]);
                                    
                                }
                                
                            }else{
                                liste_erreur.push(message_prod_deal);
                            }

                            if(sortie_produit == result.length){

                                sous_categorie.listeProduit = liste_retour;
                                if(liste_retour.length > 0){

                                    callback(true, liste_erreur,  sous_categorie);

                                }else{

                                    liste_erreur.push("Aucun produit trouvé n'a été rajouté à la liste de retour");
                                    callback(false, liste_erreur, sous_categorie.listeProduit = liste_retour);
                                }
                            }
                        });
                    }                    

                } else {

                    liste_erreur.push("Aucun produit n'a été trouvé pour la sous-categorie : " + sous_categorie.id);
                    callback(false, liste_erreur, null);
                }
            }
        })

    } catch (exception) {

        liste_erreur.push("Une exception a été lévée lors de la recherche des produits correspondants à une sous-catégorie : " + exception);
        callback(false, liste_erreur, null);
    }
}

/**
 * La fonction qui permet de trouver la liste de produits appartenant à la même sous-catégorie
 * Elle est utilisée lorsque l'utilisateur visualise les détails d'un produit donnée, le système
 * lui suggère aussi les produits de la même sous-catégorie que le produit.
 */
module.exports.findListByIdSousCategorie = function (id_client, id_produit, callback) {

    try {

        var filter = {
            "_id": require("mongodb").ObjectID(id_produit)
        }

        //On recherche d'abord le produit
        collection.value.findOne(filter, function (errProduct, resultProduct) {

            if (errProduct) {
                callback(false, "Une erreur est survenue lors de la recherche de produits appartenant à la même sous-catégorie que le produit '" +
                    id_produit + "' : " + errProduct);
            } else {

                if (resultProduct) { //Si le produit est trouvé

                    //On recherche à présent tous les produits appartenant aux même sous-catégories que le produit
                    //Pour cela on va devoir passer en boucle l'ensemble des items de la propriété "sous_categorie" du produit

                    var listeProduit = [],
                        sortieSousCategorie = 0;

                    for (var indexSousCategorie = 0; indexSousCategorie < resultProduct.sous_categorie.length; indexSousCategorie++) {

                        collection.value.aggregate([{
                            $match: {
                                "sous_categorie": resultProduct.sous_categorie[indexSousCategorie],
                                "flag": true
                            }
                        },
                        {
                            $project: {
                                "_id": 0,
                                "id_produit": "$_id",
                                "intitule": 1,
                                "annotation": 1,
                                "localisation": 1,
                                "pu": 1,
                                "lien_produit": 1,
                                "sous_categorie": 1,
                                "date": 1
                            }
                        }
                        ]).toArray(function (errSousCategorie, resultSousCategorie) {

                            //On incrémente la variable de sortie
                            sortieSousCategorie++;

                            //On vérifie le contenu du resultat de la recherche
                            if (resultSousCategorie.length > 0) { //Si au moins un produit a été trouvé

                                //On passe en boucle le résultat afin de recupérer les produits et les ajouter dans la liste de sortie
                                for (var indexProduit = 0; indexProduit < resultSousCategorie.length; indexProduit++) {

                                    if (resultSousCategorie[indexProduit].id_produit != id_produit) {
                                        listeProduit.push(resultSousCategorie[indexProduit]);
                                    }

                                }

                            }

                            //Puis on vérifie la condition de sortie
                            if (sortieSousCategorie == resultProduct.sous_categorie.length) {

                                //En fonction de la taille de la liste de sortie, on renverra TRUE ou FALSE au client
                                if (listeProduit.length > 0) {
                                    //callback(true, listeProduit)

                                    var favoris_dao = require("./favoris_dao"),
                                        sortieListe = 0,
                                        listeProductWithFavoriteState = [];

                                    favoris_dao.initialize(db_js);
                                    for (let indexListe = 0; indexListe < listeProduit.length; indexListe++) {
                                        favoris_dao.isThisInFavorite(id_client, listeProduit[indexListe], function (isMatched, message, resultProductWithFavoriteState) {

                                            listeProductWithFavoriteState.push(resultProductWithFavoriteState);
                                            sortieListe++;

                                            if (sortieListe == listeProduit.length) {
                                                callback(true, listeProductWithFavoriteState)
                                            }
                                        })
                                    }
                                } else {
                                    callback(false, "Aucun autre produit n'appartient à la même sous-catégorie que le produit : " + id_produit);
                                }
                            }
                        })

                    }

                } else { //Sinon aucun produit ne correspond à l'identifiant de recherche
                    callback(false, "Aucun résultat n'a été trouvé lors de la recherche de produits appartenant à la même sous-catégorie que le produit '" +
                        id_produit + "', car le produit recherché n'a pas été trouvé ");
                }
            }
        })


    } catch (exception) {

        callback(false, "Une exception a été lévée lors de la recherche des produits correspondants à une sous-catégorie : " + exception);
    }
}

/**
 * La fonction qui permet de renvoyer la liste de produits d'une même sous-catégorie.
 * Elle est utilisée lorsque le client visite les détails de la sous-catégorie.
 */
module.exports.findListByIdSousCategorieForSousCategorie = function (id_client, sous_categorie, callback) {

    try {

        var filter = {
            "sous_categorie": sous_categorie,
            "flag": true
        }

        collection.value.aggregate([{
            $match: filter
        },
        {
            $project: {
                "_id": 0,
                "id_produit": "$_id",
                "intitule": 1,
                "annotation": 1,
                "localisation": 1,
                "lien_produit": 1,
                "sous_categorie": 1,
                "unite": 1
            }
        }
        ]).toArray(function (err, result) {

            if (err) {
                callback(false, "Une erreur est survenue lors de la recherche de la liste de produits de la sous-categorie '" + sous_categorie + "' : " + err)
            } else {

                if (result.length > 0) {

                    //On doit rélier chaque produit à son média
                    var sortie_produit = 0,
                        list_retour = [],
                        list_erreur = [],
                        operation_produit_dao = require("./operation_produit_dao");
                    operation_produit_dao.initialize(db_js);


                    //On passe en boucle les produits
                    for (let indexProduit = 0; indexProduit < result.length; indexProduit++) {

                        module.exports.getAllDeeperProductDetails(result[indexProduit], id_client,
                            function (is_match, message_match, result_match) {
                                sortie_produit++;

                                if (is_match) {
                                    if (result_match.length > 0) {
                                        for (let index_result = 0; index_result < result_match.length; index_result++) {
                                            list_retour.push(result_match[index_result]);
                                        }
                                    }

                                } else {
                                    list_erreur.push(message_match);
                                }

                                if (sortie_produit == result.length) {
                                    callback(true, list_erreur, list_retour)
                                }

                            });
                    }

                } else {
                    callback(false, "Aucun produit n'a été trouvé pour cette sous-catégorie...")
                }
            }
        })

    } catch (exception) {

        callback(false, "Une exception a été lévée lors de la recherche des produits correspondants à la sous-categorie '" + sous_categorie + "' : " + exception);
    }
}

/**
 * La fonction permettant de rechercher les détails d'un produit.Elle est utilisée lorsqu'on affiche les produits
 * dans la deuxième étape de la commande. 
 * Mais elle peut aussi servir à previsualiser un produit.
 */
module.exports.findOneFromCart = function (produit, id_client, callback) {

    if (produit) {

        try {

            var _id = require("mongodb").ObjectId(produit.id_produit),
                filter = { "_id": _id };

            collection.value.findOne(filter, function (err, result) {
                if (err) {
                    callback(false, "Une erreur est survenue lors de la recherche du produit <" +
                        produit.id_produit + "> : " + exception, produit)
                } else {
                    if (result) {
                        var infos_produit = {
                            "intitule": result.intitule,
                            "pu": result.pu,
                            "lien_produit": result.lien_produit,
                            "unite" : result.unite
                        }
                        produit.infos_produit = infos_produit;
                        produit.infos_deal = null;

                        //On recupère le média
                        var media_dao = require("./media_dao");
                        media_dao.initialize(db_js);
                        media_dao.findOneByIdFromTopProduct(produit,
                            function (isChecked, resultMessage, resultProductWithMedia) {

                                //On vérifie si le produit est dans les favoriq
                                var favoris_dao = require("./favoris_dao");
                                favoris_dao.initialize(db_js);

                                favoris_dao.isThisInFavoriteForCommande(id_client, resultProductWithMedia,
                                    function (isMatched, message, resultProductWithFavoriteState) {

                                        var produit_dealer_dao = require("./produit_dealer_dao");
                                        produit_dealer_dao.initialize(db_js);
                                        produit_dealer_dao.findOneByIdProduitIdDealerIdSalingPlace(resultProductWithFavoriteState,
                                            function (is_product_dealer, messages_product_dealer, result_product_dealer) {

                                                callback(is_product_dealer, messages_product_dealer, result_product_dealer)
                                            })
                                    })
                            })

                    } else {
                        callback(false, "Aucun produit ne correspond à l'identifiant <" + produit.id_produit + ">", produit)
                    }
                }
            })
        } catch (exception) {
            callback(false, "Une exception a été lévée lors de la recherche du produit <" +
                produit.id_produit + "> : " + exception, produit);
        }
    } else {
        callback(false, "Aucun produit n'est soumis poour la recherche", null);
    }
}

/**
 * La fonction qui permet de trouver la liste de sous-catégorie appartenant à la même catégorie
 * que la sous-catégorie du produit dont l'utilisateur visualise
 * ELle suggère ainsi ces autres sous-catégories à l'utilisateur
 */
module.exports.findListCategorieByIdProduct = function (id_produit, callback) {

    try {

        //On recherche d'abord le produit
        var _id = require("mongodb").ObjectID(id_produit),
            filter = {
                "_id": _id
            };

        collection.value.findOne(filter, function (err, resultProduct) {

            if (err) {
                callback(false, "Une erreur est survenue lors de la recherche de la catégorie du produit dont l'identifiant est <" +
                    id_produit + "> :" + err)
            } else {

                if (resultProduct) { //Si le produi est trouvé

                    //On vérifie si le produit contient au moins une sous-catégorie
                    if (resultProduct.sous_categorie.length > 0) {

                        var listeCategorie = [],
                            sortieCategorie = 0,
                            categorie_model = require("./categorie_dao");

                        categorie_model.initialize(db_js);

                        for (var indexSousCategorie = 0; indexSousCategorie < resultProduct.sous_categorie.length; indexSousCategorie++) {

                            //On recherche la catégorie
                            categorie_model.findOneByIdSousCategorieFromProduct(resultProduct.sous_categorie[indexSousCategorie], function (isCategoriesMatched, resultCategorie) {

                                //On incrémente la variable de sortie
                                sortieCategorie++;

                                if (isCategoriesMatched) { //si la catégorie est trouvée
                                    if (listeCategorie.length == 0) {
                                        listeCategorie.push(resultCategorie);
                                    } else {

                                        let isAllReadyMatched = false;

                                        listeCategorie.every(function (cat) {

                                            if (cat._id == resultCategorie._id) {
                                                isAllReadyMatched = true;
                                            }
                                        });

                                        if (isAllReadyMatched == false) {
                                            listeCategorie.push(resultCategorie)
                                        }
                                    }
                                }

                                //Puis on vérifie la condition de sortie de la boucle
                                if (sortieCategorie == resultProduct.sous_categorie.length) {

                                    if (listeCategorie.length > 0) {
                                        callback(true, listeCategorie)
                                    } else {
                                        callback(false, "Aucune catégorie n'a été trouvée");
                                    }
                                }
                            })
                        }
                    } else {
                        callback(false, "Le produit <" + id_produit + "> n'est affecté à aucune sous-catégorie");
                    }

                } else { //Si non aucun produit ne correspond à l'identifiant fourni
                    callback(false, "Aucun produit ne correspond à l'identifiant : " + id_produit);
                }
            }
        })

    } catch (exception) {
        callback(false, "Une exception a été lévée lors de la recherche de la catégorie du produit '" + id_produit + "' : " + exception);
    }
}

/**
 * La fonction qui permet de rechercher les details d'un produit spécifique suivant son identifiant pour le dealer qui gère ce fameux produit
 * @param {*} produit L'objet qui contient vaguement le produit (d'où on l'on tirera l'id_produit)
 * @param {Function} callback Fonction de retour
 */
module.exports.getAllProductHandlerDealer = function (produit, callback) {

    try {

        var _id = require("mongodb").ObjectID(produit.id_produit),
            filter = {
                "_id": _id
            };

        collection.value.findOne(filter, function (err, result) {

            if (err) {
                callback(false, "Une erreur est survenue lors de la recherche du produit dont l'identifiant est <" +
                    produit.id_produit + "> :" + err)
            } else {

                if (result) {

                    produit.intitule = result.intitule;
                    produit.annotation = result.annotation;
                    produit.pu = parseFloat(result.pu);
                    produit.lien_produit = result.lien_produit;
                    produit.unite = result.unite;

                    var mediaDao = require("./media_dao");
                    mediaDao.initialize(db_js);

                    mediaDao.findOneByIdFromFavoris(produit, function (isMedia, messageMedia, resultWithMedia) {

                        callback(true, resultWithMedia);
                    })


                } else {
                    callback(false, "Aucun produit ne correspond à l'identifiant : " + produit.id_produit);
                }
            }
        })

    } catch (exception) {
        callback(false, "Une exception a été léve lors de la recherche du produit de l'identifiant" + exception);
    }
}

/**
 * La fonction permettant de rechercher un produit par son identifiant
 * Elle est utilisée dans la DAO "operation_produit"
 */
module.exports.findOneByIdFromOperation = function (id_client, operationProduit, callback) {

    try {
        //On verifie si les opérations contiennet des items
        if (operationProduit.operation.length > 0) {

            var sortieProduit = 0,
                favoris_dao = require("./favoris_dao"),
                list_operation_sortie = [];

            favoris_dao.initialize(db_js);

            //On passe en boucle chaque opération afin d'y ressortir les éléments. 
            for (let indexOperation = 0; indexOperation < operationProduit.operation.length; indexOperation++) {

                //Pour chaque opération, on va recherché les informations du produit associé
                var _id = require("mongodb").ObjectID(operationProduit.operation[indexOperation].id_produit),
                    filter = {
                        "_id": _id
                    };

                collection.value.findOne(filter, function (err, resultProduit) {

                    if (err) {
                        callback(false, "Une erreur est survenue lors de la recherche du produit : " + err);
                    } else {

                        if (resultProduit) {//Si le produit est trouvé

                            var content_operation = {
                                "id_operation": operationProduit.operation[sortieProduit].id_operation,
                                "id_dealer": operationProduit.operation[sortieProduit].id_dealer,
                                "id_lieu_vente": operationProduit.operation[sortieProduit].id_lieu_vente,
                                "infos_dealer": null,
                                "infos_lieu_vente": null,
                                "stock": null,
                                "id_produit_dealer_prix": operationProduit.operation[sortieProduit].id_produit_dealer_prix,
                                "prix_produit": null,
                                "infos_produit": null
                            }

                            var content_product = {
                                "intitule": resultProduit.intitule,
                                "annotation": resultProduit.annotation,
                                "unite": resultProduit.unite,
                                "localisation": resultProduit.localisation,
                                "lien_produit": resultProduit.lien_produit,
                                "sous_categorie": resultProduit.sous_categorie,
                                "id_produit": "" + resultProduit._id,
                                "isThisInFavorite": false
                            }

                            content_operation.infos_produit = content_product;


                            //On vérifie si le produit figure parmi les favoris du client
                            favoris_dao.isThisInFavoriteFromOperation(id_client, content_operation,
                                function (isChecked, message, resultWithFavoriteState) {

                                    //On passe à la recherche du média produit
                                    var media_dao = require("./media_dao");
                                    media_dao.initialize(db_js);
                                    media_dao.findOneByIdFromTopProduct(resultWithFavoriteState,
                                        function (is_media, message_media, result_with_media) {

                                            //On passe à la recherche du dealer.
                                            var dealer_dao = require("./dealer_dao");
                                            dealer_dao.initialize(db_js);

                                            dealer_dao.findOneByIdForOperation(result_with_media,
                                                function (is_dealer, message_dealer, result_with_dealer) {

                                                    //On recherche le lieu de vente du produit*
                                                    var adresse_dao = require("./adresse_dao");
                                                    adresse_dao.initialize(db_js);
                                                    adresse_dao.findOneByIdFromOperation(result_with_dealer, function (is_address, message_adress, result_with_address) {

                                                        //On recherche le stock
                                                        //Puis on recherche le stock
                                                        var operation_produit_dao = require("./operation_produit_dao");
                                                        operation_produit_dao.initialize(db_js);

                                                        var operation_produit_entity = {
                                                            "id_produit": result_with_address.infos_produit.id_produit,
                                                            "id_dealer": result_with_address.id_dealer,
                                                            "id_lieu_vente": result_with_address.id_lieu_vente,
                                                        }

                                                        operation_produit_dao
                                                            .checkAvailableProductByIdDealerAndIdProductForProductDetails(operation_produit_entity,
                                                                function (is_stock, message_stock, containerStockDispo) {

                                                                    result_with_address.stock = {
                                                                        "quantite": 0,
                                                                        "erreur": null
                                                                    };

                                                                    if (is_stock) {
                                                                        result_with_address.stock.quantite = containerStockDispo
                                                                    } else {
                                                                        result_with_address.stock.erreur = message_stock
                                                                    }

                                                                    //On recherche le prix du produit

                                                                    var produit_dealer_prix_dao = require("./produit_dealer_prix_dao");
                                                                    produit_dealer_prix_dao.initialize(db_js);

                                                                    produit_dealer_prix_dao.findOneById(result_with_address.id_produit_dealer_prix,
                                                                        function (is_price, message_price, result_price) {

                                                                            sortieProduit++;

                                                                            result_with_address.prix_produit = result_price;
                                                                            delete result_with_address.id_produit_dealer_prix;

                                                                            list_operation_sortie.push(result_with_address)

                                                                            if (sortieProduit == operationProduit.operation.length) {

                                                                                operationProduit.operation = null;
                                                                                operationProduit.operation = list_operation_sortie;
                                                                                callback(true, operationProduit)
                                                                            }
                                                                        })

                                                                })

                                                    })

                                                })

                                        })
                                })

                        } else {
                            callback(false, "Aucun produit ne correspond à la valeur de recherche");
                        }
                    }

                })
            }
        } else {
            callback(false, "Aucun produit n'a été trouvé")
        }
    } catch (exception) {
        callback(false, "Une exception a été lévée lors la recherche du produit : " + exception, null)
    }

}

/**
 * La fonction permettant de trouver le détails d'un produit validé par un agent. 
 * Elle est utilisée dans la DAO 'operation produit'
 */
module.exports.findOneByIdFromOperationVenteForAdmin = function (operationVente, callback) {

    try {

        operationVente.intitule_produit = null;
        operationVente.pu_produit = null;
        operationVente.lien_produit = null;
        operationVente.image_name = null;
        operationVente.image_path = null;
        operationVente.unite_produit = null;
        operationVente.listeErreur = [];


        //Pour chaque produit, on va recherché ses informations
        var _id = require("mongodb").ObjectID(operationVente.id_produit),
            filter = {
                "_id": _id
            };

        collection.value.findOne(filter, function (err, resultProduit) {


            if (err) {

                operationVente.listeErreur.push("Une erreur est survenue lors de la recherche du produit : " + err);
                callback(false, operationVente);
            } else {

                if (resultProduit) {

                    operationVente.intitule_produit = resultProduit.intitule;
                    operationVente.pu_produit = resultProduit.pu;
                    operationVente.lien_produit = resultProduit.lien_produit;
                    operationVente.unite_produit = resultProduit.unite;

                    var dealer_dao = require("./dealer_dao");
                    dealer_dao.initialize(db_js);

                    dealer_dao.findOneByIdFromOperationVenteForAdmin(operationVente, function (isDealer, resultWithDealer) {


                        callback(isDealer, resultWithDealer)
                    })

                } else {
                    operationVente.listeErreur.push("Aucun produit ne correspond à la valeur de recherche");

                    var dealer_dao = require("./dealer_dao");
                    dealer_dao.initialize(db_js);

                    dealer_dao.findOneByIdFromOperationVenteForAdmin(operationVente, function (isDealer, resultWithDealer) {

                        if (resultWithDealer.id_produit == "5b677c423c90df234d874f1a") {
                            console.log("INVISIBLE");
                        }
                        callback(isDealer, resultWithDealer)
                    })
                }
            }

        })


    } catch (exception) {

        operationVente.listeErreur.push("Une exception a été lévée lors la recherche du produit");
        callback(false, operationVente)
    }

}

/**
 * La fonction permettant de rechercher les produits suivant une valeur sur les intitulés
 * ELle est utilisée dans la fonction "searchCommande" de la DAO "commande"
 */
module.exports.findListByIntituleFromCommande = function (valeur_recherche, callback) {

    try {

        var filter = {
            "intitule": {
                "$regex": new RegExp(valeur_recherche, "i"),
            },
            "flag": true
        };

        collection.value.find(filter).toArray(function (err, result) {
            if (err) {

            } else {
                if (result.length > 0) {
                    callback(true, result)
                } else {
                    callback(false, "Aucun produit ne possède un intitulé correspondant à la valeur <" + valeur_recherche + ">")
                }
            }
        })

    } catch (exception) {
        callback(false, "Une exception a été lévée lors de la recherche des produits par intitulés : " + exception);
    }
}

//endregion

module.exports.findOneByIdForAllProductByDealer = function (operationProduit, callback) {

    try {

        var _id = require("mongodb").ObjectID(operationProduit.id_produit),
            filter = { "_id": _id };

        collection.value.findOne(filter, function (errProduct, resultProduct) {

            if (errProduct) {
                callback(false, "Une erreur est survenue lors de la rechercher du produit <" + operationProduit.id_produit + "> : " + errProduct, null);
            } else {
                if (resultProduct) {

                    var mediaDao = require("./media_dao");
                    mediaDao.initialize(db_js);
                    mediaDao.findOneByIdFromFavoris(resultProduct, function (isMedia, messageMedia, resultWithMedia) {

                        callback(isMedia, messageMedia, resultWithMedia)
                    })
                } else {
                    callback(false, "Aucun produit ne correspond à l'identifiant <" + operationProduit.id_produit + ">", null)
                }
            }
        })

    } catch (exception) {
        callback(false, "Une exception a été lévée lors de la recherche du produit <" + operationProduit.id_produit + "> : " + exception, null);
    }
}

/**
 * La fonction permettant de lister tous les produits d'une même sous-catégorie. 
 * Elle est utilisée dans l'administration.
 */
module.exports.findListByIdSousCategorieForAdmin = function (sous_categorie, callback) {

    try {

        var filter = {
            "sous_categorie": sous_categorie
        }

        collection.value.aggregate([{
            $match: filter
        },
        {
            $project: {
                "_id": 1,
                "intitule": 1,
                "annotation": 1,
                "lien_produit": 1,
                "sous_categorie": 1
            }
        }
        ]).toArray(function (err, result) {

            if (err) {
                callback(false, "Une erreur est survenue lors de la recherche de la liste de produits de la sous-categorie '" + sous_categorie + "' : " + err)
            } else {

                if (result.length > 0) {

                    //On doit rélier chaque produit à son média
                    var mediaDao = require("./media_dao"),
                        sortieMedia = 0,
                        listeProductWithMedia = [];

                    mediaDao.initialize(db_js);

                    //On passe en boucle les produits
                    for (let indexProduit = 0; indexProduit < result.length; indexProduit++) {

                        mediaDao.findOneByIdFromTopProduct(result[indexProduit],
                            function (isChecked, resultMessage, resultProductWithMedia) {

                                sortieMedia++;

                                listeProductWithMedia.push(resultProductWithMedia)

                                //Puis on vérifie la condition de sortie
                                if (sortieMedia == result.length) {

                                    //On passe au comptage favoris
                                    var favoris_dao = require("./favoris_dao"),
                                        sortieFavoris = 0,
                                        listeProductWithSumFavorite = [];

                                    favoris_dao.initialize(db_js);

                                    for (let indexProdMedia = 0; indexProdMedia < listeProductWithMedia.length; indexProdMedia++) {

                                        favoris_dao.countFavorisForProduitForAdmin(listeProductWithMedia[indexProdMedia],
                                            function (isProdFavorite, resultWithSumFavorite) {

                                                sortieFavoris++;
                                                listeProductWithSumFavorite.push(resultWithSumFavorite);

                                                if (sortieFavoris == listeProductWithMedia.length) {//On sort de la boucle de favoris

                                                    //On passe now à la recherhce du nombre en stock du produit
                                                    var operation_produit_dao = require("./operation_produit_dao"),
                                                        sortieOperation = 0,
                                                        listeProductWithStock = [];

                                                    operation_produit_dao.initialize(db_js);
                                                    for (let indexProdFavoris = 0; indexProdFavoris < listeProductWithSumFavorite.length; indexProdFavoris++) {

                                                        operation_produit_dao.countReserveStockByProductIdForAdmin(listeProductWithSumFavorite[indexProdFavoris],
                                                            function (isStockAvailable, messageStock, resultWithStock) {

                                                                sortieOperation++;

                                                                resultWithStock.errorStock = null;

                                                                if (isStockAvailable == false) {
                                                                    resultWithStock.errorStock = messageStock;
                                                                }

                                                                listeProductWithStock.push(resultWithStock);

                                                                //On gère la sortie de l'étape stock
                                                                if (sortieOperation == listeProductWithSumFavorite.length) {

                                                                    //Et on attéri pas la recherche de la somme de commande par produit.
                                                                    var listeProductWithSumCommande = [],
                                                                        sortieCommande = 0,
                                                                        commande_dao = require("./commande_dao");

                                                                    commande_dao.initialize(db_js);

                                                                    for (let indexCommande = 0; indexCommande < listeProductWithStock.length; indexCommande++) {
                                                                        commande_dao.countCommandeByIdProduitForProdAdmin(listeProductWithStock[indexCommande],
                                                                            function (isSumCommande, resultWithSumCommande) {

                                                                                sortieCommande++;
                                                                                listeProductWithSumCommande.push(resultWithSumCommande);

                                                                                //Puis on gère la sortie de l'étape somme commande
                                                                                if (sortieCommande == listeProductWithStock.length) {
                                                                                    callback(true, listeProductWithSumCommande)
                                                                                }
                                                                            })

                                                                    }
                                                                }

                                                            })
                                                    }
                                                }
                                            })
                                    }

                                }
                            })
                    }

                } else {
                    callback(false, "Aucun produit n'a été trouvé pour cette sous-catégorie...")
                }
            }
        })


    } catch (exception) {

        callback(false, "Une exception a été lévée lors de la recherche des produits correspondants à la sous-categorie '" + sous_categorie + "' : " + exception);
    }
}

/**
 * La fonction permettant d'avoir les détails d'un produit. 
 * Elle est utilisée dans l'administration
 */
module.exports.findOneByIdForAdmin = function (id_produit, callback) {

    try {

        var _id = require("mongodb").ObjectID(id_produit),
            filter = { "_id": _id };

        collection.value.findOne(filter, function (errProduct, resultProduct) {

            if (errProduct) {
                callback(false, "Une erreur est survenue lors de la recherche des infos du produit <" + id_produit + "> : " + errProduct)
            } else {

                if (resultProduct) {//Si le produit est trouvé

                    resultProduct.listeErreur = [];

                    //On recherche le média lié au produit
                    var media_dao = require("./media_dao");
                    media_dao.initialize(db_js);
                    media_dao.findOneByIdFromOperationVenteForAdmin(resultProduct, function (isMedia, resultWithMedia) {

                        //On commence par rechercher la création initiale du produit.
                        var operation_produit_dao = require("./operation_produit_dao");

                        operation_produit_dao.initialize(db_js);
                        operation_produit_dao.findInitialProductSalingByIdProductForAdmin(resultWithMedia,
                            function (isInitial, resultWithInitialSaling) {

                                if (isInitial) {//Si l'opération initiale est trouvée

                                    //on recherche à présent les infos du dealer initial.
                                    var dealer_dao = require("./dealer_dao");
                                    dealer_dao.initialize(db_js);
                                    dealer_dao.findOneByIdFromOperationVenteForAdmin(resultWithInitialSaling,
                                        function (isInfosDealer, resultWithInfosDealer) {

                                            callback(true, resultWithInfosDealer);
                                        })

                                } else {//Si non l'opération initiale n'est pas trouvée, quand bien même que le produit l'est. 
                                    //Le résultat renvoyé contient la raison pour laquelle cette dernière n'est pas trouvée. 
                                    callback(true, resultWithInitialSaling);
                                }
                            })

                    })
                } else {//Sinon le produit recherché n'est pas trouvé
                    callback(false, "Aucun produit ne correspond à l'identifiant <" + id_produit + ">");
                }
            }
        })
    } catch (exception) {
        callback(false, "Une exception a été lévée lors de la recherche des infos du produit <" + id_produit + "> : " + exception);
    }
}

module.exports.findProductForNotification = (notif, callback) => {
    try {
        collection.value.aggregate([{
            "$match": {
                "_id": require("mongodb").ObjectId(notif.id_objet)
            }
        },
        {
            "$project": {
                "_id": 0,
                "intitule": 1,
                "sous_categorie": 1
            }
        }
        ]).toArray((err, resultAggr) => {
            if (err) {
                callback(false, "Une erreur est survenue lors de la recherche des détails minimal : " + err)
            } else {
                if (resultAggr.length > 0) {
                    var objet = {
                        "intitule": resultAggr[0].intitule,
                        "sous_categorie": resultAggr[0].sous_categorie.constructor == Array ? resultAggr[0].sous_categorie[0] : resultAggr[0].sous_categorie
                    };

                    notif.detailObjet = objet;
                    callback(true, "Produit trouvé", notif)
                } else {
                    callback(false, "Le produit n'existe pas")
                }
            }
        })
    } catch (exception) {
        callback(false, "Une exception a été lévée lors de la recherche des détails minimal : " + exception)
    }
}

module.exports.findProductForCommandeStat = (produit, callback) => {
    try {
        collection.value.aggregate([
            {
                "$match": {
                    "_id": require("mongodb").ObjectId(produit._id)
                }
            }
        ]).toArray((err, resultAggr) => {
            if (err) {
                callback(false, "Une erreur est survenue lors de la recuperation du montant du produit : " + err)
            } else {
                if (resultAggr.length > 0) {
                    produit.montant = resultAggr[0].pu;

                    callback(true, "Le montant a été insérer", produit)
                } else {
                    callback(false, "Ce produit n'existe pas")
                }
            }
        })
    } catch (exception) {
        callback(false, "Une exception a été lévée lors de la recuperation du montant du produit : " + exception)
    }
}

/**
 * La fonction permettant de rechercher un produit ayant fait l'objet d'une alerte
 */
module.exports.findOneByIdFromAlerte = function (alerte, callback) {

    try {

        var _id = require("mongodb").ObjectID(alerte.id_objet),
            filter = {
                "_id": _id
            },
            produit = {};

        produit.intitule = [];
        produit.message_erreur = null;
        produit.medias = null;
        produit.unite = null;
        produit.pu = null;

        collection.value.findOne(filter, function (err, result) {

            if (err) {

                callback(false, "Une erreur est survenue lors de la recherche de détails du produit <" +
                    alerte.id_objet + "> : " + err, alerte);

            } else {

                if (result) {
                    produit.id_produit = alerte.id_objet;
                    produit.unite = result.unite;
                    produit.pu = result.pu;

                    for (let indexIntitule = 0; indexIntitule < result.intitule.length; indexIntitule++) {
                        produit.intitule.push(result.intitule[indexIntitule])
                    }

                    var media_produit_dao = require("./media_produit_dao");

                    media_produit_dao.initialize(db_js);
                    media_produit_dao.findMediaForProductByObject(produit, (isFound, messageMediaProduct, resultProductWithMedias) => {
                        produit.medias = resultProductWithMedias.medias;
                        alerte.infos_produit = produit;
                        callback(true, null, alerte);
                    })


                } else {


                    callback(false, "Il semble que l'identifiant <" + alerte.id_produit + "> ne correspond à aucun produit", alerte);
                }
            }

        })

    } catch (exception) {

        callback(false, "Une exception a été lévée lors de la recherche de détails du produit <" +
            alerte.id_objet + "> : " + exception, alerte)
    }
}

//#region UPDATE

/**
 * La fonction permettant de mettre à jour un intitulé d'un produit
 * Elle est utilisée dans l'administration
 */
module.exports.updateProductLabelForAdmin = function (id_produit, index_label, new_label, callback) {

    try {

        var _id = require("mongodb").ObjectID(id_produit),
            filter = { "_id": _id },
            updateValue = {};

        updateValue["intitule." + index_label] = new_label;
        var update = { "$set": updateValue };

        collection.value.updateOne(filter, update, function (err, result) {

            if (err) {
                callback(false, "Une erreur est survenue lors de la mise à jour de l'intitulé du produit <" + id_produit + "> : " + err);
            } else {
                callback(true, "La mise à jour a été correctement effectuée");
            }
        })

    } catch (exception) {
        callback(false, "Une exception a été lévée lors de la mise à jour de l'intitulé du produit <" + id_produit + "> : " + exception);
    }


}

/**
 * La fonction permettant d'ajouter un nouvel intitulé dans la liste de produit
 */
module.exports.addProductLabelForAdmin = function (id_produit, new_label, callback) {

    try {

        var _id = require("mongodb").ObjectID(id_produit),
            filter = { "_id": _id },
            update = { "$push": { "intitule": new_label } };

        collection.value.updateOne(filter, update, function (err, result) {

            if (err) {
                callback(false, "Une erreur est survenue lors de la mise à jour de l'intitulé du produit <" + id_produit + "> : " + err);
            } else {
                callback(true, "La mise à jour a été correctement effectuée");
            }
        })

    } catch (exception) {
        callback(false, "Une exception a été lévée lors de la mise à jour de l'intitulé du produit <" + id_produit + "> : " + exception);
    }


}

/**
 * La fonction permettant de mettre à jour les détails d'un produit
 */
module.exports.updateProductDetailsForAdmin = function (id_produit, new_details, callback) {

    try {

        var _id = require("mongodb").ObjectID(id_produit),
            filter = { "_id": _id },
            update = {
                "$set":
                {
                    "annotation": new_details.annotation,
                    "localisation": new_details.localisation,
                    "pu": new_details.pu,
                    "unite": new_details.unite,
                    "lien_produit": new_details.lien_produit
                }
            };

        collection.value.updateOne(filter, update, function (err, result) {

            if (err) {
                callback(false, "Une erreur est survenue lors de la mise à jour des details du produit <" + id_produit + "> : " + err);
            } else {
                callback(true, "La mise à jour a été correctement effectuée");
            }
        })

    } catch (exception) {
        callback(false, "Une exception a été lévée lors de la mise à jour des details du produit <" + id_produit + "> : " + exception);
    }


}

/**
 * La fonction permettant de mettre à jour la sous-catégorie d'un produit
 */
module.exports.updateProductUnderCategoryForAdmin = function (id_produit, index_under_category, new_under_category, callback) {

    try {

        var _id = require("mongodb").ObjectID(id_produit),
            filter = { "_id": _id },
            updateValue = {};

        updateValue["sous_categorie." + index_under_category] = new_under_category;
        var update = { "$set": updateValue };

        collection.value.updateOne(filter, update, function (err, result) {

            if (err) {
                callback(false, "Une erreur est survenue lors de la mise à jour de la sous-catégorie du produit <" + id_produit + "> : " + err);
            } else {
                callback(true, "La mise à jour a été correctement effectuée");
            }
        })

    } catch (exception) {
        callback(false, "Une exception a été lévée lors de la mise à jour de la sous-catégorie du produit <" + id_produit + "> : " + exception);
    }


}

/**
 * La fonction permettant de mettre à jour le flag d'un produit. 
 */
module.exports.updateFlagForAdmin = function (id_produit, flag_value, callback) {

    try {

        //On commence par rechercher le produit dont il est question
        var _id = require("mongodb").ObjectID(id_produit),
            filter = { "_id": _id };

        collection.value.findOne(filter, function (errFinding, resultFinding) {

            if (errFinding) {
                callback(false, "Une erreur est survenue lors de la mise à jour du flag produit <" + id_produit + "> : " + exception, null);
            } else {
                if (resultFinding) {

                    //On verifie si le flag en cours est différent de la valeur passée en paramètre. 
                    if (resultFinding.flag != flag_value) {

                        var update = {
                            "$set": {
                                "flag": flag_value
                            }
                        };

                        collection.value.updateOne(filter, update, function (errUpdating, resultUpdating) {
                            if (errUpdating) {
                                callback(false, "Une erreur est survenue lors de la mise à jour du flag du produit <" + id_produit + "> : " + errUpdating, null);
                            } else {
                                callback(true, null, "Mise à jour du flag du produit <" + id_produit + "> avec la valeur <" + flag_value + "> réussie");
                            }
                        });

                    } else {
                        callback(true, "Aucune mise à jour sur le flag n'a été apportée car la valeur passée est identique à celle encours", null);
                    }
                } else {
                    callback(false, "Aucun produit à modifier ne correspond à l'identifiant <" + id_produit + ">", null)
                }
            }
        })

    } catch (exception) {
        callback(false, "Une exception a été lévée lors de la mise à jour du flag produit <" + id_produit + "> : " + exception, null);
    }
}

/**
 * La fonction permettant de recupérer les détails d'un produit en profondeur.
 * @param {Object} produit 
 * @param {String} id_client 
 * @param {Function} callback 
 */
module.exports.getAllDeeperProductDetails = function (produit, id_client, callback) {

    var mediaDao = require("./media_dao");

    mediaDao.initialize(db_js);
    mediaDao.findOneByIdFromTopProduct(produit, function (isChecked, resultMessage, resultProductWithMedia) {

        //Puis on vérifie la condition de sortie
        var favoris_dao = require("./favoris_dao");
        favoris_dao.initialize(db_js);

        favoris_dao.isThisInFavorite(id_client, resultProductWithMedia,
            function (isMatched, message, resultProductWithFavoriteState) {

                //On passe à la recherche des différents dealers vendant chaque produit.
                var produit_dealer_dao = require("./produit_dealer_dao");
                produit_dealer_dao.initialize(db_js);

                produit_dealer_dao.getAllByIdProduit(resultProductWithFavoriteState,
                    function (is_product_dealer, messages_product_dealer, result_product_dealer) {

                        callback(is_product_dealer, messages_product_dealer, result_product_dealer);
                    });
            });

    });
}

//#endregion

/**
 * Module permettant de faire la recherche des produits suivant une sous-categorie
 */
module.exports.smartFindInUnderCategory = (product, callback) => {
    try {

        collection.value.aggregate([
            {
                "$match": {
                    "intitule": new RegExp(product.intitule, "i"),
                    "sous_categorie": product.sous_categorie.toString(),
                    "flag": true
                }
            }
        ]).toArray((err, resultAggr) => {
            if (err) {
                callback(false, `Une erreur est survenue lors de la recherche intelligente des produits dans la sous-categorie  ${product.sous_categorie} : ` +err)
            } else {
                if (resultAggr.length > 0) {
                    
                    callback(true, "Voici les product", resultAggr)
                } else {
                    callback(false, "Aucun produit ou sous-categorie n'a été repertorié à ce nom")
                }
            }
        })


    } catch (exception) {
        callback(false, `Une exception a été lévée lors de la recherche intelligente des produits dans la sous-categorie  ${product.sous_categorie} : ` + exception)

    }
}

/**
 * Module permettant de définir les id_media_produit dans un tableau
 */
module.exports.setImages = (props, callback) => {
    try {
        module.exports.findOneById(props.id_produit, props.auteur, (isFound, message, result) => {
            if (isFound) {
                var filter = {
                    "_id": result._id
                },
                update = {
                    "$push": {
                        "lien_produit": props.lien_produit
                    }
                };

                collection.value.updateOne(filter, update, (err, resultUp) => {
                    if (err) {
                        callback(false, "Une erreur est survenue lors de la mise en place des images : " +err)
                    } else {
                        if (resultUp) {
                            callback(true, "Les images sont mises en place", resultUp)
                        } else {
                            callback(false, "Aucune mis en place des images")
                        }
                    }
                })
            } else {
                callback(false, message)
            }
        })
    } catch (exception) {
        callback(false, "Une exception a été lévée lors de la mise en place des images : " + exception)
    }
}