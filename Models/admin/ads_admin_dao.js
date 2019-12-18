//------------Définition des variables globales
//cette variable est destinée à contenir une référence à
//l'objet collection qui dérivera de "db_js"
var db_js = require("../db");

//Le modèle de données
var ads_dao = require("../ads_dao");

/**
 * La fonction permettant de create un ads
 */
module.exports.create = function(new_ads, image_name, image_path, image_size, callback) {
    
    var media_ads = {
        "name" : image_name,
        "path" : image_path,
        "size" : image_size,
        "type" : "ads"
    }

    ads_dao.initialize(db_js);
    ads_dao.createForAdmin(new_ads, media_ads, function(isCreated, resultAds) {
        callback(isCreated, resultAds)
    })
}

/**
 * La fonction permettant de lister les ads
 */
module.exports.getAll = function(top, limit, callback) {
    
    ads_dao.initialize(db_js);
    ads_dao.getAllForAdmin(top, limit, function(isAds, resultAds) {
        
        callback(isAds, resultAds);
    })
}

/**
 * La fonction permettant d'afficher un ads spécifique suivant son identifiant
 */
module.exports.findOneById = function(id_ads, callback) {
    
    ads_dao.initialize(db_js);
    ads_dao.findOneByIdForAdmin(id_ads, function(isAds, resultAds) {
        callback(isAds, resultAds)
    })
}

/**
 * La fonction permettant de mettre à jour les infos d'un ads spécifique
 */
module.exports.updateInfos = function(id_ads, type, date_debut, date_fin, annotation, callback) {
    
    var updateInfos = {
        "type" : type,
        "date_debut_publication" : date_debut,
        "date_fin_publication" : date_fin,
        "annotation" : annotation
    }

    ads_dao.initialize(db_js);
    ads_dao.updateInfosForAdmin(id_ads, updateInfos, function(isUpdate, resultUpdate) {
        callback(isUpdate, resultUpdate)
    })
}

/**
 * La fonction permettant de mettre à jour l'état d'un ads
 */
module.exports.updateState = function(id_ads, callback) {
    
    ads_dao.initialize(db_js);
    ads_dao.updateStateForAdmin(id_ads, function(isUpdate, resultUpdate) {
        callback(isUpdate, resultUpdate)
    })
}
