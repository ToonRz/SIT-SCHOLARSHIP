const pool = require('./config/db');
const bcrypt = require('bcryptjs');

const seed = async () => {
  try {
    console.log('Starting seeding process...');

    // Clear existing data
    await pool.query('DELETE FROM applications');
    await pool.query('DELETE FROM scholarships');
    await pool.query('DELETE FROM users');

    // Reset auto-increment
    await pool.query('ALTER TABLE users AUTO_INCREMENT = 1');
    await pool.query('ALTER TABLE scholarships AUTO_INCREMENT = 1');
    await pool.query('ALTER TABLE applications AUTO_INCREMENT = 1');

    // Hash passwords
    const adminPassword = await bcrypt.hash('admin123', 10);
    const studentPassword = await bcrypt.hash('student123', 10);
    const committeePassword = await bcrypt.hash('committee123', 10);

    // ==================== USERS ====================
    // Admin (1)
    const [adminResult] = await pool.query(
      `INSERT INTO users (student_id, email, password, first_name, last_name, phone, faculty, department, year_of_study, gpa, role)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'admin')`,
      ['SIT-ADMIN', 'admin@sit.kmutt.ac.th', adminPassword, 'ผู้ดูแลระบบ', 'SIT KMUTT', '02-470-9850', 'School of Information Technology', 'IT', 4, 3.90, 'admin']
    );
    const adminId = adminResult.insertId;
    console.log('Seeded admin: admin@sit.kmutt.ac.th / admin123');

    // Committee (3)
    const committeeUsers = [
      { student_id: 'SIT-COM001', email: 'committee1@sit.kmutt.ac.th', first_name: 'ธนพล', last_name: 'วิชัยดิลก', phone: '08-1234-5678', department: 'Computer Science', year: 3, gpa: 3.75 },
      { student_id: 'SIT-COM002', email: 'committee2@sit.kmutt.ac.th', first_name: 'สุภาพร', last_name: 'มหาวัน', phone: '08-2345-6789', department: 'Information Technology', year: 3, gpa: 3.82 },
      { student_id: 'SIT-COM003', email: 'committee3@sit.kmutt.ac.th', first_name: 'วิชัย', last_name: 'สุขใจ', phone: '08-3456-7890', department: 'Data Science', year: 4, gpa: 3.95 }
    ];

    for (const c of committeeUsers) {
      await pool.query(
        `INSERT INTO users (student_id, email, password, first_name, last_name, phone, faculty, department, year_of_study, gpa, role)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'committee')`,
        [c.student_id, c.email, committeePassword, c.first_name, c.last_name, c.phone, 'School of Information Technology', c.department, c.year, c.gpa]
      );
    }
    console.log('Seeded 3 committee accounts: committee1/2/3@sit.kmutt.ac.th / committee123');

    // Students (5)
    const students = [
      { student_id: '6501', email: 'student1@sit.kmutt.ac.th', first_name: 'นภา', last_name: 'ใจเย็น', phone: '08-1111-1111', department: 'Computer Science', year: 1, gpa: 3.20 },
      { student_id: '6502', email: 'student2@sit.kmutt.ac.th', first_name: 'ธัญญา', last_name: 'รักดี', phone: '08-2222-2222', department: 'Information Technology', year: 2, gpa: 3.45 },
      { student_id: '6503', email: 'student3@sit.kmutt.ac.th', first_name: 'มาริษา', last_name: 'สุขสบาย', phone: '08-3333-3333', department: 'Data Science', year: 3, gpa: 3.78 },
      { student_id: '6504', email: 'student4@sit.kmutt.ac.th', first_name: 'ปิยะ', last_name: 'วงศ์อนุกูล', phone: '08-4444-4444', department: 'Computer Science', year: 4, gpa: 2.85 },
      { student_id: '6505', email: 'student5@sit.kmutt.ac.th', first_name: 'สุรศักดิ์', last_name: 'ใจกว้าง', phone: '08-5555-5555', department: 'Information Technology', year: 1, gpa: 2.60 }
    ];

    const studentIds = [];
    for (const s of students) {
      const [result] = await pool.query(
        `INSERT INTO users (student_id, email, password, first_name, last_name, phone, faculty, department, year_of_study, gpa, role)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'student')`,
        [s.student_id, s.email, studentPassword, s.first_name, s.last_name, s.phone, 'School of Information Technology', s.department, s.year, s.gpa]
      );
      studentIds.push(result.insertId);
    }
    console.log('Seeded 5 student accounts: student1-5@sit.kmutt.ac.th / student123');

    // ==================== SIT SCHOLARSHIPS (3 detailed) ====================

    // 1. ทุนเรียนดี - Good Academic Performance Scholarship
    const [sit1] = await pool.query(
      `INSERT INTO scholarships (name, description, eligibility, benefits, required_documents, application_start, application_end, status, max_recipients, scholarship_type, category, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        'ทุนเรียนดี',
        'มอบเป็นรางวัลสำหรับนักศึกษาผลการเรียนโดดเด่นเพื่อเป็นแรงจูงใจและสนับสนุนการศึกษาของนักศึกษา ผู้ได้รับทุนจะต้องมีส่วนร่วมในกิจกรรมอาสาสมัครหรือกิจกรรมทางวิชาการ',
        '• ต้องเป็นนักศึกษาระดับปริญญาตรีของคณะเทคโนโลยีสารสนเทศ (SIT)\n• มีคะแนนเฉลี่ยสะสม (GPAX) ไม่ต่ำกว่า 3.60\n• มีความประพฤติดี ไม่มีโทษทางวินัย\n• สามารถเข้าร่วมกิจกรรมอาสาสมัครหรือกิจกรรมอาสาสมัครทางวิชาการได้',
        '• วงเงินทุนตามงบประมาณประจำปีของคณะ\n• พิจารณาจากลำดับคะแนน GPAX และเอกสารประกอบ\n• การจัดสรรขึ้นอยู่กับงบประมาณที่คณะกำหนดในแต่ละปีการศึกษา',
        '• ใบสมัครทุนการศึกษา\n• ระเบียนแสดงผลการเรียนอย่างเป็นทางการ (Transcript) แสดงคะแนนเฉลี่ยสะสม GPAX\n• หลักฐานการเข้าร่วมกิจกรรม (ถ้ามี)\n• หนังสือรับรองความประพฤติจากอาจารย์ที่ปรึกษา',
        '2026-06-01',
        '2026-07-31',
        'open',
        50,
        'sit-merit',
        'sit',
        adminId
      ]
    );
    console.log('Seeded scholarship: ทุนเรียนดี');

    // 2. ทุนกิจกรรมดีเด่น - Outstanding Activity Scholarship
    const [sit2] = await pool.query(
      `INSERT INTO scholarships (name, description, eligibility, benefits, required_documents, application_start, application_end, status, max_recipients, scholarship_type, category, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        'ทุนกิจกรรมดีเด่น',
        'สนับสนุนนักศึกษาที่สร้างชื่อเสียงให้คณะและมหาวิทยาลัยจากการได้รับรางวัลในการแข่งขันด้าน IT หรือเทคโนโลยีคอมพิวเตอร์ สามารถยื่นขอได้ตลอดปีการศึกษา โดยเอกสารต้องยื่นภายใน 6 เดือนหลังได้รับรางวัล',
        '• ต้องเป็นนักศึกษาระดับปริญญาตรีของคณะ SIT\n• ต้องผ่านการศึกษามาแล้วอย่างน้อย 1 ภาคการศึกษา\n• ต้องเข้าร่วมและได้รับรางวัลในการแข่งขันด้าน IT, คอมพิวเตอร์ หรือสาขาที่เกี่ยวข้อง จากหน่วยงานภายในหรือภายนอก\n• รางวัลที่ได้รับต้องยื่นเอกสารภายใน 6 เดือนหลังจากได้รับรางวัล',
        '• วงเงินทุนตามดุลยพินิจของคณะกรรมการทุน\n• พิจารณาตามเกณฑ์ "ทุนเพชรพระจอมเกล้า" ของมหาวิทยาลัย\n• หากได้รับทุนเพชรพระจอมเกล้าแล้วจะไม่รับพิจารณาซ้ำ',
        '• ใบสมัครทุนการศึกษา\n• เอกสาร/หลักฐานการได้รับรางวัล (ต้องยื่นภายใน 6 เดือนหลังได้รับรางวัล)\n• ผลงานที่ส่งเข้าประกวด\n• สำเนาประกาศนียบัตรรางวัล',
        '2026-06-01',
        '2026-12-31',
        'open',
        20,
        'sit-activity',
        'sit',
        adminId
      ]
    );
    console.log('Seeded scholarship: ทุนกิจกรรมดีเด่น');

    // 3. ทุนจ้างงาน - Work-Study Scholarship
    const [sit3] = await pool.query(
      `INSERT INTO scholarships (name, description, eligibility, benefits, required_documents, application_start, application_end, status, max_recipients, scholarship_type, category, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        'ทุนจ้างงาน',
        'สร้างโอกาสให้นักศึกษาได้รับประสบการณ์การทำงานที่เป็นประโยชน์ในเวลาว่าง พร้อมทั้งสร้างรายได้ระหว่างเรียนเพื่อช่วยค่าใช้จ่าย',
        '• ต้องเป็นนักศึกษาระดับปริญญาตรีของคณะ SIT\n• ต้องผ่านการศึกษามาแล้วอย่างน้อย 1 ภาคการศึกษา\n• มีคะแนนเฉลี่ยสะสม (GPAX) ไม่ต่ำกว่า 2.50\n• มีความประพฤติดีและสามารถปฏิบัติงานที่ได้รับมอบหมายได้',
        '• เงินเดือนฐาน: 6,000 บาท สำหรับภาคปกติ (1 และ 2), 10,000 บาท สำหรับภาคพิเศษ\n• ค่าตอบแทนการทำงาน: 50 บาท/ชั่วโมง\n• สูงสุด 300 บาท/วัน, ไม่เกิน 2,000 บาท/สัปดาห์\n• จ่ายรายเดือนตามชั่วโมงที่ทำงานจริง',
        '• ตารางเรียน\n• สำเนาสมุดบัญชีธนาคาร\n• หนังสือรับรองจากอาจารย์ที่ปรึกษา (ถ้ามี)\n• เอกสารยินยอมจากผู้ปกครอง (สำหรับนักศึกษาต่ำกว่า 20 ปี)',
        '2026-06-01',
        '2026-10-31',
        'open',
        100,
        'sit-work',
        'sit',
        adminId
      ]
    );
    console.log('Seeded scholarship: ทุนจ้างงาน');

    console.log('\n=== Database seeding completed ===');
    console.log('Users: 1 admin + 3 committee + 5 students');
    console.log('Scholarships: 3 SIT scholarships only');
    console.log('\n--- Login credentials ---');
    console.log('Admin: admin@sit.kmutt.ac.th / admin123');
    console.log('Committee: committee1@sit.kmutt.ac.th / committee123');
    console.log('Students: student1@sit.kmutt.ac.th / student123');
    console.log('---');

    process.exit(0);
  } catch (error) {
    console.error('Error during database seeding:', error);
    process.exit(1);
  }
};

seed();