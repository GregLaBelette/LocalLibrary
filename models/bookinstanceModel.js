var mongoose = require('mongoose');
const {DateTime} = require('luxon');

var Schema = mongoose.Schema;

var BookInstanceSchema = new Schema (
  {
    book: { type: Schema.Types.ObjectId, ref: 'Book', required: true }, //reference to the associated book
    imprint: {type: String, required: true},
    status: {type: String, required: true, enum: ['Available', 'Maintenance', 'Loaned', 'Reserved'], default: 'Maintenance'},
    due_back: {type: Date, default: Date.now}
  }
);

// Virtual for bookinstance's URL
BookInstanceSchema
.virtual('url')
.get(function () {
  return '/catalog/bookinstance/' + this._id;
});

// Virtual for bookinstance's due date formatting, reader friendly
BookInstanceSchema
.virtual('due_back_formatted')
.get(function () {
  return DateTime.fromJSDate(this.due_back).setLocale('en-UK').toLocaleString(DateTime.DATE_MED);
});

// Virtual for bookinstance's due date formatting, datepicker friendly
BookInstanceSchema
.virtual('due_back_datepickerfriendly')
.get(function () {
  return DateTime.fromJSDate(this.due_back).toFormat('yyyy-MM-dd');
});

//Export model
module.exports = mongoose.model('BookInstance', BookInstanceSchema);