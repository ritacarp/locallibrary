var mongoose = require('mongoose');
var Schema = mongoose.Schema;
const he = require('he');

var GenreSchema = new Schema(
  {
    name: {type: String, required: true, minlength:3, maxlength:100}
  });

 
GenreSchema
.virtual('url')
.get(function () {
  return '/catalog/genre/' + this._id;
});

 // Virtual for genre's URL
GenreSchema
.virtual('decodedName')
.get(function () {
  return he.decode(this.name);
});


GenreSchema
.virtual('id')
.get(function () {
  return (this._id);
});


const Genre = mongoose.model('Genre',GenreSchema)
module.exports = Genre
