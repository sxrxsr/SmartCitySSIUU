var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var MultasSchema = new Schema({
  CALIFICACION: String,
  LUGAR: String,
    MES: String,
    ANIO: Number,
    HORA: String,
    IMP_BOL: Number,
    DESCUENTO: Number,
    PUNTOS: Number,
    DENUNCIANTE: String,
    "HECHO-BOL": String,
    VEL_LIMITE: Number,
    VEL_CIRCULA: Number,
    COORDENADA_X: Number,
    COORDENADA_Y: Number
}, { collection: 'multas' }); // El ObjectId está implícito
module.exports = mongoose.model("Multas", MultasSchema); // define el modelo

