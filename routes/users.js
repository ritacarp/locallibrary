var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/profile', function(req, res, next) {
  res.send('Rita:  This is the profile route');
});

router.get('/cool', function(req, res, next) {
  res.send("You're so cool");
});

router.get('/:userId/books/:bookId', function (req, res) {
  // Access userId via: req.params.userId
  // Access bookId via: req.params.bookId
  response = "<b>User ID:  </b>" + req.params.userId + "<br><b>Book ID:  </b>" + req.params.bookId + "<br><br>"
  //res.send(req.params);
  res.send(response);
})

module.exports = router;
