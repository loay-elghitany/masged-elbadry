import React, { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

const initialChild = () => ({ childName: "", ageOrGrade: "" });

export default function SardRegistrationPage() {
  const [parentName, setParentName] = useState("");
  const [parentPhone, setParentPhone] = useState("");
  const [parentPassword, setParentPassword] = useState("");
  const [children, setChildren] = useState([initialChild()]);
  const [registration, setRegistration] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copyStatus, setCopyStatus] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { data } = await api.post("/sard/register", {
        parentName,
        parentPhone,
        parentPassword,
        children,
      });
      setError("");
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

  const copyText = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyStatus("تم نسخ البيانات.");
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
          <p className="mt-3 leading-7 text-white/80">سجل بيانات ولي الأمر والأبناء للمشاركة في التحدي.</p>
        </header>

        {registration ? (
          <section className="rounded-3xl border-2 border-emerald-300 bg-white p-6 shadow-xl sm:p-9" aria-live="polite">
            <div className="text-center">
              <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-3xl text-emerald-800">✓</span>
              <h2 className="mt-4 text-2xl font-extrabold text-emerald-900">تم التسجيل بنجاح</h2>
              <p className="mt-2 text-slate-600">احتفظ بكود كل متسابق وبيانات الدخول.</p>
            </div>
            <div className="mt-7 grid gap-4 sm:grid-cols-2">
              {registration.children.map((child) => (
                <article key={child.sardCode} className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                  <p className="text-sm font-bold text-emerald-800">كود المتسابق</p>
                  <p className="mt-1 text-3xl font-black tracking-wider text-emerald-900">{child.sardCode}</p>
                  <p className="mt-3 font-bold">{child.childName}</p>
                  <p className="mt-3 break-all text-sm text-slate-600">البريد: <bdi className="font-semibold text-slate-900">{child.email}</bdi></p>
                  <p className="mt-2 break-all text-sm text-slate-600">كلمة المرور: <bdi className="font-semibold text-slate-900">{child.password}</bdi></p>
                  <button
                    type="button"
                    onClick={() => copyText(`الاسم: ${child.childName}\nكود المسابقة: ${child.sardCode}\nالبريد: ${child.email}\nكلمة المرور: ${child.password}`)}
                    className="mt-4 rounded-xl border border-emerald-700 px-4 py-2 text-sm font-bold text-emerald-800 hover:bg-emerald-100"
                  >
                    نسخ بيانات الابن
                  </button>
                </article>
              ))}
              <article className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <h3 className="font-bold">بيانات دخول ولي الأمر</h3>
                {registration.parent.reused && (
                  <p className="mt-3 rounded-xl bg-amber-50 p-3 text-sm font-semibold text-amber-900">
                    تم ربط الأبناء بحساب ولي الأمر الحالي. استخدم كلمة المرور الحالية للحساب.
                  </p>
                )}
                <p className="mt-3 break-all text-sm text-slate-600">البريد: <bdi className="font-semibold text-slate-900">{registration.parent.email}</bdi></p>
                {registration.parent.password ? (
                  <>
                    <p className="mt-2 break-all text-sm text-slate-600">كلمة المرور: <bdi className="font-semibold text-slate-900">{registration.parent.password}</bdi></p>
                    <button
                      type="button"
                      onClick={() => copyText(`البريد: ${registration.parent.email}\nكلمة المرور: ${registration.parent.password}`)}
                      className="mt-4 rounded-xl border border-emerald-700 px-4 py-2 text-sm font-bold text-emerald-800 hover:bg-emerald-100"
                    >
                      نسخ بيانات ولي الأمر
                    </button>
                  </>
                ) : (
                  <p className="mt-2 text-sm text-slate-600">استخدم كلمة المرور الحالية لولي الأمر.</p>
                )}
              </article>
            </div>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <button type="button" onClick={() => window.print()} className="rounded-xl border border-slate-300 bg-white px-5 py-3 font-bold hover:bg-slate-100">طباعة / حفظ</button>
              <Link to="/login" className="rounded-xl bg-amber-400 px-5 py-3 font-bold text-emerald-950 hover:bg-amber-300">الانتقال إلى تسجيل الدخول</Link>
            </div>
            {copyStatus && <p className="mt-4 text-center text-sm text-emerald-800" role="status">{copyStatus}</p>}
          </section>
        ) : (
          <form onSubmit={handleSubmit} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-9">
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="space-y-2 text-sm font-semibold text-slate-700">
                اسم ولي الأمر بالكامل
                <input required value={parentName} onChange={(event) => setParentName(event.target.value)} className="w-full rounded-xl border border-slate-300 px-4 py-3 text-base font-normal" />
              </label>
              <label className="space-y-2 text-sm font-semibold text-slate-700">
                رقم هاتف ولي الأمر
                <input required minLength={8} type="tel" value={parentPhone} onChange={(event) => setParentPhone(event.target.value)} className="w-full rounded-xl border border-slate-300 px-4 py-3 text-base font-normal" />
              </label>
              <label className="space-y-2 text-sm font-semibold text-slate-700 sm:col-span-2">
                كلمة مرور ولي الأمر والأبناء (اختياري)
                <input minLength={8} type="password" autoComplete="new-password" value={parentPassword} onChange={(event) => setParentPassword(event.target.value)} placeholder="اتركها فارغة لاستخدام رقم الهاتف" className="w-full rounded-xl border border-slate-300 px-4 py-3 text-base font-normal" />
              </label>
            </div>
            <div className="mt-7 space-y-4">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-extrabold text-slate-900">بيانات الأبناء المشاركين</h2>
                <button type="button" onClick={() => setChildren((current) => [...current, initialChild()])} className="rounded-xl border border-emerald-700 px-4 py-2 text-sm font-bold text-emerald-800 hover:bg-emerald-50">
                  + إضافة ابن آخر
                </button>
              </div>
              {children.map((child, index) => (
                <fieldset key={index} className="grid gap-4 rounded-2xl border border-slate-200 p-4 sm:grid-cols-2">
                  <legend className="px-2 text-sm font-bold text-slate-600">الابن {index + 1}</legend>
                  <label className="space-y-2 text-sm font-semibold text-slate-700">
                    اسم الابن بالكامل
                    <input required minLength={2} value={child.childName} onChange={(event) => setChildren((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, childName: event.target.value } : item))} className="w-full rounded-xl border border-slate-300 px-4 py-3 text-base font-normal" />
                  </label>
                  <label className="space-y-2 text-sm font-semibold text-slate-700">
                    العمر / المرحلة الدراسية
                    <input required value={child.ageOrGrade} onChange={(event) => setChildren((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, ageOrGrade: event.target.value } : item))} className="w-full rounded-xl border border-slate-300 px-4 py-3 text-base font-normal" />
                  </label>
                  {children.length > 1 && (
                    <button type="button" onClick={() => setChildren((current) => current.filter((_, itemIndex) => itemIndex !== index))} className="justify-self-start text-sm font-semibold text-rose-700 hover:underline sm:col-span-2">
                      حذف هذا الابن
                    </button>
                  )}
                </fieldset>
              ))}
            </div>
            {error && <p className="mt-5 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-800" role="alert" aria-live="assertive">{error}</p>}
            <button type="submit" disabled={loading} className="mt-7 w-full rounded-xl bg-emerald-700 px-6 py-4 text-lg font-extrabold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60">
              {loading ? "جارٍ التسجيل..." : "تأكيد التسجيل في التحدي"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
