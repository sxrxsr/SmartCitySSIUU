var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var ContenedoresUbicacionSchema = new Schema({
    "Código Interno del Situad": Number,
    "Tipo Contenedor": String,
    "Modelo": String,
    "Descripcion": String,
    "Modelo": String,
    "Cantidad": Number,
    "Lote": String,
    "Distrito": String,
    "Barrio": Number,
    "Tipo Vía": String,
    "Nombre": String,
    "Número": Number,
    "COORDENADA X": Number,
    "COORDENADA Y": Number,
    "LONGITUD": Number,
    "LATITUD": Number,
    "DIRECCION": String
}); // El ObjectId está implícito
module.exports = mongoose.model("ContenedorUbicacion", ContenedoresUbicacionSchema, "contenedoresUbicacion"); // define el modelo

