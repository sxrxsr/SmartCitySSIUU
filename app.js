var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var debug = require('debug')('moviesAppAuth:server');

const dotenv = require('dotenv');
// get config vars
dotenv.config();

var mongoose = require("mongoose");

var indexRouter = require("./routes/index");
var moviesRouter = require("./routes/movies");
var bookmarksRouter = require("./routes/bookmarks");

var usersRouter = require("./routes/users");

var app = express();

var bodyParser = require("body-parser");
var cors = require("cors");

app.use(cors());
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

const MONGODB_CLUSTER_URI = process.env.MONGODB_CLUSTER_URI;
// Añade el nombre de tu base de datos al final de la URI
const MONGODB_DATABASE_NAME = process.env.MONGODB_DATABASE_NAME;
const fullURI = `${MONGODB_CLUSTER_URI}/${MONGODB_DATABASE_NAME}?retryWrites=true&w=majority&appName=ClusterSSIIUU`;

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
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/movies", moviesRouter);
app.use("/bookmarks", bookmarksRouter); 
app.use("/users", usersRouter); 

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
