// authorController.js
var Author = require("../models/author");
var Book = require("../models/book");
var async = require("async");
var helpers = require("../controllers/helpers/helpers");
const {
  body,
  validationResult,
  check,
  matchedData,
} = require("express-validator");
const { DateTime } = require("luxon");

exports.author_list = async function (req, res, next) {
  var getRequestParams = helpers.getRequestParams(req, "family_name");
  var order = getRequestParams.order;
  var arrow = getRequestParams.arrow;
  var vLimit = getRequestParams.limit;
  var vPage = getRequestParams.page;
  var vSkip = getRequestParams.skip;
  var vSearchStr = getRequestParams.searchStr;
  var vSearchQuery = getRequestParams.searchQuery;
  var sortObj = getRequestParams.sortObj;

  var matchStage;
  if (vSearchStr) {
    matchStage = {
      $match: vSearchQuery,
    };
  }

  var bookLookupStage = {
    $lookup: {
      from: "books",
      localField: "_id",
      foreignField: "author",
      as: "books",
    },
  };

  var allCopiesLookupStage = {
    $lookup: {
      from: "bookinstances",
      localField: "books._id",
      foreignField: "book",
      as: "allCopies",
    },
  };

  var availableCopiesLookupStage = {
    $lookup: {
      from: "bookinstances",
      let: {
        book: "$books",
        book_status: "Available",
      },
      pipeline: [
        {
          $match: {
            $expr: {
              $and: [
                { $in: ["$book", "$$book._id"] },
                { $eq: ["$status", "$$book_status"] },
                //{ $regexFind: { input: "$status", regex: /available/i }  }
              ],
            },
          },
        },
      ],
      as: "availableCopies",
    },
  };

  var projectStage = {
    $project: {
      _id: 1,
      first_name: 1,
      family_name: 1,
      numberOfBooks: {
        $cond: {
          if: { $isArray: "$books" },
          then: { $size: "$books" },
          else: "NA",
        },
      },
      numberOfCopies: {
        $cond: {
          if: { $isArray: "$allCopies" },
          then: { $size: "$allCopies" },
          else: "NA",
        },
      },
      numberOfAvailableCopies: {
        $cond: {
          if: { $isArray: "$availableCopies" },
          then: { $size: "$availableCopies" },
          else: "NA",
        },
      },
    },
  }; // projectStage

  var sortStage = {
    $sort: sortObj,
  };

  var queryPipeline = [];
  if (vSearchStr) {
    queryPipeline.push(matchStage);
  }
  queryPipeline.push(bookLookupStage);
  queryPipeline.push(allCopiesLookupStage);
  queryPipeline.push(availableCopiesLookupStage);
  queryPipeline.push(projectStage);
  queryPipeline.push(sortStage);

  var countingPipeline = [];
  if (vSearchStr) {
    countingPipeline.push(matchStage);
  }
  countingPipeline.push(bookLookupStage);
  countingPipeline.push(allCopiesLookupStage);
  countingPipeline.push(availableCopiesLookupStage);
  countingPipeline.push(projectStage);
  countingPipeline.push(sortStage);
  countingPipeline.push({ $count: "count" });

  let itemCount = 0;
  let pageCount = 0;

  try {
    const list_authors = await Author.aggregate(queryPipeline);
    const instanceCount = await Author.aggregate(countingPipeline);

    try {
      itemCount = instanceCount[0]["count"];
      pageCount = Math.ceil(itemCount / vLimit);
    } catch (err) {
      itemCount = 0;
      pageCount = 0;
    }

    var lower = vSkip;
    var upper = vSkip + vLimit;
    if (upper > itemCount) {
      upper = itemCount;
    }
    list_authors_slice = list_authors.slice(lower, upper);

    res.render("author_list", {
      title: "Author List",
      author_list: list_authors_slice,
      currentPage: vPage,
      pageCount,
      itemCount,
      itemsOnPage: vLimit,
      arrow: arrow,
      sortOrder: order,
      searchString: vSearchStr,
    });
  } catch (err) {
    return next(err);
  }
};

// Display list of all Authors.
exports.BACKUP_author_list = function (req, res, next) {
  var getRequestParams = helpers.getRequestParams(req, "family_name");
  var order = getRequestParams.order;
  var arrow = getRequestParams.arrow;
  var vLimit = getRequestParams.limit;
  var vPage = getRequestParams.page;
  var vSkip = getRequestParams.skip;
  var vSearchStr = getRequestParams.searchStr;
  var vSearchQuery = getRequestParams.searchQuery;
  var sortObj = getRequestParams.sortObj;

  /*
    console.log("\n\nvSkip = " + vSkip)
    console.log("vLimit = " + vLimit)
    console.log("vPage = " + vPage)
    console.log("sort object = " + sortObj)
    console.log("vSearchStr = " + vSearchStr)
    console.log("\n\n")
    */

  Author.find(vSearchQuery, {})
    .sort(sortObj)
    .limit(vLimit)
    .skip(vSkip)
    .exec(function (err, list_authors) {
      if (err) {
        return next(err);
      }
      //Successful, so render
      Author.countDocuments(vSearchQuery, function (err, authorCount) {
        if (err) {
          return next(err);
        }
        console.log("Author Count is " + authorCount);

        const itemCount = authorCount;
        console.log(
          "\n\nbook_list: itemCount = " + itemCount + "; vLimit =" + vLimit
        );
        const pageCount = Math.ceil(itemCount / vLimit);

        res.render("BACKUP_author_list", {
          title: "Backup Author List",
          author_list: list_authors,
          currentPage: vPage,
          pageCount,
          itemCount,
          itemsOnPage: vLimit,
          arrow: arrow,
          sortOrder: order,
          searchString: vSearchStr,
        });
      });
    });
};

// Display detail page for a specific Author.
exports.author_detail = function (req, res, next) {
  //res.send('NOT IMPLEMENTED: Author detail: ' + req.params.id);
  async.parallel(
    {
      author: function (callback) {
        Author.findById(req.params.id).exec(callback);
      },
      author_books: function (callback) {
        Book.find({ author: req.params.id }).exec(callback);
      },
    },

    function (err, results) {
      if (err) {
        return next(err);
      }
      if (results.author == null) {
        // No results.
        //var err = new Error('Author not found');
        //err.status = 404;
        return next(err);
      }

      // Successful, so render
      res.render("author_detail", {
        author: results.author,
        author_books: results.author_books,
      });
    }
  );
};

// Display Author create form on GET.
exports.author_create_get = function (req, res, next) {
  //res.send('NOT IMPLEMENTED: Author create GET');

  let sendDuplicateAlert = 0;
  let mode = "c";
  if (req.params.sendDuplicateAlert) {
    console.log(
      "\n\nCreate New Author: GET - Empty form SEND DUPLICATE ALERT\n"
    );
    sendDuplicateAlert = 1;
  } else {
    console.log(
      "\n\nCreate New Author: GET - Empty form THIS IS THE FIRT TIME ROUND\n"
    );
    createDupe = 0;
    sendDuplicateAlert = 0;
  }

  res.render("author_form", {
    title: "Create Author",
    createDupe: createDupe,
    sendDuplicateAlert: sendDuplicateAlert,
    mode: mode,
  });
};

// Handle Author create on POST.
exports.author_create_post = function (req, res, next) {
  const errors = validationResult(req);

  // Create a author object with escaped and trimmed data.

  let author = new Author({
    first_name: req.body.first_name,
    family_name: req.body.family_name,
    date_of_birth: req.body.date_of_birth,
    date_of_death: req.body.date_of_death,
  });
  let query = "";
  let queryType = "";

  if (errors.isEmpty()) {
    console.log("THERE ARE NO ERRORS");

    // Check if the author already exists

    if (req.body._id) {
      query = { _id: req.body._id };
      queryType = "id";
    } else {
      query = {
        first_name: req.body.first_name,
        family_name: req.body.family_name,
      };
      queryType = "name";
    }

    let createDupe = 0;
    if (req.body.createDupe == 0) {
      createDupe = 0;
    } else {
      createDupe = 1;
      queryType = "name";
      console.log(
        "\n\nCREATE AUTHOR: create duplicate ! switching to query type = " +
          queryType +
          "\n\n"
      );
    }

    console.log(
      "createDupe = " + createDupe + "; query = " + JSON.stringify(query)
    );

    //Author.findOne({ 'first_name': req.body.first_name, 'family_name':  req.body.family_name })
    Author.findOne(query).exec(function (err, found_author) {
      if (err) {
        return next(err);
      }

      if (found_author) {
        if (queryType == "id") {
          // Here for _id queries
          console.log("FOUND AUTHOR BY ID");
          author._id = found_author._id;
          Author.findByIdAndUpdate(
            found_author._id,
            author,
            {},
            function (err) {
              if (err) {
                return next(err);
              }
              // Author saved. Redirect to Author detail page.
              res.redirect(author.url);
            }
          );
        } else {
          // Here for name queries
          console.log("FOUND AUTHOR BY NAME");
          if (createDupe == 0) {
            // Go back to create page with a warning that author with same name exists
            author._id = found_author._id;
            res.render("author_form", {
              title: "Create Author",
              author: author,
              errors: errors.array(),
              sendDuplicateAlert: 1,
              mode: "c",
            });
          } else {
            //Name was found, but create duplicate author anyway
            author.save(function (err) {
              if (err) {
                return next(err);
              }
              // Author saved. Redirect to Author detail page.
              res.redirect(author.url);
            });
          }
        }
      } else {
        // Save the author, because it was not found
        console.log(
          "The author was not found!!  query = " + JSON.stringify(query)
        );
        author.save(function (err) {
          if (err) {
            return next(err);
          }
          // Author saved. Redirect to Author detail page.
          res.redirect(author.url);
        });
      }
    });
  } else {
    for (let i = 0; i < errors.array().length; i++) {
      console.log(
        "\nError Field: " +
          errors.array()[i].param +
          " Error value: " +
          errors.array()[i].value +
          "\n"
      );
      author[errors.array()[i].param] = errors.array()[i].value;
    }

    console.log("Author Form - THERE ARE ERRORS");
    createDupe = 0;
    sendDuplicateAlert = 0;
    res.render("author_form", {
      title: "Create Author",
      author: author,
      createDupe: createDupe,
      sendDuplicateAlert: sendDuplicateAlert,
      mode: "c",
      errors: errors.array(),
    });
    //return
  }
};

// Display Author delete form on GET.
exports.author_delete_get = function (req, res, next) {
  res.send("NOT IMPLEMENTED: Author delete GET");
};

// Handle Author delete on POST.
exports.author_delete_post = function (req, res, next) {
  res.send("NOT IMPLEMENTED: Author delete POST");
};

// Handle Author edit.
exports.author_update_get = function (req, res, next) {
  //res.send('NOT IMPLEMENTED: Author update GET');
  console.log("Edit Author: GET - Empty form\n");

  Author.findById(req.params.id).exec(function (err, author) {
    if (err) {
      console.log(
        "Edit Author: GET - could not find author by id " + req.params.id + "\n"
      );
      return next(err);
    }
    //Successful, so render
    if (!author) {
      res.redirect("/catalog/author/create");
    }
    res.render("author_form", {
      title: "Edit Author",
      author: author,
      sendDuplicateAlert: 0,
      mode: "u",
    });
  });
};

// Handle Author update on POST.
exports.author_update_post = function (req, res, next) {
  let author = null;

  const errors = validationResult(req);

  author = new Author({
    first_name: req.body.first_name,
    family_name: req.body.family_name,
    date_of_birth: req.body.date_of_birth,
    date_of_death: req.body.date_of_death,
    _id: req.params.id,
  });

  if (!errors.isEmpty()) {
    res.render("author_form", {
      title: "Edit Author",
      author: author,
      mode: "u",
      errors: errors.array(),
    });
  } else {
    Author.findByIdAndUpdate(
      req.params.id,
      author,
      {},
      function (err, found_author) {
        if (err) {
          return next(err);
        }
        // Author saved. Redirect to Author detail page.
        if (found_author == null) {
          //res.render('author_form', { title: 'Create Author', author:author });
          delete author._id;
          // Save the author
          author.save(function (err) {
            if (err) {
              return next(err);
            }
            // Author saved. Redirect to Author detail page.
            res.redirect(author.url);
          });
        } else {
          res.redirect(author.url);
        }
      }
    ); // Author.findByIdAndUpdate
  } // if (!errors.isEmpty())  (else)
}; // exports.author_update_post
