const mongoose = require('mongoose')
const Schema = mongoose.Schema

var AuthorSchema = new Schema(
    {
      first_name: {type: String, required: true, maxlength: 100},
      family_name: {type: String, required: true, maxlength: 100},
      date_of_birth: {type: Date},
      date_of_death: {type: Date},
    }
  );

  // Virtual for author's full name
AuthorSchema
.virtual('name')
.get(function () {
  return this.family_name + ', ' + this.first_name;
});

// Virtual for author's lifespan
AuthorSchema
.virtual('lifespan')
.get(function () {
  if (this.date_of_death) {
    if (this.date_of_birth) {
      return (this.date_of_death.getYear() - this.date_of_birth.getYear()).toString();
    }
  }
  else
  if (this.date_of_birth) {
    return (new Date().getYear() - this.date_of_birth.getYear()).toString();
  }
  else return ""
});

// Virtual for author's URL
AuthorSchema
.virtual('url')
.get(function () {
  return '/catalog/author/' + this._id;
});

const Author = mongoose.model('Author',AuthorSchema)
module.exports = Author

