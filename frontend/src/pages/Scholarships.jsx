import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axios';
import ScholarshipCard from '../components/ScholarshipCard';
import AIRecommendationsModal from '../components/AIRecommendationsModal';
import { HiSearch, HiExclamation, HiSparkles } from 'react-icons/hi';
import { useAuth } from '../context/AuthContext';

export default function Scholarships() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [scholarships, setScholarships] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');

  // AI Modal State
  const [showAIModal, setShowAIModal] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');

  const fetchScholarships = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (type) params.append('type', type);
      params.append('category', 'sit'); // Only SIT scholarships

      const res = await axiosInstance.get(`/scholarships?${params.toString()}`);
      setScholarships(res.data);
    } catch (error) {
      console.error('Failed to load scholarships', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScholarships();
  }, [type]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchScholarships();
  };

  const handleAIAnalyze = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setAiLoading(true);
    setAiError('');
    setRecommendations([]);
    try {
      const res = await axiosInstance.get('/recommendations');
      setRecommendations(res.data);
      setShowAIModal(true);
    } catch (error) {
      if (error.response?.data?.requiresProfile) {
        setAiError('กรุณากรอก GPA และชั้นปีในโปรไฟล์ก่อน');
      } else {
        setAiError('เกิดข้อผิดพลาดในการวิเคราะห์ กรุณาลองใหม่อีกครั้ง');
      }
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-navy via-navy-light to-blue py-12 px-4 text-white text-center">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">ทุนการศึกษา SIT</h1>
        <p className="text-sm md:text-base text-white/80 mt-1 max-w-xl mx-auto">
          ทุนการศึกษาสำหรับนักศึกษาคณะเทคโนโลยีสารสนเทศ มจธ.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-grow">
        {/* Search & Filters Container */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm mb-8 space-y-6">
          {/* Row 1: Search form + AI Button */}
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-2">
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
            <button
              type="button"
              onClick={handleAIAnalyze}
              disabled={aiLoading}
              className="btn-secondary !px-4 !py-2.5 shrink-0 flex items-center gap-2"
            >
              {aiLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="hidden sm:inline">กำลังวิเคราะห์...</span>
                </>
              ) : (
                <>
                  <HiSparkles className="w-5 h-5" />
                  <span className="hidden sm:inline">วิเคราะห์ด้วย AI</span>
                </>
              )}
            </button>
          </form>

          {/* Error message */}
          {aiError && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
              <HiExclamation className="w-5 h-5 text-red-500 shrink-0" />
              <p className="text-sm text-red-700">{aiError}</p>
            </div>
          )}

          {/* Row 2: Type filter */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-gray-500">ประเภท:</span>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setType('')}
                className={`px-4 py-2 font-semibold text-sm rounded-xl transition duration-150 ${
                  type === '' ? 'bg-navy text-white' : 'text-gray-500 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                ทั้งหมด
              </button>
              <button
                onClick={() => setType('sit-merit')}
                className={`px-4 py-2 font-semibold text-sm rounded-xl transition duration-150 ${
                  type === 'sit-merit' ? 'bg-navy text-white' : 'text-gray-500 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                ทุนเรียนดี
              </button>
              <button
                onClick={() => setType('sit-activity')}
                className={`px-4 py-2 font-semibold text-sm rounded-xl transition duration-150 ${
                  type === 'sit-activity' ? 'bg-navy text-white' : 'text-gray-500 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                ทุนกิจกรรมดีเด่น
              </button>
              <button
                onClick={() => setType('sit-work')}
                className={`px-4 py-2 font-semibold text-sm rounded-xl transition duration-150 ${
                  type === 'sit-work' ? 'bg-navy text-white' : 'text-gray-500 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                ทุนจ้างงาน
              </button>
            </div>
          </div>
        </div>

        {/* Results Info */}
        <div className="mb-6 flex justify-between items-center text-sm text-gray-500 font-medium">
          <p>พบทุนการศึกษา {scholarships.length} รายการ</p>
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

      {/* AI Recommendations Modal */}
      <AIRecommendationsModal
        show={showAIModal}
        onClose={() => setShowAIModal(false)}
        recommendations={recommendations}
        loading={aiLoading}
      />
    </div>
  );
}