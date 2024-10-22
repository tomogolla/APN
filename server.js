const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const PORT = 3000;

require('dotenv').config();

// Middleware to parse JSON
app.use(bodyParser.json());

// Serve static files from the 'acadamy' directory
app.use(express.static(path.join(__dirname, 'acadamy'))); // Ensure this path is correct

// Serve the landing page as the default page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'acadamy', 'landingpage.html'));
});

// Mock database (In real apps, use a proper database)
const students = [
    { username: 'student1', password: 'pass123', name: 'John Doe', courses: ['Regulatory Affairs', 'Pharmaceutical Management'] },
    { username: 'student2', password: 'pass456', name: 'Jane Smith', courses: ['Pharmacovigilance', 'Digital Health'] }
];

const tutors = []; // Array to store tutor registrations

// Handle login request
app.post('/login', (req, res) => {
    const { username, password, role } = req.body;

    const user = role !== 'tutor' 
        ? students.find(stu => stu.username === username && stu.password === password) 
        : tutors.find(t => t.username === username && t.password === password);

    if (user) {
        return res.json({ success: true, redirect: role !== 'tutor' ? '/studentdashboard' : '/tutordashboard' });
    }

    // Login failed
    res.json({ success: false, message: 'Invalid username or password' });
});

// Handle registration
app.post('/register/student', (req, res) => {
    const { username, password } = req.body;
    if (students.find(stu => stu.username === username)) {
        return res.json({ success: false, message: 'Username already exists' });
    }
    students.push({ username, password });
    res.json({ success: true, message: 'Student registered successfully' });
});

app.post('/register/tutor', (req, res) => {
    const { username, password } = req.body;
    if (tutors.find(t => t.username === username)) {
        return res.json({ success: false, message: 'Username already exists' });
    }
    tutors.push({ username, password });
    res.json({ success: true, message: 'Tutor registered successfully' });
});

// Serve dashboards
app.get('/studentdashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'acadamy', 'studentdashboard.html'));
});

app.get('/tutordashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'acadamy', 'tutordashboard.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
