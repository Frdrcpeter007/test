//------------Définition des variables globales
//cette variable est destinée à contenir une référence à
//l'objet collection qui dérivera de "db_js"
var db_js = require("./db"),
    bcrypt = require("bcrypt");

var collection = {
    value: null
}

/**
 * Ici on initialise la variable "collection" en lui passant
 * la valeur provenant de "db_js". NB: cette fonction sera accessible en dehors de ce fichier
 */
module.exports.initialize = function (db_js) {

    collection.value = db_js.get().collection("agent");
}

/**
 * La fonction qui permet de créer un agent
 */
module.exports.create = function (new_agent, callback) {

    try { //Si ce bloc passe

        var pswd = "za" + new_agent.authentification.password[0] + "eb";

        bcrypt.hash(pswd, 10, function (errHash, hashePwd) {
            if (errHash) {
                callback(false, "Une erreur est survénue lors du hashage du mot de passe : " + errHash, null)
            } else {
                
                new_agent.authentification.password[0] = hashePwd;

                //On appele la méthode insertOne (une methode propre à mongoDB) de notre collection qui doit prendre la structure de l'entité
                collection.value.insertOne(new_agent, function (err, result) {

                    //On test s'il y a erreur
                    if (err) {
                        callback(false, "Une erreur est survenue lors création de cet agent", "" + err);
                    } else { //S'il n'y a pas erreur

                        //On vérifie s'il y a des résultat renvoyé
                        if (result) {
                            callback(true, "Agent correctement créé", result.ops[0])
                        } else { //Si non l'etat sera false et on envoi un message
                            callback(false, "Désolé, l'agent n'a pas été crée", null)
                        }
                    }
                })
            }
        })

    } catch (exception) { //Si ce bloc ne passe pas on lève une exception
        callback(false, "Une exception a été lévée lors de la création de l'agent : " + exception, null);
    }
}

/**
 * La fonction permettant de vérifier la disponibilité du username
 */
module.exports.checkUsername = function(username, callback) {
    
    try{

        var filter = {'authentification.username' : 
            { "$elemMatch" : 
                {
                    "valeur" : username
                }
            }
        },
        project = {
            "_id" : 1
        };

        collection.value.findOne(filter, project, function(err, result) {
            if(err){
                callback(false, "Une erreur est survenue lors de la vérification du username : "+err);
            }else{
                if(result){
                    callback(false, "Ce username est déjà utilisé")
                }else{
                    callback(true, "Ce username est valide")
                }
            }
        })        

    }catch(exception){
        callback(false, "Une exception a été lévée lors de la vérification du username : "+exception);
    }
}

/**
 * La fonction permettant de mettre à jour l'avatar de l'agent
 */
module.exports.updateAvatarForAdmin = function(id_agent, path, name, size, callback) {
    
    try{

        var media = require("./entities/media_entity").Media(),
            media_dao = require("./media_dao");
        
        media.name = name;
        media.size = size;
        media.type = "profilAgent";
        media.path = path;
        media.date = new Date();

        media_dao.initialize(db_js);
        media_dao.createForUser(media, id_agent, "agent",  function (isCreated,  resultMedia) {
            if (isCreated) {

                var _id = require("mongodb").ObjectID(id_agent),
                    filter = {"_id" : _id},
                    update = {"$set":
                        {
                            "authentification.lien_profil" : ""+resultMedia._id
                        }
                    };
                
                collection.value.updateOne(filter, update, function(err, result) {
                    if(err){
                        callback(false, "Une erreur est survneue lors de la mise à jour de la photo profile : "+err);
                    }else{
                        callback(true, resultMedia)
                    }
                })
                
            } else {
                callback(false, resultMedia)
            }
        })
    }catch(exception){
        callback(false, "Une exception a été lévée lors de la mise à jour de l'avatar de l'agent <"+id_agent+"> : "+exception);
    }
}

/**
 * La fonction qui permet de trouver un agent par son identifiant
 */
module.exports.findOneById = function (identifiant, callback) {

    try { //Si ce bloc passe

        //On se crée une variable qui transformera l'identifiant passé en ObjetID (disons en crypté)
        var _id = require("mongodb").ObjectID(identifiant),
            filter = {
                "_id": _id
            }; //Ici on crée le filtre pour faire la recherche

        //On appele la méthode findOne (une methode propre à mongoDB) de notre collection qui doit prendre le filtre afin de recherche à ce propos
        collection.value.findOne(filter, function (err, result) {

            //S'il y a erreur
            if (err) {
                callback(false, "Une erreur est survenue lors de la recheche de cet agent", "" + err);

            } else { //Si non

                //On test s'il y a des résulats trouvé
                if (result) {
                    callback(true, "L'agent a été trouvé avec succèss", result)
                } else { //Si non l'etat sera a false et y envoie un message
                    callback(false, "Aucun agent ne correspond à cet identifiant", null)
                }
            }
        })

    } catch (exception) { //Si ce bloc là ne passe pas alors on lève une exception
        callback(false, "Une exception a été lévée lors de la recheche de l'agent par son identifiant : " + exception, null);
    }
}

/**
 * Cette fonction génère un matricule pour l'agent
 * @param {Function} callback Fonction de retour
 */
module.exports.generateMaricule = function (callback) {

    /**
     * Une collection des variables qui recupère chacun la valeur de retour de la fonction randomNumber()
     */
    var {
        begin,
        random1,
        random2,
        end
    } = randomNumber();

    //Initialisation de la collection
    var collection = db_js.get().collection("agent");

    //Là on essaye d'estimer le nombre de document qui existe dans cette collection
    collection.estimatedDocumentCount(function (err, result) {

        if (err) { //Si il y a erreur
            callback(false, "Une erreur lors du comptage des agents : " + err)
        } else { //Si non
            //le nombre renvoyé par celui on l'incremente
            var nombre = result + 1;

            //Puis on se fait un petit modèle d'affichage du maticule
            var matricule = begin + random1 + random2 + zeroAbsolute(nombre) + end;

            //Ensuite je le renvoie
            callback(true, matricule)
        }
    })

}

/**
 * Cette fonction nous permet un ajout dynamique des zéro lors de la génération du matricule
 * @param {Number} nombre Le nombre sur lequel on veut faire des modification
 */
function zeroAbsolute(nombre) {

    if (nombre < 10) {
        nombre = "000" + nombre;
    } else if (nombre >= 10 && nombre < 100) {
        nombre = "00" + nombre;
    } else if (nombre >= 100 && nombre < 1000) {
        nombre = "0" + nombre;
    } else {
        nombre = nombre;
    }

    return nombre;
}

/**
 * Cette fonction permet de générer aléatoirement les cinq premier nombre du matricule 
 */
function randomNumber() {

    const begin = "ZA",
        end = "B";
    var random1 = Math.floor(Math.random() * 10);

    var random2 = Math.floor(Math.random() * 10);

    return {
        begin,
        random1,
        random2,
        end
    };


}

/**
 * La fonction permettant le login de l'agent
 */
module.exports.login = function (username, password, callback) {
    
    if(username && password){
        
        collection.value.aggregate([{
                "$match": {"authentification.username" :
                    {"$elemMatch" : 
                        {
                            "valeur" : username,
                            "etat" : true
                        }
                    }
                }
            },
            {
                "$project": {
                    "password": {
                        "$arrayElemAt": ["$authentification.password", -1]
                    }
                }
            }
        ]).toArray(function(errAggr, resultAggr) {
            
            if(errAggr){
                callback(false, "Une erreur est survenue lors de l'authentification de l'agent : "+errAggr);
                
            }else{
                
                if(resultAggr.length > 0){

                    var clearPwd = "za" + password + "eb";

                    bcrypt.compare(clearPwd, resultAggr[0].password, function (errCompareCrypt, resultCompareCrypt) {

                        if (errCompareCrypt) {
                            callback(false, "Une erreur est survenue lors du décryptage du mot de passe : " + errCompareCrypt);
                        } else {
                            if (resultCompareCrypt) {

                                callback(true, "" + resultAggr[0]._id);

                            } else {
                                callback(false, "Le mot de passe est incorrect");
                            }
                        }
                    });

                }else{
                    callback(false, "Username incorrect");
                }
            }
            
        })
    }
}

/**
 * La fonction permettant de compter le nombre de agents,
 * ELle est utilisée dans l'administration
 */
module.exports.countAllForAdmin = function(callback) {
    
    try{
        
        collection.value.estimatedDocumentCount({}, function(err, result) {
            
            if(err){
                callback(false, "Une erreur est survenue lors du comptage du nombre des agents : "+err);
            }else{
                callback(true, result)
            }
        })

    }catch(exception){
        callback(false, "Une exception a été lévée lors du comptage des agents : "+exception);
    }
}

/**
 * La fonction permettant de lister les agents
 * Elle est utilisée dans l'administration
 */
module.exports.getAllForAdmin = function (gtDateAgent, callback) {
    
    try{

        var filter = {},
            sort = {"date" : -1},
            project = {
                "authentification.password" : 0,
                "authentification.username" : 0,
                "date" : 0
            };

        if(gtDateAgent != "null"){

            var dateAgent = new Date(gtDateAgent);
            filter = {"date" : {"$lt" : dateAgent}}
        }

        collection.value.find(filter)
        .project(project)
        .sort(sort)
        .limit(10).toArray(function (err, resultAgent) {
            if(err){
                callback(false, "Une erreur est survenue lors du listage des agents : "+err, null)
            }else{

                if(resultAgent.length > 0){
                    
                    var sortieAgent = 0,
                        listeAgent = [],
                        listErreurAgent = [];

                    for (let indexAgent = 0; indexAgent < resultAgent.length; indexAgent++) {
                        
                        module.exports.findOneByIdForAdmin(""+resultAgent[indexAgent]._id, function(isFound, resultFound) {
                            
                            sortieAgent++;

                            if(isFound){

                                var authentification = {
                                    "username" : resultFound.authentification.username,
                                    "telephone" : resultFound.authentification.telephone
                                }

                                resultFound.authentification = authentification;
                                listeAgent.push(resultFound)
                            }else{
                                listErreurAgent.push(resultFound)
                            }

                            if(sortieAgent == resultAgent.length){
                                var objet_retour = {
                                    "agents" : listeAgent,
                                    "erreurs_agents" : listErreurAgent
                                }

                                callback(true, null, objet_retour);
                            }
                        })
                    }

                }else{
                    callback(false, "Aucun agent n'a été trouvé", null)
                }
            }
        })

    }catch(exception){
        callback(false, "Une exception a été lévée lors du listage des agents : "+exception, null)
    }
}

/**
 * La fonction permettant d'afficher les détails d'un agent
 */
module.exports.findOneByIdForAdmin = function(identifiant, callback) {
    
    try{
        var _id = require("mongodb").ObjectID(identifiant),
            filter = {"_id" : _id};
        
        collection.value.findOne(filter, function(err, result) {
            
            if(err){
                callback(false, "Une erreur est survenue lors de la recherche de l'agent <"+identifiant+"> : "+err);
            }else{
                
                if(result){
                    result.liste_erreur = [];
                    //On commence par rechercher l'image de profil
                    var image_dao = require("./media_dao");
                    image_dao.initialize(db_js);

                    image_dao.findONeByIdFromAgent(result, function(isMedia, messageMedia, resultWithMedia) {
                        
                        if(isMedia == false){
                            resultWithMedia.liste_erreur.push(messageMedia)
                        }

                        //On recherche le nom de l'administrateur ayant créé l'agent.
                        var _idAdmin = require("mongodb").ObjectID(resultWithMedia.creation.id_agent),
                            filterAdmin = {"_id" : _idAdmin};

                        collection.value.findOne(filterAdmin, function(errAdmin, resultAdmin) {
                            
                            if(errAdmin){
                                resultWithMedia.liste_erreur.push("Une erreur se produite lors de la recherche de l'administrateur <"+resultWithMedia.creation.id_agent+"> : "+errAdmin);
                            }else{

                                resultWithMedia.creation.nom_agent = null;

                                if(resultAdmin){

                                    resultWithMedia.creation.nom_agent = resultAdmin.prenom+" "+resultAdmin.nom;

                                }

                                //On recherche le rôle
                                if(resultWithMedia.commune.length > 0){

                                    var role_dao = require("./role_dao"),
                                    commune_dao = require("./commune_dao"),
                                    sortieCommune = 0,
                                    listeCommune = [];

                                    role_dao.initialize(db_js);
                                    commune_dao.initialize(db_js);

                                    

                                    //On traite les infos des communes 
                                    for (let indexCommune = 0; indexCommune < resultWithMedia.commune.length; indexCommune++) {
                                        
                                        role_dao.findOneByIdFromAgent(resultWithMedia.commune[indexCommune], function(isRole, messageRole, resultWithRole) {
                                        
                                            commune_dao.findAllFromAgentForAdmin(resultWithRole, function(isCommune, messageCommune, resultWithCommune) {
                                                
                                                sortieCommune++;

                                                listeCommune.push(resultWithCommune);

                                                if(sortieCommune == resultWithMedia.commune.length){
                                                    resultWithMedia.commune = null;
                                                    resultWithMedia.commune = listeCommune;

                                          
                                                    callback(true,resultWithMedia);
                                                }

                                            })
                                        })
                                    }
                                }else{
                                    callback(true,resultWithMedia);
                                }

                            }

                        })

                    })

                }else{
                    callback(false, "Aucun agent ne correspond à l'identifiant <"+identifiant+">");
                }
            }

        })

    }catch(exception){
        callback(false, "Une exception a été lévée lors de la recherche de l'agent <"+identifiant+"> : "+exception);
    }
}

module.exports.findOneByIdFromAlerte = function(alerte,callback ) {
    
    try{

    
        var _id = require("mongodb").ObjectID(alerte.id_objet),
        filter = {"_id" : _id};

        collection.value.findOne(filter, function(err, result) {
            
            if(err){
                callback(false, "Une erreur est survenue lors de la recherche de l'agent <"+alerte.id_objet+"> : "+err);
            }else{

                result.error = null;
                if(result){

                    //On commence par rechercher l'image de profil
                    var image_dao = require("./media_dao");
                    image_dao.initialize(db_js);

                    image_dao.findONeByIdFromAgent(result, function(isMedia, messageMedia, resultWithMedia) {
                        
                        var infos_agent = {
                            "id_agent" : ""+resultWithMedia._id,
                            "nom" : resultWithMedia.nom,
                            "prenom" : resultWithMedia.prenom,
                            "sexe" : resultWithMedia.sexe,
                            "image_name" : resultWithMedia.authentification.image_name,
                            "image_path" : resultWithMedia.authentification.image_path
                        };

                        alerte.infos_agent = infos_agent;
                        callback(true, null, alerte)
                    })

                }else{
                    callback(false, "Aucun aget ne correrspond à l'identifiant <"+alerte.id_objet+">", null)
                }
            }
        })

    }catch(exception){
        callback(false, "Une exception a été lévée lors de la recherche de l'agent <"+result.id_objet+"> : "+exception)
    }
}

/**
 * La fonction permettant d'affecter une commune à un agent
 */
module.exports.addCommuneForAdmin = function (id_agent, agent_commune, callback) {
    try{

        var _id = require("mongodb").ObjectID(id_agent),
            filter = {"_id" : _id},
            update = {
                "$push" : {
                    "commune" : agent_commune
                }
            };

        collection.value.updateOne(filter, update, function(err, result) {
            if(err){
                callback(false, "Une erreur est survenue lors de l'affectation d'une commune à l'agent <"+id_agent+"> : "+err, null)
            }else{

                if(result.matchedCount == 1 && result.modifiedCount == 1){
                    callback(true, null, "Commune affectée avec succès");
                }else{
                    callback(false, "Aucun agent ne correspond à l'identifiant <"+id_agent+">", null);
                }
                
            }
        })        
    }catch(exception){
        callback(false, "Une exception a été lévée lors de l'affectation d'une commune à l'agent <"+id_agent+"> : "+exception, null)
    }
}

module.exports.getAllByIdCommune = function(id_commune, callback) {
    
    try{
        var filter = {"commune.id_commune" : id_commune},
            project = {"_id" : 1};

        collection.value.find(filter, project).toArray(function(err, result) {
            if(err){

                callback(false, "Une erreur est survenue lors de la recherche des agens affectés à la commune <"+id_commune+"> : "+
                    err, null);
            }else{
                if(result.length > 0){
                    callback(true, null, result);
                }else{
                    callback(false, "Aucun n'agent n'est affecté à la commune <"+id_commune+">", null)
                }
            }
        })

    }catch(exception){
        callback(false, "Une exception a été lévée lors de la recherche des agens affectés à la commune <"+id_commune+"> : "+
        exception, null);
    }
}

/**
 * La fonction permettant de renvoyer la listes d'agents ayant le privilège "Admin est super-admin"
 */
module.exports.getAllWherePrivilegeSuperAdminAndAdmin = function(callback) {
    
    try{
        var filter = {"privilege.valeur" : { "$in" : ["5c7a5c2ce156add319ade307", "5c7a5c21e156add319ade306"] }},
            project = {"_id" : 1};
        
        collection.value.find(filter, project).toArray(function(err, result) {
            if(err){
                callback(false, "Une erreur est survenue lors de la recherche des agents ayant le privilège 'Super-Administrateur' ou 'Administrateur' : "+err, null);
            }else{
                if(result.length > 0){
                    callback(true, null, result)
                }else{
                    callback(false, "Aucun agent ayant le privilège 'Super-Administrateur' ou 'Administrateur' n'a été trouvé ", null);

                }
            }
        })

    }catch(exception){
        callback(false, "Une exception a été lévée lors de la recherche des agents ayant le privilège 'Super-Administrateur' ou 'Administrateur' : "+exception, null);
    }
}

// A REVOIR
module.exports.getAgencyForAdminAgent = (objet, callback) => {
    try {
        collection.value.aggregate([
            {
                "$match": {
                    "_id": require("mongodb").ObjectId(objet.id_agent)
                }
            },
            {
                "$project": {
                     "agence": {
                        "$arrayElemAt": ["$agence", -1]
                    }
                }
            },
            {
                "$match": {
                    "agence.flag": true,
                    "date_fin_affect": null
                }
            }
        ]).toArray((err, resultAggr) => {
            if (err) {
                callback(false, "Une erreur est survenue lors de la recupération de la dernière agence de l'agent")
            } else {
                if (resultAggr.length > 0) {
                    var agence_dao =  require("./agence_dao"),
                        listeRetour = {};

                    objet.agence = resultAggr[0].agence;

                    agence_dao.initialize(db_js);
                    agence_dao.findOneByIdFromAgent(objet.agence, (isFound, messageAgence, resultWithAgence) => {
                        if (isFound) {
                            listeRetour.titre = objet.titre;
                            listeRetour.message = objet.message;
                            listeRetour.date_modification = objet.date_modification;
                            listeRetour.id_annonce = "" + objet._id;
                            listeRetour.nom_agence = resultWithAgence.nom_agence;

                            callback(true, "L'agence est vu", listeRetour)
                        } else {
                            callback(false, messageAgence)
                        }
                    })
                } else {
                    callback(false, "Aucune agence n'a été trouvé pour l'agent en question")
                }
            }
        })
    } catch (exception) {
        callback(false, "Une exception a été lévée lors de la recupération de la dernière agence de l'agent")        
    }
}