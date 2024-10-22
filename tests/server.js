if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const express = require('express');
const path = require('path');
const app = express();
const PORT = 5000;
const bcrypt = require('bcrypt');
const passport = require('passport');
const flash = require('express-flash');
const session = require('express-session');
const db = require('./db');
const methodOverride = require('method-override');

const initializePassport = require('./passport-config');
initializePassport(passport);

// Serve static files from the "public" folder
app.use(express.static(path.join(__dirname, 'public')));

app.use(express.urlencoded({ extended: false }));

// Route to serve academy.html when "/academy" is accessed
app.get('/academy', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/academy.html'));
});

// Route to serve index.html when "/" is accessed
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'));
});

app.get('/students', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/students.html'));
});

// Route to serve payment.html when "/payment" is accessed
app.get('/payment', (req, res) => {
    res.render('payment', { course: req.query.course, role: req.query.role, courseAmount: req.query.courseAmount });
});

app.get('/learners-dashboard', (req, res) => {
    res.render('learners-dashboard');
});


app.set('view engine', 'ejs');

app.use(flash());
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 24 * 60 * 60 * 1000 // 1 day
    }
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride('_method'));

app.get('/', checkAuthenticated, (req, res) => {
    res.render('academy', { name: req.user.username });
});

// Login route
app.get('/login', (req, res) => {
    res.render('login', { message: { error: req.flash('error') } });
});

app.post('/login', passport.authenticate('local', {
    successRedirect: '/learners-dashboard',
    failureRedirect: '/login',
    failureFlash: true
}));

app.use ('learners', require('./routes/learners'));


app.get('/register', (req, res) => {
    const courses = [
        {id: 1, name: 'Regulatory Affairs Training'},
        {id: 2, name: 'Pharmaceutical Quality Assurance'},
        {id: 3, name: 'Pharmaceutical Supply Chain Management'},
        {id: 4, name: 'Pharmaceutical Regulatory Affairs'},
        {id: 5, name: 'Digital Health & Data Science in Pharmacy'},
    ];
    res.render('register', { courses: courses });
});

app.post('/register', async (req, res) => {
    const { username, email, password, role, course } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        // Insert user to db with the selected role and course
        db.query('INSERT INTO users (name, email, passwordHash, role, course, payment) VALUES (?, ?, ?, ?, ?, ?)', [username, email, hashedPassword, role, course, 'N'], (err, result) => {
            if (err) {
                console.error('Database insert error:', err);
                return res.redirect('/register');
            }
            res.redirect('/login');
        });
    } catch (err) {
        console.error('Error during registration:', err);
        res.redirect('/payment');
    }
});

function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
}

function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect('/login');
    }
    next();
}

app.delete('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            console.error('Logout error:', err);
            return res.redirect('/academy');
        }
        res.redirect('/login');
    });
});

app.post('/confirmPayment', (req, res) => {
    const userId = req.user ? req.user.userID : null;
    if (!userId) {
        console.log('User not authenticated');
        return res.redirect('/login');
    }
    db.query('SELECT payment FROM users WHERE userID = ?', [userId], (err, result) => {
        if (err) {
            console.error('Database query error:', err);
            return res.redirect('/payment');
        }
        // Check if payment is Y
        if (result.length > 0) {
            if (result[0].payment === 'Y') {
                res.render('dashboard', { user: req.user });
            } else {
                res.render('payment');
            }
        } else {
            console.log('No payment record found for user:', userId);
            res.redirect('/payment');
        }
    });
});

app.post('/payment', (req, res) => {
    const { course } = req.body; // Extract course from request body
    const role = req.user ? req.user.role : null; // Extract role from user object
    db.query('SELECT amount FROM courses WHERE id = ?', [course], (err, result) => {
        if (err) {
            console.error('Database query error:', err);
            return res.redirect('/payment');
        }
        const amount = result.length > 0 ? result[0].amount : 0;
        res.render('payment', { course: course, role: role, courseAmount: amount }); // Pass course, role, and amount to the template
    });
});

app.get('/dashboard', (req, res) => {
    if (req.isAuthenticated()) {
        res.render('dashboard', { user: req.user });
    } else {
        console.log('User not authenticated for dashboard access');
        res.redirect('/login');
    }
});


app.post('/updatePayment', (req, res) => {
    const { email, payment } = req.body;
    db.query('UPDATE users SET payment = ? WHERE email = ?', [payment, email], (err, result) => {
        if (err) {
            console.error('Database update error:', err);
            return res.redirect('/payment');
        }
        console.log('Payment updated for user:', email);
        res.redirect('/dashboard');
    });
});

//additional routes and logic
//quiz routes
app.get('/quiz/:quizID', (req, res) => {
    const quizID = req.params.quizID;
    db.query('SELECT * FROM quizzes WHERE quizID = ?', [quizID], (err, result) => {
        if (err) {
            console.error('Database query error:', err);
            return res.redirect('/dashboard');
        }
        res.render('quiz', { quizID: quizID, questions: result });
    });
});
app.post('/quiz/:quizID', (req, res) => {
    const { answer } = req.body;
    const quizID = req.params.quizID;
    db.query('SELECT correctAnswer FROM quiz_questions WHERE quizID = ?', [quizID], (err, result) => {
        if (err) {
            console.error('Database query error:', err);
            return res.redirect('/dashboard');
        }
        res.render('quiz', { quizID: quizID, questions: result });
    });
});

app.use('/learners', require('./routes/learners'));
app.use('/quizzes', require('./routes/quizzes'));



app.get('/coursecontent', (req, res) => {
    res.render('coursecontent');
});


// Start the server and listen on the specified port
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});