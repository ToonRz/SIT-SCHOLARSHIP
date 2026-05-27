import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../api/axios';
import { toast } from 'react-hot-toast';
import { HiOutlineArrowLeft, HiOutlineCheckCircle, HiOutlineDocumentText } from 'react-icons/hi';

export default function Apply() {
  const { scholarshipId } = useParams();
  const navigate = useNavigate();

  const [scholarship, setScholarship] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form Fields State
  const [statement, setStatement] = useState('');
  const [familyIncome, setFamilyIncome] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [documentUrl, setDocumentUrl] = useState('');

  useEffect(() => {
    const fetchScholarship = async () => {
      try {
        const res = await axiosInstance.get(`/scholarships/${scholarshipId}`);
        setScholarship(res.data);
        if (res.data.status !== 'open') {
          toast.error('ทุนการศึกษานี้ไม่ได้เปิดรับสมัครในขณะนี้');
          navigate(`/scholarships/${scholarshipId}`);
        }
      } catch (error) {
        console.error('Failed to load scholarship detail', error);
        toast.error('ไม่พบรายละเอียดทุนการศึกษา');
        navigate('/scholarships');
      } finally {
        setLoading(false);
      }
    };
    fetchScholarship();
  }, [scholarshipId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (statement.length < 50) {
      return toast.error('กรุณาเขียนเหตุผลความจำเป็นอย่างน้อย 50 ตัวอักษร');
    }

    if (!familyIncome || isNaN(parseFloat(familyIncome))) {
      return toast.error('กรุณากรอกรายได้ครอบครัวเป็นตัวเลข');
    }

    setSubmitting(true);
    try {
      await axiosInstance.post('/applications', {
        scholarship_id: parseInt(scholarshipId),
        statement,
        family_income: parseFloat(familyIncome),
        additional_info: additionalInfo,
        document_url: documentUrl
      });

      toast.success('ส่งใบสมัครทุนสำเร็จ เรียบร้อยแล้ว');
      navigate('/my-applications');
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.message || 'เกิดข้อผิดพลาดในการส่งใบสมัคร บางทีคุณอาจจะสมัครทุนนี้ไปแล้ว';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-navy border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-sm text-gray-500 font-medium">กำลังโหลด...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-navy via-navy-light to-blue py-10 text-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4">
          <Link to={`/scholarships/${scholarshipId}`} className="inline-flex items-center gap-1.5 text-xs text-white/80 hover:text-white mb-4 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg backdrop-blur-md transition duration-150">
            <HiOutlineArrowLeft className="w-4 h-4" /> ย้อนกลับ
          </Link>
          <span className="text-xs font-semibold uppercase tracking-wider block text-white/80">ใบสมัครขอรับทุนการศึกษา</span>
          <h1 className="text-xl md:text-3xl font-extrabold tracking-tight mt-1">{scholarship?.name}</h1>
        </div>
      </div>

      {/* Form Container */}
      <div className="max-w-4xl mx-auto px-4 mt-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Main Form Fields (2/3) */}
          <div className="md:col-span-2 space-y-6">
            <div className="card p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Statement of purpose */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-semibold text-gray-700">เหตุผลความจำเป็นและความประสงค์ขอรับทุน *</label>
                    <span className={`text-xs ${statement.length >= 50 ? 'text-green-600 font-bold' : 'text-gray-400'}`}>
                      {statement.length} / อย่างน้อย 50 ตัวอักษร
                    </span>
                  </div>
                  <textarea
                    rows="6"
                    className="input-field"
                    placeholder="กรอกเหตุผลความจำเป็น ประวัติ และทำไมท่านถึงเหมาะสมที่จะได้รับทุนการศึกษานี้..."
                    value={statement}
                    onChange={(e) => setStatement(e.target.value)}
                    required
                  ></textarea>
                </div>

                {/* Family Income */}
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-gray-700 block">รายได้เฉลี่ยครอบครัวต่อปี (บาท) *</label>
                  <input
                    type="number"
                    className="input-field"
                    placeholder="เช่น 240000"
                    value={familyIncome}
                    onChange={(e) => setFamilyIncome(e.target.value)}
                    required
                  />
                </div>

                {/* Additional Info */}
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-gray-700 block">ข้อมูลหรือความเดือดร้อนเพิ่มเติมอื่นๆ (ถ้ามี)</label>
                  <textarea
                    rows="3"
                    className="input-field"
                    placeholder="กรอกรายละเอียดความเดือดร้อนเร่งด่วนเพิ่มเติม..."
                    value={additionalInfo}
                    onChange={(e) => setAdditionalInfo(e.target.value)}
                  ></textarea>
                </div>

                {/* Document URL link */}
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-gray-700 block">ลิงก์แชร์เอกสารหลักฐาน (Google Drive, OneDrive) *</label>
                  <input
                    type="url"
                    className="input-field"
                    placeholder="เช่น https://drive.google.com/drive/folders/..."
                    value={documentUrl}
                    onChange={(e) => setDocumentUrl(e.target.value)}
                    required
                  />
                  <span className="text-[10px] text-gray-400 block mt-1">
                    * กรุณาอัปโหลดเอกสารทั้งหมดขึ้นบน Cloud Storage และเปิดสิทธิ์การเข้าถึงเป็นสาธารณะ (หรือแชร์เฉพาะลิงก์)
                  </span>
                </div>

                {/* Buttons */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                  <Link to={`/scholarships/${scholarshipId}`} className="btn-outline">
                    ยกเลิก
                  </Link>
                  <button type="submit" disabled={submitting} className="btn-primary">
                    {submitting ? 'กำลังส่งใบสมัคร...' : 'ส่งใบสมัคร'}
                  </button>
                </div>

              </form>
            </div>
          </div>

          {/* Reminder Sidebar (1/3) */}
          <div className="md:col-span-1">
            <div className="card p-6 bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200 space-y-4">
              <h3 className="font-bold text-blue-900 border-b border-blue-200 pb-2 flex items-center gap-1.5">
                <HiOutlineDocumentText className="w-5 h-5 text-blue-700" /> เอกสารที่ต้องเตรียม
              </h3>
              <p className="text-xs text-blue-800 whitespace-pre-line leading-relaxed">
                {scholarship?.required_documents || 'ไม่พบรายการเอกสารพิเศษประกอบเพิ่มเติม\n\nโดยทั่วไปแนะนำแนบ:\n1. ใบประวัติย่อ\n2. ใบเกรดเฉลี่ย (GPAX)\n3. สำเนาสมุดบัญชีธนาคาร'}
              </p>
              <div className="text-[10px] text-blue-700/80 pt-2 border-t border-blue-200/50 flex items-start gap-1">
                <HiOutlineCheckCircle className="w-4 h-4 shrink-0 text-blue-600" />
                <span>ตรวจสอบไฟล์ทุกอย่าง และตรวจสอบสิทธิ์ลิงก์แชร์ทุกครั้งก่อนจัดส่งใบสมัคร</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
