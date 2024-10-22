const express = require('express');
const router = express.Router();
const db = require('../db');

//learners dashboard
router.get('/dashboard', (req, res) => {
    //fetch learners data from the database
    db.query('SELECT * FROM learners_progress WHERE learnerID = ?', [req.user.leanerID], (err, results) => {
        if (err) return res.status(500).send('Database error');
        res.render('learner-dashboard', { learner: req.user, progress: results[0] });
    });
});
//report submission
router.post('/submit-report', (req, res) => {
    const { learnerID, UnitID } = req.body;
    db.query('UPDATE learners_progress SET reportSubmitted = 1 WHERE learnerID = ? AND UnitID = ?', [learnerID, UnitID], (err) => {
        if (err) return res.status(500).send('Database error');
        res.redirect('/dashboard');
    });
});
module.exports = router;




