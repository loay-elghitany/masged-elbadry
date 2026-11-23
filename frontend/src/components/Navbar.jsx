import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

function AcademyBrand() {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <span
        className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[#e7c77f]/35 bg-white/10 text-[#e7c77f]"
        aria-hidden="true"
      >
        <svg viewBox="0 0 40 40" fill="none" className="h-7 w-7">
          <path
            d="M20 5.5c-7.2 0-13 5.8-13 13 0 5.2 3.1 9.7 7.5 11.8V15.8c0-2.2 1.8-4 4-4h5.2A12.9 12.9 0 0 0 20 5.5Z"
            fill="currentColor"
            opacity=".9"
          />
          <path
            d="M20 19.2c0-2.2 1.8-4 4-4h7v16.4H24c-1.6 0-3 .8-4 2-1-1.2-2.4-2-4-2h-7V19.2h7c2.2 0 4 1.8 4 4"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinejoin="round"
          />
          <path d="M20 22v11.6" stroke="currentColor" strokeWidth="1.7" />
        </svg>
      </span>
      <span className="min-w-0 leading-tight">
        <span className="block truncate font-kufi text-lg font-bold">
          مسجد البدري
        </span>
        <span className="mt-1 block truncate text-xs text-white/65">
          لتحفيظ القرآن الكريم
        </span>
      </span>
    </div>
  );
}

export default function Navbar({ role }) {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("jwtToken");
    localStorage.removeItem("user");
    navigate("/login");
    setShowMobileMenu(false);
  };

  const isActive = (path) => location.pathname === path;

  const navigateTo = (path) => {
    navigate(path);
    setShowMobileMenu(false);
  };

  const getDashboardPath = (userRole) => {
    switch (userRole) {
      case "SuperAdmin":
        return "/admin";
      case "Teacher":
        return "/teacher";
      case "Student":
        return "/student";
      case "Parent":
        return "/parent";
      default:
        return "/";
    }
  };

  const getRoleLabel = (userRole) => {
    switch (userRole) {
      case "SuperAdmin":
        return "مدير النظام";
      case "Teacher":
        return "المعلم";
      case "Student":
        return "الطالب";
      case "Parent":
        return "ولي الأمر";
      default:
        return userRole;
    }
  };

  const dashboardPath = getDashboardPath(role);

  if (!role) {
    return (
      <nav className="bg-quran-800 text-white">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4">
          <AcademyBrand />
          <div className="flex items-center gap-2 text-sm sm:gap-4">
            <button
              type="button"
              onClick={() => navigateTo("/")}
              className="rounded-xl px-4 py-2 font-semibold transition-colors hover:bg-white/10"
            >
              الرئيسية
            </button>
            <button
              type="button"
              onClick={() => navigateTo("/login")}
              className="rounded-xl bg-white px-4 py-2 font-semibold text-quran-800 transition-colors hover:bg-slate-100"
            >
              تسجيل الدخول
            </button>
          </div>
        </div>
      </nav>
    );
  }

  if (role === "SuperAdmin") {
    return (
      <nav className="bg-quran-700 text-white">
        <div className="mx-auto w-full max-w-7xl px-4 py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex min-w-0 items-center justify-between gap-4">
              <AcademyBrand />
              <button
                type="button"
                onClick={() => setShowMobileMenu((prev) => !prev)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-white transition lg:hidden"
                aria-label="فتح القائمة"
                aria-expanded={showMobileMenu}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-6 w-6"
                  aria-hidden="true"
                >
                  <path d="M4 7h16M4 12h16M4 17h16" />
                </svg>
              </button>
            </div>

            <div
              className={`w-full overflow-hidden rounded-3xl border border-white/10 bg-quran-800/95 transition-all duration-200 lg:flex lg:w-auto lg:items-center lg:gap-3 lg:overflow-visible lg:border-none lg:bg-transparent ${
                showMobileMenu ? "max-h-40 py-3" : "max-h-0"
              } lg:max-h-full lg:py-0`}
            >
              <div className="flex flex-col gap-2 px-3 text-sm sm:flex-row sm:items-center lg:px-0">
                <button
                  type="button"
                  onClick={() => navigateTo("/admin")}
                  className={`rounded-xl px-4 py-2 font-semibold transition-colors ${
                    isActive("/admin")
                      ? "bg-white/15"
                      : "hover:bg-white/10"
                  }`}
                >
                  لوحة الإدارة
                </button>
                <button
                  type="button"
                  onClick={() => navigateTo("/leaderboard")}
                  className={`rounded-xl px-4 py-2 font-semibold transition-colors ${
                    isActive("/leaderboard")
                      ? "bg-white/15"
                      : "hover:bg-white/10"
                  }`}
                >
                  قائمة المتصدرين
                </button>
                <span className="rounded-full bg-white px-4 py-2 text-center font-semibold text-quran-700">
                  مدير النظام
                </span>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-xl bg-quran-600 px-4 py-2 font-semibold text-white transition hover:bg-quran-800"
                >
                  تسجيل الخروج
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-quran-700 text-white">
      <div className="max-w-7xl mx-auto w-full px-4 py-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex min-w-0 items-center justify-between gap-4">
            <AcademyBrand />
            <button
              type="button"
              onClick={() => setShowMobileMenu((prev) => !prev)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-white transition lg:hidden"
              aria-label="فتح القائمة"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6"
              >
                <path d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            </button>
          </div>

          <div
            className={`w-full overflow-hidden rounded-3xl border border-white/10 bg-quran-800/95 transition-all duration-200 lg:border-none lg:bg-transparent lg:w-auto ${
              showMobileMenu ? "max-h-[1000px] py-4" : "max-h-0"
            } lg:max-h-full`}
          >
            <div className="flex flex-col gap-3 px-4 text-sm lg:flex-row lg:items-center lg:px-0 lg:gap-4">
              {role && (
                <button
                  type="button"
                  onClick={() => navigateTo(dashboardPath)}
                  className={`inline-flex min-w-0 items-center gap-2 rounded-3xl bg-white px-4 py-2 text-sm font-semibold text-quran-700 transition-colors shadow-sm hover:bg-slate-100 ${
                    isActive(dashboardPath) ? "ring-2 ring-quran-300" : ""
                  }`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="h-4 w-4"
                  >
                    <path d="M3 10.5L12 3l9 7.5V21a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V10.5z" />
                  </svg>
                  لوحة التحكم
                </button>
              )}

              {role === "SuperAdmin" && (
                <>
                  <button
                    type="button"
                    onClick={() => navigateTo("/admin")}
                    className={`rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                      isActive("/admin") ? "bg-quran-800" : "hover:bg-quran-800"
                    }`}
                  >
                    لوحة الإدارة
                  </button>
                  <button
                    type="button"
                    onClick={() => navigateTo("/admin/groups-overview")}
                    className={`rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                      isActive("/admin/groups-overview")
                        ? "bg-quran-800"
                        : "hover:bg-quran-800"
                    }`}
                  >
                    إدارة المجموعات
                  </button>
                  <button
                    type="button"
                    onClick={() => navigateTo("/admin/gamification")}
                    className={`rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                      isActive("/admin/gamification")
                        ? "bg-quran-800"
                        : "hover:bg-quran-800"
                    }`}
                  >
                    إدارة النقاط والألعاب
                  </button>
                  <button
                    type="button"
                    onClick={() => navigateTo("/admin/rewards")}
                    className={`rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                      isActive("/admin/rewards")
                        ? "bg-quran-800"
                        : "hover:bg-quran-800"
                    }`}
                  >
                    متجر الجوائز
                  </button>
                  <button
                    type="button"
                    onClick={() => navigateTo("/admin/complaints")}
                    className={`rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                      isActive("/admin/complaints")
                        ? "bg-quran-800"
                        : "hover:bg-quran-800"
                    }`}
                  >
                    الشكاوى والاقتراحات
                  </button>
                  <button
                    type="button"
                    onClick={() => navigateTo("/admin/curriculums")}
                    className={`rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                      isActive("/admin/curriculums")
                        ? "bg-quran-800"
                        : "hover:bg-quran-800"
                    }`}
                  >
                    إدارة المناهج
                  </button>
                </>
              )}

              {role && (
                <>
                  {role === "Teacher" && (
                    <button
                      type="button"
                      onClick={() => navigateTo("/teacher/training")}
                      className={`rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                        isActive("/teacher/training")
                          ? "bg-quran-800"
                          : "hover:bg-quran-800"
                      }`}
                    >
                      الحقيبة التدريبية
                    </button>
                  )}
                  {role === "Student" && (
                    <button
                      type="button"
                      onClick={() => navigateTo("/student/lessons")}
                      className={`rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                        isActive("/student/lessons")
                          ? "bg-quran-800"
                          : "hover:bg-quran-800"
                      }`}
                    >
                      الدروس والفيديوهات 🎬
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => navigateTo("/leaderboard")}
                    className={`rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                      isActive("/leaderboard")
                        ? "bg-quran-800"
                        : "hover:bg-quran-800"
                    }`}
                  >
                    قائمة المتصدرين
                  </button>
                  {role !== "SuperAdmin" && (
                    <button
                      type="button"
                      onClick={() => navigateTo("/rewards")}
                      className={`rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                        isActive("/rewards")
                          ? "bg-quran-800"
                          : "hover:bg-quran-800"
                      }`}
                    >
                      المكافآت
                    </button>
                  )}
                </>
              )}
            </div>

            <div className="flex flex-col gap-3 border-t border-white/10 pt-4 px-4 text-sm lg:border-none lg:pt-0 lg:px-0 lg:flex-row lg:items-center lg:gap-4">
              <span className="min-w-0 truncate">
                {role && getRoleLabel(role)}
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-2xl bg-quran-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-quran-800"
              >
                تسجيل الخروج
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
