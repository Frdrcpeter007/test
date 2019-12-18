/**
 * Les valeurs de la propriété "type" sont :
 * - vente,
 * -achat,
 * -attente
 * - transfert,
 * - validation
 */

/**
 * L'entité dédiée aux opérations de vente
 */
module.exports.OperationProduitVente = function OperationProduitVente() {
    
    return {
        "id_produit": null,
        "id_produit_dealer" : null,
        "type": null,
        "id_dealer": null,
        "id_produit_dealer_prix" : null,
        "quantite": null,
        "date": null,
        "validation" : null,
        "etat" : null,
        "id_lieu_vente" : null,
        "id_commune" : null
    }
}

/**
 * Ceci est le modèle dédié aux opérations achat
 */
module.exports.OperationProduitAchat = function OperationProduitAchat() {
    
    return {
        "id_produit": null,
        "id_produit_dealer" : null,
        "type": null,
        "id_client": null,
        "quantite": null,
        "date": null,
        "id_operation_vente" : null,
        "id_commande" : null,
        "id_lieu_vente" : null,
        "id_commune" : null
    }
}

/**
 * Le modèle opération utilisée lors de gestion de validation par agent
 */
module.exports.OperationProduitAdmin = function OperationProduitAdmin() {
    
    return {
        "id_operation" : null,
        "type" : null,
        "id_agent" : null,
        "date" : null,
        "valeur_validation" : null,
        "id_lieu_vente" : null,
        "id_commune" : null
    }
}

