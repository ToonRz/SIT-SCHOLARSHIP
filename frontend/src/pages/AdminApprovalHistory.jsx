import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axios';
import { toast } from 'react-hot-toast';
import { HiOutlineClock, HiOutlineCheckCircle, HiOutlineXCircle, HiCheckCircle, HiXCircle } from 'react-icons/hi';

export default function AdminApprovalHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/applications/approval-history');
      setHistory(res.data);
    } catch (error) {
      console.error(error);
      toast.error('ไม่สามารถดึงประวัติการอนุมัติได้');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-green-50 text-green-700 text-xs font-semibold">
            <HiCheckCircle className="w-3.5 h-3.5" /> อนุมัติ
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-50 text-red-700 text-xs font-semibold">
            <HiXCircle className="w-3.5 h-3.5" /> ไม่อนุมัติ
          </span>
        );
      default:
        return <span className="px-2.5 py-0.5 rounded bg-gray-100 text-gray-800 text-xs">{status}</span>;
    }
  };

  const getTypeLabel = (type) => {
    const types = {
      'sit-merit': 'ทุนเรียนดี',
      'sit-activity': 'ทุนกิจกรรมเด่น',
      'sit-work': 'ทุนจ้างงาน',
      'kmutt-grant': 'ทุนให้เปล่า',
      'kmutt-loan': 'ทุนกู้ยืม',
      'kmutt-special': 'ทุนสนับสนุนพิเศษ',
      'international': 'ทุนต่างชาติ'
    };
    return types[type] || type;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('th-TH', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }) + ' น.';
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-navy via-navy-light to-blue py-10 text-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="text-xs font-semibold uppercase tracking-wider block text-white/80">ส่วนผู้ดูแลระบบ</span>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mt-1">ประวัติการอนุมัติทุนการศึกษา</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <div className="w-10 h-10 border-4 border-navy border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-sm text-gray-500">กำลังโหลดประวัติการอนุมัติ...</p>
          </div>
        ) : history.length > 0 ? (
          <div className="space-y-4">
            {history.map((item) => (
              <div key={item.id} className="card p-6 bg-white border border-gray-100 hover:shadow-md transition">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                  {/* Left Side: Student & Scholarship Info */}
                  <div className="space-y-2 flex-grow">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold text-slate-800 text-base">{item.scholarship_name}</h3>
                      <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-lg">
                        {getTypeLabel(item.scholarship_type)}
                      </span>
                      {getStatusBadge(item.status)}
                    </div>

                    <div className="text-sm text-slate-600 flex flex-wrap items-center gap-x-4 gap-y-1">
                      <span className="font-semibold text-slate-900">{item.first_name} {item.last_name}</span>
                      <span className="text-gray-400 font-light">|</span>
                      <span>รหัสนักศึกษา: {item.student_id}</span>
                      <span className="text-gray-400 font-light">|</span>
                      <span>สาขา: {item.department}</span>
                    </div>

                    <p className="text-xs text-gray-400 font-medium">
                      อนุมัติ/ไม่อนุมัติโดย: {item.reviewer_first_name} {item.reviewer_last_name} |{' '}
                      {formatDate(item.reviewed_at)}
                    </p>

                    {item.admin_comment && (
                      <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100 mt-2">
                        <span className="font-semibold text-gray-500">ความเห็น: </span>{item.admin_comment}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="card p-12 text-center text-gray-500 bg-white">
            <HiOutlineClock className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <p className="font-bold text-slate-700">ยังไม่มีประวัติการอนุมัติ</p>
            <p className="text-xs mt-1">เมื่อมีการอนุมัติหรือไม่อนุมัติใบสมัครทุน จะแสดงที่นี่</p>
          </div>
        )}
      </div>
    </div>
  );
}