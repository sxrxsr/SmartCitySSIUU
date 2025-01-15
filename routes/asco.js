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
          LATITUD: { $exists: true, $ne: null }, // Asegurarse de que LATITUD exista
          LONGITUD: { $exists: true, $ne: null } // Asegurarse de que LONGITUD exista
        }
      },
      {
        $sort: { Barrio: 1 } // Opcional: Ordena por barrio
      },
      {
        $group: {
          _id: "$Barrio", // Agrupa por barrio
          contenedores: {
            $push: {
              LATITUD: "$LATITUD",
              LONGITUD: "$LONGITUD",
              Distrito: "$Distrito", // Incluye Distrito
              DIRECCION: "$DIRECCION" // Incluye Dirección
            }
          },
          total: { $sum: 1 } // Cuenta el total de contenedores por barrio
        }
      },
      {
        $project: {
          _id: 1,
          muestra: { $slice: ["$contenedores", 10] } // Toma una muestra de 10 contenedores por barrio
        }
      },
      { $unwind: "$muestra" }, // Convierte la muestra en documentos individuales
      {
        $project: {
          LATITUD: "$muestra.LATITUD",
          LONGITUD: "$muestra.LONGITUD",
          Distrito: "$muestra.Distrito", // Proyecto de Distrito
          DIRECCION: "$muestra.DIRECCION", // Proyecto de Dirección
          Barrio: "$_id",
          total: 1 // Campo adicional
          
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
