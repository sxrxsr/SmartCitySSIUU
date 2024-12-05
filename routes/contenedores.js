var express = require("express");
var mongoose = require("mongoose");
var router = express.Router();
var debug = require("debug")("contenedoresApp:server");

// Importar el modelo
var Contenedor = require("../models/Contenedores.js");

mongoose.set("strictQuery", false);
var db = mongoose.connection;

/* GET todos los contenedores */
router.get("/", function (req, res) {
  Contenedor.find()
    .then(function (contenedores) {
      if (contenedores) {
        debug("Contenedores encontrados:", contenedores);
        res.status(200).json(contenedores);
      } else {
        debug("No se encontraron contenedores.");
        res.status(404).send("No se encontraron contenedores.");
      }
    })
    .catch(function (err) {
      debug("Error:", err);
      res.status(500).send(err);
    });
});

/* GET un contenedor por ID */
router.get("/:id", function (req, res) {
  Contenedor.findById(req.params.id)
    .then(function (contenedor) {
      if (contenedor) {
        debug("Contenedor encontrado:", contenedor);
        res.status(200).json(contenedor);
      } else {
        res.status(404).send("Contenedor no encontrado.");
      }
    })
    .catch(function (err) {
      debug("Error:", err);
      res.status(500).send(err);
    });
});

/* GET latitud y longitud de todos los contenedores */
router.get("/coords", function (req, res) {
    Contenedor.find()
      .select("-_id LATITUD LONGITUD") // Incluye solo los campos LATITUD y LONGITUD
      .then(function (contenedores) {
        if (contenedores) {
          debug("Coordenadas encontradas:", contenedores);
          res.status(200).json(contenedores);
        } else {
          debug("No se encontraron coordenadas.");
          res.status(404).send("No se encontraron coordenadas.");
        }
      })
      .catch(function (err) {
        debug("Error:", err);
        res.status(500).send(err);
      });
  });
  

module.exports = router;
