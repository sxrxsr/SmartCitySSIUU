var express = require("express");
var mongoose = require("mongoose");
var router = express.Router();
var debug = require("debug")("multasAccidentesApp:server");

// Importar los modelos
var Multas = require("../models/Multas.js");
var Accidentalidad = require("../models/Accidentalidad.js");
var ContaminacionAcustica = require("../models/ContaminacionAcustica.js");

mongoose.set("strictQuery", false);

/* GET multas agregadas por mes */
router.get("/multas", async (req, res) => {
  try {
    debug("Obteniendo datos de multas...");

    const multas = await Multas.aggregate([
      {
        $group: {
          _id: { month: { $month: "$Fdenun" }, year: { $year: "$Fdenun" } },
          avgPoints: { $avg: "$PUNTOS" },
        },
      },
      {
        $project: {
          month: "$_id.month",
          year: "$_id.year",
          avgPoints: 1,
          _id: 0,
        },
      },
      { $sort: { year: 1, month: 1 } },
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

/* GET accidentalidad agregada por mes */
router.get("/accidentalidad", async (req, res) => {
  try {
    debug("Obteniendo datos de accidentalidad...");

    const accidentes = await Accidentalidad.aggregate([
      {
        $group: {
          _id: { month: { $month: "$fecha" }, year: { $year: "$fecha" } },
          positiveAlcohol: { $sum: { $cond: [{ $eq: ["$positiva_alcohol", "S"] }, 1, 0] } },
          positiveDrugs: { $sum: { $cond: [{ $eq: ["$positiva_droga", "S"] }, 1, 0] } },
        },
      },
      {
        $project: {
          month: "$_id.month",
          year: "$_id.year",
          positiveAlcohol: 1,
          positiveDrugs: 1,
          _id: 0,
        },
      },
      { $sort: { year: 1, month: 1 } },
    ]);

    if (!accidentes || accidentes.length === 0) {
      debug("No se encontraron datos de accidentalidad.");
      return res.status(404).json({ message: "No se encontraron datos de accidentalidad." });
    }

    debug(`Se encontraron ${accidentes.length} registros de accidentalidad.`);
    res.status(200).json(accidentes);
  } catch (err) {
    debug("Error al obtener datos de accidentalidad:", err);
    res.status(500).json({
      error: "Error al obtener datos de accidentalidad",
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
});

/* GET contaminación acústica agregada por mes */
router.get("/contaminacion-acustica", async (req, res) => {
  try {
    debug("Obteniendo datos de contaminación acústica...");

    const contaminacion = await ContaminacionAcustica.aggregate([
      {
        $group: {
          _id: { month: { $month: "$Fecha" }, year: { $year: "$Fecha" } },
          avgLAeq24: { $avg: "$LAeq24" },
        },
      },
      {
        $project: {
          month: "$_id.month",
          year: "$_id.year",
          avgLAeq24: 1,
          _id: 0,
        },
      },
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
    res.status(500).json({
      error: "Error al obtener datos de contaminación acústica",
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
});

module.exports = router;
