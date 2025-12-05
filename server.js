const express = require('express');
const path = require('path');
const mysql = require('mysql2');

const app = express();

// Middleware to parse JSON and form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve all static files (HTML, CSS, JS, images)
app.use(express.static(__dirname));

// MySQL Connection Pool
const db = mysql.createPool({
    host: 'simon-web-app-db.ckdokgaambpx.us-east-1.rds.amazonaws.com',
    user: 'admin',
    password: 'Xjs960117!',
    database: 'illinois_tech_app',
    waitForConnections: true,
    connectionLimit: 10,      // Maximum number of connections in pool
    queueLimit: 0             // Unlimited queue
});

// Test pool connection
db.getConnection((err, connection) => {
    if (err) {
        console.error('Error connecting to MySQL pool:', err);
        return;
    }
    console.log('Connected to MySQL database pool');
    connection.release(); // Release connection back to pool
});

// Route for the home page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

// Sign Up route - create new user
app.post('/signup', (req, res) => {
    const { username, password } = req.body;

    // Check if username already exists
    const checkQuery = 'SELECT * FROM users WHERE username = ?';
    
    db.query(checkQuery, [username], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.json({ success: false, message: 'Database error' });
        }

        if (results.length > 0) {
            return res.json({ success: false, message: 'Username already exists' });
        }

        // Insert new user
        const insertQuery = 'INSERT INTO users (username, password, role, created_at) VALUES (?, ?, "user", CURRENT_TIMESTAMP)';
        
        db.query(insertQuery, [username, password], (err, result) => {
            if (err) {
                console.error('Database error:', err);
                return res.json({ success: false, message: 'Database error' });
            }
            
            res.json({ success: true, message: 'Account created successfully' });
        });
    });
});

// Login route - check username and password
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    const query = 'SELECT * FROM users WHERE username = ? AND password = ?';
    
    db.query(query, [username, password], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.json({ success: false, message: 'Database error' });
        }

        if (results.length > 0) {
            // User found - login successful
            const user = results[0];
            res.json({ 
                success: true, 
                message: 'Login successful',
                role: user.role || 'user'  // Return user role (default to 'user' if not set)
            });
        } else {
            // No matching user
            res.json({ success: false, message: 'Invalid username or password' });
        }
    });
});

// Create Order route - save order to database
app.post('/order', (req, res) => {
    const { username, items, total, mealDate, mealTime, numPeople, notes } = req.body;

    const insertQuery = `
        INSERT INTO orders (username, items, total, meal_date, meal_time, num_people, notes, status, created_at) 
        VALUES (?, ?, ?, ?, ?, ?, ?, 'in_progress', CURRENT_TIMESTAMP)
    `;
    
    // Convert items array to JSON string for storage
    const itemsJson = JSON.stringify(items);
    
    db.query(insertQuery, [username, itemsJson, total, mealDate, mealTime, numPeople, notes], (err, result) => {
        if (err) {
            console.error('Database error:', err);
            return res.json({ success: false, message: 'Database error' });
        }
        
        res.json({ success: true, message: 'Order placed successfully', orderId: result.insertId });
    });
});

// Cancel Order route - update order status to cancelled
app.put('/order/:orderId/cancel', (req, res) => {
    const { orderId } = req.params;

    const updateQuery = 'UPDATE orders SET status = "cancelled" WHERE id = ? AND status = "in_progress"';
    
    db.query(updateQuery, [orderId], (err, result) => {
        if (err) {
            console.error('Database error:', err);
            return res.json({ success: false, message: 'Database error' });
        }
        
        if (result.affectedRows > 0) {
            res.json({ success: true, message: 'Order cancelled successfully' });
        } else {
            res.json({ success: false, message: 'Order cannot be cancelled' });
        }
    });
});

// Complete Order route - update order status to completed (admin only)
app.put('/order/:orderId/complete', (req, res) => {
    const { orderId } = req.params;

    const updateQuery = 'UPDATE orders SET status = "completed" WHERE id = ? AND status = "in_progress"';
    
    db.query(updateQuery, [orderId], (err, result) => {
        if (err) {
            console.error('Database error:', err);
            return res.json({ success: false, message: 'Database error' });
        }
        
        if (result.affectedRows > 0) {
            res.json({ success: true, message: 'Order completed successfully' });
        } else {
            res.json({ success: false, message: 'Order cannot be marked as complete' });
        }
    });
});

// Get Order History route - fetch user's orders
app.get('/orders/:username', (req, res) => {
    const { username } = req.params;

    const query = 'SELECT * FROM orders WHERE username = ? ORDER BY created_at DESC LIMIT 5';
    
    db.query(query, [username], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.json({ success: false, message: 'Database error' });
        }
        
        res.json({ success: true, orders: results });
    });
});

// Admin route - get all orders
app.get('/admin/orders', (req, res) => {
    const query = 'SELECT * FROM orders ORDER BY created_at DESC';
    
    db.query(query, (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.json({ success: false, message: 'Database error' });
        }
        
        res.json({ success: true, orders: results });
    });
});

// Start server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
