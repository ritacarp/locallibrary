var Genre = require('../models/genre');
var Book = require('../models/book');
var async = require('async');
const { body,validationResult,check } = require("express-validator");

// Display list of all Genre.

exports.genre_list = async function(req, res,next) {
    //res.send('NOT IMPLEMENTED: Genre list');
    let genres

    let allGenres=[]

    try {
        genres = await Genre.find({}).sort([['name', 'ascending']])
        for (let i = 0; i < genres.length; i++) {
            books = await Book.find({ 'genre': genres[i]._id }, {title:1, author:1})
            .sort([['title', 'ascending']])
            .populate('author')
            let oneGenre = {"genre":genres[i], "books": books};
            allGenres.push(oneGenre)
        }
    //docs = cursor.toArray()
    } catch (e) {
        console.error(`Unable to issue find command, ${e}`)
        return next(e);
        //return allGenres
    }

    console.log(allGenres)
    res.render('genre_list', { title: 'Genre List', genre_list: allGenres });





    /*
    Genre.find({})
    .sort([['name', 'ascending']])
    .exec(function (err, list_genres) {
        if (err) { return next(err); }
        //Successful, so render
        console.log("Genre List:" + list_genres)
        res.render('genre_list', { title: 'Genre List', genre_list: list_genres });
      });
      */
};



// Display detail page for a specific Genre.
exports.genre_detail = function(req, res) {
    //res.send('NOT IMPLEMENTED: Genre detail: ' + req.params.id);
    async.parallel({
        genre: function(callback) {
            Genre.findById(req.params.id)
              .exec(callback);
        },
        genre_books: function(callback) {
            Book.find({ 'genre': req.params.id })
            .populate('author')
              .exec(callback);
        },

    },

    function(err, results) {
        if (err) { return next(err); }
        if (results.genre==null) { // No results.
            var err = new Error('Genre not found');
            err.status = 404;
            return next(err);
        }

        // Successful, so render
        res.render('genre_detail', { title: 'Genre Detail', genre: results.genre, genre_books: results.genre_books } );
    });
};

// Display Genre create form on GET.
exports.genre_create_get = function(req, res) {
    //res.send('NOT IMPLEMENTED: Genre create GET');
    console.log("Create New Genre: GET - Empty form\n")
    res.render('genre_form', { title: 'Create Genre' });
};


// Handle Genre create on POST.
   //IMPORTANT:  Look at the signature of this function!
    // It is NOT exports.genre_create_post = function(req, res) { .... }
    // It begins and ends with [ ... ]
    // That is because it is an ARRAY of midde ware functions
    // The request and response function come AFTER the validation and cleanup functions

    // This controller function specifies an array of middleware functions
    // The array is passed to the router function and each method is called in order.

exports.genre_create_post =  [
   
    // Validate and santise the name field.
     // Function 1:  Validate and santize the name field.
    body('name', 'Genre name required').trim().isLength({ min: 1 }).escape(),

         // Function 2:  Validate and santize the name field.
         //              Does the same as Function 1 but with a custom validator
        body('name').custom((value, { req }) => {
            let vName = req.body.name.trim()
            if (vName.length < 1) {
                return Promise.reject('Gerne Name must not be blank');
            }
            else {return Promise.resolve}
        }),
        

    // Function 3:  See if Genre exists
   check('name').custom((value, { req }) => {
    return Genre.findOne({ 'name': req.body.name }).then(genre => {
      if (genre) {
        let url = '<a href="' + genre.url + '">' + genre.name + '</a>'
        return Promise.reject('Genre ' + url + ' already in use');
      }
    });
  }),
    
    
  
    // Process request after validation and sanitization.
    // Function 4: EITHER function (req, res, next) { ... } OR (req, res, next) => { ... } WORKS
    //(req, res, next) => {
    function (req, res, next) {
  
      // Extract the validation errors from a request.
      const errors = validationResult(req);
  
      // Create a genre object with escaped and trimmed data.
      var genre = new Genre(
        { name: req.body.name }
      );
  
  
      if (!errors.isEmpty()) {
        // There are errors. Render the form again with sanitized values/error messages.
        res.render('genre_form', { title: 'Create Genre', genre: genre, errors: errors.array()});
        return;
      }
      else {
        // Data from form is valid.
        // Check if Genre with same name already exists.
        Genre.findOne({ 'name': req.body.name })
          .exec( function(err, found_genre) {
             if (err) { return next(err); }
  
             if (found_genre) {
               // Genre exists, redirect to its detail page.
               res.redirect(found_genre.url);
             }
             else {
  
               genre.save(function (err) {
                 if (err) { return next(err); }
                 // Genre saved. Redirect to genre detail page.
                 res.redirect(genre.url);
               });
  
             }
  
           });
      }
    }
  ];


// Display Genre delete form on GET.
exports.genre_delete_get = function(req, res) {
    res.send('NOT IMPLEMENTED: Genre delete GET');
};

// Handle Genre delete on POST.
exports.genre_delete_post = function(req, res) {
    res.send('NOT IMPLEMENTED: Genre delete POST');
};

// Display Genre update form on GET.
exports.genre_update_get = function(req, res) {
    res.send('NOT IMPLEMENTED: Genre update GET');
};

// Handle Genre update on POST.
exports.genre_update_post = function(req, res) {
    res.send('NOT IMPLEMENTED: Genre update POST');
};