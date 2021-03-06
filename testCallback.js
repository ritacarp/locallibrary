var async = require('async');

function done(error, val){ console.log("done: the returned value is " + val)}

async.parallel([
    function(callbackOne) {
        setTimeout(function() {
            callbackOne(null, 'one');
        }, 200);
    },
    function(callbackTwo) {
        setTimeout(function() {
            callbackTwo(null, 'two');
        }, 100);
    }
],

// optional callback
/*
function(err, results) {
    // the results array will equal ['one','two'] even though
    // the second function had a shorter timeout.
    console.log(results)
}
*/

/*
someFunction(null)
);
*/

/*
function done(err, results) {
        if (err) {
            throw err;
        }
        console.log("done !! " + results)
    });
*/

function(err, results) {
 done(err,results) }
);




// an example using an object instead of an array
async.parallel({
    one: function(oneCallback) {
        setTimeout(function() {
            oneCallback(null, 1);
        }, 200);
    },
    two: function(twoCallback) {
        setTimeout(function() {
            twoCallback(null, 2);
        }, 100);
    }
}, function(err, results) {
    // results is now equals to: {one: 1, two: 2}
    console.log(results)
});

