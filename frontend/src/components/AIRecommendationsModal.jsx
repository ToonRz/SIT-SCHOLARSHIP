import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HiSparkles, HiX, HiExternalLink } from 'react-icons/hi';

export default function AIRecommendationsModal({
  show,
  onClose,
  recommendations,
  loading
}) {
  const navigate = useNavigate();

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-5 text-white shrink-0">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <HiSparkles className="w-6 h-6" />
              <h2 className="text-lg font-bold">ทุนที่เหมาะกับคุณ</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition"
            >
              <HiX className="w-5 h-5" />
            </button>
          </div>
          <p className="text-sm text-white/80 mt-1">AI วิเคราะห์จากข้อมูลโปรไฟล์ของคุณ</p>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto flex-1">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-sm text-gray-500">กำลังวิเคราะห์...</p>
            </div>
          ) : recommendations.length > 0 ? (
            <div className="space-y-4">
              {recommendations.map((rec, index) => (
                <div
                  key={rec.id}
                  className="border border-gray-100 rounded-xl p-4 hover:shadow-md transition bg-gray-50/50"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1">
                      {/* Rank Badge */}
                      <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                        index === 0 ? 'bg-amber-500' : index === 1 ? 'bg-gray-400' : 'bg-orange-400'
                      }`}>
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-slate-800 leading-tight">{rec.name}</h3>
                        {/* Match Score */}
                        <div className="mt-1 text-xs text-gray-500">
                          คะแนนความเหมาะสม: <span className="font-semibold text-orange-500">{rec.matchScore}%</span>
                        </div>
                        {/* Reasons */}
                        {rec.reasons && rec.reasons.length > 0 && (
                          <div className="mt-2 space-y-1">
                            <p className="text-xs text-gray-500 font-semibold mb-1">เหตุผลที่แนะนำ:</p>
                            {rec.reasons.map((reason, i) => (
                              <div key={i} className="flex items-start gap-2">
                                <span className="text-orange-500 mt-0.5">•</span>
                                <span className="text-sm text-gray-600">{reason}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  {/* View Detail Button */}
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={() => {
                        onClose();
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
        <div className="border-t border-gray-100 p-4 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="btn-outline !px-6"
          >
            ปิด
          </button>
        </div>
      </div>
    </div>
  );
}
