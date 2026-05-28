# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SIT Scholarship Management System for KMUTT (King Mongkut's University of Technology Thonburi). A Thai-language fullstack application managing scholarship applications with student and administrator roles.

## Tech Stack

**Frontend**: React (Vite), Tailwind CSS, React Router DOM, Axios, React Icons
**Backend**: Node.js (Express), MySQL (mysql2), JWT authentication, bcryptjs
**Database**: MySQL

## Development Commands

### Frontend (port 5173)
```bash
cd frontend && npm install
npm run dev      # Vite dev server
npm run build    # Production build
npm run lint     # ESLint check
```

### Backend (port 3001)
```bash
cd backend && npm install
npm run dev      # Nodemon dev server
npm run seed     # Seed database with initial data (admin account + 18 scholarships)
npm start        # Production server
```

### Database Setup
1. Create MySQL database: `CREATE DATABASE sit_scholarship CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
2. Run `node seed.js` in backend to create tables and seed initial data

### Environment Variables (backend/.env)
```
PORT=3001
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=sit_scholarship
JWT_SECRET=sit_kmutt_2024_secret
JWT_EXPIRES_IN=24h
```

## Architecture

### Frontend Structure
- `src/api/` - Axios instance with interceptors for JWT Bearer tokens
- `src/components/` - Shared components (Navbar, Footer, ScholarshipCard, ProtectedRoute)
- `src/context/AuthContext.jsx` - Authentication state management
- `src/pages/` - Route pages (Home, Login, Register, Scholarships, Apply, Profile, Admin* pages)

### Backend Structure
- `server.js` - Express app entry, CORS config, route mounting
- `routes/` - REST endpoints for auth, users, scholarships, applications
- `middleware/auth.js` - JWT authentication + role-based authorization
- `middleware/validate.js` - Input validation (express-validator)
- `config/db.js` - MySQL connection pool

### API Routes
| Endpoint | Purpose |
|----------|---------|
| `/api/auth` | Login, register, token refresh |
| `/api/users` | User CRUD, profile management |
| `/api/scholarships` | Scholarship CRUD |
| `/api/applications` | Application submission, review |

### Database Schema
- **users**: student_id, email, password, name, phone, faculty, department, year_of_study, gpa, role (student/admin/committee)
- **scholarships**: name, description, eligibility, benefits, required_documents, dates, status, scholarship_type
- **applications**: user_id, scholarship_id, statement, family_income, documents, status (pending/reviewing/approved/rejected)

### Scholarship Types
`sit-merit`, `sit-activity`, `sit-work`, `kmutt-grant`, `kmutt-loan`, `kmutt-special`, `international`

### Authentication Flow
1. User logs in via `/api/auth/login` → receives JWT token
2. Frontend stores token in AuthContext
3. Axios interceptor adds `Authorization: Bearer <token>` to all requests
4. Backend middleware validates token and attaches user to request
5. Role-based routes use `authorizeRoles()` middleware

## Test Credentials
- **Admin**: admin@sit.kmutt.ac.th / admin123
- **Students**: Register through the web UI
