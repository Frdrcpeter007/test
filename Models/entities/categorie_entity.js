/**
 * Ceci est le modèle de l'entité categorie, et là on la répresente en object 
 */
module.exports.Categorie = function Categorie() {

    return {
        "intitule": null,
        "sous_categorie": [],
        "description": null,
        "flag" : false,
        "lien_couverture" : null,
        "creation" :{
            "date" : null,
            "id_agent" : null
        }
    }
}

module.exports.SousCategorie = function SousCategorie() {
    
    return {
        "id": null,
        "intitule": null,
        "id_media" : null,
        "details" : null,
        "flag" : null
    }
}