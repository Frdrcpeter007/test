
module.exports.Alerte = function Alerte() {
    return {
        "id_objet" : null,
        "id_auteur" : null,
        "niveau": null,
        "type" : null,
        "descriptif" : null,
        "date" : null,
        "flag" : false
    }
}

/**
 * Le niveau d'alerte : 
 *      1 - mineur,
 *      2 - intermédiaire,
 *      3 - grave,
 *      4 - critique
 */

 /**
  * Le type d'alerte : 
  *     1 - agent à problème,
  *     2 - client à problème,
  *     3 - dealer à problème,
  *     4 - produit à problème
  */