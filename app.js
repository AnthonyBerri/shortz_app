var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const session = require('express-session');
const flash = require('connect-flash');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var userRoutes = require("./modules/user/userRoutes");
var videoRoutes = require("./modules/video/videoRoutes"); // Importa as rotas de videos
var express = require("express");
var path = require("path");

var app = express();
var expressLayouts = require("express-ejs-layouts"); 

// view engine setup
app.set('views', path.join(__dirname, 'views/pages'));
app.set('layout', path.join(__dirname, 'views/layouts/main'));
app.use(expressLayouts);
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(session({
  secret: process.env.SESSION_SECRET || 'chave_super_secreta_nao_mostre_pra_ninguem',
  resave: false,
  saveUninitialized: false,
  cookie: {maxAge: 1000 * 60 * 60 * 24} // 1 dia
}));
app.use(flash());
app.use((req, res, next) => {
  res.locals.messages = req.flash();
  res.locals.user = req.session.user || null;
  next();
});
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use('/', indexRouter);
app.use("/", userRoutes);
app.use("/", videoRoutes); // Usa as rotas de vídeo
//app.use('/users', usersRouter);

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


//
//Tenta conectar com o banco de dados
//

require("./config/associations");

const sequelize = require('./config/database');
const User = require('./modules/user/userModel');
const Video = require("./modules/video/videoModel"); // Imporat o modelo Vídeo
sequelize.sync({alter:true});

sequelize.authenticate()
  .then( () => console.log("Conexão ok") )
  .catch( erro => console.log("Erro na conexão: ", erro) );

module.exports = app;
