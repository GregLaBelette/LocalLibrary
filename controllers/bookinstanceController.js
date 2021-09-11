var BookInstance = require('../models/bookinstanceModel');
var Book = require('../models/bookModel.js');
const { body, validationResult} = require('express-validator');

var async = require('async');

// Display list of all BookInstances.
exports.bookinstance_list = function(req, res, next) {

  BookInstance.find()
    .populate('book')
    .exec(function (err, list_bookinstances) {
      if (err) { return next(err); }
      // Successful, so render
      res.render('bookinstance_list', { title: 'Book Copies List', bookinstance_list: list_bookinstances });
    });

};

// Display detail page for a specific BookInstance.
exports.bookinstance_detail = function(req, res, next) {

    BookInstance.findById(req.params.id)
    .populate('book')
    .exec(function (err, bookinstance) {
      if (err) { return next(err); }
      if (bookinstance==null) { // No results.
          var err = new Error('Book copy not found');
          err.status = 404;
          return next(err);
        }
      // Successful, so render.
      res.render('bookinstance_detail', { title: 'Copy: '+bookinstance.book.title, bookinstance:  bookinstance});
    })

};


// Display BookInstance create form on GET.
exports.bookinstance_create_get = function(req, res, next) {

    Book.find({},'title')
    .exec(function (err, books) {
      if (err) { return next(err); }
      // Successful, so render.
      res.render('bookinstance_form', {title: 'Create Book Copy', book_list: books});
    });

};

// Handle BookInstance create on POST.
exports.bookinstance_create_post = [

    // Validate and sanitise fields.
    body('book', 'Book must be specified').trim().isLength({ min: 1 }).escape(),
    body('imprint', 'Imprint must be specified').trim().isLength({ min: 1 }).escape(),
    body('status').escape(),
    body('due_back', 'Invalid date').optional({ checkFalsy: true }).isISO8601().toDate(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a BookInstance object with escaped and trimmed data.
        var bookinstance = new BookInstance(
          { book: req.body.book,
            imprint: req.body.imprint,
            status: req.body.status,
            due_back: req.body.due_back
           });

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values and error messages.
            Book.find({},'title')
                .exec(function (err, books) {
                    if (err) { return next(err); }
                    // Successful, so render.
                    res.render('bookinstance_form', { title: 'Create BookInstance', book_list: books, selected_book: bookinstance.book._id , errors: errors.array(), bookinstance: bookinstance });
            });
            return;
        }
        else {
            // Data from form is valid.
            bookinstance.save(function (err) {
                if (err) { return next(err); }
                   // Successful - redirect to new record.
                   res.redirect(bookinstance.url);
                });
        }
    }
];

// Display BookInstance delete form on GET.
exports.bookinstance_delete_get = function(req, res, next) {
  
    BookInstance.findById(req.params.id)
    .populate('book')
    .exec(function (err, results) {

        if (err) { return next(err); }
        if (results._id==null) { // No results.
            res.redirect('/catalog/bookinstances');
        }
        // Successful, so render.
        res.render('bookinstance_delete', { title: 'Delete Copy', bookinstance: results} );

    })

};

// Handle BookInstance delete on POST.
exports.bookinstance_delete_post = function(req, res, next) {

    BookInstance.findByIdAndRemove(req.body.bookinstanceid, function deleteBookinstance(err) {
        if (err) {return next(err); }
        //Success - go to copies list
        const url = `/catalog/book/${req.body.book.toString()}`
        res.redirect(url)
    })    

};

// Display BookInstance update form on GET.
exports.bookinstance_update_get = function(req, res, next) {

    //Get book instance and books from form 
    async.parallel({
        bookinstance: function(callback) {
            BookInstance.findById(req.params.id).populate('book').exec(callback);
        },
        books: function(callback) {
            Book.find(callback);
        },
        }, function (err, results) {
            if (err) {return next(err); }
            if (results.bookinstance == null) { //No results
                var err = new Error('Copy not found');
                err.status = 404;
                return next(err);
            }
            //Success
            res.render('bookinstance_form', {title: 'Update Book Copy', bookinstance: results.bookinstance, book_list: results.books});

    });

};

// Handle bookinstance update on POST.
exports.bookinstance_update_post = [

    // Validate and sanitise fields.
    body('book', 'Please choose a boook').trim().isLength({ min: 1 }).escape(),
    body('imprint', 'Please provide an imprint description').trim().isLength({ min: 1 }).escape(),
    body('due_back', 'Wrong date format').trim().escape(),
    body('status', 'Please select status').trim().isLength({ min: 1 }).escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a Book object with escaped/trimmed data and old id.
        var bookinstance = new BookInstance(
          { book: req.body.book,
            imprint: req.body.imprint,
            status: req.body.status,
            due_back: req.body.due_back,
            _id:req.params.id //This is required, or a new ID will be assigned!
           });

        if (!errors.isEmpty()) {
            //There are errors, Render form again with sanitized values/error messages
            
            //Get Bookinstance from form & book list... 
            async.parallel({
                bookinstance: function(callback) {
                    BookInstance.findById(req.params.id).populate('book').exec(callback);
                },
                books: function(callback) {
                    Book.find(callback);
                },
            }, function (err, results) {
                if (err) {return next(err); }
                if (results.bookinstance == null) { //No results
                    var err = new Error('Copy not found');
                    err.status = 404;
                    return next(err);
                 }
                //Success
                res.render('bookinstance_form', {title: 'Update Book Copy', bookinstance: results.bookinstance, book_list: results.books, errors: errors.array()});
            });

        }
        else {
            // Data from form is valid. Update the record.
            BookInstance.findByIdAndUpdate(req.params.id, bookinstance, {}, function (err,thecopy) {
                if (err) { return next(err); }
                   // Successful - redirect to book detail page.
                   res.redirect(thecopy.url);
                });
        }
    }
];
