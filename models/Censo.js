var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var CensoSchema = new Schema({
  COD_DISTRITO: Number,
  DESC_DISTRITO: String,
  COD_DIST_BARRIO: Number,
  DESC_BARRIO: String,
  COD_BARRIO: Number,
  COD_DIST_SECCION: Number,
  COD_SECCION: Number,
  COD_EDAD_INT: Number,
  EspanolesHombres: Number,
  EspanolesMujeres: Number,
  ExtranjerosHombres: Number,
  ExtranjerosMujeres: Number
}); // El ObjectId está implícito
module.exports = mongoose.model("Censo", CensoSchema); // define el modelo

