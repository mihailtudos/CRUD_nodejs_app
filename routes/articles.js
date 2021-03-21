//import Express' Router
const express = require('express');
const article = require('../models/article');
const router = express.Router();

//bring in Article model
let Article = require('../models/article');
const user = require('../models/user');

//bring in the User model 
let User = require('../models/user');

//add article route
router.get('/add', isAuth, (req, res) => {
  res.render('add_article', {
    title: 'Add articles'
  })
})


//add submit post route
router.post('/add', (req, res) => {
  req.checkBody('title', 'Title is required').notEmpty();
  req.checkBody('body', 'Body is required').notEmpty();

  //get errors
  let errors = req.validationErrors();
  
  if (errors) {
    res.render('add_article', {
      title: 'Add article',
      errors: errors
    })
  } else {
    let article = new Article();
    article.title = req.body.title;
    article.author = req.user._id;
    article.body = req.body.body;

    article.save((err) => {
      if (err) {
        console.log(err);
        return;
      } else {
        req.flash('success', 'Article added!');
        res.redirect('/');
      }
    })
  }
});

//edit single article 
router.get('/edit/:id', isAuth, (req, res) => {
  Article.findById(req.params.id, (err, article) => {
    if (article.author == user._id) {
      res.render('edit_article', {
        title: 'Edit article',
        article: article 
      });
    } else {
      req.flash('danger', 'Not authorised');
      res.redirect('/');
    }
    

  });
})


//delete
router.delete('/:id', isAuth, (req, res) => {
  if (!req.user._id){
    res.status(500).send();
  }

  let query = {_id: req.params.id};

  Article.findById(req.params.id, (err, article) => {
    if(article.author != req.user._id) {
      res.status(500).send();
    } else {
      Article.remove(query, (err) => {
        if (err) {
          console.log(err);
        }
        res.send('Success');
      })
    }
  })
});

//update submit post route
router.post('/edit/:id', isAuth, (req, res) => {
  const {title, author, body} = req.body;

  let query = {id:req.params.id}

  Article.updateOne(
    {"_id": (req.params.id)}, 
    {$set: {title, author, body}}, 
    (err) => {
    if (err) {
      console.log(err);
      return;
    } else {
      req.flash('success', 'Article updated!');
      res.redirect('/');
    }
  })
});


//get single article 
router.get('/:id', (req, res) => {
  Article.findById(req.params.id, (err, article) => {
    User.findById(article.author, (err, user) => {
      res.render('article', {
        article: article,
        author: user.name
      });
    });
  });
})

//access controll
function isAuth(req, res, next) {
  if (req.isAuthenticated()){
    return next();
  } else {
    req.flash('danger', 'Please log in');
    res.redirect('/users/login');
  }
}

module.exports = router;