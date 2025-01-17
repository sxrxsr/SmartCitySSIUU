var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var ocupacionAparcamientosRotacionalesSchema = new Schema({
  "AÑO": Number,
  MES: Number,
  "NOMBRE DEL APARCAMIENTO": String,
  "CÓDIGO PAR": Number,
  TIPO: String,
  "NUM PLAZAS": Number,
  "CÓDIGO DISTRITO": Number,
  DISTRITO: String,
  "Días Cálculo": Number,
  "Vehículos día (media)": Number,
  "Ocupación (%)": String,
  "Ocupación 9h-21h (%)": String  
},{ collection: 'ocupacionAparcamientosRotacionales' }); // El ObjectId está implícito
module.exports = mongoose.model("ocupacionAparcamientosRotacionales", ocupacionAparcamientosRotacionalesSchema); // define el modelo

