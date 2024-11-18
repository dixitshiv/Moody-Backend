const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3001;
const cors = require('cors');

app.use(express.json()); // Middleware to parse JSON bodies

app.use(cors());

// Mock user data file path
const usersFilePath = path.join(__dirname, 'users.json');

// Root route
app.get("/", (req, res) => {
  res.send("Hello, Backend!");
});

// Get user profile (make sure this route is correctly set up)
app.get('/api/profile', (req, res) => {
    try {
        const users = JSON.parse(fs.readFileSync(usersFilePath, 'utf-8'));
        if (users.length === 0) {
            return res.status(404).send('No users found');
        }
        res.json(users[0]); // Assuming a single user for now
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching user data');
    }
});

// Update user profile (this part should also be handled properly)
app.put('/api/profile', (req, res) => {
    try {
        const updatedData = req.body;
        const users = JSON.parse(fs.readFileSync(usersFilePath, 'utf-8'));
        users[0] = { ...users[0], ...updatedData }; // Update the user data
        fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
        res.json(users[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error updating user data');
    }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
