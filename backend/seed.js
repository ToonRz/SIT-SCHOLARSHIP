const pool = require('./config/db');
const bcrypt = require('bcryptjs');

const seed = async () => {
  try {
    console.log('Starting seeding process...');

    // Clear existing data (be careful with ordering due to FK constraints)
    await pool.query('DELETE FROM applications');
    await pool.query('DELETE FROM scholarships');
    await pool.query('DELETE FROM users');

    // Reset auto-increment
    await pool.query('ALTER TABLE users AUTO_INCREMENT = 1');
    await pool.query('ALTER TABLE scholarships AUTO_INCREMENT = 1');
    await pool.query('ALTER TABLE applications AUTO_INCREMENT = 1');

    // Hash admin password
    const adminPassword = await bcrypt.hash('admin123', 10);

    // Insert admin user
    const [adminResult] = await pool.query(
      `INSERT INTO users (student_id, email, password, first_name, last_name, phone, role) 
       VALUES (?, ?, ?, ?, ?, ?, 'admin')`,
      ['SIT-ADMIN', 'admin@sit.kmutt.ac.th', adminPassword, 'ผู้ดูแลระบบ', 'SIT KMUTT', '02-470-9850']
    );
    const adminId = adminResult.insertId;
    console.log('Seeded admin account (admin@sit.kmutt.ac.th / admin123).');

    // List of 18 scholarships
    const scholarships = [
      // กลุ่ม 1: ทุนคณะ SIT
      {
        name: 'ทุนเรียนดี SIT',
        description: 'มอบเป็นรางวัลสำหรับนักศึกษาผลการเรียนโดดเด่น ส่งเสริมจิตอาสาแบ่งปันความรู้',
        eligibility: 'นักศึกษา SIT ระดับ ป.ตรี, พิจารณาเรียงตาม GPAX, ประพฤติดี',
        benefits: 'ตามงบประมาณแต่ละปี พิจารณาเรียงตามเกรด',
        required_documents: 'ใบแสดงผลการเรียน (GPAX)\nใบสมัครทุนการศึกษา',
        application_start: '2026-06-01',
        application_end: '2026-07-31',
        status: 'open',
        max_recipients: 50,
        scholarship_type: 'sit-merit',
        category: 'sit'
      },
      {
        name: 'ทุนกิจกรรมเด่น SIT',
        description: 'มอบให้นักศึกษาสร้างชื่อเสียงจากการประกวด/รางวัลด้าน IT หรือคอมพิวเตอร์ ยื่นขอได้ตลอดปีการศึกษา ภายใน 6 เดือนหลังได้รับรางวัล',
        eligibility: 'นักศึกษา SIT ที่สร้างชื่อเสียงจากการประกวดหรือรับรางวัล',
        benefits: 'ทุนการศึกษาพิเศษพิจารณาเป็นรายกรณี',
        required_documents: 'หลักฐานการได้รับรางวัล/ประกาศนียบัตร\nผลงานที่ส่งเข้าประกวด',
        application_start: '2026-06-01',
        application_end: '2026-12-31',
        status: 'open',
        max_recipients: 20,
        scholarship_type: 'sit-activity',
        category: 'sit'
      },
      {
        name: 'ทุนจ้างงาน SIT',
        description: 'ส่งเสริมใช้เวลาว่างให้เกิดประโยชน์ มีรายได้ระหว่างเรียน ค่าตอบแทน 50 บาท/ชม. (สูงสุด 300 บาท/วัน, 2,000 บาท/สัปดาห์)',
        eligibility: 'นักศึกษา SIT ทุกชั้นปีที่สนใจเรียนรู้งานของฝ่ายต่างๆ ในคณะ',
        benefits: 'ค่าตอบแทนชั่วโมงละ 50 บาท (วงเงินรวม: ภาคปกติ 6,000 บาท / ภาคพิเศษ 10,000 บาท)',
        required_documents: 'ตารางเรียน\nสำเนาสมุดบัญชีธนาคาร',
        application_start: '2026-06-01',
        application_end: '2026-10-31',
        status: 'open',
        max_recipients: 100,
        scholarship_type: 'sit-work',
        category: 'sit'
      },
      // กลุ่ม 2: ทุนมหาวิทยาลัย มจธ.
      {
        name: 'ทุนเพชรพระจอมเกล้า',
        description: 'ศักยภาพสูงด้านวิชาการ+ความสามารถเฉพาะด้าน ครอบคลุม: ค่าเล่าเรียน + ค่าอุปกรณ์แรกเข้า 30,000 บาท + ค่าครองชีพ 4,000 บาท/เดือน',
        eligibility: 'นักศึกษา มจธ. ที่มีคะแนนและประวัติวิชาการดีเยี่ยมหรือโดดเด่นเป็นพิเศษ',
        benefits: 'ค่าเล่าเรียน + ค่าอุปกรณ์แรกเข้า 30,000 บาท + ค่าครองชีพ 4,000 บาท/เดือน',
        required_documents: 'ใบสมัครทุนเพชรพระจอมเกล้า\nแฟ้มสะสมผลงาน (Portfolio)\nใบรับรองผลการเรียน',
        application_start: '2026-05-01',
        application_end: '2026-06-30',
        status: 'open',
        max_recipients: 10,
        scholarship_type: 'kmutt-grant',
        category: 'kmutt'
      },
      {
        name: 'ทุนธรรมรักษา',
        description: 'ขาดแคลนทุนทรัพย์ พื้นที่ทุรกันดาร ไม่มีคนในครอบครัวจบ ป.ตรี',
        eligibility: 'ขาดแคลนทุนทรัพย์อย่างมาก ภูมิลำเนาในเขตพื้นที่ทุรกันดาร และไม่มีสมาชิกครอบครัวจบ ป.ตรี',
        benefits: 'ค่าเล่าเรียน + ค่าครองชีพ 4,000 บาท/เดือน + ค่าอุปกรณ์ 10,000 บาท/ปี',
        required_documents: 'หนังสือรับรองรายได้ครอบครัว\nภาพถ่ายบ้านพักอาศัย\nใบสมัครทุนธรรมรักษา',
        application_start: '2026-05-01',
        application_end: '2026-06-30',
        status: 'open',
        max_recipients: 15,
        scholarship_type: 'kmutt-grant',
        category: 'kmutt'
      },
      {
        name: 'ทุน กยศ. ลักษณะที่ 1',
        description: 'กองทุนเงินให้กู้ยืมเพื่อการศึกษา สำหรับนักเรียนหรือนักศึกษาที่ขาดแคลนทุนทรัพย์',
        eligibility: 'รายได้ครอบครัวต่อปีรวมไม่เกิน 360,000 บาท ขาดแคลนทุนทรัพย์',
        benefits: 'กู้ค่าเล่าเรียนตามจริง + ค่าครองชีพ 3,000 บาท/เดือน',
        required_documents: 'เอกสารประกอบการขอกู้ยืมเงิน กยศ. ทั้งหมด\nใบรับรองเงินเดือนบิดามารดา',
        application_start: '2026-04-01',
        application_end: '2026-08-31',
        status: 'open',
        max_recipients: 500,
        scholarship_type: 'kmutt-loan',
        category: 'kmutt'
      },
      {
        name: 'ทุน กยศ. ลักษณะที่ 2',
        description: 'กองทุนเงินให้กู้ยืมเพื่อการศึกษา สำหรับสาขาวิชาที่เป็นความต้องการหลักและมีความสำคัญต่อการพัฒนาประเทศ',
        eligibility: 'นักศึกษาในสาขาวิชาที่ได้รับการกำหนดเป็นความต้องการหลัก',
        benefits: 'กู้ค่าเล่าเรียนตามจริง + ค่าครองชีพ 3,000 บาท/เดือน',
        required_documents: 'เอกสารขอกู้ยืมเงิน กยศ. ลักษณะที่ 2',
        application_start: '2026-04-01',
        application_end: '2026-08-31',
        status: 'open',
        max_recipients: 300,
        scholarship_type: 'kmutt-loan',
        category: 'kmutt'
      },
      {
        name: 'ทุนให้เปล่า (ภายนอก)',
        description: 'จากบริษัท หรือผู้บริจาคภายนอก มอบให้ผู้ขาดแคลนทุนทรัพย์หรือเรียนดีตามเงื่อนไขผู้ให้ทุน',
        eligibility: 'นักศึกษาที่ขาดแคลนทุนทรัพย์ หรือเรียนดีตามเกณฑ์ที่บริษัทผู้มอบทุนระบุ',
        benefits: 'ทุนการศึกษาให้เปล่าตามเงื่อนไขผู้มีอุปการคุณ',
        required_documents: 'ใบรับรองเกรดเฉลี่ยสะสม\nใบรับรองรายได้ครอบครัว',
        application_start: '2026-06-01',
        application_end: '2026-08-31',
        status: 'open',
        max_recipients: 30,
        scholarship_type: 'kmutt-grant',
        category: 'kmutt'
      },
      {
        name: 'ทุนสนับสนุนการศึกษา (ทุนกรณีฉุกเฉิน)',
        description: 'สำหรับนักศึกษาที่เดือดร้อนทางการเงินอย่างร้ายแรง เช่น ผู้ปกครองตกงาน ประสบอุบัติภัย เป็นต้น โดยมีอาจารย์ที่ปรึกษาเป็นผู้เสนอชื่อ',
        eligibility: 'นักศึกษาที่เผชิญวิกฤตทางการเงินกะทันหัน มีการรับรองจากอาจารย์ที่ปรึกษา',
        benefits: 'วงเงินช่วยเหลือช่วยเหลือตามความจำเป็นแบบเร่งด่วน',
        required_documents: 'ใบเสนอชื่อและจดหมายรับรองจากอาจารย์ที่ปรึกษา\nเอกสารแสดงหลักฐานความเดือดร้อน',
        application_start: '2026-05-01',
        application_end: '2027-05-01',
        status: 'open',
        max_recipients: 40,
        scholarship_type: 'kmutt-special',
        category: 'kmutt'
      },
      {
        name: 'ทุน Applied Learning 1',
        description: 'ทุนประสบการณ์วิจัยและการเรียนรู้ประยุกต์ งานทักษะพิเศษ: พัฒนา Software, Web, Data Analytic',
        eligibility: 'นักศึกษาที่มีความสามารถในการทำโปรเจกต์งานวิจัยหรืองานระบบในมหาวิทยาลัย',
        benefits: 'โครงการละไม่เกิน 20,000 บาท',
        required_documents: 'ข้อเสนอโครงการ (Proposal)\nใบแสดงทักษะความรู้',
        application_start: '2026-06-01',
        application_end: '2026-11-30',
        status: 'open',
        max_recipients: 15,
        scholarship_type: 'kmutt-special',
        category: 'kmutt'
      },
      {
        name: 'ทุน Applied Learning 2',
        description: 'งานที่ใช้ทักษะความรู้เสร็จสิ้นในระยะสั้น ช่วยงานปฏิบัติการหรือส่วนงานทางวิชาการ',
        eligibility: 'นักศึกษาที่พร้อมปฏิบัติงานระยะสั้นในภาควิชา',
        benefits: 'ค่าตอบแทนตามสัดส่วนปริมาณงาน',
        required_documents: 'ตารางเรียน\nใบประวัติผลงานย่อ',
        application_start: '2026-06-01',
        application_end: '2026-11-30',
        status: 'open',
        max_recipients: 25,
        scholarship_type: 'kmutt-special',
        category: 'kmutt'
      },
      {
        name: 'ทุนการศึกษาสิริวิริยา',
        description: 'ชั้นปี 2 ขึ้นไป สู้ชีวิต ขยันหมั่นเพียร ขาดทุนทรัพย์',
        eligibility: 'ชั้นปี 2 ขึ้นไป ผลการเรียนเฉลี่ยสะสมไม่ต่ำกว่า 2.00 สู้ชีวิต ขยัน และขาดแคลนทุนทรัพย์',
        benefits: 'ค่าเล่าเรียน + ค่าครองชีพ 6,000 บาท/เดือน + ค่าอุปกรณ์ 10,000 บาท/ปี',
        required_documents: 'เอกสารแสดงรายได้ครอบครัว\nประวัติผลงานการช่วยเหลือกิจกรรม',
        application_start: '2026-05-01',
        application_end: '2026-07-31',
        status: 'open',
        max_recipients: 8,
        scholarship_type: 'kmutt-grant',
        category: 'kmutt'
      },
      {
        name: 'ทุนเจียระไนเพชร',
        description: 'ส่งเสริมการสร้างผลงาน ศักยภาพโดดเด่น/สร้างชื่อเสียงให้มหาวิทยาลัย',
        eligibility: 'นักศึกษาที่มีความสามารถเป็นเลิศในด้านต่างๆ หรือช่วยสร้างชื่อเสียงระดับจังหวัด/ประเทศ',
        benefits: 'ทุนการศึกษาเชิดชูเกียรติและรางวัลพิเศษ',
        required_documents: 'พอร์ตผลงาน\nใบรับรองจากสมาคม/ผู้จัดกิจกรรม',
        application_start: '2026-06-01',
        application_end: '2026-09-30',
        status: 'open',
        max_recipients: 20,
        scholarship_type: 'kmutt-special',
        category: 'kmutt'
      },
      {
        name: 'ทุนแสดเหลืองเรืองรุ่ง',
        description: 'ความสามารถดีเด่นด้านวิชาการ กีฬา ศิลปวัฒนธรรม นวัตกรรม และมีทักษะความเป็นผู้นำการเปลี่ยนแปลง',
        eligibility: 'นักศึกษาดีเด่นที่เป็นผู้นำกิจกรรม หรือนักกีฬา/นักวัฒนธรรม',
        benefits: 'การยกเว้นค่าหน่วยกิตและค่าครองชีพสนับสนุนการทำกิจกรรม',
        required_documents: 'พอร์ตกิจกรรม\nจดหมายแนะนำตัว',
        application_start: '2026-06-01',
        application_end: '2026-08-31',
        status: 'open',
        max_recipients: 12,
        scholarship_type: 'kmutt-special',
        category: 'kmutt'
      },
      {
        name: 'ทุนผู้ประสบอุบัติภัย',
        description: 'ครอบครัวประสบภัยธรรมชาติ เช่น อัคคีภัย วาตภัย อุทกภัย หรือภัยร้ายแรงอื่นๆ',
        eligibility: 'นักศึกษาที่ครอบครัวได้รับความเดือดร้อนจากภัยพิบัติอย่างร้ายแรง',
        benefits: 'วงเงินช่วยเหลือช่วยเหลือไม่เกิน 5,000 บาท',
        required_documents: 'หนังสือยืนยันจากทางอำเภอ/ผู้ใหญ่บ้าน\nภาพถ่ายสภาพบ้านเรือนที่ประสบภัย',
        application_start: '2026-05-01',
        application_end: '2027-05-01',
        status: 'open',
        max_recipients: 50,
        scholarship_type: 'kmutt-special',
        category: 'kmutt'
      },
      // กลุ่ม 3: ทุนต่างชาติ
      {
        name: 'The Petchra Pra Jom Klao Undergraduate Scholarship',
        description: 'สำหรับนักศึกษาต่างชาติที่มีผลการเรียนโดดเด่นและต้องการศึกษาต่อในระดับปริญญาตรี',
        eligibility: 'International students with GPAX of 3.60 or above',
        benefits: 'Full tuition waiver + monthly stipend',
        required_documents: 'High school transcripts\nEnglish proficiency test scores (IELTS/TOEFL)\nCopy of passport',
        application_start: '2026-03-01',
        application_end: '2026-06-30',
        status: 'open',
        max_recipients: 5,
        scholarship_type: 'international',
        category: 'international'
      },
      {
        name: 'Multi-intellectual Scholarship',
        description: 'ทุนการศึกษาสำหรับนักศึกษาต่างชาติจากกลุ่มประเทศเพื่อนบ้าน CLMV (กัมพูชา ลาว พม่า เวียดนาม)',
        eligibility: 'Applicants must be citizens of Cambodia, Laos, Myanmar, or Vietnam',
        benefits: 'Tuition and fee waiver + health insurance support',
        required_documents: 'Certificate of graduation\nRecommendation letters\nCLMV Citizenship ID/Passport',
        application_start: '2026-03-01',
        application_end: '2026-06-30',
        status: 'open',
        max_recipients: 10,
        scholarship_type: 'international',
        category: 'international'
      },
      {
        name: 'KMUTT International Scholarship Program (KISP)',
        description: 'ทุนการศึกษาสนับสนุนนักเรียนต่างชาติทั่วไปจากทุกทวีปทั่วโลก เพื่อแลกเปลี่ยนและพัฒนาการศึกษาร่วมกัน',
        eligibility: 'Non-Thai citizens from any foreign countries',
        benefits: 'Partial tuition fee reduction + accommodation assistance',
        required_documents: 'Transcripts\nPersonal Statement\nFinancial Proof',
        application_start: '2026-03-01',
        application_end: '2026-06-30',
        status: 'open',
        max_recipients: 15,
        scholarship_type: 'international',
        category: 'international'
      }
    ];

    // Seed scholarships
    for (const s of scholarships) {
      await pool.query(
        `INSERT INTO scholarships 
         (name, description, eligibility, benefits, required_documents, application_start, application_end, status, max_recipients, scholarship_type, category, created_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          s.name,
          s.description,
          s.eligibility,
          s.benefits,
          s.required_documents,
          s.application_start,
          s.application_end,
          s.status,
          s.max_recipients,
          s.scholarship_type,
          s.category,
          adminId
        ]
      );
    }

    console.log(`Seeded ${scholarships.length} scholarships successfully.`);
    console.log('Database seeding completed.');
    process.exit(0);
  } catch (error) {
    console.error('Error during database seeding:', error);
    process.exit(1);
  }
};

seed();
