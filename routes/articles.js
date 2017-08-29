const express = require('express');
const router = express.Router();

// Article Model
let Article = require('../models/article');


// Add Articles Route
router.get('/add', function(req,res){
    res.render('add_article', {
        title: 'Add Article'
    });
});

// Add Submit Article Post Route
router.post('/add', function(req,res){
    req.checkBody('title', 'Title is required').notEmpty();
    req.checkBody('author', 'Author is required').notEmpty();
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
        article.author = req.body.author;
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
router.get('/edit/:id', function(req,res){
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

module.exports = router;