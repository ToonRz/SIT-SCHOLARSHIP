import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { HiUser, HiAcademicCap, HiLockClosed, HiPhone } from 'react-icons/hi';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Form Fields State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('IT');
  const [yearOfStudy, setYearOfStudy] = useState(1);
  const [gpa, setGpa] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Frontend Validations
    if (!firstName || !lastName || !studentId || !email || !password || !confirmPassword) {
      return toast.error('กรุณากรอกข้อมูลในช่องที่จำเป็นให้ครบถ้วน');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return toast.error('รูปแบบอีเมลไม่ถูกต้อง');
    }

    if (password.length < 6) {
      return toast.error('รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร');
    }

    if (password !== confirmPassword) {
      return toast.error('รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน');
    }

    const parsedGpa = parseFloat(gpa);
    if (gpa !== '' && (isNaN(parsedGpa) || parsedGpa < 0 || parsedGpa > 4.0)) {
      return toast.error('เกรดเฉลี่ย (GPAX) ต้องอยู่ระหว่าง 0.00 - 4.00');
    }

    setLoading(true);
    try {
      await register({
        first_name: firstName,
        last_name: lastName,
        student_id: studentId,
        phone,
        department,
        year_of_study: parseInt(yearOfStudy),
        gpa: gpa === '' ? null : parsedGpa,
        email,
        password
      });

      toast.success('สมัครสมาชิกและเข้าสู่ระบบสำเร็จ');
      navigate('/scholarships');
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.message || 'การสมัครสมาชิกล้มเหลว อีเมลหรือรหัสนักศึกษานี้อาจมีผู้ใช้อื่นแล้ว';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-12 flex flex-col justify-center items-center px-4 bg-gray-50">
      <div className="max-w-2xl w-full space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-black text-slate-800">สมัครสมาชิกใหม่</h2>
          <p className="text-gray-500 text-sm mt-1">กรอกข้อมูลส่วนตัวและการศึกษาให้ครบถ้วนเพื่อส่งสมัครขอรับทุน</p>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Section 1: Personal Info */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
                <span className="w-6 h-6 rounded-full bg-navy text-white flex items-center justify-center text-xs font-bold">1</span>
                <h3 className="font-bold text-slate-800">ข้อมูลส่วนตัว</h3>
              </div>

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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-600 block">รหัสนักศึกษา *</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="เช่น 66130500xxx"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    required
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
            </div>

            {/* Section 2: Education Info */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
                <span className="w-6 h-6 rounded-full bg-navy text-white flex items-center justify-center text-xs font-bold">2</span>
                <h3 className="font-bold text-slate-800">ประวัติการศึกษา</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-600 block">สาขาวิชา</label>
                  <select
                    className="input-field"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                  >
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
                    onChange={(e) => setYearOfStudy(parseInt(e.target.value))}
                  >
                    <option value={1}>ชั้นปีที่ 1</option>
                    <option value={2}>ชั้นปีที่ 2</option>
                    <option value={3}>ชั้นปีที่ 3</option>
                    <option value={4}>ชั้นปีที่ 4</option>
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
                    placeholder="เช่น 3.50"
                    value={gpa}
                    onChange={(e) => setGpa(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Account Info */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
                <span className="w-6 h-6 rounded-full bg-navy text-white flex items-center justify-center text-xs font-bold">3</span>
                <h3 className="font-bold text-slate-800">ข้อมูลบัญชีผู้ใช้</h3>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-600 block">อีเมลของมหาวิทยาลัย *</label>
                <input
                  type="email"
                  className="input-field"
                  placeholder="เช่น example@mail.kmutt.ac.th"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-600 block">รหัสผ่าน *</label>
                  <input
                    type="password"
                    className="input-field"
                    placeholder="อย่างน้อย 6 ตัวอักษร"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-600 block">ยืนยันรหัสผ่าน *</label>
                  <input
                    type="password"
                    className="input-field"
                    placeholder="กรอกรหัสผ่านอีกครั้ง"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button type="submit" disabled={loading} className="btn-primary w-full py-3 mt-6">
              {loading ? 'กำลังลงทะเบียน...' : 'สมัครสมาชิก'}
            </button>
          </form>

          {/* Login Link */}
          <p className="text-center text-xs text-gray-500 mt-6">
            มีบัญชีผู้ใช้อยู่แล้ว?{' '}
            <Link to="/login" className="font-semibold text-navy hover:text-navy-dark hover:underline">
              เข้าสู่ระบบที่นี่
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
