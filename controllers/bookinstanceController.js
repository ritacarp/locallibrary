// bookinstanceController.js
var BookInstance = require("../models/bookinstance");
var Book = require("../models/book");
var mongoose = require("mongoose");
const helpers = require("../controllers/helpers/helpers");
const {
  body,
  validationResult,
  check,
  matchedData,
  params,
} = require("express-validator");

exports.bookinstance_list = async function (req, res, next) {
  var getRequestParams = helpers.getRequestParams(req, "bookTitle");
  var order = getRequestParams.order;
  var arrow = getRequestParams.arrow;
  var vLimit = getRequestParams.limit;
  var vPage = getRequestParams.page;
  var vSkip = getRequestParams.skip;
  var vSearchStr = getRequestParams.searchStr;
  var vSearchQuery = getRequestParams.searchQuery;
  var sortObj = getRequestParams.sortObj;

  var lookupStage = {
    $lookup: {
      from: "books",
      localField: "book",
      foreignField: "_id",
      as: "book",
    },
  }; // lookupStage

  var projectStage = {
    $project: {
      status: 1,
      due_back: 1,
      due_back_formatted: "$due_back",
      bookID: {
        $arrayElemAt: ["$book._id", 0],
      },
      bookTitle: {
        $arrayElemAt: ["$book.title", 0],
      },
      bookAuthors: {
        $arrayElemAt: ["$book.author", 0],
      },
    },
  }; // projectStage

  var authorLookupStage = {
    $lookup: {
      from: "authors",
      localField: "bookAuthors",
      foreignField: "_id",
      as: "author",
    },
  };

  var matchStage;
  if (vSearchStr) {
    matchStage = {
      $match: vSearchQuery,
    };
  }

  var sortStage = {
    $sort: sortObj,
  };

  var skipStage = { $skip: vSkip };

  var limitStage = { $limit: vLimit };

  var queryPipeline = [];
  queryPipeline.push(lookupStage);
  queryPipeline.push(projectStage);
  queryPipeline.push(authorLookupStage);

  if (vSearchStr) {
    queryPipeline.push(matchStage);
  }

  queryPipeline.push(sortStage);
  //queryPipeline.push(skipStage)
  //queryPipeline.push(limitStage)

  //var countingPipeline = [lookupStage, projectStage, authorLookupStage, sortStage, matchStage, skipStage, { $count: "count" }]
  var countingPipeline = [];
  countingPipeline.push(lookupStage);
  countingPipeline.push(projectStage);
  countingPipeline.push(authorLookupStage);

  if (vSearchStr) {
    countingPipeline.push(matchStage);
  }

  countingPipeline.push(sortStage);
  //countingPipeline.push(skipStage)
  //countingPipeline.push(limitStage)

  countingPipeline.push({ $count: "count" });

  let itemCount = 0;
  let pageCount = 0;

  try {
    //const instances = await (await Bookinstance.aggregate(queryPipeline)).next()
    //const count = await (await Bookinstance.aggregate(countingPipeline)).next()

    const list_instances = await BookInstance.aggregate(queryPipeline);
    const instanceCount = await BookInstance.aggregate(countingPipeline);

    try {
      itemCount = instanceCount[0]["count"];

      //console.log('Book Copy instanceCount is ' + JSON.stringify(instanceCount));
      //console.log('1)Book Copy Count is ' + instanceCount[0]["count"]);

      pageCount = Math.ceil(itemCount / vLimit);
    } catch (err) {
      itemCount = 0;
      pageCount = 0;
    }

    /*
        console.log( "\n\n")
        console.log('Book Copy Count is ' + itemCount);
        console.log("list_instances.length = " + list_instances.length)
        console.log("pageCount = " + pageCount)
        console.log( "\n\n")
        */

    // I have to return a slice because of the way aggregation works
    // The slice is from skip to (skip + limit)
    var lower = vSkip;
    var upper = vSkip + vLimit;
    if (upper > itemCount) {
      upper = itemCount;
    }
    list_instances_slice = list_instances.slice(lower, upper);

    /*
        console.log( "\n\n")
        for (let i=0; i < list_instances.length; i++) {
            console.log("Book Instance ID = " + list_instances[i]._id)
            console.log("Book ID = " + list_instances[i].bookID)
            console.log("The Book Title is: " + list_instances[i].bookTitle)
            console.log("Author = " + list_instances[i].author)
            console.log("Author Lenght = " + list_instances[i].author.length)
        }
        console.log("\n\n")
        */

    res.render("bookinstance_list", {
      title: "Book Copy List",
      instances: list_instances_slice,
      luxon: require("luxon"),
      currentPage: vPage,
      pageCount,
      itemCount,
      itemsOnPage: vLimit,
      arrow: arrow,
      sortOrder: order,
      searchString: vSearchStr,
    });

    /*
        return {
          ...results,
          ...count,
        }
        */
  } catch (err) {
    return next(err);
  }

  /*
    //let docs =  Bookinstance.aggregate([
        Bookinstance.aggregate([
        {
          '$lookup': {
            'from': 'books', 
            'localField': 'book', 
            'foreignField': '_id', 
            'as': 'book'
          }
        }, {
          '$project': {
            'bookID': {
              '$arrayElemAt': [
                '$book._id', 0
              ]
            }, 
            'bookTitle': {
              '$arrayElemAt': [
                '$book.title', 0
              ]
            }, 
            'bookAuthors': {
              '$arrayElemAt': [
                '$book.author', 0
              ]
            }
          }
        },  {
          '$lookup': {
            'from': 'authors', 
            'localField': 'bookAuthors', 
            'foreignField': '_id', 
            'as': 'author'
          }
        }, {
          '$sort': {
            'author.family_name': -1
          }
        }
      ],
            function (err, instances) {
        if (err) { return next(err); }

        console.log("\n\n\ninstances = " + instances); // [ { maxBalance: 98000 } ]
        console.log("instances.length = " + instances.length)
        
        console.log( "\n\n")
      for (let i=0; i < instances.length; i++) {
        //console.log("Book Instance ID = " + instances[i]._id)
        //console.log("Book ID = " + instances[i].bookID)
        
        console.log("The Book Title is: " + instances[i].bookTitle)

        //console.log("Author = " + instances[i].author)
        //console.log("Author Lenght = " + instances[i].author.length)

      }
      console.log("\n\n")
      res.end(instances.length + " OK")
      })
      */

  //docs.sort((d1, d2) => d1.bookTitle - d2.bookTitle);
};

// Display list of all BookInstances.
// Display list of all Authors.
exports.BACKUP_bookinstance_list = function (req, res, next) {
  // res.send('NOT IMPLEMENTED: BookInstances  list');

  BookInstance.find({})
    .populate({
      path: "book",
      populate: [
        {
          path: "author", // in blogs, populate comments
        },
      ],
    })
    .lean()
    .exec(function (err, list_instances) {
      if (err) {
        return next(err);
      }
      //Successful, so render
      console.log("Book Instance List:" + list_instances);
      res.render("BACKUP_bookinstance_list", {
        title: "BACKUP Book Copy List",
        instances: list_instances,
      });
    });
};

// Display detail page for a Book Instances.
exports.bookinstance_detail = function (req, res) {
  //res.send('NOT IMPLEMENTED: BookInstance detail: ' + req.params.id);

  BookInstance.findById(req.params.id)
    .populate("book")
    .exec(function (err, bookinstance) {
      if (err) {
        return next(err);
      }
      //Successful, so render
      res.render("bookinstance_detail", { instance: bookinstance });
    });
};

// Display BookInstance create form on GET.
exports.bookinstance_create_get = function (req, res, next) {
  //res.send('NOT IMPLEMENTED: BookInstance create GET');

  Book.findById(req.params.bookID).exec(function (err, book) {
    if (err) {
      console.log(
        "bookinstance_create_get: GET - could not find book by by id " +
          req.params.bookid +
          "\n"
      );
      return next(err);
    }
    //Successful, so render
    if (!book) {
      res.redirect("/catalog/book/create");
    }

    var model = new mongoose.model("BookInstance")();
    statusEnums = model.schema.path("status").enumValues;
    defautStatus = model.schema.path("status").defaultValue;
    console.log("status enums = " + statusEnums + " default = " + defautStatus);

    thisStatus = defautStatus;

    bookinstance = null;
    res.render("bookinstance_form", {
      title: "Create Book Copy",
      bookinstance: bookinstance,
      book: book,
      statusEnums: statusEnums,
      thisStatus: thisStatus,
    });
  });
};

// Handle BookInstance create on POST.
exports.bookinstance_create_post = function (req, res) {
  //res.send('NOT IMPLEMENTED: BookInstance create POST');

  Book.findById(req.params.bookID).exec(function (err, book) {
    if (err) {
      console.log(
        "bookinstance_create_get: GET - could not find book by by id " +
          req.params.bookid +
          "\n"
      );
      return next(err);
    }
    //Successful, so render
    /*
        if (!book) {
            res.redirect("/catalog/book/create")
        }
        */

    var model = new mongoose.model("BookInstance")();
    statusEnums = model.schema.path("status").enumValues;
    defautStatus = model.schema.path("status").defaultValue;
    console.log("status enums = " + statusEnums + " default = " + defautStatus);

    thisStatus = defautStatus;
    if (req.body.status) thisStatus = req.body.status;
    bookinstance = null;

    var bookinstance = new BookInstance({
      book: req.params.bookID,
      imprint: req.body.imprint,
      status: req.body.status,
      due_back: req.body.due_back,
    });

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.
      //res.render('book_form', { title: 'Create Book',authors:results.authors, genres:results.genres, book: book, errors: errors.array(), authorIDs:authorIDs, genreIDs:genreIDs  } );
      res.render("bookinstance_form", {
        title: "Create Book Copy",
        bookinstance: bookinstance,
        book: book,
        errors: errors.array(),
        statusEnums: statusEnums,
        thisStatus: thisStatus,
      });
    } else {
      console.log("\n\nthere were no errors the book Instance:");
      console.log(JSON.stringify(bookinstance));
      bookinstance.save(function (err) {
        if (err) {
          return next(err);
        }
        // Author saved. Redirect to Author detail page.
        res.redirect(bookinstance.url);
      });
    }
  });
};

// Display BookInstance update form on GET.
exports.bookinstance_update_get = function (req, res, next) {
  //res.send('NOT IMPLEMENTED: BookInstance update GET');
  BookInstance.findById(req.params.id).exec(function (err, bookinstance) {
    if (err) {
      console.log(
        "Edit Book Instance: GET - could not find book instance by id " +
          req.params.id +
          "\n"
      );
      return next(err);
    }
    //Successful, so render
    if (!bookinstance) {
      res.redirect("catalog/books");
    } else {
      var model = new mongoose.model("BookInstance")();
      statusEnums = model.schema.path("status").enumValues;
      defautStatus = model.schema.path("status").defaultValue;
      console.log(
        "status enums = " + statusEnums + " default = " + defautStatus
      );

      thisStatus = bookinstance.status;
      if (!thisStatus) {
        thisStatus = defautStatus;
      }

      var bookID = bookinstance.book;

      Book.findById(bookID).exec(function (err, book) {
        if (err) {
          console.log(
            "bookinstance_update_get: UPDATE GET - could not find book by by id " +
              bookID +
              "\n"
          );
          return next(err);
        }
        //Successful, so render
        if (!book) {
          res.redirect("/catalog/book/create");
        } else {
          res.render("bookinstance_form", {
            title: "Update Book Copy",
            bookinstance: bookinstance,
            book: book,
            statusEnums: statusEnums,
            thisStatus: thisStatus,
          });
        }
      });
    }
  });
};

// Handle bookinstance update on POST.
exports.bookinstance_update_post = function (req, res, next) {
  //res.send('NOT IMPLEMENTED: BookInstance update POST');

  var bookinstance = new BookInstance({
    book: req.body.bookID,
    imprint: req.body.imprint,
    status: req.body.status,
    due_back: req.body.due_back,
    _id: req.params.id,
  });

  Book.findById(req.body.bookID).exec(function (err, book) {
    if (err) {
      console.log(
        "bookinstance_update_Post: POST - could not find book by by id " +
          req.params.bookid +
          "\n"
      );
      return next(err);
    }

    console.log(
      "1) in book instance UPDATE POST - the book is " + JSON.stringify(book)
    );

    var model = new mongoose.model("BookInstance")();
    statusEnums = model.schema.path("status").enumValues;
    defautStatus = model.schema.path("status").defaultValue;

    var thisStatus = defautStatus;
    if (req.body.status) thisStatus = req.body.status;

    const errors = validationResult(req);

    console.log("\n\nin book instance UPDATE POST - back from validating");

    if (!errors.isEmpty()) {
      console.log(
        "\n\nin book instance UPDATE POST - validation errors, redireting to book instance form"
      );
      console.log(
        "2) in book instance UPDATE POST - the book is " + JSON.stringify(book)
      );
      res.render("bookinstance_form", {
        title: "Update Book Copy",
        bookinstance: bookinstance,
        book: book,
        errors: errors.array(),
        statusEnums: statusEnums,
        thisStatus: thisStatus,
      });
    } else {
      BookInstance.findByIdAndUpdate(
        req.params.id,
        bookinstance,
        {},
        function (err, updatedInstance) {
          if (err) {
            return next(err);
          }
          res.redirect(updatedInstance.url);
        }
      );
    }
  });
};

// Display BookInstance delete form on GET.
exports.bookinstance_delete_get = function (req, res) {
  res.send("NOT IMPLEMENTED: BookInstance delete GET");
};

// Handle BookInstance delete on POST.
exports.bookinstance_delete_post = function (req, res, next) {
  res.send("NOT IMPLEMENTED: BookInstance delete POST");
};
