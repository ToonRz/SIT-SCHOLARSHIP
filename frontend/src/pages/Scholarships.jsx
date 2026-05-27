import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axios';
import ScholarshipCard from '../components/ScholarshipCard';
import { HiSearch, HiAdjustments, HiExclamation } from 'react-icons/hi';

export default function Scholarships() {
  const [scholarships, setScholarships] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [category, setCategory] = useState(''); // 'sit', 'kmutt', 'international', or ''
  const [status, setStatus] = useState('');

  const fetchScholarships = async () => {
    setLoading(true);
    try {
      // Build query string
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (type) params.append('type', type);
      if (category) params.append('category', category);
      if (status) params.append('status', status);

      const res = await axiosInstance.get(`/scholarships?${params.toString()}`);
      setScholarships(res.data);
    } catch (error) {
      console.error('Failed to load scholarships', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Debounce search input or fetch instantly on filter change
    fetchScholarships();
  }, [category, type, status]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchScholarships();
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-navy via-navy-light to-blue py-12 px-4 text-white text-center">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">รายการทุนการศึกษาทั้งหมด</h1>
        <p className="text-sm md:text-base text-white/80 mt-1 max-w-xl mx-auto">
          ค้นหาและเลือกทุนการศึกษาที่สอดคล้องกับความสนใจและคุณสมบัติของคุณ
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-grow">
        {/* Search & Filters Container */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm mb-8 space-y-6">
          {/* Row 1: Search form */}
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <div className="relative flex-grow">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                <HiSearch className="w-5 h-5" />
              </span>
              <input
                type="text"
                className="input-field pl-10 !py-2.5"
                placeholder="พิมพ์คำค้นหา เช่น ชื่อทุน, คุณสมบัติ..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button type="submit" className="btn-primary !px-6 !py-2.5 shrink-0">
              ค้นหา
            </button>
          </form>

          {/* Row 2: Category Tabs & Select Filters */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-2">
            {/* Category Tabs */}
            <div className="flex border-b border-gray-100 pb-1 overflow-x-auto space-x-2">
              <button
                onClick={() => setCategory('')}
                className={`px-4 py-2 font-semibold text-sm rounded-xl transition duration-150 shrink-0 ${
                  category === '' ? 'bg-navy text-white' : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                ทั้งหมด
              </button>
              <button
                onClick={() => setCategory('sit')}
                className={`px-4 py-2 font-semibold text-sm rounded-xl transition duration-150 shrink-0 ${
                  category === 'sit' ? 'bg-navy text-white' : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                ทุน SIT
              </button>
              <button
                onClick={() => setCategory('kmutt')}
                className={`px-4 py-2 font-semibold text-sm rounded-xl transition duration-150 shrink-0 ${
                  category === 'kmutt' ? 'bg-navy text-white' : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                ทุน มจธ.
              </button>
              <button
                onClick={() => setCategory('international')}
                className={`px-4 py-2 font-semibold text-sm rounded-xl transition duration-150 shrink-0 ${
                  category === 'international' ? 'bg-navy text-white' : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                ทุนต่างชาติ
              </button>
            </div>

            {/* Select options */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Type filter */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-gray-500">ประเภท:</span>
                <select
                  className="input-field !py-2 !px-3 text-xs w-40"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                >
                  <option value="">ทั้งหมด</option>
                  <option value="sit-merit">ทุนเรียนดี</option>
                  <option value="sit-activity">ทุนกิจกรรมเด่น</option>
                  <option value="sit-work">ทุนจ้างงาน</option>
                  <option value="kmutt-grant">ทุนการศึกษาให้เปล่า</option>
                  <option value="kmutt-loan">ทุนกู้ยืม (กยศ.)</option>
                  <option value="kmutt-special">ทุนสนับสนุนพิเศษ</option>
                  <option value="international">ทุนนักศึกษาต่างชาติ</option>
                </select>
              </div>

              {/* Status filter */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-gray-500">สถานะ:</span>
                <select
                  className="input-field !py-2 !px-3 text-xs w-36"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="">ทั้งหมด</option>
                  <option value="open">เปิดรับสมัคร</option>
                  <option value="closed">ปิดรับสมัคร</option>
                  <option value="upcoming">เร็วๆ นี้</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Results Info */}
        <div className="mb-6 flex justify-between items-center text-sm text-gray-500 font-medium">
          <p>พบทุนการศึกษาทั้งหมด {scholarships.length} รายการ</p>
        </div>

        {/* Scholarships Grid */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <div className="w-10 h-10 border-4 border-navy border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-sm text-gray-400">กำลังโหลดทุนการศึกษา...</p>
          </div>
        ) : scholarships.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {scholarships.map((s) => (
              <ScholarshipCard key={s.id} scholarship={s} />
            ))}
          </div>
        ) : (
          <div className="card p-12 text-center text-gray-500">
            <HiExclamation className="w-12 h-12 mx-auto text-gray-300 mb-4" />
            <p className="font-bold text-slate-700">ไม่พบทุนการศึกษาตามเงื่อนไขที่เลือก</p>
            <p className="text-xs mt-1">กรุณาลองเปลี่ยนคำค้นหาหรือตั้งค่าตัวกรองใหม่</p>
          </div>
        )}
      </div>
    </div>
  );
}
