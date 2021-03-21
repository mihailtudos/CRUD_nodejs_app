//import Express' Router
const express = require('express');
const router = express.Router();
const passport = require('passport');
//bring bcrypt 
const bcrypt = require('bcryptjs');

//Bring in User Model
const User = require('../models/user');
const { route } = require('./articles');

// Register Form 
router.get('/register', (req, res) => {
  res.render('register');
})

// Register user
router.post('/register', (req, res) => {

  const {name, email, username, password, password2} = req.body;

  req.checkBody('name', 'Name is required').notEmpty();
  req.checkBody('email', 'Email is required').notEmpty();
  req.checkBody('email', 'Email is not valide').isEmail();
  req.checkBody('username', 'Username is required').notEmpty();
  req.checkBody('password', 'Password is required').notEmpty();
  req.checkBody('password2', 'Passwords do not match').equals(password);

  let errors = req.validationErrors();

  if (errors) {
    res.render('register', {
      errors: errors
    })
  } else {
    let newUser = new User({name, email, username, password, password2});

    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(newUser.password, salt, (err, hash) => {
        if (err) {
          console.log(err);
        }
        newUser.password = hash;
        newUser.save((err) => {
          if (err) {
            console.log(err);
            return;
          } else {
            req.flash('success', 'You are now registred and can log in');
            res.redirect('/users/login');
          }
        })
      });
    });
  }
});

// Login form route
router.get('/login', (req, res) => {
  res.render('login');
})

// Login process
router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/users/login',
    failureFlash: true
  })(req, res, next);
});

// logout route
router.get('/logout', (req, res) => {
  req.logout();
  req.flash('success', 'You are logged out');
  res.redirect('/users/login');
});


// export model 
module.exports = router;