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

    collection.value = db_js.get().collection("role");
}

/**
 * La fonction permettant de créer un rôle
 */
module.exports.create = function(new_role, callback) {
    
    collection.value.insert(new_role, function (err, result) {
        if(err){
            callback(false, "Une erreur est survenue lors de la création d'un nouveau role : "+err)
        }else{
            callback(true, result.ops[0]);
        }
      })
}

/**
 * La fonction permettant de trouver un role spécifique suivant son identifiant
 */
module.exports.findOneById = function(id_role, callback) {
    
    try{

        var _id = require("mongodb").ObjectID(id_role),
            filter = {"_id" : _id};

        collection.value.findOne(filter, function(err, result) {
            
            if(err){
                callback(false, "Une erreur est survenue lors de la recherche du rôle <"+id_role+"> : "+err);
            }else{

                if(result){
                    callback(true, result)
                }else{
                    callback(false, "Aucun rôle ne correspond à l'identifiant <"+id_role+">");
                }
            }
        })

    }catch(exception){
        callback(false, "Une exception a été lévée lors de la recherche du rôle <"+id_role+"> : "+exception);
    }
}

/**
 * La fonction permettant de trouver le rôle d'un agent dans une commune
 */
module.exports.findOneByIdFromAgent = function(commune, callback) {
    
    var id_role = commune.role;

    try{

        var _id = require("mongodb").ObjectID(id_role),
            filter = {"_id" : _id};

        collection.value.findOne(filter, function(err, result) {
            
            if(err){
                callback(false, "Une erreur est survenue lors de la recherche du rôle <"+id_role+"> : "+err, commune);
            }else{

                if(result){

                    commune["intitule_role"] = result.intitule;
                    callback(true, null, commune)
                }else{
                    callback(false, "Aucun rôle ne correspond à l'identifiant <"+id_role+">", commune);
                }
            }
        })

    }catch(exception){
        callback(false, "Une exception a été lévée lors de la recherche du rôle <"+id_role+"> : "+exception, commune);
    }

}

/**
 * La fonction permettant de lister tous les rôles.
 */
module.exports.getAll = function(callback) {
    
    try{

        collection.value.find({}).toArray(function(err, result) {
            
            if(err){
                callback(false, "Une erreur est survenue lors du listage de rôles : "+err);
            }else{
                if(result.length > 0){
                    callback(true, result)
                }else{
                    callback(false, "Aucun rôle n'a été trouvée...");
                }
            }
        })

    }catch(exception){
        callback(false, "Une exception a été lévée lors du listage de rôles : "+exception);
    }
}