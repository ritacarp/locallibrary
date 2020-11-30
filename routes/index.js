var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  //res.render('index', { title: 'My First Express Page' });
  res.redirect('/catalog');
});

module.exports = router;
