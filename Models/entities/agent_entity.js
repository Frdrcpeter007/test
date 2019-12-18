/**
 * Ceci est le modèle de l'entité agent, et là on la répresente en object 
 */
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
            "password": []
        },
        "commune" : [],
        "creation" : {
            "id_agent" : null,
            "date" : null
        },
        "privilege" : [] //Les valeurs sont tirées de celles des rôles.
    }
}

module.exports.AgentCommune = function AgentCommune() {
    
    return{
        "id_commune" : null,
        "date_debut_affect" : null,
        "date_fin_affect" : null,
        "flag" : null,
        "role" : null //administrateur, agent (niveau commune)
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
         "id_parain" :null //L'agent qui a attribué le rôle
     }
}

module.exports.AgentPrivilege = function AgentPrivilege() {
    return {
        "valeur" : null,
        "etat" : null,
        "date_debut" : null,
        "date_fin" : null
    }
}