import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { HiUserCircle, HiIdentification, HiPencilAlt } from 'react-icons/hi';

export default function Profile() {
  const { user, fetchProfile } = useAuth();
  const [loading, setLoading] = useState(false);

  // Form Fields State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('');
  const [yearOfStudy, setYearOfStudy] = useState('');
  const [gpa, setGpa] = useState('');

  useEffect(() => {
    if (user) {
      setFirstName(user.first_name || '');
      setLastName(user.last_name || '');
      setPhone(user.phone || '');
      setDepartment(user.department || '');
      setYearOfStudy(user.year_of_study || '');
      setGpa(user.gpa || '');
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!firstName || !lastName) {
      return toast.error('กรุณากรอกชื่อจริงและนามสกุล');
    }

    const parsedGpa = parseFloat(gpa);
    if (gpa !== '' && (isNaN(parsedGpa) || parsedGpa < 0 || parsedGpa > 4.0)) {
      return toast.error('เกรดเฉลี่ยสะสม (GPAX) ต้องอยู่ระหว่าง 0.00 - 4.00');
    }

    setLoading(true);
    try {
      await axiosInstance.put('/auth/profile', {
        first_name: firstName,
        last_name: lastName,
        phone,
        department: department === '' ? null : department,
        year_of_study: yearOfStudy === '' ? null : parseInt(yearOfStudy),
        gpa: gpa === '' ? null : parsedGpa
      });

      // Update global auth state
      await fetchProfile();
      toast.success('อัปเดตประวัติส่วนตัวสำเร็จ');
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.message || 'ไม่สามารถบันทึกข้อมูลประวัติส่วนตัวได้';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadge = (role) => {
    if (role === 'admin') {
      return <span className="px-2.5 py-0.5 text-xs font-semibold rounded bg-red-100 text-red-800">ผู้ดูแลระบบ</span>;
    }
    if (role === 'committee') {
      return <span className="px-2.5 py-0.5 text-xs font-semibold rounded bg-blue-100 text-blue-800">กรรมการ</span>;
    }
    return <span className="px-2.5 py-0.5 text-xs font-semibold rounded bg-green-100 text-green-800">นักศึกษา</span>;
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-navy via-navy-light to-blue py-10 text-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
          {/* Avatar Icon */}
          <div className="w-20 h-20 bg-white/20 text-white rounded-full flex items-center justify-center border-2 border-white shadow-md">
            <HiUserCircle className="w-16 h-16" />
          </div>
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">{user.first_name} {user.last_name}</h1>
              {getRoleBadge(user.role)}
            </div>
            <p className="text-sm text-white/80 font-medium">{user.email}</p>
          </div>
        </div>
      </div>

      {/* Profile Form */}
      <div className="max-w-4xl mx-auto px-4 mt-8">
        <div className="card p-8 bg-white border border-gray-100">
          <h2 className="text-xl font-bold text-slate-800 border-b border-gray-100 pb-3 mb-6 flex items-center gap-2">
            <HiIdentification className="w-6 h-6 text-navy" /> แก้ไขข้อมูลส่วนตัว
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Row 1: Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-600 block">ชื่อจริง *</label>
                <input
                  type="text"
                  className="input-field"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-600 block">นามสกุล *</label>
                <input
                  type="text"
                  className="input-field"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Row 2: Phone & ID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-600 block">รหัสนักศึกษา (ถ้ามี)</label>
                <input
                  type="text"
                  className="input-field bg-gray-50 text-gray-400 cursor-not-allowed"
                  value={user.student_id || 'ไม่มี'}
                  disabled
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-600 block">เบอร์โทรศัพท์</label>
                <input
                  type="tel"
                  className="input-field"
                  placeholder="เช่น 0987654321"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>

            {/* Row 3: Department, Year & GPA (shown only for students) */}
            {user.role === 'student' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-gray-50 pt-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-600 block">สาขาวิชา</label>
                  <select
                    className="input-field"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                  >
                    <option value="">เลือกสาขาวิชา</option>
                    <option value="IT">IT (เทคโนโลยีสารสนเทศ)</option>
                    <option value="CS">CS (วิทยาการคอมพิวเตอร์)</option>
                    <option value="DSI">DSI (นวัตกรรมบริการดิจิทัล)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-600 block">ชั้นปีการศึกษา</label>
                  <select
                    className="input-field"
                    value={yearOfStudy}
                    onChange={(e) => setYearOfStudy(e.target.value)}
                  >
                    <option value="">เลือกชั้นปี</option>
                    <option value="1">ชั้นปีที่ 1</option>
                    <option value="2">ชั้นปีที่ 2</option>
                    <option value="3">ชั้นปีที่ 3</option>
                    <option value="4">ชั้นปีที่ 4</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-600 block">เกรดเฉลี่ยสะสม (GPAX)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="4"
                    className="input-field"
                    placeholder="เช่น 3.00"
                    value={gpa}
                    onChange={(e) => setGpa(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex items-center justify-end pt-4 border-t border-gray-100">
              <button type="submit" disabled={loading} className="btn-primary flex items-center gap-1">
                <HiPencilAlt className="w-5 h-5" />
                {loading ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
