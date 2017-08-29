const express = require('express');
const bodyParser = require('body-parser')
const path = require('path');
const mongoose = require('mongoose');

//Init App
const app = express();

// Parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// Parse application/json
app.use(bodyParser.json());


// DB Models
let Article = require('./models/article');

// Connect Mongoose
mongoose.connect('mongodb://localhost/articles');
let db = mongoose.connection;

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

// Add Articles Route
app.get('/articles/add', function(req,res){
    res.render('add_article', {
        title: 'Add Article'
    });
});

// Add Submit Article Post Route
app.post('/articles/add', function(req,res){
    let article = new Article();
    article.title = req.body.title;
    article.author = req.body.author;
    article.body = req.body.body;

    article.save(function(err){
        if(err) {
            console.log(err);
            return;
        } else {
            console.log('Added: ', article);
            res.redirect('/');
        }
    });
});

// Listening Port
app.listen(3000, function(){
    console.log("Server started on port 3000...");
});