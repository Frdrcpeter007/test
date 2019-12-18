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

    collection.value = db_js.get().collection("taux");
}

/**
 * L'insertion est la mise à jour du taux suvivant la dénomination 
 * @param {Object} newRate La valeur a insérer
 * @param {Function} callback La fonction de retour
 */
module.exports.create = (newRate, callback) => {
    try {
        
        //Avant de rajouter le nouveau taux, on met à jour l'ancien. 
        var filter = {"short_denomination" : newRate.short_denomination.toUpperCase(), "flag" : true},
            update = {"$set" : {
                    "flag" : false,
                    "date_fin" : new Date()
                }
            };
        collection.value.updateMany(filter, update, function(err_update, resutl_update) {
            
            if(err_update){
                callback(false, "Une erreur est survenue lors de la création du nouveau taux, car la mise à jour du taux passé a échoué : "+err_update, null);
            }else{

                collection.value.insertOne(newRate, function(err_insert, result_insert) {
                    
                    if(err_insert){
                        callback(false, "Une erreur est survenue lors de la création du nouveau taux, car après la mise à jour du taux passé, l'insertion a échoué : "+err_insert, null);
                    }else{
                        callback(true, null, result_insert.ops[0]);
                    }
                })
            }
        })
       
    } catch (exception) {
        callback(false, "Une exception a été lévée lors de l'insertion du nouveau taux : " +exception, null)
    }
}

/**
 * Méthode permettant de récupérer un taux par ses devises d'entrées et sorties
 * @param {String} devise La devise ou le symbole qu'on recherche
 * @param {Function} callback La fonction de retour
 */
module.exports.findOneByDenominationInAndOut = (short_denomination, devise_equivalente, callback) => {
    try {
        
        var filter =  {
            "short_denomination" : short_denomination,
            "devise_equivalente" : devise_equivalente,
            "flag" : true
        }

        collection.value.findOne(filter, function(err, result) {
            
            if(err){
                callback(false, "Une erreur est survenue lors de la recherche du taux en cours dont la short denomination est <"+short_denomination
                    +"> et la dévise équivalente est <"+devise_equivalente+">: " +err)
            }else{
                if(result){
                    callback(true, null, result)
                }else{
                    callback(false, "Aucun taux encours ne correspond à un taux dont la short denomination est <"+short_denomination
                        +"> et la dévise équivalente est <"+devise_equivalente+">", null)
                }
            }
        })

    }catch (exception) {
        callback(false, "Une exception a été lévée lors de la recherche du taux en cours dont la short denomination est <"+short_denomination
            +"> et la dévise équivalente est <"+devise_equivalente+">: " +exception, null)
    }
} 

/**
 * La fonction permettant de convertir de la monnaie.
 * @param {Double} balance Le montant à convertir
 * @param {String} in_currecy La devise entrée
 * @param {String} out_currency La devise de sortie
 */
module.exports.cdfUsdExchange = function(balance, in_currecy, out_currency, callback) {

    //On commennce par recuperer le taux en cours
    try{

        var filter =  {
            "short_denomination" : {"$in" : [in_currecy, out_currency]},
            "devise_equivalente" : {"$in" : [in_currecy, out_currency]},
            "flag" : true
        }
    
        collection.value.findOne(filter, function(err, result_taux) {
            
            if(err){

                callback(false, "Une erreur est survenue lors de la recherche du taux en cours dont la short denomination est <"+in_currecy
                    +"> et la dévise équivalente est <"+out_currency+">: " +err);

            }else{
                if(result_taux){//Si le taux est trouvé
                    
                    var exchanged_balance = 0.0;

                    if(in_currecy == result_taux.short_denomination){
                        exchanged_balance = balance * result_taux.montant_equivalent;
                    }else{
                        exchanged_balance = parseFloat(parseFloat(balance / result_taux.montant_equivalent).toPrecision(4));
                    }
                    

                    var objet_retour = {
                        "in_balance" : {
                            "balance" : balance,
                            "currency" : in_currecy
                        },
                        "out_balance" : {
                            "balance" : exchanged_balance,
                            "currency" : out_currency
                        }
                    }
                    callback(true, null, objet_retour)

                }else{//Aucun taux en cours correspondant aux critères de recherche n'a été trouvé

                    callback(false, "Aucun taux encours ne correspond à un taux dont la short denomination est <"+in_currecy
                        +"> et la dévise équivalente est <"+out_currency+">", null)
                }
            }
        })

    }catch(exception){
        callback(false, "Une exception a été lévée lors de la recherche du taux en cours dont la short denomination est <"+in_currecy
            +"> et la dévise équivalente est <"+out_currency+">: " +exception, null);
    }
}