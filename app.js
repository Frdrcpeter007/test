var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var db_js = require("./Models/db");
var string_con = 'mongodb://bantuAdmin:bantu#Admin2020@ds353338.mlab.com:53338/bantustoredb';

db_js.connect(string_con, function (isConnected, resultConnect) {

    if (isConnected) {
        console.log(resultConnect)
    } else {
        console.log(resultConnect);
    }

})

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var categoryRouter = require('./routes/categorie_router');
var agent = require("./routes/agent_router");
var client = require("./routes/client_router");
var favorite = require("./routes/favoris_router");
var product = require("./routes/produit_router");
var commande = require("./routes/commande_router");
var ads = require("./routes/ads_router");
var extra = require("./routes/extra_router");
var media = require('./routes/media_router');
var recuperation = require('./routes/recuperation_router');
var operation = require("./routes/operation_produit_router");
var annonce = require("./routes/annonce_router");
var partenaire = require("./routes/partenaire_router");
var notification = require("./routes/notification_router");
var ville = require("./routes/ville_router");
var adresse = require("./routes/adresse_router");
var log = require("./routes/log_router");
var taux = require("./routes/taux_router");
var contact = require("./routes/contact_router");
var message = require("./routes/message_router");
var ligne_livraison = require("./routes/ligne_livraison_router");
var commune = require("./routes/commune_router");
var beneficiaire_commande = require("./routes/beneficiaire_commande_router");
var produit_dealer_prix = require("./routes/produit_dealer_prix_router");
var produit_dealer = require("./routes/produit_dealer_router");
var unite = require("./routes/unite_mesure_router");
var mediaProductRouter = require("./routes/media_produit_router");

/* Pour l'administration */
var notification_admin = require("./routes/admin/notification_admin_router");
var client_admin = require("./routes/admin/client_admin_router");
var dealer_admin = require("./routes/admin/dealer_admin_router");
var categorie_admin = require("./routes/admin/categorie_admin_router");
var product_admin = require("./routes/admin/produit_admin_router");
var commande_admin = require("./routes/admin/commande_admin_router");
var media_admin = require("./routes/admin/media_admin_router");
var ads_admin = require("./routes/admin/ads_admin_router");
var agent_admin = require("./routes/admin/agent_admin_router");
var favoris_admin = require("./routes/admin/favoris_admin_router");
var operation_produit_admin = require("./routes/admin/operation_produit_admin_router");
var role_admin = require("./routes/admin/role_admin_router");
var message_admin = require("./routes/admin/message_admin_router");
var alerte_admin = require("./routes/admin/alerte_admin_router");
var ligne_livraison_admin = require("./routes/admin/ligne_livraison_admin_router");
var taux_admin_router = require("./routes/admin/taux_admin_router");

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/category', categoryRouter);
/*app.use("/agent", agent);
app.use("/client", client);
app.use("/favoris", favorite);
app.use("/product", product);
app.use("/commande", commande);
app.use("/ads", ads);
app.use("/extra", extra);
app.use("/media", media);
app.use("/recuperation", recuperation);
app.use("/operation", operation);
app.use("/annonce", annonce);
app.use("/partners", partenaire);
app.use("/notification", notification);
app.use("/ville", ville);
app.use("/adresse", adresse);
app.use("/log", log);
app.use("/taux", taux);
app.use("/contact", contact);
app.use("/message", message);
app.use("/ligne_livraison", ligne_livraison);
app.use("/commune", commune);
app.use("/beneficiaire_commande", beneficiaire_commande);
app.use("/produit_dealer_prix", produit_dealer_prix);
app.use("/produit_dealer", produit_dealer);
app.use("/unite", unite);
app.use("/media_product", mediaProductRouter);

//Pour l'admin
app.use("/admin/notification", notification_admin);
app.use("/admin/client", client_admin);
app.use("/admin/dealer", dealer_admin);
app.use("/admin/category", categorie_admin);
app.use("/admin/product", product_admin);
app.use("/admin/commande", commande_admin);
app.use("/admin/media", media_admin);
app.use("/admin/ads", ads_admin);
app.use("/admin/agent", agent_admin);
app.use("/admin/favoris", favoris_admin);
app.use("/admin/operation_produit", operation_produit_admin);
app.use("/admin/role", role_admin);
app.use("/admin/message", message_admin);
app.use("/admin/alerte", alerte_admin);
app.use("/admin/ligne_livraison", ligne_livraison_admin);
app.use("/admin/taux", taux_admin_router);*/

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
