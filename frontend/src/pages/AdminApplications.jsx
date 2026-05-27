import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axios';
import { toast } from 'react-hot-toast';
import { HiOutlineDocumentText, HiOutlineUser, HiOutlineExternalLink, HiX } from 'react-icons/hi';

export default function AdminApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filtering state
  const [statusFilter, setStatusFilter] = useState(''); // 'pending', 'reviewing', 'approved', 'rejected', or ''
  
  // Selected Detail Modal State
  const [selectedApp, setSelectedApp] = useState(null);
  const [adminComment, setAdminComment] = useState('');

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const url = statusFilter ? `/applications?status=${statusFilter}` : '/applications';
      const res = await axiosInstance.get(url);
      setApplications(res.data);
    } catch (error) {
      console.error(error);
      toast.error('ไม่สามารถดึงข้อมูลใบสมัครได้');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [statusFilter]);

  const handleOpenDetailModal = (app) => {
    setSelectedApp(app);
    setAdminComment(app.admin_comment || '');
    
    // Set status to reviewing automatically on open if it was pending
    if (app.status === 'pending') {
      updateStatus(app.id, 'reviewing', app.admin_comment || '');
    }
  };

  const updateStatus = async (appId, newStatus, comment) => {
    try {
      await axiosInstance.patch(`/applications/${appId}/review`, {
        status: newStatus,
        admin_comment: comment
      });
      toast.success('บันทึกผลการพิจารณาสำเร็จ');
      
      // Close modal
      setSelectedApp(null);
      // Refresh list
      fetchApplications();
    } catch (error) {
      console.error(error);
      toast.error('เกิดข้อผิดพลาดในการบันทึกข้อมูลการพิจารณา');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <span className="badge-pending">รอพิจารณา</span>;
      case 'reviewing':
        return <span className="badge-reviewing">กำลังพิจารณา</span>;
      case 'approved':
        return <span className="badge-approved">อนุมัติ</span>;
      case 'rejected':
        return <span className="badge-rejected">ไม่อนุมัติ</span>;
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

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-navy via-navy-light to-blue py-10 text-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="text-xs font-semibold uppercase tracking-wider block text-white/80">ส่วนคณะกรรมการ / ผู้ดูแลระบบ</span>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mt-1">พิจารณาใบสมัครทุนการศึกษา</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        
        {/* Filter Tabs */}
        <div className="flex border-b border-gray-200 pb-1 overflow-x-auto space-x-2 mb-6">
          <button
            onClick={() => setStatusFilter('')}
            className={`px-4 py-2 font-semibold text-sm rounded-xl transition duration-150 shrink-0 ${
              statusFilter === '' ? 'bg-navy text-white' : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            ทั้งหมด
          </button>
          <button
            onClick={() => setStatusFilter('pending')}
            className={`px-4 py-2 font-semibold text-sm rounded-xl transition duration-150 shrink-0 ${
              statusFilter === 'pending' ? 'bg-navy text-white' : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            รอพิจารณา
          </button>
          <button
            onClick={() => setStatusFilter('reviewing')}
            className={`px-4 py-2 font-semibold text-sm rounded-xl transition duration-150 shrink-0 ${
              statusFilter === 'reviewing' ? 'bg-navy text-white' : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            กำลังพิจารณา
          </button>
          <button
            onClick={() => setStatusFilter('approved')}
            className={`px-4 py-2 font-semibold text-sm rounded-xl transition duration-150 shrink-0 ${
              statusFilter === 'approved' ? 'bg-navy text-white' : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            อนุมัติแล้ว
          </button>
          <button
            onClick={() => setStatusFilter('rejected')}
            className={`px-4 py-2 font-semibold text-sm rounded-xl transition duration-150 shrink-0 ${
              statusFilter === 'rejected' ? 'bg-navy text-white' : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            ไม่อนุมัติ
          </button>
        </div>

        {/* Results List */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <div className="w-10 h-10 border-4 border-navy border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-sm text-gray-500">กำลังโหลดใบสมัคร...</p>
          </div>
        ) : applications.length > 0 ? (
          <div className="space-y-4">
            {applications.map((app) => (
              <div key={app.id} className="card p-6 bg-white border border-gray-100 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 hover:shadow-md transition">
                {/* Left Side: Student Info & Scholarship */}
                <div className="space-y-3 flex-grow">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-bold text-slate-800 text-base">{app.scholarship_name}</h3>
                    <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-lg">{getTypeLabel(app.scholarship_type)}</span>
                    {getStatusBadge(app.status)}
                  </div>
                  
                  {/* Student details line */}
                  <div className="text-sm text-slate-600 flex flex-wrap items-center gap-x-4 gap-y-1">
                    <span className="font-semibold text-slate-900">{app.first_name} {app.last_name}</span>
                    <span className="text-gray-400 font-light">|</span>
                    <span>รหัสนักศึกษา: {app.student_id}</span>
                    <span className="text-gray-400 font-light">|</span>
                    <span>สาขา: {app.department}</span>
                    <span className="text-gray-400 font-light">|</span>
                    <span className="font-semibold text-navy">GPAX: {app.gpa || '0.00'}</span>
                  </div>

                  <p className="text-xs text-gray-400 font-medium">
                    ยื่นสมัครวันที่: {new Date(app.submitted_at).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })} น.
                  </p>
                </div>

                {/* Right Side: View detail trigger */}
                <button onClick={() => handleOpenDetailModal(app)} className="btn-primary !py-2 !px-4 text-xs font-semibold shrink-0">
                  เปิดตรวจพิจารณา
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="card p-12 text-center text-gray-500 bg-white">
            <p className="font-bold text-slate-700">ไม่พบใบสมัครใดๆ</p>
            <p className="text-xs mt-1">ไม่มีใบสมัครที่ตรงตามเงื่อนไขตัวกรองในขณะนี้</p>
          </div>
        )}
      </div>

      {/* Evaluation Detail Modal Dialog */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100 flex flex-col">
            
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100 shrink-0">
              <div>
                <span className="text-xs font-semibold text-gray-400">พิจารณาใบสมัครเลขที่ #{selectedApp.id}</span>
                <h2 className="text-lg font-bold text-slate-800 mt-0.5">{selectedApp.scholarship_name}</h2>
              </div>
              <button onClick={() => setSelectedApp(null)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
                <HiX className="w-6 h-6" />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-6 space-y-6 overflow-y-auto">
              
              {/* Student Demographics Profile */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                  <HiOutlineUser className="w-4 h-4" /> ข้อมูลผู้สมัครรับทุน
                </h3>
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div><span className="text-gray-500">ชื่อ-นามสกุล:</span> <span className="font-bold text-slate-800">{selectedApp.first_name} {selectedApp.last_name}</span></div>
                  <div><span className="text-gray-500">รหัสนักศึกษา:</span> <span className="font-semibold text-slate-800">{selectedApp.student_id}</span></div>
                  <div><span className="text-gray-500">อีเมล:</span> <span className="text-slate-800">{selectedApp.email}</span></div>
                  <div><span className="text-gray-500">เบอร์โทรศัพท์:</span> <span className="text-slate-800">{selectedApp.phone || 'ไม่ระบุ'}</span></div>
                  <div><span className="text-gray-500">สาขาวิชา:</span> <span className="text-slate-800">{selectedApp.department} (ชั้นปีที่ {selectedApp.year_of_study})</span></div>
                  <div><span className="text-gray-500">เกรดเฉลี่ย (GPAX):</span> <span className="font-extrabold text-navy">{selectedApp.gpa || '0.00'}</span></div>
                </div>
              </div>

              {/* Statement */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                  <HiOutlineDocumentText className="w-4 h-4" /> เหตุผลความประสงค์ขอรับทุน
                </h3>
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 text-sm text-slate-700 whitespace-pre-line leading-relaxed italic">
                  "{selectedApp.statement}"
                </div>
              </div>

              {/* Household income & docs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <span className="text-xs text-gray-500">รายได้เฉลี่ยครอบครัวต่อปี</span>
                  <div className="font-bold text-slate-800">
                    {parseFloat(selectedApp.family_income).toLocaleString('th-TH')} บาท
                  </div>
                </div>
                {selectedApp.document_url && (
                  <div className="space-y-1">
                    <span className="text-xs text-gray-500">เอกสารหลักฐานแนบ</span>
                    <div>
                      <a
                        href={selectedApp.document_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-navy hover:underline font-semibold flex items-center gap-1"
                      >
                        เปิดลิงก์เปิดตรวจหลักฐาน <HiOutlineExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {/* Additional Information details */}
              {selectedApp.additional_info && (
                <div className="space-y-1 text-sm">
                  <span className="text-xs text-gray-500">ข้อมูลความเดือดร้อนเพิ่มเติม</span>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-100 whitespace-pre-line">{selectedApp.additional_info}</p>
                </div>
              )}

              {/* Committee/Admin Evaluation Section */}
              <div className="border-t border-gray-100 pt-4 space-y-3">
                <h3 className="text-sm font-bold text-slate-800">ส่วนลงความเห็นและประเมินผล</h3>
                
                {/* Comment Textarea */}
                <div className="space-y-1">
                  <label className="text-xs text-gray-500">คำชี้แจง / เหตุผลการพิจารณา</label>
                  <textarea
                    rows="3"
                    className="input-field text-sm"
                    placeholder="พิมพ์ความเห็น หรือคำแนะนำชี้แจง..."
                    value={adminComment}
                    onChange={(e) => setAdminComment(e.target.value)}
                  ></textarea>
                </div>

                {/* Confirm Buttons (Approve or Reject or Save review) */}
                <div className="flex flex-wrap items-center justify-end gap-3 pt-3">
                  <button
                    onClick={() => updateStatus(selectedApp.id, 'rejected', adminComment)}
                    className="btn-outline !text-red-600 !border-red-200 hover:!bg-red-50"
                  >
                    ไม่อนุมัติทุน
                  </button>
                  <button
                    onClick={() => updateStatus(selectedApp.id, 'approved', adminComment)}
                    className="btn-primary !bg-green-600 hover:!bg-green-700 focus:!ring-green-500/50"
                  >
                    อนุมัติทุนการศึกษา
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
