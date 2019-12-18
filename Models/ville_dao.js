//------------Définition des variables globales
//cette variable est destinée à contenir une référence à
//l'objet collection qui dérivera de "db_js"
var db_js = require("./db");

var collection = {
    value: null
}

/**
 * Ici on initialise la variable "collection" en lui passant
 * la valeur provenant de "db_js". NB: cette fonction sera accessible en dehors de ce fichier
 */
module.exports.initialize = function (db_js) {

    collection.value = db_js.get().collection("ville");
}

/**
 * Cette fonction permet d'ajouter une nouvelle ville
 */
module.exports.createForAdmin = function (newVille, callback) {
    try {
        collection.value.insertOne(newVille, function (err, result) {
            if (err) {
                callback(false, "Une erreur est survénue lors de l'insertion d'une nouvelle ville : "+err, null)
            } else {
                if (result) {
                    callback(true, null, result.ops[0].intitule + " a été ajouté avec succès", result.ops[0])
                } else {
                    callback(false, "Aucune n'a été ajouté", null)
                }
            }
        })
    } catch (exception) {
        callback(false, "Une exception a été lévée lors de l'insertion d'une nouvelle ville : " +exception, null)
    }
}

/**
 * La fonction permettant d'afficher les détails d'une ville
 */
module.exports.findOne = function (id_ville, callback) {
    try{
        var _id = require("mongodb").ObjectID(id_ville),
            filter = {"_id" : _id};

        collection.value.findOne(filter, function(errVille, resultVille) {
            if(errVille){
                callback(false, "Une erreur est survenue lors de la recherche de la ville <"+id_ville+"> : "+exception, null)
            }else{
                if(resultVille){

                    //On doit à présent rechercher toutes les communes liées à cette ville
                    var commune_dao = require("./commune_dao"),
                        result_retour = {
                            "ville" : null,
                            "communes" : [],
                            "erreur_commune" : null
                        };

                    result_retour.ville = resultVille;

                    commune_dao.initialize(db_js);
                    commune_dao.findAllByIdVille(id_ville, function(isCommunes, messageCommune, resultCommune) {
                        if(isCommunes){
                            //On passe en boucle les communes
                            for (let index_commune = 0; index_commune < resultCommune.length; index_commune++) {
                                result_retour.communes.push(resultCommune[index_commune]);
                            }
                        }else{
                           result_retour.erreur_commune = messageCommune;
                        }

                        callback(true, null, result_retour);
                    })
                }else{
                    callback(false, "Aucune ville ne correspond à l'identifiant <"+id_ville+">", null);
                }
            }
        })
    }catch(exception){
        callback(false, "Une exception a été lévée lors de la recherche de la ville <"+id_ville+"> : "+exception, null)
    }
}

/**
 * La fonction permettant de trouver une ville sans ses communes.
 * Elle est utilisée pour afficher les détails de la ville de l'adresse de livraison du produit
 */
module.exports.findOneByIdForAdresseLivraison = function (id_ville, callback) {
    try{
        var _id = require("mongodb").ObjectID(id_ville),
            filter = {"_id" : _id};

        collection.value.findOne(filter, function(errVille, resultVille) {
            if(errVille){
                callback(false, "Une erreur est survenue lors de la recherche de la ville <"+id_ville+"> : "+exception, null)
            }else{
                if(resultVille){

                    //On doit à présent rechercher toutes les communes liées à cette ville
                    var result_retour = {
                            "ville" : null,
                            "erreur_commune" : null
                        };

                    result_retour.ville = resultVille;

                    callback(true, null, result_retour);

                }else{
                    callback(false, "Aucune ville ne correspond à l'identifiant <"+id_ville+">", null);
                }
            }
        })
    }catch(exception){
        callback(false, "Une exception a été lévée lors de la recherche de la ville <"+id_ville+"> : "+exception, null)
    }
}


/**
 * Cette fonction permet de rechercher une ville via son identifiant
 * On utilise dans la DAO "adresse"
 */
module.exports.findOneByIdFromAdress = function (objet, callback) {
    try {
        
        var _id = require("mongodb").ObjectId(objet.id_ville),
            filter = {
                "_id": _id
            };

        collection.value.findOne(filter, function (err, result) {
            if (err) {
                callback(false, "Une erreur est survénue lors de la recherche de la ville : "+err)
            } else {
                if (result) {

                    objet.id_ville = result.intitule;

                    callback(true, "La ville a été trouvé avec succès", objet)
                } else {

                    callback(false, "Aucune ville n'a été trouvée", objet)
                }
            }
        })
    } catch (exception) {
        callback(false, "Une exception a été lévée lors de la recherche de cette ville : "+exception)
    }
}

/**
 * Cette fonction permet de récupérer toutes les villes couvertes par e-Bantu
 */
module.exports.getAll = function (callback) {
    try {
        collection.value.aggregate([
            {
                "$match": {}
            }
        ]).toArray(function (err, result) {
            if (err) {
                callback(false, "Une erreur est survénue lors de la récupération de toutes les villes couvertes par e-Bantu: " +err)
            } else {
                if (result.length > 0) {
                    callback(true, "Les villes couvertes par e-Bantu ont été renvoyé avec succès", result);
                } else {
                    callback(false, "Aucune ville n'a été trouvé")
                }
            }
        })
    } catch (exception) {
        callback(false, "Une exception a été lévée lors de la récupération de toutes les villes couverte par e-Bantu : " + exception)
    }
}