var express = require("express");
var mongoose = require("mongoose");
var router = express.Router();
var debug = require("debug")("contenedoresApp:server");

// Importar el modelo
var Bicicleta = require("../models/UsoBicicletas.js");
var Patinetes = require("../models/AsignacionPatinetes.js");
var Accidentalidad = require("../models/Accidentalidad.js");
var Multas = require("../models/Multas.js");
var Censo = require("../models/Censo.js");

mongoose.set("strictQuery", false);


async function calcularAnsiedad(limit = 50) {
    try {
        console.log("Calculando ansiedad...");
        const bicicletas = await Bicicleta.aggregate([
            { $limit: limit },
            {
                $project: {
                    mediaBicicletas: {
                        $toDouble: {
                            $replaceAll: {
                                input: {
                                    $replaceAll: {
                                        input: {
                                            $cond: [
                                                {
                                                    $and: [
                                                        { $ne: ["$MEDIA_BICICLETAS_DISPONIBLES", null] }, // Verifica que no sea nulo
                                                        { $ne: ["$MEDIA_BICICLETAS_DISPONIBLES", ""] },   // Verifica que no sea vacío
                                                        { $eq: [{ $type: "$MEDIA_BICICLETAS_DISPONIBLES" }, "string"] }, // Verifica que sea string
                                                    ],
                                                },
                                                "$MEDIA_BICICLETAS_DISPONIBLES",
                                                "0", // Si no cumple, asigna "0"
                                            ],
                                        },
                                        find: ".",
                                        replacement: "", // Elimina puntos separadores de miles
                                    },
                                },
                                find: ",",
                                replacement: ".", // Reemplaza comas decimales por puntos
                            },
                        },
                    },
                },
            },
            {
                $match: {
                    mediaBicicletas: { $ne: null }, // Filtra los resultados nulos después de la conversión
                },
            },
            {
                $group: {
                    _id: null,
                    mediaBicicletas: { $avg: "$mediaBicicletas" }, // Calcula la media
                },
            },
        ]);
        
        
        
        
    console.log("Bicicletas ansiedad:", bicicletas);


    const patinetes = await Patinetes.aggregate([
        { $limit: limit },
        {
            $project: {
                _id: "$BARRIO", // Mantén el identificador del barrio
                operadores: {
                    $filter: {
                        input: [
                            "$ACCIONA",
                            "$Taxify",
                            "$KOKO",
                            "$UFO",
                            "$RIDECONGA",
                            "$FLASH",
                            "$LIME",
                            "$WIND",
                            "$BIRD",
                            "$REBY RIDES",
                            "$MOVO",
                            "$MYGO",
                            "$JUMP UBER",
                            "$SJV CONSULTING",
                        ], // Lista de operadores
                        as: "operador",
                        cond: {
                            $and: [
                                { $ne: ["$$operador", null] }, // Filtra valores nulos
                                { $ne: ["$$operador", ""] },   // Filtra valores vacíos
                                { $gte: ["$$operador", 0] },   // Filtra valores negativos o inválidos
                            ],
                        },
                    },
                },
            },
        },
        {
            $project: {
                _id: 1,
                varianzaOperadores: {
                    $cond: [
                        { $gt: [{ $size: "$operadores" }, 1] }, // Asegúrate de que hay suficientes datos para calcular la varianza
                        { $stdDevPop: "$operadores" },         // Calcula la desviación estándar si hay datos válidos
                        null,                                  // Si no hay suficientes datos, devuelve `null`
                    ],
                },
            },
        },
    ]);
    

    console.log("patinetes ansiedad:", patinetes);


    const accidentes = await Accidentalidad.aggregate([
        { $limit: limit },
        {
            $match: {
                distrito: { $exists: true, $ne: null, $type: "string" }, // Asegura que 'distrito' exista y sea una cadena
            },
        },
        {
            $group: {
                _id: "$distrito", // Agrupa por distrito
                totalAccidentes: { $sum: 1 }, // Cuenta el número de accidentes por distrito
            },
        },
    ]);
    
    console.log("Accidentes ansiedad:", accidentes);


    const multas = await Multas.aggregate([
        { $limit: limit },
        {
            $match: {
                LUGAR: { $exists: true, $ne: null, $type: "string" }, // Asegura que 'LUGAR' exista, no sea nulo y sea una cadena
            },
        },
        {
            $group: {
                _id: "$LUGAR", // Agrupa por el campo 'LUGAR'
                totalMultas: { $sum: 1 }, // Cuenta el número de multas por lugar
            },
        },
    ]);
    


    const censo = await Censo.aggregate([
        { $limit: limit },
        {
            $match: {
                COD_EDAD_INT: { $exists: true, $ne: null, $type: "int" }, // Validar que 'COD_EDAD_INT' exista, no sea nulo y sea un entero
                DESC_BARRIO: { $exists: true, $ne: null, $type: "string" }, // Validar que 'DESC_BARRIO' exista, no sea nulo y sea una cadena
            },
        },
        {
            $group: {
                _id: "$DESC_BARRIO", // Agrupar por el barrio
                proporcionJovenes: {
                    $avg: {
                        $cond: [
                            {
                                $and: [
                                    { $gte: ["$COD_EDAD_INT", 18] }, // Edad mayor o igual a 18
                                    { $lte: ["$COD_EDAD_INT", 30] }, // Edad menor o igual a 30
                                ],
                            },
                            1, // Contar como "joven"
                            0, // No contar como "joven"
                        ],
                    },
                },
            },
        },
    ]);
    
    
    console.log("Censo ansiedad:", censo);

    return {  patinetes, accidentes, multas, censo };
} catch (error) {
    console.error("Error en calcularAnsiedad:", error);
    throw error;
}
}

async function calcularConfianza(limit = 50) {
    console.log("calculando confianza...");
    const bicicletas = await Bicicleta.aggregate([
        { $limit: limit },
        {
            $project: {
                totalHorasServicio: {
                    $toDouble: {
                        $replaceAll: {
                            input: {
                                $replaceAll: {
                                    input: {
                                        $cond: [
                                            {
                                                $and: [
                                                    { $eq: [{ $type: "$TOTAL_HORAS_SERVICIO_BICICLETAS" }, "string"] },
                                                    { $ne: ["$TOTAL_HORAS_SERVICIO_BICICLETAS", null] },
                                                    { $ne: ["$TOTAL_HORAS_SERVICIO_BICICLETAS", ""] },
                                                ],
                                            },
                                            "$TOTAL_HORAS_SERVICIO_BICICLETAS",
                                            "0", // Si no es cadena o es inválida, reemplaza por "0"
                                        ],
                                    },
                                    find: ".",
                                    replacement: "", // Elimina puntos separadores de miles
                                },
                            },
                            find: ",",
                            replacement: ".", // Reemplaza comas decimales por puntos
                        },
                    },
                },
                totalUsos: {
                    $cond: [
                        { $and: [{ $ne: ["$TOTAL_USOS", null] }, { $type: "$TOTAL_USOS" }] },
                        { $toDouble: "$TOTAL_USOS" },
                        0, // Si `TOTAL_USOS` es nulo o inválido, se asigna 0
                    ],
                },
                tasaUsoCalculada: {
                    $cond: [
                        {
                            $gt: [
                                {
                                    $toDouble: {
                                        $replaceAll: {
                                            input: {
                                                $replaceAll: {
                                                    input: {
                                                        $cond: [
                                                            {
                                                                $and: [
                                                                    { $eq: [{ $type: "$TOTAL_HORAS_SERVICIO_BICICLETAS" }, "string"] },
                                                                    { $ne: ["$TOTAL_HORAS_SERVICIO_BICICLETAS", null] },
                                                                    { $ne: ["$TOTAL_HORAS_SERVICIO_BICICLETAS", ""] },
                                                                ],
                                                            },
                                                            "$TOTAL_HORAS_SERVICIO_BICICLETAS",
                                                            "0",
                                                        ],
                                                    },
                                                    find: ".",
                                                    replacement: "",
                                                },
                                            },
                                            find: ",",
                                            replacement: ".",
                                        },
                                    },
                                },
                                0,
                            ],
                        },
                        {
                            $divide: [
                                { $toDouble: "$TOTAL_USOS" },
                                {
                                    $toDouble: {
                                        $replaceAll: {
                                            input: {
                                                $replaceAll: {
                                                    input: {
                                                        $cond: [
                                                            {
                                                                $and: [
                                                                    { $eq: [{ $type: "$TOTAL_HORAS_SERVICIO_BICICLETAS" }, "string"] },
                                                                    { $ne: ["$TOTAL_HORAS_SERVICIO_BICICLETAS", null] },
                                                                    { $ne: ["$TOTAL_HORAS_SERVICIO_BICICLETAS", ""] },
                                                                ],
                                                            },
                                                            "$TOTAL_HORAS_SERVICIO_BICICLETAS",
                                                            "0",
                                                        ],
                                                    },
                                                    find: ".",
                                                    replacement: "",
                                                },
                                            },
                                            find: ",",
                                            replacement: ".",
                                        },
                                    },
                                },
                            ],
                        },
                        null, // Si no cumple las condiciones, asigna null
                    ],
                },
            },
        },
        {
            $group: {
                _id: null,
                tasaUso: { $avg: "$tasaUsoCalculada" },
            },
        },
    ]);
    
    
    
    console.log("bicicleta confianza:", bicicletas);
    const patinetes = await Patinetes.aggregate([
        { $limit: limit },
        {
            $project: {
                _id: "$BARRIO",
                operadores: {
                    $map: {
                        input: [
                            "$ACCIONA", "$Taxify", "$KOKO", "$UFO", "$RIDECONGA", "$FLASH",
                            "$LIME", "$WIND", "$BIRD", "$REBY RIDES", "$MOVO", "$MYGO",
                            "$JUMP UBER", "$SJV CONSULTING"
                        ],
                        as: "operador",
                        in: {
                            $cond: [
                                { $and: [{ $ne: ["$$operador", null] }, { $type: "$$operador" }] }, // Validar no nulo y tipo válido
                                "$$operador",
                                0 // Reemplaza valores inválidos por 0
                            ]
                        },
                    },
                },
            },
        },
        {
            $project: {
                _id: 1,
                totalPatinetes: { $sum: "$operadores" }, // Suma de valores válidos
                promedioOperadores: { $avg: "$operadores" }, // Promedio de valores válidos
            },
        },
    ]);
    
    

    const accidentes = await Accidentalidad.aggregate([
        { $limit: limit },
        {
            $match: { 
                distrito: { $exists: true, $ne: null, $type: "string" } // Asegurar que el campo existe, no es nulo y es de tipo cadena
            },
        },
        {
            $group: {
                _id: "$distrito", // Agrupar por distrito
                totalAccidentes: { $sum: 1 }, // Contar documentos en cada grupo
            },
        },
    ]);
    

    const multas = await Multas.aggregate([
        { $limit: limit },
        {
            $match: { 
                LUGAR: { $exists: true, $ne: null, $type: "string" } // Asegurar que `LUGAR` existe, no es nulo y es de tipo cadena
            },
        },
        {
            $group: {
                _id: "$LUGAR", // Agrupar por el campo `LUGAR`
                totalMultas: { $sum: 1 }, // Contar documentos en cada grupo
            },
        },
    ]);
    

    return {  patinetes, accidentes, multas };
}


router.get("/", async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 1000;

        // Calcular ansiedad y confianza
        const ansiedad = await calcularAnsiedad(limit);
        const confianza = await calcularConfianza(limit);

        // Combinar datos de ansiedad y confianza en un único array
        const combinedData = ansiedad.patinetes.map((item, index) => ({
            id: `data-${index}`,
            x: item.promedioOperadores || 0, // Ejemplo: promedio de operadores en patinetes
            y: ansiedad.patinetes[index]?.varianzaOperadores || 0, // Ejemplo: varianza de operadores en ansiedad
            label: `Barrio ${item._id}`, // Cambia esto según los datos reales (ej. nombre de barrio)
            color: generateColor(index), // Generar un color único
        }));

        res.status(200).json(combinedData);
    } catch (error) {
        console.error("Error calculando scatter data:", error);
        res.status(500).json({ error: error.message || "Error al calcular scatter data" });
    }
});

// Función para generar colores únicos
function generateColor(index) {
    const colors = [
        "#FF5733", "#33FF57", "#3357FF", "#FF33A1", "#FFC733", "#33FFF6", "#8A33FF", "#FF8A33",
    ];
    return colors[index % colors.length];
}



router.get("/bic", function (req, res) {
    Bicicleta.find().then(function (censos) {
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
  

module.exports = router;