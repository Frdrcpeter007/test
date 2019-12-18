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

    collection.value = db_js.get().collection("media_utilisateur");
}

/**
 * 
 * @param {*} new_media_user 
 * @param {*} callback 
 */
module.exports.create = function (new_media_user, callback) {
    try {
        collection.value.insertOne(new_media_user, function (err, result) {
            if (err) {
                callback(false, "Une erreur est survénue lors de la création du media de cet utilisateur : " + err);
            } else {
                callback(true, "Media utilisateur crée avec succès", result.ops[0])
            }
        })
    } catch (exception) {
        callback(false, "Une exception a été lévée lors de la création du media de cet utilisateur : " + exception);
    }
}
/**
 * Cette fonction permet de charcher si le media est répertorié dans les media utilisateur, Cette fonction est aussi utilisé dans "getOneByIdFromExtra" du DAO client
 * @param {*} extra L'extra qu'on veut récupérer
 * @param {Function} callback La fonction de retour
 */
module.exports.findMediaByExtra = function (extra, callback) {
    try {
        var filter = {
            "id_utilisateur": extra.info_client.id_client,
            "id_media": extra.info_client.id_media
        },
        extraShort ={
            "type" : extra.type,
            "date" : extra.date,
            "contenu" : extra.contenu,
            "info_client": extra.info_client
        }

        collection.value.findOne(filter, function (err, result) {
            if (err) {
                callback(false, "Une erreur est survenue lors de la recherche du media : " + err)
            } else {
                if (result) {

                    var mediaDao = require("./media_dao");
                    mediaDao.initialize(db_js);

                    mediaDao.findOneByIdFromMediaUserForExtra(extraShort, function(isMediaMatched, resultWithMedia){

                        if (isMediaMatched) {
                            callback(true, resultWithMedia)
                        } else {
                            callback(false, resultWithMedia)
                        }
                    })

                } else {
                    callback(false, extraShort)
                }
            }
        })
    } catch (exception) {
        callback(false, "Une exception a été lévée lors de la recherche du media : " + err)
    }
}

/**
 * Cette fonction permet de rechercher les médias pour un user
 * @param {*} id_user L'identifiant de l'utilisateur
 * @param {Function} callback La fonction de retour
 */
module.exports.findByIdUser = function (id_user, callback) {
    try {
        var filter = {
            "id_utilisateur": id_user
        };

        collection.value.find(filter).toArray(function (err, result) {
            if (err) {
                callback(false, "Une erreur s'est produite lors de la recherche des medias de cet utilisateur : " + err);
            } else {
                if (result.length > 0) {
                    callback(true, "Tous les media de cet utilsateur sont renvoyés avec succès", result)
                } else {
                    callback(false, "Aucun media pour cet utilisateur")
                }
            }
        })
    } catch (exception) {
        callback(false, "Une exception a été lévée lors de la recherche du média de l'utilidsateur : " +exception);
    }
}

/**
 * La fonction permettant de rechercher une entité media_utilisateur suivant l'id_media.
 * Elle est utilisée dans la fonction "findOneByIdForAdmin" de la DAO "media"
 */
module.exports.findOneByIdMedia = function (id_media, callback) {
    
    try{

        var filter = {
            "id_media" : id_media
        };

        collection.value.findOne(filter, function(err, result){

            if(err){
                callback(false, "Une erreur est survenue lors de la recherche de l'entité media_user liée au média <"+id_media+"> : "+err)
            }else{
                if(result){
                   
                    callback(true, result);

                }else{
                    callback(false, "Il semble qu'aucun auteur ne soit comis au média <"+id_media+">")
                }
            }
        })
    }catch(exception){
        callback(false, "Une exception a été lévée lors de la recherche de l'entité media_user liée au média <"+id_media+"> : "+exception)
    }
}