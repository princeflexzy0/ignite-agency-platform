const express = require('express');
const db = require('../config/database');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Get user profile
router.get('/', authMiddleware, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT id, name, email, company, phone, created_at FROM users WHERE id = $1',
      [req.user.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update user profile
router.put('/', authMiddleware, async (req, res) => {
  try {
    const { name, company, phone } = req.body;
    
    const result = await db.query(
      'UPDATE users SET name = $1, company = $2, phone = $3, updated_at = NOW() WHERE id = $4 RETURNING id, name, email, company, phone',
      [name, company, phone, req.user.id]
    );
    
    res.json(result.rows[0]);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
