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

// Set public folder
app.use(express.static(path.join(__dirname, 'public')));

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

// Get a single article
app.get('/article/:id', function(req,res){
    Article.findById(req.params.id, function(err, article){
        if(err) {
            console.log(err);
            return;
        } else {
            res.render('article', {
                article: article 
             });
        }
    });
});

// Get a edit article
app.get('/article/edit/:id', function(req,res){
    Article.findById(req.params.id, function(err, article){
        if(err) {
            console.log(err);
            return;
        } else {
            res.render('edit_article', {
                title: "Edit Article",
                article: article
            });
        }
    });
});

// Post Edit Article
app.post('/articles/edit/:id', function(req,res){
    let article = {};
    article.title = req.body.title;
    article.author = req.body.author;
    article.body = req.body.body;

    let query = {_id:req.params.id};

    Article.update(query, article, function(err){
        if(err) {
            console.log(err);
            return;
        } else {
            console.log('Edit: ', article);
            res.redirect('/');
        }
    });

});

// Delete Article
app.delete('/articles/:id', function(req,res){
    let query = {_id: req.params.id};
    Article.remove(query, function(err){
        if(err) {
            console.log(err);
            return;
        } else {
            res.send('Success');
        }
    });
});

// Listening Port
app.listen(3000, function(){
    console.log("Server started on port 3000...");
});