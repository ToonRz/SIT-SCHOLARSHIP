import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { HiSearch, HiTrash, HiUserCircle } from 'react-icons/hi';

export default function AdminUsers() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const url = search ? `/users?search=${search}` : '/users';
      const res = await axiosInstance.get(url);
      setUsers(res.data);
    } catch (error) {
      console.error(error);
      toast.error('ไม่สามารถดึงรายชื่อผู้ใช้ได้');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await axiosInstance.put(`/users/${userId}/role`, { role: newRole });
      toast.success('เปลี่ยนบทบาทสำเร็จ');
      fetchUsers();
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.message || 'ไม่สามารถเปลี่ยนบทบาทได้';
      toast.error(msg);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('คุณแน่ใจว่าต้องการลบผู้ใช้นี้ออกจากระบบ? (การลบนี้จะลบใบสมัครทุนทั้งหมดที่เกี่ยวข้องกับผู้ใช้นี้ด้วย)')) {
      return;
    }

    try {
      await axiosInstance.delete(`/users/${userId}`);
      toast.success('ลบผู้ใช้งานสำเร็จ');
      fetchUsers();
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.message || 'ไม่สามารถลบผู้ใช้งานได้';
      toast.error(msg);
    }
  };

  const getRoleBg = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'committee':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'student':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-navy via-navy-light to-blue py-10 text-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="text-xs font-semibold uppercase tracking-wider block text-white/80">ระบบควบคุมจัดการ</span>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mt-1">จัดการบัญชีผู้ใช้งาน</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-6">
        
        {/* Search Container */}
        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <div className="relative flex-grow">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                <HiSearch className="w-5 h-5" />
              </span>
              <input
                type="text"
                className="input-field pl-10 !py-2.5"
                placeholder="ค้นหารหัสประจำตัว, ชื่อจริง, นามสกุล หรืออีเมล..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button type="submit" className="btn-primary !px-6 !py-2.5">
              ค้นหา
            </button>
          </form>
        </div>

        {/* Users Table */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <div className="w-10 h-10 border-4 border-navy border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-sm text-gray-500">กำลังดึงข้อมูลบัญชีผู้ใช้...</p>
          </div>
        ) : users.length > 0 ? (
          <div className="card bg-white border border-gray-100 shadow-sm overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 font-semibold">
                  <th className="p-4">ผู้ใช้งาน</th>
                  <th className="p-4">รหัสนักศึกษา</th>
                  <th className="p-4">อีเมล</th>
                  <th className="p-4">สาขาวิชา</th>
                  <th className="p-4">บทบาท (Role)</th>
                  <th className="p-4 text-right">ตัวเลือก</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-slate-700">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50/50 transition">
                    
                    {/* User display */}
                    <td className="p-4 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                        <HiUserCircle className="w-8 h-8 text-gray-400" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-800">{u.first_name} {u.last_name}</div>
                        <div className="text-[10px] text-gray-400">สมัครเมื่อ: {new Date(u.created_at).toLocaleDateString('th-TH')}</div>
                      </div>
                    </td>

                    <td className="p-4 font-semibold text-slate-700">{u.student_id || 'ไม่มี'}</td>
                    <td className="p-4 text-gray-600">{u.email}</td>
                    <td className="p-4">{u.department || 'ไม่ระบุ'}</td>
                    
                    {/* Role selector dropdown */}
                    <td className="p-4">
                      <select
                        className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold focus:outline-none ${getRoleBg(u.role)}`}
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        disabled={u.id === currentUser.id}
                      >
                        <option value="student">student (นักศึกษา)</option>
                        <option value="committee">committee (กรรมการ)</option>
                        <option value="admin">admin (ผู้ดูแล)</option>
                      </select>
                    </td>

                    {/* Delete options */}
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleDeleteUser(u.id)}
                        disabled={u.id === currentUser.id}
                        className={`p-1.5 rounded-lg border inline-flex items-center ${u.id === currentUser.id ? 'border-gray-100 text-gray-300 cursor-not-allowed' : 'border-red-100 hover:bg-red-50 text-red-600'}`}
                        title={u.id === currentUser.id ? 'ไม่สามารถลบตัวเองได้' : 'ลบผู้ใช้'}
                      >
                        <HiTrash className="w-4 h-4" />
                      </button>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="card p-12 text-center text-gray-500 bg-white">
            <p className="font-bold text-slate-700">ไม่พบข้อมูลบัญชีผู้ใช้งานใดๆ</p>
          </div>
        )}

        {/* Footer info counts */}
        <div className="text-xs text-gray-400 font-semibold text-right">
          จำนวนผู้ใช้ที่ลงทะเบียนทั้งหมด: {users.length} รายการ
        </div>

      </div>
    </div>
  );
}
