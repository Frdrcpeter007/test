//------------Définition des variables globales
//cette variable est destinée à contenir une référence à
//l'objet collection qui dérivera de "db_js"
var db_js = require("../db");

var collection = {
    value: null
}

//Ici on initialise la variable "collection" en lui passant
//la valeur provenant de "db_js". NB: cette fonction sera accessible
//en dehors de ce fichier
module.exports.initialize = function (db_js) {

    collection.value = db_js.get().collection("recherche");
}

/**
 * La fonction qui permet de créer une recherche
 */
module.exports.create = function (new_recherche, callback) {

    try{

        collection.value.insert(new_recherche, function (err, result) {
            
            if(err){
                callback(false, "Une erreur est survenue lors de la création d'une recherche : "+err);
            }else{
                callback(true, "La recherche a été sauvegardée");
            }
        })
    }catch(exception){
        callback(false, "Une exception a été lévée lors de la création d'une recherche : "+exception);
    }
}

/**
 * La fonction permettant de renvoyer le produit le plus recherché sans succès
 */
module.exports.topNotFoundResearch = function (callback) {
    
    try{

        collection.value.aggregate([
            {"$match" : 
                {"etat" : "not_found"}
            },
            {"$sort" : 
                {"date" : -1}
            },
            {"$limit" : 50
            },
            {"$group" : 
                {
                    "_id" : "$valeur",
                    "count" : { "$sum" :  1}
                }
            },
            {"$sort" : {"count" : -1}
            },
            {"$limit" : 1}
        ]).toArray(function (err, result) {
            
            if(err){
                callback(false, "Une erreur est survenue lors de la recheche du produit le plus recherché sans succès : "+err);
            }else{
                if(result.length > 0){
                    callback(true, result);
                }else{
                    callback(false, "Aucun produit issu de la recherche n'a pas été trouvé cette semaine")
                }
            }
        })
    }catch(exception){
        callback(false, "Une exception a été lévée lors de la recheche du produit le plus recherché sans succès : "+exception);
    }

}

/**
 * La fonction permettant de renvoyer la listes de produits recherchés sans succès
 */
module.exports.getNotFoundResearch = function (callback) {
    
    try{

        collection.value.aggregate([
            {"$match" : 
                {"etat" : "not_found"}
            },
            {"$sort" : 
                {"date" : -1}
            },
            {"$limit" : 50
            },
            {"$group" : 
                {
                    "_id" : "$valeur",
                    "count" : { "$sum" :  1}
                }
            },
            {"$sort" : {"count" : -1}
            },
            {"$limit" : 30}
        ]).toArray(function (err, result) {
            
            if(err){
                callback(false, "Une erreur est survenue lors de la recheche du produit le plus recherché sans succès : "+err);
            }else{
                if(result){
                    callback(true, result);
                }else{
                    callback(false, "Aucun produit issu de la recherche n'a pas été trouvé cette semaine")
                }
            }
        })
    }catch(exception){
        callback(false, "Une exception a été lévée lors de la recheche du produit le plus recherché sans succès : "+exception);
    }

}
