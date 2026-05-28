import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../api/axios';
import { toast } from 'react-hot-toast';
import { HiOutlineArrowLeft, HiOutlineCheckCircle, HiOutlineDocumentText, HiPlus, HiTrash, HiEye } from 'react-icons/hi';
import { parseRequiredDocumentLabels } from '../utils/documents';

export default function Apply() {
  const { scholarshipId } = useParams();
  const navigate = useNavigate();

  const [scholarship, setScholarship] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [docErrors, setDocErrors] = useState([]);

  const [statement, setStatement] = useState('');
  const [familyIncome, setFamilyIncome] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [documents, setDocuments] = useState([]);

  const requiredLabels = useMemo(
    () => parseRequiredDocumentLabels(scholarship?.required_documents),
    [scholarship]
  );

  useEffect(() => {
    const fetchScholarship = async () => {
      try {
        const res = await axiosInstance.get(`/scholarships/${scholarshipId}`);
        setScholarship(res.data);
        if (res.data.status !== 'open') {
          toast.error('ทุนการศึกษานี้ไม่ได้เปิดรับสมัครในขณะนี้');
          navigate(`/scholarships/${scholarshipId}`);
        }
        const labels = parseRequiredDocumentLabels(res.data.required_documents);
        if (labels.length > 0) {
          setDocuments(labels.map((label) => ({ label, file: null, uploading: false })));
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
  }, [scholarshipId, navigate]);

  const uploadPdf = async (index, file) => {
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      toast.error('รองรับเฉพาะไฟล์ PDF เท่านั้น');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setDocuments((prev) => prev.map((d, i) => (i === index ? { ...d, uploading: true } : d)));

    try {
      const res = await axiosInstance.post('/applications/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setDocuments((prev) =>
        prev.map((d, i) =>
          i === index
            ? {
                ...d,
                uploading: false,
                file: {
                  originalName: res.data.originalName,
                  filename: res.data.filename,
                  url: res.data.url,
                },
              }
            : d
        )
      );
      toast.success('อัปโหลด PDF สำเร็จ');
    } catch (error) {
      setDocuments((prev) => prev.map((d, i) => (i === index ? { ...d, uploading: false } : d)));
      toast.error(error.response?.data?.message || 'อัปโหลดไม่สำเร็จ');
    }
  };

  const addDocumentSlot = () => {
    setDocuments((prev) => [...prev, { label: '', file: null, uploading: false }]);
  };

  const removeDocumentSlot = (index) => {
    setDocuments((prev) => prev.filter((_, i) => i !== index));
  };

  const validateDocuments = () => {
    const missing = [];
    if (requiredLabels.length === 0) {
      if (!documents.some((d) => d.file)) {
        missing.push('ต้องแนบเอกสาร PDF อย่างน้อย 1 ไฟล์');
      }
    } else {
      for (const label of requiredLabels) {
        const found = documents.find((d) => d.label === label && d.file);
        if (!found) missing.push(label);
      }
    }
    setDocErrors(missing);
    return missing.length === 0;
  };

  const buildPayloadDocuments = () =>
    documents
      .filter((d) => d.file)
      .map((d) => ({
        label: d.label || d.file.originalName,
        originalName: d.file.originalName,
        filename: d.file.filename,
        url: d.file.url,
      }));

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (statement.length < 50) {
      return toast.error('กรุณาเขียนเหตุผลความจำนงอย่างน้อย 50 ตัวอักษร');
    }
    if (!familyIncome || isNaN(parseFloat(familyIncome))) {
      return toast.error('กรุณากรอกรายได้ครอบครัวเป็นตัวเลข');
    }
    if (!validateDocuments()) {
      return toast.error('เอกสารแนบไม่ครบถ้วน กรุณาแนบ PDF ให้ครบตามรายการ');
    }

    setSubmitting(true);
    try {
      await axiosInstance.post('/applications', {
        scholarship_id: parseInt(scholarshipId, 10),
        statement,
        family_income: parseFloat(familyIncome),
        additional_info: additionalInfo,
        documents: buildPayloadDocuments(),
      });
      toast.success('ส่งใบสมัครทุนสำเร็จ');
      navigate('/my-applications');
    } catch (error) {
      const data = error.response?.data;
      if (data?.missingDocuments) {
        setDocErrors(data.missingDocuments);
      }
      toast.error(data?.message || 'เกิดข้อผิดพลาดในการส่งใบสมัคร');
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
      <div className="bg-gradient-to-r from-navy via-navy-light to-blue py-10 text-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4">
          <Link
            to={`/scholarships/${scholarshipId}`}
            className="inline-flex items-center gap-1.5 text-xs text-white/80 hover:text-white mb-4 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg backdrop-blur-md transition duration-150"
          >
            <HiOutlineArrowLeft className="w-4 h-4" /> ย้อนกลับ
          </Link>
          <span className="text-xs font-semibold uppercase tracking-wider block text-white/80">ใบสมัครขอรับทุนการศึกษา</span>
          <h1 className="text-xl md:text-3xl font-extrabold tracking-tight mt-1">{scholarship?.name}</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 mt-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <div className="card p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
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
                    placeholder="กรอกเหตุผลความจำเป็น..."
                    value={statement}
                    onChange={(e) => setStatement(e.target.value)}
                    required
                  />
                </div>

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

                <div className="space-y-1">
                  <label className="text-sm font-semibold text-gray-700 block">ข้อมูลเพิ่มเติม (ถ้ามี)</label>
                  <textarea
                    rows="3"
                    className="input-field"
                    value={additionalInfo}
                    onChange={(e) => setAdditionalInfo(e.target.value)}
                  />
                </div>

                {/* PDF Documents — FR-17, FR-19, NFR-05 */}
                <div className="space-y-3 border-t border-gray-100 pt-4">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-semibold text-gray-700">เอกสารแนบ (PDF เท่านั้น) *</label>
                    <button type="button" onClick={addDocumentSlot} className="btn-outline !py-1.5 !px-3 text-xs flex items-center gap-1">
                      <HiPlus className="w-4 h-4" /> เพิ่มเอกสาร
                    </button>
                  </div>

                  {docErrors.length > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
                      <p className="font-semibold mb-1">เอกสารไม่ครบถ้วน:</p>
                      <ul className="list-disc list-inside text-xs space-y-0.5">
                        {docErrors.map((err) => (
                          <li key={err}>{err}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {documents.length === 0 && (
                    <p className="text-xs text-gray-500">กด &quot;เพิ่มเอกสาร&quot; เพื่อแนบไฟล์ PDF</p>
                  )}

                  {documents.map((doc, index) => (
                    <div key={index} className="border border-gray-100 rounded-xl p-3 space-y-2">
                      <div className="flex justify-between items-start gap-2">
                        <span className="text-xs font-semibold text-gray-600">{doc.label || `เอกสารที่ ${index + 1}`}</span>
                        {!requiredLabels.includes(doc.label) && (
                          <button type="button" onClick={() => removeDocumentSlot(index)} className="text-red-500 p-1">
                            <HiTrash className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      {doc.file ? (
                        <p className="text-xs text-green-700 flex items-center gap-1">
                          <HiOutlineCheckCircle className="w-4 h-4" /> {doc.file.originalName}
                        </p>
                      ) : (
                        <input
                          type="file"
                          accept="application/pdf,.pdf"
                          className="text-xs w-full"
                          disabled={doc.uploading}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) uploadPdf(index, file);
                          }}
                        />
                      )}
                      {doc.uploading && <p className="text-xs text-gray-400">กำลังอัปโหลด...</p>}
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                  <button type="button" onClick={() => setShowPreview(true)} className="btn-outline flex items-center gap-1">
                    <HiEye className="w-4 h-4" /> ดูตัวอย่างก่อนส่ง
                  </button>
                  <Link to={`/scholarships/${scholarshipId}`} className="btn-outline">
                    ยกเลิก
                  </Link>
                  <button type="submit" disabled={submitting} className="btn-primary uppercase tracking-wide">
                    {submitting ? 'กำลังส่ง...' : 'SUBMIT'}
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div className="md:col-span-1">
            <div className="card p-6 bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200 space-y-4">
              <h3 className="font-bold text-blue-900 border-b border-blue-200 pb-2 flex items-center gap-1.5">
                <HiOutlineDocumentText className="w-5 h-5 text-blue-700" /> เอกสารที่ต้องเตรียม
              </h3>
              <p className="text-xs text-blue-800 whitespace-pre-line leading-relaxed">
                {scholarship?.required_documents || 'ไม่พบรายการเอกสาร'}
              </p>
              <p className="text-[10px] text-blue-700">* อัปโหลดเป็นไฟล์ .pdf เท่านั้น (สูงสุด 10 MB/ไฟล์)</p>
            </div>
          </div>
        </div>
      </div>

      {showPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 max-h-[80vh] overflow-y-auto">
            <h3 className="font-bold text-lg mb-4">ตัวอย่างใบสมัคร (จำลอง)</h3>
            <dl className="text-sm space-y-2 text-gray-600">
              <div><dt className="font-semibold text-gray-800">ทุน</dt><dd>{scholarship?.name}</dd></div>
              <div><dt className="font-semibold text-gray-800">เหตุผล</dt><dd className="whitespace-pre-line">{statement || '—'}</dd></div>
              <div><dt className="font-semibold text-gray-800">รายได้ครอบครัว</dt><dd>{familyIncome || '—'} บาท/ปี</dd></div>
              <div>
                <dt className="font-semibold text-gray-800">เอกสารแนบ</dt>
                <dd>
                  {buildPayloadDocuments().length > 0
                    ? buildPayloadDocuments().map((d) => <div key={d.url}>• {d.label}: {d.originalName}</div>)
                    : 'ยังไม่มีไฟล์'}
                </dd>
              </div>
            </dl>
            <button type="button" onClick={() => setShowPreview(false)} className="btn-primary w-full mt-6">
              ปิด
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
