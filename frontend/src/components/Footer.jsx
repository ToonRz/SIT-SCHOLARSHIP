import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-navy-dark text-slate-300 mt-auto border-t border-navy/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Faculty Brand */}
          <div className="space-y-3">
            <h3 className="text-white font-bold text-lg">คณะเทคโนโลยีสารสนเทศ</h3>
            <p className="text-xs text-slate-400">
              มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าธนบุรี (มจธ.)
            </p>
            <p className="text-sm">
              มุ่งเน้นผลิตบัณฑิตทางด้านเทคโนโลยีสารสนเทศที่มีคุณภาพระดับสากลและคุณธรรมจริยธรรม
            </p>
          </div>

          {/* Quick links */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold text-sm">ลิงก์ที่เป็นประโยชน์</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="https://www.sit.kmutt.ac.th" target="_blank" rel="noopener noreferrer" className="hover:text-blue-light transition duration-150">
                  เว็บไซต์ SIT KMUTT
                </a>
              </li>
              <li>
                <a href="https://www.kmutt.ac.th" target="_blank" rel="noopener noreferrer" className="hover:text-blue-light transition duration-150">
                  เว็บไซต์มหาวิทยาลัย KMUTT
                </a>
              </li>
              <li>
                <a href="https://www.sit.kmutt.ac.th/scholarship-bsc/" target="_blank" rel="noopener noreferrer" className="hover:text-blue-light transition duration-150">
                  ข่าวทุนการศึกษา SIT
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold text-sm">ติดต่อเรา</h4>
            <p className="text-sm text-slate-400">
              126 ถนนประชาอุทิศ แขวงบางมด เขตทุ่งครุ กรุงเทพฯ 10140
            </p>
            <p className="text-sm">
              <span className="text-slate-400">โทรศัพท์:</span> 02-470-9850
            </p>
            <p className="text-sm">
              <span className="text-slate-400">อีเมล:</span> webmaster@sit.kmutt.ac.th
            </p>
          </div>
        </div>

        <hr className="my-8 border-navy/30" />

        <div className="flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500 gap-4">
          <p>© 2026 School of Information Technology, KMUTT. All Rights Reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:underline">นโยบายความเป็นส่วนตัว</a>
            <a href="#" className="hover:underline">ข้อกำหนดการใช้งาน</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
