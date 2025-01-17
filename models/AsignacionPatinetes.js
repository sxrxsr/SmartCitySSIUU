var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var AsignacionPatinetesSchema = new Schema({
    DISTRITO: String,
    BARRIO: String,
    ACCIONA: Number,
    Taxify: Number,
    KOKO: Number,
    UFO: Number,
    RIDECONGA: Number,
    FLASH: Number,
    LIME: Number,
    WIND: Number,
    BIRD: Number,
    "REBY RIDES": Number,
    MOVO: Number,
    MYGO: Number,
    "JUMP UBER": Number,
    "SJV CONSULTING": Number,
    TOTAL: Number
}, { collection: 'asignacionPatinetes' }); // El ObjectId está implícito
module.exports = mongoose.model("AsignacionPatinetes", AsignacionPatinetesSchema); // define el modelo

