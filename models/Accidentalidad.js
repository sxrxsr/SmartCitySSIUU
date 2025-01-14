var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var AccidentalidadSchema = new Schema({
  cod_distrito: Number,
  cod_lesividad: Number,
  coordenada_x_utm: Number,
  coordenada_y_utm: Number,
  distrito: String,
  estado_metereologico: String,
  fecha: Date,
  hora: String,
  lesividad: String,
  localizacion: String,
  num_expediente: String,
  numero: Number,
  positiva_alcohol: String,
  positiva_droga: String,
  rango_edad: String,
  sexo: String,
  tipo_accidente: String,
  tipo_persona: String,
  tipo_vehiculo: String
  
},{ collection: 'accidentalidad' }); // El ObjectId está implícito
module.exports = mongoose.model("Accidentalidad", AccidentalidadSchema); // define el modelo

