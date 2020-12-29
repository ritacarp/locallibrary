var Genre = require('../models/genre');
var Book = require('../models/book');
var async = require('async');
const { body,validationResult,check } = require("express-validator");
const helpers = require('../controllers/helpers/helpers')
const he = require('he');


// Display list of all Genre.
exports.genre_list = async function(req, res,next) {
      //res.send('NOT IMPLEMENTED: Genre list');

  var getRequestParams = helpers.getRequestParams(req,"name")
  var order = getRequestParams.order
  var arrow = getRequestParams.arrow
  var vLimit = getRequestParams.limit
  var vPage = getRequestParams.page
  var vSkip = getRequestParams.skip
  var vSearchStr = getRequestParams.searchStr
  var vSearchQuery = getRequestParams.searchQuery
  var sortObj = getRequestParams.sortObj

  var matchStage
  if (vSearchStr) {
      matchStage = {
          '$match': 
              vSearchQuery
          
      }
  }

  var bookLookupStage =  {
    '$lookup': {
      'from': 'books', 
      'localField': '_id', 
      'foreignField': 'genre', 
      'as': 'booksInGenre'
    }
}  // bookLookupStage

var copyLookupStage =  {
  '$lookup': {
    'from': 'bookinstances', 
    'localField': 'booksInGenre._id', 
    'foreignField': 'book', 
    'as': 'copies'
  }
} // copyLookupStage

var projectStage = {
  '$project': {
    '_id': 1, 
    'name': 1, 
    'bookCount': {
    '$size': '$booksInGenre'
    }, 
    'copyCount': {
      '$size': '$copies'
    }
  }
}  // projectStage

var sortStage = {
  '$sort': 
      sortObj
}


//var skipStage = { "$skip": vSkip }

//var limitStage = { "$limit": vLimit }



var queryPipeline = []

if (vSearchStr) {
  queryPipeline.push(matchStage)
}
queryPipeline.push(bookLookupStage)
queryPipeline.push(copyLookupStage)
queryPipeline.push(projectStage)
queryPipeline.push(sortStage)

var countingPipeline = []
if (vSearchStr) {
  countingPipeline.push(matchStage)
}
countingPipeline.push(bookLookupStage)
countingPipeline.push(copyLookupStage)
countingPipeline.push(projectStage)
countingPipeline.push(sortStage)
countingPipeline.push({ $count: "count" })

try {
  const list_genres = await Genre.aggregate(queryPipeline)
  const instanceCount = await Genre.aggregate(countingPipeline)
  var itemCount = instanceCount[0]["count"]
  const pageCount = Math.ceil(itemCount / vLimit);

  var lower = vSkip
  var upper = vSkip + vLimit
  if (upper > itemCount ) {upper = itemCount}
  list_genres_slice = list_genres.slice(lower,upper)

  res.render('genre_list', { title: 'Genre List', genre_list:list_genres_slice, he: require("he"), currentPage: vPage, pageCount, itemCount, itemsOnPage:vLimit, arrow:arrow, sortOrder:order, searchString:vSearchStr });


} catch (err) {
  return next(err)
}
  

}; // exports genre_list

        

  


exports.BACKUP_genre_list = async function(req, res,next) {
    //res.send('NOT IMPLEMENTED: Genre list');
    let genres

    let allGenres=[]

    try {
        // both of these sorts work
        //genres = await Genre.find({}).sort([['name', 'ascending']])
        
        genres = await Genre.find({}).sort({name:1}).lean()

        for (let i = 0; i < genres.length; i++) {
            genres[i].name = he.decode(genres[i].name)
            // console.log("Genre Name = " + genres[i].name + "_id = " + genres[i]._id)
            books = await Book.find({ 'genre': genres[i]._id }, {title:1, author:1})
            .sort([['title', 'ascending']])
            .populate('author')
            bookCount = await Book.find({ 'genre': genres[i]._id }).count()

            console.log("\n\n")
            console.log("count of books for genre " + genres[i].name + " = " + bookCount)
            console.log("\n\n")

            let oneGenre = {"genre":genres[i], "books": books, "bookCount":bookCount};
            allGenres.push(oneGenre)
        }
    //docs = cursor.toArray()
    } catch (e) {
        console.error(`Unable to issue find command, ${e}`)
        return next(e);
        //return allGenres
    }

    res.render('BACKUP_genre_list', { title: 'BACKUP Genre List', genre_list: allGenres });


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
exports.genre_detail = function(req, res,next) {
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
        results.genre.name = he.decode(results.genre.name)
        res.render('genre_detail', { title: 'Genre Detail', genre: results.genre, genre_books: results.genre_books } );
    });
};

// Display Genre create form on GET.
exports.genre_create_get = function(req, res,next) {
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
exports.genre_delete_get = function(req, res,next) {
    res.send('NOT IMPLEMENTED: Genre delete GET');
};

// Handle Genre delete on POST.
exports.genre_delete_post = function(req, res,next) {
    res.send('NOT IMPLEMENTED: Genre delete POST');
};

// Display Genre update form on GET.
exports.genre_update_get = function(req, res,next) {
    //res.send('NOT IMPLEMENTED: Genre update GET');

    Genre.findById(req.params.id)
    .exec(function (err, genre) {
        if (err) { 
            console.log("Edit Genre: GET - count not find genre by id " + req.params.id + "\n")
            return next(err); 
        }
        //Successful, so render
        if (!genre) {
            res.redirect("/catalog/genre/create")
        }
        res.render('genre_form', { title: 'Edit Genre', genre: genre });
      });



};

// Handle Genre update on POST.
exports.genre_update_post = [
   
  // Validate and santise the name field.
   // Function 1:  Validate and santize the name field.
  //body('name', 'Genre name required').trim().isLength({ min: 1 }).escape(),

  /*
  body('name').trim().isLength({ min: 1 }).escape().withMessage('Genre name required.')
  .isAlphanumeric().withMessage('Genre name has non-alphanumeric characters.'),
  */

  check('name').custom((value) => {
    if (value.match(/^[A-Za-z ]+$/))
    {
      {return Promise.resolve}
    }
    else {
      return Promise.reject('Genre name must not have non-alphanumeric characters.');
    }
    //return value.match(/^[A-Za-z ]+$/);
  }),


       // Function 2:  Validate and santize the name field.
       //              Does the same as Function 1 but with a custom validator
       /*
      body('name').custom((value, { req }) => {
          let vName = req.body.name.trim()
          if (vName.length < 1) {
              return Promise.reject('Gerne Name must not be blank');
          }
          else {return Promise.resolve}
      }),
      */

    // Function 3:  See if Genre exists
   check('name').custom((value, { req }) => {
    return Genre.findOne({ 'name': req.body.name, '_id': {$ne: req.params.id} } ).then(genre => {
      if (genre) {
        let url = '<a href="' + genre.url + '">' + genre.name + '</a>'
        return Promise.reject('Genre ' + url + ' already in use');
      }
    });
  }),

function(req, res,next) {
    //res.send('NOT IMPLEMENTED: Genre update POST');

    let  genre = null



    genre = new Genre(
      { 
          name: req.body.name,
          _id:req.params.id
      }
    )

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      console.log("\n\nERROR!  In Genre Update Post: name = " + req.body.name + "\n\n")
      res.render('genre_form', { title: 'Edit Genre', genre: genre, errors: errors.array()});
      return;
    } else {
      Genre.findByIdAndUpdate(req.params.id, genre, {}, function (err,found_genre) {

        if (err) { 
          return next(err); 
      }
          // Genre saved. Redirect to Genre detail page.
          if (found_genre == null) {
              //res.render('author_form', { title: 'Create Author', author:author });
              delete genre._id
              // Save the author
              genre.save(function (err) {
              if (err) { return next(err); }
              // Genre saved. Redirect to Genre detail page.
              res.redirect(genre.url);
            });
          } else {
              res.redirect(genre.url);
          }
          

          
      });        




    }



}
]