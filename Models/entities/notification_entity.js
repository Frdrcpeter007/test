/**
 * Ceci est le modèle de l'entité notification, et là on la répresente en object 
 */
module.exports.Notification = function Notification() {

    return {
        "id_objet": null,
        "id_auteur": null,
        "id_recepteur": null,
        "date": null,
        "type": null,
        "flag": true
    }
}

/**
 * Différentes types : 
 *      avis, 
 *      vue,
 *      evaluation, 
 *      achat, 
 *      vente, 
 *      alerte_systeme
 *      update_operation_vente
 * 
 */
//