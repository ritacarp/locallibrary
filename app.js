var createError = require('http-errors');
const express = require('express');
const paginate = require('express-paginate');
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


const app = express();
app.locals.moment = require('moment');

const port = process.env.PORT
const nodeEnv = process.env.NODE_ENV
const libraryConnectString = process.env.LIBRARY_DB_URI


//Set up mongoose connection
var mongoose = require('mongoose');
var mongoDB = process.env.LIBRARY_DB_URI
mongoose.connect(mongoDB, { useNewUrlParser: true , useUnifiedTopology: true, useFindAndModify: false, useCreateIndex:true});
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


//app.use('/catalog/books', paginate.middleware(5, 50));

app.use('/catalog/books', function (req, res, next) {
  console.log('\n\nRequest Type: ' +  req.method + "; url =  " + req.url + "\n\n")
  next()
})

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/wiki', wikiRouter);
app.use('/catalog', catalogRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  console.log("in error handler, creating a 404")
  if (process.env.NODE_ENV === 'development') 
    next(createError(404));
  else {
    res.statusCode = 404;
    res.setHeader('Content-Type', 'text/html');
    res.render('resourceNotFound')
  }
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  console.log("In app.use, env = " + req.app.get('env'))
  res.locals.message = err.message;
  //res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.locals.error = process.env.NODE_ENV === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
