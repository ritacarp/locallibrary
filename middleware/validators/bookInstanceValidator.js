const { body,validationResult,check, matchedData } = require("express-validator");
const { DateTime } = require("luxon");

exports.validateBookInstanceForm = [
    body('status').trim().isLength({ min: 1 }).escape().withMessage('Status must be specified.'),

    body('imprint').custom((value, { req }) => {
        let vImprint = req.body.imprint.trim()
        if (vImprint.length < 1) {
            console.log("Imprint must not be blank.")
            return Promise.reject('Imprint must not be blank.');
        } else {
            var RegEx = /^[[A-Za-z0-9 ,. &()]+$/i; 
            var isValid = RegEx.test(vImprint); 
            if (!isValid) {
                console.log("\n\nbook instance validator: vImprint = " + vImprint + "\n\n")
                return Promise.reject('Imprint must not contain non-alphanumeric characters.');
                
            }  else  {return Promise.resolve} 
        }

    }),

    body('due_date').custom((value, { req }) => {
        var mm
        var dd
        var yyyy

        let vStatus = req.body.status.trim()
        let vSourceDate =  req.body.due_back
        //if (vSourceDate) vSourceDate.trim()
        console.log("\n\nbook instance validator: Due Back Date = " + vSourceDate + "; Status = " + vStatus)
        if (vStatus == "Available") {
            return Promise.resolve
        }
        else {
            if (! vSourceDate) {
                console.log("\nbook instance validator:  The due back date is required for status " + vStatus)
                return Promise.reject('The due back date is required for status ' + vStatus)
            }
            else {  
                try {
                    var vDateArray = vSourceDate.split("/");
                    mm = vDateArray[0].padStart(2, '0'); //January is 0!
                    dd = vDateArray[1].padStart(2, '0'); //January is 0!
                    yyyy = vDateArray[2]
                    var dueBackDateISODate = yyyy + "-" + mm + '-' + dd ;
                    
                    var today = new Date();
                    dd = String(today.getDate()).padStart(2, '0');
                    mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
                    yyyy = today.getFullYear();
                    todayISODate = yyyy + "-" + mm + '-' + dd ;

                    if ( dueBackDateISODate > todayISODate) {
                        return Promise.resolve
                    } else {
                        return Promise.reject('Invalid Due Back Date ' + vSourceDate + "; Due Back Date must be in the future")
                    }
                } catch(err) {
                    //dateOfBirth=null
                    console.log("\nbook instance validator: BOO The due back date is not a  valid date " + vSourceDate + "\n")
                    return Promise.reject('Invalid Due Back Date ' + vSourceDate)
                }
            }
        }
    }),

    (req, res, next) => {

        const errors = validationResult(req);
        /*
        if (!errors.isEmpty())
            return res.status(422).json({errors: errors.array()});
        next();
        */
        console.log("\nbookInstanceValidator.validateAuthor completed\n")
        next();

    }

]