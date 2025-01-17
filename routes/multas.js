var express = require("express");
var mongoose = require("mongoose");
var router = express.Router();
var debug = require("debug")("multasAccidentesApp:server");

// Importar el modelo
var Multas = require("../models/Multas.js");

mongoose.set("strictQuery", false);

/* GET multas agregadas por mes */
router.get("/", async (req, res) => {
  try {
    debug("Obteniendo datos de multas...");

    // Mapeo de nombres de meses a números
    const monthMap = {
      Enero: 1,
      Febrero: 2,
      Marzo: 3,
      Abril: 4,
      Mayo: 5,
      Junio: 6,
      Julio: 7,
      Agosto: 8,
      Septiembre: 9,
      Octubre: 10,
      Noviembre: 11,
      Diciembre: 12,
    };

    // Agregación en MongoDB
    const multas = await Multas.aggregate([
      {
        $addFields: {
          normalizedPoints: { $ifNull: ["$PUNTOS", 0] }, 
          numericMonth: {
            $switch: {
              branches: Object.entries(monthMap).map(([month, num]) => ({
                case: { $eq: ["$MES", month] },
                then: num,
              })),
              default: "$MES",
            },
          },
        },
      },

      {
        $group: {
          _id: { month: "$numericMonth" },
          avgPoints: { $avg: "$normalizedPoints" }, // Promedio de puntos
          totalFines: { $sum: 1 }, // Número total de multas
        },
      },
      // Proyección del resultado
      {
        $project: {
          month: "$_id.month",
          avgPoints: 1,
          totalFines: 1,
          _id: 0,
        },
      },
      
      { $sort: { month: 1 } },
    ]);

    if (!multas || multas.length === 0) {
      debug("No se encontraron datos de multas.");
      return res.status(404).json({ message: "No se encontraron datos de multas." });
    }

    debug(`Se encontraron ${multas.length} registros de multas.`);
    res.status(200).json(multas);
  } catch (err) {
    debug("Error al obtener datos de multas:", err);
    res.status(500).json({
      error: "Error al obtener datos de multas",
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
});

module.exports = router;
