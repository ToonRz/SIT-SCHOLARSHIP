const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { scholarshipValidation } = require('../middleware/validate');

// GET all scholarships (Public)
router.get('/', async (req, res) => {
  const { status, type, category, search } = req.query;
  let sql = 'SELECT * FROM scholarships';
  const params = [];
  const conditions = [];

  if (status) {
    conditions.push('status = ?');
    params.push(status);
  }
  if (type) {
    conditions.push('scholarship_type = ?');
    params.push(type);
  }
  if (category) {
    conditions.push('category = ?');
    params.push(category);
  }
  if (search) {
    conditions.push('(name LIKE ? OR description LIKE ? OR eligibility LIKE ?)');
    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm, searchTerm);
  }

  if (conditions.length > 0) {
    sql += ' WHERE ' + conditions.join(' AND ');
  }

  sql += ' ORDER BY created_at DESC';

  try {
    const [rows] = await pool.query(sql, params);
    return res.json(rows);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูลทุนการศึกษา' });
  }
});

// GET scholarship stats — applicant count (Public)
router.get('/:id/stats', async (req, res) => {
  try {
    const [scholarship] = await pool.query('SELECT id, max_recipients FROM scholarships WHERE id = ?', [req.params.id]);
    if (scholarship.length === 0) {
      return res.status(404).json({ message: 'ไม่พบทุนการศึกษานี้' });
    }
    const [countRows] = await pool.query(
      'SELECT COUNT(*) AS applicant_count FROM applications WHERE scholarship_id = ?',
      [req.params.id]
    );
    const applicantCount = countRows[0].applicant_count;
    const maxRecipients = scholarship[0].max_recipients || 0;
    return res.json({
      applicant_count: applicantCount,
      max_recipients: maxRecipients,
      slots_remaining: maxRecipients > 0 ? Math.max(0, maxRecipients - applicantCount) : null,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงสถิติผู้สมัคร' });
  }
});

// GET applicants list (Admin/Committee)
router.get('/:id/applicants', authenticateToken, authorizeRoles('admin', 'committee'), async (req, res) => {
  try {
    const [scholarship] = await pool.query('SELECT id, name FROM scholarships WHERE id = ?', [req.params.id]);
    if (scholarship.length === 0) {
      return res.status(404).json({ message: 'ไม่พบทุนการศึกษานี้' });
    }
    const [rows] = await pool.query(
      `SELECT a.id, a.status, a.submitted_at,
              u.student_id, u.application_code, u.first_name, u.last_name, u.department, u.year_of_study, u.gpa
       FROM applications a
       JOIN users u ON a.user_id = u.id
       WHERE a.scholarship_id = ?
       ORDER BY a.submitted_at DESC`,
      [req.params.id]
    );
    return res.json({ scholarship: scholarship[0], applicants: rows, total: rows.length });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงรายชื่อผู้สมัคร' });
  }
});

// GET scholarship by ID (Public)
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM scholarships WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'ไม่พบทุนการศึกษานี้' });
    }
    return res.json(rows[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงรายละเอียดทุนการศึกษา' });
  }
});

// POST create scholarship (Admin only)
router.post('/', authenticateToken, authorizeRoles('admin'), scholarshipValidation, async (req, res) => {
  const { name, description, eligibility, benefits, required_documents, application_start, application_end, status, max_recipients, scholarship_type, category } = req.body;

  try {
    const [result] = await pool.query(
      `INSERT INTO scholarships (name, description, eligibility, benefits, required_documents, application_start, application_end, status, max_recipients, scholarship_type, category, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, description || null, eligibility || null, benefits || null, required_documents || null, application_start || null, application_end || null, status || 'upcoming', max_recipients || 0, scholarship_type, category, req.user.id]
    );

    const [newScholarship] = await pool.query('SELECT * FROM scholarships WHERE id = ?', [result.insertId]);
    return res.status(201).json(newScholarship[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'เกิดข้อผิดพลาดในการสร้างทุนการศึกษา' });
  }
});

// PUT update scholarship (Admin only)
router.put('/:id', authenticateToken, authorizeRoles('admin'), scholarshipValidation, async (req, res) => {
  const { name, description, eligibility, benefits, required_documents, application_start, application_end, status, max_recipients, scholarship_type, category } = req.body;

  try {
    const [existing] = await pool.query('SELECT id FROM scholarships WHERE id = ?', [req.params.id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'ไม่พบทุนการศึกษานี้' });
    }

    await pool.query(
      `UPDATE scholarships 
       SET name = ?, description = ?, eligibility = ?, benefits = ?, required_documents = ?, application_start = ?, application_end = ?, status = ?, max_recipients = ?, scholarship_type = ?, category = ? 
       WHERE id = ?`,
      [name, description || null, eligibility || null, benefits || null, required_documents || null, application_start || null, application_end || null, status || 'upcoming', max_recipients || 0, scholarship_type, category, req.params.id]
    );

    const [updated] = await pool.query('SELECT * FROM scholarships WHERE id = ?', [req.params.id]);
    return res.json(updated[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'เกิดข้อผิดพลาดในการแก้ไขทุนการศึกษา' });
  }
});

// DELETE scholarship (Admin only)
router.delete('/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const [existing] = await pool.query('SELECT id FROM scholarships WHERE id = ?', [req.params.id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'ไม่พบทุนการศึกษานี้' });
    }

    await pool.query('DELETE FROM scholarships WHERE id = ?', [req.params.id]);
    return res.json({ message: 'ลบทุนการศึกษาสำเร็จ' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'เกิดข้อผิดพลาดในการลบทุนการศึกษา' });
  }
});

module.exports = router;
