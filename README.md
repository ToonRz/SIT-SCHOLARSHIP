# SIT Scholarship Management System

ระบบจัดการและสมัครทุนการศึกษา คณะเทคโนโลยีสารสนเทศ (SIT) มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าธนบุรี (KMUTT)

| ส่วน | URL (พัฒนา) |
|------|-------------|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:3001 |
| Health check | http://localhost:3001/api/health |

---

## ความต้องการของระบบ

- **Node.js** 18+
- **MySQL** 8+
- **Google Gemini API key** (ถ้าต้องการใช้ฟีเจอร์แนะนำทุนด้วย AI)

---

## ฟีเจอร์หลัก

### สำหรับนักศึกษา (`student`)
- ดูรายการทุนและรายละเอียดแต่ละทุน
- หน้า **คุณสมบัติทุน SIT** (`/qualifications`) — สรุปคุณสมบัติจากข้อมูลทุนในระบบ
- **แนะนำทุนด้วย AI (Gemini)** — อันดับ 3 ทุนที่เหมาะจาก GPA ชั้นปี และสาขา (ส่งเฉพาะข้อมูลที่จำเป็น ไม่ส่งข้อมูลระบุตัวตน)
- สมัครทุนออนไลน์ — จดหมายจุดมุ่งหมาย แนบ PDF รายได้ครอบครัว
- ติดตามใบสมัคร (`/my-applications`) — สถานะ `pending` · `reviewing` · `approved` · `rejected`
- จัดการโปรไฟล์ — แก้ไขเบอร์ อีเมลส่วนตัว (ยืนยันแล้ว) รายได้/ผู้ปกครอง; ข้อมูลทะเบียนอ่านอย่างเดียว

### สำหรับคณะกรรมการ (`committee`)
- ตรวจสอบและพิจารณาใบสมัคร (`/admin/applications`)
- ดูสถิติแดชบอร์ด (ร่วมกับ admin)

### สำหรับผู้ดูแลระบบ (`admin`)
- แดชบอร์ดสรุปผล (`/admin`)
- จัดการทุน — สร้าง แก้ไข เปิด/ปิดรับสมัคร ลบ (`/admin/scholarships`)
- จัดกลุ่มทุนตามประเภท (`/admin/grouping`)
- ประวัติการอนุมัติ/ปฏิเสธ (`/admin/approval-history`)
- จัดการผู้ใช้ — ค้นหา เปลี่ยนบทบาท (`/admin/users`)

---

## โครงสร้างโปรเจกต์

```
SIT-SCHOLARSHIP/
├── frontend/          # React + Vite + Tailwind
│   └── src/
│       ├── api/       # Axios + JWT interceptors
│       ├── components/
│       ├── context/   # AuthContext
│       └── pages/
├── backend/           # Express API
│   ├── routes/        # auth, users, scholarships, applications, recommendations
│   ├── middleware/    # auth, validate, upload
│   ├── config/db.js
│   ├── migrate.js     # อัปเดตคอลัมน์ (รันอัตโนมัติตอน start server)
│   └── seed.js        # ข้อมูลทดสอบ
└── database/
    └── schema.sql     # สร้างตารางครั้งแรก
```

---

## วิธีติดตั้ง

### 1. สร้างฐานข้อมูล

```sql
CREATE DATABASE sit_scholarship CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

นำเข้า schema (สร้างตาราง):

```bash
mysql -u root -p sit_scholarship < database/schema.sql
```

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env   # แก้ค่า DB และ JWT ให้ตรงเครื่อง
```

ตัวอย่าง `backend/.env`:

```env
PORT=3001
# CORS_ORIGIN=http://localhost:5173   # ใช้ใน production (คั่นหลาย origin ด้วย comma)
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

ใส่ข้อมูลทดสอบ (admin + committee + นักศึกษา 5 คน + ทุน SIT 3 รายการ):

```bash
npm run seed
```

รัน API (รัน migration เพิ่มคอลัมน์ให้อัตโนมัติก่อน listen):

```bash
npm run dev    # nodemon — พัฒนา
npm start      # production
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev      # http://localhost:5173
npm run build    # build สำหรับ deploy
npm run lint
```

> **หมายเหตุ:** ในโหมดพัฒนา CORS อนุญาต `localhost` ทุกพอร์ต (กรณี Vite ใช้พอร์ตอื่นเมื่อ 5173 ถูกใช้งานแล้ว)

---

## บัญชีทดสอบ (หลัง `npm run seed`)

| บทบาท | อีเมล | รหัสผ่าน | หน้าแรกหลัง login |
|--------|--------|----------|-------------------|
| Admin | admin@sit.kmutt.ac.th | admin123 | `/admin` |
| Committee | committee1@sit.kmutt.ac.th | committee123 | `/admin/applications` |
| Student | student1@sit.kmutt.ac.th | student123 | `/scholarships` |

บัญชีเพิ่มเติม: `committee2/3@sit.kmutt.ac.th`, `student2–5@sit.kmutt.ac.th` (รหัสผ่านเดียวกับด้านบน)

---

## ประเภททุน · หมวด · บทบาท

**scholarship_type:** `sit-merit` · `sit-activity` · `sit-work` · `kmutt-grant` · `kmutt-loan` · `kmutt-special` · `international`

**category:** `sit` · `kmutt` · `international`

**role:** `student` · `admin` · `committee`

---

## API หลัก

| Prefix | ใช้สำหรับ |
|--------|-----------|
| `GET /api/health` | ตรวจสอบสถานะ server |
| `/api/auth` | login, register, profile, ยืนยันอีเมล |
| `/api/users` | ผู้ใช้, สถิติแดชบอร์ด, เปลี่ยน role |
| `/api/scholarships` | CRUD ทุน, สถิติ, รายชื่อผู้สมัคร |
| `/api/applications` | สมัคร, ติดตาม, ตรวจสอบ, ประวัติอนุมัติ |
| `/api/recommendations` | แนะนำทุนด้วย Gemini (ต้อง login) |

ไฟล์ PDF ที่อัปโหลด: `GET /api/uploads/applications/...`

---

## สถาปัตยกรรม

```
┌──────────────────────────────────────────────────────────────┐
│  Frontend (React/Vite :5173)                                 │
│  Pages: Home, Login, Qualifications, Scholarships, Detail,   │
│         Apply, MyApplications, Profile, Admin*               │
└────────────────────────────┬─────────────────────────────────┘
                             │ HTTP + JWT Bearer
┌────────────────────────────▼─────────────────────────────────┐
│  Backend (Express :3001)                                       │
│  auth · users · scholarships · applications · recommendations │
│  middleware: JWT, roles, validation, multer (PDF)             │
└────────────────────────────┬─────────────────────────────────┘
                             │ mysql2
                      ┌──────▼──────┐
                      │   MySQL     │
                      └─────────────┘
```

**การยืนยันตัวตน:** login → JWT ใน `AuthContext` → Axios แนบ `Authorization: Bearer` → `authorizeRoles()` บน route ที่ต้องจำกัดสิทธิ์

---

## Tech Stack

**Frontend:** React 18 · Vite · Tailwind CSS · React Router · Axios · React Icons · react-hot-toast

**Backend:** Node.js · Express · MySQL (mysql2) · JWT · bcryptjs · express-validator · multer

**AI:** Google Gemini API (แนะนำทุน)
