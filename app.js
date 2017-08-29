const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const config = require('./config/database');
const passport = require('passport');

//Init App
const app = express();

// Connect Mongoose
mongoose.connect(config.database);
let db = mongoose.connection;

// Parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// Parse application/json
app.use(bodyParser.json());

// Set public folder
app.use(express.static(path.join(__dirname, 'public')));

// Express Session Midleware
app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true
}));

// Express Validator Middleware
app.use(expressValidator({
    errorFormatter: function(param, msg, value) {
        var namespace = param.split('')
        , root = namespace.shift()
        , formParam = root;

        while(namespace.length) {
            formParam += '[' + namespace.shift() + ']';
        }
        return {
            patam: formParam,
            msg: msg,
            value: value
        };
    }
}));

// Express Messages Midleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

// DB Models
let Article = require('./models/article');

// Check Connection
db.once('open', function(){
    console.log('Connected to MongoDB');
})

// Check DB errors
db.on('error', function(err){
    console.log(err);
});

//View Engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');


// Pasport config
require('./config/passport')(passport);

// Passport Midleware
app.use(passport.initialize());
app.use(passport.session());

// Get user information if loggedin
app.get('*', function(req,res,next){
    res.locals.user = req.user || null;
    next();
});

// Home Route
app.get('/', function(req,res){
    Article.find({}, function(err, articles){
        if(err) {
            console.log(err);
        } else {
            res.render('index', {
                title: 'Articles',
                articles: articles
            });
        }
    });
});

// Router File
let articles = require('./routes/articles');
app.use('/articles', articles);
let users = require('./routes/users');
app.use('/users', users);

// Listening Port
app.listen(3000, function(){
    console.log("Server started on port 3000...");
});