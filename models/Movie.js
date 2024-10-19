var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var MovieSchema = new Schema({
  country: String,
  director: String,
  category: [String],
  plot: String,
  poster: String,
  year: Number,
  title: String,
  trailer: String,
  imdbRating: Number
}); // El ObjectId está implícito
module.exports = mongoose.model("Movie", MovieSchema); // define el modelo
