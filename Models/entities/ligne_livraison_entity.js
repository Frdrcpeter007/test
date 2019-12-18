/**
 * Ceci est le modèle de l'entité LigneLivraison
 */
module.exports.LigneLivraison =  function LigneLivraison() {
    return {
        "_id" : null, 
        "communes" : [],
        "cout" : []
   }
}

/**
 * Ceci est le modèle de l'objet commune destiné à la liste "communes" de l'entité "LigneLivraison"
 */
module.exports.CommuneLigneLivraison = function CommuneLigneLivraison() {
    return {
        "id_commune" : null,
        "etat" : null
    }
}

/**
 * Ceci est le modèle de l'objet cout destiné à la liste "cout" de l'entité "LigneLivraison"
 */
module.exports.CoutLigneLivraison = function CoutLigneLivraison() {
    return {
        "type" : null,
        "prix" : null,
        "poids" : null,
        "duree" : null,
        "reduction" : {
            "prix" : null,
            "poids" : null,
            "condition_kg" : null
        }
    }
}