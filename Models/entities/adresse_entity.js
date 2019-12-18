/**
 * Ceci est le modèle de l'entité client, et là on la répresente en object 
 */
module.exports.Adresse = function Adresse() {

    return {
        "id_client": null,
        "id_commune" : null,
        "quartier" : null,
        "avenue" : null,
        "numero" : null,
        "reference" : null,
        "type" : null,
        "flag" : null,
        "coordonnees" : null
    }
}