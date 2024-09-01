const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;
const SECRET_KEY = 'your_secret_key';

app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// Initialize SQLite database
const db = new sqlite3.Database(':memory:');
db.serialize(() => {
  db.run("CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT, email TEXT UNIQUE, password TEXT)");
});

// Register user
app.post('/register', (req, res) => {
  const { name, email, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 8);

  const stmt = db.prepare("INSERT INTO users (name, email, password) VALUES (?, ?, ?)");
  stmt.run(name, email, hashedPassword, function (err) {
    if (err) {
      console.error('Error registering user:', err.message);
      return res.status(400).json({ message: 'Error registering user', error: err.message });
    }
    res.status(201).json({ message: 'User registered' });
  });
  stmt.finalize();
});

// Login user
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  db.get("SELECT * FROM users WHERE email = ?", [email], (err, user) => {
    if (err) {
      console.error('Error finding user:', err.message);
      return res.status(500).json({ message: 'Internal server error' });
    }
    if (!user) {
      console.error('User not found');
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    if (!bcrypt.compareSync(password, user.password)) {
      console.error('Password mismatch');
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id }, SECRET_KEY, { expiresIn: '1h' });
    res.json({ token });
  });
});

// Auth middleware
const auth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'Access denied' });

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(400).json({ message: 'Invalid token' });
  }
};

// Protected route
app.get('/dashboard', auth, (req, res) => {
  db.get("SELECT * FROM users WHERE id = ?", [req.user.id], (err, user) => {
    if (err) {
      return res.status(400).json({ message: 'User not found' });
    }
    res.json(user);
  });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

