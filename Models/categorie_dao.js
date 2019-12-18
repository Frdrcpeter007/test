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

    collection.value = db_js.get().collection("categorie");
}

/**
 * La fonction qui permet de créer un agent
 */
module.exports.create = function (new_category, callback) {

    try { //Si ce bloc passe

        //On appele la méthode insertOne (une methode propre à mongoDB) de notre collection qui doit prendre la structure de l'entité
        collection.value.insertOne(new_category, function (err, result) {

            //On test s'il y a erreur
            if (err) {
                callback(false, "Une erreur est survenue lors création de cette catégorie", "" + err);
            } else { //S'il n'y a pas erreur

                //On vérifie s'il y a des résultat renvoyé
                if (result) {
                    callback(true, "Catégorie correctement crée", result.ops[0])
                } else { //Si non l'etat sera false et on envoi un message
                    callback(false, "Désolé, la catégorie n'a pas été crée", null)
                }
            }
        })

    } catch (exception) { //Si ce bloc ne passe pas on lève une exception
        callback(false, "Une exception a été lévée lors de la création de cette catégorie : " + exception);
    }
}

/**
 * La fonction qui permet de trouver toutes les catégories
 */
module.exports.getAll = function (nbre, callback) {

    try { //Si ce bloc passe

        if (nbre == null) {
            //On appele la méthode find (une methode propre à mongoDB) de notre collection qui doit prendre le filtre
            //find est une méthode qui renvoie plusieurs élément donc on doit les classé en tableaux d'où la methode toArray
            collection.value.aggregate([
                //Pipeline 1
                {
                    $match: {
                        intitule: {
                            $ne: null
                        }
                    }
                },
                //Pipeline 2
                {
                    $project: {
                        sous_categorie: 0,

                    }
                },
                //Pipeline 3
                {
                    $sort: {
                        intitule: 1
                    }
                }
            ]).toArray(function (err, result) {

                //S'il y a erreur
                if (err) {
                    callback(false, "Une erreur est survenue lors de la récupération des catégories", "" + err);

                } else { //Sinon

                    //On test s'il y a des résultats
                    if (result) {

                        var mediaModel = require("../Models/media_dao"),
                            listMesultWithMedia = [],
                            sortieWithMedia = 0;
                        mediaModel.initialize(db_js);

                        result.forEach(function (categorie, categorieIndex) {

                            mediaModel.findOneFromCategorie(categorie, function (isMediaMatched, resultWithMedia, resultMessage) {

                                sortieWithMedia++;

                                if (isMediaMatched) {

                                    listMesultWithMedia.push(resultWithMedia)
                                }

                                if (sortieWithMedia == result.length) {

                                    if (listMesultWithMedia.length > 0) {
                                        callback(true, "Toutes les categories ont été renvoyé avec succès", listMesultWithMedia);
                                    } else {
                                        callback(false, "Aucune qu'un media ne correspond à aucune catégorie", null);
                                    }
                                }
                            })
                        })


                    } else { //Si non l'etat sera false et in envoie un message
                        callback(false, "Il n'existe aucune catégorie enregistrer")
                    }
                }
            })
        } else {
            //On appele la méthode find (une methode propre à mongoDB) de notre collection qui doit prendre le filtre
            //find est une méthode qui renvoie plusieurs élément donc on doit les classé en tableaux d'où la methode toArray
            collection.value.aggregate([
                //Pipeline 1
                {
                    $match: {
                        intitule: {
                            $ne: null
                        }
                    }
                },
                //Pipeline 2
                {
                    $project: {
                        sous_categorie: 0,

                    }
                },
                //Pipeline 3
                {
                    $limit: nbre
                },
                //Pipeline 4
                {
                    $sort: {
                        intitule: 1
                    }
                }
            ]).toArray(function (err, result) {

                //S'il y a erreur
                if (err) {
                    callback(false, "Une erreur est survenue lors de la récupération des catégories", "" + err);

                } else { //Sinon

                    //On test s'il y a des résultats
                    if (result) {

                        var mediaModel = require("../Models/media_dao"),
                            listMesultWithMedia = [],
                            sortieWithMedia = 0;
                        mediaModel.initialize(db_js);

                        result.forEach(function (categorie, categorieIndex) {

                            mediaModel.findOneFromCategorie(categorie, function (isMediaMatched, resultWithMedia, resultMessage) {

                                sortieWithMedia++;

                                if (isMediaMatched) {

                                    listMesultWithMedia.push(resultWithMedia)
                                }

                                if (sortieWithMedia == result.length) {

                                    if (listMesultWithMedia.length > 0) {
                                        callback(true, "Toutes les categories ont été renvoyé avec succès", listMesultWithMedia);
                                    } else {
                                        callback(false, "Aucune qu'un media ne correspond à aucune catégorie", null);
                                    }
                                }
                            })
                        })


                    } else { //Si non l'etat sera false et in envoie un message
                        callback(false, "Il n'existe aucune catégorie enregistrer")
                    }
                }
            })
        }


    } catch (exception) { //Si ce bloc ne passe pas alors on lève une exception
        callback(false, "Une exception a été lévée lors de la création de l'agent : " + exception);
    }
}

/**
 * La fonction qui permet de trouver toutes les catégories, celle-ci est destinée à la version mobile
 */
module.exports.getAllForMobile = function (callback) {

    try { //Si ce bloc passe

        collection.value.find({}).toArray(function (err, result) {

            //S'il y a erreur
            if (err) {
                callback(false, "Une erreur est survenue lors de la récupération des catégories", "" + err);

            } else { //Sinon

                //On test s'il y a des résultats
                if (result) {

                    var mediaModel = require("../Models/media_dao"),
                        listMesultWithMedia = [],
                        sortieWithMedia = 0;
                    mediaModel.initialize(db_js);

                    result.forEach(function (categorie, categorieIndex) {

                        mediaModel.findOneFromCategorie(categorie, function (isMediaMatched, resultWithMedia, resultMessage) {

                            sortieWithMedia++;

                            if (isMediaMatched) {
                                
                                delete resultWithMedia.lien_couverture;

                                listMesultWithMedia.push(resultWithMedia)
                            }

                            if (sortieWithMedia == result.length) {

                                if (listMesultWithMedia.length > 0) {
                                    callback(true, "Toutes les categories ont été renvoyé avec succès", listMesultWithMedia);
                                } else {
                                    callback(false, "Aucune qu'un media ne correspond à aucune catégorie", null);
                                }
                            }
                        })
                    })

                } else { //Si non l'etat sera false et in envoie un message
                    callback(false, "Il n'existe aucune catégorie enregistrer")
                }
            }
        })

    } catch (exception) { //Si ce bloc ne passe pas alors on lève une exception
        callback(false, "Une exception a été lévée lors de la création de l'agent : " + exception);
    }
}

/**
 * La fonction qui permet de trouver les intitulés des catégories
 */
module.exports.getAllIntitules = function (callback) {

    try {


        collection.value.aggregate([{
            "$limit": 4
        }]).toArray(function (err, result) {

            if (err) {

                callback(false, "Une erreur est survenue lors de la recherche de la liste d'intitulés de toutes les catégories : " + err);

            } else {

                if (result.length > 0) {

                    var resultFinal = [];

                    result.forEach(function (element) {

                        var categorie_final = {
                            "id_categorie": '' + element._id,
                            "intitule": element.intitule
                        }

                        resultFinal.push(categorie_final)

                    }, this);

                    callback(true, resultFinal);
                } else {
                    callback(false, "Aucune catégorie n'a été trouvée");
                }
            }
        })

    } catch (exception) {
        callback(false, "Une exception a été lévée lors de la recherche de la liste d'intitulés de toutes les catégories : " + exception);
    }
}

/**
 * La fonction qui permet de trouver une catégorie par son identifiant
 */
module.exports.getOneById = function (id_categorie, callback) {

    try {

        var _id = require("mongodb").ObjectID(id_categorie),
            filter = {
                _id: _id
            };

        collection.value.findOne(filter, function (err, result) {

            if (err) {
                callback(false, "Une erreur est survenue lors de la recherche d'une catégorie : " + err);
            } else {

                if (result) {
                    callback(true, result);
                } else {
                    callback(false, "Aucune catégorie ne correspond à l'identifiant :" + id_categorie);
                }
            }
        })

    } catch (exception) {
        callback(false, "Une exeception a été lévée lors de la recherche d'une catégorie : " + exception);
    }
}

/**
 * La fonction permettant de compter le nombre total de catégories 
 */
module.exports.countAllCategorie = function (callback) {
    
    try{

        collection.value.count({}, function (err, result) {
            
            if(err){
                callback(false, "Une erreur est survenue lors du comptage des catégories  : "+err);
            }else{

                callback(true, result)
            }
        })

    }catch(exception){
        callback(false, "Une exception est survenue lors du comptage des catégories  : "+exception);
    }
}

/**
 * La fonction qui permet de compter le nombre de sous-categories d'une catégorie précise
 * suivant son identifiant. Le résultat est utilisée lors de la création ou l'ajout d'une sous-catégorie
 */
module.exports.countNumber = function (id_categorie, callback) {


    try {

        var _id = require("mongodb").ObjectID(id_categorie);

        collection.value.aggregate([

            {
                "$match": {
                    "_id": _id
                }
            },
            {
                "$project": {
                    "size": {
                        "$size": "$sous_categorie"
                    }
                }
            }
        ]).toArray(function (err, result) {

            if (err) {
                callback(false, "Une erreure est survenue lors de lors de l'obtention du nombre de sous-categorie :" + err);
            } else {

                if (result.length > 0) {
                    var nombre = result[0].size;
                    callback(true, nombre);
                } else {
                    callback(false, "La categorie " + id_categorie + " ne contien aucune sous categorie");
                }
            }
        })


    } catch (exception) {
        callback(false, "Une exception a été lévée lors de l'obtention du nombre de sous-categorie :" + exception)
    }
}

/**
 * La fonction qui permet d'ajouter une sous-categorie
 */
module.exports.addSousCategorieForAdmin = function (id_categorie, new_sous_categorie, callback) {

    try {

        var _id = require("mongodb").ObjectID(id_categorie),
            filter = {
                _id: _id
            };
            

        //on commence par verifier le nombre de sous_categorie enregistrEes
        collection.value.aggregate([
            {'$match' : 
                {"_id" : _id}
            },
            {'$project' :
                {
                    'counter' : {'$size' : "$sous_categorie"},
                    'intitule' : '$intitule'
                }
            }
        ]).toArray(function(errCounter, resultCounter) {
            if(errCounter){
                callback(false, "Une errreur est survenue lors du comptage de sous_categorie de la categorie <"+id_categorie+"> : "+errCounter, null);
            }else{
                if(resultCounter.length > 0){

                    //on cree l'identifiant de la sous_categorie
                    var tab_split = resultCounter[0].intitule.split(' '),
                        formated_intitule = '';
                    for (let index_split = 0; index_split < tab_split.length; index_split++) {
                        
                        if(tab_split[index_split] == ''){
                            tab_split[index_split] = '_';
                        }
                        formated_intitule = formated_intitule + tab_split[index_split];
                    }
                    var id_sous_categorie = formated_intitule + '_'+ (resultCounter[0].counter + 1);

                    update = {
                        "$push":
        
                        {
                            "sous_categorie": {
                                "id": id_sous_categorie,
                                "intitule": new_sous_categorie.intitule,
                                "details" : new_sous_categorie.details,
                                "flag" : new_sous_categorie.flag
                            }
                        }
                    }

                    collection.value.updateOne(filter, update, function (err, result) {

                        if (err) {
                            callback(false, "Une erreur est survenue lors de l'insertion d'une sous-categorie : " + err, null);
                        } else {
            
                            collection.value.findOne(filter, function (errCategorie, resultCategorie) {
            
                                if (errCategorie) {
                                    callback(false, "Une erreur est survenue lors de la recherche d'une catégorie : " + err, null);
                                } else {
            
                                    if (resultCategorie) {
                                        callback(true, null, resultCategorie);
                                    } else {
                                        callback(false, "Aucune catégorie ne correspond à l'identifiant :" + id_categorie, null);
                                    }
                                }
                            })
                        }
                    })

                }else{
                    callback(false, "Aucune categorie ne correspond a l'identifiant <"+id_categorie+">", null);
                }
            }
        })

        

    } catch (exception) {

        callback(false, "Une exception a été lévée lors de l'insertion d'une sous-catégorie : " + exception, null);
    }
}

/**
 * La fonction qui permet de rechercher une catégorie suivant l'identifiant d'une sous-catégorie
 * @param {*} product Le produit en question
 * @param {Function} callback La fonction de retour
 */
module.exports.getOneByIdUnderCategoryFromProduct = function (product, callback) {

    try {

        var filter = {
                "sous_categorie.id": product.sous_categorie[0]
            },
            project = {
                "_id": 1,
                "intitule": 1
            };

        collection.value.findOne(filter, project, function (err, result) {

            if (err) {
                callback(false, "Une erreur est survenue lors de la recherche de la categorie à laquelle appartient " +
                    "la sous-categorie : '" + product.categorie[0] + "' : " + err);
            } else {

                if (result) {

                    product.id_categorie = "" + result._id;
                    product.intitule_categorie = result.intitule;

                    callback(true, product);
                } else {

                    callback(false, "Aucune catégorie ne correspond ne contient la sous-categorie : '" + product.categorie[0] + "'");
                }
            }
        })
    } catch (exception) {
        callback(false, "Une exception a été lévée lors de la recherche de la categorie à laquelle appartient " +
            "la sous-categorie : '" + product.sous_categorie[0] + "' : " + exception);
    }
}

/**
 * La fonction qui permet de recherche une liste de catégories dont les intitulés correspondent à la valeur
 * que recherche l'utilisateur. Elle est utilisée lors de la smartSearch
 */
module.exports.findListByIntitule = function (valeurRecherche, callback) {

    try {

        var filter = {
            "intitule": {
                "$regex": new RegExp(valeurRecherche, "i")
            }
        };

        collection.value.find(filter).toArray(function (err, result) {

            if (err) {
                callback(false, "Une erreur est survenue lors de la smartResearch de catégories : " + err);
            } else {
                if (result.length > 0) {

                    callback(true, result);
                } else {
                    callback(false, "Aucune catégorie ne correspond à la valeur recherchée");
                }
            }
        })

    } catch (exception) {
        callback(false, "Une exception est survenue lors de la smartResearch de catégories : " + exception);
    }
}

/**
 * La fonction qui permet de rechercher la liste de sous-catégorie dont les intitulés correspondent à la
 * valeur que recherche l'utilisateur. Elle est utilisée lors de la smartSearch
 */
module.exports.findUnderCategoryListByIntitule = function (valeurRecherche, callback) {

    try {

        collection.value.aggregate([{
                "$unwind": "$sous_categorie"
            },
            {
                "$match": {
                    "sous_categorie.intitule": {
                        "$regex": new RegExp(valeurRecherche, "i")
                    }
                }
            },
            {
                "$project": {
                    "sous_categorie": "$sous_categorie"
                }
            }
        ]).toArray(function (err, resultSousCategories) {

            if (err) {

                callback(false, "Une erreur est survenue lors de la smartSearch des sous-catégories : " + err);

            } else {

                if (resultSousCategories.length > 0) { //Si au moins une sous-catégorie a été trouvée

                    //Pour chacune d'elle on va recherché les produits y associés
                    var produit_model = require("./produit_dao"),
                        listRetour = [],
                        sortieSousCategorie = 0;

                    //On passe en boucle les sous-catégories
                    for (var indexSousCategory = 0; indexSousCategory < resultSousCategories.length; indexSousCategory++) {

                        //On exécute la fonction de recherche des produits
                        produit_model.findListByIdSousCategorieFromCategorie(resultSousCategories[indexSousCategory].sous_categorie,
                            function (isProductMatched, messageProduct, resultProduct) {

                                //On incrémente la variable de sortie de la boucle sur le résulat de sous-catégories
                                sortieSousCategorie++;

                                var objetSousCategorie = {
                                    intitule: null,
                                    listeProduit: null
                                }

                                objetSousCategorie.intitule = resultProduct.intitule; //Il s'agit de l'intitulé de la sous-catégorie

                                if (isProductMatched) { //Puis si le résultat de la recherche sur le produit est positif

                                    //On le recupère la liste de produits qu'on affecte à l'objet de retour
                                    objetSousCategorie.listeProduit = resultProduct.listeProduit;

                                    //Puis on insère l'objet sous-catégorie dans la liste de retour
                                    listRetour.push(objetSousCategorie)

                                    //Et on test la condition de sortie de la boucle
                                    if (sortieSousCategorie == resultSousCategories.length) {

                                        callback(true, listRetour);
                                    }
                                } else {
                                    //Et on test la condition de sortie de la boucle
                                    if (sortieSousCategorie == resultSousCategories.length) {

                                        if (listRetour.length > 0) {
                                            callback(true, listRetour);
                                        } else {
                                            callback(false, "Aucun produit ne correspond à aucune sous-catégorie de la valeur recherchée");
                                        }

                                    }
                                }

                            })

                    }
                } else { //Sinon la recherche n'a pas renvoyée de sous-catégorie
                    callback(false, "Aucune sous catégorie ne correspond à la valeur recherchée");
                }
            }
        })

    } catch (exception) {
        callback(false, "Une exception a été lévée lors de la smartSearch des sous-catégories : " + exception);
    }
}

/**
 * La fonction qui permet de trouver les produits appartenant aux sous-catégories liées à une catégorie
 * spécifique
 */
module.exports.findListProduitFromIdCategory = function (categorie, callback) {

    try {

        var objetRetour = {
                intitule_categorie: null,
                listProduit: []
            },
            sortieSousCategorie = 0,
            produit_model = require("./produit_dao");

        objetRetour.intitule_categorie = categorie.intitule;
        produit_model.initialize(db_js);

        if(categorie.sous_categorie.length > 0){
        
            //On passe en boucle les sous-catégories
            for (var indexSousCategory = 0; indexSousCategory < categorie.sous_categorie.length; indexSousCategory++) {

                //Pour chaque sous-catégorie, on doit rechercher les produits correspondants
                produit_model.findListByIdSousCategorieFromCategorie(categorie.sous_categorie[indexSousCategory],
                    function (isProductMatched, messageProduct, resultProduct) {

                        //On incrémente la variable de sortie de la boucle sous-catégorie
                        sortieSousCategorie++;

                        if (isProductMatched) { //Si la recherche a renvoyé au moins un produit

                            for (var indexProduct = 0; indexProduct < resultProduct.listeProduit.length; indexProduct++) {

                                objetRetour.listProduit.push(resultProduct.listeProduit[indexProduct]);
                            }
                        }

                        //Puis on vérifie la condition de sortie
                        if (sortieSousCategorie == categorie.sous_categorie.length) {

                            if (objetRetour.listProduit.length > 0) {
                                callback(true, objetRetour);
                            } else {
                                callback(false, objetRetour);
                            }

                        }
                    })
            }

        }else{
            callback(true, objetRetour)
        }

    } catch (exception) {
        callback(false, "Une exception a été lévée lors de la recherche des produits dérivant de la catégorie <" +
            categorie._id + "> : " + exception);
    }
}

/**
 * La fonction qui permet de trouver une catégorie suivant le fait qu'elle contient une sous-catégorie donnée
 * Elle est utilisée dans la méthode "findListCategorieByIdProduct" de la DAO "produit"
 */
module.exports.findOneByIdSousCategorieFromProduct = function (id_sous_categorie, callback) {

    try {

        var filter = {
            "sous_categorie.id": id_sous_categorie
        }

        collection.value.findOne(filter, function (err, result) {

            if (err) {
                callback(false, "Une erreur est survenue lors de la recherche d'une catégorie contenant la sous-catégorie <" + id_sous_categorie + "> : " + err);
            } else {
                callback(true, result);
            }
        })

    } catch (exception) {
        callback(false, "Une exception a été lévée lors de la recherche d'une catégorie contenant la sous-catégorie <" + id_sous_categorie + "> : " + exception);
    }
}

/**
 * Récupère les sous-catégories d'une catégorie donné
 * @param {*} id_categorie L'identifiant de la catégorie
 * @param {Function} callback La fonction de retour
 */
module.exports.getAllUnderCategoryByIdCategory = function (id_categorie, callback) {
    try {
        collection.value.aggregate([{
                $match: {
                    "_id": require("mongodb").ObjectId(id_categorie)
                }
            },
            {
                "$unwind" :
                {
                  path: "$sous_categorie",
                  includeArrayIndex: "index_categorie",
                  preserveNullAndEmptyArrays: true
                }
            }
        ]).toArray(function (err, result) {
            if (err) {
                callback(false, "Une erreur est survénue lors de la récupération des sous-categorie : " + err)
            } else {
                if (result.length > 0) {
                    //callback(true, "Les sous-catégories trouvé", result)

                    var media_dao = require("./media_dao"),
                        sortieMedia = 0,
                        listUnderCategorie = [];

                    media_dao.initialize(db_js);

                    for (let indexSousCategory = 0; indexSousCategory < result.length; indexSousCategory++) {
                        media_dao.findOneFromCategorie(result[indexSousCategory], function (isFound, resultFound, messageFound) {

                            sortieMedia++;

                            if (isFound) {
                                listUnderCategorie.push(resultFound);
                            }

                            if (sortieMedia == result.length) {
                                callback(true, "Les sous-catégorie ont été trouvé", listUnderCategorie)
                            }
                        })
                    }
                } else {
                    callback(false, "Aucune sous-catégorie n'a été trouvé pour cette catégorie", null)
                }
            }
        })
    } catch (exception) {

    }
}

/**
 * La fonction permettant de mettre à jour une catégorie
 * Elle est utilisée dabs l'administration
 */
module.exports.updateOneCategoryInfosForAdmin = function (id_categorie, new_value, callback) {
    
    try{

        var _id = require("mongodb").ObjectID(id_categorie),
            filter = {
                "_id" : _id
            },
            update = {
                "$set" : {
                    "intitule" : new_value.intitule,
                    "description" : new_value.description
                }
            };

        collection.value.updateOne(filter,update, function (err, result) {
            
            if(err){
                callback(false, "Une erreur est survenue lors de la mise à jour de la catégorie : "+exception);
            }else{

                callback(true, result)
            }
        })

    }catch(exception){
        callback(false, "Une exception est survenue lors de la mise à jour de la catégorie : "+exception);
    }
}


/**
 * La fonction permettant de mettre à jour le flag d'une catégorie
 */
module.exports.updateCategoryFlagForAdmin = function (id_categorie, callback) {
    
    try{

        var _id = require("mongodb").ObjectID(id_categorie),
            filter = {
                "_id" : _id
            };
        
            collection.value.findOne(filter, function (errCategorie, resultCategorie) {
                
                if(errCategorie){
                    callback(false, "Une erreur est survenue lors de la mise à jour de l'état de la catégorie : "+errCategorie);
                }else{

                    if(resultCategorie){

                        var currentFlag = resultCategorie.flag,
                            newFlag = null;
                            

                        if(currentFlag){
                            newFlag = false
                        }else{
                            newFlag = true
                        }

                        var update = {
                            "$set" : {
                                "flag" : newFlag
                            }
                        };

                        collection.value.updateOne(filter, update, function (errUpdate, resultUpdate) {
                            
                            if(errUpdate){
                                callback(false, "Une erreur est survenue lors de la mise à jour de l'état d'une catégorie : "+errUpdate)
                            }else{
                                callback(true, resultUpdate)
                            }
                        })
                    }else{
                        callback(false, "Aucune catégorie ne correspond à l'identifiant passé");
                    }
                }
            })


    }catch(exception){
        callback(false, "Une exception a été lévée lors de la mise à jour de l'état de la catégorie : "+exception);
    }
}

/**
 * La fonction permetant de mettre à jour les infos d'une sous-catégorie
 * Elle est utilisée dans l'administration
 */
module.exports.updateOneUnderCategoryInfosForAdmin = function (id_categorie, index_under_cat, new_value, callback) {
    
    try{
        var _id = require("mongodb").ObjectID(id_categorie),
            filter = {
                "_id" : _id
            },
            value_update = {};

        value_update["sous_categorie."+index_under_cat+".intitule" ] = new_value.intitule;

        value_update["sous_categorie."+index_under_cat+".details" ] = new_value.details;

        var update = {
            "$set" : value_update
        };
        
        collection.value.updateOne(filter, update, function (err, result) {
            
            if(err){
                callback(false, "Une erreur est survenue lors de la mise à jour des infos de la sous-categorie : "+err)
            }else{

                callback(true, result)
            }
        })

    }catch(exception){

        callback(false, "Une exception a été lévée lors de la mise à jour des infos de la sous-categorie : "+exception);
    }
}

/**
 * La fonction permettant de mette à jour le flag d'une sous-catégorie d'une catégorie donnée.
 * Elle est utilisée dans l'Administration
 */
module.exports.updateOneUnderCategoryFlagForAdmin = function (id_categorie, id_under_cat, index_under_cat,  callback) {
    
    try{
        
        var _id = require("mongodb").ObjectID(id_categorie),
            filter = {
                "_id" : _id
            },
            project = { 
                "sous_categorie" : 
                    {"$elemMatch" : 
                        {"id" : id_under_cat} 
                    } 
            };

        //On recherche d'abord la catégorie tout en personnalisant le résultat
        //de telle façon à ne renvoyer que la sous-catégorie à modifier
        collection.value.find(filter).project(project).toArray(function (errWithUnderCat, resultWithUnderCat) {
            
            if(errWithUnderCat){
                callback(false, "Une erreur est survenue lors de la recherche de la catégorie : "+errWithUnderCat);
            }else{

                if(resultWithUnderCat.length > 0){ //Si la recherche renvoie un résultat positif : 

                    var currentFlag = resultWithUnderCat[0].sous_categorie[0].flag,
                        newFlag = null;

                    if(currentFlag){
                        newFlag = false
                    }else{
                        newFlag = true
                    }

                    value_update = {};

                    value_update["sous_categorie."+index_under_cat+".flag" ] = newFlag;

                    var update = {
                        "$set" : value_update
                    };

                    collection.value.updateOne(filter, update, function (errUpdate, resultUpdate) {
                        
                        if(errUpdate){
                            callback(false, "Une erreur est survenue lors de la mise à jour du flag de la sous-categorie : "+errUpdate);
                        }else{

                            callback(true, resultUpdate)
                        }
                    })

                }else{ //Sinon la recherche n'a pas été positive :
                    callback(false, "Aucune catégorie ne correspond à l'identifiant passé");
                }
            }

        })

    }catch(exception){

        callback(false, "Une exception a été lévée lors de la mise à jour du flag de la sous-catégorie : "+exception);
    }
}

/**
 * La fonction permettant d'avoir les infos (intitulé et description)
 */
module.exports.getCategorieInfosByIdForAdmin = function (id_categorie, callback) {
 
    try{

        var _id = require("mongodb").ObjectID(id_categorie),
            filter = {"_id" : _id};
        
        collection.value.findOne(filter, function(err, result) {
            
            if(err){
                callback(false, "Une erreur est survenue lors de la recherche des infos de la catégorie <"+id_categorie+"> : "+err);
            }else{
                if(result){
                    
                    var objetRetour= {
                        "intitule" : result.intitule,
                        "description" : result.description
                    }

                    callback(true, objetRetour);

                }else{
                    callback(false, "Aucune catégorie ne correspond à l'identifiant <"+id_categorie+">");
                }
            }
        })

    }catch(exception){
        callback(false, "Une exception a été lévée lors de la recherche des infos de la catégorie <"+id_categorie+"> : "+exception);
    }
}

/**
 * La fonction permettant de mettre à jour le lien de courverture d'une catégorie
 */
module.exports.updateCategoryCoverImageForAdmin = function (id_categorie, new_cover_link, callback) {
    
    try{

        var _id = require("mongodb").ObjectID(id_categorie),
            filter = {"_id" : _id},
            update = {"$set" : {"lien_couverture" : new_cover_link}};
        
        collection.value.updateOne(filter, update, function(err, result) {
            
            if(err){
                callback(false, "Une erreur est survenue lors de la mise à jour du lien_couveture de la catégorie <"+id_categorie+"> : "+err);
            }else{
                callback(true, new_cover_link);
            }
        })
    }catch(exception){
        callback(false, "Une exception a été lévée lors de la mise à jour du lien_couveture de la catégorie <"+id_categorie+"> : "+exception);
    }
}

/**
 * La fonction permettant d'afficher les infos d'une sous-catégorie
 */
module.exports.getOneUnderCategoryInfos = function(id_categorie, id_under_cat, callback) {
    
    try{

        var _id = require("mongodb").ObjectID(id_categorie);

        collection.value.aggregate([
            {"$match" : 
                {"_id" : _id}
            },
            {"$unwind" : "$sous_categorie"
            },
            {"$match" : 
                {"sous_categorie.id" : id_under_cat }
            },
            {"$project" : 
                {
                    "intitule_sous_cat" : "$sous_categorie.intitule",
                    "details_sous_cat" : "$sous_categorie.details"
                }
            }
        ]).toArray(function(err, result) {
            
            if(err){
                callback(false, "Une erreur est survenue lors de la recherche des infos de la sous-catégorie <"+id_under_cat+"> : "+err);
            }else{
                if(result.length > 0){

                    callback(true, result);
                }else{
                    callback(false, "Aucune sous-catégorie ne correspond aux critères de recherche suivant : "+
                    "id catégorie : "+id_categorie+", id sous-catégorie : "+id_under_cat);
                }
            }
        })

    }catch(exception){
        callback(false, "Une exception a été lévée lors de la recherche des infos de la sous-catégorie <"+id_under_cat+"> : "+exception);
    }
}

/**
 * La fonction permettant de mettre à jour l'image de couverture d'une sous-catégorie
 */
module.exports.updateOneUnderCategoryCoverImageForAdmin = function (id_categorie, index_under_cat, id_media, callback) {
    
    try{
        var _id = require("mongodb").ObjectID(id_categorie),
            filter = {
                "_id" : _id
            },
            value_update = {};

        value_update["sous_categorie."+index_under_cat+".id_media" ] = id_media;

        var update = {
            "$set" : value_update
        };
        
        collection.value.updateOne(filter, update, function (err, result) {
            
            if(err){
                callback(false, "Une erreur est survenue lors de la mise à jour des infos de la sous-categorie : "+err, null)
            }else{

                callback(true, null, result)
            }
        })

    }catch(exception){

        callback(false, "Une exception a été lévée lors de la mise à jour des infos de la sous-categorie : "+exception, null);
    }
}