# SIT-SCHOLARSHIP 🎓

ระบบจัดการและสมัครทุนการศึกษา คณะเทคโนโลยีสารสนเทศ (SIT) มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าธนบุรี (KMUTT)
พัฒนาขึ้นด้วย React (Vite) + Tailwind CSS สำหรับ Frontend และ Node.js (Express) + MySQL สำหรับ Backend

---

## 🚀 ฟีเจอร์หลัก (Key Features)

### สำหรับนักศึกษา (Student)
- **ระบบดูทุนการศึกษา:** แยกประเภทตามทุนเรียนดี (SIT Merit), ทุนกิจกรรม (SIT Activity), ทุนจ้างงาน (SIT Work), ทุนให้เปล่า (KMUTT Grant), ทุนกู้ยืม (กยศ.) และทุนต่างชาติ (International)
- **ระบบสมัครทุน:** กรอกข้อมูลการศึกษา อัปโหลดหลักฐานเอกสาร (GPA, กิจกรรม, รูปภาพ/ไฟล์แนบ) และระบุเหตุผลการสมัคร
- **ระบบแนะนำทุนการศึกษาด้วย AI (Gemini AI):** วิเคราะห์โปรไฟล์นักศึกษา เช่น GPA ชั้นปี และภาควิชา เพื่อแนะนำทุนการศึกษาที่เหมาะสมที่สุด 3 อันดับแรก
- **ประวัติการสมัคร:** ตรวจสอบและติดตามสถานะการสมัครของตนเอง (อยู่ระหว่างพิจารณา, อนุมัติ, ไม่อนุมัติ)
- **โปรไฟล์นักศึกษา:** จัดการข้อมูลส่วนตัวและผลการเรียนเฉลี่ยสะสม (GPAX)

### สำหรับผู้ดูแลระบบ (Administrator)
- **แดชบอร์ดสรุปผล:** แสดงข้อมูลสถิติจำนวนผู้ใช้งาน ทุนทั้งหมด และจำนวนผู้สมัครทุนแยกตามสถานะ
- **ระบบจัดการทุน:** สร้าง แก้ไข ปิดรับสมัคร หรือลบทุนการศึกษา
- **ระบบตรวจสอบคำขอ:** ตรวจสอบรายละเอียดใบสมัคร ดาวน์โหลดเอกสารหลักฐาน และอนุมัติ/ปฏิเสธใบสมัครทุน
- **ระบบจัดการผู้ใช้งาน:** ตรวจสอบรายชื่อนักศึกษาและประวัติการสมัครทุนทั้งหมด

---

## 🛠️ Stack เทคโนโลยี (Tech Stack)

### Frontend
- **Framework:** React.js (Vite)
- **Styling:** Tailwind CSS (Navy / Blue Theme)
- **HTTP Client:** Axios (พร้อม Interceptors สำหรับ Authorization Bearer Token)
- **Routing:** React Router DOM (พร้อม Protected Route แยกสิทธิ์นักศึกษา/แอดมิน)
- **Icons:** React Icons

### Backend
- **Runtime:** Node.js (Express)
- **Database:** MySQL (เชื่อมต่อผ่าน `mysql2` package)
- **Authentication:** JSON Web Tokens (JWT) + bcryptjs สำหรับเข้ารหัสรหัสผ่าน
- **Development Tool:** Nodemon

---

## 📋 วิธีการติดตั้งและเริ่มใช้งาน (Getting Started)

### 1. การเตรียม Database (MySQL)
1. เปิดใช้บริการ MySQL Server (เช่น ผ่าน XAMPP, Laragon หรือ MySQL Workbench)
2. สร้างฐานข้อมูลใหม่ชื่อ `sit_scholarship`
   ```sql
   CREATE DATABASE sit_scholarship CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
3. นำเข้าโครงสร้างตารางโดยการรันสคริปต์จากไฟล์ `database/schema.sql` หรือรันผ่าน Terminal:
   ```bash
   mysql -u root -p -h localhost -P 3306 < database/schema.sql
   ```
   *(หมายเหตุ: สามารถเปลี่ยนโฮสต์และพอร์ต เช่น `-P 3307` ตามสภาพแวดล้อมที่ใช้งานจริง)*

### 2. การตั้งค่า Backend
1. เข้าไปที่โฟลเดอร์ `backend`:
   ```bash
   cd backend
   ```
2. ติดตั้ง Dependencies:
   ```bash
   npm install
   ```
3. สร้างไฟล์ `.env` ในโฟลเดอร์ `backend` และกำหนดค่าดังนี้:
   ```env
   PORT=3001
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=sit_scholarship
   DB_PORT=3306 # พอร์ตของ MySQL (เช่น 3306 หรือ 3307)
   JWT_SECRET=sit_kmutt_2024_secret
   JWT_EXPIRES_IN=24h
   GEMINI_API_KEY=your_gemini_api_key_here
   GEMINI_MODEL=gemini-flash-latest
   ```
4. รันคำสั่ง Seed ข้อมูลเริ่มต้น (บัญชีผู้ใช้งานจำลองต่าง ๆ + ทุนการศึกษาเริ่มต้น):
   ```bash
   node seed.js
   ```
5. รัน Backend Server:
   ```bash
   npm run dev
   ```
   *Backend จะทำงานที่พอร์ต `http://localhost:3001`*

### 3. การตั้งค่า Frontend
1. เข้าไปที่โฟลเดอร์ `frontend`:
   ```bash
   cd ../frontend
   ```
2. ติดตั้ง Dependencies:
   ```bash
   npm install
   ```
3. รัน Frontend Server:
   ```bash
   npm run dev
   ```
   *Frontend จะทำงานที่พอร์ต `http://localhost:5173`*

---

## 🔐 บัญชีเข้าทดสอบระบบ (Test Credentials)

### ผู้ดูแลระบบ (Administrator)
- **Email:** `admin@sit.kmutt.ac.th`
- **Password:** `admin123`

### คณะกรรมการ (Committee)
- **Email:** `committee1@sit.kmutt.ac.th`
- **Password:** `committee123`

### นักศึกษา (Student)
- **Email:** `student1@sit.kmutt.ac.th`
- **Password:** `student123`
- *(หรือลงทะเบียนสมัครสมาชิกใหม่ผ่านหน้าเว็บได้ทันที)*
