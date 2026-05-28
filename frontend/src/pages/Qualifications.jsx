import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../api/axios';
import { HiBadgeCheck } from 'react-icons/hi';

export default function Qualifications() {
  const [scholarships, setScholarships] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axiosInstance
      .get('/scholarships?category=sit')
      .then((res) => setScholarships(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="bg-gradient-to-r from-navy via-navy-light to-blue py-12 px-4 text-white text-center">
        <h1 className="text-3xl font-extrabold">คุณสมบัติทุนการศึกษา SIT</h1>
        <p className="text-white/80 text-sm mt-2 max-w-xl mx-auto">
          สรุปคุณสมบัติผู้สมัครของแต่ละทุน — ดึงจากข้อมูลทุนในระบบ
        </p>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {loading ? (
          <p className="text-center text-gray-500">กำลังโหลด...</p>
        ) : (
          scholarships.map((s) => (
            <div key={s.id} className="card p-6">
              <div className="flex items-start justify-between gap-4">
                <h2 className="font-bold text-lg text-slate-800">{s.name}</h2>
                <Link to={`/scholarships/${s.id}`} className="text-sm text-navy font-semibold shrink-0">
                  ดูรายละเอียด →
                </Link>
              </div>
              <div className="mt-4 flex items-start gap-2 text-sm text-gray-600 whitespace-pre-line">
                <HiBadgeCheck className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                <span>{s.eligibility || 'ไม่ระบุคุณสมบัติ'}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
