const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { applicationValidation } = require('../middleware/validate');
const { uploadPdf } = require('../middleware/upload');
const { validateApplicationDocuments } = require('../utils/documents');

const parseDocuments = (raw) => {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
};

// POST upload PDF (Student)
router.post('/upload', authenticateToken, authorizeRoles('student'), (req, res) => {
  uploadPdf.single('file')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: err.message || 'อัปโหลดไฟล์ไม่สำเร็จ' });
    }
    if (!req.file) {
      return res.status(400).json({ message: 'กรุณาเลือกไฟล์ PDF' });
    }
    return res.status(201).json({
      filename: req.file.filename,
      originalName: req.file.originalname,
      url: `/api/uploads/applications/${req.file.filename}`,
      size: req.file.size,
    });
  });
});

// POST submit application (Student)
router.post('/', authenticateToken, authorizeRoles('student'), applicationValidation, async (req, res) => {
  const { scholarship_id, statement, family_income, additional_info, documents } = req.body;
  const docList = parseDocuments(documents);

  try {
    const [scholarships] = await pool.query(
      'SELECT status, required_documents FROM scholarships WHERE id = ?',
      [scholarship_id]
    );
    if (scholarships.length === 0) {
      return res.status(404).json({ message: 'ไม่พบทุนการศึกษานี้' });
    }
    if (scholarships[0].status !== 'open') {
      return res.status(400).json({ message: 'ทุนการศึกษานี้ไม่ได้เปิดรับสมัครในขณะนี้' });
    }

    const docCheck = validateApplicationDocuments(scholarships[0].required_documents, docList);
    if (!docCheck.valid) {
      return res.status(400).json({
        message: 'เอกสารแนบไม่ครบถ้วน กรุณาแนบ PDF ให้ครบตามรายการ',
        missingDocuments: docCheck.missing,
      });
    }

    const [existing] = await pool.query(
      'SELECT id FROM applications WHERE user_id = ? AND scholarship_id = ?',
      [req.user.id, scholarship_id]
    );
    if (existing.length > 0) {
      return res.status(400).json({ message: 'คุณได้สมัครทุนการศึกษานี้ไปแล้ว' });
    }

    const documentUrl = docList.length > 0 ? docList[0].url : null;

    const [result] = await pool.query(
      `INSERT INTO applications (user_id, scholarship_id, statement, family_income, additional_info, document_url, documents, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [
        req.user.id,
        scholarship_id,
        statement,
        family_income,
        additional_info || null,
        documentUrl,
        JSON.stringify(docList),
      ]
    );

    return res.status(201).json({ message: 'ส่งใบสมัครสำเร็จ', applicationId: result.insertId });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'เกิดข้อผิดพลาดในการส่งใบสมัคร' });
  }
});

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

router.get('/', authenticateToken, authorizeRoles('admin', 'committee'), async (req, res) => {
  const { status, scholarship_id } = req.query;
  let sql = `
    SELECT a.*,
           s.name as scholarship_name, s.scholarship_type, s.category,
           u.student_id, u.application_code, u.first_name, u.last_name, u.email, u.phone, u.department, u.year_of_study, u.gpa
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

router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT a.*,
             s.name as scholarship_name, s.scholarship_type, s.category, s.required_documents,
             u.student_id, u.application_code, u.first_name, u.last_name, u.email, u.phone, u.department, u.year_of_study, u.gpa
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

    if (req.user.role === 'student' && application.user_id !== req.user.id) {
      return res.status(403).json({ message: 'คุณไม่มีสิทธิ์ดูรายละเอียดใบสมัครนี้' });
    }

    return res.json(application);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงรายละเอียดใบสมัคร' });
  }
});

router.put('/:id', authenticateToken, authorizeRoles('student'), applicationValidation, async (req, res) => {
  const { statement, family_income, additional_info, documents } = req.body;
  const docList = parseDocuments(documents);

  try {
    const [existing] = await pool.query(
      `SELECT a.user_id, a.status, s.required_documents
       FROM applications a
       JOIN scholarships s ON a.scholarship_id = s.id
       WHERE a.id = ?`,
      [req.params.id]
    );
    if (existing.length === 0) {
      return res.status(404).json({ message: 'ไม่พบใบสมัครนี้' });
    }

    if (existing[0].user_id !== req.user.id) {
      return res.status(403).json({ message: 'คุณไม่มีสิทธิ์แก้ไขใบสมัครนี้' });
    }

    if (existing[0].status !== 'pending') {
      return res.status(400).json({ message: 'ไม่สามารถแก้ไขใบสมัครที่อยู่ระหว่างการพิจารณาหรือพิจารณาเสร็จสิ้นแล้ว' });
    }

    const docCheck = validateApplicationDocuments(existing[0].required_documents, docList);
    if (!docCheck.valid) {
      return res.status(400).json({
        message: 'เอกสารแนบไม่ครบถ้วน',
        missingDocuments: docCheck.missing,
      });
    }

    const documentUrl = docList.length > 0 ? docList[0].url : null;

    await pool.query(
      `UPDATE applications
       SET statement = ?, family_income = ?, additional_info = ?, document_url = ?, documents = ?
       WHERE id = ?`,
      [statement, family_income, additional_info || null, documentUrl, JSON.stringify(docList), req.params.id]
    );

    return res.json({ message: 'แก้ไขใบสมัครสำเร็จ' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'เกิดข้อผิดพลาดในการแก้ไขใบสมัคร' });
  }
});

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
