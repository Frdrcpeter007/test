//------------Définition des variables globales
//cette variable est destinée à contenir une référence à
//l'objet collection qui dérivera de "db_js"
var db_js = require("./db"),
    bcrypt = require("bcryptjs");

var collection = {
    value: null
}

/**
 * Ici on initialise la variable "collection" en lui passant
 * la valeur provenant de "db_js". NB: cette fonction sera accessible en dehors de ce fichier
 */
module.exports.initialize = function (db_js) {

    collection.value = db_js.get().collection("agence");
}

/**
 * La fonction permettant de créer une agence
 */
module.exports.create = function (newAgence, callback) {
    
    try{

        collection.value.insert(newAgence, function(err, result) {
            
            if(err){
                callback(false, "Une erreur est survenue lors de la création de l'agence : "+err);
            }else{
                callback(true,result.ops[0]);
            }
        })

    }catch(exception){
        callback(false, "Une exception a été lévée lors de la création de l'agence : "+exception);
    }
}

/**
 * la fonction permettant de retrouver le détails d'une agence spécifique venant d'un agent
 */
module.exports.findOneByIdFromAgent = function(agence, callback) {
    
    try{

        var _id = require("mongodb").ObjectID(agence.id_agence),
            filter = {"_id" : _id};

        collection.value.findOne(filter, function(err, result) {
            
            if(err){
                callback(false, "Une erreur est survenue lors de la recherche de l'agence <"+agence.id_agence+"> : "+err, agence);
            }else{

                if(result){

                    agence["nom_agence"] = result.nom;
                    callback(true, null, agence)
                }else{
                    callback(false, "Aucune agence ne correspond à l'identifiant <"+agence.id_agence+">", agence);
                }
            }
        })

    }catch(exception){
        callback(false, "Une exception a été lévée lors de la recherche de l'agence <"+agence.id_agence+"> : "+exception, agence)
    }

}

/**
 * La fonction permettant de rechercher une agence spécifique suivant son identifiant. 
 * Elle est utilisée dans la DAO "agent"
 */
module.exports.findLastByIdFromAgent = function(agent, callback) {
    
    if(agent.agence.length > 0){

        var id_agence = agent.agence[agent.agence.length - 1].id_agence;
        try{

            var _id = require("mongodb").ObjectID(id_agence),
                filter = {"_id" : _id};

            collection.value.findOne(filter, function(err, result) {
                
                if(err){
                    callback(false, "Une erreur est survenue lors de la recherche de l'agence <"+id_agence+"> : "+err, agent);
                }else{

                    if(result){

                        agent.agence[agent.agence.length - 1]["nom_agence"] = result.nom;
                        callback(true, null, agent)
                    }else{
                        callback(false, "Aucune agence ne correspond à l'identifiant <"+id_agence+">", agent);
                    }
                }
            })

        }catch(exception){
            callback(false, "Une exception a été lévée lors de la recherche de l'agence <"+id_agence+"> : "+exception, agent)
        }

    }else{
        callback(false, "Ce client n'est affecté dans aucune agence", agent)
    }
}

/**
 * La fonction permettant d'avoir uniquement les coordonnées d'une agence.
 */
module.exports.getCoordinatesByIdFromAdresseForSubCommande = function(id_agence, callback) {
    
    try{

        var _id = require("mongodb").ObjectID(id_agence),
            filter = {"_id" : _id},
            project = {"coordonnee" : 1};

        collection.value.findOne(filter, project, function(err, result) {
            
            if(err){

                callback(false, "Une exception a été lévée lors de la recherche des coordonnées de l'agence <"
                +id_agence+"> : "+exception, id_agence);
            }else{
                if(result){

                    var coordonnees = {
                        longitude : result.coordonnee[0],
                        latitude  : result.coordonnee[1]
                    }

                    callback(true, coordonnees, id_agence)
                }else{


                    callback(false, "Aucune agence ne correspond à l'identifiant <"+id_agence+">", id_agence);
                }
            }
        })

    }catch(exception){

        callback(false, "Une exception a été lévée lors de la recherche des coordonnées de l'agence <"
            +id_agence+"> : "+exception, id_agence);
    }
}

/**
 * La fonction permettant de géolocaliser une agence
 */
module.exports.geoLocateByCoordinates = function (longitude, latitude, limit, callback) {
    
    try{
            
        var filter = {
            "coordonnee" : {
                "$near": {
                    "$geometry": {
                        "type" : "Point",
                        "coordinates" : [longitude, latitude]
                    }
                }
            }
        },
        option ={
           "_id" : 1 
        },
        skip = null;

    
        limit == 1 ? skip = 0 : skip = limit - 1;

        collection.value
            .find(filter, option)
            .skip(skip)
            .limit(1)
            .toArray(function (err, result) {
            
            if(err){
                callback(false, "Une erreur est survenue lors de la géolocalisations agence : "+err, null)
            }else{

                if(result.length > 0){
                    callback(true, null, ""+result[0]._id);
                }else{
                    callback(false, "Aucune agence n'a été renvoyée", null)
                }
            }
        })

    }catch(exception){
        callback(false, "Une exception a été lévée lors de la géolocalisations agence : "+exception, null)
    }
}


/**
 * La fonction permettant de vérifier s'il existe une agence approximavite de celle encours
 */
module.exports.checkNextAgency = function(id_agence, limit, callback) {
    

    module.exports.getCoordinatesByIdFromAdresseForSubCommande(id_agence, function(isCoordinates, coordinatesResult, id_agence) {
        
        if(isCoordinates){
            module.exports.geoLocateByCoordinates(coordinatesResult[0], coordinatesResult[1], limit,
            function(isAgencyGeoLocated, messageGeoLocate, resultGeolocate) {
                
                if(isAgencyGeoLocated){
                    callback(true, null, ""+resultGeolocate._id, limit)
                }else{
                    callback(false, messageGeoLocate, null, limit)
                }
            })
        }else{
            callback(false, coordinatesResult, id_agence, limit)
        }
    })
}
