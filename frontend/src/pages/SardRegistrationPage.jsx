import React, { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

const initialForm = {
  studentName: "",
  ageOrGrade: "",
  talent: "",
  studentEmail: "",
  studentPassword: "",
  parentName: "",
  parentPhone: "",
  parentEmail: "",
  parentPassword: "",
};

const fields = [
  { name: "studentName", label: "اسم الطالب بالكامل", required: true },
  { name: "ageOrGrade", label: "العمر / الصف الدراسي", required: true },
  { name: "talent", label: "الموهبة أو المهارة (اختياري)" },
  { name: "studentEmail", label: "البريد الإلكتروني للطالب", type: "email", required: true },
  { name: "studentPassword", label: "كلمة مرور الطالب", type: "password", required: true },
  { name: "parentName", label: "اسم ولي الأمر بالكامل", required: true },
  { name: "parentPhone", label: "رقم هاتف ولي الأمر", type: "tel", required: true },
  { name: "parentEmail", label: "البريد الإلكتروني لولي الأمر", type: "email", required: true },
  { name: "parentPassword", label: "كلمة مرور ولي الأمر", type: "password", required: true },
];

export default function SardRegistrationPage() {
  const [form, setForm] = useState(initialForm);
  const [registration, setRegistration] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copyStatus, setCopyStatus] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { data } = await api.post("/public/sard-register", form);
      setRegistration(data);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          requestError.message ||
          "تعذر إتمام التسجيل. حاول مرة أخرى.",
      );
    } finally {
      setLoading(false);
    }
  };

  const copyCredentials = async () => {
    const text = [
      `كود المسابقة: ${registration.competitionCode}`,
      `حساب الطالب: ${registration.student.email}`,
      `كلمة مرور الطالب: ${registration.student.password}`,
      `حساب ولي الأمر: ${registration.parent.email}`,
      `كلمة مرور ولي الأمر: ${registration.parent.password}`,
    ].join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopyStatus("تم نسخ بيانات الدخول.");
    } catch (copyError) {
      console.error("Could not copy competition credentials:", copyError);
      setCopyStatus("تعذر النسخ تلقائياً. يمكنك تحديد البيانات ونسخها.");
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 text-slate-900" dir="rtl">
      <div className="mx-auto max-w-3xl">
        <Link to="/" className="text-sm font-semibold text-emerald-800 hover:underline">
          العودة إلى الرئيسية
        </Link>
        <header className="my-6 rounded-3xl bg-gradient-to-l from-emerald-950 to-emerald-800 p-7 text-white shadow-lg sm:p-10">
          <p className="text-sm font-semibold text-amber-200">مسجد البدري لتحفيظ القرآن الكريم</p>
          <h1 className="mt-3 text-3xl font-extrabold sm:text-4xl">تحدي سرد جزء عمّ</h1>
          <p className="mt-3 leading-7 text-white/80">سجل بيانات الطالب وولي الأمر للمشاركة في التحدي.</p>
        </header>

        {registration ? (
          <section className="rounded-3xl border-2 border-emerald-300 bg-white p-6 shadow-xl sm:p-9" aria-live="polite">
            <div className="text-center">
              <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-3xl text-emerald-800">✓</span>
              <h2 className="mt-4 text-2xl font-extrabold text-emerald-900">تم التسجيل بنجاح</h2>
              <p className="mt-2 text-slate-600">احتفظ بكود المسابقة وبيانات الدخول التالية.</p>
              <p className="mt-6 text-sm font-bold text-slate-500">كود المتسابق</p>
              <p className="mt-1 text-5xl font-black tracking-wider text-emerald-800">{registration.competitionCode}</p>
            </div>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {[["بيانات دخول الطالب", registration.student], ["بيانات دخول ولي الأمر", registration.parent]].map(([title, account]) => (
                <article key={title} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <h3 className="font-bold">{title}</h3>
                  <p className="mt-3 break-all text-sm text-slate-600">البريد: <bdi className="font-semibold text-slate-900">{account.email}</bdi></p>
                  <p className="mt-2 break-all text-sm text-slate-600">كلمة المرور: <bdi className="font-semibold text-slate-900">{account.password}</bdi></p>
                </article>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <button type="button" onClick={copyCredentials} className="rounded-xl bg-emerald-700 px-5 py-3 font-bold text-white hover:bg-emerald-800">نسخ البيانات</button>
              <button type="button" onClick={() => window.print()} className="rounded-xl border border-slate-300 bg-white px-5 py-3 font-bold hover:bg-slate-100">طباعة / حفظ</button>
              <Link to="/login" className="rounded-xl bg-amber-400 px-5 py-3 font-bold text-emerald-950 hover:bg-amber-300">الانتقال إلى تسجيل الدخول</Link>
            </div>
            {copyStatus && <p className="mt-4 text-center text-sm text-emerald-800" role="status">{copyStatus}</p>}
          </section>
        ) : (
          <form onSubmit={handleSubmit} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-9">
            <div className="grid gap-5 sm:grid-cols-2">
              {fields.map((field) => (
                <label key={field.name} className="space-y-2 text-sm font-semibold text-slate-700">
                  {field.label}
                  <input
                    required={field.required}
                    type={field.type || "text"}
                    minLength={field.type === "password" ? 8 : undefined}
                    autoComplete={field.name.toLowerCase().includes("password") ? "new-password" : "off"}
                    value={form[field.name]}
                    onChange={(event) => setForm((current) => ({ ...current, [field.name]: event.target.value }))}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-base font-normal outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                  />
                </label>
              ))}
            </div>
            {error && <p className="mt-5 rounded-xl bg-rose-50 p-4 text-sm font-semibold text-rose-800" role="alert">{error}</p>}
            <button type="submit" disabled={loading} className="mt-7 w-full rounded-xl bg-emerald-700 px-6 py-4 text-lg font-extrabold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60">
              {loading ? "جارٍ تسجيل المتسابق..." : "تأكيد التسجيل في التحدي"}
            </button>
            <p className="mt-4 text-center text-sm text-slate-500">يجب أن تكون كلمتا المرور 8 أحرف على الأقل.</p>
          </form>
        )}
      </div>
    </main>
  );
}
