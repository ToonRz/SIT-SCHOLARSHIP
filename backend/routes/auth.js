const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { authenticateToken } = require('../middleware/auth');
const { registerValidation, loginValidation } = require('../middleware/validate');

const JWT_SECRET = process.env.JWT_SECRET || 'sit_kmutt_2024_secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

// Helper to generate token
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

// Register route
router.post('/register', registerValidation, async (req, res) => {
  const { student_id, email, password, first_name, last_name, phone, department, year_of_study, gpa } = req.body;

  try {
    // Check if user already exists
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ? OR student_id = ?', [email, student_id]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'อีเมลหรือรหัสนักศึกษานี้ถูกใช้งานแล้ว' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const [result] = await pool.query(
      `INSERT INTO users (student_id, email, password, first_name, last_name, phone, department, year_of_study, gpa, role) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'student')`,
      [student_id, email, hashedPassword, first_name, last_name, phone || null, department || null, year_of_study || null, gpa || null]
    );

    const [newUser] = await pool.query('SELECT id, student_id, email, first_name, last_name, phone, faculty, department, year_of_study, gpa, role FROM users WHERE id = ?', [result.insertId]);
    const user = newUser[0];
    const token = generateToken(user);

    return res.status(201).json({ token, user });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'เกิดข้อผิดพลาดในการลงทะเบียน' });
  }
});

// Login route
router.post('/login', loginValidation, async (req, res) => {
  const { email, password } = req.body;

  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(400).json({ message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' });
    }

    // Omit password from response
    const { password: _, ...userData } = user;
    const token = generateToken(user);

    return res.json({ token, user: userData });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ' });
  }
});

// Get current user profile
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, student_id, email, first_name, last_name, phone, faculty, department, year_of_study, gpa, role, created_at FROM users WHERE id = ?',
      [req.user.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: 'ไม่พบข้อมูลผู้ใช้งาน' });
    }
    return res.json(rows[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูลส่วนตัว' });
  }
});

// Update profile
router.put('/profile', authenticateToken, async (req, res) => {
  const { first_name, last_name, phone, department, year_of_study, gpa } = req.body;

  try {
    await pool.query(
      `UPDATE users 
       SET first_name = ?, last_name = ?, phone = ?, department = ?, year_of_study = ?, gpa = ? 
       WHERE id = ?`,
      [first_name, last_name, phone || null, department || null, year_of_study || null, gpa || null, req.user.id]
    );

    const [rows] = await pool.query(
      'SELECT id, student_id, email, first_name, last_name, phone, faculty, department, year_of_study, gpa, role FROM users WHERE id = ?',
      [req.user.id]
    );
    return res.json({ message: 'อัปเดตข้อมูลส่วนตัวสำเร็จ', user: rows[0] });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'เกิดข้อผิดพลาดในการอัปเดตข้อมูลส่วนตัว' });
  }
});

module.exports = router;
