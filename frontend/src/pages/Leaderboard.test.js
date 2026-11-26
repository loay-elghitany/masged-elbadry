import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Leaderboard from "./Leaderboard";
import api from "../api/axios";

jest.mock("../api/axios", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
  },
}));

beforeEach(() => {
  localStorage.clear();
  api.get.mockResolvedValue({
    data: {
      leaderboard: [
        {
          rank: 1,
          studentName: "Amina Ali",
          sardCode: "BDR-101",
          score: 97,
        },
      ],
      encouragementList: [
        {
          studentName: "Omar Hassan",
          sardCode: "BDR-102",
          encouragementGrade: "ممتاز",
          stoppedAtSurah: "النبأ",
        },
      ],
    },
  });
});

afterEach(() => {
  jest.clearAllMocks();
});

test("shows the public leaderboard and guest navigation without requesting private groups", async () => {
  render(
    <MemoryRouter initialEntries={["/leaderboard"]}>
      <Leaderboard />
    </MemoryRouter>,
  );

  expect(
    await screen.findByRole("heading", { name: "قائمة المتصدرين" }),
  ).toBeInTheDocument();
  expect(screen.getAllByText("Amina Ali")).toHaveLength(2);
  expect(
    screen.getByRole("button", { name: "الرئيسية" }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("button", { name: "تسجيل الدخول" }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("link", { name: "العودة إلى الرئيسية" }),
  ).toHaveAttribute("href", "/");
  expect(
    screen.getByRole("link", { name: "تسجيل الدخول" }),
  ).toHaveAttribute("href", "/login");
  expect(screen.getByText("أعلى ثلاثة متسابقين")).toBeInTheDocument();
  fireEvent.click(screen.getByRole("tab", { name: /لوحة التشجيع والمثابرة/ }));
  expect(screen.getByText("Omar Hassan")).toBeInTheDocument();
  expect(screen.getByText("ممتاز")).toBeInTheDocument();
  expect(screen.getByText("توقف عند سورة النبأ")).toBeInTheDocument();
  expect(screen.queryByText("97 درجة")).not.toBeInTheDocument();
  await waitFor(() => {
    expect(api.get).toHaveBeenCalledTimes(1);
    expect(api.get).toHaveBeenCalledWith("/leaderboard");
  });
});

test("filters leaderboard entries and loads more than fifteen at a time", async () => {
  api.get.mockResolvedValue({
    data: {
      leaderboard: Array.from({ length: 16 }, (_, index) => ({
        rank: index + 1,
        studentName: `Student ${index + 1}`,
        sardCode: `BDR-${index + 1}`,
        score: 100 - index,
      })),
      encouragementList: [],
    },
  });

  render(
    <MemoryRouter initialEntries={["/leaderboard"]}>
      <Leaderboard />
    </MemoryRouter>,
  );

  expect(await screen.findByText("Student 15")).toBeInTheDocument();
  expect(screen.queryByText("Student 16")).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: /عرض المزيد/ }));
  expect(screen.getByText("Student 16")).toBeInTheDocument();

  fireEvent.change(screen.getByRole("searchbox", { name: "البحث باسم الطالب أو كود المسابقة" }), {
    target: { value: "BDR-16" },
  });
  expect(screen.getByText("Student 16")).toBeInTheDocument();
  expect(screen.queryByText("Student 15")).not.toBeInTheDocument();
});
