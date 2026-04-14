const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const supabase = require('../config/database');
const { JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, company, phone } = req.body;
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const { data, error } = await supabase
      .from('users')
      .insert([{ name, email, password: hashedPassword, company, phone }])
      .select()
      .single();
    
    if (error) throw error;
    
    const token = jwt.sign({ id: data.id, email, role: 'user' }, JWT_SECRET);
    
    res.json({ token, user: { id: data.id, name: data.name, email: data.email, company: data.company, phone: data.phone } });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    
    if (error || !user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
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
