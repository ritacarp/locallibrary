// authorController.js
var Author = require("../models/author")
var Book = require('../models/book');
var async = require('async');
const { body,validationResult,check, matchedData } = require("express-validator");
const { DateTime } = require("luxon");
 

// Display list of all Authors.
exports.author_list = function(req, res, next) {
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
exports.author_detail = function(req, res, next) {
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
            //var err = new Error('Author not found');
            //err.status = 404;
            return next(err);
        }

        // Successful, so render
        res.render('author_detail', { author: results.author, author_books: results.author_books } );
    });    
};

// Display Author create form on GET.
exports.author_create_get =  function(req, res, next) {
    //res.send('NOT IMPLEMENTED: Author create GET');
    
    let sendDuplicateAlert=0
    if (req.params.sendDuplicateAlert) {
        console.log("\n\nCreate New Author: GET - Empty form SEND DUPLICATE ALERT\n")
        sendDuplicateAlert=1
    } else {
        console.log("\n\nCreate New Author: GET - Empty form THIS IS THE FIRT TIME ROUND\n")
        createDupe=0
        sendDuplicateAlert=0
    }

    res.render('author_form', { title: 'Create Author',  createDupe:createDupe, sendDuplicateAlert:sendDuplicateAlert});
}

// Handle Author create on POST.
exports.author_create_post = function(req, res, next) {

    const errors = validationResult(req);

    // Create a author object with escaped and trimmed data.

     let author = new Author(
        { 
            first_name: req.body.first_name,
            family_name: req.body.family_name,
            date_of_birth: req.body.date_of_birth,
            date_of_death: req.body.date_of_death
        }
    );
    let query = ""
    let queryType = ""

    if (errors.isEmpty()) {
        // Check if the author already exists

        if (req.body._id) {
            query = { "_id": req.body._id }
            queryType="id"
        } else {
            query = {'first_name': req.body.first_name, 'family_name':  req.body.family_name }
            queryType="name"
        }

        let createDupe = 0
        if (req.body.createDupe == 0) {
            createDupe = 0
        } else {
            createDupe = 1
            queryType="name"
            console.log("\n\nCREATE AUTHOR: create duplicate ! switching to query type = " + queryType + "\n\n")
        }

 
        //Author.findOne({ 'first_name': req.body.first_name, 'family_name':  req.body.family_name })
        Author.findOne(query)
        .exec( function(err, found_author) {
            if (err) { return next(err); }
            
            if (found_author) {
                if (queryType=="id") {
                    // Here for _id queries
                    author._id = found_author._id
                    Author.findByIdAndUpdate(found_author._id, author , {}, function (err) {
                        if (err) { return next(err); }
                        // Author saved. Redirect to Author detail page.
                    res.redirect(author.url);
                   })
                } else {
                    // Here for name queries
                    if (createDupe == 0) {
                        // Go back to create page with a warning that author with same name exists
                        author._id = found_author._id
                        res.render('author_form', { title: 'Create Author', author: author, errors: errors.array(), sendDuplicateAlert:1});
                    } else {
                        //Name was found, but create duplicate author anyway
                        author.save(function (err) {
                            if (err) { return next(err); }
                            // Author saved. Redirect to Author detail page.
                        res.redirect(author.url);
                       })
                    }
                }
            }
            else {
                // Save the author, because it was not found
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


// Display Author delete form on GET.
exports.author_delete_get =  function(req, res, next) {
    res.send('NOT IMPLEMENTED: Author delete GET');
}

// Handle Author delete on POST.
exports.author_delete_post = function(req, res, next) {
    res.send('NOT IMPLEMENTED: Author delete POST');
};

// Handle Author edit.
exports.author_update_get = function(req, res, next) {
    //res.send('NOT IMPLEMENTED: Author update GET');
    console.log("Edit Author: GET - Empty form\n")

    Author.findById(req.params.id)
    .exec(function (err, author) {
        if (err) { 
            console.log("Edit Author: GET - could not find author by id " + req.params.id + "\n")
            return next(err); 
        }
        //Successful, so render
        if (!author) {
            res.redirect("/catalog/author/create")
        }
        res.render('author_form', { title: 'Edit Author', author: author, sendDuplicateAlert:0 });
      });

};

// Handle Author update on POST.
exports.author_update_post = function(req, res, next) {
    
    let  author = null

    const errors = validationResult(req);

    author = new Author(
        { 
            first_name: req.body.first_name,
            family_name: req.body.family_name,
            date_of_birth: req.body.date_of_birth,
            date_of_death: req.body.date_of_death,
            _id:req.params.id
        }
    );

    if (!errors.isEmpty()) {
        res.render('author_form', { title: 'Edit Author', author: author, errors: errors.array()});
    } else {
        Author.findByIdAndUpdate(req.params.id, author, {}, function (err,found_author) {
            if (err) { 
                return next(err); 
            }
                // Author saved. Redirect to Author detail page.
                if (found_author == null) {
                    //res.render('author_form', { title: 'Create Author', author:author });
                    delete author._id
                    // Save the author
                    author.save(function (err) {
                    if (err) { return next(err); }
                    // Author saved. Redirect to Author detail page.
                    res.redirect(author.url);
                  });
                } else {
                    res.redirect(author.url);
                }
                

            });  // Author.findByIdAndUpdate
    } // if (!errors.isEmpty())  (else)


}; // exports.author_update_post

