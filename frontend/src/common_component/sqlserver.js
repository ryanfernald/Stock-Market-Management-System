const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// SQL connection setup
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

// Endpoint to insert user data
app.post('/api/insertUser', (req, res) => {
  const { user_id, email, first_name, last_name } = req.body;

  const query = `INSERT INTO User (user_id, email, first_name, last_name) VALUES (?, ?, ?, ?)`;
  
  connection.query(query, [user_id, email, first_name, last_name], (error, results) => {
    if (error) {
      console.error('Database insertion error:', error);
      return res.status(500).json({ detail: 'Database insertion failed' });
    }
    res.status(200).json({ message: 'User added successfully' });
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
