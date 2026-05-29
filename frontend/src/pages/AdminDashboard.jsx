import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../api/axios';
import { toast } from 'react-hot-toast';
import {
  HiUsers, HiAcademicCap, HiDocumentText, HiClock, HiCheckCircle, HiXCircle,
  HiOutlineShieldCheck, HiOutlineCog, HiOutlineClipboardList, HiOutlineClock
} from 'react-icons/hi';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalScholarships: 0,
    totalApplications: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axiosInstance.get('/users/stats/dashboard');
        setStats(res.data);
      } catch (error) {
        console.error('Failed to load admin stats', error);
        toast.error('ไม่สามารถโหลดข้อมูลสถิติแดชบอร์ดได้');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-navy border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-sm text-gray-500 font-medium">กำลังโหลดข้อมูลแดชบอร์ด...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header */}
      <div className="bg-gradient-to-r from-navy via-navy-light to-blue py-10 text-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="text-xs font-semibold uppercase tracking-wider block text-white/80">ระบบหลังบ้านผู้ดูแลระบบ</span>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mt-1 flex items-center gap-2">
            <HiOutlineShieldCheck className="w-8 h-8" /> แดชบอร์ดสรุปภาพรวมระบบ
          </h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8">
        
        {/* Stat Cards Grid (6 cards) */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
          {/* Total Users */}
          <Link to="/admin/users" className="card p-5 bg-white border border-gray-100 hover:scale-105 transition-transform duration-200 flex flex-col justify-between h-36">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <HiUsers className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-800">{stats.totalUsers}</div>
              <div className="text-xs text-gray-400 font-semibold mt-0.5">ผู้ใช้งานทั้งหมด</div>
            </div>
          </Link>

          {/* Total Scholarships */}
          <Link to="/admin/scholarships" className="card p-5 bg-white border border-gray-100 hover:scale-105 transition-transform duration-200 flex flex-col justify-between h-36">
            <div className="w-10 h-10 rounded-xl bg-navy/10 text-navy flex items-center justify-center">
              <HiAcademicCap className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-800">{stats.totalScholarships}</div>
              <div className="text-xs text-gray-400 font-semibold mt-0.5">ทุนการศึกษา</div>
            </div>
          </Link>

          {/* Total Applications */}
          <Link to="/admin/applications" className="card p-5 bg-white border border-gray-100 hover:scale-105 transition-transform duration-200 flex flex-col justify-between h-36">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <HiDocumentText className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-800">{stats.totalApplications}</div>
              <div className="text-xs text-gray-400 font-semibold mt-0.5">ใบสมัครทั้งหมด</div>
            </div>
          </Link>

          {/* Pending */}
          <Link to="/admin/applications?status=pending" className="card p-5 bg-white border border-gray-100 hover:scale-105 transition-transform duration-200 flex flex-col justify-between h-36">
            <div className="w-10 h-10 rounded-xl bg-yellow-50 text-yellow-600 flex items-center justify-center">
              <HiClock className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-800">{stats.pending}</div>
              <div className="text-xs text-gray-400 font-semibold mt-0.5">รอรับการพิจารณา</div>
            </div>
          </Link>

          {/* Approved */}
          <Link to="/admin/applications?status=approved" className="card p-5 bg-white border border-gray-100 hover:scale-105 transition-transform duration-200 flex flex-col justify-between h-36">
            <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
              <HiCheckCircle className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-800">{stats.approved}</div>
              <div className="text-xs text-gray-400 font-semibold mt-0.5">ผ่านการอนุมัติ</div>
            </div>
          </Link>

          {/* Rejected */}
          <Link to="/admin/applications?status=rejected" className="card p-5 bg-white border border-gray-100 hover:scale-105 transition-transform duration-200 flex flex-col justify-between h-36">
            <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
              <HiXCircle className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-800">{stats.rejected}</div>
              <div className="text-xs text-gray-400 font-semibold mt-0.5">ไม่ผ่านการอนุมัติ</div>
            </div>
          </Link>
        </div>

        {/* Quick Actions (3 Cards) */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-800">ลิงก์ทางลัดการควบคุมจัดการ</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Manage Scholarships */}
            <Link to="/admin/scholarships" className="card p-6 bg-white border border-gray-100 hover:shadow-md hover:border-navy/30 group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-navy/10 text-navy flex items-center justify-center shrink-0">
                  <HiOutlineCog className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 group-hover:text-navy transition duration-150">จัดการระบบทุน</h3>
                  <p className="text-xs text-gray-400 mt-0.5">เพิ่มทุนการศึกษาใหม่ แก้ไขเงื่อนไข ปิดรับสมัคร</p>
                </div>
              </div>
            </Link>

            {/* Manage Applications */}
            <Link to="/admin/applications" className="card p-6 bg-white border border-gray-100 hover:shadow-md hover:border-navy/30 group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                  <HiOutlineClipboardList className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 group-hover:text-navy transition duration-150">พิจารณาใบสมัครทุน</h3>
                  <p className="text-xs text-gray-400 mt-0.5">ตรวจหลักฐาน ให้ความเห็น อนุมัติ/ไม่อนุมัติ</p>
                </div>
              </div>
            </Link>

            {/* Manage Users */}
            <Link to="/admin/users" className="card p-6 bg-white border border-gray-100 hover:shadow-md hover:border-navy/30 group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <HiUsers className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 group-hover:text-navy transition duration-150">จัดการบัญชีผู้ใช้งาน</h3>
                  <p className="text-xs text-gray-400 mt-0.5">ดูรายชื่อสมาชิก เปลี่ยนบทบาท (Role) ลบข้อมูลผู้ใช้</p>
                </div>
              </div>
            </Link>

            {/* Approval History */}
            <Link to="/admin/approval-history" className="card p-6 bg-white border border-gray-100 hover:shadow-md hover:border-navy/30 group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center shrink-0">
                  <HiOutlineClock className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 group-hover:text-navy transition duration-150">ประวัติการอนุมัติทุน</h3>
                  <p className="text-xs text-gray-400 mt-0.5">ดูประวัติการอนุมัติ/ไม่อนุมัติใบสมัครทุนทั้งหมด</p>
                </div>
              </div>
            </Link>

          </div>
        </div>

      </div>
    </div>
  );
}
