var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var GenreSchema = new Schema(
  {
    name: {type: String, required: true, minlength:3, maxlength:100}
  });

  // Virtual for genre's URL
  GenreSchema
.virtual('url')
.get(function () {
  return '/catalog/genre/' + this._id;
});


const Genre = mongoose.model('Genre',GenreSchema)
module.exports = Genre
