const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const session = require('express-session');
const config = require('./config/database');
const passport = require('passport');

//connecting to the DB
mongoose.connect(config.database, {useNewUrlParser: true, useUnifiedTopology: true});

let db = mongoose.connection;

//check for db errors
db.on('error', (err) => {
  console.log(err);
});

//check connection 
db.once('open', () => {
  console.log('Connected to MongoDB');
})


//init app
const app = express();

//bring in Article model
let Article = require('./models/article');
let User = require('./models/user');


//body parser middleware
app.use(bodyParser.urlencoded({extended: false}));

//
app.use(bodyParser.json());

//set public folder 
app.use(express.static(path.join(__dirname, 'public')));

//Express sessions middleware
app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true, 
}))

//Express messages
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});


// Express validator Middleware
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
    var namespace = param.split('.'),
    root = namespace.shift(),
    formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg : msg,
      value: value
    };
  }
}))

// Password config
require('./config/passport')(passport);

//passport middleware
app.use(passport.initialize());
app.use(passport.session());

// setting up a global user session as a global user object 
app.get('*', (req, res, next) => {
  res.locals.user = req.user || null;
  //calls next piece of middleware
  next();
})

// const { request } = require('http');

//load vew engine
//setting the directory of views and pug as the view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

//home route
app.get('/', (req, res) => {
  Article.find({}, (err, articles) => {
    if(err) {
      console.log(err);
    } else {
      res.render('index', {
        title: 'Articles',
        articles: articles,
      });
    }
  });
})

//Router files 
let articles = require('./routes/articles');
let users = require('./routes/users');
app.use('/articles', articles);
app.use('/users', users);


//start server
app.listen(3000, () => {
  console.log('Server started on port 3000');
})