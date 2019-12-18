/**
 * Ceci est le modèle de l'entité client, et là on la répresente en object 
 */
module.exports.Client = function Client() {

    return {
        "prenom": null,
        "nom": null,
        "genre" : null, //homme, femme, entreprise
        "type": null, //C'est le type de client qu'on veut enregistrer : Sachant qu'un dealer est aussi un client
        "inscription": {
            "username": [],
            "password": [],
            "lien_profil": null,
            "type_paiement": [],
            "date" : null
        },
        "createdAt":null,
        "updateAt":[],
        "deletedAt":null,
        "flag": false,
        "story" : []
    }
}

module.exports.ClientUsername = function ClientUsername() {
    return {
        "valeur": null,
        "etat": null,
        "type": null
    }
}

//L'entité à renseigner lorsque le genre du client est "entreprise"
// Ajout de la propriété entreprise de la façon :  Client.entreprise
module.exports.InfosCompteEntreprise = function InfosCompteEntreprise() {
    return{
        "website" : null,
        "email" : null,
        "telephone" : null,
        "rccm" : null,
        "id_nat" : null,
        "num_impot" : null,
        "forme_juridique" : null,
        "adresse_commerciale" : null
    }
}