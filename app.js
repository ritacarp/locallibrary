var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
//var bodyParser = require("body-parser")
var logger = require('morgan');

logger.token('host', function(req, res) {
    return req.hostname;
});
logger(':method :host :status :res[content-length] - :response-time ms');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var wikiRouter = require('./routes/wiki.js');
var catalogRouter = require('./routes/catalog');  //Import routes for "catalog" area of site


var app = express();
app.locals.moment = require('moment');

//Set up mongoose connection
var mongoose = require('mongoose');
var mongoDB = 'mongodb+srv://m001-student:m001-mongodb-basics@sandbox.pagxe.mongodb.net/local_library?retryWrites=true&w=majority';
mongoose.connect(mongoDB, { useNewUrlParser: true , useUnifiedTopology: true});
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

//app.use(logger('dev'));
app.use(logger('method=:method; host=:host; url=:url; status=:status; content-length=:res[content-length]; response-time=:response-time ms'))
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
//app.use(bodyParser.json())
//app.use(bodyParser.urlencoded({extended:true}))

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/wiki', wikiRouter);
app.use('/catalog', catalogRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  console.log("in error handler, creating a 404")
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  console.log("In app.use, env = " + req.app.get('env'))
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
