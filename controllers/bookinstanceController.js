// bookinstanceController.js
var Bookinstance = require("../models/bookinstance")

// Display list of all BookInstances.
// Display list of all Authors.
exports.bookinstance_list = function(req, res) {
    // res.send('NOT IMPLEMENTED: BookInstances  list');
    Bookinstance.find({})
    .populate(
    {
        path: "book", // populate blogs
        populate: {
           path: "author" // in blogs, populate comments
        }
     }
    )
    .exec(function (err, list_instances) {
        if (err) { return next(err); }
        //Successful, so render
        console.log("Book Instance List:" + list_instances)
        res.render('bookinstance_list', { title: 'Book Instance List',instances: list_instances });
      });
}

// Display detail page for a Book Instances.
exports.bookinstance_detail =  function(req, res) {
    //res.send('NOT IMPLEMENTED: BookInstance detail: ' + req.params.id);
    
    Bookinstance.findById(req.params.id)
    .populate('book')
    .exec(function (err, aBookinstance) {
        if (err) { return next(err); }
        //Successful, so render
        res.render('bookinstance_detail', { instance: aBookinstance } );
      });
}

// Display BookInstance create form on GET.
exports.bookinstance_create_get = function(req, res) {
    res.send('NOT IMPLEMENTED: BookInstance create GET');
};

// Handle BookInstance create on POST.
exports.bookinstance_create_post = function(req, res) {
    res.send('NOT IMPLEMENTED: BookInstance create POST');
};

// Display BookInstance delete form on GET.
exports.bookinstance_delete_get = function(req, res) {
    res.send('NOT IMPLEMENTED: BookInstance delete GET');
};

// Handle BookInstance delete on POST.
exports.bookinstance_delete_post = function(req, res) {
    res.send('NOT IMPLEMENTED: BookInstance delete POST');
};

// Display BookInstance update form on GET.
exports.bookinstance_update_get = function(req, res) {
    res.send('NOT IMPLEMENTED: BookInstance update GET');
};

// Handle bookinstance update on POST.
exports.bookinstance_update_post = function(req, res) {
    res.send('NOT IMPLEMENTED: BookInstance update POST');
};
