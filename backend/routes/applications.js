const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { applicationValidation } = require('../middleware/validate');

// POST /api/applications (Student submit application)
router.post('/', authenticateToken, authorizeRoles('student'), applicationValidation, async (req, res) => {
  const { scholarship_id, statement, family_income, additional_info, document_url } = req.body;

  try {
    // 1. Check if scholarship exists and is open
    const [scholarships] = await pool.query('SELECT status FROM scholarships WHERE id = ?', [scholarship_id]);
    if (scholarships.length === 0) {
      return res.status(404).json({ message: 'ไม่พบทุนการศึกษานี้' });
    }
    if (scholarships[0].status !== 'open') {
      return res.status(400).json({ message: 'ทุนการศึกษานี้ไม่ได้เปิดรับสมัครในขณะนี้' });
    }

    // 2. Check if user already applied to this scholarship
    const [existing] = await pool.query('SELECT id FROM applications WHERE user_id = ? AND scholarship_id = ?', [req.user.id, scholarship_id]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'คุณได้สมัครทุนการศึกษานี้ไปแล้ว' });
    }

    // 3. Insert application
    const [result] = await pool.query(
      `INSERT INTO applications (user_id, scholarship_id, statement, family_income, additional_info, document_url, status)
       VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
      [req.user.id, scholarship_id, statement, family_income, additional_info || null, document_url || null]
    );

    return res.status(201).json({ message: 'ส่งใบสมัครสำเร็จ', applicationId: result.insertId });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'เกิดข้อผิดพลาดในการส่งใบสมัคร' });
  }
});

// GET /api/applications/my (Student's own applications)
router.get('/my', authenticateToken, authorizeRoles('student'), async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT a.*, s.name as scholarship_name, s.scholarship_type, s.category, s.application_end
       FROM applications a
       JOIN scholarships s ON a.scholarship_id = s.id
       WHERE a.user_id = ?
       ORDER BY a.submitted_at DESC`,
      [req.user.id]
    );
    return res.json(rows);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูลใบสมัครของคุณ' });
  }
});

// GET /api/applications (Admin/Committee all applications)
router.get('/', authenticateToken, authorizeRoles('admin', 'committee'), async (req, res) => {
  const { status, scholarship_id } = req.query;
  let sql = `
    SELECT a.*, 
           s.name as scholarship_name, s.scholarship_type, s.category,
           u.student_id, u.first_name, u.last_name, u.email, u.phone, u.department, u.year_of_study, u.gpa
    FROM applications a
    JOIN scholarships s ON a.scholarship_id = s.id
    JOIN users u ON a.user_id = u.id
  `;
  const params = [];
  const conditions = [];

  if (status) {
    conditions.push('a.status = ?');
    params.push(status);
  }
  if (scholarship_id) {
    conditions.push('a.scholarship_id = ?');
    params.push(scholarship_id);
  }

  if (conditions.length > 0) {
    sql += ' WHERE ' + conditions.join(' AND ');
  }

  sql += ' ORDER BY a.submitted_at DESC';

  try {
    const [rows] = await pool.query(sql, params);
    return res.json(rows);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูลใบสมัครทั้งหมด' });
  }
});

// GET /api/applications/:id (Detail page)
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT a.*, 
             s.name as scholarship_name, s.scholarship_type, s.category, s.required_documents,
             u.student_id, u.first_name, u.last_name, u.email, u.phone, u.department, u.year_of_study, u.gpa
      FROM applications a
      JOIN scholarships s ON a.scholarship_id = s.id
      JOIN users u ON a.user_id = u.id
      WHERE a.id = ?`,
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'ไม่พบใบสมัครนี้' });
    }

    const application = rows[0];

    // Authorize: Students can only view their own applications
    if (req.user.role === 'student' && application.user_id !== req.user.id) {
      return res.status(403).json({ message: 'คุณไม่มีสิทธิ์ดูรายละเอียดใบสมัครนี้' });
    }

    return res.json(application);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงรายละเอียดใบสมัคร' });
  }
});

// PUT /api/applications/:id (Student edits pending application)
router.put('/:id', authenticateToken, authorizeRoles('student'), applicationValidation, async (req, res) => {
  const { statement, family_income, additional_info, document_url } = req.body;

  try {
    const [existing] = await pool.query('SELECT user_id, status FROM applications WHERE id = ?', [req.params.id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'ไม่พบใบสมัครนี้' });
    }

    if (existing[0].user_id !== req.user.id) {
      return res.status(403).json({ message: 'คุณไม่มีสิทธิ์แก้ไขใบสมัครนี้' });
    }

    if (existing[0].status !== 'pending') {
      return res.status(400).json({ message: 'ไม่สามารถแก้ไขใบสมัครที่อยู่ระหว่างการพิจารณาหรือพิจารณาเสร็จสิ้นแล้ว' });
    }

    await pool.query(
      `UPDATE applications 
       SET statement = ?, family_income = ?, additional_info = ?, document_url = ? 
       WHERE id = ?`,
      [statement, family_income, additional_info || null, document_url || null, req.params.id]
    );

    return res.json({ message: 'แก้ไขใบสมัครสำเร็จ' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'เกิดข้อผิดพลาดในการแก้ไขใบสมัคร' });
  }
});

// DELETE /api/applications/:id (Cancel/Delete application)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const [existing] = await pool.query('SELECT user_id, status FROM applications WHERE id = ?', [req.params.id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'ไม่พบใบสมัครนี้' });
    }

    if (req.user.role === 'student') {
      if (existing[0].user_id !== req.user.id) {
        return res.status(403).json({ message: 'คุณไม่มีสิทธิ์ยกเลิกใบสมัครนี้' });
      }
      if (existing[0].status !== 'pending') {
        return res.status(400).json({ message: 'ไม่สามารถยกเลิกใบสมัครที่อยู่ระหว่างพิจารณาหรือได้รับการพิจารณาแล้ว' });
      }
    } else if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'เฉพาะผู้สมัครหรือผู้ดูแลระบบที่ยกเลิกใบสมัครได้' });
    }

    await pool.query('DELETE FROM applications WHERE id = ?', [req.params.id]);
    return res.json({ message: 'ลบใบสมัครสำเร็จ' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'เกิดข้อผิดพลาดในการยกเลิกใบสมัคร' });
  }
});

// PATCH /api/applications/:id/review (Admin/Committee updates application evaluation)
router.patch('/:id/review', authenticateToken, authorizeRoles('admin', 'committee'), async (req, res) => {
  const { status, admin_comment } = req.body;
  if (!['reviewing', 'approved', 'rejected'].includes(status)) {
    return res.status(400).json({ message: 'สถานะไม่ถูกต้อง' });
  }

  try {
    const [existing] = await pool.query('SELECT id FROM applications WHERE id = ?', [req.params.id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'ไม่พบใบสมัครนี้' });
    }

    await pool.query(
      `UPDATE applications 
       SET status = ?, admin_comment = ?, reviewed_by = ?, reviewed_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [status, admin_comment || null, req.user.id, req.params.id]
    );

    return res.json({ message: 'บันทึกการพิจารณาใบสมัครสำเร็จ' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'เกิดข้อผิดพลาดในการพิจารณาใบสมัคร' });
  }
});

module.exports = router;
