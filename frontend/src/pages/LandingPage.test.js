import React from "react";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import LandingPage from "../pages/LandingPage";

describe("LandingPage", () => {
  it("introduces Masjid Al-Badri with the Quran academy hero", () => {
    render(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>,
    );

    expect(
      screen.getByRole("heading", {
        name: "أكاديمية مسجد البدري لتحفيظ القرآن الكريم",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("أهلاً بكم في رحاب القرآن الكريم"),
    ).toBeInTheDocument();
  });

  it("provides login and leaderboard calls to action", () => {
    render(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>,
    );

    expect(
      screen.getByRole("link", { name: /تسجيل الدخول للمنصة/ }),
    ).toHaveAttribute("href", "/login");
    expect(
      screen.getByRole("link", { name: "لوحة الشرف والمتصدرين" }),
    ).toHaveAttribute("href", "/leaderboard");
  });

  it("shows all four academy pillars and the mosque background", () => {
    const { container } = render(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>,
    );

    expect(
      screen.getByRole("heading", { name: "متابعة دقيقة للحفظ والمراجعة" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "تواصل مباشر مع ولي الأمر" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "نظام تحفيز وجوائز تفاعلي" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "دروس ومناهج مرئية" }),
    ).toBeInTheDocument();
    expect(container.querySelector("main")).toHaveClass("min-h-screen");
    expect(container.querySelector("section").style.backgroundImage).toContain(
      "/mosque-bg.jpg",
    );
  });
});
