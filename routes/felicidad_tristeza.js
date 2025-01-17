var express = require("express");
var mongoose = require("mongoose");
var router = express.Router();
var debug = require("debug")("censoApp:server");

//Models
var ContaminacionAcustica = require("../models/ContaminacionAcustica.js");
var Accidentalidad = require("../models/Accidentalidad.js");
var Censo = require("../models/Censo.js");
var Multas = require("../models/Multas.js");

mongoose.set("strictQuery", false);
var db = mongoose.connection;

async function calcularFelicidad() {
  return await Censo.aggregate([
    {
      $group: {
        _id: "$DESC_BARRIO",
        documentos: { $push: "$$ROOT" }, // Agrupa documentos por barrio
      },
    },
    {
      $project: {
        _id: 1,
        muestra: { $slice: ["$documentos", 10] }, // Toma una muestra de 10 documentos por barrio
      },
    },
    { $unwind: "$muestra" }, // Desagrupa la muestra
    {
      $lookup: {
        from: "contaminacion_acustica",
        localField: "muestra.DESC_BARRIO",
        foreignField: "Nombre",
        as: "contaminacion",
      },
    },
    {
      $lookup: {
        from: "accidentalidad",
        localField: "muestra.DESC_BARRIO",
        foreignField: "distrito",
        as: "accidentes",
      },
    },
    {
      $lookup: {
        from: "multas",
        localField: "muestra.DESC_BARRIO",
        foreignField: "LUGAR",
        as: "multas",
      },
    },
    {
      $addFields: {
        nivelRuido: {
          $avg: [
            { $ifNull: [{ $arrayElemAt: ["$contaminacion.Ld", 0] }, 0] },
            { $ifNull: [{ $arrayElemAt: ["$contaminacion.Le", 0] }, 0] },
            { $ifNull: [{ $arrayElemAt: ["$contaminacion.Ln", 0] }, 0] },
            { $ifNull: [{ $arrayElemAt: ["$contaminacion.LAeq24", 0] }, 0] },
            { $ifNull: [{ $arrayElemAt: ["$contaminacion.LAS01", 0] }, 0] },
            { $ifNull: [{ $arrayElemAt: ["$contaminacion.LAS10", 0] }, 0] },
            { $ifNull: [{ $arrayElemAt: ["$contaminacion.LAS50", 0] }, 0] },
            { $ifNull: [{ $arrayElemAt: ["$contaminacion.LAS90", 0] }, 0] },
            { $ifNull: [{ $arrayElemAt: ["$contaminacion.LAS99", 0] }, 0] },
          ],
        },
        accidentesBarrio: { $size: "$accidentes" },
        multasBarrio: { $size: "$multas" },
        esJoven: {
          $cond: [
            { $and: [{ $gte: ["$muestra.COD_EDAD_INT", 18] }, { $lte: ["$muestra.COD_EDAD_INT", 30] }] },
            1,
            0,
          ],
        },
      },
    },
    {
      $group: {
        _id: "$_id",
        nivelRuido: { $avg: "$nivelRuido" },
        accidentesBarrio: { $sum: "$accidentesBarrio" },
        multasBarrio: { $sum: "$multasBarrio" },
        promedioJoven: { $avg: "$esJoven" }, // Proporción de jóvenes
      },
    },
    {
      $project: {
        barrio: "$_id",
        felicidad: {
          $multiply: [
            {
              $subtract: [
                100,
                {
                  $add: [
                    { $multiply: ["$nivelRuido", 0.2] },
                    { $multiply: ["$accidentesBarrio", 0.3] },
                    { $multiply: ["$multasBarrio", 0.1] },
                    { $multiply: [{ $multiply: ["$promedioJoven", 20] }, -1] },
                  ],
                },
              ],
            },
            1
          ],

        },
      },
    },
  ]);
}


async function calcularTristeza() {
  return await Censo.aggregate([
    {
      $group: {
        _id: "$DESC_BARRIO",
        documentos: { $push: "$$ROOT" }, // Agrupa documentos por barrio
      },
    },
    {
      $project: {
        _id: 1,
        muestra: { $slice: ["$documentos", 10] }, // Toma una muestra de 10 documentos por barrio
      },
    },
    { $unwind: "$muestra" },
    {
      $lookup: {
        from: "contaminacion_acustica",
        localField: "muestra.DESC_BARRIO",
        foreignField: "Nombre",
        as: "contaminacion",
      },
    },
    {
      $addFields: {
        nivelRuido: {
          $avg: [
            { $ifNull: [{ $arrayElemAt: ["$contaminacion.Ld", 0] }, 0] },
            { $ifNull: [{ $arrayElemAt: ["$contaminacion.Le", 0] }, 0] },
            { $ifNull: [{ $arrayElemAt: ["$contaminacion.Ln", 0] }, 0] },
            { $ifNull: [{ $arrayElemAt: ["$contaminacion.LAeq24", 0] }, 0] },
            { $ifNull: [{ $arrayElemAt: ["$contaminacion.LAS01", 0] }, 0] },
            { $ifNull: [{ $arrayElemAt: ["$contaminacion.LAS10", 0] }, 0] },
            { $ifNull: [{ $arrayElemAt: ["$contaminacion.LAS50", 0] }, 0] },
            { $ifNull: [{ $arrayElemAt: ["$contaminacion.LAS90", 0] }, 0] },
            { $ifNull: [{ $arrayElemAt: ["$contaminacion.LAS99", 0] }, 0] },
          ],
        },
        esJoven: {
          $cond: [
            { $and: [{ $gte: ["$muestra.COD_EDAD_INT", 18] }, { $lte: ["$muestra.COD_EDAD_INT", 30] }] },
            1,
            0,
          ],
        },
      },
    },
    {
      $group: {
        _id: "$_id",
        nivelRuido: { $avg: "$nivelRuido" },
        promedioJoven: { $avg: "$esJoven" }, // Proporción de jóvenes
      },
    },
    {
      $project: {
        barrio: "$_id",
        tristeza: {
          $multiply: [
            {
              $add: [
                { $multiply: ["$nivelRuido", 2.2] },
                {
                  $multiply: [
                    { $subtract: [1, "$promedioJoven"] },
                    50,
                  ],
                },
              ],
            },
            2.5
          ],
        },
      },

    },
  ]);
}



/*
async function calcularFelicidad() {
  console.log("Calculando felicidad...");

  // Obtener los datos (puedes usar una base de datos o un archivo local)
  const contaminacion = await ContaminacionAcustica.find(); // Datos de contaminación
  const accidentes = await Accidentalidad.find(); // Datos de accidentalidad
  const censos = await Censo.find(); // Datos del censo
  const multas = await Multas.find(); // Datos de multas

  // Agrupar censos por barrios
  const censosPorBarrio = censos.reduce((acc, censo) => {
    if (!acc[censo.DESC_BARRIO]) acc[censo.DESC_BARRIO] = [];
    acc[censo.DESC_BARRIO].push(censo);
    return acc;
  }, {});

  // Seleccionar muestras de censos por barrio (por ejemplo, 10 documentos por barrio)
  const muestrasPorBarrio = Object.entries(censosPorBarrio).reduce((acc, [barrio, censos]) => {
    acc[barrio] = censos.slice(0, 10); // Seleccionar hasta 10 documentos por barrio
    return acc;
  }, {});

  // Calcular felicidad para cada barrio
  const felicidadPorBarrio = Object.entries(muestrasPorBarrio).map(([barrio, muestras]) => {
    const nivelRuido = contaminacion.find(c => c.Nombre === barrio)?.Ld || 0;
    const accidentesBarrio = accidentes.filter(a => a.distrito === barrio).length;
    const multasBarrio = multas.filter(m => m.LUGAR === barrio).length;

    const totalPoblacion = muestras.reduce((sum, censo) => (
      sum + censo.EspanolesHombres + censo.EspanolesMujeres +
            censo.ExtranjerosHombres + censo.ExtranjerosMujeres
    ), 0);

    const totalJovenes = muestras.reduce((sum, censo) => (
      sum + censo.ExtranjerosHombres + censo.ExtranjerosMujeres
    ), 0);

    const proporcionJovenes = totalPoblacion > 0 ? totalJovenes / totalPoblacion : 0;

    const felicidad = 100 - (nivelRuido * 0.3 + accidentesBarrio * 0.4 + multasBarrio * 0.2 - proporcionJovenes * 50);

    return {
      barrio,
      felicidad,
    };
  });

  return felicidadPorBarrio;
}


async function calcularTristeza() {
  console.log("Calculando tristeza...");

  // Obtener los datos (puedes usar una base de datos o cargar localmente)
  const contaminacion = await ContaminacionAcustica.find(); // Datos de contaminación
  const censos = await Censo.find(); // Datos del censo

  // Agrupar censos por barrios
  const censosPorBarrio = censos.reduce((acc, censo) => {
    if (!acc[censo.DESC_BARRIO]) acc[censo.DESC_BARRIO] = [];
    acc[censo.DESC_BARRIO].push(censo);
    return acc;
  }, {});

  // Seleccionar muestras de censos por barrio (por ejemplo, 10 documentos por barrio)
  const muestrasPorBarrio = Object.entries(censosPorBarrio).reduce((acc, [barrio, censos]) => {
    acc[barrio] = censos.slice(0, 10); // Seleccionar hasta 10 documentos por barrio
    return acc;
  }, {});

  // Calcular tristeza para cada barrio
  const tristezaPorBarrio = Object.entries(muestrasPorBarrio).map(([barrio, muestras]) => {
    const nivelRuido = contaminacion.find(c => c.Nombre === barrio)?.Ln || 0;

    const totalPoblacion = muestras.reduce((sum, censo) => (
      sum + censo.EspanolesHombres + censo.EspanolesMujeres +
            censo.ExtranjerosHombres + censo.ExtranjerosMujeres
    ), 0);

    const totalJovenes = muestras.reduce((sum, censo) => (
      sum + censo.ExtranjerosHombres + censo.ExtranjerosMujeres
    ), 0);

    const proporcionJovenes = totalPoblacion > 0 ? totalJovenes / totalPoblacion : 0;

    const tristeza = nivelRuido * 0.5 + (1 - proporcionJovenes) * 50;

    return {
      barrio,
      tristeza,
    };
  });

  return tristezaPorBarrio;
}


*/
/* GET felicidad_tristeza */
router.get("/", async function (req, res) {
  try {
    const felicidad = await calcularFelicidad();
    const tristeza = await calcularTristeza();

    const result = felicidad.map((item) => {
      const tristezaItem = tristeza.find(t => t.barrio === item.barrio);
      return {
        barrio: item.barrio,
        felicidad: item.felicidad,
        tristeza: tristezaItem ? tristezaItem.tristeza : 0,
      };
    });

    res.status(200).json(result);
  } catch (err) {
    debug("Error calculating felicidad_tristeza:", err);
    res.status(500).send(err);
  }
});


module.exports = router;