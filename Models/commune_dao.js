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

    collection.value = db_js.get().collection("commune");
}

/**
 * Cette fonction permet d'ajouter une nouvelle commune.
 * Elle est utilisée dans l'administration
 */
module.exports.createForAdmin = function (new_commune, callback) {
    try {
        collection.value.insertOne(new_commune, function (err, result) {
            if (err) {
                callback(false, "Une erreur est survénue lors de l'insertion d'une nouvelle commune : "+err)
            } else {
                if (result) {
                    callback(true, result.ops[0].intitule + " a été ajouté avec succès", result.ops[0])
                } else {
                    callback(false, "Aucune n'a été ajouté")
                }
            }
        })
    } catch (exception) {
        callback(false, "Une exception a été lévée lors de l'insertion d'une nouvelle commune : " +exception)
    }
}

/**
 * La fonction permettant de rechercher une commune suivant son identifiant
 */
module.exports.findOneById = function (id_commune, callback) {
    try{

        var _id = require("mongodb").ObjectID(id_commune),
            filter = {"_id" : _id};

        collection.value.findOne(filter, function(err, result) {
            if(err){
                callback(false, "Une erreur est survenue lors de la recherche de la commune <"+id_commune+"> : "+err, null);
            }else{
                if(result){

                    //On recupère la ville
                    var ville_dao = require("./ville_dao");
                    ville_dao.initialize(db_js);
                    ville_dao.findOne(result.id_ville, function(isVille, messageVille, resultVille) {
                        if(isVille){

                            var ville = resultVille;
                            result.ville = ville;
                            callback(true, null, result);
                        }else{
                            callback(false, messageVille, null);
                        }
                    })
                    
                }else{
                    callback(false, "Aucune commune ne correspond à l'identifiant <"+id_commune+">", null);
                }
            }
        })
    }catch(exception){
        callback(false, "Une exception a été lévée lors de la recherche de la commune <"+id_commune+"> : "+exception, null);
    }
}

/**
 * La fonction permettant de rechercher une commune suivant son identifiant.
 * ELle est utilisée pour afficher les détails d'une commune de l'adresse de livraison.
 */
module.exports.findOneByIdForAdresseLivraison = function (id_commune, callback) {
    try{

        var _id = require("mongodb").ObjectID(id_commune),
            filter = {"_id" : _id};

        collection.value.findOne(filter, function(err, result) {
            if(err){
                callback(false, "Une erreur est survenue lors de la recherche de la commune <"+id_commune+"> : "+err, null);
            }else{
                if(result){

                    //On recupère la ville
                    var ville_dao = require("./ville_dao");
                    ville_dao.initialize(db_js);
                    ville_dao.findOneByIdForAdresseLivraison(result.id_ville, function(isVille, messageVille, resultVille) {
                        if(isVille){

                            var ville = resultVille;
                            result.ville = ville;
                            callback(true, null, result);
                        }else{
                            callback(false, messageVille, null);
                        }
                    })
                    
                }else{
                    callback(false, "Aucune commune ne correspond à l'identifiant <"+id_commune+">", null);
                }
            }
        })
    }catch(exception){
        callback(false, "Une exception a été lévée lors de la recherche de la commune <"+id_commune+"> : "+exception, null);
    }
}

/**
 * La fonction permettant de trouver les détails d'une commune où est affecté un agent.
 * Elle est utilisée dans la DAO "agent", dans sa fonction ""
 */

/**
 * La fonction permettant de lister les communes suivant une ville
 */
module.exports.findAllByIdVille = function (id_ville, callback) {
    try{

        var filter = {"id_ville" : id_ville};

        collection.value.find(filter).toArray(function(err, result) {
            if(err){
                callback(false, "Une erreur est survenue lors du listage des communes de la ville <"+id_ville+"> : "+err, null);
            }else{
                if(result){
                    callback(true, null, result);
                }else{
                    callback(false, "Aucune ville ne correspond à l'identifiant <"+id_ville+">", null);
                }
            }
        })

    }catch(exception){
        callback(false, "Une exception a été lévée lors du listage des communes de la ville <"+id_ville+"> : "+exception, null);
    }
}

/**
 * La fonction permettant de trouver les coordonnées d'une commune par son identifiant,
 * elle est utilisée dans le processus de passation d'une commande. 
 */
module.exports.getCordinatesByIdFromSubCommande = function(id_commune, callback) {
    
    try{
        var _id = require("mongodb").ObjectID(id_commune),
            filter = {"_id" : _id};

        collection.value.findOne(filter, function (err, result) {
            if(err){
                callback(false, "Une erreur est survenue lors de la recherche des coordonnées de la commune <"+id_commune+"> : "+err, null)
            }else{
                if(result){
                    var coordonnees = {
                        longitude : result.coordonnees[0],
                        latitude  : result.coordonnees[1]
                    };
                    
                    callback(true, null, coordonnees);
                }else{
                    callback(false, "Aucune commune ne correspond à l'identifiant <"+id_commune+">", null)
                }
            }
        })
    }catch(exception){
        callback(false, "Une exception a été lévée lors de la recherche des coordonnées de la commune <"+id_commune+"> : "+exception, null)
    }
}

/**
 * La fonction permettant de géolocaliser une commune par rapport à une autre. 
 * ELle est utilisée dans le processus de passation d'une commande. 
 */
module.exports.geoLocateById = function (is_first_level, id_commune, limit, callback) {
    
    if(is_first_level){//S'il s'agit du premier niveau de recherche
        callback(true, null, id_commune)
    }else{//S'il non il faut géolocaliser une commune autre que celle initiale

        //Pour ce faire, on recupère les coordonnées géographiques de la commune initiale
        var _id = require("mongodb").ObjectID(id_commune),
            filter = {"_id" : _id};
        
        collection.value.findOne(filter, function(errFindOne, resultFindOne) {
            if(errFindOne){
                callback(false, "Une exception a été lévée lors de la géolocation de la commune : "+exception, null)
            }else{

                if(resultFindOne){

                    try{

                        //On recupère les coordonnées de la commune
                        var longitude = resultFindOne.coordonnees[0], 
                        latitude = resultFindOne.coordonnees[1];

                        //Puis on déclares les variables utiles à la requête
                        var filter_geo_locate = {
                            "coordonnees" : {
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
                            .find(filter_geo_locate, option)
                            .skip(skip)
                            .limit(10)
                            .toArray(function (err, result) {
                            
                            if(err){
                                callback(false, "Une erreur est survenue lors de la géolocalisations commune : "+err, null)
                            }else{

                                if(result.length > 0){
                                    console.log(result[0].nom);
                                    callback(true, null, ""+result[0]._id);
                                }else{
                                    callback(false, "Aucune commune n'a été renvoyée", null)
                                }
                            }
                        })

                    }catch(exception){
                        callback(false, "Une exception a été lévée lors de la géolocalisation de la commune : "+exception, null);
                    }

                }else{
                    callback(false, "Aucune commune ne correspond à l'identifiant <"+id_commune+">", null)
                }
            }
        })
    }
      
}

/**
 * La fonction permettant de rechercher la(les) commune(s) où est affecté un agent.
 * Elle est utilisée dans la DAO "agent"
 */
module.exports.findAllFromAgentForAdmin = function(commune, callback) {
    
    try{

        commune.erreur_commune = [];

        this.findOneById(commune.id_commune, function(isCommuneFound, messageCommune, resultCommune) {
                    
            if(isCommuneFound){

                var details_commune = {
                    "nom" : resultCommune.nom,
                    "ville" : resultCommune.ville.ville.intitule,
                    "id_ville" : resultCommune.id_ville
                }
                commune.details = details_commune;
            }else{
                commune.erreur_commune.push(messageCommune);
            }

            callback(true, null, commune)
        })

    }catch(exception){
        commune.erreur_commune.push("Une exception a été lévée lors de la recherche des details de la commune <"+commune.id_commune+"> :"
        + exception);
        callback(true, null, commune)
    }
}

/**
 * La fonction permettant de rechercher une commune liée à une ligne de livraison. 
 * Elle est utilisée dans la DAO "ligne_livraison"
 */
module.exports.findOneByIdFromLigneLivraison = function(commune, callback) {

    try{
        var _id = require("mongodb").ObjectID(commune.id_commune),
            filter = {"_id" : _id},
            project = {"coordonnees" : 0};
        
        collection.value.findOne(filter, project, function(errCommune, resultCommune) {
            if(errCommune){
                callback(false, "Une erreur est survenue lors de la recherche de la commune <"+commune.id_commune+"> : "+errCommune, null)
            }else{

                if(resultCommune){//Si la commune est trouvée

                    //On recherche la ville
                    var ville_dao = require("./ville_dao");
                    ville_dao.initialize(db_js);
                    ville_dao.findOne(resultCommune.id_ville, function(isVille, messageVille, resultVille) {
                        if(isVille){

                            commune.details = {
                                "nom" : null,
                                "ville" : null
                            }

                            commune.details.nom = resultCommune.nom;
                            commune.details.ville = resultVille;

                            callback(true, null, commune);
                        }else{
                            callback(false, messageVille, null);
                        }
                    })

                }else{//Sinon la commune n'est pas trouvée
                    callback(false, "Aucune commune ne correspond à l'identifiant <"+commune.id_commune+">", null);
                }
            }
        })

    }catch(exception){
        callback(false, "Une exception a été lévée lors de la recherche de la commune <"+commune.id_commune+"> : "+exception, null)
    }
}

/**
 * La fonction permettant de filtrer les communes parttant d'un point géographique donné,
 * elle est utilisée pour trouver la commune la plus éloignée de produits selectionnés dans le pagnier.
 */
module.exports.geoNearByCordinatesForCart = function(longitude, latitude, liste_commune_lieu_vente, callback) {
    
    try{

        var ids_list = [];

        for (let index_id = 0; index_id < liste_commune_lieu_vente.length; index_id++) {
            const _id = require("mongodb").ObjectID(liste_commune_lieu_vente[index_id]);
            ids_list.push(_id);
        }

        collection.value.aggregate([
            {
             $geoNear: {
                near: { type: "Point", coordinates: [longitude,latitude] },
                distanceField: "dist.calculated",
                minDistance: 1,
                includeLocs: "location",
                spherical: true
             }
           },
           {"$match" : 
               {"_id" : {
                    "$in" : ids_list
                   }
               }
           }
        ]).toArray(function(errGeo, resultGeo) {
            if(errGeo){
                callback(false, "Une erreur est survenue lors de la géolocation des communes par rapport au point ["+longitude+","+latitude+"] : "+errGeo, null)
            }else{
                if(resultGeo != null && resultGeo.length > 0){

                    callback(true, null, resultGeo);
                }else{
                    callback(false, "Aucune commune n'a été géolocalisée.", null)
                }
            }
        })
        
    }catch(exception){
        callback(false, "Une exception a été lévée lors de la géolocation des communes par rapport au point ["+longitude+","+latitude+"] : "+exception, null)
    }
}