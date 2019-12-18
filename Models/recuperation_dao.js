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

    collection.value = db_js.get().collection("recuperation");
}

/**
 * La fonction qui permet de créer une recuperation
 */
module.exports.create = function (new_recuperation, callback) {

    try { //Si ce bloc passe

        //On appele la méthode insertOne (une methode propre à mongoDB) de notre collection qui doit prendre la structure de l'entité
        collection.value.insertOne(new_recuperation, function (err, result) {

            //On test s'il y a erreur
            if (err) {
                callback(false, "Une erreur est survénue lors de la création de l'objet de récupération :" + err);
            } else { //S'il n'y a pas erreur

                //On vérifie s'il y a des résultat renvoyé
                if (result) {
                    callback(true, result.ops[0])
                } else { //Si non l'etat sera false et on envoi un message
                    callback(false, "Désolé, l'objet de recupération n'a pas été créée");
                }
            }
        })

    } catch (exception) { //Si ce bloc ne passe pas on lève une exception
        callback(false, "Une exception a été lévée lors de la création de l'objet de récupération : " + exception);
    }
}

/**
 * La fonction qui permet de générer un code de confirmation
 */
module.exports.genererCode = function () {

    var arrayLettre = ("abcdefghijklmnopqrstuvwxyz").split("");

    var random1 = Math.floor(Math.random() * 10000);
    var random2 = Math.floor(Math.random() * 10000);

    let lettre1 = arrayLettre[randomIndexLetter()],
        lettre2 = arrayLettre[randomIndexLetter()],
        lettre3 = arrayLettre[randomIndexLetter()],
        lettre4 = arrayLettre[randomIndexLetter()],
        lettre5 = arrayLettre[randomIndexLetter()],
        lettre6 = arrayLettre[randomIndexLetter()];

    var codeFinal = "" + lettre1 + lettre2 + random1 + lettre3 + lettre4 + random2 + lettre5 + lettre6;

    return codeFinal;

}
/**
 * Cette fonction est interne au modèle, elle est utilisée dans la méthode "genererCode"
 * @return number
 */
function randomIndexLetter() {
    var arrayLettre = ("abcdefghijklmnopqrstuvwxyz").split("");
    var randomArrayLettre = Math.floor(Math.random() * (arrayLettre.length - 1));
    return randomArrayLettre;
}

/**
 * La fonction qui permet de vérifier si un code de confirmation correspond à une valeur d'un username
 */
module.exports.checkCode = function (code_validation, valeur_username, callback) {

    try {

        var filter = {
            "username": valeur_username,
            "code_validation": code_validation,
            "etat": true
        }

        collection.value.findOne(filter, function (err, result) {

            if (err) {
                callback(false, "Une erreur est survenue lors de la vérification de l'égalité du code de validation d'avec la valeur du username : " + err);
            } else {

                if (result) {
                    callback(true, result)
                } else {
                    callback(false, "Aucun code valide ne correspond à la valeur du username fourni");
                }
            }
        })

    } catch (exception) {
        callback(false, "Une exception a été lévée lors de la vérification de l'égalité du code de validation d'avec la valeur du username : " + exception);
    }
}

/**
 * La fonction qui permet de mettre à jour un code  de validation après son utilisation
 * C-à-d mettre son état à false pour indiquer qu'il est déjà utilisé
 */
module.exports.setCodeFalse = function (recuperation, callback) {

    try {

        var _id = require("mongodb").ObjectID("" + recuperation._id),
            filter = {
                "_id": _id
            },
            update = {
                "$set": {
                    "etat": false
                }
            };


        collection.value.updateOne(filter, update, function (err, result) {

            if (err) {
                callback(false, "Une erreur est survenue lors de la mise à jour du code de validation d'avec la valeur du username : " + err);
            } else {

                callback(true, result)
            }
        })

    } catch (exception) {
        callback(false, "Une exception a été lévée lors de la mise à jour du code de validation d'avec la valeur du username : " + exception);
    }
}