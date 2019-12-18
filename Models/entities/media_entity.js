/**
 * Ceci est le modèle de l'entité media, et là on la répresente en object 
 */
module.exports.Media = function Media() {
    return {
        "name" : null,
        "web_size" : null,
        "mobile_size" : null,
        "type" : null,
        "path" : null,
        "date" : new Date()
    }
}

//Les différents types médias: profilProduit, ads, profilPartenaire, profilClient, profilAgent