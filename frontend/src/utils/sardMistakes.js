const mistakeCategories = {
  hesitation: {
    label: "تردد ذاتي",
    className: "bg-amber-100 text-amber-950",
  },
  alert: {
    label: "تنبيه المعلم",
    className: "bg-orange-100 text-orange-950",
  },
  correction: {
    label: "فتح المعلم",
    className: "bg-rose-100 text-rose-950",
  },
};

export const getSardMistakePresentation = (mistake) => {
  const category = mistakeCategories[mistake.type] || mistakeCategories.alert;
  const location =
    mistake.ayahNumber === null || Number(mistake.ayahNumber) === 0
      ? `سورة ${mistake.surahName} كاملة`
      : `سورة ${mistake.surahName} - آية ${mistake.ayahNumber}`;

  return {
    className: category.className,
    text: `${category.label}: ${location}`,
  };
};
