var express = require("express");
var mongoose = require("mongoose");
var router = express.Router();
var debug = require("debug")("contenedoresApp:server");

// Importar el modelo
var ContenedorUbicacion = require("../models/ContenedoresUbicacion.js");

mongoose.set("strictQuery", false);

/* GET todos los contenedores */
router.get("/", async (req, res) => {
  try {
    const contenedores = await ContenedorUbicacion.find().lean();

    if (!contenedores || contenedores.length === 0) {
      debug("No se encontraron contenedores.");
      return res.status(404).json({ message: "No se encontraron contenedores." });
    }

    debug(`Se encontraron ${contenedores.length} contenedores`);
    res.status(200).json(contenedores);
  } catch (err) {
    debug("Error al buscar contenedores:", err);
    res.status(500).json({
      error: "Error al obtener contenedores",
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

/* GET coordenadas e intensidad */
router.get("/coords", async (req, res) => {
  try {
    debug("Buscando coordenadas de los contenedores...");

    const contenedores = await ContenedorUbicacion.aggregate([
      {
        $match: {
          LATITUD: { $exists: true, $ne: null },
          LONGITUD: { $exists: true, $ne: null },
          Barrio: { $exists: true, $ne: "", $ne: 0 }
        }
      },
      {
        $addFields: {
          Barrio: {
            $cond: {
              if: { $eq: ["$Barrio", 0] },
              then: "Barrio Desconocido",
              else: "$Barrio"
            }
          }
        }
      },
      {
        $group: {
          _id: "$Barrio",
          contenedores: {
            $push: {
              LATITUD: "$LATITUD",
              LONGITUD: "$LONGITUD",
              Distrito: "$Distrito",
              DIRECCION: "$DIRECCION"
            }
          },
          total: { $sum: 1 }
        }
      },
      {
        $project: {
          Barrio: "$_id",
          total: 1,
          muestra: { $slice: ["$contenedores", 10] }
        }
      },
      { $unwind: "$muestra" },
      {
        $project: {
          LATITUD: "$muestra.LATITUD",
          LONGITUD: "$muestra.LONGITUD",
          Distrito: "$muestra.Distrito",
          DIRECCION: "$muestra.DIRECCION",
          Barrio: "$Barrio",
          total: 1
        }
      }
    ]);
    

    if (!contenedores || contenedores.length === 0) {
      debug("No se encontraron coordenadas de contenedores.");
      return res.status(404).json({ message: "No se encontraron coordenadas de contenedores." });
    }

    debug(`Se encontraron ${contenedores.length} coordenadas.`);
    res.status(200).json(contenedores);
  } catch (err) {
    debug("Error al obtener las coordenadas de los contenedores:", err);
    res.status(500).json({
      error: "Error interno al obtener las coordenadas",
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
});


/* GET contenedor por ID */
router.get("/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "ID de contenedor inválido" });
    }

    const contenedor = await ContenedorUbicacion.findById(req.params.id).lean();

    if (!contenedor) {
      debug(`Contenedor no encontrado con ID: ${req.params.id}`);
      return res.status(404).json({ message: "Contenedor no encontrado." });
    }

    debug(`Contenedor encontrado con ID: ${req.params.id}`);
    res.status(200).json(contenedor);
  } catch (err) {
    debug("Error al buscar contenedor por ID:", err);
    res.status(500).json({
      error: "Error al obtener el contenedor",
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

module.exports = router;
