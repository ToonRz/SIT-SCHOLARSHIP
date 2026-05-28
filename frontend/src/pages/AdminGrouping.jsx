import React, { useEffect, useState } from 'react';
import axiosInstance from '../api/axios';
import { HiViewGrid } from 'react-icons/hi';

const TYPE_LABELS = {
  'sit-merit': 'ทุนเรียนดี',
  'sit-activity': 'ทุนกิจกรรมดีเด่น',
  'sit-work': 'ทุนจ้างงาน',
  'kmutt-grant': 'ทุน มจธ. (ให้เปล่า)',
  'kmutt-loan': 'ทุนกู้ยืม',
  'kmutt-special': 'ทุนพิเศษ',
  international: 'ทุนต่างชาติ',
};

export default function AdminGrouping() {
  const [groups, setGroups] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axiosInstance
      .get('/scholarships')
      .then((res) => {
        const grouped = res.data.reduce((acc, s) => {
          const key = s.scholarship_type || 'other';
          if (!acc[key]) acc[key] = [];
          acc[key].push(s);
          return acc;
        }, {});
        setGroups(grouped);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2 mb-6">
        <HiViewGrid className="w-7 h-7 text-navy" /> จัดกลุ่มทุนการศึกษา
      </h1>
      {loading ? (
        <p className="text-gray-500">กำลังโหลด...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(groups).map(([type, items]) => (
            <div key={type} className="card p-5 border-t-4 border-navy">
              <h2 className="font-bold text-slate-800 mb-3">{TYPE_LABELS[type] || type}</h2>
              <ul className="space-y-2 text-sm text-gray-600">
                {items.map((s) => (
                  <li key={s.id} className="flex justify-between gap-2">
                    <span>{s.name}</span>
                    <span className={`text-xs font-semibold ${s.status === 'open' ? 'text-green-600' : 'text-gray-400'}`}>
                      {s.status === 'open' ? 'เปิด' : s.status}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="text-xs text-gray-400 mt-3">รวม {items.length} ทุน</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
