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
        nivelRuido: { $ifNull: [{ $arrayElemAt: ["$contaminacion.Ld", 0] }, 0] },
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
          $subtract: [
            100,
            {
              $add: [
                { $multiply: ["$nivelRuido", 0.3] },
                { $multiply: ["$accidentesBarrio", 0.4] },
                { $multiply: ["$multasBarrio", 0.2] },
                { $multiply: [{ $multiply: ["$promedioJoven", 50] }, -1] },
              ],
            },
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
        nivelRuido: { $ifNull: [{ $arrayElemAt: ["$contaminacion.Ln", 0] }, 0] },
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
          $add: [
            { $multiply: ["$nivelRuido", 0.5] },
            {
              $multiply: [
                { $subtract: [1, "$promedioJoven"] },
                50,
              ],
            },
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

    // Combinar felicidad y tristeza en un solo objeto por barrio
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

/* GET censo listing */
router.get("/censo", function (req, res) {
  Censo.find().then(function (censos) {
    if (censos) {
      debug("Censo found:");
    } else {
      debug("No censo found.");
    }
    res.status(200).json(censos);
  }).catch(function (err) {
    res.status(500).send(err);
  });
});

/* GET contaminacion acustica listing */
router.get("/acustica", function (req, res) {
    ContaminacionAcustica.find().then(function (acustica) {
      if (acustica) {
        debug("Contaminacion acustica found:");
      } else {
        debug("No Contaminacion acustica found.");
      }
      res.status(200).json(acustica);
    }).catch(function (err) {
      res.status(500).send(err);
    });
  });
  
  /* GET accidentalidad listing */
router.get("/accidentalidad", function (req, res) {
    Accidentalidad.find().then(function (accidente) {
      if (accidente) {
        debug("Accidente found:");
      } else {
        debug("No Accidente found.");
      }
      res.status(200).json(accidente);
    }).catch(function (err) {
      res.status(500).send(err);
    });
  });
/* GET multas listing */
router.get("/multas", function (req, res) {
    const limit = parseInt(req.query.limit) || 100000;
  
    Multas.find().limit(limit).then(function (multas) {
      if (multas.length > 0) {
        debug("Multas found:");
      } else {
        debug("No Multas found.");
      }
      res.status(200).json(multas);
    }).catch(function (err) {
      res.status(500).send(err);
    });
  });


/*Get paginado*/
/* GET censo listing 
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

*/


const { Readable } = require("stream");
/*
router.get("/estadisticas", async function (req, res) {
  try {
    const limit = parseInt(req.query.limit) || 10; // Tamaño de lote por defecto
    let offset = 0; // Iniciar desde 0
    let hasMoreData = true;

    const estadisticas = {};

    // Configurar headers para streaming
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Transfer-Encoding", "chunked");

    while (hasMoreData) {
      // Recuperar lote de datos
      const censos = await Censo.find().skip(offset).limit(limit);

      if (censos.length > 0) {
        censos.forEach((item) => {
          const distrito = item.DESC_DISTRITO;
          // Inicializar acumuladores si no existen
          if (!estadisticas[distrito]) {
            estadisticas[distrito] = { distrito, espanolesHombres: 0, espanolesMujeres: 0 };
          }

          // Acumular valores
          estadisticas[distrito].espanolesHombres += item.EspanolesHombres || 0;
          estadisticas[distrito].espanolesMujeres += item.EspanolesMujeres || 0;
        });

        // Enviar los datos actuales
        res.write(JSON.stringify(Object.values(estadisticas)) + "\n");

        // Incrementar el offset
        offset += limit;
      } else {
        // No hay más datos, terminar el bucle
        hasMoreData = false;
      }
    }

    // Finalizar el stream
    res.end();
  } catch (err) {
    console.error("Error al procesar estadísticas:", err);
    res.status(500).send("Error al procesar estadísticas.");
  }
});
*/



/* GET single Censo by Id 
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
*/
 /* POST a new movie
router.post("/", function (req, res) {
  Censo.create(req.body, function (err, censoinfo) {
    if (err) res.status(500).send(err);
    else res.sendStatus(200);
  });
});
*/
/* POST a new movie (ahora conviene hacerlo todo con promesas) 
router.post("/", function (req, res) {
  Censo.create(req.body).then(function (censos) {
    res.status(201).json(censos);
  }).catch(function (err) {
    res.status(500).send(err);
  });
});*/

module.exports = router;