const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const pool = require('../config/db');
const { authenticateToken } = require('../middleware/auth');
const { registerValidation, loginValidation } = require('../middleware/validate');

const JWT_SECRET = process.env.JWT_SECRET || 'sit_kmutt_2024_secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

const USER_FIELDS = `id, student_id, application_code, email, first_name, last_name, phone, faculty, department,
  year_of_study, semester, gpa, campus, gender, date_of_birth, personal_email, email_verified,
  father_income, mother_income, guardian_name, guardian_address, pdpa_consent_at, role, created_at`;

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

router.post('/register', registerValidation, async (req, res) => {
  const {
    student_id, application_code, email, password, first_name, last_name, phone,
    department, year_of_study, semester, gpa, pdpa_consent,
  } = req.body;

  if (!pdpa_consent) {
    return res.status(400).json({ message: 'กรุณายอมรับนโยบาย PDPA ก่อนสมัครสมาชิก' });
  }

  try {
    const [existing] = await pool.query(
      'SELECT id FROM users WHERE email = ? OR student_id = ? OR (application_code IS NOT NULL AND application_code = ?)',
      [email, student_id, application_code || null]
    );
    if (existing.length > 0) {
      return res.status(400).json({ message: 'อีเมล รหัสนักศึกษา หรือรหัสสมัครนี้ถูกใช้งานแล้ว' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const [result] = await pool.query(
      `INSERT INTO users (student_id, application_code, email, password, first_name, last_name, phone,
        department, year_of_study, semester, gpa, role, pdpa_consent_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'student', CURRENT_TIMESTAMP)`,
      [
        student_id, application_code || null, email, hashedPassword, first_name, last_name,
        phone || null, department || null, year_of_study || null, semester || null, gpa || null,
      ]
    );

    const [newUser] = await pool.query(`SELECT ${USER_FIELDS} FROM users WHERE id = ?`, [result.insertId]);
    const user = newUser[0];
    const token = generateToken(user);

    return res.status(201).json({ token, user });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'เกิดข้อผิดพลาดในการลงทะเบียน' });
  }
});

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

    const { password: _, ...userData } = user;
    const token = generateToken(user);

    return res.json({ token, user: userData });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ' });
  }
});

router.get('/me', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.query(`SELECT ${USER_FIELDS} FROM users WHERE id = ?`, [req.user.id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'ไม่พบข้อมูลผู้ใช้งาน' });
    }
    return res.json(rows[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูลส่วนตัว' });
  }
});

// Editable fields only (FR-20/21)
router.put('/profile', authenticateToken, async (req, res) => {
  const {
    phone, personal_email, gender, father_income, mother_income,
    guardian_name, guardian_address,
  } = req.body;

  try {
    await pool.query(
      `UPDATE users SET
        phone = ?, personal_email = ?, gender = ?,
        father_income = ?, mother_income = ?,
        guardian_name = ?, guardian_address = ?
       WHERE id = ?`,
      [
        phone || null,
        personal_email || null,
        gender || null,
        father_income ?? null,
        mother_income ?? null,
        guardian_name || null,
        guardian_address || null,
        req.user.id,
      ]
    );

    const [rows] = await pool.query(`SELECT ${USER_FIELDS} FROM users WHERE id = ?`, [req.user.id]);
    return res.json({ message: 'อัปเดตข้อมูลส่วนตัวสำเร็จ', user: rows[0] });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'เกิดข้อผิดพลาดในการอัปเดตข้อมูลส่วนตัว' });
  }
});

// Request Gmail/personal email verification (FR-22)
router.post('/verify-email/request', authenticateToken, async (req, res) => {
  const { personal_email } = req.body;
  if (!personal_email || !/^[^\s@]+@gmail\.com$/i.test(personal_email)) {
    return res.status(400).json({ message: 'กรุณากรอกอีเมล Gmail ที่ถูกต้อง' });
  }

  const token = crypto.randomBytes(32).toString('hex');

  try {
    await pool.query(
      'UPDATE users SET personal_email = ?, email_verify_token = ?, email_verified = 0 WHERE id = ?',
      [personal_email, token, req.user.id]
    );

    const verifyUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/profile?verify=${token}`;
    return res.json({
      message: 'ส่งคำขอยืนยันอีเมลแล้ว กรุณาตรวจสอบ Gmail ของคุณ',
      // Dev helper — remove in production when real email service is wired
      dev_verify_url: process.env.NODE_ENV !== 'production' ? verifyUrl : undefined,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'เกิดข้อผิดพลาดในการขอยืนยันอีเมล' });
  }
});

router.post('/verify-email/confirm', authenticateToken, async (req, res) => {
  const { token } = req.body;
  if (!token) {
    return res.status(400).json({ message: 'โทเคนไม่ถูกต้อง' });
  }

  try {
    const [rows] = await pool.query(
      'SELECT id FROM users WHERE id = ? AND email_verify_token = ?',
      [req.user.id, token]
    );
    if (rows.length === 0) {
      return res.status(400).json({ message: 'ลิงก์ยืนยันไม่ถูกต้องหรือหมดอายุ' });
    }

    await pool.query(
      'UPDATE users SET email_verified = 1, email_verify_token = NULL WHERE id = ?',
      [req.user.id]
    );

    const [user] = await pool.query(`SELECT ${USER_FIELDS} FROM users WHERE id = ?`, [req.user.id]);
    return res.json({ message: 'ยืนยันอีเมล Gmail สำเร็จ', user: user[0] });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'เกิดข้อผิดพลาดในการยืนยันอีเมล' });
  }
});

module.exports = router;
