/**
 * Ceci est le modèle de l'entité dealer, et là on la répresente en object 
 */
module.exports.Dealer = function Dealer() {

    return {
        "id_client" : null,
        "date" : null,
        "story" : [],
        "lieu_vente" : [], //liste adresse
        "details" : null
    }
}

module.exports.Details = function Details() {
    return {
        "rccm" :  null,
        "id_nat" : null,
        "description" : null,
        "web_site" : null,
        "facebook" : null,
        "twitter" : null,
        "instagram" : null
    }
}

module.exports.StoryContent = function StoryContent() {
    
    return{
        "date" : null,
        "flag" : null,
        "agent" : null
    }
}

module.exports.LieuVente = function LieuVente() {
    return {
        "id_adresse" : null,
        "etat" : false
    }
}