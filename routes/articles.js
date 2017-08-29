const express = require('express');
const router = express.Router();

// Article Model
let Article = require('../models/article');
// User Model
let User = require('../models/user');


// Add Articles Route
router.get('/add', ensureAuthenticated,function(req,res){
    res.render('add_article', {
        title: 'Add Article'
    });
});

// Add Submit Article Post Route
router.post('/add', function(req,res){
    req.checkBody('title', 'Title is required').notEmpty();
    //req.checkBody('author', 'Author is required').notEmpty();
    req.checkBody('body', 'Body is required').notEmpty();

    // Get Errors
    let errors = req.validationErrors();

    if(errors) {
        res.render('add_article', {
            title: 'Add Title',
            errors: errors 
        });
    } else {
        let article = new Article();
        article.title = req.body.title;
        article.author = req.user._id;
        article.body = req.body.body;
    
        article.save(function(err){
            if(err) {
                console.log(err);
                return;
            } else {
                req.flash('success', 'Article Added');
                res.redirect('/');
            }
        });
    }
});

// Get a single article
router.get('/:id', function(req,res){
    Article.findById(req.params.id, function(err, article){
        User.findById(article.author, function(err, user){
            if(err) {
                console.log(err);
                return;
            } else {
                res.render('article', {
                    article: article,
                    author: user.name
                 });
            }
        });
    });
});

// Get a edit article
router.get('/edit/:id', ensureAuthenticated, function(req,res){
    Article.findById(req.params.id, function(err, article){
        if(article.author != req.user._id) {
            req.flash('danger', 'Not Authorized');
            res.redirect('/');
        }
        res.render('edit_article', {
            title: "Edit Article",
            article: article
        });
    });
});

// Post Edit Article
router.post('/edit/:id', function(req,res){
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
            req.flash('success', 'Article Updated');
            res.redirect('/');
        }
    });

});

// Delete Article
router.delete('/:id', function(req,res){
    if(!user.req.user._id) {
        res.status(500).send();
    }

    let query = {_id: req.params.id};

    Article.findById(req.params.id, function(err, article){
        if(article.author != req.user._id) {
            res.status(500).send();
        } else {
            Article.remove(query, function(err){
                if(err) {
                    console.log(err);
                    return;
                } else {
                    res.send('Success');
                }
            });
        }
    });
});

// Access Control
function ensureAuthenticated(req,res,next) {
    if(req.isAuthenticated()) {
        return next();
    } else {
        req.flash('danger', 'Please Login');
        req.redirect('/users/login');
    }
}

module.exports = router;