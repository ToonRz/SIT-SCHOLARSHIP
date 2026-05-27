import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { HiArrowLeft, HiOutlineCalendar, HiOutlineUserGroup, HiBadgeCheck, HiGift, HiDocumentText, HiLockClosed } from 'react-icons/hi';

export default function ScholarshipDetail() {
  const { id } = useParams();
  const { user, isStudent } = useAuth();
  const navigate = useNavigate();

  const [scholarship, setScholarship] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await axiosInstance.get(`/scholarships/${id}`);
        setScholarship(res.data);
      } catch (error) {
        console.error('Failed to load scholarship details', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-navy border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-sm text-gray-500 font-medium">กำลังโหลดข้อมูลทุน...</p>
      </div>
    );
  }

  if (!scholarship) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center text-gray-500">
        <p className="text-lg font-bold">ไม่พบทุนการศึกษาที่คุณระบุ</p>
        <Link to="/scholarships" className="btn-primary inline-flex mt-4">กลับไปหน้าค้นหาทุน</Link>
      </div>
    );
  }

  const { name, description, eligibility, benefits, required_documents, application_start, application_end, status, max_recipients, category, scholarship_type } = scholarship;

  // Category translation details
  const getCategoryDetails = (cat) => {
    switch (cat) {
      case 'sit': return { label: 'ทุน SIT', color: 'bg-navy/10 text-navy border-navy/20' };
      case 'kmutt': return { label: 'ทุน มจธ.', color: 'bg-blue/10 text-blue border-blue/20' };
      case 'international': return { label: 'ทุนต่างชาติ', color: 'bg-cyan-100 text-cyan-800 border-cyan-200' };
      default: return { label: cat, color: 'bg-gray-100 text-gray-800 border-gray-200' };
    }
  };

  const getTypeLabel = (type) => {
    const types = {
      'sit-merit': 'ทุนเรียนดี',
      'sit-activity': 'ทุนกิจกรรมเด่น',
      'sit-work': 'ทุนจ้างงาน',
      'kmutt-grant': 'ทุนการศึกษาให้เปล่า',
      'kmutt-loan': 'ทุนกู้ยืม (กยศ.)',
      'kmutt-special': 'ทุนสนับสนุนพิเศษ',
      'international': 'ทุนนักศึกษาต่างชาติ'
    };
    return types[type] || type;
  };

  const getStatusLabel = (stat) => {
    switch (stat) {
      case 'open': return 'เปิดรับสมัคร';
      case 'closed': return 'ปิดรับสมัคร';
      case 'upcoming': return 'เร็วๆ นี้';
      default: return stat;
    }
  };

  const catDetails = getCategoryDetails(category);

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-navy via-navy-light to-blue py-12 text-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link to="/scholarships" className="inline-flex items-center gap-1.5 text-xs text-white/80 hover:text-white mb-4 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg backdrop-blur-md transition duration-150">
            <HiArrowLeft className="w-4 h-4" /> ย้อนกลับไปรายการทุน
          </Link>
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-lg border bg-white/25 text-white border-white/20`}>
              {catDetails.label}
            </span>
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-lg bg-white/10 text-white border border-white/20">
              {getTypeLabel(scholarship_type)}
            </span>
            <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-lg ${status === 'open' ? 'bg-green-500 text-white' : status === 'closed' ? 'bg-red-500 text-white' : 'bg-yellow-400 text-slate-800'}`}>
              {getStatusLabel(status)}
            </span>
          </div>
          <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight">{name}</h1>
        </div>
      </div>

      {/* Main Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Info (2/3) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Description */}
            <div className="card p-8 space-y-4">
              <h2 className="text-xl font-bold text-slate-800 border-b border-gray-100 pb-3 flex items-center gap-2">
                รายละเอียดทุนการศึกษา
              </h2>
              <p className="text-gray-600 text-sm md:text-base whitespace-pre-line leading-relaxed">
                {description || 'ไม่มีรายละเอียดเพิ่มเติม'}
              </p>
            </div>

            {/* Eligibility */}
            <div className="card p-8 space-y-4">
              <h2 className="text-xl font-bold text-slate-800 border-b border-gray-100 pb-3 flex items-center gap-2">
                <HiBadgeCheck className="w-6 h-6 text-green-500" /> คุณสมบัติผู้สมัคร
              </h2>
              <p className="text-gray-600 text-sm md:text-base whitespace-pre-line leading-relaxed">
                {eligibility || 'ไม่ระบุเงื่อนไขคุณสมบัติ'}
              </p>
            </div>

            {/* Benefits */}
            <div className="card p-8 space-y-4 bg-gradient-to-r from-blue-50 to-blue-100/30 border border-blue-100">
              <h2 className="text-xl font-bold text-blue-800 border-b border-blue-200/50 pb-3 flex items-center gap-2">
                <HiGift className="w-6 h-6 text-blue-600" /> สิทธิประโยชน์ / มูลค่าทุน
              </h2>
              <p className="text-blue-900 text-sm md:text-base whitespace-pre-line leading-relaxed font-medium">
                {benefits || 'ไม่มีข้อมูลรายละเอียดค่าใช้จ่ายสนับสนุน'}
              </p>
            </div>

            {/* Required Documents */}
            <div className="card p-8 space-y-4">
              <h2 className="text-xl font-bold text-slate-800 border-b border-gray-100 pb-3 flex items-center gap-2">
                <HiDocumentText className="w-6 h-6 text-blue-500" /> เอกสารที่ต้องใช้ยื่นประกอบ
              </h2>
              <p className="text-gray-600 text-sm md:text-base whitespace-pre-line leading-relaxed">
                {required_documents || 'ไม่ระบุเอกสารที่จำเป็น'}
              </p>
            </div>
          </div>

          {/* Sidebar (1/3) */}
          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-24 border border-gray-100 shadow-sm space-y-6">
              <h3 className="font-bold text-slate-800 border-b border-gray-100 pb-3">กำหนดเวลาและสิทธิ์</h3>

              <div className="space-y-4 text-sm">
                {/* Application timeline */}
                <div className="flex items-start gap-3">
                  <HiOutlineCalendar className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <div className="font-semibold text-gray-700">ช่วงเปิดรับสมัคร</div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {application_start ? new Date(application_start).toLocaleDateString('th-TH') : 'ไม่ระบุ'} - {application_end ? new Date(application_end).toLocaleDateString('th-TH') : 'ไม่ระบุ'}
                    </div>
                  </div>
                </div>

                {/* Recipient limitation */}
                <div className="flex items-start gap-3">
                  <HiOutlineUserGroup className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <div className="font-semibold text-gray-700">จำนวนที่รับสมัคร</div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {max_recipients && max_recipients > 0 ? `${max_recipients} ทุน/คน` : 'ไม่จำกัดจำนวน'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons depending on role / auth */}
              <div className="pt-2">
                {status !== 'open' ? (
                  <button disabled className="btn-primary w-full !bg-gray-300 !text-gray-500 !cursor-not-allowed">
                    ปิดรับสมัครในขณะนี้
                  </button>
                ) : !user ? (
                  <Link to="/login" className="btn-primary w-full">
                    เข้าสู่ระบบเพื่อสมัครทุน
                  </Link>
                ) : isStudent() ? (
                  <Link to={`/apply/${id}`} className="btn-primary w-full">
                    สมัครรับทุนการศึกษานี้
                  </Link>
                ) : (
                  <button disabled className="btn-primary w-full !bg-gray-200 !text-gray-400 !cursor-not-allowed flex items-center justify-center gap-1.5">
                    <HiLockClosed className="w-4 h-4" /> เฉพาะนักศึกษาเท่านั้น
                  </button>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
