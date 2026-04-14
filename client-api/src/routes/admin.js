const express = require('express');
const db = require('../config/database');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();

// Get all users
router.get('/users', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT id, name, email, company, phone, created_at FROM users ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all orders
router.get('/orders', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT o.*, u.name as user_name, u.email as user_email FROM orders o LEFT JOIN users u ON o.user_id = u.id ORDER BY o.created_at DESC'
    );
    res.json(result.rows);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get analytics
router.get('/analytics', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const totalUsers = await db.query('SELECT COUNT(*) FROM users');
    const totalOrders = await db.query('SELECT COUNT(*) FROM orders');
    const totalRevenue = await db.query('SELECT SUM(amount) FROM orders WHERE status = $1', ['completed']);
    const pendingOrders = await db.query('SELECT COUNT(*) FROM orders WHERE status = $1', ['pending']);
    
    res.json({
      totalUsers: parseInt(totalUsers.rows[0].count),
      totalOrders: parseInt(totalOrders.rows[0].count),
      totalRevenue: parseFloat(totalRevenue.rows[0].sum || 0),
      pendingOrders: parseInt(pendingOrders.rows[0].count)
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
