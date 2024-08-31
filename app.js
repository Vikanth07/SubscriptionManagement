const express = require('express');
const app = express();
const mysql = require('mysql2');
const path = require('path');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));


const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  database: 'gradious',
  password: 'Vikanth@msd7'
});


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


app.post('/adminlogin', (req, res) => {
    const { username, password } = req.body;

    const query = "SELECT * FROM admin WHERE username = ? AND password = ?";
    connection.query(query, [username, password], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ success: false, message: 'Internal server error.' });
        }

        if (results.length > 0) {
            res.json({ success: true, message: 'Login successful!' });
        } else {
            res.status(401).json({ success: false, message: 'Invalid username or password.' });
        }
    });
});

app.post('/userlogin', (req, res) => {
    const { username, password } = req.body;

    const userQuery = "SELECT * FROM users WHERE username = ? AND password = ?";
    connection.query(userQuery, [username, password], (err, userResults) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ success: false, message: 'Internal server error.' });
        }

        if (userResults.length > 0) {
            const userId = userResults[0].id;

            const subscriberQuery = `
                SELECT s.* 
                FROM subscriptions s 
                WHERE s.user_id = ?`;
                
            connection.query(subscriberQuery, [userId], (err, subscriberResults) => {
                if (err) {
                    console.error('Database error:', err);
                    return res.status(500).json({ success: false, message: 'Internal server error.' });
                }

                if (subscriberResults.length > 0) {
                    res.json({ 
                        success: true, 
                        message: 'Login successful!', 
                        userId, 
                        userData: userResults[0], 
                        subscriberData: subscriberResults 
                    });
                } else {
                    res.status(404).json({ 
                        success: true, 
                        message: 'No subscription data found for this user.',
                        userId, 
                        userData: userResults[0] 
                    });
                }
            });
        } else {
            res.status(401).json({ 
                success: false, 
                message: 'Invalid username or password.' 
            });
        }
    });
});

app.get('/subscriptions/:userId', (req, res) => {
    const { userId } = req.params;
    const query = "SELECT * FROM subscriptions WHERE user_id = ?";
    
    connection.query(query, [userId], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ success: false, message: 'Internal server error.' });
        }
        res.json(results);
    });
});

app.post('/subscription-requests', (req, res) => {
    const { user_id, subscription_type, subscription_start_date, subscription_end_date, payment_status, last_payment_date } = req.body;
    const query = `
        INSERT INTO subscription_requests (user_id, subscription_type, subscription_start_date, subscription_end_date, payment_status, last_payment_date)
        VALUES (?, ?, ?, ?, ?, ?)`;

    connection.query(query, [user_id, subscription_type, subscription_start_date, subscription_end_date, payment_status, last_payment_date], (err, result) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ success: false, message: 'Internal server error.' });
        }
        res.status(201).json({ success: true, message: 'Subscription request submitted.' });
    });
});


app.get('/subscription-requests', (req, res) => {
    const query = `
        SELECT sr.*, u.username 
        FROM subscription_requests sr 
        JOIN users u ON sr.user_id = u.id`;
    
    connection.query(query, (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ success: false, message: 'Internal server error.' });
        }
        res.json(results);
    });
});


app.post('/subscription-requests/:id/action', (req, res) => {
    const { id } = req.params;
    const { action } = req.body;

    if (action === 'accept') {
        const selectQuery = 'SELECT * FROM subscription_requests WHERE id = ?';
        connection.query(selectQuery, [id], (err, results) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ success: false, message: 'Internal server error.' });
            }

            if (results.length > 0) {
                const request = results[0];

                const insertQuery = `
                    INSERT INTO subscriptions (subscription_type, subscription_start_date, subscription_end_date, payment_status, last_payment_date,user_id)
                    VALUES (?, ?, ?, ?, ?, ?)`;

                connection.query(insertQuery, [
                    request.subscription_type, 
                    request.subscription_start_date, 
                    request.subscription_end_date, 
                    request.payment_status, 
                    request.last_payment_date,
                    request.user_id
                ], (err) => {
                    if (err) {
                        console.error('Database error:', err);
                        return res.status(500).json({ success: false, message: 'Internal server error.' });
                    }

                    
                    const deleteQuery = 'DELETE FROM subscription_requests WHERE id = ?';
                    connection.query(deleteQuery, [id], (err) => {
                        if (err) {
                            console.error('Database error:', err);
                            return res.status(500).json({ success: false, message: 'Internal server error.' });
                        }
                        res.json({ success: true, message: 'Subscription request accepted and added to subscriptions.' });
                    });
                });
            } else {
                res.status(404).json({ success: false, message: 'Request not found.' });
            }
        });
    } else if (action === 'decline') {
        const deleteQuery = 'DELETE FROM subscription_requests WHERE id = ?';
        connection.query(deleteQuery, [id], (err) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ success: false, message: 'Internal server error.' });
            }
            res.json({ success: true, message: 'Subscription request declined and removed.' });
        });
    } else {
        res.status(400).json({ success: false, message: 'Invalid action.' });
    }
});


app.get('/users', (req, res) => {
    const query = "SELECT id, username, password FROM users";
    connection.query(query, (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ success: false, message: 'Internal server error.' });
        }
        res.json(results);
    });
});


app.post('/users', (req, res) => {
    const { username, password } = req.body;

    const query = "INSERT INTO users (username, password) VALUES (?, ?)";
    connection.query(query, [username, password], (err, result) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ success: false, message: 'Internal server error.' });
        }
        res.status(201).json({ success: true, message: 'User created successfully!', id: result.insertId });
    });
});


app.put('/users/:id', (req, res) => {
    const { id } = req.params;
    const { username, password } = req.body;

    const query = "UPDATE users SET username = ?, password = ? WHERE id = ?";
    connection.query(query, [username, password, id], (err) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ success: false, message: 'Internal server error.' });
        }
        res.json({ success: true, message: 'User updated successfully!' });
    });
});


app.delete('/users/:id', (req, res) => {
    const { id } = req.params;

    const query = "DELETE FROM users WHERE id = ?";
    connection.query(query, [id], (err) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ success: false, message: 'Internal server error.' });
        }
        res.json({ success: true, message: 'User deleted successfully!' });
    });
});


app.listen(8080, () => {
    console.log("Server is listening on port 8080");
});
