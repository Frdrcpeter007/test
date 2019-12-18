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

    collection.value = db_js.get().collection("media_produit");
}

/**
 * La fonction permettant d'enregister une entité média-produit
 * @param {*} new_media_user 
 * @param {*} callback 
 */
module.exports.create = function (props, callback) {
    try {
       var sortie = 0;
        
        for (let index = 0; index < props.images.length; index++) {
            
            var obj = {
                "id_produit": props.id_produit,
                "id_auteur": props.id_auteur,
                "id_media": props.images[index]
            };

            insertToMediaProduct(obj, (isInsert, message, result) => {
                sortie++;
                console.log(message);
                
                if (sortie === props.images.length) {
                    callback(true, "Les insertions ont pris fin")
                }
            })
        }
        
    } catch (exception) {
        callback(false, "Une exception a été lévée lors de la création du media de cet utilisateur : " + exception);
    }
}

//Pour l'insertion et la mise à jour des lien_produit
function insertToMediaProduct(newMed, callback) {
    try{
        collection.value.insertOne(newMed, (err, result) => {
        if (err) {
            callback(false, "Une erreur est survénue lors de la création du media de ce produit : " + err);
        } else {
            var newObj = {
                "id_produit": result.ops[0].id_produit,
                "id_auteur": result.ops[0].id_auteur,
                "lien_produit": "" + result.ops[0]._id
            },
            produit_dao = require("./produit_dao");

            produit_dao.setImages(newObj, (isSet, message, resultSet) => {
                callback(isSet, message, result)
            })
        }
    })
    }catch (e){
        callback(false, "Exception : " + e)
    }
    
}

/**
 * La fonction permettant de trouver une entité media_produit suivant un ads donné
 * Elle est utilisée dans la fonction "findOneByIdForAdmin" de la DAO "media"
 */
module.exports.findOneByIdMedia = function(id_media, callback) {
    
    try{

        var filter = {"id_media" : id_media};

        collection.value.findOne(filter, function(err, result) {
            
            if(err){
                callback(false, "Une erreur est survenue lors de la recherche de l'entité media_produit suivant l'id média <"+
                    id_media+"> : "+err);
            }else{
                if(result){
                    callback(true, result)
                }else{
                    callback(false, "Aucune entité media_produit n'a été trouvé pour le média <"+id_media+">");
                }
            }
        })

    }catch(exception){
        callback(false, "Une exception a été lévée lors de la recherche de l'entité media_produit suivant l'id média <"+
            id_media+"> : "+exception);
    }
}

/**
 * Fonction générique servant à renvoyer les images associées à un objet
 */
module.exports.findMediaForProductByObject = (object, callback) => {
    try {
        collection.value.aggregate([
            {
                "$match": {
                    "id_produit": object.id_produit
                }
            }
        ]).toArray((err, resultAggr) => {
            if (err) {
                callback(false, "Les media n'ont pas été trouvé a cause de l'erreur : " +err, object)
            } else {
                if (resultAggr.length > 0) {
                    var sortieMediaProduct = 0,
                        media_dao = require("./media_dao");
                        
                    object.medias = [];
                        
                    media_dao.initialize(db_js);
                    for (let index = 0; index < resultAggr.length; index++) {
                       media_dao.findOneById(resultAggr[index].id_media, (isFound, messageMedia, result) => {
                           sortieMediaProduct++;
                           if (isFound) {
                               object.medias.push(result)
                           }
                           
                           if (sortieMediaProduct == resultAggr.length) {
                               callback(true, "Les médias ont été renvoyé", object)
                           }
                       })
                    }
                } else {
                    callback(false, "Aucun media pour ce produit", object)
                }
            }
        })
    } catch (exception) {
        callback(false, "Les media n'ont pas été trouvé a cause de l'exception : " +exception, object)        
    }
}

/**
 * La fonction permettant de lister les médias d'un produit. 
 */
module.exports.getAllByIdProduct = function(id_produit, callback) {
    
    try{

        var filter = {"id_produit" : id_produit};
        collection.value.find(filter).toArray(function(err_media_prod, result_media_produit) {
            
            if(err_media_prod){
                callback(false, "Une erreur est survenue lors de la recherche des médias liés au produit <"+id_produit+"> : "+err_media_prod, null)
            }else{
                
                if(result_media_produit.length > 0){//Siau moins un média a été trouvé
                    
                    //On passe à la recherche des détails de chaque média. 
                    var media_dao = require("./media_dao");
                    media_dao.initialize(db_js);

                    var liste_retour = [],
                        liste_erreur = [],
                        sortie_media = 0;

                    for (let index_media_prod = 0; index_media_prod < result_media_produit.length; index_media_prod++) {
                        
                        media_dao.findOneByIdFromTopProduct(result_media_produit[index_media_prod].id_media, 
                        function(is_media, message_media, result_media) {
                            
                            sortie_media++;

                            if(is_media){
                                liste_retour.push(result_media)
                            }else{
                                liste_erreur.push(message_media);
                            }

                            if(sortie_media == result_media_produit.length){

                                if(liste_retour.length > 0){
                                    callback(true, null, liste_retour)
                                }else{
                                    callback(false, "Aucun média lié au produit n'a été trouvé, détails : "+liste_erreur, null)
                                }
                            }
                        })
                    }
                }else{//Sinon aucun média n'est trouvé
                    callback(false, "Aucun média n'est lié au produit <"+id_produit+">", null);
                }
            }
        })

    }catch(exception){
        callback(false, "Une exception a été lévée lors de la recherche des médias liés au produit <"+id_produit+"> : "+exception, null)
    }
}
