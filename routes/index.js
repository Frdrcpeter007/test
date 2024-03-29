var express = require('express');
var router = express.Router();
var multer = require("multer");
var fs = require("fs");
var Jimp = require("jimp");
var TestyFile = require("testyfile");

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Bantu-Store API' });
});


router.post("/googlemaps", function (req, res) {

    var googlemaps = require("../Models/includes/google_maps"),
        objetRetour = require("./objet_retour").ObjetRetour(),
        adresse = req.body.adresse;
    googlemaps.test(adresse, function (isGeocode, resultGeocode) {

        objetRetour.getEtat = isGeocode;
        objetRetour.getObjet = resultGeocode;

        res.send(objetRetour);
    });

})

//La router permettant de téléverser les images
router.post("/upload_image/:type_media/:folder", function (req, res) {

    //On déclare et assigne les variables globales
    var folder = req.params.folder,
        type_media = req.params.type_media,
        destination_value_temp = null,
        destination_value = null,
        objetRetour = require("./objet_retour").ObjetRetour();

    switch (type_media) {
        case "profilClient":
            destination_value_temp = 'public/images/utilisateurs/' + folder + '/temp';
            destination_value = 'public/images/utilisateurs/' + folder;
            break;
        case "profilAgent":
            destination_value_temp = 'public/images/utilisateurs/' + folder + '/temp';
            destination_value = 'public/images/utilisateurs/' + folder;
            break;
        case "profilPartenaire":
            destination_value_temp = 'public/images/utilisateurs/' + folder + '/temp';
            destination_value = 'public/images/utilisateurs/' + folder;
            break;
        case "profilProduit":
            destination_value_temp = 'public/images/produits/' + folder + '/temp';
            destination_value = 'public/images/produits/' + folder;
            break;
        case "ads":
            destination_value_temp = 'public/images/ads/' + folder + '/temp';
            destination_value = 'public/images/ads/' + folder;
            break;
        case "annonce":
            destination_value_temp = 'public/images/annonces/' + folder + '/temp';
            destination_value = 'public/images/annonces/' + folder;
            break;
        case "profilCategorie":
            destination_value_temp = 'public/images/categories/temp';
            destination_value = 'public/images/categories';
            break;
        default:

            break;
    }

    if (destination_value != null && destination_value_temp != null) {
        handleMedia(type_media, destination_value_temp, destination_value, objetRetour, req, res);
    } else {
        objetRetour.getEtat = false;
        objetRetour.getMessage = "La valeur du type média est incorrecte";
        res.send(objetRetour);
    }


})

/**
 * La fonction permettant de traiter le média
 */
function handleMedia(type_media, destination_value_temp, destination_value, objetRetour, req, res) {

    //On déclare le paramètre de stockage
    var storage = multer.diskStorage({
        destination: destination_value_temp, //dossier temporaire
        filename: function (req, file, cb) { //personnalisation du nom du fichier
            var file_name = Date.now() + "_" + file.originalname;
            cb(null, file_name);
        }
    });

    //On déclare la variable "upload" ayant comme valeur une instance du module "muler"
    var upload = multer({ storage: storage }).any();

    //On procède au téléversement du fichier
    upload(req, res, function (err) {
        if (err) {//Si une erreur survient lors du téléversement

            objetRetour.getEtat = false;
            objetRetour.getMessage = "Une erreur est survenue lors du  téléversement du fichier : " + err;
            res.send(objetRetour)

        } else {//Si non aucune erreur n'est survenue lors du téléversement

            if (req.files) {//On vérifie s'il y a bien au moins un fichier dans la rêquetes

                var listeMedia = [],
                    sortieMedia = 0;

                req.files.forEach(function (file, index, tabFile) { //On passe en boucle les fichiers soumis dans la requête

                    //On incrémente la variable de sortie
                    sortieMedia++;

                    //On crée une instance de l'entité "Media"
                    var fichier = require("../Models/entities/media_entity").Media();

                    //instance à laquelle on attribue le nom du fichier comme valeur de la propriété "name"
                    fichier.name = file.filename;
                    fichier.web_size = file.size;

                    //on insère cette instance dans la liste de média à traiter
                    listeMedia.push(fichier);

                    if (tabFile.length == sortieMedia) {//On vérifie la condition de sortie de la boucle

                        var sortie_tab_file = 0,
                            list_retour = [],
                            list_retour_erreur = [];

                        listeMedia.forEach(function (file, index_file, tab_file) {//Pour chaque item dans la liste de média à traiter

                            //On procède au traitement
                            compressImage(destination_value_temp, destination_value, file, type_media, function (isCompressed, resultCompressing) {

                                sortie_tab_file++;

                                if (isCompressed) {
                                    list_retour.push(resultCompressing)
                                } else {
                                    list_retour_erreur.push(resultCompressing)
                                }

                                if (sortie_tab_file == tab_file.length) {

                                    if (list_retour.length > 0) {
                                        objetRetour.getEtat = true;
                                        objetRetour.getObjet = list_retour;

                                        res.send(objetRetour)
                                    } else {
                                        objetRetour.getEtat = false;
                                        objetRetour.getMessage = list_retour_erreur;

                                        res.send(objetRetour)
                                    }
                                }

                            })

                        })

                    }

                })

            } else { //Sinon la requête ne possède aucun fichier

                objetRetour.getMessage = "Le fichier n'a pas été téléversé";
                objetRetour.getEtat = false;
                res.send(objetRetour);
            }
        }
    })

}

/**
 * La fonction permettant de rédimensionner une image
 * @param {*} image_path_inner 
 * @param {*} image_path_outter 
 * @param {*} image_file 
 * @param {*} callback 
 */
function resizeImage(image_path_inner, image_path_outter, image_file, type_media, callback) {

    //On lis le fichier
    Jimp.read(image_path_inner + "/" + image_file.name, function (err, image_mobile) {
        if (err) {//Si une erreur survenait lors de la lecture du fichier
            console.log(err);
        } else {//Sinon la lecture s'est effectuée avec succès

            //Sachant qu'ici l'opération consiste à rédimensionner le fichier, on commence par
            //appeler le module nous permettant de recupérer les dimensions du fichier
            var sizeOf = require("image-size");

            sizeOf(image_path_inner + "/" + image_file.name, function (err, dimensions) {

                var width_resize = (dimensions.width * 95) / 100, //la nouvelle largeur
                    height_resize = (dimensions.height * 95) / 100; //la nouvelle hauteur

                image_mobile.resize((dimensions.width - width_resize), (dimensions.height - height_resize)) //on redimensionne le fichier
                    .quality(60) //on spécifie la teneur de la nouvelle qualité
                    .write(image_path_outter + "/mobile/" + image_file.name, //finalement on enregistre le nouveau fichié redimensionné pour la version mobile
                        function () {
                            fs.stat(image_path_outter + "/mobile/" + image_file.name, function (errStatMobile, statsMobile) {

                                if (!errStatMobile) {
                                    image_file.mobile_size = statsMobile.size;
                                }

                                //On recommence toute l'opération précedente
                                Jimp.read(image_path_inner + "/" + image_file.name, function (err, image_mobile) {
                                    if (err) {
                                        console.log(err);
                                        callback(false, "Une erreur est survenue lors de la suppression du fichier :" + err)
                                    } else {

                                        var sizeOf = require("image-size");

                                        sizeOf(image_path_inner + "/" + image_file.name, function (err, dimensions_large) {

                                            var width_resize = (dimensions_large.width * 75) / 100,
                                                height_resize = (dimensions_large.height * 75) / 100;

                                            image_mobile.resize((dimensions_large.width - width_resize), (dimensions_large.height - height_resize))
                                                .quality(60)
                                                .write(image_path_outter + "/" + image_file.name, function () { //Jusqu'à enregistrer la version web du fichier, puis gérer la fin des opérations en callback

                                                    //On procède à la recupérations des nouvelles valeurs du fichier
                                                    fs.stat(image_path_outter + "/" + image_file.name, function (errStat, stats) {

                                                        image_file.web_size = stats.size;
                                                        image_file.path = image_path_outter;
                                                        image_file.type = type_media;

                                                        fs.unlink(image_path_inner + "/" + image_file.name, function (err) {
                                                            if (err) {
                                                                callback(false, "Une erreur est survenue lors de la suppression du fichier :" + err)
                                                            } else {
                                                                console.log(image_file.name + " deleted...");
                                                                callback(true, image_file)
                                                            }
                                                        })

                                                    })

                                                });
                                        })
                                    }

                                });
                            })
                        });
            })
        }

    });
}

/**
 * La fonction permettant de compresser une image
 * @param {*} image_path_inner 
 * @param {*} image_path_outter 
 * @param {*} image_file 
 * @param {*} callback 
 */
function compressImage(image_path_inner, image_path_outter, image_file, type_media, callback) {

    //On test la taille du fichier afin de savoir s'il faut compresser ou pas

    if (image_file.web_size > 51200) { //Si la taille est supérieure à 50 Ko

        //#region PENDING
        //On exécute le module de compression
        /*compress_images(image_path_inner+"/"+image_file.name, image_path_inner,
        {compress_force: true, statistic: true, autoupdate: true}, 
        false,
        {jpg: {engine: 'mozjpeg', command: ['-quality', '40']}},
        {png: {engine: 'pngquant', command: ['--quality=20-50']}},
        {svg: {engine: 'svgo', command: '--multipass'}},
        {gif: {engine: 'gifsicle', command: ['--colors', '64', '--use-col=web']}}, function(){
    
          //dans la callback on se doit de rédimensionner le fichier      
          resizeImage(image_path_inner, image_path_outter, image_file, function (isResized, resultResizing) {
            
            if(isResized){
              callback(true, resultResizing)
            }else{
              callback(false, resultResizing)
            }
          });
          
        });*/
        //#endregion

        resizeImage(image_path_inner, image_path_outter, image_file, type_media, function (isResized, resultResizing) {

            if (isResized) {
                callback(true, resultResizing)
            } else {
                callback(false, resultResizing)
            }
        });

    } else {//Sinon la taille du fichier est inférieure à 50 ko

        Jimp.read(image_path_inner + "/" + image_file.name, function (err, image) {

            //On se content de juste placer le fichier dans le dossier mobile
            image.write(image_path_outter + "/mobile/" + image_file.name, function () {

                image.write(image_path_outter + "/" + image_file.name, function () {

                    fs.stat(image_path_outter + "/" + image_file.name, function (errStat, stats) {
                        image_file.mobile_size = stats.size;
                        image_file.web_size = stats.size;

                        //On supprimer la copie du fichier restée dans le dossier temporaire
                        fs.unlink(image_path_inner + "/" + image_file.name, function (err) {
                            if (err) {

                                callback(false, "Une erreur est survenue lors de la suppression du fichier :" + err)

                            } else {

                                //On recupère le bon emplacement du fichier
                                image_file.path = image_path_outter;

                                //et le type du média
                                image_file.type = type_media;

                                callback(true, image_file)
                            }
                        })

                    })

                })

            });
        })
    }
}

router.post("/verify", (req, res) => {
    TestyFile.verify(req.body.source, (isSet, message, details) => {
        let objetRetour = require("./objet_retour").ObjetRetour();

        objetRetour.getEtat = isSet;
        objetRetour.getMessage = message;
        objetRetour.getObjet = details;

        res.send(objetRetour);
    })
})

module.exports = router;
