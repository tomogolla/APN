const express = require('express');
const router = express.Router();
const db = require('../db');

// get quiz questions
router.get('/:unitID', (req, res) => {
    const unitID = req.params.unitID;
    db.query('SELECT * FROM quizzes WHERE unitID = ?', [unitID], (err, results) => {
        if (err) return res.status(500).send('Database error');
        res.render('quiz', { questions: results });
    });
});

// submit quiz answers
router.post('/quizID', (req, res) => {
    const quizID = req.params.quizID;
    const { answer } = req.body;
    db.query('SELECT correctAnswer FROM quiz_questions WHERE quizID = ?', [quizID], (err, results) => {
        if (err) return res.status(500).send('Database error');
        const correctAnswer = results[0].correctAnswer;
        if (answer === correctAnswer) {
            db.query('UPDATE learners_progress SET quizScore = quizScore + 1 WHERE learnerID = ? AND unitID = ?', [learnerID, unitID], (err) => {
                if (err) return res.status(500).send('Database error');
                res.send('Correct');
                res.redirect('/dashboard');
            });
        } else {
            res.send('Incorrect answer');
        }
    });
});

module.exports = router;
