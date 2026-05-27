import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { HiMail, HiLockClosed, HiAcademicCap, HiInformationCircle } from 'react-icons/hi';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      return toast.error('กรุณากรอกอีเมลและรหัสผ่าน');
    }

    setLoading(true);
    try {
      const loggedInUser = await login(email, password);
      toast.success('เข้าสู่ระบบสำเร็จ');

      // Redirect depending on user role
      if (loggedInUser.role === 'admin') {
        navigate('/admin');
      } else if (loggedInUser.role === 'committee') {
        navigate('/admin/applications');
      } else {
        navigate('/scholarships');
      }
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.message || 'อีเมลหรือรหัสผ่านไม่ถูกต้อง';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(screen-16rem)] py-12 flex flex-col justify-center items-center px-4 bg-gray-50">
      <div className="max-w-md w-full space-y-6">
        {/* Header Icon & Brand */}
        <div className="text-center">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-navy flex items-center justify-center text-white shadow-lg shadow-navy/20">
            <HiAcademicCap className="w-10 h-10" />
          </div>
          <h2 className="mt-4 text-3xl font-black text-slate-800">เข้าสู่ระบบ</h2>
          <p className="text-gray-500 text-sm mt-1">ระบบรับสมัครทุนการศึกษา คณะเทคโนโลยีสารสนเทศ</p>
        </div>

        {/* Login Card */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email input */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-600 block">อีเมลของมหาวิทยาลัย</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                  <HiMail className="w-5 h-5" />
                </span>
                <input
                  type="email"
                  className="input-field pl-10"
                  placeholder="name@sit.kmutt.ac.th"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Password input */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-600 block">รหัสผ่าน</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                  <HiLockClosed className="w-5 h-5" />
                </span>
                <input
                  type="password"
                  className="input-field pl-10"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <button type="submit" disabled={loading} className="btn-primary w-full py-3 mt-6">
              {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
            </button>
          </form>

          {/* Register Link */}
          <p className="text-center text-xs text-gray-500 mt-6">
            ยังไม่มีบัญชีผู้ใช้?{' '}
            <Link to="/register" className="font-semibold text-navy hover:text-navy-dark hover:underline">
              สมัครสมาชิกใหม่ที่นี่
            </Link>
          </p>
        </div>

        {/* Demo Credentials Box */}
        <div className="bg-gradient-to-r from-blue-50 to-blue-100/50 rounded-2xl p-4 border border-blue-200 shadow-sm flex gap-3">
          <HiInformationCircle className="w-6 h-6 text-blue-600 mt-0.5 shrink-0" />
          <div className="text-xs text-blue-800">
            <p className="font-bold mb-1">ข้อมูลผู้ดูแลระบบสำหรับการทดสอบระบบ (Demo Accounts):</p>
            <ul className="list-disc pl-4 space-y-0.5 font-medium">
              <li>อีเมล: <span className="underline">admin@sit.kmutt.ac.th</span></li>
              <li>รหัสผ่าน: <span className="underline">admin123</span></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
