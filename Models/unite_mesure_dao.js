//------------Définition des variables globales
//cette variable est destinée à contenir une référence à
//l'objet collection qui dérivera de "db_js"
var db_js = require("./db");

var collection = {
    value: null
}

//Ici on initialise la variable "collection" en lui passant
//la valeur provenant de "db_js". NB: cette fonction sera accessible
//en dehors de ce fichier
module.exports.initialize = function (db_js) {

    collection.value = db_js.get().collection("unite_de_mesure");
}

/**
 * Module pour la récupération des unités de mésure
 */
module.exports.getAll = (callback) => {
    try {
        collection.value.aggregate([
            {
                "$match": {}
            }
        ]).toArray((err, resultAggr) => {
            if (err) {
                callback(false, "Une erreur est survenue lors de la récupérations des unités de mésure : " +err)
            } else {
                if (resultAggr.length > 0) {
                    callback(true, "Les unités sont récupérer", resultAggr)
                } else {
                    callback(false, "Il n'y a aucune unité de mesure")
                }
            }
        })
    } catch (exception) {
        callback(false, "Une exception a été lévée lors de la récupérations des unités de mésure : " + exception)        
    }
}