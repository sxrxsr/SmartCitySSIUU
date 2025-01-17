var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var TraficoSchema = new Schema({
  id: Number,
  fecha: Date,
  intensidad: Number,
  ocupacion: Number,
  periodo_integracion: Number,
  tipo_elem: String,
  vmed: Number,
  carga: Number,
  error: String
},{ collection: 'trafico' }); // El ObjectId está implícito
module.exports = mongoose.model("Trafico", TraficoSchema); // define el modelo

