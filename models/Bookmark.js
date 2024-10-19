var mongoose = require('mongoose');
var Schema = mongoose.Schema;
// var Movie = require('../models/Movie.js'); // necesario si no estamos dentro del mismo directorio

var BookmarkSchema = new Schema({
    email: String,
    movie: { type: Schema.ObjectId, ref: 'Movie' },
    addeddate: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Bookmark', BookmarkSchema);
