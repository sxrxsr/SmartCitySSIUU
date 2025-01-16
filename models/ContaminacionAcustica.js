var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var ContaminacionAcusticaSchema = new Schema({
    Fecha: Date,
    NMT: Number,
    Nombre: String,
    Ld: Number,
    Le: Number,
    Ln: Number,
    LAeq24: Number,
    LAS01: Number,
    LAS10: Number,
    LAS50: Number,
    LAS90: Number,
    LAS99: Number
},{ collection: 'contaminacionAcustica' }); // El ObjectId está implícito
module.exports = mongoose.model("ContaminacionAcustica", ContaminacionAcusticaSchema); // define el modelo

