import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  HiOutlineMenu, HiOutlineX, HiUser, HiChevronDown,
  HiLogout, HiClipboardList, HiViewGrid, HiCog, HiSearch,
} from 'react-icons/hi';
import SitLogo from './SitLogo';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) =>
    path === '/'
      ? location.pathname === '/'
      : location.pathname === path || location.pathname.startsWith(path + '/');

  const getRoleName = (role) => {
    if (role === 'admin') return 'ผู้ดูแลระบบ';
    if (role === 'committee') return 'กรรมการ';
    return 'นักศึกษา';
  };

  const getRoleBadgeColor = (role) => {
    if (role === 'admin') return 'bg-red-100 text-red-700';
    if (role === 'committee') return 'bg-purple-100 text-purple-700';
    return 'bg-blue-100 text-blue-700';
  };

  const navLink = (to, label) => (
    <Link
      to={to}
      className={`px-3 py-2 rounded-xl text-sm font-semibold transition duration-200 ${
        isActive(to)
          ? 'text-white bg-navy shadow-sm'
          : 'text-slate-700 hover:text-navy hover:bg-slate-100'
      }`}
    >
      {label}
    </Link>
  );

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">

          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <SitLogo className="h-10 w-auto" />
            </Link>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center space-x-1">
            {navLink('/', 'หน้าแรก')}
            {navLink('/qualifications', 'คุณสมบัติ')}
            {navLink('/scholarships', 'มองหาทุน')}
            {(user?.role === 'admin' || user?.role === 'committee') && navLink('/admin/applications', 'พิจารณาทุน')}
            {user?.role === 'admin' && navLink('/admin/grouping', 'จัดกลุ่ม')}
            {user?.role === 'admin' && navLink('/admin/users', 'จัดการผู้ใช้')}
            {user?.role === 'student' && navLink('/my-applications', 'ใบสมัครของฉัน')}
          </div>

          {/* Desktop User / Login */}
          <div className="hidden md:flex items-center">
            {user ? (
              <div className="relative ml-3">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-gray-100 transition duration-200 focus:outline-none"
                >
                  <div className="w-8 h-8 rounded-full bg-navy/10 text-navy flex items-center justify-center font-bold text-sm">
                    {user.first_name?.[0] || '?'}
                  </div>
                  <div className="text-left hidden lg:block">
                    <div className="text-xs font-semibold text-gray-700">{user.first_name} {user.last_name}</div>
                    <span className={`text-[10px] font-medium px-1.5 rounded-full ${getRoleBadgeColor(user.role)}`}>
                      {getRoleName(user.role)}
                    </span>
                  </div>
                  <HiChevronDown className="w-4 h-4 text-gray-500" />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 rounded-xl bg-white border border-gray-100 shadow-lg py-1 z-50">
                    {/* User Info Header */}
                    <div className="px-4 py-2.5 border-b border-gray-100">
                      <div className="text-xs font-semibold text-gray-800">{user.first_name} {user.last_name}</div>
                      <div className="text-[10px] text-gray-500 truncate">{user.email}</div>
                      <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${getRoleBadgeColor(user.role)}`}>
                        {getRoleName(user.role)}
                      </span>
                    </div>

                    {/* Common links */}
                    <Link to="/profile" onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      <HiUser className="w-4 h-4" /> ข้อมูลส่วนตัว
                    </Link>

                    {/* Student links */}
                    {user.role === 'student' && (
                      <Link to="/my-applications" onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                        <HiClipboardList className="w-4 h-4" /> ใบสมัครของฉัน
                      </Link>
                    )}

                    {/* Committee links */}
                    {user.role === 'committee' && (
                      <Link to="/admin/applications" onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                        <HiClipboardList className="w-4 h-4" /> พิจารณาใบสมัคร
                      </Link>
                    )}

                    {/* Admin links */}
                    {user.role === 'admin' && (
                      <>
                        <Link to="/admin" onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                          <HiViewGrid className="w-4 h-4" /> แดชบอร์ด
                        </Link>
                        <Link to="/admin/scholarships" onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                          <HiCog className="w-4 h-4" /> จัดการทุน
                        </Link>
                        <Link to="/admin/applications" onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                          <HiClipboardList className="w-4 h-4" /> จัดการใบสมัคร
                        </Link>
                        <Link to="/admin/users" onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                          <HiUser className="w-4 h-4" /> จัดการผู้ใช้
                        </Link>
                      </>
                    )}

                    {/* Logout */}
                    <div className="border-t border-gray-100 mt-1">
                      <button
                        onClick={() => { setDropdownOpen(false); handleLogout(); }}
                        className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <HiLogout className="w-4 h-4" /> ออกจากระบบ
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-navy transition">
                  เข้าสู่ระบบ
                </Link>
                <Link to="/register" className="btn-primary !py-2">
                  สมัครสมาชิก
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Hamburger */}
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
          <Link to="/" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-navy">หน้าแรก</Link>
          <Link to="/qualifications" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-navy">คุณสมบัติ</Link>
          <Link to="/scholarships" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-navy flex items-center gap-1"><HiSearch className="w-4 h-4"/> มองหาทุน</Link>
          {user?.role === 'student' && (
            <Link to="/my-applications" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-navy">ใบสมัครของฉัน</Link>
          )}
          {(user?.role === 'admin' || user?.role === 'committee') && (
            <Link to="/admin/applications" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-navy">พิจารณาทุน</Link>
          )}
          {user?.role === 'admin' && (
            <>
              <Link to="/admin/grouping" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-navy">จัดกลุ่ม</Link>
              <Link to="/admin/users" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-navy">จัดการผู้ใช้</Link>
              <Link to="/admin" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-navy">แดชบอร์ด</Link>
            </>
          )}
          <hr className="my-2 border-gray-100" />
          {user ? (
            <div className="space-y-1">
              <div className="px-3 py-2">
                <div className="text-sm font-semibold text-gray-800">{user.first_name} {user.last_name}</div>
                <div className="text-xs text-gray-500">{user.email}</div>
                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${getRoleBadgeColor(user.role)}`}>{getRoleName(user.role)}</span>
              </div>
              <Link to="/profile" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50">ข้อมูลส่วนตัว</Link>
              <button
                onClick={() => { setIsOpen(false); handleLogout(); }}
                className="w-full text-left block px-3 py-2 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50"
              >
                ออกจากระบบ
              </button>
            </div>
          ) : (
            <div className="space-y-2 pt-1">
              <Link to="/login" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50">เข้าสู่ระบบ</Link>
              <Link to="/register" onClick={() => setIsOpen(false)} className="btn-primary w-full text-center block">สมัครสมาชิก</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}