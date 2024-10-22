// routes/learners.js
const express = require('express');
const router = express.Router();

// Define your routes here
router.get('/', (req, res) => {
    res.send('Learners route');
});

module.exports = router; // Ensure you are exporting the router

