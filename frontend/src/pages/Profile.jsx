import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axiosInstance from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { HiUserCircle, HiIdentification, HiLockClosed, HiPencilAlt, HiShieldCheck } from 'react-icons/hi';
import SitLogo from '../components/SitLogo';

const genderLabel = { male: 'ชาย', female: 'หญิง', other: 'อื่นๆ', prefer_not_say: 'ไม่ระบุ' };

export default function Profile() {
  const { user, fetchProfile } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [editUnlocked, setEditUnlocked] = useState(false);

  const [phone, setPhone] = useState('');
  const [personalEmail, setPersonalEmail] = useState('');
  const [gender, setGender] = useState('');
  const [fatherIncome, setFatherIncome] = useState('');
  const [motherIncome, setMotherIncome] = useState('');
  const [guardianName, setGuardianName] = useState('');
  const [guardianAddress, setGuardianAddress] = useState('');

  useEffect(() => {
    if (!user) return;
    setPhone(user.phone || '');
    setPersonalEmail(user.personal_email || '');
    setGender(user.gender || '');
    setFatherIncome(user.father_income ?? '');
    setMotherIncome(user.mother_income ?? '');
    setGuardianName(user.guardian_name || '');
    setGuardianAddress(user.guardian_address || '');
  }, [user]);

  useEffect(() => {
    const token = searchParams.get('verify');
    if (token && user) {
      axiosInstance
        .post('/auth/verify-email/confirm', { token })
        .then(async () => {
          await fetchProfile();
          toast.success('ยืนยันอีเมล Gmail สำเร็จ');
          setSearchParams({});
        })
        .catch(() => toast.error('ยืนยันอีเมลไม่สำเร็จ'));
    }
  }, [searchParams, user, fetchProfile, setSearchParams]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!editUnlocked) {
      return toast.error('กรุณากดปุ่ม "อนุญาตให้แก้ไข" ก่อนบันทึก');
    }

    setLoading(true);
    try {
      await axiosInstance.put('/auth/profile', {
        phone,
        personal_email: personalEmail,
        gender: gender || null,
        father_income: fatherIncome === '' ? null : parseFloat(fatherIncome),
        mother_income: motherIncome === '' ? null : parseFloat(motherIncome),
        guardian_name: guardianName,
        guardian_address: guardianAddress,
      });
      await fetchProfile();
      toast.success('บันทึกข้อมูลสำเร็จ');
      setEditUnlocked(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'บันทึกไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestVerify = async () => {
    if (!personalEmail) {
      return toast.error('กรุณากรอกอีเมล Gmail ก่อน');
    }
    try {
      const res = await axiosInstance.post('/auth/verify-email/request', { personal_email: personalEmail });
      toast.success(res.data.message);
      if (res.data.dev_verify_url) {
        console.info('Dev verify URL:', res.data.dev_verify_url);
        toast('โหมดพัฒนา: ดูลิงก์ยืนยันใน Console', { icon: '🔗' });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'ขอยืนยันไม่สำเร็จ');
    }
  };

  if (!user) return null;

  const readOnlyInput = 'input-field bg-gray-50 text-gray-600 cursor-not-allowed';

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="bg-gradient-to-r from-navy via-navy-light to-blue py-10 text-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 flex flex-col md:flex-row items-center gap-6">
          <SitLogo className="h-14 w-auto bg-white rounded-lg p-1" />
          <div className="text-center md:text-left">
            <h1 className="text-2xl font-extrabold">{user.first_name} {user.last_name}</h1>
            <p className="text-sm text-white/80">{user.email}</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 mt-8 space-y-6">
        {/* PDPA notice — FR-09, NFR-01 */}
        <div className="card p-4 bg-amber-50 border border-amber-200 flex gap-3 text-sm text-amber-900">
          <HiShieldCheck className="w-6 h-6 shrink-0" />
          <p>
            ระบบเก็บเฉพาะข้อมูลที่จำเป็นต่อการสมัครทุน ตาม PDPA ข้อมูลส่วนตัวบางรายการ (ชื่อ-นามสกุล รหัสประชาชน ที่อยู่ ฯลฯ)
            ไม่ถูกส่งให้ AI วิเคราะห์ทุน — AI ใช้เฉพาะ GPA ชั้นปี ภาคเรียน และสาขา
          </p>
        </div>

        {/* Read-only — FR-20 */}
        <div className="card p-8">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <HiLockClosed className="w-5 h-5 text-gray-400" /> ข้อมูลที่แก้ไขไม่ได้
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-500">รหัสนักศึกษา</label>
              <input className={readOnlyInput} value={user.student_id || '—'} disabled readOnly />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500">รหัสสมัคร</label>
              <input className={readOnlyInput} value={user.application_code || '—'} disabled readOnly />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500">ชื่อ-นามสกุล</label>
              <input className={readOnlyInput} value={`${user.first_name} ${user.last_name}`} disabled readOnly />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500">อีเมลมหาวิทยาลัย</label>
              <input className={readOnlyInput} value={user.email} disabled readOnly />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500">คณะ / สาขา</label>
              <input className={readOnlyInput} value={`${user.faculty || ''} — ${user.department || '—'}`} disabled readOnly />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500">ผลการเรียน (GPA)</label>
              <input className={readOnlyInput} value={user.gpa ?? '—'} disabled readOnly />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500">ชั้นปี / ภาคเรียน</label>
              <input
                className={readOnlyInput}
                value={`ปี ${user.year_of_study || '—'} / ภาค ${user.semester || '—'}`}
                disabled
                readOnly
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500">วิทยาเขต</label>
              <input className={readOnlyInput} value={user.campus || 'บางมด'} disabled readOnly />
            </div>
          </div>
        </div>

        {/* Editable with unlock — FR-21, FR-22 */}
        <div className="card p-8">
          <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <HiIdentification className="w-5 h-5 text-navy" /> ข้อมูลที่แก้ไขได้
            </h2>
            {!editUnlocked ? (
              <button type="button" onClick={() => setEditUnlocked(true)} className="btn-secondary !py-2 text-sm">
                อนุญาตให้แก้ไข
              </button>
            ) : (
              <span className="text-xs text-green-600 font-semibold">โหมดแก้ไขเปิดอยู่</span>
            )}
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-600">เบอร์โทรศัพท์</label>
                <input
                  type="tel"
                  className="input-field"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={!editUnlocked}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600">เพศ</label>
                <select
                  className="input-field"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  disabled={!editUnlocked}
                >
                  <option value="">เลือก</option>
                  <option value="male">ชาย</option>
                  <option value="female">หญิง</option>
                  <option value="other">อื่นๆ</option>
                  <option value="prefer_not_say">ไม่ระบุ</option>
                </select>
                {gender && !editUnlocked && (
                  <p className="text-xs text-gray-400 mt-1">{genderLabel[gender]}</p>
                )}
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4">
              <label className="text-xs font-semibold text-gray-600">อีเมล Gmail (ส่วนตัว)</label>
              <div className="flex gap-2 mt-1">
                <input
                  type="email"
                  className="input-field flex-1"
                  placeholder="example@gmail.com"
                  value={personalEmail}
                  onChange={(e) => setPersonalEmail(e.target.value)}
                  disabled={!editUnlocked}
                />
                <button
                  type="button"
                  onClick={handleRequestVerify}
                  disabled={!editUnlocked || user.email_verified}
                  className="btn-outline !px-3 text-xs shrink-0"
                >
                  {user.email_verified ? 'ยืนยันแล้ว ✓' : 'Verify Gmail'}
                </button>
              </div>
              {!user.email_verified && editUnlocked && (
                <p className="text-[10px] text-amber-600 mt-1">* กรุณายืนยันอีเมลก่อนส่งใบสมัคร (FR-23)</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-600">รายได้บิดา (บาท/ปี)</label>
                <input
                  type="number"
                  className="input-field"
                  value={fatherIncome}
                  onChange={(e) => setFatherIncome(e.target.value)}
                  disabled={!editUnlocked}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600">รายได้มารดา (บาท/ปี)</label>
                <input
                  type="number"
                  className="input-field"
                  value={motherIncome}
                  onChange={(e) => setMotherIncome(e.target.value)}
                  disabled={!editUnlocked}
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-600">ชื่อผู้ปกครอง</label>
              <input
                className="input-field"
                value={guardianName}
                onChange={(e) => setGuardianName(e.target.value)}
                disabled={!editUnlocked}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600">ที่อยู่ผู้ปกครอง</label>
              <textarea
                className="input-field"
                rows={2}
                value={guardianAddress}
                onChange={(e) => setGuardianAddress(e.target.value)}
                disabled={!editUnlocked}
              />
            </div>

            <div className="flex justify-end pt-2">
              <button type="submit" disabled={loading || !editUnlocked} className="btn-primary flex items-center gap-1">
                <HiPencilAlt className="w-5 h-5" />
                {loading ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
