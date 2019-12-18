
/**
 * Le modèle du pannier
 */
module.exports.Pannier = function Pannier() {
    return {
    "id_client" : null,
    "id_beneficiaire": null,
    "id_adresse" : null,
    "produits" : []
    }
}

/**
 * La structure des items de la propriété "produits" : 
 * {
        "id_produit" : null,
        "quantite" : null,
        "id_lieu_vente" : null,
        "id_dealer" : null
    }
 */