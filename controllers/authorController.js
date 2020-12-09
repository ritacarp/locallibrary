// authorController.js
var Author = require("../models/author")
var Book = require('../models/book');
var async = require('async');
const { body,validationResult,check, matchedData } = require("express-validator");
const { DateTime } = require("luxon");

// Display list of all Authors.
exports.author_list = function(req, res) {
    //res.send('NOT IMPLEMENTED: Author list');
    Author.find({})
    .sort([['family_name', 'ascending']])
    .exec(function (err, list_authors) {
        if (err) { return next(err); }
        //Successful, so render
        res.render('author_list', { title: 'Author List', author_list: list_authors });
      });
}

// Display detail page for a specific Author.
exports.author_detail = function(req, res) {
    //res.send('NOT IMPLEMENTED: Author detail: ' + req.params.id);
    async.parallel({
        author: function(callback) {
            Author.findById(req.params.id)
              .exec(callback);
        },
        author_books: function(callback) {
            Book.find({ 'author': req.params.id })
              .exec(callback);
        },
    },

    function(err, results) {
        if (err) { return next(err); }
        if (results.author==null) { // No results.
            var err = new Error('Author not found');
            err.status = 404;
            return next(err);
        }

        // Successful, so render
        res.render('author_detail', { author: results.author, author_books: results.author_books } );
    });    
};

// Display Author create form on GET.
exports.author_create_get =  function(req, res) {
    //res.send('NOT IMPLEMENTED: Author create GET');
    console.log("Create New Author: GET - Empty form\n")
    res.render('author_form', { title: 'Create Author' });
}

// Handle Author create on POST.
exports.author_create_post = function(req, res) {

    const errors = validationResult(req);

    // Create a author object with escaped and trimmed data.

     var author = new Author(
        { 
            first_name: req.body.first_name,
            family_name: req.body.family_name,
            date_of_birth: req.body.date_of_birth,
            date_of_death: req.body.date_of_death
        }
    );

    if (errors.isEmpty()) {
        // Check if the author already exists
        Author.findOne({ 'first_name': req.body.first_name, 'family_name':  req.body.family_name })
        .exec( function(err, found_author) {
            if (err) { return next(err); }
            if (found_author) {
                res.render('author_form', { title: 'Edit Author', author:found_author });
            }
            else {
                // Save the author
                author.save(function (err) {
                    if (err) { return next(err); }
                    // Author saved. Redirect to Author detail page.
                    res.redirect(author.url);
                  });
            }
        })
    }
    else {
 
        for (let i = 0; i <  errors.array().length; i++) {
            console.log("\nError Field: " + errors.array()[i].param + " Error value: " + errors.array()[i].value + "\n")
            author[errors.array()[i].param] = errors.array()[i].value
        }
        res.render('author_form', { title: 'Create Author', author: author, errors: errors.array()});
        //return



    }



}

// Handle Author create on POST.
exports.xxxx_author_create_post =  [
    //res.send('NOT IMPLEMENTED: Author create POST');

        // Validate and sanitise fields.
        // body('first_name').trim().isLength({ min: 1 }).escape().withMessage('First name must be specified.')
        //     .isAlphanumeric().withMessage('First name has non-alphanumeric characters.'),


        // Same as above, see validation for last_name which uses the express-validation methods
        body('first_name').custom((value, { req }) => {
            let vName = req.body.first_name.trim()
            if (vName.length < 1) {
                console.log("'First Name must not be blank.")
                return Promise.reject('First Name must not be blank.');
            } else {
                var RegEx = /^[a-z0-9]+$/i; 
                var isValid = RegEx.test(escape(vName)); 
                if (!isValid) {
                    console.log("First Name must not contain non-alphanumeric characters.")
                    return Promise.reject('First Name must not contain non-alphanumeric characters.');
                    
                }  else  {return Promise.resolve} 
            }

        }),


        
    body('family_name').trim().isLength({ min: 1 }).escape().withMessage('Family name must be specified.')
        .isAlphanumeric().withMessage('Family name has non-alphanumeric characters.'),
    
    //This does not work because the date is not returned as an IS)8601 date
    //body('date_of_birth', 'Invalid date of birth').optional({ checkFalsy: true }).isISO8601().toDate(),

    body('date_of_birth').custom((value, { req }) => {
        let dateOfBirth=null
        let vSourceDate = req.body.date_of_birth.trim()
        if (vSourceDate) {
            try {
                dateOfBirth = DateTime.fromFormat(vSourceDate, 'MM/dd/yyyy')
                req.body.date_of_birth = dateOfBirth.toISODate()
                return Promise.resolve
            } catch(err) {
                //dateOfBirth=null
                //console.log("\nThe birth date is not a valid date " + vSourceDate + "\n")
                return Promise.reject('Invalid Date of birth ' + vSourceDate)
            }
        } else {
            //dateOfBirth=null
            //console.log("\nThe birth date is null \n")
            return Promise.resolve
        }

       
    }),
    
    //This does not work because the date is not returned as an IS)8601 date
    //body('date_of_death', 'Invalid date of death').optional({ checkFalsy: true }).isISO8601().toDate(),

    body('date_of_death').custom((value, { req }) => {
        let dateOfDeath = null
        let vSourceDate = req.body.date_of_death.trim()
        if (vSourceDate) {
            try {
                dateOfDeath = DateTime.fromFormat(vSourceDate, 'MM/dd/yyyy')
                req.body.date_of_death = dateOfDeath.toISODate()
                return Promise.resolve
            } catch(err) {
                //dateOfDeath=null
                //console.log("\nThe death date is not a valid date " + vSourceDate + "\n")
                return Promise.reject('Invalid Date of death ' + vSourceDate)
            }
        } else {
            //dateOfDeath=null
            //console.log("\nThe death date is null \n")
            return Promise.resolve
        }

    }),

    // See if we already have this author
    /*
    check(['family_name']).custom((value, { req }) => {
         return Author.findOne({ 'first_name': req.body.first_name, 'family_name':  req.body.family_name })
        .then(author => {
            if (author) {
                let url = '<a href="' + author.url + '">' + author.first_name + " " + author.family_name + '</a>'
                return Promise.reject('Author ' + url + ' already in use');

            }
        })
    }),
    */

    

    // Process request after validation and sanitization.
    (req, res, next) => {

        const errors = validationResult(req);

        // Create a author object with escaped and trimmed data.

         var author = new Author(
            { 
                first_name: req.body.first_name,
                family_name: req.body.family_name,
                date_of_birth: req.body.date_of_birth,
                date_of_death: req.body.date_of_death
            }
        );

        if (errors.isEmpty()) {
            // Check if the author already exists
            Author.findOne({ 'first_name': req.body.first_name, 'family_name':  req.body.family_name })
            .exec( function(err, found_author) {
                if (err) { return next(err); }
                if (found_author) {
                    res.render('author_form', { title: 'Edit Author', author:found_author });
                }
                else {
                    // Save the author
                    author.save(function (err) {
                        if (err) { return next(err); }
                        // Author saved. Redirect to Author detail page.
                        res.redirect(author.url);
                      });
                }
            })
        }
        /*
        if (!errors.isEmpty()) {
            // There are errors. Render the form again with sanitized values/error messages.
            console.log("\nThere are errors in the author form, author = " + author + "\n")
            res.render('author_form', { title: 'Create Author', author: author, errors: errors.array()});
            return;
        }  */
        else {
            console.log("\nThere are errors in the author form, author = " + author + "\n")
            res.render('author_form', { title: 'Create Author', author: author, errors: errors.array()});
            return;
        }


    }
]


// Display Author delete form on GET.
exports.author_delete_get =  function(req, res) {
    res.send('NOT IMPLEMENTED: Author delete GET');
}

// Handle Author delete on POST.
exports.author_delete_post = function(req, res) {
    res.send('NOT IMPLEMENTED: Author delete POST');
};

// Handle Author edit.
exports.author_update_get = function(req, res) {
    //res.send('NOT IMPLEMENTED: Author update GET');
    console.log("Edit Author: GET - Empty form\n")

    Author.findById(req.params.id)
    .exec(function (err, author) {
        if (err) { return next(err); }
        //Successful, so render
        res.render('author_form', { title: 'Edit Author', author: author });
      });

};

// Handle Author update on POST.
exports.author_update_post = function(req, res) {
    

   Author.findById(req.params.id)
    .exec(function (err, author) {
        if (err) { return next(err); }

        //Successful, so render

        // Check if there are errors
        const errors = validationResult(req);
        //console.log("\n author_update_post:  errors =" + errors)

        if (!errors.isEmpty()) {
            // There are errors, so display the form again with error messages
            
            for (let i = 0; i <  errors.array().length; i++) {
                console.log("\nError Field: " + errors.array()[i].param + " Error value: " + errors.array()[i].value + "\n")
                author[errors.array()[i].param] = errors.array()[i].value
            }
            res.render('author_form', { title: 'Edit Author', author: author, errors: errors.array()});
            //return res.status(422).json({ errors: errors.array() });

        } else {
            // Update the author here
            res.send('NOT IMPLEMENTED: Author update POST: DO SAVE !!!');
        }

      });

    
    

      
};

