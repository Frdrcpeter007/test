/**
 * Ceci est le modèle de l'entité commande, et là on la répresente en object 
 */
module.exports.Commande = function Commande() {

    return {
        "date": null,
        "client": {
            "id": null,
            "localisation_livraison": null,
            "id_beneficiaire" : null
        },
        "produits": [],
        "paiement": {
            "commande" : null,
            "livraison" : null
        },
        "operation": [],
        "reference_paiement" : null
    }
}

module.exports.PaiementCommande = function PaiementCommande() {
    return {
        "date" : null,
        "pin" : null,
        "motif" : null,
        "cout" : null,
        "montant_payer" : null,
        "devise" : null
    }
}

module.exports.PaiementLivraison = function PaiementLivraison() {
    return {
        "duree": null,
        "cout": null,
        "montant_payer" : null,
        "devise": null
    }
}

module.exports.OperationCommande = function OperationCommande(){
    return {
        "type" : null, //reception, confirmation
        "date" : null,
        "id_concerne" : null //id_client ou id_agent en fonction du type
    }
}

module.exports.ProduitCommande = function ProduitCommande() {
    return {
        "id_produit" : null,
        "id_lieu_vente" : null,
        "id_commune" : null,
        "id_dealer" : null,
        "quantite" : null,
        "pu": null,
        "unite": null
    }
}