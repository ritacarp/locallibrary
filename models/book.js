const mongoose = require('mongoose')
const Schema = mongoose.Schema
const he = require('he');

var BookSchema = new Schema(
    {
      title: {type: String, required: true},
      author: [{type: Schema.Types.ObjectId, ref: 'Author', required: true}],
      summary: {type: String, required: true},
      isbn: {type: String, required: true, unique: true},
      genre: [{type: Schema.Types.ObjectId, ref: 'Genre'}]
    }
  );

  // Virtual for book's URL
BookSchema
.virtual('url')
.get(function () {
  return '/catalog/book/' + this._id;
});

BookSchema
.virtual('decodedTitle')
.get(function () {
  return he.decode(this.title);
});

BookSchema
.virtual('decodedSummary')
.get(function () {
  return he.decode(this.summary);
});


const Book = mongoose.model('Book',BookSchema)
module.exports = Book

