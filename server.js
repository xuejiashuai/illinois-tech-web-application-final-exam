const express = require('express');
const path = require('path');
const mysql = require('mysql2');

const app = express();

// Middleware to parse JSON and form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve all static files (HTML, CSS, JS, images)
app.use(express.static(__dirname));

// MySQL Database Connection
const db = mysql.createConnection({
    host: 'simon-web-app-db.ckdokgaambpx.us-east-1.rds.amazonaws.com',
    user: 'admin',           // Change to your MySQL username
    password: 'Xjs960117!',           // Change to your MySQL password
    database: 'simon-web-app-db'  // Change to your database name
});

// Connect to MySQL
db.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL database');
});

// Route for the home page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

// Login route - check username and password
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    const query = 'SELECT * FROM illinois_tech_app.users WHERE username = ? AND password = ?';
    
    db.query(query, [username, password], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.json({ success: false, message: 'Database error' });
        }

        if (results.length > 0) {
            // User found - login successful
            res.json({ success: true, message: 'Login successful' });
        } else {
            // No matching user
            res.json({ success: false, message: 'Invalid username or password' });
        }
    });
});

// Start server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
