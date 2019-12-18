//------------Définition des variables globales
//cette variable est destinée à contenir une référence à
//l'objet collection qui dérivera de "db_js"
var db_js = require("../db");

//Le modèle de données
var categorie_dao = require("../categorie_dao");

/**
 * La fonction permettant de lister toutes les catégories
 */
module.exports.getAllCategories = function (callback) {
    
    categorie_dao.initialize(db_js);

    categorie_dao.getAll(null, function(isMatched,resultMessage, resultMatch) {
        callback(isMatched, resultMessage, resultMatch)
    })

}

/**
 * La fonction permettant de créer une nouvelle catégorie
 */
module.exports.createNewCategory = function(new_category, callback) {
    
    categorie_dao.initialize(db_js);
    categorie_dao.create(new_category, function (isCreated, resultMessage, resultCreating) {
        callback(isCreated, resultMessage, resultCreating)
    })
}

/**
 * La fonction permettant de trouver les details d'une categorie
 * Donc toutes les sous-catégories de ladite catégorie seront affichées
 */
module.exports.getOneCategoryById = function(idCategory, callback) {
    
    categorie_dao.initialize(db_js);
    categorie_dao.getAllUnderCategoryByIdCategory(idCategory, function(isMatched, resultMessage, resultMatch) {
            
        callback(isMatched, resultMessage, resultMatch)
    })
}

/**
 * La fonction permettant de mettre à jour les infos d'une catégorie
 */
module.exports.updateOneCategoryInfos = function (idCategory, newValue, callback) {
    
    categorie_dao.initialize(db_js);
    categorie_dao.updateOneCategoryInfosForAdmin(idCategory, newValue, function (isUpdated, resultUpdated) {
        
        callback(isUpdated, resultUpdated);
    })
}

/**
 * La fonction permettant à mettre à jour l'état de la catégorie
 */
module.exports.updateCategoryFlag = function (idCategory, callback) {
    
    categorie_dao.initialize(db_js);

    categorie_dao.updateCategoryFlagForAdmin(idCategory, function (isUpdated, resultUpdated) {
        
        callback(isUpdated, resultUpdated)
    })
}

/**
 * La fonction permettant d'afficher les détails d'une sous-catégorie,
 * donc tous ses produits seront affichés.
 */
module.exports.getOneUnderCategoryById = function (idUnderCat, callback) {
    
    var produit_dao = require("../produit_dao");

    produit_dao.initialize(db_js);
    produit_dao.findListByIdSousCategorieForSousCategorie(null, idUnderCat, function (isMatched, resultMatch) {
        
        callback(isMatched, resultMatch)
    })
}

/**
 * La fonction permettant de mettre à jour les informations d'une sous-catégorie donnée
 */
module.exports.updateOneUnderCategoryInfos = function (id_categorie, index_under_cat, new_value, callback) {
    
    categorie_dao.initialize(db_js);
    categorie_dao.updateOneUnderCategoryInfosForAdmin(id_categorie, index_under_cat, new_value, 
        function (isUpdated, resultUpdated) {
        
            callback(isUpdated, resultUpdated)
    })
}

/**
 * La fonction permettant à mettre à jour le flag d'une sous-catégorie donnée
 */
module.exports.updateOneUnderCategoryFlag = function (id_categorie, id_under_cat, index_under_cat,  callback) {
    
    categorie_dao.initialize(db_js);
    categorie_dao.updateOneUnderCategoryFlagForAdmin(id_categorie, id_under_cat, index_under_cat, 
        function(isUpdated, resultUpdated) {
        
            callback(isUpdated, resultUpdated)

    })
}

/**
 * La fonction permettant d'afficher les infos (intitulé et description) de la catégorie.
 */
module.exports.getCategorieInfosById = function (id_categorie, callback) {
    
    categorie_dao.initialize(db_js);
    categorie_dao.getCategorieInfosByIdForAdmin(id_categorie, function(isCategorie, resultCategorie) {
        
        callback(isCategorie, resultCategorie)
    })
}

/**
 * La fonction permettant de mettre à jour le lien couverture d'une catégorie
 */
module.exports.updateCategoryCoverImage = function (id_categorie, new_media, callback) {
    
    var image_dao = require("../media_dao");

    image_dao.initialize(db_js);

    image_dao.createForCategory(new_media, id_categorie, function(isUpdated, resultUpdated) {
        callback(isUpdated, resultUpdated)
    })
}

/**
 * La fonction permettant de lister les sous-catégorie d'une catégorie
 */
module.exports.getAllUnderCategoryByIdCategory = function (id_categorie, callback) {
    
    categorie_dao.initialize(db_js);
    categorie_dao.getAllUnderCategoryByIdCategory(id_categorie, function (isMatched, messageMatch, resultMatch) {
        callback(isMatched, messageMatch, resultMatch);
    })
}

/**
 * La fonction permettant d'afficher les détails d'une sous-catégorie
 */
module.exports.getOneUnderCategoryInfos = function (id_categorie, id_under_cat, callback) {
    
    categorie_dao.initialize(db_js);
    categorie_dao.getOneUnderCategoryInfos(id_categorie, id_under_cat, function(isUnderCat, resultUnderCat) {
        callback(isUnderCat, resultUnderCat)
    })
}

/**
 * La fonction permettant d'ajouter une nouvelle sous-categorie
 */
module.exports.addSousCategorie = function (id_categorie, new_sous_categorie, callback) {
    
    categorie_dao.initialize(db_js);
    categorie_dao.addSousCategorieForAdmin(id_categorie, new_sous_categorie, function (isAdded, resultMessage, result) {
        callback(isAdded, resultMessage, result);
    })
}

/**
 * La fonction permettant la mise à jour d'un media pour une sous-categorie
 */
module.exports.updateOneUnderCategoryCoverImage = function(id_categorie, index_under_cat, id_media, callback) {
    
    categorie_dao.initialize(db_js);
    categorie_dao.updateOneUnderCategoryCoverImageForAdmin(id_categorie, index_under_cat, id_media, 
    function(is_media, message_media, result_update) {
        callback(id_media, message_media, result_update);
    })
}