//#region ADRESSE
module.exports.Adresse = function Adresse() {

    return {
        "id_client": null,
        "id_ville" : null,
        "commune" : null,
        "quartier" : null,
        "avenue" : null,
        "numero" : null,
        "reference" : null,
        "type" : null,
        "flag" : null,
        "coordonnees" : null
    }
}
//#endregion

//#region ADS
module.exports.Ads = function Ads() {

    return {
        "id_media": null,
        "type": null,
        "annotation" : null,
        "date_creation": null,
        "date_debut_publication": null,
        "date_fin_publication": null,
        "etat": null,
        "id_agent" : null
    }
}
//#endregion

//#region AGENCE
module.exports.Agence = function Agence() {

    return {
        "nom" : null,
        "adresse" : null,
        "coordonnee" : null,
        "lien_couverture" : null,
        "flag" : null,
        "date" : null
    }
}
//#endregion

//#region AGENT
module.exports.Agent = function Agent() {

    return {

        "nom": null,
        "prenom": null,
        "matricule": null,
        "sexe": null,
        "date_naissance": null,
        "lieu_naissance": null,
        "lien_profil": null,
        "authentification": {
            "username": [],
            "telephone" : [],
            "password": [],
            "role": [] 
        },
        "agence" : [],
        "creation" : {
            "id_agent" : null,
            "date" : null
        }
    }
}

module.exports.AgentAgence = function AgentAgence() {
    
    return{
        "id_agence" : null,
        "date_debut_affect" : null,
        "date_fin_affect" : null,
        "flag" : null,
        "role" : null //administrateur, agent (niveau agence)
    }
}

module.exports.AgentUsername = function AgentUsername() {
    
    return {
        "valeur" : null, 
        "etat" : null
    }
}

module.exports.AgentRole = function AgentRole() {
     return{
         "valeur" : null, //super_admin, admin, agent (systeme global)
         "etat" : null,
         "date_debut" : null,
         "date_fin" : null,
         "id_parain" :null
     }
}
//#endregion

//#region ALERTE

module.exports.Alerte = function Alerte() {
    return {
        "id_objet" : null,
        "id_auteur" : null,
        "niveau": null,
        "type" : null,
        "descriptif" : null,
        "date" : null,
        "flag" : false
    }
}

/**
 * Le niveau d'alerte : 
 *      1 - mineur,
 *      2 - intermédiaire,
 *      3 - grave,
 *      4 - critique
 */

 /**
  * Le type d'alerte : 
  *     1 - agent à problème,
  *     2 - client à problème,
  *     3 - dealer à problème,
  *     4 - produit à problème
  */
//#endregion

//#region ANNONCE
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
//#endregion

//#region CATEGORIE
/**
 * Ceci est le modèle de l'entité categorie, et là on la répresente en object 
 */
module.exports.Categorie = function Categorie() {

    return {
        "intitule": null,
        "sous_categorie": [],
        "description": null,
        "flag" : false,
        "lien_couverture" : null,
        "creation" :{
            "date" : null,
            "id_agent" : null
        }
    }
}

module.exports.SousCategorie = function SousCategorie() {
    
    return {
        "id": null,
        "intitule": null,
        "details" : null,
        "flag" : null
    }
}
//#endregion

//#region CLIENT
/**
 * Ceci est le modèle de l'entité client, et là on la répresente en object 
 */
module.exports.Client = function Client() {

    return {
        "prenom": null,
        "nom": null,
        "sexe" : null,
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
//#endregion

//#region CODE
module.exports.Code = function Code() {
    return{
        "id_client": null,
        "code": null,
        "date": null
    }
}
//#endregion

//#region COMMANDE
/**
 * Ceci est le modèle de l'entité commande, et là on la répresente en object 
 */
module.exports.Commande = function Commande() {

    return {
        "date": null,
        "client": {
            "id": null,
            "localisation_livraison": null
        },
        "produit": [],
        "agence" : [],
        "paiement": [],
        "operation": [],
    }
}

/**
 * Exemple d'un objet produit : 
 * {
        "id_produit" : "5b677c423c90df234d874f1a",
        "quantite" : 3
    }
 */

 /**
  * Exemple d'un objet agence quand la commande est reçue par l'agence la plus approximative du lieu 
  * de la livraison : 
  * {
  *     "original" : "id_agence",
  *     "date" : "date_commande"
  * }
  */

   /**
  * Exemple d'un objet agence quand la commande est transférée vers une nouvelle agence :
  * {
  *     "original" : "id agence initiale",
  *     "forwad" : "id agence vers laquelle est transférée la commande",
  *     "date" : "date de transfert",
  *     "agent" : "id de l'agent ayant transféré",
  *     "motif" : "la raison du transfert"
  * }
  */

  /**
   * Exemple d'un objet paiement : 
   * {
            "date" : "25/11/2018",
            "pin" : "0984532786",
            "motif" : "Solde",
            "montant" : 4567
        }
   */

   /**
    * Exemple d'un objet opération : 
    * {
            "type" : "livraison", //reception, confirmation
            "date" : ISODate("2019-03-12T10:37:09.220Z"),
            "id_concerne" : "5c7b1d1681595342685fe540" //id_client ou id_agent en fonction du type
        }
    */
//#endregion

//#region CONTACT
module.exports.Contact = function Contact() {
    return {
        "noms": null,
        "email": null,
        "objet": null,
        "message": null,
        "date": null
    }
}
//#endregion

//#region DEALER
/**
 * Ceci est le modèle de l'entité dealer, et là on la répresente en object 
 */
module.exports.Dealer = function Dealer() {

    return {
        "id_client" : null,
        "date" : null,
        "story" : []
    }
}

module.exports.StoryContent = function StoryContent() {
    
    return{
        "date" : null,
        "flag" : null,
        "agent" : null
    }
}
//#endregion

//#region EXTRAS
/**
 * Ceci est le modèle de l'entité extra, et là on la répresente en object 
 */
module.exports.Extra = function Extra() {

    return {

        "type": null,
        "flag": null,
        "id_produit": null,
        "id_auteur": null,
        "id_dealer": null,
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
        "id_produit": null,
        "id_dealer": null,
        "date": null
    }
}

/**
 * Ceci est le modèle de l'entité extra dédiée aux évaluation d'un produit
 */
module.exports.ExtraEvaluation = function ExtraEvaluation() {
    return{
        "id_client": null,
        "id_produit": null,
        "type": null,
        "evaluation": []
    }
}
//#endregion

//#region FAVORIS
/**
 * Ceci est le modèle de l'entité favoris, et là on la répresente en object 
 */
module.exports.Favoris = function Favoris() {

    return {
        "id_client": null,
        "id_produit": null,
        "date": null,
        "flag" : null,
        "modified_date" : null
    }
}
//#endregion

//#region LOG
/**
 * L'entity Login, repertoriant la traçabilité du client
 */
module.exports.Log =  function Log() {
    return {
        "id_client": null, 
        "type": null,
        "date": null
    }
}
//#endregion

//#region MEDIA
/**
 * Ceci est le modèle de l'entité media, et là on la répresente en object 
 */
module.exports.Media = function Media() {
    return {
        "name" : null,
        "web_size" : null,
        "mobile_size" : null,
        "type" : null, //profilProduit
        "path" : null,
        "date" : null
    }
}
//#endregion

//#region MEDIA_PRODUIT
module.exports.MediaProduit = function MediaProduit() {
    return {
        "id_auteur" : null,
        "id_media" : null,
        "id_produit" : null
    }
}
//#endregion

//#region MEDIA_UTILISATEUR
/**
 * Ceci est le modèle de l'entité media, et là on la répresente en object 
 */
module.exports.Media = function Media() {
    return {
        "id_utilisateur": null,
        "id_media": null,
        "type": null
    }
}
//#endregion

//#region MESSAGE

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
//#endregion

//#region NOTIFICATION
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
//#endregion

//#region OPERATION_PRODUIT
/**
 * Les valeurs de la propriété "type" sont :
 * - vente,
 * -achat,
 * - transfert,
 * - validation
 */

/**
 * L'entité dédiée aux opérations de vente
 */
module.exports.OperationProduitVente = function OperationProduitVente() {
    
    return {
        "id_produit": null,
        "type": null,
        "id_dealer": null,
        "quantite": null,
        "date": null,
        "validation" : null,
        "etat" : null,
        "id_agence" : null
    }
}

/**
 * Ceci est le modèle dédié aux opérations achat
 */
module.exports.OperationProduitAchat = function OperationProduitAchat() {
    
    return {
        "id_produit": null,
        "type": null,
        "id_client": null,
        "quantite": null,
        "date": null,
        "id_operation_vente" : null,
        "id_commande" : null,
        "id_agence" : null
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
        "id_agence" : null
    }
}
//#endregion

//#region PARTENAIRE
/**
 * Ceci est le modèle de l'entité partenaire, et là on la répresente en object 
 */
module.exports.Partenaire = function Partenaire() {

    return {
        "intitule": null,
        "description" : null,
        "id_media": null,
        "site_web": null,
        "flag" : false
    }
}
//#endregion

//#region PRODUIT
/**
 * Ceci est le modèle de l'entité produit, et là on la répresente en object 
 */
module.exports.Produit = function Produit() {

    return {
        "intitule": [],
        "annotation": null,
        "localisation": null,
        "pu": null,
        "lien_produit": null,
        "sous_categorie": [],
        "unite" : null
    }
}
//#endregion

//#region PROMOTION
module.exports.Promotion = function Promotion() {
    return {
        "id_produit" : null,
        "date" : null,
        "date_debut" : null,
        "date_fin" : null,
        "id_agent" : null,
        "flag" : null,
        "pu" : null
    }
}
//#endregion

//#region RECHERCHE

module.exports.Recherche = function Recherche() {
    
    return {
        "valeur" : null,
        "localisation" : null,
        "date" : null,
        "id_client" : null,
        "etat" : null
    }
}
//#endregion

//#region RECUPERATION
/**
 * Ceci est le modèle de l'entité Recuperation, et là on la répresente en object 
 */
module.exports.Recuperation = function Recuperation() {
    
    return {
        "username" : null,
        "code_validation" : null,
        "date" : null,
        "etat" : null
    }
}
//#endregion

//#region ROLE
/**
 * Ceci est le modèle de l'entité Recuperation, et là on la répresente en object 
 */
module.exports.Role = function Role() {
    
    return {
        "intitule" : null,
        "niveau" : null
    }
}
//#endregion

//#region UNITE_MESURE
module.exports.UniteMesure = function UniteMesure() {
    return {
        "_id" : null,
        "intitule" : null
    }
}
//#endregion

//#region VILLE
/**
 * Ceci est le modèle de l'entité ville, et là on la répresente en object 
 */
module.exports.Ville = function Ville() {

    return {
        "intitule": null
    }
}
//#endregion