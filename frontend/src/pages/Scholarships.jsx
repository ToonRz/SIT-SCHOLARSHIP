import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axios';
import ScholarshipCard from '../components/ScholarshipCard';
import { HiSearch, HiExclamation, HiSparkles, HiX, HiExternalLink } from 'react-icons/hi';
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
                  <div className="w-4 h-4 border-2 border-sit-orange border-t-transparent rounded-full animate-spin"></div>
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
      {showAIModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-sit-orange to-kmutt-gold p-6 text-white">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <HiSparkles className="w-6 h-6" />
                  <h2 className="text-xl font-bold">ทุนที่เหมาะกับคุณ</h2>
                </div>
                <button
                  onClick={() => setShowAIModal(false)}
                  className="p-2 hover:bg-white/20 rounded-full transition"
                >
                  <HiX className="w-5 h-5" />
                </button>
              </div>
              <p className="text-sm text-white/80 mt-1">AI วิเคราะห์จากข้อมูลโปรไฟล์ของคุณ</p>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1">
              {recommendations.length > 0 ? (
                <div className="space-y-4">
                  {recommendations.map((rec, index) => (
                    <div
                      key={rec.id}
                      className="border border-gray-100 rounded-xl p-4 hover:shadow-md transition"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1">
                          {/* Rank Badge */}
                          <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                            index === 0 ? 'bg-kmutt-gold' : index === 1 ? 'bg-gray-400' : 'bg-orange-400'
                          }`}>
                            {index + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-slate-800 leading-tight">{rec.name}</h3>
                            {/* Match Score */}
                            <div className="mt-1 text-xs text-gray-500">
                              คะแนนความเหมาะสม: <span className="font-semibold text-sit-orange">{rec.matchScore}%</span>
                            </div>
                            {/* Reasons */}
                            <div className="mt-2 space-y-1">
                              <p className="text-xs text-gray-500 font-semibold mb-1">เหตุผลที่แนะนำ:</p>
                              {rec.reasons.map((reason, i) => (
                                <div key={i} className="flex items-start gap-2">
                                  <span className="text-sit-orange mt-0.5">•</span>
                                  <span className="text-sm text-gray-600">{reason}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                      {/* View Detail Button */}
                      <div className="mt-4 flex justify-end">
                        <button
                          onClick={() => {
                            setShowAIModal(false);
                            navigate(`/scholarships/${rec.id}`);
                          }}
                          className="btn-primary !px-4 !py-2 text-sm flex items-center gap-2"
                        >
                          <span>ดูรายละเอียด</span>
                          <HiExternalLink className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">ไม่พบทุนที่เหมาะกับคุณในขณะนี้</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="border-t border-gray-100 p-4 flex justify-end">
              <button
                onClick={() => setShowAIModal(false)}
                className="btn-outline !px-6"
              >
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}