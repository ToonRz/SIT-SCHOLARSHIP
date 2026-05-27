# SIT-SCHOLARSHIP 🎓

ระบบจัดการและสมัครทุนการศึกษา คณะเทคโนโลยีสารสนเทศ (SIT) มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าธนบุรี (KMUTT)
พัฒนาขึ้นด้วย React (Vite) + Tailwind CSS สำหรับ Frontend และ Node.js (Express) + MySQL สำหรับ Backend

---

## 🚀 ฟีเจอร์หลัก (Key Features)

### สำหรับนักศึกษา (Student)
- **ระบบดูทุนการศึกษา:** แยกประเภทตามทุนเรียนดี (SIT Merit), ทุนกิจกรรม (SIT Activity), ทุนจ้างงาน (SIT Work), ทุนให้เปล่า (KMUTT Grant), ทุนกู้ยืม (กยศ.) และทุนต่างชาติ (International)
- **ระบบสมัครทุน:** กรอกข้อมูลการศึกษา อัปโหลดหลักฐานเอกสาร (GPA, กิจกรรม, รูปภาพ/ไฟล์แนบ) และระบุเหตุผลการสมัคร
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
   JWT_SECRET=sit_kmutt_2024_secret
   JWT_EXPIRES_IN=24h
   ```
4. รันคำสั่ง Seed ข้อมูลเริ่มต้น (โครงสร้าง Table + บัญชีแอดมิน + ทุนการศึกษา 18 ทุน):
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

### นักศึกษา (Student)
- สามารถลงทะเบียนสมัครสมาชิกใหม่ (Register) ผ่านหน้าเว็บเพื่อทดลองใช้งานจริงได้ทันที
