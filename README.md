# SIT-SCHOLARSHIP

เว็บสมัครทุนสำหรับคณะ SIT KMUTT (โทนสี #FA4616, #FFD100, สีขาว)

## วิธีรัน
```bash
node server.js
```
เปิด `http://localhost:3000`

## ฟีเจอร์ที่รองรับตามโจทย์
1. CRUD ฟังก์ชันหลัก: Scholarships + Applications + User Role update
2. Register/Login
3. JWT Token (HS256)
4. Hash password ด้วย PBKDF2 (ไม่เก็บ plain text)
5. User และ Role (admin/user)
6. Authorization ตาม role
7. Endpoint ชัดเจน
8. Frontend เชื่อมต่อ Backend ผ่าน fetch API
9. External API integration demo: `/api/external/exchange-rates`
10. Validate ทั้ง frontend/backend

## API Endpoints
### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`

### Users (Admin)
- `GET /api/users`
- `PUT /api/users/:id`

### Scholarships
- `GET /api/scholarships`
- `POST /api/scholarships` (Admin)
- `PUT /api/scholarships/:id` (Admin)
- `DELETE /api/scholarships/:id` (Admin)

### Applications
- `GET /api/applications`
- `POST /api/applications`

### Extra
- `GET /api/external/exchange-rates`
