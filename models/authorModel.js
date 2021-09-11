var mongoose = require('mongoose');
const {DateTime} = require('luxon');

var Schema = mongoose.Schema;

var AuthorSchema = new Schema(
  {
    first_name: {type: String, required: true, maxLength: 100},
    family_name: {type: String, required: true, maxLength: 100},
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

// Virtual for authors's date of birth formatting, reader friendly
AuthorSchema
.virtual('date_of_birth_formatted')
.get(function () {
  return DateTime.fromJSDate(this.date_of_birth).setLocale('en-UK').toLocaleString(DateTime.DATE_MED);
});

// Virtual for authors's date of birth formatting, datepicker friendly
AuthorSchema
.virtual('date_of_birth_datepickerfriendly')
.get(function () {
  return DateTime.fromJSDate(this.date_of_birth).toFormat('yyyy-MM-dd');
});

// Virtual for authors's date of death formatting, reader friendly
AuthorSchema
.virtual('date_of_death_formatted')
.get(function () {
  return DateTime.fromJSDate(this.date_of_death).setLocale('en-UK').toLocaleString(DateTime.DATE_MED);
});

// Virtual for authors's date of death formatting, datepicker friendly
AuthorSchema
.virtual('date_of_death_datepickerfriendly')
.get(function () {
  return DateTime.fromJSDate(this.date_of_death).toFormat('yyyy-MM-dd');
});

// Virtual for author's lifespan
AuthorSchema.virtual('lifespan').get(function() {
  var lifetime_string = '';
  if (this.date_of_birth) {
    lifetime_string = DateTime.fromJSDate(this.date_of_birth).toLocaleString(DateTime.DATE_MED);
  }
  lifetime_string += ' - ';
  if (this.date_of_death) {
    lifetime_string += DateTime.fromJSDate(this.date_of_death).toLocaleString(DateTime.DATE_MED)
  }
  return lifetime_string;
});

// Virtual for author's URL
AuthorSchema
.virtual('url')
.get(function () {
  return '/catalog/author/' + this._id;
});

//Export model
module.exports = mongoose.model('Author', AuthorSchema);
