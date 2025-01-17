var express = require("express");
var mongoose = require("mongoose");
var router = express.Router();
var debug = require("debug")("multasAccidentesApp:server");

// Importar el modelo
var Accidentalidad = require("../models/Accidentalidad.js");

mongoose.set("strictQuery", false);

/* GET accidentalidad agregada por mes */
router.get("/", async (req, res) => {
  try {
    debug("Obteniendo datos de accidentalidad...");

    const accidentes = await Accidentalidad.aggregate([
      // Normalizar el campo fecha para convertir cadenas a Date
      {
        $addFields: {
          fecha: {
            $cond: {
              if: { $ne: ["$fecha", null] }, // Si fecha no es null
              then: {
                $convert: { input: "$fecha", to: "date", onError: null, onNull: null }
              },
              else: null, 
            },
          },
        },
      },
      // Filtrar documentos con fecha válida
      {
        $match: {
          fecha: { $exists: true, $ne: null }, // Solo documentos con fecha válida
        },
      },
      // Normalizar los valores de positiva_alcohol y positiva_droga
      {
        $addFields: {
          positiva_alcohol: { $ifNull: ["$positiva_alcohol", "N"] }, // Si es null, convertir a "N"
          positiva_droga: { $ifNull: ["$positiva_droga", "N"] },     // Si es null, convertir a "N"
        },
      },
      // Agrupar por mes
      {
        $group: {
          _id: { month: { $month: "$fecha" } }, // Agrupar solo por mes
          positiveAlcohol: {
            $sum: {
              $cond: [
                { $eq: ["$positiva_alcohol", "S"] }, // Contar "S" como positivo
                1,
                0,
              ],
            },
          },
          positiveDrugs: {
            $sum: {
              $cond: [
                { $eq: ["$positiva_droga", "S"] }, // Contar "S" como positivo
                1,
                0,
              ],
            },
          },
          totalAccidents: { $sum: 1 }, // Número total de accidentes por mes
        },
      },
      // Proyección del resultado
      {
        $project: {
          month: "$_id.month",
          positiveAlcohol: 1,
          positiveDrugs: 1,
          totalAccidents: 1,
          _id: 0,
        },
      },
      // Ordenar por mes
      { $sort: { month: 1 } },
    ]);

    if (!accidentes || accidentes.length === 0) {
      debug("No se encontraron datos de accidentalidad.");
      return res.status(404).json({ message: "No se encontraron datos de accidentalidad." });
    }

    debug(`Se encontraron ${accidentes.length} registros de accidentalidad.`);
    res.status(200).json(accidentes);
  } catch (err) {
    debug("Error al obtener datos de accidentalidad:", err);
    console.error("Detalles del error:", err);
    res.status(500).json({
      error: "Error al obtener datos de accidentalidad",
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
});

module.exports = router;
