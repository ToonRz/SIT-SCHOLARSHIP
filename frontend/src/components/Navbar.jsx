import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HiOutlineMenu, HiOutlineX, HiUser, HiChevronDown, HiLogout, HiAcademicCap } from 'react-icons/hi';

export default function Navbar() {
  const { user, logout, isStudent, isAdmin, isCommittee } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const getRoleName = (role) => {
    if (role === 'admin') return 'ผู้ดูแลระบบ';
    if (role === 'committee') return 'กรรมการ';
    return 'นักศึกษา';
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-navy flex items-center justify-center text-white shadow-md shadow-navy/20">
                <HiAcademicCap className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg text-slate-800 tracking-tight leading-none">SIT SCHOLARSHIP</span>
                <span className="text-[10px] text-gray-500 font-medium">School of Information Technology</span>
              </div>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-1">
            <Link
              to="/"
              className={`px-4 py-2 rounded-xl text-sm font-medium transition duration-200 ${
                isActive('/') ? 'text-navy bg-navy/5' : 'text-gray-600 hover:text-navy hover:bg-gray-50'
              }`}
            >
              หน้าแรก
            </Link>
            <Link
              to="/scholarships"
              className={`px-4 py-2 rounded-xl text-sm font-medium transition duration-200 ${
                isActive('/scholarships') ? 'text-navy bg-navy/5' : 'text-gray-600 hover:text-navy hover:bg-gray-50'
              }`}
            >
              ทุนการศึกษา
            </Link>

            {user && isStudent() && (
              <Link
                to="/my-applications"
                className={`px-4 py-2 rounded-xl text-sm font-medium transition duration-200 ${
                  isActive('/my-applications') ? 'text-navy bg-navy/5' : 'text-gray-600 hover:text-navy hover:bg-gray-50'
                }`}
              >
                ใบสมัครของฉัน
              </Link>
            )}

            {user && (isAdmin() || isCommittee()) && (
              <>
                <Link
                  to="/admin"
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition duration-200 ${
                    isActive('/admin') ? 'text-navy bg-navy/5' : 'text-gray-600 hover:text-navy hover:bg-gray-50'
                  }`}
                >
                  แดชบอร์ด
                </Link>
                <Link
                  to="/admin/applications"
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition duration-200 ${
                    isActive('/admin/applications') ? 'text-navy bg-navy/5' : 'text-gray-600 hover:text-navy hover:bg-gray-50'
                  }`}
                >
                  พิจารณาทุน
                </Link>
              </>
            )}

            {user && isAdmin() && (
              <>
                <Link
                  to="/admin/scholarships"
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition duration-200 ${
                    isActive('/admin/scholarships') ? 'text-navy bg-navy/5' : 'text-gray-600 hover:text-navy hover:bg-gray-50'
                  }`}
                >
                  จัดการทุน
                </Link>
                <Link
                  to="/admin/users"
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition duration-200 ${
                    isActive('/admin/users') ? 'text-navy bg-navy/5' : 'text-gray-600 hover:text-navy hover:bg-gray-50'
                  }`}
                >
                  จัดการผู้ใช้
                </Link>
              </>
            )}
          </div>

          {/* User Profile / Login */}
          <div className="hidden md:flex items-center">
            {user ? (
              <div className="relative ml-3">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-gray-100 transition duration-200 focus:outline-none"
                >
                  <div className="w-8 h-8 rounded-full bg-navy/10 text-navy flex items-center justify-center font-bold">
                    {user.first_name[0]}
                  </div>
                  <div className="text-left hidden lg:block">
                    <div className="text-xs font-semibold text-gray-700">{user.first_name} {user.last_name}</div>
                    <div className="text-[10px] text-gray-500">{getRoleName(user.role)}</div>
                  </div>
                  <HiChevronDown className="w-4 h-4 text-gray-500" />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-xl bg-white border border-gray-100 shadow-lg py-1 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <div className="text-xs font-semibold text-gray-800">{user.first_name}</div>
                      <div className="text-[10px] text-gray-500 truncate">{user.email}</div>
                    </div>
                    <Link
                      to="/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <HiUser className="w-4 h-4" /> ข้อมูลส่วนตัว
                    </Link>
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        handleLogout();
                      }}
                      className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <HiLogout className="w-4 h-4" /> ออกจากระบบ
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="btn-outline !py-2">
                  เข้าสู่ระบบ
                </Link>
                <Link to="/register" className="btn-primary !py-2">
                  สมัครสมาชิก
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger menu */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-xl text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none"
            >
              {isOpen ? <HiOutlineX className="w-6 h-6" /> : <HiOutlineMenu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-b border-gray-100 py-2 px-4 space-y-1">
          <Link
            to="/"
            onClick={() => setIsOpen(false)}
            className="block px-3 py-2 rounded-xl text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-navy"
          >
            หน้าแรก
          </Link>
          <Link
            to="/scholarships"
            onClick={() => setIsOpen(false)}
            className="block px-3 py-2 rounded-xl text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-navy"
          >
            ทุนการศึกษา
          </Link>
          {user && isStudent() && (
            <Link
              to="/my-applications"
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2 rounded-xl text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-navy"
            >
              ใบสมัครของฉัน
            </Link>
          )}
          {user && (isAdmin() || isCommittee()) && (
            <>
              <Link
                to="/admin"
                onClick={() => setIsOpen(false)}
                className="block px-3 py-2 rounded-xl text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-navy"
              >
                แดชบอร์ด
              </Link>
              <Link
                to="/admin/applications"
                onClick={() => setIsOpen(false)}
                className="block px-3 py-2 rounded-xl text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-navy"
              >
                พิจารณาทุน
              </Link>
            </>
          )}
          {user && isAdmin() && (
            <>
              <Link
                to="/admin/scholarships"
                onClick={() => setIsOpen(false)}
                className="block px-3 py-2 rounded-xl text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-navy"
              >
                จัดการทุน
              </Link>
              <Link
                to="/admin/users"
                onClick={() => setIsOpen(false)}
                className="block px-3 py-2 rounded-xl text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-navy"
              >
                จัดการผู้ใช้
              </Link>
            </>
          )}
          <hr className="my-2 border-gray-100" />
          {user ? (
            <div className="space-y-1">
              <div className="px-3 py-2">
                <div className="text-sm font-semibold text-gray-800">{user.first_name} {user.last_name}</div>
                <div className="text-xs text-gray-500">{user.email}</div>
              </div>
              <Link
                to="/profile"
                onClick={() => setIsOpen(false)}
                className="block px-3 py-2 rounded-xl text-base font-medium text-gray-700 hover:bg-gray-50"
              >
                ข้อมูลส่วนตัว
              </Link>
              <button
                onClick={() => {
                  setIsOpen(false);
                  handleLogout();
                }}
                className="w-full text-left block px-3 py-2 rounded-xl text-base font-medium text-red-600 hover:bg-red-50"
              >
                ออกจากระบบ
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2 pt-2">
              <Link to="/login" onClick={() => setIsOpen(false)} className="btn-outline w-full text-center">
                เข้าสู่ระบบ
              </Link>
              <Link to="/register" onClick={() => setIsOpen(false)} className="btn-primary w-full text-center">
                สมัครสมาชิก
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
