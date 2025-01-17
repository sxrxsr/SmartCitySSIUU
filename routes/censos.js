var express = require("express");
var mongoose = require("mongoose");
var router = express.Router();
var debug = require("debug")("censoApp:server");

//Models
var Censo = require("../models/Censo.js");

mongoose.set("strictQuery", false);
var db = mongoose.connection;

/* GET censo listing */
router.get("/", function (req, res) {
  Censo.find().then(function (censos) {
    if (censos) {
      debug("Censo found:", JSON.stringify(censos, null, 2));
    } else {
      debug("No censo found.");
    }
    res.status(200).json(censos);
  }).catch(function (err) {
    res.status(500).send(err);
  });
});



/*Get paginado*/
/* GET censo listing */
router.get("/", function (req, res) {
  // Obtén los parámetros de consulta (query params) para la paginación
  const limit = parseInt(req.query.limit) || 100; // Por defecto, 100 elementos
  const offset = parseInt(req.query.offset) || 0; // Por defecto, empieza desde 0
  const estadisticas = {};

  Censo.find()
    .skip(offset) // Omite los primeros 'offset' documentos
    .limit(limit) // Limita los resultados a 'limit' documentos
    .then(function (censos) {
      if (censos && censos.length > 0) {
        debug("Censo found:", JSON.stringify(censos, null, 2));

        censos.forEach((item) => {
          const distrito = item.DESC_DISTRITO;
          // Inicializar acumuladores si no existen
          if (!estadisticas[distrito]) {
            estadisticas[distrito] = { distrito, EspanolesHombres: 0, EspanolesMujeres: 0 };
          }

          // Acumular valores
          estadisticas[distrito].EspanolesHombres += item.EspanolesHombres || 0;
          estadisticas[distrito].EspanolesMujeres += item.EspanolesMujeres || 0;
        });

        // Enviar los datos actuales
        res.write(JSON.stringify(Object.values(estadisticas)) + "\n");

      } else {
        debug("No censo found.");
        res.status(404).send({ message: "No censo found" });
      }
      res.end();
    })
    .catch(function (err) {
      debug("Error fetching censos:", err);
      res.status(500).send(err);
    });
});

const { Readable } = require("stream");


/* GET single Censo by Id */
router.get("/:id", function (req, res) {
  Censo.findById(req.params.id).then(function (censoinfo) {
    if (censoinfo) {
      debug("censo found:", censoinfo);
      res.status(200).json(censoinfo);
    } else {
      res.status(404).send("Censo not found");
    }
  }).catch(function (err) {
    res.status(500).send(err);
  });
});


module.exports = router;