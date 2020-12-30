// bookController.js

var Book = require('../models/book');
var Author = require('../models/author');
var Genre = require('../models/genre');
var BookInstance = require('../models/bookinstance');
var async = require('async');
const helpers = require('../controllers/helpers/helpers')
const { body, validationResult, check, matchedData, params } = require("express-validator");
var mongoose = require('mongoose');


exports.index = function(req, res, next) {
    async.parallel({
        book_count: function(callback) {
            Book.countDocuments({}, callback); // Pass an empty object as match condition to find all documents of this collection
        },
        book_instance_count: function(callback) {
            BookInstance.countDocuments({}, callback);
        },
        book_instance_available_count: function(callback) {
            BookInstance.countDocuments({status:'Available'}, callback);
        },
        author_count: function(callback) {
            Author.countDocuments({}, callback);
        },
        genre_count: function(callback) {
            Genre.countDocuments({}, callback);
        }
    }, function(err, results) {
        console.log(results)
        res.render('index', { title: `Rita's Local Library`, error: err, data: results });
    });
};

exports.book_list = [
async function(req, res, next) {


    var getRequestParams = helpers.getRequestParams(req,"title")
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

    var authorLookupStage =  {
        '$lookup': {
            'from': 'authors', 
            'localField': 'author', 
            'foreignField': '_id', 
            'as': 'authors'
          }
    } // authorLookupStage

    var allCopiesLookupStage =  {
        '$lookup': {
            'from': 'bookinstances', 
            'localField': '_id', 
            'foreignField': 'book', 
            'as': 'allCopies'
          }
    } // allCopiesLookupStage

    var availableCopiesLookupStage =  {
        '$lookup': {
            'from': 'bookinstances', 
            'let': {
              'bookID': '$_id', 
              'book_status': 'Available'
            }, 
            'pipeline': [
              {
                '$match': {
                  '$expr': {
                    '$and': [
                      {
                        '$eq': [
                          '$$bookID', '$book'
                        ]
                      }, {
                        '$eq': [
                          '$status', '$$book_status'
                        ]
                      }
                    ]
                  }
                }
              }
            ], 
            'as': 'availableCopies'
          }
    }  // availableCopiesLookupStage

    var projectStage = {
        '$project': {
            '_id': 1, 
            'title': 1, 
            'authors': 1, 
            'numberOfCopies': { '$cond': { 'if': { '$isArray': '$allCopies'}, 'then': {'$size': '$allCopies' }, 'else': 'NA'} }, 
            'numberOfAvailableCopies': { '$cond': { 'if': {'$isArray': '$availableCopies'}, 'then': {'$size': '$availableCopies' },  'else': 'NA'} }
          }
    } // projectStage

    var sortStage = {
        '$sort': 
            sortObj
      }

    var queryPipeline = []
    if (vSearchStr) {
    queryPipeline.push(matchStage)
    }
    queryPipeline.push(authorLookupStage)
    queryPipeline.push(allCopiesLookupStage)
    queryPipeline.push(availableCopiesLookupStage)
    queryPipeline.push(projectStage)
    queryPipeline.push(sortStage)

    var countingPipeline = []
    if (vSearchStr) {
      countingPipeline.push(matchStage)
    }
    countingPipeline.push(authorLookupStage)
    countingPipeline.push(allCopiesLookupStage)
    countingPipeline.push(availableCopiesLookupStage)
    countingPipeline.push(projectStage)
    countingPipeline.push(sortStage)
    countingPipeline.push({ $count: "count" })

    try {
        const list_books = await Book.aggregate(queryPipeline)
        const instanceCount = await Book.aggregate(countingPipeline)

        var itemCount = instanceCount[0]["count"]
        const pageCount = Math.ceil(itemCount / vLimit);
      
        var lower = vSkip
        var upper = vSkip + vLimit
        if (upper > itemCount ) {upper = itemCount}
        list_books_slice = list_books.slice(lower,upper)
      
        res.render('book_list', { title: 'Book List', book_list:list_books_slice, currentPage: vPage, pageCount, itemCount, itemsOnPage:vLimit, arrow:arrow, sortOrder:order, searchString:vSearchStr });
       
    } catch (err) {
        return next(err)
    }

},
]


// Display list of all books.
exports.BACKUP_book_list = [
function(req, res, next) {

    var getRequestParams = helpers.getRequestParams(req,"title")
    var order = getRequestParams.order
    var arrow = getRequestParams.arrow
    var vLimit = getRequestParams.limit
    var vPage = getRequestParams.page
    var vSkip = getRequestParams.skip
    var vSearchStr = getRequestParams.searchStr
    var vSearchQuery = getRequestParams.searchQuery
    var sortObj = getRequestParams.sortObj


    /*
    console.log("\n\nvSkip = " + vSkip)
    console.log("vLimit = " + vLimit)
    console.log("vPage = " + vPage)
    console.log("sort object = " + sortObj)
    console.log("vSearchStr = " + vSearchStr)
    console.log("\n\n")
    */

    

    Book.find(vSearchQuery, {"title":1, "author":1})
    .populate('author')
    .sort(sortObj)
    .limit(vLimit).skip(vSkip).lean()
    .exec(function (err, list_books) {
      if (err) { return next(err); }
      //Successful, so render
      Book.countDocuments(vSearchQuery, function(err, bookCount) {
        if (err) { return next(err); }
        console.log('Book Count is ' + bookCount);

        const itemCount = bookCount;
        console.log("\n\nbook_list: itemCount = " + itemCount + "; vLimit =" + vLimit)
        const pageCount = Math.ceil(itemCount / vLimit);
        res.render('BACKUP_book_list', { title: 'BACKUP Book List', book_list: list_books, currentPage: vPage, pageCount, itemCount, itemsOnPage:vLimit, arrow:arrow, sortOrder:order, searchString:vSearchStr });
        
        })
    });

    
},
]

// Display detail page for a specific book.
exports.book_detail = function(req, res, next) {
    //res.send('NOT IMPLEMENTED: Book detail: ' + req.params.id);
    async.parallel({
        book: function(callback) {

            Book.findById(req.params.id)
              .populate('author')
              .populate('genre')
              .exec(callback);
        },
        book_instance: function(callback) {
            BookInstance.find({ 'book': req.params.id })
            .exec(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.book==null) { // No results.
            var err = new Error('Book not found');
            err.status = 404;
            return next(err);
        }

        //console.log("\n\nbook_detail: book = " + results.book)
        // Successful, so render.
        res.render('book_detail', { book: results.book, book_instances: results.book_instance } );
    });




};


// Display book create form on GET.
exports.book_create_get = function(req, res, next) {
    //res.send('NOT IMPLEMENTED: Book create GET');

    async.parallel({
        authors: function(callback) {
            Author.find({}).sort( { family_name: 1, first_name:1 } )
              .exec(callback);
        },
        genres: function(callback) {
            Genre.find({}).sort({name:1})
              .exec(callback);
        },
    },


    function(err, results) {
        if (err) { return next(err); }
        let authorIDs=""
        if (req.query.authorID) { authorIDs=req.query.authorID}

        let genreIDs=""
        if (req.query.genreID) { genreIDs=req.query.genreID}
        
 
        // Successful, so render
        res.render('book_form', { title: 'Create Book', authors: results.authors, genres: results.genres, authorIDs:authorIDs, genreIDs:genreIDs } );
    });    


};




function findBook(req, res, next, book, authorIDs, genreIDs, results, titleAndAuthorQuery, isbnQuery, title, id) {
    // Data from form is valid. See if we can find a book with the selected author and same title

    // Data from form is valid. See if we can find a book with the selected author and same title
    console.log("\n\n1) In book_create_post: searching for title and author\n\n")
    console.log("\n\n1) title = " + req.body.title + "; author = " + allAuthors + "\n\n")


    //Book.findOne({ 'title': req.body.title})
    Book.findOne(titleAndAuthorQuery)
    .exec( function(err, found_titleAndAuthor) {
        if (err) { return next(err); }
        if (found_titleAndAuthor) {
            console.log("\n\nIn book_post: FOUND title and author\n\n")
            

            duplicate="titleAndAuthor"
            //duplicateID = found_titleAndAuthor._id
            duplicateBookURL = found_titleAndAuthor.url
            res.render('book_form', { title:title, authors:results.authors, genres:results.genres, book: book, authorIDs:authorIDs, genreIDs:genreIDs, sendDuplicateAlert:1, duplicate:duplicate ,duplicateBookURL:duplicateBookURL } );
        } else {

            Book.findOne(isbnQuery)
            .exec( function(err, found_isbn) {
                if (err) { return next(err); }
                if (found_isbn) {
                    duplicate="ISBN"
                    //duplicateID = found_isbn._id
                    duplicateBookURL = found_isbn.url
                    res.render('book_form', { title:title, authors:results.authors, genres:results.genres, book: book,  authorIDs:authorIDs, genreIDs:genreIDs, sendDuplicateAlert:1, duplicate:duplicate ,duplicateBookURL:duplicateBookURL } );
                }
                else {
                    if (!id) {
                        book.save(function (err) {
                            if (err) { return next(err); }
                            //successful - redirect to new book record.
                            res.redirect(book.url);
                            });
                    }  else {

                        Book.findByIdAndUpdate(req.params.id, book, {}, function (err,found_book) {
                            if (err) { return next(err); }
                                // Author saved. Redirect to Author detail page.
                                if (found_book == null) {
                
                                    delete book._id
                                    // Save the book
                                    book.save(function (err) {
                                    if (err) { return next(err); }
                                    // Book saved. Redirect to Book detail page.
                                    res.redirect(book.url);
                                  });
                                } else {
                                    res.redirect(book.url);
                                }
                                
                
                            });  // Author.findByIdAndUpdate
                
                    } 
                }
            })



        }  // else
    })  // Book.findOne({ 'title'


}




// Handle book create on POST.
exports.book_create_post = function(req, res, next) {
    // Extract the validation errors from a request.
    async.parallel({
        authors: function(callback) {
            Author.find(callback);
        },

        genres: function(callback) {
            Genre.find({}).sort({name:1})
              .exec(callback);
        },


    }, 
    function(err, results) {
        if (err) { return next(err); }
    
        const errors = validationResult(req);
    
        let authorIDs=""
        //console.log("\n\n1)  in authors post: req.body.authorIDs=" + req.body.authorIDs + "; length = " + req.body.authorIDs.length)
    
        allAuthors = req.body.authorIDs.split(",")
        //console.log("\n\n2)book_create_post:  allAuthors = " + allAuthors + "; allAuthors.length = " + allAuthors.length)
    
        let genreIDs=""
        //console.log("\n\n1)  in authors post: req.body.genreIDs=" + req.body.genreIDs + "; length = " + req.body.genreIDs.length)
    
        allGenres = req.body.genreIDs.split(",")
        //console.log("\n\n2)book_create_post:  allGenres = " + allGenres + "; allGenres.length = " + allGenres.length)
    
        
    
        // Create a Book object with escaped and trimmed data.
        var book = new Book(
        { title: req.body.title,
          author: allAuthors,
          summary: req.body.summary,
          isbn: req.body.isbn,
          genre: allGenres,
        });
    
    
        if (req.body.authorIDs) {
            authorIDs = req.body.authorIDs
        }
    
        if (req.body.genreIDs) {
            genreIDs = req.body.genreIDs
        }
    
        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/error messages.
            res.render('book_form', { title: 'Create Book',authors:results.authors, genres:results.genres, book: book, errors: errors.array(), authorIDs:authorIDs, genreIDs:genreIDs  } );
    
            // Get all authors and genres for form.
        } else {
            // Data from form is valid. See if we can find a book with the selected author and same title

            // Data from form is valid. See if we can find a book with the selected author and same title
            console.log("\n\n1) In book_create_post: searching for title and author\n\n")
            console.log("\n\n1) title = " + req.body.title + "; author = " + allAuthors + "\n\n")
    
    
            //Book.findOne({ 'title': req.body.title})
            let titleAndAuthorQuery = { 'title': req.body.title, 'author': { $in: allAuthors} }
            let isbnQuery = { 'isbn': req.body.isbn }
            findBook(req, res, next, book, authorIDs, genreIDs, results, titleAndAuthorQuery, isbnQuery, "Create Book", null )

            /*
            Book.findOne({ 'title': req.body.title, 'author': { $in: allAuthors} })
            .exec( function(err, found_titleAndAuthor) {
                if (err) { return next(err); }
                if (found_titleAndAuthor) {
                    console.log("\n\nIn book_create_post: FOUND title and author\n\n")
                    
    
                    duplicate="titleAndAuthor"
                    //duplicateID = found_titleAndAuthor._id
                    duplicateBookURL = found_titleAndAuthor.url
                    res.render('book_form', { title: 'Create Book',authors:results.authors, genres:results.genres, book: book, errors: errors.array(), authorIDs:authorIDs, genreIDs:genreIDs, sendDuplicateAlert:1, duplicate:duplicate ,duplicateBookURL:duplicateBookURL } );
                } else {
    
                    Book.findOne({ 'isbn': req.body.isbn })
                    .exec( function(err, found_isbn) {
                        if (err) { return next(err); }
                        if (found_isbn) {
                            duplicate="ISBN"
                            //duplicateID = found_isbn._id
                            duplicateBookURL = found_isbn.url
                            res.render('book_form', { title: 'Create Book',authors:results.authors, genres:results.genres, book: book, errors: errors.array(), authorIDs:authorIDs, genreIDs:genreIDs, sendDuplicateAlert:1, duplicate:duplicate ,duplicateBookURL:duplicateBookURL } );
                        }
                        else {
                            book.save(function (err) {
                                if (err) { return next(err); }
                                //successful - redirect to new book record.
                                res.redirect(book.url);
                                });
                        }
                    })
    
    
    
                }  // else
            })  // Book.findOne({ 'title'
            */





        }



    });  // function(err, results)


    };  // exports.book_create_post






// Display book delete form on GET.
exports.book_delete_get = function(req, res, next) {
    res.send('NOT IMPLEMENTED: Book delete GET');
};

// Handle book delete on POST.
exports.book_delete_post = function(req, res, next) {
    res.send('NOT IMPLEMENTED: Book delete POST');
};

// Display book update form on GET.
exports.book_update_get = function(req, res, next) {
    //res.send('NOT IMPLEMENTED: Book update GET');
   //res.send('NOT IMPLEMENTED: Author update GET');
   console.log("Edit Author: GET - Empty form\n")

    async.parallel({
        authors: function(callback) {
            Author.find(callback);
            //Author.find({}).exec(callback);  // also works
        },

        genres: function(callback) {
            Genre.find({}).sort({name:1})
            .exec(callback);
        },


    }, 
    function(err, results) {
        if (err) { return next(err); }

        Book.findById(req.params.id)
        .exec(function (err, book) {
            if (err) { 
                console.log("Edit Book: GET - could not find author by id " + req.params.id + "\n")
                return next(err); 
            }
            //Successful, so render
            if (!book) {
                res.redirect("/catalog/book/create")
            }
            res.render('book_form', { title: 'Edit  Book',authors:results.authors, genres:results.genres, book: book, authorIDs:book.author, genreIDs:book.genre  } );
            
          });
 
    });  // async.parallel

}; // exports.book_update_get 

// Handle book update on POST.
exports.book_update_post = function(req, res, next) {
    //res.send('NOT IMPLEMENTED: Book update POST');

    async.parallel({
        authors: function(callback) {
            Author.find(callback);
        },

        genres: function(callback) {
            Genre.find({}).sort({name:1})
              .exec(callback);
        },


    }, 
    function(err, results) {

        if (err) { return next(err); }
    
        const errors = validationResult(req);
    
        let authorIDs=""
        //console.log("\n\n1)  in authors post: req.body.authorIDs=" + req.body.authorIDs + "; length = " + req.body.authorIDs.length)
    
        allAuthors = req.body.authorIDs.split(",")
        //console.log("\n\n2)book_create_post:  allAuthors = " + allAuthors + "; allAuthors.length = " + allAuthors.length)
    
        let genreIDs=""
        //console.log("\n\n1)  in authors post: req.body.genreIDs=" + req.body.genreIDs + "; length = " + req.body.genreIDs.length)
    
        allGenres = req.body.genreIDs.split(",")
        //console.log("\n\n2)book_create_post:  allGenres = " + allGenres + "; allGenres.length = " + allGenres.length)
    
        
    
        // Create a Book object with escaped and trimmed data.
        var book = new Book(
        { title: req.body.title,
          author: allAuthors,
          summary: req.body.summary,
          isbn: req.body.isbn,
          genre: allGenres,
          _id:req.params.id
        });
    
    
        if (req.body.authorIDs) {
            authorIDs = req.body.authorIDs
        }
    
        if (req.body.genreIDs) {
            genreIDs = req.body.genreIDs
        }
    
        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/error messages.
            res.render('book_form', { title: 'Update Book',authors:results.authors, genres:results.genres, book: book, errors: errors.array(), authorIDs:authorIDs, genreIDs:genreIDs  } );
    
            // Get all authors and genres for form.
        } else {

            console.log("\n\n1) In book_update_post: searching for title and author\n\n")
            console.log("\n\n1) title = " + req.body.title + "; author = " + allAuthors + "\n\n")
    
    
            //Book.findOne({ 'title': req.body.title})
            let titleAndAuthorQuery = { 'title': req.body.title, 'author': { $in: allAuthors}, "_id": {$ne: req.params.id} }
            let isbnQuery = { 'isbn': req.body.isbn, "_id": {$ne: req.params.id} }
            findBook(req, res, next, book, authorIDs, genreIDs, results, titleAndAuthorQuery, isbnQuery, "Update Book", req.params.id )

        }

    }); // function(err, results) 


};  // exports.book_update_post