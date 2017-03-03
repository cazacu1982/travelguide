
module.exports = function(app, passport) {

    var User = require('../models/user.js');
    var Profile = require('../models/profile.js');

    function checkAuth (req, res, next) {
        console.log('checkAuth ' + req.url);

        // don't serve /secure to those not logged in
        // you should add to this list, for each and every secure url
        if (req.url === '/dashboard' && (!req.session || !req.session.authenticated)) {
            res.sendStatus(403);
        } else if (req.url === '/users' && (!req.session || !req.session.authenticated))  {
            res.sendStatus(403);
            return;
        }
        next();
    }
    app.use(checkAuth);
 
/*Admin login logic express*/

    app.get('/dashboard', checkAuth, function(req, res, next) {
        res.render('dashboard'); //load the index.ejs file
    });
    //get users ==========================
    app.get('/users', (req, res) => {
        User.find({}, (err, docs) => {
            if(err) return console.error(err);
            res.json(docs);
        })
    });

    app.get('/admin', function(req, res, next) {
        res.render('admin.ejs'); //load the index.ejs file
    });

    app.post('/admin', function(req, res, next) {
        if(req.body.email && req.body.email === "cazacu1982@yahoo.com" && req.body.password && req.body.password === 'zmxncbv') {
            req.session.authenticated= true;
            res.redirect('/dashboard');
        } else {
           // req.flash('error', 'Username and password are incorrect');
            res.redirect('/admin');
        }
    });

    app.get('/logoutAdmin', function (req, res, next) {
        delete req.session.authenticated;
        res.redirect('/admin');
    });
    
    // express app HOME PAGE (with login links) ========
    //LOGIN====================
    //show the login form
    app.get('/login', function (req, res) {
        // render the page and pass in any flash data if it exists
        res.render('login.ejs', {message: req.flash('loginMessage') });
    });

    // process the login form
     app.post('/login', passport.authenticate('local-login', {
         successRedirect: '/profile',
         failureRedirect: '/login',
         failureFlash: true
     }));

    // SIGNUP ==============================
    // show the signup form
    app.get('/signup', function(req, res) {
       res.render('signup.ejs', {message: req.flash('signupMessage')}) ;
    });

    // process the signup form
     app.post('/signup', passport.authenticate('local-signup', {
         successRedirect : '/profile', // redirect to the secure profile section
         failureRedirect : '/signup', // redirect back to the signup page if there is an error
         failureFlash : true // allow flash messages
     }));

    // PROFILE SECTION =====================
    // we will want this protected so you have to be logged in to visit
    // we will use route middleware to verify this (the isLoggedIn function)
    app.get('/profile', isLoggedIn, function(req, res) {
        res.render('profile.ejs', {
            user : req.user // get the user out of session and pass to template
        });
    });

    // FACEBOOK ROUTES =====================
    // route for facebook authentication and login
    app.get('/auth/facebook', passport.authenticate('facebook', {scope: 'email'}));
    // handle the callback after facebook has authenticated the user
    app.get('/auth/facebook/callback', 
    passport.authenticate('facebook', {
        successRedirect: '/profile',
        failureRedirect: '/'
    }));
    
    // TWITTER ROUTES ==========================
    app.get('/auth/twitter', passport.authenticate('twitter'));
    
    app.get('/auth/twitter/callback', 
    passport.authenticate('twitter', {
        successRedirect: '/profile',
        failureRedirect: '/'
    }));

    // LOGOUT ==============================
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('http://localhost:4200');
    });

    //get profile ==========================
    app.get('/profiles', (req, res) => {
        Profile.find({}, (err, docs) => {
            if(err) return console.error(err);
            res.json(docs);

        })
    });

    // find by id
    app.get('/profiles/:id', function(req, res) {
        Profile.findOne({_id: req.params.id}, function(err, obj) {
            if(err) return console.error(err);
            res.json(obj);

        })
    });

    // update by id
    app.put('/profiles/:id', function(req, res) {
        Profile.findOneAndUpdate({_id: req.params.id}, { $inc: {votes: 1} }, function(err,data){
            if (err)
                res.send(err);
            res.json(data);
                   });
    });

    // route middleware to make sure a user is logged in
    function isLoggedIn(req, res, next) {
        // if user is authenticated in the session, carry on 
        if(req.isAuthenticated())
            return next();
        // if they aren't redirect them to the home page
        res.redirect('/login');
    }
};