var express = require("express");
var mongoose = require("mongoose");
var router = express.Router();
var debug = require("debug")("censoApp:server");

//Models

var Ocupacion = require("../models/Aparcamientos.js");

mongoose.set("strictQuery", false);
var db = mongoose.connection;

/* GET datos para el ScatterChart */
  
router.get("/", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit) || 100;
  
      // Obtener datos de la colección
      const ocupacion = await Ocupacion.find().limit(limit);
  
      // Transformar los datos al formato esperado
      const dataset = ocupacion.map((item, index) => {
        const ocupacionPorcentaje = parseFloat(item["Ocupación (%)"].replace("%", ""));
        return {
          version: `data-${index}`,
          x: item["Vehículos día (media)"], // Vehículos promedio por día
          y: ocupacionPorcentaje, // Ocupación en porcentaje
          distrito: item["DISTRITO"], // Distrito del aparcamiento
          nombre: item["NOMBRE DEL APARCAMIENTO"], // Nombre del aparcamiento
        };
      });
  
      res.status(200).json(dataset);
    } catch (error) {
      console.error("Error al obtener datos del ScatterChart:", error);
      res.status(500).json({ error: "Error al obtener datos" });
    }
  });
  
  
  module.exports = router;