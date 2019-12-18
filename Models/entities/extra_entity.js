/**
 * Ceci est le modèle de l'entité extra, et là on la répresente en object 
 */
module.exports.Extra = function Extra() {

    return {

        "type": null,
        "flag": null,
        "id_auteur": null,
        "id_produit_dealer": null,
        "date": null,
        "contenu": null
    }
}

/**
 * Ceci est le modèle de l'entité extra dédiée à la lecture d'annonces
 */
module.exports.ExtraAnnonce = function ExtraAnnonce() {
    
    return{
        "type" : null,
        "flag" : null,
        "id_annonce" : null,
        "id_client" : null,
        "date"  : null
    }
}

/**
 * Ceci est le modèle de l'entité extra dédiée au vue d'un produit
 */
module.exports.ExtraView = function ExtraView() {
    return {
        "type": null,
        "id_client": null,
        "id_produit_dealer": null,
        "flag" : null,
        "date": null
    }
}

/**
 * Ceci est le modèle de l'entité extra dédiée aux évaluation d'un produit
 */
module.exports.ExtraEvaluation = function ExtraEvaluation() {
    return{
        "id_client": null,
        "id_produit_dealer" : null,
        "type": null,
        "evaluation": []
    }
}

//Les différentes valeurs type : star, annonce, avis, vu, 