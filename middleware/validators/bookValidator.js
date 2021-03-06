const { body, validationResult, check, matchedData } = require("express-validator");
const { DateTime } = require("luxon");



exports.validateBookForm = [

    // Convert the genre to an array.
    (req, res, next) => {
        if(!(req.body.genre instanceof Array)){
            if(typeof req.body.genre ==='undefined')
                req.body.genre = [];
             else
                req.body.genre = new Array(req.body.genre);
        }
        next();
    },

    /*
    (req, res, next) => {
        if(!(req.body['authorIDs'] instanceof Array)){
            if(typeof req.body.authorIDs ==='undefined')
                req.body.authorIDs = [];
             else
                req.body['authorIDs'] = new Array(req.body.authorIDs);
        }
        next();
    },
    */


    // Validate and sanitise fields.
    body('title', 'Title must not be empty.').trim().isLength({ min: 1 }).escape(),

    body('title').custom((value, { req }) => {
        let vTitle = req.body.title.trim()
        var RegEx = /^[[A-Za-z0-9 ]+$/i; 
        var isValid = RegEx.test(vTitle); 
        if (!isValid) {
            console.log("\n\nauhtor validator: vTitle = " + vTitle + "\n\n")
            return Promise.reject('Title must not contain non-alphanumeric characters.');
            
        }  else  {return Promise.resolve} 
    }),


    body('authorIDs', 'Author must not be empty.').trim().isLength({ min: 1 }).escape(),
    body('summary', 'Summary must not be empty.').trim().isLength({ min: 1 }).escape(),
    body('isbn', 'ISBN must not be empty').trim().isLength({ min: 1 }).escape(),
    body('genre', 'Genre must not be empty.').trim().isLength({ min: 1 }).escape(),
    body('genre.*').escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {
        //console.log(JSON.stringify(req, null,2))
        //console.log("\n\n1) book validator: authorIDs=" + req.body.authorIDs)
        
        console.log("\n\n1) book validator: genre=" + req.body.genre )
        console.log("\n1)book validator: is genre an array? (see next line)")
        if (req.body.genre instanceof Array) {console.log("YES, genre is an array")}
        else {console.log("NO, genre is NOT an array")}
        console.log("\n1)book validator: is genre an array? " + req.body.genre instanceof Array)
        
        const errors = validationResult(req);
        next();
    
        }


]