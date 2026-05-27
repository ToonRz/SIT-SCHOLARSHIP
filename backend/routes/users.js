const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// List all users (Admin only)
router.get('/', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  const { role, search } = req.query;
  let sql = 'SELECT id, student_id, email, first_name, last_name, phone, faculty, department, year_of_study, gpa, role, created_at FROM users';
  const params = [];

  const conditions = [];
  if (role) {
    conditions.push('role = ?');
    params.push(role);
  }
  if (search) {
    conditions.push('(first_name LIKE ? OR last_name LIKE ? OR student_id LIKE ? OR email LIKE ?)');
    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm, searchTerm, searchTerm);
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
    return res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้งาน' });
  }
});

// Admin Dashboard stats
router.get('/stats/dashboard', authenticateToken, authorizeRoles('admin', 'committee'), async (req, res) => {
  try {
    const [[{ totalUsers }]] = await pool.query('SELECT COUNT(*) as totalUsers FROM users');
    const [[{ totalScholarships }]] = await pool.query('SELECT COUNT(*) as totalScholarships FROM scholarships');
    const [[{ totalApplications }]] = await pool.query('SELECT COUNT(*) as totalApplications FROM applications');
    const [[{ pending }]] = await pool.query("SELECT COUNT(*) as pending FROM applications WHERE status = 'pending'");
    const [[{ reviewing }]] = await pool.query("SELECT COUNT(*) as reviewing FROM applications WHERE status = 'reviewing'");
    const [[{ approved }]] = await pool.query("SELECT COUNT(*) as approved FROM applications WHERE status = 'approved'");
    const [[{ rejected }]] = await pool.query("SELECT COUNT(*) as rejected FROM applications WHERE status = 'rejected'");

    return res.json({
      totalUsers,
      totalScholarships,
      totalApplications,
      pending: pending + reviewing, // combining pending & reviewing under 'pending' category if desired or separate
      approved,
      rejected
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูลสถิติ' });
  }
});

// Get user detail (Admin only)
router.get('/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, student_id, email, first_name, last_name, phone, faculty, department, year_of_study, gpa, role, created_at FROM users WHERE id = ?',
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: 'ไม่พบผู้ใช้นี้' });
    }
    return res.json(rows[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงรายละเอียดผู้ใช้งาน' });
  }
});

// Change user role (Admin only)
router.put('/:id/role', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  const { role } = req.body;
  if (!['student', 'admin', 'committee'].includes(role)) {
    return res.status(400).json({ message: 'บทบาทไม่ถูกต้อง' });
  }

  try {
    // Prevent changing own role
    if (parseInt(req.params.id) === req.user.id) {
      return res.status(400).json({ message: 'ไม่สามารถเปลี่ยนบทบาทของตัวเองได้' });
    }

    await pool.query('UPDATE users SET role = ? WHERE id = ?', [role, req.params.id]);
    return res.json({ message: 'เปลี่ยนบทบาทผู้ใช้สำเร็จ' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'เกิดข้อผิดพลาดในการแก้ไขบทบาท' });
  }
});

// Delete user (Admin only)
router.delete('/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    if (parseInt(req.params.id) === req.user.id) {
      return res.status(400).json({ message: 'ไม่สามารถลบตัวเองได้' });
    }

    await pool.query('DELETE FROM users WHERE id = ?', [req.params.id]);
    return res.json({ message: 'ลบผู้ใช้สำเร็จ' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'เกิดข้อผิดพลาดในการลบผู้ใช้งาน' });
  }
});

module.exports = router;
