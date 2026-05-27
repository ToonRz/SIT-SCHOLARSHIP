import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../api/axios';
import { toast } from 'react-hot-toast';
import { HiOutlineDocumentSearch, HiOutlineClock, HiOutlineXCircle, HiOutlineChatAlt } from 'react-icons/hi';

export default function MyApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMyApplications = async () => {
    try {
      const res = await axiosInstance.get('/applications/my');
      setApplications(res.data);
    } catch (error) {
      console.error('Failed to load my applications', error);
      toast.error('ไม่สามารถโหลดข้อมูลใบสมัครได้');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyApplications();
  }, []);

  const handleCancelApplication = async (id) => {
    if (!window.confirm('คุณต้องการยกเลิกและลบใบสมัครนี้ใช่หรือไม่? (การดำเนินการนี้ไม่สามารถย้อนกลับได้)')) {
      return;
    }

    try {
      await axiosInstance.delete(`/applications/${id}`);
      toast.success('ยกเลิกใบสมัครสำเร็จ');
      // Reload applications list
      fetchMyApplications();
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.message || 'ยกเลิกใบสมัครล้มเหลว';
      toast.error(msg);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <span className="badge-pending">รอพิจารณา</span>;
      case 'reviewing':
        return <span className="badge-reviewing">กำลังพิจารณา</span>;
      case 'approved':
        return <span className="badge-approved">อนุมัติทุนการศึกษา</span>;
      case 'rejected':
        return <span className="badge-rejected">ไม่อนุมัติทุนการศึกษา</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded bg-gray-100 text-gray-800 text-xs font-semibold">{status}</span>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-navy border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-sm text-gray-500 font-medium">กำลังดึงข้อมูลใบสมัคร...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-navy via-navy-light to-blue py-12 px-4 text-white text-center">
        <h1 className="text-3xl font-extrabold tracking-tight">ใบสมัครขอรับทุนของฉัน</h1>
        <p className="text-sm text-white/80 mt-1 max-w-xl mx-auto">
          ติดตามสถานะ ความคืบหน้า และความเห็นการพิจารณาจากทางคณะวิชาได้ที่นี่
        </p>
      </div>

      <div className="max-w-4xl mx-auto px-4 mt-8">
        {applications.length > 0 ? (
          <div className="space-y-6">
            {applications.map((app) => (
              <div key={app.id} className="card p-6 bg-white border border-gray-100 flex flex-col md:flex-row justify-between gap-6 hover:shadow-md transition-shadow">
                
                {/* Info (Left Side) */}
                <div className="space-y-4 flex-grow">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="font-bold text-lg text-slate-800">{app.scholarship_name}</h3>
                    {getStatusBadge(app.status)}
                  </div>

                  <div className="flex items-center gap-4 text-xs text-gray-500 font-medium">
                    <span className="flex items-center gap-1">
                      <HiOutlineClock className="w-4 h-4 text-gray-400" />
                      ยื่นสมัครวันที่: {new Date(app.submitted_at).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })} น.
                    </span>
                  </div>

                  {/* Admin Comment (if exists) */}
                  {app.admin_comment && (
                    <div className="bg-gray-50 rounded-xl p-3.5 border border-gray-100 text-xs md:text-sm text-gray-600 flex items-start gap-2">
                      <HiOutlineChatAlt className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
                      <div>
                        <div className="font-semibold text-gray-700 mb-0.5">ข้อเสนอแนะจากเจ้าหน้าที่/กรรมการ:</div>
                        <div className="italic">"{app.admin_comment}"</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions (Right Side) */}
                <div className="flex flex-row md:flex-col justify-end items-end gap-2.5 shrink-0">
                  <Link to={`/scholarships/${app.scholarship_id}`} className="btn-outline !py-2 !px-4 text-xs">
                    ดูทุนการศึกษา
                  </Link>
                  {app.status === 'pending' && (
                    <button
                      onClick={() => handleCancelApplication(app.id)}
                      className="btn-outline !text-red-600 !border-red-200 hover:!bg-red-50 !py-2 !px-4 text-xs flex items-center gap-1"
                    >
                      <HiOutlineXCircle className="w-4 h-4" /> ยกเลิกใบสมัคร
                    </button>
                  )}
                </div>

              </div>
            ))}
          </div>
        ) : (
          <div className="card p-12 text-center text-gray-500 bg-white">
            <HiOutlineDocumentSearch className="w-14 h-14 mx-auto text-gray-300 mb-4" />
            <p className="font-bold text-slate-700">คุณยังไม่ได้ยื่นใบสมัครทุนการศึกษาใดๆ</p>
            <p className="text-xs mt-1 mb-6">เริ่มยื่นคำขอรับทุนการศึกษาแรกของคุณได้เลย</p>
            <Link to="/scholarships" className="btn-primary inline-flex">
              ค้นหาและเลือกทุนสมัคร
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
