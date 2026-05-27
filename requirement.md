สร้างระบบสมัครทุนการศึกษาคณะ SIT KMUTT แบบ Full-Stack บน localhost
อ้างอิง: https://www.sit.kmutt.ac.th/scholarship-bsc/

## Tech Stack
- Frontend: React + Vite + TailwindCSS (port 5173)
- Backend: Node.js + Express (port 3001)
- Database: MySQL (XAMPP, root, no password)
- Auth: JWT + bcrypt
- HTTP Client: Axios
- Icons: react-icons (Hi), Notifications: react-hot-toast
- Font: Kanit (Google Fonts)

## Theme
- Primary: #FA4616 (SIT Orange)
- Secondary: #FFD100 (KMUTT Gold)
- Background: #FFFFFF
- สไตล์โมเดิร์น สะอาดตา เป็นทางการแบบมหาวิทยาลัย, ภาษาไทยทั้ง UI

## Database: sit_scholarship

### users
id AUTO_INCREMENT PK, student_id VARCHAR(20) UNIQUE, email VARCHAR(100) UNIQUE NOT NULL, password VARCHAR(255) NOT NULL, first_name VARCHAR(100) NOT NULL, last_name VARCHAR(100) NOT NULL, phone VARCHAR(20), faculty VARCHAR(100) DEFAULT 'School of Information Technology', department VARCHAR(100), year_of_study INT, gpa DECIMAL(3,2), role ENUM('student','admin','committee') DEFAULT 'student', created_at TIMESTAMP DEFAULT NOW(), updated_at TIMESTAMP ON UPDATE

### scholarships
id AUTO_INCREMENT PK, name VARCHAR(255) NOT NULL, description TEXT, eligibility TEXT, benefits TEXT, required_documents TEXT, application_start DATE, application_end DATE, status ENUM('open','closed','upcoming') DEFAULT 'upcoming', max_recipients INT DEFAULT 0, scholarship_type ENUM('sit-merit','sit-activity','sit-work','kmutt-grant','kmutt-loan','kmutt-special','international') DEFAULT 'sit-merit', category ENUM('sit','kmutt','international') DEFAULT 'sit', created_by INT FK(users.id), created_at TIMESTAMP, updated_at TIMESTAMP

### applications
id AUTO_INCREMENT PK, user_id INT FK(users.id) ON DELETE CASCADE, scholarship_id INT FK(scholarships.id) ON DELETE CASCADE, statement TEXT, family_income DECIMAL(12,2), additional_info TEXT, document_url VARCHAR(500), status ENUM('pending','reviewing','approved','rejected') DEFAULT 'pending', admin_comment TEXT, reviewed_by INT FK(users.id), submitted_at TIMESTAMP DEFAULT NOW(), reviewed_at TIMESTAMP NULL, UNIQUE(user_id, scholarship_id)

## Seed Data (ข้อมูลจริงจาก SIT KMUTT)

Admin: admin@sit.kmutt.ac.th / admin123 (bcrypt hash, role=admin)

### กลุ่ม 1: ทุนคณะ SIT (category='sit')

1. **ทุนเรียนดี SIT** (sit-merit/open)
   - มอบเป็นรางวัลสำหรับนักศึกษาผลการเรียนโดดเด่น ส่งเสริมจิตอาสาแบ่งปันความรู้
   - คุณสมบัติ: นักศึกษา SIT ระดับ ป.ตรี, พิจารณาเรียงตาม GPAX, ประพฤติดี
   - สิทธิประโยชน์: ตามงบประมาณแต่ละปี พิจารณาเรียงตามเกรด

2. **ทุนกิจกรรมเด่น SIT** (sit-activity/open)
   - มอบให้นักศึกษาสร้างชื่อเสียงจากการประกวด/รางวัลด้าน IT หรือคอมพิวเตอร์
   - ยื่นขอได้ตลอดปีการศึกษา ภายใน 6 เดือนหลังได้รับรางวัล
   - ต้องแนบหลักฐานรางวัล/ผลงาน

3. **ทุนจ้างงาน SIT** (sit-work/open)
   - ส่งเสริมใช้เวลาว่างให้เกิดประโยชน์ มีรายได้ระหว่างเรียน
   - ค่าตอบแทน 50 บาท/ชม. (สูงสุด 300 บาท/วัน, 2,000 บาท/สัปดาห์)
   - วงเงินรวม: ภาคปกติ 6,000 บาท / ภาคพิเศษ 10,000 บาท

### กลุ่ม 2: ทุนมหาวิทยาลัย มจธ. (category='kmutt')

4. **ทุนเพชรพระจอมเกล้า** (kmutt-grant/open)
   - ศักยภาพสูงด้านวิชาการ+ความสามารถเฉพาะด้าน
   - ครอบคลุม: ค่าเล่าเรียน + ค่าอุปกรณ์แรกเข้า 30,000 บาท + ค่าครองชีพ 4,000 บาท/เดือน

5. **ทุนธรรมรักษา** (kmutt-grant/open)
   - ขาดแคลนทุนทรัพย์ พื้นที่ทุรกันดาร ไม่มีคนในครอบครัวจบ ป.ตรี
   - ค่าเล่าเรียน + ค่าครองชีพ 4,000 บาท/เดือน + ค่าอุปกรณ์ 10,000 บาท/ปี

6. **ทุน กยศ. ลักษณะที่ 1** (kmutt-loan/open)
   - สำหรับผู้ขาดแคลนทุนทรัพย์
   - กู้ค่าเล่าเรียนตามจริง + ค่าครองชีพ 3,000 บาท/เดือน

7. **ทุน กยศ. ลักษณะที่ 2** (kmutt-loan/open)
   - สำหรับสาขาวิชาที่เป็นความต้องการหลัก
   - กู้ค่าเล่าเรียนตามจริง + ค่าครองชีพ 3,000 บาท/เดือน

8. **ทุนให้เปล่า** (kmutt-grant/open)
   - จากบริษัท/ผู้บริจาคภายนอก
   - มอบให้ผู้ขาดแคลนหรือเรียนดีตามเงื่อนไขผู้ให้ทุน

9. **ทุนสนับสนุนการศึกษา** (kmutt-special/open)
   - เดือดร้อนทางการเงินอย่างร้ายแรง
   - อาจารย์ที่ปรึกษาเป็นผู้เสนอชื่อ

10. **ทุน Applied Learning 1** (kmutt-special/open)
    - ทุนประสบการณ์วิจัยและการเรียนรู้ประยุกต์
    - งานทักษะพิเศษ: พัฒนา Software, Web, Data Analytic
    - โครงการละไม่เกิน 20,000 บาท

11. **ทุน Applied Learning 2** (kmutt-special/open)
    - งานที่ใช้ทักษะความรู้เสร็จสิ้นในระยะสั้น

12. **ทุนการศึกษาสิริวิริยา** (kmutt-grant/open)
    - ชั้นปี 2 ขึ้นไป สู้ชีวิต ขยันหมั่นเพียร ขาดทุนทรัพย์
    - ค่าเล่าเรียน + ค่าครองชีพ 6,000 บาท/เดือน + ค่าอุปกรณ์ 10,000 บาท/ปี

13. **ทุนเจียระไนเพชร** (kmutt-special/open)
    - ศักยภาพโดดเด่น/สร้างชื่อเสียงให้มหาวิทยาลัย

14. **ทุนแสดเหลืองเรืองรุ่ง** (kmutt-special/open)
    - ความสามารถดีเด่นด้านวิชาการ กีฬา ศิลปวัฒนธรรม นวัตกรรม
    - เป็นผู้นำการเปลี่ยนแปลง

15. **ทุนผู้ประสบอุบัติภัย** (kmutt-special/open)
    - ครอบครัวประสบภัยธรรมชาติ
    - วงเงินไม่เกิน 5,000 บาท

### กลุ่ม 3: ทุนนักศึกษาต่างชาติ (category='international')

16. **The Petchra Pra Jom Klao Undergraduate Scholarship** (international/open)
    - นักศึกษาต่างชาติผลการเรียนโดดเด่น GPAX 3.60 ขึ้นไป

17. **Multi-intellectual Scholarship** (international/open)
    - สำหรับนักศึกษาจาก กัมพูชา ลาว พม่า เวียดนาม (CLMV)

18. **KMUTT International Scholarship Program (KISP)** (international/open)
    - นักศึกษาต่างชาติจากประเทศอื่นๆ

## API Endpoints

### Auth (Public)
POST /api/auth/register → validate(email, password≥6, student_id, first_name, last_name), bcrypt hash, return JWT+user
POST /api/auth/login → verify bcrypt, return JWT+user
GET /api/auth/me → [Auth] profile
PUT /api/auth/profile → [Auth] update own profile

### Scholarships
GET /api/scholarships → [Public] list all, query: ?status=&type=&category=&search=
GET /api/scholarships/:id → [Public] detail
POST /api/scholarships → [Admin] create
PUT /api/scholarships/:id → [Admin] update
DELETE /api/scholarships/:id → [Admin] delete

### Applications
POST /api/applications → [Student] submit (validate: statement≥50, ห้ามสมัครซ้ำ, check scholarship open)
GET /api/applications/my → [Auth] my applications (JOIN scholarship name)
GET /api/applications → [Admin/Committee] all (query: ?status=&scholarship_id=, JOIN user+scholarship info)
GET /api/applications/:id → [Auth] detail (student=own only)
PUT /api/applications/:id → [Student] edit (pending only)
DELETE /api/applications/:id → [Student: pending / Admin: any]
PATCH /api/applications/:id/review → [Admin/Committee] set status(reviewing/approved/rejected) + admin_comment

### Users
GET /api/users → [Admin] list (query: ?role=&search=)
GET /api/users/:id → [Admin] detail
PUT /api/users/:id/role → [Admin] change role
DELETE /api/users/:id → [Admin] delete (ห้ามลบตัวเอง)
GET /api/users/stats/dashboard → [Admin] counts: totalUsers, totalScholarships, totalApplications, pending, approved, rejected

## Backend Structure
server.js → Express, CORS(origin:localhost:5173), JSON body, request logger, mount /api/auth, /api/users, /api/scholarships, /api/applications, health check /api/health
config/db.js → mysql2/promise pool (localhost, root, '', sit_scholarship)
middleware/auth.js → authenticateToken(JWT verify from Bearer header), authorizeRoles(...roles)
middleware/validate.js → express-validator: registerValidation, loginValidation, scholarshipValidation, applicationValidation + handleValidationErrors
routes/ → auth.js, users.js, scholarships.js, applications.js
seed.js → bcrypt hash admin password, INSERT admin user + INSERT all 18 scholarships
.env → PORT=3001, DB_HOST=localhost, DB_USER=root, DB_PASSWORD=, DB_NAME=sit_scholarship, JWT_SECRET=sit_kmutt_2024_secret, JWT_EXPIRES_IN=24h

## Frontend Structure

### AuthContext
state: user, token, loading
methods: login(email,pw), register(formData), logout(), fetchProfile()
helpers: isAdmin(), isStudent(), isCommittee()
effect: auto fetchProfile on mount if token exists
localStorage: token, user

### axios.js (API layer)
baseURL: http://localhost:3001/api
request interceptor: attach Bearer token from localStorage
response interceptor: on 401/403 → clear storage, redirect /login

### TailwindCSS
extend colors: sit-orange(#FA4616), sit-orange-light(#FF6B3D), sit-orange-dark(#D93A10), kmutt-gold(#FFD100), kmutt-gold-light, kmutt-gold-dark
font: Kanit
@layer components: btn-primary(orange), btn-secondary(gold), btn-outline(orange border), input-field, card(rounded-xl shadow), badge-pending(yellow), badge-reviewing(blue), badge-approved(green), badge-rejected(red)

### Components
Navbar → responsive, SIT logo+icon, nav ตาม role(student: หน้าหลัก/ทุน/ใบสมัคร, admin: +จัดการระบบ), user dropdown(ชื่อ/email/role badge/profile link/logout), mobile hamburger
Footer → SIT info, links(sit.kmutt.ac.th, kmutt.ac.th, scholarship page), ที่อยู่คณะ 126 ประชาอุทิศ บางมด ทุ่งครุ 10140, โทร 02-470-9850
ProtectedRoute → check user+role, loading spinner, redirect /login
ScholarshipCard → top gradient bar(orange→gold), category badge(SIT/KMUTT/International + สี), type badge, status dot(open=green/closed=red/upcoming=yellow), name, description(line-clamp-3), benefits preview(gold bg), deadline, arrow link

### Pages

**Home:**
- Hero: gradient orange bg, decorative blur shapes, badge "คณะเทคโนโลยีสารสนเทศ มจธ.", heading "ทุนการศึกษา SIT KMUTT"(gold), subtitle, 2 CTA buttons(ดูทุน+สมัครสมาชิก)
- 3 Steps: สมัครสมาชิก→เลือกทุน→กรอกใบสมัคร (numbered cards)
- ทุนที่เปิดรับ: max 3 cards, "ดูทั้งหมด" link

**Login:**
- Center card, SIT icon, email+password inputs with icons, frontend validate, submit button, link สมัครสมาชิก
- Demo credentials box(gold bg): admin@sit.kmutt.ac.th / admin123
- Redirect: admin→/admin, student→/scholarships

**Register:**
- 3 sections with numbered badges: (1)ข้อมูลส่วนตัว(ชื่อ/สกุล/รหัสนศ./โทร) (2)การศึกษา(สาขาdropdown:CS/IT/DSI, ชั้นปี1-4, GPA) (3)บัญชี(email/password/confirm)
- Frontend validate: required fields, email format, password≥6, confirm match, GPA 0-4

**Scholarships:**
- Header gradient orange
- Search bar + 3 filters: ประเภททุน(dropdown scholarship_type), หมวดหมู่(tabs: ทั้งหมด/ทุน SIT/ทุน มจธ./ทุนต่างชาติ), สถานะ(dropdown)
- Results grid 3 cols, count text, empty state

**ScholarshipDetail:**
- Header gradient + back button + category&type&status badges + title
- Main(2/3): Description, คุณสมบัติ(green icon), สิทธิประโยชน์(gold bg), เอกสาร(blue icon) - ทุก section whitespace-pre-line
- Sidebar(1/3): sticky card, วันเปิด-ปิดรับ, จำนวนรับ, ปุ่มสมัคร(student→/apply, guest→/login, non-student→disabled, closed→disabled)

**Apply:** [student]
- Header gradient + scholarship name
- Form: เหตุผล(textarea≥50, char count), รายได้ครอบครัว(number), ข้อมูลเพิ่มเติม(textarea), ลิงก์เอกสาร(url, hint: Google Drive)
- Required documents reminder box(gold bg)
- Buttons: ยกเลิก(outline) + ส่งใบสมัคร(primary)

**MyApplications:** [student]
- Header + subtitle
- List cards: scholarship name + status badge, submitted date(Thai locale), admin comment(if exists, gray bg), view link, delete button(pending only)
- Empty state: icon + text + link to scholarships

**Profile:** [any auth]
- Header gradient
- Avatar circle(orange bg, user icon) + name + email + role badge
- Edit form: ชื่อ/สกุล/โทร/สาขา/ชั้นปี/GPA
- Save button

**AdminDashboard:** [admin]
- Header gradient
- 6 stat cards(clickable→link): ผู้ใช้(blue)/ทุน(orange)/ใบสมัคร(purple)/รอพิจารณา(yellow)/อนุมัติ(green)/ไม่อนุมัติ(red) - each with icon + count + hover scale
- Quick actions: 3 cards(จัดการทุน/จัดการใบสมัคร/จัดการผู้ใช้) with icon+description

**AdminScholarships:** [admin]
- Header + "เพิ่มทุนใหม่" button(white)
- Table: ชื่อทุน, หมวดหมู่, ประเภท, สถานะ(colored badge), edit+delete buttons
- Modal form(create/edit): name*, description*(textarea), eligibility, benefits, required_documents, scholarship_type(dropdown), category(dropdown sit/kmutt/international), status(dropdown), max_recipients, application_start/end(date)

**AdminApplications:** [admin/committee]
- Header
- Filter tabs: ทั้งหมด/รอพิจารณา/กำลังพิจารณา/อนุมัติ/ไม่อนุมัติ (active=orange bg)
- List cards: scholarship name + status badge, student info(name/student_id/GPA/department), submitted date, action buttons(view/approve/reject)
- Detail modal: student full info(name/id/email/GPA/department/year/phone), scholarship name, statement(gray bg), family income, additional info, document link, review section(comment textarea + approve green button + reject red button) - show only for pending/reviewing

**AdminUsers:** [admin]
- Header
- Search input
- Table: ชื่อ-สกุล, รหัสนศ., อีเมล, สาขา, Role(dropdown เปลี่ยนได้เลย: student/committee/admin, colored bg), delete button
- Footer: total count

### Routes (react-router-dom v6)
/ → Home
/login → Login
/register → Register
/scholarships → Scholarships
/scholarships/:id → ScholarshipDetail
/apply/:scholarshipId → ProtectedRoute[student] → Apply
/my-applications → ProtectedRoute[student] → MyApplications
/profile → ProtectedRoute[student,admin,committee] → Profile
/admin → ProtectedRoute[admin] → AdminDashboard
/admin/scholarships → ProtectedRoute[admin] → AdminScholarships
/admin/applications → ProtectedRoute[admin,committee] → AdminApplications
/admin/users → ProtectedRoute[admin] → AdminUsers

## Requirements Checklist
1. ✅ CRUD (ทุน/ใบสมัคร/ผู้ใช้)
2. ✅ Register/Login
3. ✅ JWT token (Bearer header, 24h expiry)
4. ✅ bcrypt hash (saltRounds=10, ไม่เก็บ plain text)
5. ✅ User & Role (student/admin/committee)
6. ✅ Role-based access (authorizeRoles middleware)
7. ✅ Clear API endpoints
8. ✅ Frontend↔Backend (Axios+CORS)
9. ✅ Real SIT KMUTT scholarship data (18 ทุน 3 กลุ่ม)
10. ✅ Validation ทั้ง Frontend(form) + Backend(express-validator)

สร้างโค้ดทั้งหมดให้ครบ ทุกไฟล์ พร้อมใช้งานได้ทันที รวมถึง seed.js สำหรับสร้าง admin account + ข้อมูลทุนทั้ง 18 รายการ