
const { body,validationResult,check, matchedData } = require("express-validator");
const { DateTime } = require("luxon");



exports.validateAuthorForm = [
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
                var RegEx = /^[[A-Za-z0-9 ]+$/i; 
                var isValid = RegEx.test(vName); 
                if (!isValid) {
                    console.log("\n\nauhtor validator: vName = " + vName + "\n\n")
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
        /*
        if (!errors.isEmpty())
            return res.status(422).json({errors: errors.array()});
        next();
        */
        console.log("\nauthorValidator.validateAuthor completed\n")
        next();

    }
]

//module.exports = validateAuthor;