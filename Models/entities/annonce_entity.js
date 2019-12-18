/**
 * Ceci est le modèle de l'entité annonce, et là on la répresente en object 
 */
module.exports.Annonce = function Annonce() {
    
    return {
        "lien_couverture" : null,
        "titre" : null,
        "message" : null,
        "date_creation" : null,
        "date_modification" : null,
        "flag" : null,
        "id_agent" : null
    }
}

/**
 * Ceci est le modèle de l'entité annonce, lorque le dealer lance une nouvel annonce
 */
module.exports.AnnonceByDealer = function AnnonceByDealer() {
    return{
        "id_dealer": null,
        "intitule_produit": null,
        "qte": null,
        "unite": null,
        "annotation": null,
        "date_recolte": null,
        "date": null,
        "flag": null
    }
}