import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axios';
import { toast } from 'react-hot-toast';
import { HiPlus, HiPencil, HiTrash, HiX, HiAdjustments } from 'react-icons/hi';

export default function AdminScholarships() {
  const [scholarships, setScholarships] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null); // null = create mode, otherwise = edit mode

  // Form Fields State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [eligibility, setEligibility] = useState('');
  const [benefits, setBenefits] = useState('');
  const [requiredDocuments, setRequiredDocuments] = useState('');
  const [scholarshipType, setScholarshipType] = useState('sit-merit');
  const [category, setCategory] = useState('sit');
  const [status, setStatus] = useState('upcoming');
  const [maxRecipients, setMaxRecipients] = useState(0);
  const [applicationStart, setApplicationStart] = useState('');
  const [applicationEnd, setApplicationEnd] = useState('');

  const fetchScholarships = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/scholarships');
      setScholarships(res.data);
    } catch (error) {
      console.error(error);
      toast.error('ไม่สามารถโหลดรายการทุนการศึกษาได้');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScholarships();
  }, []);

  const openCreateModal = () => {
    setEditingId(null);
    setName('');
    setDescription('');
    setEligibility('');
    setBenefits('');
    setRequiredDocuments('');
    setScholarshipType('sit-merit');
    setCategory('sit');
    setStatus('upcoming');
    setMaxRecipients(0);
    setApplicationStart('');
    setApplicationEnd('');
    setShowModal(true);
  };

  const openEditModal = (s) => {
    setEditingId(s.id);
    setName(s.name || '');
    setDescription(s.description || '');
    setEligibility(s.eligibility || '');
    setBenefits(s.benefits || '');
    setRequiredDocuments(s.required_documents || '');
    setScholarshipType(s.scholarship_type || 'sit-merit');
    setCategory(s.category || 'sit');
    setStatus(s.status || 'upcoming');
    setMaxRecipients(s.max_recipients || 0);
    
    // Format dates for inputs
    const startStr = s.application_start ? s.application_start.substring(0, 10) : '';
    const endStr = s.application_end ? s.application_end.substring(0, 10) : '';
    setApplicationStart(startStr);
    setApplicationEnd(endStr);
    
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name) {
      return toast.error('กรุณากรอกชื่อทุนการศึกษา');
    }

    const payload = {
      name,
      description,
      eligibility,
      benefits,
      required_documents: requiredDocuments,
      scholarship_type: scholarshipType,
      category,
      status,
      max_recipients: parseInt(maxRecipients) || 0,
      application_start: applicationStart || null,
      application_end: applicationEnd || null
    };

    try {
      if (editingId) {
        await axiosInstance.put(`/scholarships/${editingId}`, payload);
        toast.success('แก้ไขข้อมูลทุนสำเร็จ');
      } else {
        await axiosInstance.post('/scholarships', payload);
        toast.success('เพิ่มทุนการศึกษาใหม่สำเร็จ');
      }
      setShowModal(false);
      fetchScholarships();
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล';
      toast.error(msg);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('คุณแน่ใจว่าต้องการลบทุนการศึกษานี้? ใบสมัครทั้งหมดที่เกี่ยวข้องกับทุนนี้จะถูกลบไปด้วย')) {
      return;
    }

    try {
      await axiosInstance.delete(`/scholarships/${id}`);
      toast.success('ลบทุนการศึกษาสำเร็จ');
      fetchScholarships();
    } catch (error) {
      console.error(error);
      toast.error('ไม่สามารถลบทุนการศึกษาได้');
    }
  };

  // Translations
  const getCategoryLabel = (cat) => {
    const cats = { sit: 'ทุน SIT', kmutt: 'ทุน มจธ.', international: 'ทุนต่างชาติ' };
    return cats[cat] || cat;
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

  const getStatusBadge = (stat) => {
    switch (stat) {
      case 'open':
        return <span className="px-2.5 py-0.5 text-xs font-semibold rounded bg-green-100 text-green-800">เปิดรับสมัคร</span>;
      case 'closed':
        return <span className="px-2.5 py-0.5 text-xs font-semibold rounded bg-red-100 text-red-800">ปิดรับสมัคร</span>;
      case 'upcoming':
        return <span className="px-2.5 py-0.5 text-xs font-semibold rounded bg-yellow-100 text-yellow-800">เร็วๆ นี้</span>;
      default:
        return <span className="px-2.5 py-0.5 text-xs font-semibold rounded bg-gray-100 text-gray-800">{stat}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-navy via-navy-light to-blue py-10 text-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider block text-white/80">ระบบควบคุมจัดการ</span>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mt-1">จัดการรายการทุนการศึกษา</h1>
          </div>
          <button onClick={openCreateModal} className="btn-secondary !bg-white !text-slate-800 hover:!bg-gray-100 flex items-center gap-1.5 shrink-0 self-start sm:self-center">
            <HiPlus className="w-5 h-5 text-navy" /> เพิ่มทุนการศึกษาใหม่
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <div className="w-10 h-10 border-4 border-navy border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-sm text-gray-500">กำลังโหลดรายการทุน...</p>
          </div>
        ) : scholarships.length > 0 ? (
          <div className="card bg-white border border-gray-100 shadow-sm overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 font-semibold">
                  <th className="p-4">ชื่อทุนการศึกษา</th>
                  <th className="p-4">หมวดหมู่</th>
                  <th className="p-4">ประเภท</th>
                  <th className="p-4">สถานะ</th>
                  <th className="p-4 text-right">ตัวเลือก</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-slate-700">
                {scholarships.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50/50 transition">
                    <td className="p-4 font-bold text-slate-800">{s.name}</td>
                    <td className="p-4">{getCategoryLabel(s.category)}</td>
                    <td className="p-4 text-xs font-semibold text-gray-500">{getTypeLabel(s.scholarship_type)}</td>
                    <td className="p-4">{getStatusBadge(s.status)}</td>
                    <td className="p-4 text-right space-x-1 shrink-0">
                      <button
                        onClick={() => openEditModal(s)}
                        className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 text-gray-600 inline-flex items-center"
                        title="แก้ไขข้อมูล"
                      >
                        <HiPencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(s.id)}
                        className="p-1.5 rounded-lg border border-red-100 hover:bg-red-50 text-red-600 inline-flex items-center"
                        title="ลบทันที"
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
            <p className="font-bold text-slate-700">ยังไม่มีข้อมูลทุนการศึกษาในระบบ</p>
            <p className="text-xs mt-1">เริ่มสร้างทุนการศึกษาหลักสูตรแรกของคุณโดยกดปุ่มด้านบน</p>
          </div>
        )}
      </div>

      {/* Modal Form Dialog */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100 flex flex-col">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100 shrink-0">
              <h2 className="text-xl font-bold text-slate-800">
                {editingId ? 'แก้ไขข้อมูลทุนการศึกษา' : 'เพิ่มทุนการศึกษาใหม่'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
                <HiX className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
              
              {/* Name */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-600 block">ชื่อทุนการศึกษา *</label>
                <input
                  type="text"
                  className="input-field"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-600 block">รายละเอียดทุน *</label>
                <textarea
                  rows="3"
                  className="input-field"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                ></textarea>
              </div>

              {/* Eligibility */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-600 block">คุณสมบัติผู้สมัคร</label>
                <textarea
                  rows="2"
                  className="input-field"
                  value={eligibility}
                  onChange={(e) => setEligibility(e.target.value)}
                ></textarea>
              </div>

              {/* Benefits */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-600 block">สิทธิประโยชน์ / ค่าใช้จ่ายสนับสนุน</label>
                <textarea
                  rows="2"
                  className="input-field"
                  value={benefits}
                  onChange={(e) => setBenefits(e.target.value)}
                ></textarea>
              </div>

              {/* Required Documents */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-600 block">เอกสารที่จำเป็นต้องแนบ</label>
                <textarea
                  rows="2"
                  className="input-field"
                  value={requiredDocuments}
                  onChange={(e) => setRequiredDocuments(e.target.value)}
                ></textarea>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Category selection */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-600 block">หมวดหมู่</label>
                  <select
                    className="input-field"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    <option value="sit">ทุน SIT (คณะ)</option>
                    <option value="kmutt">ทุน มจธ. (มหาวิทยาลัย)</option>
                    <option value="international">ทุนต่างชาติ</option>
                  </select>
                </div>

                {/* Type Selection */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-600 block">ประเภททุน</label>
                  <select
                    className="input-field"
                    value={scholarshipType}
                    onChange={(e) => setScholarshipType(e.target.value)}
                  >
                    <option value="sit-merit">ทุนเรียนดี</option>
                    <option value="sit-activity">ทุนกิจกรรมเด่น</option>
                    <option value="sit-work">ทุนจ้างงาน</option>
                    <option value="kmutt-grant">ทุนการศึกษาให้เปล่า</option>
                    <option value="kmutt-loan">ทุนกู้ยืม (กยศ.)</option>
                    <option value="kmutt-special">ทุนสนับสนุนพิเศษ</option>
                    <option value="international">ทุนนักศึกษาต่างชาติ</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Status Selection */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-600 block">สถานะ</label>
                  <select
                    className="input-field"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <option value="upcoming">เร็วๆ นี้ (upcoming)</option>
                    <option value="open">เปิดรับสมัคร (open)</option>
                    <option value="closed">ปิดรับสมัคร (closed)</option>
                  </select>
                </div>

                {/* Max recipients limit */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-600 block">จำนวนผู้รับทุนสูงสุด (คน/ทุน)</label>
                  <input
                    type="number"
                    min="0"
                    className="input-field"
                    value={maxRecipients}
                    onChange={(e) => setMaxRecipients(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Start Date */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-600 block">วันที่เริ่มเปิดรับ</label>
                  <input
                    type="date"
                    className="input-field"
                    value={applicationStart}
                    onChange={(e) => setApplicationStart(e.target.value)}
                  />
                </div>

                {/* End Date */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-600 block">วันที่ปิดรับสมัคร</label>
                  <input
                    type="date"
                    className="input-field"
                    value={applicationEnd}
                    onChange={(e) => setApplicationEnd(e.target.value)}
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 shrink-0">
                <button type="button" onClick={() => setShowModal(false)} className="btn-outline">
                  ยกเลิก
                </button>
                <button type="submit" className="btn-primary">
                  {editingId ? 'บันทึกการแก้ไข' : 'สร้างทุน'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}
