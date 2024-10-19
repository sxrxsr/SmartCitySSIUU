var express = require("express");
var mongoose = require("mongoose");
var router = express.Router();
var debug = require("debug")("moviesApp:server");

//Models
var Movie = require("../models/Movie.js");

mongoose.set("strictQuery", false);
var db = mongoose.connection;

/* GET movies listing */
router.get("/", function (req, res) {
  Movie.find().then(function (movies) {
    if (movies) {
      debug("Movies found:", movies);
    } else {
      debug("No movies found.");
    }
    res.status(200).json(movies)
  }).catch(function (err) {
    res.status(500).send(err)
  });
});

/* GET single movie by Id */
router.get("/:id", function (req, res) {
  Movie.findById(req.params.id).then(function (movieinfo) {
    if (movieinfo) {
      debug("Movie found:", movieinfo);
      res.status(200).json(movieinfo);
    } else {
      res.status(404).send("Movie not found");
    }
  }).catch(function (err) {
    res.status(500).send(err);
  });
});

  // /* POST a new movie*/
  // router.post("/", function (req, res) {
  //   Movie.create(req.body, function (err, movieinfo) {
  //     if (err) res.status(500).send(err);
  //     else res.sendStatus(200);
  //   });
  // });

    /* POST a new movie (ahora conviene hacerlo todo con promesas) */
    router.post("/", function (req, res) {
      Movie.create(req.body).then(function (movie) {
        res.status(201).json(movie);
      }).catch(function (err) {
        res.status(500).send(err);
      });
    });
  
  module.exports = router;