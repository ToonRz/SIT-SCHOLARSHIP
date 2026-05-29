# SIT-SCHOLARSHIP

ระบบจัดการและสมัครทุนการศึกษา คณะเทคโนโลยีสารสนเทศ (SIT) มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าธนบุรี (KMUTT)

---

## ฟีเจอร์หลัก

### สำหรับนักศึกษา
- **ดูทุนการศึกษา** — แยกตามประเภท: ทุนเรียนดี (SIT Merit), ทุนกิจกรรม (SIT Activity), ทุนจ้างงาน (SIT Work), ทุนให้เปล่า (KMUTT Grant), ทุนกู้ยืม (กยศ.), ทุนต่างชาติ (International)
- **วิเคราะห์ด้วย AI (Gemini)** — แนะนำทุนที่เหมาะสมที่สุด 3 อันดับแรก จากโปรไฟล์ GPA ชั้นปี และสาขา (PDPA-compliant — ไม่ส่งข้อมูลส่วนตัวให้ AI)
- **สมัครทุนออนไลน์** — กรอกเหตุผลความจำนง แนบเอกสาร PDF และข้อมูลรายได้ครอบครัว
- **ติดตามสถานะใบสมัคร** — ดูผลการพิจารณา (รอพิจารณา, อนุมัติ, ไม่อนุมัติ)
- **จัดการโปรไฟล์** — ข้อมูลส่วนตัวแก้ไขได้ (แก้ไขได้: เบอร์, Gmail ที่ยืนยันแล้ว, รายได้ครอบครัว, ผู้ปกครอง — ข้อมูลทะเบียนอ่านอย่างเดียว)

### สำหรับผู้ดูแลระบบ
- **แดชบอร์ดสรุปผล** — สถิติจำนวนผู้ใช้งาน ทุนทั้งหมด และใบสมัครแยกตามสถานะ
- **จัดการทุน** — สร้าง แก้ไข ปิด/เปิดรับสมัคร หรือลบทุน
- **ตรวจสอบใบสมัคร** — ดูรายละเอียด ดาวน์โหลดเอกสาร PDF อนุมัติ/ปฏิเสธ
- **จัดการผู้ใช้** — ค้นหานักศึกษา ดูประวัติการสมัคร เปลี่ยนบทบาท

---

## สถาปัตยกรรม

```
┌─────────────────────────────────────────────────────────┐
│  Frontend (React/Vite, port 5173)                      │
│  ├── api/axios.js       — Axios + JWT interceptors     │
│  ├── context/AuthContext — Auth state                 │
│  ├── components/       — Navbar, Footer, ScholarshipCard│
│  └── pages/            — Home, Login, Register,        │
│                         Scholarships, Apply, Profile,   │
│                         AdminDashboard, AdminScholarships│
│                         AdminApplications, AdminUsers   │
└───────────────────┬─────────────────────────────────────┘
                    │ HTTP + JWT
┌───────────────────▼─────────────────────────────────────┐
│  Backend (Express, port 3001)                          │
│  ├── routes/auth.js       — Login, Register, Email verify│
│  ├── routes/users.js      — User CRUD, Dashboard stats │
│  ├── routes/scholarships.js — Scholarship CRUD, Stats  │
│  ├── routes/applications.js — Apply, Review, History  │
│  ├── routes/recommendations.js — AI (Gemini) recommend│
│  ├── middleware/auth.js   — JWT + authorizeRoles()    │
│  ├── middleware/validate.js — express-validator       │
│  └── middleware/upload.js — multer PDF upload          │
└───────────────────┬─────────────────────────────────────┘
                    │ mysql2
              ┌─────▼─────┐
              │   MySQL   │
              └───────────┘
```

---

## ประเภททุน (scholarship_type)
`sit-merit` · `sit-activity` · `sit-work` · `kmutt-grant` · `kmutt-loan` · `kmutt-special` · `international`

## หมวดทุน (category)
`sit` · `kmutt` · `international`

## บทบาทผู้ใช้ (role)
`student` · `admin` · `committee`

---

## วิธีติดตั้ง

### 1. Database
```sql
CREATE DATABASE sit_scholarship CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```
จากนั้นรัน migration เพื่อสร้างตาราง:
```bash
cd backend && node migrate.js && node seed.js
```

### 2. Backend
```bash
cd backend && npm install
```

สร้างไฟล์ `.env`:
```env
PORT=3001
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=sit_scholarship
DB_PORT=3306
JWT_SECRET=sit_kmutt_2024_secret
JWT_EXPIRES_IN=24h
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-flash-latest
```

รัน server:
```bash
npm run dev
```

### 3. Frontend
```bash
cd frontend && npm install
npm run dev
```

---

## บัญชีทดสอบ

| บทบาท | อีเมล | รหัสผ่าน |
|---|---|---|
| Admin | admin@sit.kmutt.ac.th | admin123 |
| Committee | committee1@sit.kmutt.ac.th | committee123 |
| Student | student1@sit.kmutt.ac.th | student123 |

---

## Tech Stack

**Frontend:** React (Vite) · Tailwind CSS · React Router DOM · Axios · React Icons · react-hot-toast

**Backend:** Node.js (Express) · MySQL (mysql2) · JWT · bcryptjs · express-validator · multer

**AI:** Google Gemini API (สำหรับแนะนำทุน)
