var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var debug = require('debug')('moviesAppAuth:server');
var cors = require("cors");

const dotenv = require('dotenv');
// get config vars
dotenv.config();

var mongoose = require("mongoose");

var indexRouter = require("./routes/index");
var censoRouter = require("./routes/censos");
var felicidad_tristeza = require("./routes/felicidad_tristeza");
var asco = require("./routes/asco");
var estres = require("./routes/estres");
var tranquilidad = require("./routes/tranquilidad");

var usersRouter = require("./routes/users");

var app = express();

var bodyParser = require("body-parser");
var cors = require("cors");

app.use(cors());
app.use(bodyParser.json({limit: '600mb'}));
app.use(bodyParser.urlencoded({limit: '600mb', extended: true}));

const MONGODB_CLUSTER_URI = process.env.MONGODB_CLUSTER_URI;
// Añade el nombre de tu base de datos al final de la URI
const MONGODB_DATABASE_NAME = process.env.MONGODB_DATABASE_NAME;
const fullURI = `${MONGODB_CLUSTER_URI}/${MONGODB_DATABASE_NAME}?retryWrites=true&w=majority&appName=Cluster0`;

// MongoDB Atlas DB cluster connection
mongoose
  .connect(fullURI,
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => debug("MongoDB Atlas DataBase connection successful"));

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(logger("dev"));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/censos", censoRouter);
app.use("/felicidad_tristeza", felicidad_tristeza); 
app.use("/users", usersRouter); 
app.use("/asco", asco); 
app.use("/estres", estres); 
app.use("/tranquilidad", tranquilidad); 

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
