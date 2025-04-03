const express = require('express');
const axios = require('axios');
const app = express();
const port = process.env.PORT || 3000;

// JSONBin API details
const BIN_ID = "67eeabfb8a456b796681e58f";  // Replace with your JSONBin Bin ID
const API_KEY = "$2a$10$pG6B7rxlxRG74kvi7tpZOeeNvbHSnPaROzEq0Rg1qT7iFKzutuINy"; // Replace with your JSONBin API Key
const JSONBIN_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}`;

// Middleware
app.use(express.static('public'));
app.use(express.json());

// Serve index.html
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

// Serve todo.html
app.get('/todo', (req, res) => {
    res.sendFile(__dirname + '/public/todo.html');
});

// Fetch stored users from JSONBin
async function getUsers() {
    try {
        const response = await axios.get(JSONBIN_URL, { headers: { 'X-Master-Key': API_KEY } });
        return response.data.record || {};
    } catch (error) {
        console.error("Error fetching users:", error);
        return {};
    }
}

// Save users to JSONBin
async function saveUsers(users) {
    try {
        await axios.put(JSONBIN_URL, users, { headers: { 'X-Master-Key': API_KEY, 'Content-Type': 'application/json' } });
    } catch (error) {
        console.error("Error saving users:", error);
    }
}

// Create account
app.post('/create-account', async (req, res) => {
    const { username, password } = req.body;
    const users = await getUsers();

    if (users[username]) {
        return res.json({ error: "User already exists." });
    }

    users[username] = { password, tasks: [] };
    await saveUsers(users);

    res.json({ message: "Account created successfully!" });
});

// Login
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const users = await getUsers();

    if (!users[username]) {
        return res.json({ error: "No user found. Would you like to create an account?", createAccount: true });
    }

    if (users[username].password === password) {
        return res.json({ message: "Login successful!", redirect: "/todo" });
    } else {
        return res.json({ error: "Incorrect password." });
    }
});

// Add task
app.post('/add-task', async (req, res) => {
    const { username, task } = req.body;
    const users = await getUsers();

    if (!users[username]) {
        return res.json({ error: "User not found." });
    }

    users[username].tasks.push(task);
    await saveUsers(users);

    res.json({ message: "Task added successfully!" });
});

// Get tasks
app.get('/get-tasks', async (req, res) => {
    const { username } = req.query;
    const users = await getUsers();

    if (!users[username]) {
        return res.json({ error: "User not found." });
    }

    res.json({ tasks: users[username].tasks });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
