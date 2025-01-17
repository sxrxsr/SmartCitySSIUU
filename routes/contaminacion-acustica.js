var express = require("express");
var mongoose = require("mongoose");
var router = express.Router();
var debug = require("debug")("acusticaApp:server");

// Importar el modelo
var ContaminacionAcustica = require("../models/ContaminacionAcustica.js");

mongoose.set("strictQuery", false);

/* GET contaminación acústica agregada por mes */
router.get("/", async (req, res) => {
  try {
    debug("Obteniendo datos de contaminación acústica...");

    const contaminacion = await ContaminacionAcustica.aggregate([
      // Normalizar el campo Fecha para convertir cadenas a Date
      {
        $addFields: {
          Fecha: {
            $cond: {
              if: { $ne: ["$Fecha", null] }, // Si Fecha no es null
              then: {
                $convert: { input: "$Fecha", to: "date", onError: null, onNull: null }
              },
              else: null, // Mantener null si no es convertible
            },
          },
        },
      },
      // Filtrar documentos con Fecha válida
      {
        $match: {
          Fecha: { $exists: true, $ne: null }, // Solo documentos con Fecha válida
        },
      },
      // Agrupar por mes (extraer el mes y año de la Fecha)
      {
        $group: {
          _id: {
            month: { $month: "$Fecha" }, // Mes del campo Fecha
          },
          avgLAeq24: { $avg: "$LAeq24" }, // Calcular el promedio de LAeq24 por mes
        },
      },
      // Proyección del resultado (formato más claro)
      {
        $project: {
          month: "$_id.month",
          avgLAeq24: 1,
          _id: 0,
        },
      },
      // Ordenar por año y mes
      { $sort: { year: 1, month: 1 } },
    ]);

    if (!contaminacion || contaminacion.length === 0) {
      debug("No se encontraron datos de contaminación acústica.");
      return res.status(404).json({ message: "No se encontraron datos de contaminación acústica." });
    }

    debug(`Se encontraron ${contaminacion.length} registros de contaminación acústica.`);
    res.status(200).json(contaminacion);
  } catch (err) {
    debug("Error al obtener datos de contaminación acústica:", err);
    console.error("Detalles del error:", err);
    res.status(500).json({
      error: "Error al obtener datos de contaminación acústica",
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
});

module.exports = router;
