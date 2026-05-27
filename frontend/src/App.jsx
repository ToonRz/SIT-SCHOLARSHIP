import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Scholarships from './pages/Scholarships';
import ScholarshipDetail from './pages/ScholarshipDetail';
import Apply from './pages/Apply';
import MyApplications from './pages/MyApplications';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import AdminScholarships from './pages/AdminScholarships';
import AdminApplications from './pages/AdminApplications';
import AdminUsers from './pages/AdminUsers';

export default function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/scholarships" element={<Scholarships />} />
            <Route path="/scholarships/:id" element={<ScholarshipDetail />} />

            {/* Protected Student Routes */}
            <Route element={<ProtectedRoute allowedRoles={['student']} />}>
              <Route path="/apply/:scholarshipId" element={<Apply />} />
              <Route path="/my-applications" element={<MyApplications />} />
            </Route>

            {/* Protected Shared Auth Profile Route */}
            <Route element={<ProtectedRoute allowedRoles={['student', 'admin', 'committee']} />}>
              <Route path="/profile" element={<Profile />} />
            </Route>

            {/* Protected Admin Routes */}
            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/scholarships" element={<AdminScholarships />} />
              <Route path="/admin/users" element={<AdminUsers />} />
            </Route>

            {/* Protected Admin & Committee Routes */}
            <Route element={<ProtectedRoute allowedRoles={['admin', 'committee']} />}>
              <Route path="/admin/applications" element={<AdminApplications />} />
            </Route>
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}
