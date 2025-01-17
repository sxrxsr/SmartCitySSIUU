var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var UsoBicicletaSchema = new Schema({
    DIA: Date,
    "HORAS_TOTALES_DISPONIBILIDAD_BICICLETAS_EN _ANCLAJES": String,
    HORAS_TOTALES_USOS_BICICLETAS: String,
    MEDIA_BICICLETAS_DISPONIBLES: String,
    TOTAL_HORAS_SERVICIO_BICICLETAS: String,
    TOTAL_USOS: Number,
    USOS_ABONADO_ANUAL: Number,
    USOS_ABONADO_OCASIONAL: Number
}, { collection: 'bicicletasDisponibilidad' }); // El ObjectId está implícito
module.exports = mongoose.model("UsoBicicleta", UsoBicicletaSchema); // define el modelo

