import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import Navbar from "../components/Navbar";

const medals = ["🥇", "🥈", "🥉"];

const formatNumber = (value) => new Intl.NumberFormat("ar-EG").format(value);

export default function Leaderboard() {
  const [user, setUser] = useState(null);
  const [isGuest, setIsGuest] = useState(true);
  const [students, setStudents] = useState([]);
  const [encouragementList, setEncouragementList] = useState([]);
  const [groupsLeaderboard, setGroupsLeaderboard] = useState([]);
  const [activeLeaderboardTab, setActiveLeaderboardTab] =
    useState("individual");
  const [activeIndividualTab, setActiveIndividualTab] = useState("completed");
  const [searchQuery, setSearchQuery] = useState("");
  const [visiblePage, setVisiblePage] = useState(1);
  const [expandedGroups, setExpandedGroups] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let storedUser = null;
    const token =
      localStorage.getItem("token") || localStorage.getItem("jwtToken");
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        storedUser = JSON.parse(userData);
      } catch (error) {
        console.error("Failed to parse stored user data:", error);
      }
    }
    const hasSession = Boolean(token && storedUser?.role);
    setUser(hasSession ? storedUser : null);
    setIsGuest(!hasSession);

    const loadLeaderboard = async () => {
      try {
        const studentsResponse = await api.get("/leaderboard");
        setStudents(studentsResponse.data.leaderboard || []);
        setEncouragementList(studentsResponse.data.encouragementList || []);
        if (hasSession) {
          const groupsResponse = await api.get("/leaderboard/groups");
          setGroupsLeaderboard(groupsResponse.data.groupsLeaderboard || []);
        }
      } catch (err) {
        console.error("فشل تحميل لوحة المتصدرين:", err);
        setError("حدث خطأ أثناء تحميل بيانات المتصدرين. حاول لاحقًا.");
      } finally {
        setLoading(false);
      }
    };

    loadLeaderboard();
  }, []);

  const toggleGroupExpand = (groupId) => {
    setExpandedGroups((prev) => ({ ...prev, [groupId]: !prev[groupId] }));
  };
  const activeParticipants =
    activeIndividualTab === "completed" ? students : encouragementList;
  const filteredParticipants = activeParticipants.filter((participant) =>
    `${participant.studentName} ${participant.sardCode}`
      .toLocaleLowerCase()
      .includes(searchQuery.trim().toLocaleLowerCase()),
  );
  const visibleParticipants = filteredParticipants.slice(0, visiblePage * 15);

  if (loading) {
    return (
      <div
        className="min-h-screen w-full min-w-0 bg-slate-50 text-slate-900 font-cairo"
        dir="rtl"
      >
        <Navbar role={user?.role} />
        <div className="flex min-h-[70vh] items-center justify-center px-4">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-quran-600 border-t-transparent" />
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen w-full min-w-0 bg-slate-50 text-slate-900 font-cairo"
      dir="rtl"
    >
      <Navbar role={user?.role} />
      <div className="max-w-7xl mx-auto w-full min-w-0 px-4 py-10 space-y-8">
        <header className="rounded-[2rem] bg-gradient-to-br from-quran-600 via-quran-700 to-quran-800 p-8 text-white shadow-sm">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-quran-100">
                لوحة الصدارة
              </p>
              <h1 className="mt-2 text-4xl font-semibold">قائمة المتصدرين</h1>
              <p className="mt-3 max-w-2xl text-sm text-quran-100">
                ترتيب متسابقي تحدي سرد جزء عمّ وفقاً لآخر نتيجة تقييم مسجلة.
              </p>
            </div>
            {isGuest ? (
              <div className="flex flex-wrap gap-3">
                <Link
                  to="/"
                  className="rounded-xl border border-white/30 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/20"
                >
                  العودة إلى الرئيسية
                </Link>
                <Link
                  to="/login"
                  className="rounded-xl bg-white px-5 py-3 text-sm font-bold text-quran-800 transition hover:bg-quran-50"
                >
                  تسجيل الدخول
                </Link>
              </div>
            ) : (
              <div className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm backdrop-blur">
                <p className="font-semibold">أبرز العقول والفرق</p>
                <p className="mt-1 text-quran-100">
                  منافسة ممتعة… ونتائج ملهمة
                </p>
              </div>
            )}
          </div>
        </header>

        <div className="flex justify-center gap-3">
          <button
            type="button"
            onClick={() => setActiveLeaderboardTab("individual")}
            className={`rounded-2xl px-6 py-3 text-sm font-semibold transition ${
              activeLeaderboardTab === "individual"
                ? "bg-quran-600 text-white shadow-lg shadow-quran-200"
                : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            🏆 المتصدرون الأبطال (فردي)
          </button>
          {!isGuest && (
            <button
              type="button"
              onClick={() => setActiveLeaderboardTab("groups")}
              className={`rounded-2xl px-6 py-3 text-sm font-semibold transition ${
                activeLeaderboardTab === "groups"
                  ? "bg-quran-600 text-white shadow-lg shadow-quran-200"
                  : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              👥 صدارة المجموعات والحلقات
            </button>
          )}
        </div>

        {error ? (
          <div className="rounded-3xl bg-white p-8 shadow-sm border border-rose-200 text-rose-700">
            <p className="text-lg font-semibold">تعذر تحميل قائمة المتصدرين</p>
            <p className="mt-3 text-sm">{error}</p>
          </div>
        ) : (
          <>
            {activeLeaderboardTab === "individual" && (
              <div className="mx-auto max-w-5xl space-y-6">
                {students.length > 0 && (
                  <section aria-label="منصة أبطال السرد الكامل" className="rounded-[2rem] border border-amber-200 bg-gradient-to-br from-amber-50 via-white to-emerald-50 p-6 shadow-sm sm:p-8">
                    <div className="mb-5 text-center">
                      <p className="text-sm font-bold text-amber-800">منصة أبطال السرد الكامل</p>
                      <h2 className="mt-1 text-2xl font-black text-slate-900">أعلى ثلاثة متسابقين</h2>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-3">
                      {students.slice(0, 3).map((student, index) => (
                        <article key={student.rank} className={`rounded-2xl border p-4 text-center ${index === 0 ? "border-amber-300 bg-amber-100/80 sm:-translate-y-1" : "border-slate-200 bg-white/80"}`}>
                          <span className="text-3xl" aria-hidden="true">{medals[index]}</span>
                          <p className="mt-2 font-extrabold text-slate-900">{student.studentName}</p>
                          <p className="mt-1 text-sm text-slate-600">{student.sardCode}</p>
                          <p className="mt-3 text-lg font-black text-emerald-800">{formatNumber(student.score)}</p>
                        </article>
                      ))}
                    </div>
                  </section>
                )}

                <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
                  <div className="mb-6 text-center">
                    <h2 className="text-2xl font-black text-slate-900">متسابقو تحدي سرد جزء عمّ</h2>
                    <p className="mt-2 text-sm text-slate-500">الإنجاز يُحتفى به، والمحاولة محل تقدير.</p>
                  </div>

                  <div role="tablist" aria-label="قوائم المتسابقين" className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-1.5">
                    {[
                      ["completed", "أبطال السرد الكامل", students.length],
                      ["incomplete", "لوحة التشجيع والمثابرة", encouragementList.length],
                    ].map(([tab, label, count]) => (
                      <button
                        key={tab}
                        type="button"
                        role="tab"
                        aria-selected={activeIndividualTab === tab}
                        onClick={() => {
                          setActiveIndividualTab(tab);
                          setVisiblePage(1);
                        }}
                        className={`rounded-xl px-3 py-3 text-sm font-extrabold transition sm:px-5 ${
                          activeIndividualTab === tab
                            ? "bg-white text-quran-800 shadow-sm"
                            : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        {label} <span className="mr-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs">{formatNumber(count)}</span>
                      </button>
                    ))}
                  </div>

                  <label className="mt-5 block">
                    <span className="sr-only">البحث باسم الطالب أو كود المسابقة</span>
                    <input
                      type="search"
                      aria-label="البحث باسم الطالب أو كود المسابقة"
                      value={searchQuery}
                      onChange={(event) => {
                        setSearchQuery(event.target.value);
                        setVisiblePage(1);
                      }}
                      placeholder="ابحث باسم الطالب أو كود المسابقة"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-quran-500 focus:bg-white focus:ring-2 focus:ring-quran-100"
                    />
                  </label>

                  <div className="mt-5 space-y-3">
                    {visibleParticipants.length === 0 ? (
                      <div className="rounded-2xl bg-slate-50 p-8 text-center text-sm text-slate-600">
                        {searchQuery ? "لا توجد نتائج تطابق البحث." : "لا توجد بيانات في هذه القائمة حتى الآن."}
                      </div>
                    ) : visibleParticipants.map((participant) => (
                      activeIndividualTab === "completed" ? (
                        <article key={participant.rank} className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex items-center gap-3">
                            <span className="flex h-11 min-w-11 items-center justify-center rounded-full bg-quran-100 px-2 font-black text-quran-800">
                              {formatNumber(participant.rank)}
                            </span>
                            <div>
                              <p className="font-extrabold text-slate-900">{participant.studentName}</p>
                              <p className="mt-1 text-sm text-slate-500">{participant.sardCode}</p>
                            </div>
                          </div>
                          <p className="rounded-xl bg-emerald-50 px-4 py-2 text-sm font-black text-emerald-800">
                            {formatNumber(participant.score)} درجة
                          </p>
                        </article>
                      ) : (
                        <article key={participant.sardCode} className="flex flex-col gap-3 rounded-2xl border border-amber-100 bg-gradient-to-l from-amber-50/80 to-white p-4 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="font-extrabold text-slate-900">{participant.studentName}</p>
                            <p className="mt-1 text-sm text-slate-500">{participant.sardCode}</p>
                            {participant.stoppedAtSurah && (
                              <p className="mt-2 text-sm text-slate-600">توقف عند سورة {participant.stoppedAtSurah}</p>
                            )}
                          </div>
                          <span className="w-fit rounded-full border border-amber-200 bg-amber-100 px-4 py-2 text-sm font-extrabold text-amber-900">
                            {participant.encouragementGrade}
                          </span>
                        </article>
                      )
                    ))}
                  </div>

                  {visibleParticipants.length < filteredParticipants.length && (
                    <button
                      type="button"
                      onClick={() => setVisiblePage((page) => page + 1)}
                      className="mt-5 w-full rounded-2xl border border-quran-200 bg-quran-50 px-5 py-3 text-sm font-extrabold text-quran-800 transition hover:bg-quran-100"
                    >
                      عرض المزيد ({formatNumber(filteredParticipants.length - visibleParticipants.length)})
                    </button>
                  )}
                </section>
              </div>
            )}

            {activeLeaderboardTab === "groups" && (
              <div className="space-y-8">
                {groupsLeaderboard.map((group, groupIdx) => {
                  const top3 = group.students.slice(0, 3);
                  const remainingStudents = group.students.slice(3);
                  const isExpanded = !!expandedGroups[group.groupId];

                  return (
                    <div
                      key={group.groupId}
                      className="rounded-[2.5rem] bg-white border border-slate-200 p-6 md:p-8 shadow-sm relative overflow-hidden"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6 mb-6">
                        <div>
                          <div className="flex items-center gap-3">
                            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-quran-100 font-bold text-quran-800 text-sm">
                              #{groupIdx + 1}
                            </span>
                            <h3 className="text-2xl font-bold text-slate-900">
                              {group.groupName}
                            </h3>
                          </div>
                          <p className="mt-1 text-sm text-slate-500">
                            المعلم:{" "}
                            <span className="font-semibold text-slate-700">
                              {group.teacherName}
                            </span>
                          </p>
                        </div>
                        <div className="rounded-2xl bg-emerald-50 border border-emerald-200 px-5 py-3 text-left">
                          <span className="block text-xs text-emerald-700 font-medium">
                            مجموع نقاط الحلقة
                          </span>
                          <span className="text-xl font-extrabold text-emerald-900">
                            {group.totalGroupPoints} 🪙
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-3 md:gap-6 items-end my-6 text-center">
                        {top3[1] ? (
                          <div className="bg-slate-50 rounded-3xl p-4 border border-slate-200">
                            <span className="text-2xl">🥈</span>
                            <p className="font-bold text-slate-800 text-sm md:text-base mt-1">
                              {top3[1].firstName} {top3[1].lastName}
                            </p>
                            <span className="inline-block mt-2 rounded-full bg-slate-200 px-3 py-1 text-xs font-bold text-slate-700">
                              {top3[1].points} نقطة
                            </span>
                          </div>
                        ) : (
                          <div />
                        )}

                        {top3[0] ? (
                          <div className="bg-gradient-to-b from-amber-50 to-amber-100/50 rounded-3xl p-5 border-2 border-amber-300 transform -translate-y-2 shadow-md">
                            <span className="text-4xl block mb-1">👑 🥇</span>
                            <p className="font-extrabold text-amber-950 text-base md:text-lg">
                              {top3[0].firstName} {top3[0].lastName}
                            </p>
                            <span className="inline-block mt-2 rounded-full bg-amber-400 text-amber-950 px-4 py-1 text-xs font-bold shadow-sm">
                              {top3[0].points} نقطة
                            </span>
                          </div>
                        ) : (
                          <div />
                        )}

                        {top3[2] ? (
                          <div className="bg-slate-50 rounded-3xl p-4 border border-slate-200">
                            <span className="text-2xl">🥉</span>
                            <p className="font-bold text-slate-800 text-sm md:text-base mt-1">
                              {top3[2].firstName} {top3[2].lastName}
                            </p>
                            <span className="inline-block mt-2 rounded-full bg-slate-200 px-3 py-1 text-xs font-bold text-slate-700">
                              {top3[2].points} نقطة
                            </span>
                          </div>
                        ) : (
                          <div />
                        )}
                      </div>

                      {remainingStudents.length > 0 && (
                        <div className="mt-6 border-t border-slate-100 pt-4">
                          <button
                            type="button"
                            onClick={() => toggleGroupExpand(group.groupId)}
                            className="w-full text-center text-sm font-semibold text-quran-700 hover:text-quran-800 py-2 transition flex items-center justify-center gap-2"
                          >
                            <span>
                              {isExpanded
                                ? "إخفاء باقي الطلاب"
                                : `عرض باقي أبطال الحلقة (${remainingStudents.length})`}
                            </span>
                            <span>{isExpanded ? "▲" : "▼"}</span>
                          </button>

                          {isExpanded && (
                            <div className="mt-4 space-y-2">
                              {remainingStudents.map((student, idx) => (
                                <div
                                  key={student.studentId}
                                  className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 text-sm"
                                >
                                  <div className="flex items-center gap-3">
                                    <span className="font-semibold text-slate-400 w-6">
                                      #{idx + 4}
                                    </span>
                                    <span className="font-semibold text-slate-800">
                                      {student.firstName} {student.lastName}
                                    </span>
                                  </div>
                                  <span className="font-bold text-quran-800">
                                    {student.points} نقطة
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
