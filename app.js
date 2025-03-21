require('dotenv').config();
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const mongoose = require("mongoose");
const passport = require("passport");
require("./config/passport")(passport);
const session =require("express-session");
const MongoStore = require("connect-mongo"); //to store session 
const flash = require("connect-flash");
//import routes 
const routes = require("./routes/index");
var usersRouter = require('./routes/users');

//import model
const User = require("./models/User");

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//database connection 
mongoose.connect(process.env.MONGO_CONNECTION_URL);
  
// Connection event handlers
const connection = mongoose.connection;
connection.once('open', () => {
  console.log("Database connected");
}).on('error', err => {
  console.log("Connection failed:", err);
});

// Session Middleware
app.use(
  session({
    secret: "yourSecretKey", // Change this to a strong secret
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_CONNECTION_URL, // Use your MongoDB connection
      collectionName: "sessions",
    }),
    cookie: { maxAge: 1000 * 60 * 60 * 24 * 2 }, // 2 day
  })
);
// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//event status update
const updateEventStatus = require("./utils/eventStatusUpdater");
updateEventStatus();

app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.user = req.user || null;
  next();
});

app.use('/', routes);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
