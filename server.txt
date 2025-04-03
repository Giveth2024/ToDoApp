const express = require('express');
const app = express();
const port = process.env.PORT || 3000; // Render provides a dynamic port
const fs = require('fs');
const path = require('path');

// Serve static files from the public folder
app.use(express.static(path.join(__dirname, 'public')));

// Root endpoint to serve the HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
    console.log("HTML FILE Done:)")
});

// Serve the todo.html page after login
app.get('/todo', (req, res) => {
    res.sendFile(__dirname + '/public/todo.html');
});

// Middleware to parse JSON body
app.use(express.json());

// Directory for storing user data
const dataDir = path.join(__dirname, 'data');

// Ensure data directory exists
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
}


// Handle login route
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    const userFile = path.join(dataDir, `${username}.json`);

    // Check if the file already exists
    if (fs.existsSync(userFile)) {
        // File exists, check password
        const storedData = JSON.parse(fs.readFileSync(userFile, 'utf-8'));

        if (storedData.password === password) {
            return res.json({
                message: 'Login successful!',
                redirect: '/todo'  // This will be used for the redirect in the client
            });
        } else {
            return res.json({ error: 'Incorrect password.' });
        }
    } else {
        // File does not exist, ask user to create it
        return res.json({
            error: `No user found. Would you like to create an account?`,
            createAccount: true,
        });
    }
});

// Handle user creation
app.post('/create-account', (req, res) => {
    const { username, password } = req.body;

    const userFile = path.join(dataDir, `${username}.json`);

    if (fs.existsSync(userFile)) {
        return res.json({ error: 'User already exists.' });
    }

    // Store the password in a new JSON file
    const userData = { username, password };
    fs.writeFileSync(userFile, JSON.stringify(userData, null, 2));

    return res.json({ message: 'Account created successfully.' });
});


// Handle task addition
app.post('/add-task', (req, res) => {
    const { username, task } = req.body;
    const userFile = path.join(dataDir, `${username}.json`);

    if (fs.existsSync(userFile)) {
        const storedData = JSON.parse(fs.readFileSync(userFile, 'utf-8'));

        // Add the new task to the user's tasks array
        storedData.tasks = storedData.tasks || [];
        storedData.tasks.push(task);

        // Save the updated data back to the file
        fs.writeFileSync(userFile, JSON.stringify(storedData, null, 2));

        return res.json({ message: 'Task added successfully!' });
    } else {
        return res.json({ error: 'User not found.' });
    }
});

// Serve tasks for the user
app.get('/get-tasks', (req, res) => {
    const { username } = req.query;
    const userFile = path.join(dataDir, `${username}.json`);

    if (fs.existsSync(userFile)) {
        const storedData = JSON.parse(fs.readFileSync(userFile, 'utf-8'));
        return res.json({ tasks: storedData.tasks || [] });
    } else {
        return res.json({ error: 'User not found.' });
    }
});


// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://0.0.0.0:${port}`);
});
