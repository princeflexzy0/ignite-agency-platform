const express = require('express');
const db = require('../config/database');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Get billing info and invoices
router.get('/', authMiddleware, async (req, res) => {
  try {
    const invoices = await db.query(
      'SELECT i.*, o.service_name FROM invoices i LEFT JOIN orders o ON i.order_id = o.id WHERE i.user_id = $1 ORDER BY i.created_at DESC',
      [req.user.id]
    );
    
    res.json({
      invoices: invoices.rows,
      paymentMethods: []
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get invoices only
router.get('/invoices', authMiddleware, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT i.*, o.service_name FROM invoices i LEFT JOIN orders o ON i.order_id = o.id WHERE i.user_id = $1 ORDER BY i.created_at DESC',
      [req.user.id]
    );
    
    res.json(result.rows);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
