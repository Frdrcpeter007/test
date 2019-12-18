
/**
 * L'entité Message
 */
module.exports.Message = function Message() {
    
    return {
        "expediteur" : null,
        "destinataire" : null,
        "sujet" : null,
        "contenu" : null,
        "date" : null,
        "status": {
            "etat" : null,
            "date_lecture" : null
        }
    }
}

/**
* L'entité Message pour Annonce 
*/
module.exports.MessageForAnnonce = function MessageForAnnonce() {
    return{
        "expediteur": null,
        "id_annonce": null,
        "sujet": null,
        "contenu": null,
        "date": null,
        "status": null
    }
}