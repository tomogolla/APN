const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const db = require('./db');
const express = require('express');
const app = express();


function initializePassport(passport) {
    const authenticateUser = async (email, password, done) => {
        // Query the database for the user with the given email
        db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
            if (err) {
                return done(err);
            }
            if (results.length === 0) {
                return done(null, false, { message: 'No user with that email' });
            }
            const user = results[0];
            try {
                const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
                if (isPasswordValid) {
                    return done(null, user);
                } else {
                    return done(null, false, { message: 'Password incorrect' });
                }
            } catch (e) {
                return done(e);
            }
        });
    };

    passport.use(new LocalStrategy({ usernameField: 'email' }, authenticateUser));

    passport.serializeUser((user, done) => {
        if (!user || !user.userID) {
            return done(new Error('User not found or invalid user object'));
        }
        return done(null, user.userID);
    });

    passport.deserializeUser((id, done) => {
        db.query('SELECT * FROM users WHERE userID = ?', [id], (err, results) => {
            if (err) {
                return done(err);
            }
            if (results.length === 0) {
                return done(new Error('No user found with this ID'));
            }
            return done(null, results[0]);
        });
    });
}

app.get('/dashboard', (req, res) => {
    if (req.isAuthenticated()) {
        // Check if the user has paid
        db.query('SELECT payment FROM users WHERE email = ?', [req.user.email], (err, results) => {
            if (err) {
                console.error('Database query error:', err);
                return res.redirect('/payment');
            }
            if (results.length === 0) {
                console.log('No payment record found for user:', req.user.email);
                return res.redirect('/payment');
            }
            console.log('Payment status for user:', req.user.email, 'is', results[0].payment);
            if (results[0].payment === 'Y') {
                res.render('dashboard', { user: req.user });
            } else {
                console.log('User has not completed payment, redirecting to payment page.');
                return res.redirect('/payment');
            }
        });
    } else {
        console.log('User not authenticated, redirecting to login page.');
        res.redirect('/login');
    }
});

module.exports = initializePassport;
