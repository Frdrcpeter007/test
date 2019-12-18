//------------Définition des variables globales
//cette variable est destinée à contenir une référence à
//l'objet collection qui dérivera de "db_js"
var db_js = require("./db");

var collection = {
    value: null
}

/**
* Ici on initialise la variable "collection" en lui passant
* la valeur provenant de "db_js". NB: cette fonction sera accessible en dehors de ce fichier
*/
module.exports.initialize = function (db_js) {

    collection.value = db_js.get().collection("beneficiaire_commande");
}

/**
 * La fonction permettant de créer un bénéficiaire d'une commande
 */
module.exports.create = function(new_beneficiaire, callback) {
    
    try{

        collection.value.insertOne(new_beneficiaire, function(err, result) {
            
            if(err){
                callback(false, "Une erreur est survenue lors de la création du bénéficiaire : "+err, null)  
            }else{
                callback(true, null, result.ops[0]);
            }
        })

    }catch(exception){
        callback(false, "Une exception a été lévée lors de la création du bénéficiaire : "+exception, null)
    }
}

/**
 * La fonction permettant de rechercher un bénéficiaire par son identifiant
 */
module.exports.findOneById = function (id_beneficiaire, callback) {
    
    try{

        var _id = require("mongodb").ObjectID(id_beneficiaire),
            filter = {"_id" : _id};

        collection.findOne(filter, function(err, result) {
            
            if(err){
                callback(false, "Une erreur est survenue lors de la recherche du bénéficiaire <"+id_beneficiaire+"> : "+err, null)
            }else{
                if(result){

                    //On recherche l'adresse
                    var adresse_dao = require("./adresse_dao");
                    adresse_dao.initialize(db_js);
                    adresse_dao.findOneById(result.id_adresse, function(is_adresse, message_adresse, result_adresse) {
                        if(is_adresse){
                            result.adresse = result_adresse;
                            callback(true, null, result)
                        }else{
                            callback(false, message_adresse, null)
                        }
                    })
                   
                }else{
                    callback(false, "Aucun bénéficiaire ne correspond à l'identifiant <"+id_beneficiaire+">", null);
                }
            }
        })

    }catch(exception){
        callback(false, "Une exception a été lévée lors de la recherche du bénéficiaire <"+id_beneficiaire+"> : "+exception, null)
    }
}

/**
 * La fonction permettant de lister les bénéficiaires créés par un client spécifique.
 */
module.exports.getAllByCreator = function (creer_par, callback) {
    
    try{

        var filter = {"creer_par" : creer_par},
            liste_with_adresse = [],
            liste_erreur = [];
        collection.value.find(filter).toArray(function(err_beneficiaire, result_beneficiaire) {
            
            if(err_beneficiaire){
                callback(false, "Une erreur est survenue lors du listage de bénéficiaires créés par le client <"+creer_par+"> : "+ err_beneficiaire, null)
            }else{
                if(result_beneficiaire.length > 0){

                    //Pour chaque bénéficiaire, on recherche son adresse
                    var adresse_dao = require("./adresse_dao"),
                        sortie_benef = 0;                        

                    adresse_dao.initialize(db_js);
                    for (let index_benef = 0; index_benef < result_beneficiaire.length; index_benef++) {
                        
                        adresse_dao.findOneById(result_beneficiaire[index_benef].id_adresse, 
                        function(is_adresse, message_adresse, result_adresse) {                            

                            if(is_adresse){//Si la recherche de l'adresse est positive
                                result_beneficiaire[sortie_benef].adresse = result_adresse;
                                liste_with_adresse.push(result_beneficiaire[sortie_benef]);

                            }else{//Sinon la recherche est négative
                                liste_erreur.push(message_adresse)
                            }

                            //On incrémente la condition de sortie
                             sortie_benef++;

                            //On vérifie la condition de sortie
                            if(sortie_benef == result_beneficiaire.length){
                                
                                if(liste_with_adresse.length > 0){
                                    callback(true, liste_erreur, liste_with_adresse)
                                }else{
                                    callback(false, liste_erreur, null);
                                }
                            }
                        })
                    }
                }else{
                    liste_erreur.push("Aucun bénéficiaire n'a été créé par le client <"+creer_par+">");
                    callback(false, liste_erreur, null);
                }
            }
        })
    }catch(exception){
        liste_erreur.push("Une exception a été lévée lors du listage de bénéficiaires créés par le client <"+creer_par+"> : "+ exception);
        callback(false, liste_erreur, null)
    }
}