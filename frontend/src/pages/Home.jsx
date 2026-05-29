import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axios';
import { useAuth } from '../context/AuthContext';
import ScholarshipCard from '../components/ScholarshipCard';
import AIRecommendationsModal from '../components/AIRecommendationsModal';
import { HiArrowRight, HiUserAdd, HiSearch, HiSparkles } from 'react-icons/hi';

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [featuredScholarships, setFeaturedScholarships] = useState([]);

  // AI Modal State
  const [showAIModal, setShowAIModal] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    const fetchScholarships = async () => {
      try {
        const res = await axiosInstance.get('/scholarships?status=open');
        setFeaturedScholarships(res.data.slice(0, 3));
      } catch (error) {
        console.error('Failed to load scholarships', error);
      }
    };
    fetchScholarships();
  }, []);

  const handleAIAnalyze = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setAiLoading(true);
    setRecommendations([]);
    try {
      const res = await axiosInstance.get('/recommendations');
      setRecommendations(res.data);
      setShowAIModal(true);
    } catch (error) {
      console.error('AI analysis failed', error);
      if (error.response?.data?.requiresProfile) {
        navigate('/profile');
      }
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-navy-dark via-navy to-blue py-20 px-4 text-center text-white">
        {/* Decorative blur elements */}
        <div className="absolute top-10 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-light/20 rounded-full blur-3xl"></div>

        <div className="relative max-w-4xl mx-auto space-y-6">
          <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold tracking-wider uppercase border border-white/20">
            คณะเทคโนโลยีสารสนเทศ มจธ.
          </span>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight">
            ระบบรับสมัคร <span className="text-blue-light">ทุนการศึกษา SIT KMUTT</span>
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto font-light leading-relaxed">
            สนับสนุนโอกาสทางการศึกษา พัฒนาศักยภาพนักศึกษาสู่อนาคตที่มั่นคง ยื่นสมัครทุนคณะและทุนมหาวิทยาลัยแบบออนไลน์ได้สะดวกรวดเร็ว
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link to="/scholarships" className="btn-secondary !px-8 !py-3.5 text-base flex items-center gap-2">
              ดูทุนการศึกษา <HiArrowRight className="w-5 h-5" />
            </Link>
            <button
              onClick={handleAIAnalyze}
              disabled={aiLoading}
              className="btn-secondary !px-8 !py-3.5 text-base flex items-center gap-2"
            >
              {aiLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                  กำลังวิเคราะห์...
                </>
              ) : (
                <>
                  <HiSparkles className="w-5 h-5" />
                  วิเคราะห์ด้วย AI
                </>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* 3 Steps Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center space-y-2 mb-12">
          <h2 className="text-3xl font-bold text-slate-800">ขั้นตอนการขอรับทุนการศึกษา</h2>
          <p className="text-gray-500 max-w-md mx-auto">เพียง 3 ขั้นตอนง่ายๆ ในการสมัครขอรับทุนผ่านระบบออนไลน์</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Step 1 */}
          <div className="card p-8 relative flex flex-col items-center text-center space-y-4 border-t-4 border-navy">
            <div className="w-14 h-14 rounded-2xl bg-navy/10 text-navy flex items-center justify-center text-2xl font-black">
              1
            </div>
            <h3 className="font-bold text-lg text-slate-800">สมัครสมาชิก</h3>
            <p className="text-gray-500 text-sm">
              กรอกข้อมูลส่วนตัว ประวัติการศึกษา และคะแนนเฉลี่ยสะสม (GPAX) ของคุณให้ถูกต้องและครบถ้วน
            </p>
          </div>

          {/* Step 2 */}
          <div className="card p-8 relative flex flex-col items-center text-center space-y-4 border-t-4 border-blue">
            <div className="w-14 h-14 rounded-2xl bg-blue/10 text-blue-dark flex items-center justify-center text-2xl font-black">
              2
            </div>
            <h3 className="font-bold text-lg text-slate-800">เลือกทุนการศึกษา</h3>
            <p className="text-gray-500 text-sm">
              ศึกษาเงื่อนไขการรับสมัคร ประเภททุน สิทธิประโยชน์ และคุณสมบัติ เพื่อเลือกทุนที่เหมาะสมกับคุณ
            </p>
          </div>

          {/* Step 3 */}
          <div className="card p-8 relative flex flex-col items-center text-center space-y-4 border-t-4 border-green-500">
            <div className="w-14 h-14 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center text-2xl font-black">
              3
            </div>
            <h3 className="font-bold text-lg text-slate-800">กรอกใบสมัคร & รอผล</h3>
            <p className="text-gray-500 text-sm">
              เขียนเหตุผลความจำนง แนบเอกสารหลักฐาน และกดยืนยันการสมัคร จากนั้นรอการประกาศผลการพิจารณา
            </p>
          </div>
        </div>
      </section>

      {/* Featured Scholarships Section */}
      <section className="bg-gray-50 py-16 px-4 sm:px-6 lg:px-8 border-t border-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-10">
            <div className="space-y-1">
              <h2 className="text-3xl font-bold text-slate-800">ทุนการศึกษาที่เปิดรับสมัคร</h2>
              <p className="text-gray-500 text-sm md:text-base">รีบยื่นสมัครภายในช่วงเวลาที่กำหนด</p>
            </div>
            <Link to="/scholarships" className="text-navy hover:text-navy-dark font-semibold text-sm flex items-center gap-1">
              ดูทุนทั้งหมด <HiArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {featuredScholarships.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredScholarships.map((s) => (
                <ScholarshipCard key={s.id} scholarship={s} />
              ))}
            </div>
          ) : (
            <div className="card p-12 text-center text-gray-500">
              <HiSearch className="w-12 h-12 mx-auto text-gray-300 mb-4" />
              <p className="font-medium text-slate-700">ไม่มีทุนการศึกษาเปิดรับสมัครในขณะนี้</p>
              <p className="text-xs mt-1">กรุณากลับมาตรวจสอบอีกครั้งภายหลัง</p>
            </div>
          )}
        </div>
      </section>

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
