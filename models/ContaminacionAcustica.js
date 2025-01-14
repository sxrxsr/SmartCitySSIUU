var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var ContaminacionAcusticaSchema = new Schema({
    Fecha: Date,
    NMT: Number,
    Nombre: String,
    Ld: mongoose.Types.Decimal128,
    Le: mongoose.Types.Decimal128,
    Ln: mongoose.Types.Decimal128,
    LAeq24: mongoose.Types.Decimal128,
    LAS01: mongoose.Types.Decimal128,
    LAS10: mongoose.Types.Decimal128,
    LAS50: mongoose.Types.Decimal128,
    LAS90: mongoose.Types.Decimal128,
    LAS99: mongoose.Types.Decimal128
},{ collection: 'contaminacionAcustica' }); // El ObjectId está implícito
module.exports = mongoose.model("ContaminacionAcustica", ContaminacionAcusticaSchema); // define el modelo

