//------------Définition des variables globales
//cette variable est destinée à contenir une référence à
//l'objet collection qui dérivera de "db_js"
var db_js = require("./db");

var collection = {
    value: null
}

//Ici on initialise la variable "collection" en lui passant
//la valeur provenant de "db_js". NB: cette fonction sera accessible
//en dehors de ce fichier
module.exports.initialize = function (db_js) {

    collection.value = db_js.get().collection("ligne_livraison");
}

/**
 * La fonction permettant de créer une nouvelle ligne de livraison
 */
module.exports.createForAdmin = function (new_ligne_livraison, callback) {
    
    try{
        collection.value.insertOne(new_ligne_livraison, function(err, result) {
            if(err){
                callback(false, "Une erreur est survenue lors de la création de la nouvelle ligne de livraison : "+err, null);
            }else{
                callback(true, null, result.ops[0]);
            }
        })
    }catch(exception){
        callback(false, "Une exception a été lévée lors de la création de la nouvelle ligne de livraison : "+exception, null);
    }
}

/**
 * La fonction permettant de rechercher les détails d'une ligne de livraison
 */
module.exports.findOneById = function (id_ligne, callback) {
    try{
        var _id = require("mongodb").ObjectID(id_ligne),
            filter = {"_id" : _id};

        collection.value.findOne(filter, function(errLigne, resultLigne) {
            if(errLigne){
                callback(false, "Une erreur est survenue lors de la recherche de la ligne <"+id_ligne+"> : "+errLigne, null)
            }else{
                if(resultLigne){
                    //Si au moins une ligne a été trouvée
                    //On recherche les détails de ses communes
                    var commune_dao = require("./commune_dao"),
                        sortie_commune = 0,
                        objet_retour = {
                            "id_ligne" : null,
                            "communes" : [],
                            "erreur_communes" : []
                        };
                    
                    //On recupère l'identifiant de la ligne
                    objet_retour.id_ligne = ""+resultLigne._id;
                    
                    if(resultLigne.communes.length > 0){//Si la ligne compte au moins une commune

                        commune_dao.initialize(db_js);

                        //On passe en boucle les communes de la ligne
                        for (let index_commune = 0; index_commune < resultLigne.communes.length; index_commune++) {
                            
                            commune_dao.findOneByIdFromLigneLivraison(resultLigne.communes[index_commune], 
                            function(is_commune, message_commune, result_commune) {
                                
                                //On incrémente le compteur de sortie
                                sortie_commune++;

                                if(is_commune){
                                    objet_retour.communes.push(result_commune)
                                }else{
                                    objet_retour.erreur_communes.push(message_commune)
                                }

                                //On vérifie la condition de sortie
                                if(sortie_commune == resultLigne.communes.length){
                                    callback(true, null, objet_retour);
                                }
                            })
                        }

                    }else{//Sinon aucune commune n'est affectée à la ligne encours
                        objet_retour.erreur_communes.push("La ligne <"+id_ligne+"> ne possède aucune commune");
                        callback(true, null, objet_retour);
                    }
                }else{
                    callback(false, "Aucune ligne ne correspond à l'identifiant <"+id_ligne+">", null);
                }
            }
        })
    }catch(exception){
        callback(false, "Une exception a été lévée lors de la recherche de la ligne <"+id_ligne+"> : "+exception, null)
    }
}

/**
 * La fonction permettant de rechercher l'identifiant de la ligne pour une commune.
 */
module.exports.getLineIdFromCommuneId = function(id_commune, callback) {
    
    try{

        var filter = {"communes" : 
                {"$elemMatch" :
                    {"id_commune" : id_commune,
                    "etat" : true
                    }
                }
            },
            project = {"_id" :1};

        collection.value.findOne(filter, project, function(err_ligne, result_ligne) {
            
            if(err_ligne){
                callback(false, "Une erreur est survenue lors de la recherche de l'identifiant de la ligne pour la commune <"+
                    id_commune+"> : "+err_ligne, null);

            }else{
                if(result_ligne){
                    callback(true, null, result_ligne._id);
                }else{
                    callback(false, "Aucune ligne n'a été trouve pour la commune <"+id_commune+">", null)
                }
            }
        })

    }catch(exception){
        callback(false, "Une exception a été lévée lors de la recherche de l'identifiant de la ligne pour la commune <"+
            id_commune+"> : "+exception, null)
    }
}

/**
 * La fonction permettant de rechercher les couts de livraison d'une ligne par type de livraison
 */
module.exports.getCoutByIdLineAndType = function(id_ligne, type_livraison, callback) {
    
    try{
        
        collection.value.aggregate([
            {"$match" : 
                {"_id" : id_ligne}
            },
            {"$project" : 
                {"cout" : 1}
            },
            {"$unwind" : "$cout"
            },
            {"$match" : 
                {"cout.type" : type_livraison}
            }
        ]).toArray(function(err, result) {
            
            if(err){

                callback(false, "Une erreur est survenue lors de la recherche du cout de livraison de la ligne <"+
                    id_ligne+"> pour le type <"+type_livraison+"> : "+err, null);

            }else{

                if(result.length > 0){

                    callback(true, null, result);

                }else{

                    callback(false, "Aucune ligne correspondant à l'indentifiant <"+
                        id_ligne+"> et dont le type de livraison est <"+type_livraison+"> n'a été trouvée", null);

                }

            }
        })

    }catch(exception){

        callback(false, "Une exception a été lévée lors de la recherche du cout de livraison de la ligne <"+
            id_ligne+"> pour le type <"+type_livraison+"> : "+exception, null);

    }
}

/**
 * La fonction permettant de lister toutes les lignes de livraison. 
 */
module.exports.getAllForAdmin = function(callback) {

    try{

        collection.value.find({}).toArray(function(errLigne, resultLigne) {
            if(errLigne){
                callback(false, "Une erreur  est survenue lors du listage des lignes : "+exception, null);
            }else{
                if(resultLigne.length > 0){

                    //Pour chaque ligne, on recherche ses détails
                    var objet_retour = {
                            "lignes" : [],
                            "erreur_lignes" : []
                        },
                        sortie_commune = 0;

                    for (let index_commune = 0; index_commune < resultLigne.length; index_commune++) {
                        
                        module.exports.findOneById(resultLigne[index_commune], function(is_commune, message_commune, result_commune) {
                            
                            sortie_commune++;

                            if(is_commune){
                                objet_retour.lignes.push(result_commune)
                            }else{
                                objet_retour.erreur_lignes.push(message_commune)
                            }

                            //On vérifie la condition de sortie
                            if(sortie_commune == resultLigne.length){
                                callback(true, null, objet_retour);
                            }
                        })
                    }

                }else{
                    callback(false,"Aucune ligne de livraison n'a été trouvée", null);
                }
            }
        })
    }catch(exception){
        callback(false, "Une exception  a été lévée lors du listage des lignes : "+exception, null)
    }
}

/**
 * La fonction permettant de determiner la ligne de livraison à suivre pour la commande.
 */
module.exports.getDetailsLivraisonCommande = function(pannier, callback) {
    
    
    var commune_livraison = null,
        objet_retour = {
            "adresse_livraison" : null,
            "produits" : [],
            "commune_lointaine" : null,
            "liste_erreur" : []
        },
        liste_commune_lieu_vente = [],
        adresse_dao = require("./adresse_dao");

    //On commence par rechercher la commune de livraison
    adresse_dao.initialize(db_js);

    if(pannier.id_adresse){

        adresse_dao.findOneByIdForAdresseLivraison(pannier.id_adresse, function(is_adresse, message_adresse, result_adresse) {
            
            if(is_adresse){//Si la recherche sur l'adresse renvoie un résultat positif

                objet_retour.adresse_livraison = result_adresse;

                //On recupère la commune de livraison
                commune_livraison = result_adresse.commune;

                //Puis on procède à la recherche des communes de lieux de vente
                if(pannier.produits.length > 0){

                    var sortie_produit = 0,
                        adresse_dao = require("./adresse_dao"),
                        produit_dealer_prix_dao = require("./produit_dealer_prix_dao");

                    adresse_dao.initialize(db_js);
                    produit_dealer_prix_dao.initialize(db_js);

                    //On parcour les produits du pannier en recherchant les adresses de vente de chaque produit.
                    for (let index_produit = 0; index_produit < pannier.produits.length; index_produit++) {
                    
                        adresse_dao.findOneByIdForProduitLivraison(pannier.produits[index_produit], 
                        function(is_adresse, message_adresse, result_with_address) {

                            if(is_adresse){//Si l'adresse de l'opération est trouvée

                                if(!liste_commune_lieu_vente.includes(""+result_with_address.adresse.commune._id)){//On évite les doublons
                                    liste_commune_lieu_vente.push(""+result_with_address.adresse.commune._id);
                                }

                            }else{//Sinon l'adresse de l'opération n'est pas trouvée
                                var erreur = {
                                    "id_produit" : result_with_address.id_produit,
                                    "quantite" : result_with_address.quantite,
                                    "message" : "Erreur adresse de vente : "+message_adresse
                                };

                                objet_retour.liste_erreur.push(erreur)
                            }

                            //Pour chaque produit, on doit rechercher son prix
                            produit_dealer_prix_dao.findOneByIdProduitDealerFromCommande(result_with_address, function(is_price, message_price,result_with_price){
                                
                                objet_retour.produits.push(result_with_price);

                                if(is_price == false){//Si la recherche du prix a renvoyé une erreur, on la recupère

                                    var erreur = {
                                        "id_produit" : result_with_address.id_produit,
                                        "message" : message_price
                                    };

                                    objet_retour.liste_erreur.push(erreur)
                                }

                                //On incrémente la variable de sortie
                                sortie_produit++;

                                //On vérifie la condition de sortie de la recherche des communes de lieux de vente de chaque produit commandé
                                if(pannier.produits.length == sortie_produit){

                                    if(liste_commune_lieu_vente.length > 0){//Si au moins une commune de vente a été trouvée

                                        //A présent il faut rechercher le trajet le plus éloigné, ce dernier sera l'itinéreaire suivi par le livreur
                                        getFarestSalingPlaceTownship(commune_livraison, liste_commune_lieu_vente, 
                                        function(isFarestTownship, messageFarestTownship, resultFarestTownship) {
                                            
                                            if(isFarestTownship){
                                                objet_retour.commune_lointaine = resultFarestTownship
                                            }else{
                                                objet_retour.liste_erreur.push(messageFarestTownship)
                                            }

                                            //On recupère la quantité et l'unité de chaque produit en vue de trouver le poids total de la commande
                                            var liste_quantite_unite_prod = [];
                                            
                                            for (let index_qte_unit_prod = 0; index_qte_unit_prod < objet_retour.produits.length; index_qte_unit_prod++) {
                                                
                                                var quantite_unite = {
                                                    "quantite" : objet_retour.produits[index_qte_unit_prod].quantite,
                                                    "unite" : objet_retour.produits[index_qte_unit_prod].details.unite
                                                }

                                                liste_quantite_unite_prod.push(quantite_unite);
                                            }

                                            //on calcule le poid total de la commande
                                            var poid_total_commande = calculatePoidTotalCommande(liste_quantite_unite_prod);

                                            //On calcule le cout de la livraison
                                            calculateDeliveryCost(objet_retour.adresse_livraison.id_commune, ""+objet_retour.commune_lointaine._id, 
                                            poid_total_commande, function (is_prix_calcul, message_prix_calcul, details_ligne_livraison_commande) {
                                                
                                                if(!is_prix_calcul){
                                                    objet_retour.liste_erreur.push(message_prix_calcul);
                                                }

                                                details_ligne_livraison_commande.commune_depart = objet_retour.commune_lointaine.nom;
                                                details_ligne_livraison_commande.commune_arrivee = objet_retour.adresse_livraison.commune.nom;
                                                objet_retour.details_ligne_livraison = details_ligne_livraison_commande;
                                                callback(true, null, objet_retour);
                                            })

                                        })

                                    }else{//Sinon aucune commune de vente n'a été trouvée
                                        callback(false, "Aucune commune de vente n'a été trouvée", objet_retour);
                                    }
                                }
                            })
                        })
                    }

                }else{
                    callback(false, "Le pannier est vide", null)
                }
                
            }else{//Sinon la recherche sur l'adresse n'a renvoyé qu'un resultat négatif
                callback(false, message_adresse, null)
            }
        })

    }else{

        callback(false, "Aucune adresse de livraison n'a été fournie", null)
    }
}

/**
 * La fonction permettant de retrouver la commune la plus éloignée parmi les lieux de ventes fournissant les produits commandés
 * @param {Object} commune_livraison 
 * @param {Array} liste_commune_lieu_vente 
 * @param {Function} callback 
 */
function getFarestSalingPlaceTownship(commune_livraison, liste_commune_lieu_vente, callback) {
    
    try{

        var commune_dao = require("./commune_dao"),
            longitude_commune_livraison = commune_livraison.location.coordinates[0],
            latitude_commune_livraison = commune_livraison.location.coordinates[1];
        commune_dao.initialize(db_js);

        commune_dao.geoNearByCordinatesForCart(longitude_commune_livraison, latitude_commune_livraison, liste_commune_lieu_vente, 
        function(is_geo, message_geo, result_geo) {
            
            if(is_geo){//Si les communes ont été réorganisées suivant les coordonnées de livraison

                //On recupère la commune la plus éloigné
                var farest_saling_township = result_geo[result_geo.length - 1];

                callback(true, null, farest_saling_township);

            }else{//Sinon le filtrage par coordonées géographiques de livraison n'est pas positif
                callback(false, message_geo, null);
            }
        })

    }catch(exception){
        callback(false, "Une exception a été lévée lors de la recherche de la commune du lieu de vente le plus éloigné : "+exception, null)
    }
}


/**
 * La fonction permettant de calculer le cout de la livraison.
 * @param {String} commune_livraison 
 * @param {String} commune_lointaine 
 * @param {Object} poid_total_commande
 * @param {Function} callback 
 */
function calculateDeliveryCost(commune_livraison, commune_lointaine, poid_total_commande, callback) {
    
    /**
     * Pour calculer le prix du transport, on recherche les lignes auxquelles appartiennent 
     * les communes de livraison et la plus lointaine. 
    */

   var liste_commune = [commune_livraison, commune_lointaine],
   sortie_commune = 0,
   liste_ligne_livraison = [],
   liste_erreur_ligne = [];

    //Pour chacune de deux communes dans la liste, on recherche la ligne de chacune d'elle.
    liste_commune.forEach((value_commune, index_commune, tab_commune) => {  
        module.exports.getLineIdFromCommuneId(value_commune, function(is_line, message_line, result_line) {
        
            //On incrémente la valeur de la condition de sortie
            sortie_commune++;

            //On gère le résultat de la recherche
            if(is_line){
                liste_ligne_livraison.push(result_line)
            }else{
                liste_erreur_ligne.push(message_line);
            }

            if(sortie_commune == tab_commune.length){//On vérifie la condition de sortie
                
                if(liste_ligne_livraison.length == 2){//Si nous disposons de deux lignes de livraisons correspondant aux deux communes en paramètres

                    var ligne_1 = liste_ligne_livraison[0], //Ligne commune lieu de livraison
                        ligne_2 = liste_ligne_livraison[1]; //Ligne commune vente

                    var difference_ligne = Math.abs(ligne_1 - ligne_2); //On recupère la différence des deux lignes en valeur absolue

                    //La différence des lignes en valeur absolue permet de trouver la ligne de livraison de la commande
                    var ligne_livraison_commande = null;
                    switch (difference_ligne) {
                        case 0:
                            ligne_livraison_commande = 1
                            break;
                        case 1:
                            ligne_livraison_commande = 2
                        default:
                            ligne_livraison_commande = 3
                            break;
                    }

                    //L'identifiant de la ligne de livraison de la commande étant retrouvée, on la recherche dans le but
                    //de recuperer les couts de livraison suivant le type
                    module.exports.getCoutByIdLineAndType(ligne_livraison_commande, "petits_colis", 
                    function(is_cout, message_cout, result_cout) {
                    
                        if(is_cout){
                            //Sachant que la recherche renvoie une liste de deux couts (en 24h et 4h/8h)
                            //on passe en boucle ces deux couts pour calculer le prix du transport de ces deux durées. 

                            var liste_cout_transport = [];

                            for (let index_cout = 0; index_cout < result_cout.length; index_cout++) {

                                var prix_calcul_course = 0;

                                const prix_enreg_10kg = result_cout[index_cout].cout.prix;
                                const prix_enreg_1g = prix_enreg_10kg / 10000;
                                const prix_reduction_1g = result_cout[index_cout].cout.reduction.prix / 1000;

                                if(poid_total_commande.valeur == 10000 || poid_total_commande.valeur < 10000){
                                    prix_calcul_course = prix_enreg_1g * poid_total_commande.valeur;
                                }else{

                                    var poid_total_over_10kg = poid_total_commande.valeur - 10000;

                                    var modulo_over_10kg = poid_total_over_10kg % 1000;
                                    var top_over_10kg = parseInt(poid_total_over_10kg / 1000);

                                    for (let index_top = 0; index_top < top_over_10kg; index_top++) {

                                        prix_calcul_course += prix_reduction_1g * 1000;
                                    }

                                    if(modulo_over_10kg > 0){
                                        var modulo_over_10kg_to_g = modulo_over_10kg / 1000;
                                        prix_calcul_course += prix_reduction_1g * modulo_over_10kg_to_g;
                                    }

                                    prix_calcul_course += prix_enreg_1g * 10000;

                                }
                                
                                
                                var objet_prix_livraison = {
                                    "poid_total_commande" : poid_total_commande.valeur,
                                    "unite" : poid_total_commande.unite,                                    
                                    "prix" : prix_calcul_course,                                    
                                    "devise" : "USD",
                                    "duree" : result_cout[index_cout].cout.duree,
                                }

                                liste_cout_transport.push(objet_prix_livraison);
                            }

                            //On recupère aussi les détails de la ligne de livraison de la commande
                            var details_ligne_livraison_commande = {
                                "id_ligne" : ligne_livraison_commande,
                                "commune_depart" : null,
                                "commune_arrivee" : null,
                                "cout_livraison" : liste_cout_transport
                            }

                            callback(true, null, details_ligne_livraison_commande)

                        }else{
                            callback(false, message_cout, null)
                        }

                    });

                }else{
                    liste_erreur_ligne.push("La recherche de deux lignes pour les deux communes n'a pas renvoyé deux résultats comme prevu");
                    callback(false, liste_erreur_ligne, null)
                }
            }

        })
    })
}

/**
 * La fonction permettant de calculer le poids total d'une commande
 * @param {Array} list_quantite_produit 
 */
function calculatePoidTotalCommande(list_quantite_produit) {
    
    var poid_retour = 0;

    //On passe en boucle les objets de la liste en paramètre
    for (let index_quantite_prod = 0; index_quantite_prod < list_quantite_produit.length; index_quantite_prod++) {
       
        if(list_quantite_produit[index_quantite_prod].unite == "gramme"){//Si l'unité du produit est en gramme
            
            poid_retour += list_quantite_produit[index_quantite_prod].quantite;

        }else{//Sinon l'unité est le litre

            //On coverti le litre en gramme avant de l'additionner au poind total encours (si existante)
            //1L == 1000g
            var valeur_en_gramme = list_quantite_produit[index_quantite_prod].quantite * 1000 ; 

            poid_retour += valeur_en_gramme;
        }
    }

    var objet_retour = {
        "valeur" : poid_retour,
        "unite" : "gramme"
    }
    return objet_retour;
}

function compareCommune(a, b) {

    if ( a.index < b.index ){
        return -1;
    }
    if ( a.index > b.index ){
    return 1;
    }
    return 0;
}