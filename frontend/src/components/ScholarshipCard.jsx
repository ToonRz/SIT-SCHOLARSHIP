import React from 'react';
import { Link } from 'react-router-dom';
import { HiOutlineCalendar, HiOutlineArrowRight, HiCurrencyDollar, HiDocumentText, HiExclamation } from 'react-icons/hi';
import { parseRequiredDocumentLabels } from '../utils/documents';

export default function ScholarshipCard({ scholarship }) {
  const { id, name, description, benefits, status, category, scholarship_type, application_end, required_documents } = scholarship;

  const getCategoryDetails = (cat) => {
    switch (cat) {
      case 'sit':
        return { label: 'ทุน SIT', color: 'bg-navy/10 text-navy border-navy/20' };
      case 'kmutt':
        return { label: 'ทุน มจธ.', color: 'bg-blue/10 text-blue-dark border-blue/20' };
      case 'international':
        return { label: 'ทุนต่างชาติ', color: 'bg-teal-100 text-teal-800 border-teal-200' };
      default:
        return { label: cat, color: 'bg-gray-100 text-gray-800 border-gray-200' };
    }
  };

  const getStatusDetails = (stat) => {
    switch (stat) {
      case 'open':
        return { label: 'เปิดรับสมัคร', dotColor: 'bg-green-500', textColor: 'text-green-700 bg-green-50' };
      case 'closed':
        return { label: 'ปิดรับสมัคร', dotColor: 'bg-red-500', textColor: 'text-red-700 bg-red-50' };
      case 'upcoming':
        return { label: 'เร็วๆ นี้', dotColor: 'bg-yellow-500', textColor: 'text-yellow-700 bg-yellow-50' };
      default:
        return { label: stat, dotColor: 'bg-gray-500', textColor: 'text-gray-700 bg-gray-50' };
    }
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

  const catDetails = getCategoryDetails(category);
  const statDetails = getStatusDetails(status);
  const docLabels = parseRequiredDocumentLabels(required_documents);
  const docCount = docLabels.length;

  return (
    <div className="card group flex flex-col h-full bg-white border border-gray-100 hover:shadow-lg transition-all duration-300">
      {/* Top Gradient Accent Bar */}
      <div className="h-1.5 w-full bg-gradient-to-r from-navy via-blue to-blue-light"></div>
      
      <div className="p-6 flex flex-col flex-grow">
        {/* Badges row */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-lg border ${catDetails.color}`}>
              {catDetails.label}
            </span>
            <span className="px-2.5 py-0.5 text-xs font-medium rounded-lg bg-gray/10 text-gray-dark">
              {getTypeLabel(scholarship_type)}
            </span>
          </div>

          <span className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${statDetails.textColor}`}>
            <span className={`w-2 h-2 rounded-full ${statDetails.dotColor}`}></span>
            {statDetails.label}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-bold text-lg text-slate-800 mb-2 group-hover:text-navy transition duration-150 line-clamp-1">
          {name}
        </h3>

        {/* Description */}
        <p className="text-gray-500 text-sm mb-4 line-clamp-3 flex-grow">
          {description}
        </p>

        {/* Benefits Preview Box */}
        {benefits && (
          <div className="bg-gradient-to-r from-blue/5 to-blue/10 rounded-xl p-3 mb-4 border border-blue/15 flex items-start gap-2">
            <HiCurrencyDollar className="w-5 h-5 text-blue-dark mt-0.5 shrink-0" />
            <div className="text-xs text-blue-dark font-medium line-clamp-2">
              {benefits}
            </div>
          </div>
        )}

        {docCount > 0 && (
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
            <HiDocumentText className="w-4 h-4 text-blue-500" />
            <span>เอกสาร PDF {docCount} รายการ</span>
            {status === 'open' && (
              <span className="text-amber-600 flex items-center gap-0.5" title="ต้องแนบครบก่อน Submit">
                <HiExclamation className="w-3.5 h-3.5" /> ต้องแนบครบ
              </span>
            )}
          </div>
        )}

        <hr className="border-gray-100 my-4" />

        {/* Card Footer */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-1.5">
            <HiOutlineCalendar className="w-4 h-4 text-gray-400" />
            <span>ปิดรับ: {application_end ? new Date(application_end).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' }) : 'ไม่ระบุ'}</span>
          </div>

          <Link to={`/scholarships/${id}`} className="font-semibold text-navy hover:text-navy-dark flex items-center gap-1 transition duration-150">
            ดูรายละเอียด
            <HiOutlineArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition duration-200" />
          </Link>
        </div>
      </div>
    </div>
  );
}
