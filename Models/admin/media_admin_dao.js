//------------Définition des variables globales
//cette variable est destinée à contenir une référence à
//l'objet collection qui dérivera de "db_js"
var db_js = require("../db"),
    media_dao = require("../media_dao");


/**
 * La fonction permettant de lister les médias
 */
module.exports.getAll = function(type, top, limit, callback) {
    
    media_dao.initialize(db_js);
    media_dao.getAllForAdmin(type, top, limit, function(isMediaListed, resultMedia) {
        callback(isMediaListed, resultMedia);
    })
}

module.exports.create = function(new_media, etat, type_ads, id_agent, callback) {
    
    media_dao.initialize(db_js);
    
    media_dao.create(new_media, etat, type_ads, function(isMediaCreated, messageMedia, resultMedia) {
        
        if(isMediaCreated){

            var media_user = {
                "id_utilisateur": id_agent,
                "id_media": "" + resultMedia._id,
                "type": type_ads
            },
            media_user_dao = require("../../Models/media_user_dao");

            media_user_dao.initialize(db_js);
            media_user_dao.create(media_user, function(isMediaUser, resultMediaUser) {
                
                if(isMediaUser){

                    callback(true, resultMedia)
                }else{

                   callback(false, resultMediaUser)
                }
            })
        }else{
            callback(false, messageMedia);
        }
    })
}

module.exports.findOneById = function (id_media, callback) {
    
    media_dao.initialize(db_js);
    media_dao.findOneByIdForAdmin(id_media, function(isMediaMatched, resultMedia) {
        callback(isMediaMatched, resultMedia)
    })
}