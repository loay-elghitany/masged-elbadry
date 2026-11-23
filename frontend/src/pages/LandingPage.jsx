import React from "react";
import { Link } from "react-router-dom";

const features = [
  {
    number: "01",
    title: "متابعة دقيقة للحفظ والمراجعة",
    description: "تقييم يومي شامل للآيات والدرجات والأخطاء، يوضح رحلة الطالب خطوة بخطوة.",
    icon: (
      <>
        <path d="M8 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-3" />
        <path d="M16 3h5v5M10 14 21 3M7 10h4M7 14h1M7 18h6" />
      </>
    ),
  },
  {
    number: "02",
    title: "تواصل مباشر مع ولي الأمر",
    description: "تقارير لحظية وملاحظات صوتية من المعلم لمتابعة مستوى الأبناء والاحتفاء بتقدمهم.",
    icon: (
      <>
        <path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5Z" />
        <path d="M8 12h.01M12 12h.01M16 12h.01" />
      </>
    ),
  },
  {
    number: "03",
    title: "نظام تحفيز وجوائز تفاعلي",
    description: "نقاط وأوسمة ولوحة شرف تشجع الطلاب على التميز والاستمرار بروح إيجابية.",
    icon: (
      <>
        <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3Z" />
      </>
    ),
  },
  {
    number: "04",
    title: "دروس ومناهج مرئية",
    description: "مكتبة دروس تربوية وقصص أنبياء تفاعلية، صُممت لتناسب فضول الطلاب وأعمارهم.",
    icon: (
      <>
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" />
        <path d="M9 7h6M9 11h6" />
      </>
    ),
  },
];

function BrandEmblem({ className = "h-11 w-11" }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-2xl border border-[#d6b66e]/40 bg-white/10 text-[#e7c77f] ${className}`}
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
  );
}

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#faf9f5] text-slate-800">
      <section
        className="relative isolate min-h-[760px] overflow-hidden bg-slate-950 bg-cover bg-center text-white"
        style={{ backgroundImage: "url('/mosque-bg.jpg')" }}
      >
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-slate-950/85 via-emerald-950/75 to-slate-900/80" />
        <div className="absolute inset-0 -z-10 opacity-20 [background-image:radial-gradient(#e7c77f_0.7px,transparent_0.7px)] [background-size:28px_28px]" />

        <header className="mx-auto flex w-full max-w-7xl items-center justify-between gap-5 px-5 py-5 sm:px-8 lg:px-12">
          <Link to="/" className="group inline-flex items-center gap-3 text-white">
            <BrandEmblem />
            <span className="leading-tight">
              <span className="block font-kufi text-lg font-bold sm:text-xl">
                مسجد البدري
              </span>
              <span className="mt-1 block text-xs text-white/65 sm:text-sm">
                لتحفيظ القرآن الكريم
              </span>
            </span>
          </Link>
          <Link
            to="/login"
            className="rounded-full border border-white/25 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur transition hover:border-[#e7c77f]/70 hover:bg-white/15 sm:px-6"
          >
            دخول المنصة
          </Link>
        </header>

        <div className="mx-auto flex min-h-[650px] max-w-7xl items-center px-5 pb-24 pt-16 sm:px-8 sm:pt-20 lg:px-12">
          <div className="max-w-3xl">
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#e7c77f]/35 bg-[#0b3029]/55 px-4 py-2 text-sm font-semibold tracking-wide text-[#f1d99f] backdrop-blur-sm sm:text-base">
              <span aria-hidden="true">✦</span>
              أهلاً بكم في رحاب القرآن الكريم
              <span aria-hidden="true">✦</span>
            </div>
            <h1 className="font-amiri text-4xl font-bold leading-[1.35] text-white drop-shadow sm:text-5xl md:text-6xl lg:text-7xl">
              أكاديمية مسجد البدري
              <span className="mt-1 block text-[#efd18c]">
                لتحفيظ القرآن الكريم
              </span>
            </h1>
            <p className="mt-7 max-w-2xl text-base leading-8 text-slate-100/85 sm:text-lg sm:leading-9">
              بيئة قرآنية تربوية متكاملة تجمع بين أصالة الحفظ والتجويد وأحدث
              وسائل المتابعة الذكية وتحفيز الأبناء.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                to="/login"
                className="inline-flex min-h-14 items-center justify-center gap-2 rounded-xl bg-gradient-to-l from-[#d1aa55] to-[#f0d48e] px-7 py-3.5 font-bold text-emerald-950 shadow-[0_12px_35px_rgba(209,170,85,0.22)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(209,170,85,0.32)]"
              >
                <span>تسجيل الدخول للمنصة</span>
                <span aria-hidden="true">←</span>
              </Link>
              <Link
                to="/leaderboard"
                className="inline-flex min-h-14 items-center justify-center rounded-xl border border-white/30 bg-white/10 px-7 py-3.5 font-semibold text-white backdrop-blur-md transition hover:border-white/55 hover:bg-white/15"
              >
                لوحة الشرف والمتصدرين
              </Link>
            </div>
            <div className="mt-12 flex items-center gap-3 text-sm text-white/70">
              <span className="h-px w-10 bg-[#e7c77f]/70" />
              بالقرآن نرتقي، وبالعلم نبني الأجيال
            </div>
          </div>
        </div>
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-[#faf9f5] to-transparent" />
      </section>

      <section
        id="about"
        className="mx-auto max-w-7xl px-5 pb-20 pt-10 sm:px-8 sm:pb-24 lg:px-12"
      >
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <span className="text-sm font-bold tracking-widest text-emerald-700">
            رِحْلَةٌ تَصْنَعُ الأَثَر
          </span>
          <h2 className="mt-3 font-amiri text-3xl font-bold text-slate-900 sm:text-4xl">
            عناية بالقرآن… ورعاية لكل طالب
          </h2>
          <p className="mt-4 leading-8 text-slate-600">
            منظومة متكاملة تُعين أبناءنا على حفظ كتاب الله، وتمنح الأسرة صورة
            واضحة عن تقدمهم في كل خطوة.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {features.map((feature) => (
            <article
              key={feature.number}
              className="group relative overflow-hidden rounded-2xl border border-[#e8e4d8] bg-white p-6 shadow-[0_8px_30px_rgba(23,37,32,0.04)] transition duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-[0_18px_40px_rgba(23,37,32,0.09)]"
            >
              <div className="flex items-start justify-between">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-800 transition group-hover:bg-emerald-800 group-hover:text-[#f1d99f]">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6"
                    aria-hidden="true"
                  >
                    {feature.icon}
                  </svg>
                </span>
                <span className="font-kufi text-xs font-semibold tracking-widest text-[#c5a45d]">
                  {feature.number}
                </span>
              </div>
              <h3 className="mt-6 font-kufi text-lg font-bold leading-8 text-slate-900">
                {feature.title}
              </h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                {feature.description}
              </p>
              <div className="absolute bottom-0 right-0 h-1 w-0 bg-gradient-to-l from-emerald-700 to-[#d1aa55] transition-all duration-300 group-hover:w-full" />
            </article>
          ))}
        </div>
      </section>

      <footer className="bg-[#102d27] text-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-5 py-10 sm:px-8 md:flex-row md:items-center md:justify-between lg:px-12">
          <Link to="/" className="inline-flex items-center gap-3">
            <BrandEmblem className="h-10 w-10 rounded-xl" />
            <span>
              <span className="block font-kufi font-bold">
                مسجد البدري لتحفيظ القرآن الكريم
              </span>
              <span className="mt-1 block text-xs text-white/55">
                بالقرآن نرتقي، وبالعلم نبني الأجيال
              </span>
            </span>
          </Link>
          <nav
            aria-label="روابط سريعة"
            className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-white/70"
          >
            <Link to="/" className="transition hover:text-[#efd18c]">
              الرئيسية
            </Link>
            <a href="#about" className="transition hover:text-[#efd18c]">
              عن الأكاديمية
            </a>
            <Link to="/login" className="transition hover:text-[#efd18c]">
              تسجيل الدخول
            </Link>
            <Link
              to="/leaderboard"
              className="transition hover:text-[#efd18c]"
            >
              لوحة الشرف
            </Link>
          </nav>
          <p className="text-xs text-white/45">
            © {new Date().getFullYear()} مسجد البدري. جميع الحقوق محفوظة.
          </p>
        </div>
      </footer>
    </main>
  );
}
