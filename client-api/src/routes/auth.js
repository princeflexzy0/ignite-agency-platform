const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const { JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, company, phone } = req.body;
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const result = await db.query(
      'INSERT INTO users (name, email, password, company, phone) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, company, phone',
      [name, email, hashedPassword, company, phone]
    );
    
    const token = jwt.sign({ id: result.rows[0].id, email, role: 'user' }, JWT_SECRET);
    
    res.json({ token, user: result.rows[0] });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password);
    
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign({ id: user.id, email: user.email, role: 'user' }, JWT_SECRET);
    
    res.json({ 
      token, 
      user: { id: user.id, name: user.name, email: user.email, company: user.company, phone: user.phone }
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
