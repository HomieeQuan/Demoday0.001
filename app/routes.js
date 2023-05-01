module.exports = function(app, passport, db) {
  const ObjectID = require('mongodb').ObjectID

// normal routes ===============================================================

    // show the home page (will also have our login links)
    app.get('/', function(req, res) {
        res.render('index.ejs');
    });

    // PROFILE SECTION =========================
    app.get('/profile', isLoggedIn, function(req, res) {
        db.collection('improve').find().toArray((err, result) => {
          if (err) return console.log(err)
          res.render('profile.ejs', {
            user : req.user,
            improve: result
          })
        })
    });

    // LOGOUT ==============================
    app.get('/logout', function(req, res) {
        req.logout(() => {
          console.log('User has logged out!')
        });
        res.redirect('/');
    });

// message board routes ===============================================================

app.post('/improve', (req, res) => {
  let level = req.body.level;
  let workouts;

  if (level === 'beginner') {
    workouts = [
      'Dribble drill: Start with dribbling in one spot, then try dribbling while walking, jogging, and running. Repeat for 5 minutes.',
      'Layup drill: Practice layups from different angles on both sides of the basket. Repeat for 10 minutes.',
      'Passing drill: Practice chest passes, bounce passes, and overhead passes against a wall. Repeat for 5 minutes.',
      'Shooting drill: Practice shooting from different spots on the court. Focus on form and technique. Repeat for 10 minutes.',
      'Defense drill: Practice sliding and staying in front of a partner. Work on footwork and positioning. Repeat for 5 minutes.'
    ];
  } else if (level === 'mid-level') {
    workouts = [
      'Dribble and shoot drill: Start at half court, dribble to the three-point line, then shoot a jump shot. Repeat for 10 minutes.',
      'Pick-and-roll drill: Practice setting and using picks in a pick-and-roll situation. Repeat for 10 minutes.',
      '3-on-2 drill: Practice running a fast break with two teammates against three defenders. Work on passing, finishing, and communication. Repeat for 10 minutes.',
      'Post moves drill: Practice different post moves, such as drop steps, up-and-unders, and jump hooks. Repeat for 10 minutes.',
      'Perimeter defense drill: Practice staying in front of an offensive player, closing out on shooters, and contesting shots. Repeat for 10 minutes.'
    ];

  } else if (level === 'expert') {
    workouts = [
      'Shooting off the dribble drill: Practice shooting off the dribble from different spots on the court. Repeat for 15 minutes.',
      'One-on-one drill: Practice playing one-on-one with a partner. Work on creating and using space, finishing at the rim, and defending. Repeat for 15 minutes.',
      'Full court drill: Practice running a full-court fast break with teammates against defenders. Work on passing, finishing, and communication. Repeat for 15 minutes.',
      'Advanced post moves drill: Practice more advanced post moves, such as up-and-unders, spin moves, and step-throughs. Repeat for 15 minutes.',
      'Perimeter shooting drill: Practice shooting from the three-point line and mid-range spots. Work on catching and shooting, shooting off the dribble, and moving without the ball. Repeat for 15 minutes.'
    ];
  }

  db.collection('improve').save({name: req.body.name, level: level, workouts: workouts}, (err, result) => {
    if (err) return console.log(err)
    console.log('saved to database')
    res.redirect('/profile')
  })
});


   

    app.delete('/improve', (req, res) => {
      db.collection('improve').findOneAndDelete({_id: ObjectID(req.body.id)}, (err, result) => {
        if (err) return res.send(500, err)
        res.send('Message deleted!')
      })
    })

// =============================================================================
// AUTHENTICATE (FIRST LOGIN) ==================================================
// =============================================================================

    // locally --------------------------------
        // LOGIN ===============================
        // show the login form
        app.get('/login', function(req, res) {
            res.render('login.ejs', { message: req.flash('loginMessage') });
        });

        // process the login form
        app.post('/login', passport.authenticate('local-login', {
            successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/login', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));

        // SIGNUP =================================
        // show the signup form
        app.get('/signup', function(req, res) {
            res.render('signup.ejs', { message: req.flash('signupMessage') });
        });

        // process the signup form
        app.post('/signup', passport.authenticate('local-signup', {
            successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/signup', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));

// =============================================================================
// UNLINK ACCOUNTS =============================================================
// =============================================================================
// used to unlink accounts. for social accounts, just remove the token
// for local account, remove email and password
// user account will stay active in case they want to reconnect in the future

    // local -----------------------------------
    app.get('/unlink/local', isLoggedIn, function(req, res) {
        var user            = req.user;
        user.local.email    = undefined;
        user.local.password = undefined;
        user.save(function(err) {
            res.redirect('/profile');
        });
    });

};

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();

    res.redirect('/');
}
