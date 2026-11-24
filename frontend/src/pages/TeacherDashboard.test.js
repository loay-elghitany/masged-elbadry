import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import TeacherDashboard from "./TeacherDashboard";
import api from "../api/axios";

jest.mock("../api/axios", () => ({
  get: jest.fn(),
  post: jest.fn(),
}));

beforeEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
  localStorage.setItem(
    "user",
    JSON.stringify({ firstName: "Mona", lastName: "Teacher", role: "Teacher" }),
  );
});

test("teacher submits a daily evaluation and sees success feedback", async () => {
  api.get.mockImplementation((url) => {
    if (url === "/teacher/dashboard") {
      return Promise.resolve({
        data: {
          groups: [
            {
              _id: "group1",
              name: "حلقة الفجر",
              studentIds: [
                {
                  _id: "student1",
                  firstName: "Ali",
                  lastName: "Ahmed",
                  evaluationStreak: { count: 2 },
                },
              ],
            },
          ],
        },
      });
    }

    if (url === "/teacher/badges") {
      return Promise.resolve({ data: { badges: [] } });
    }

    if (url.startsWith("/groups/") && url.endsWith("/current-lesson")) {
      return Promise.resolve({
        data: {
          curriculum: null,
          lesson: null,
          message: "لا يوجد درس اليوم",
        },
      });
    }

    return Promise.resolve({ data: {} });
  });

  api.post.mockResolvedValue({ data: {} });

  render(
    <MemoryRouter>
      <TeacherDashboard />
    </MemoryRouter>,
  );

  expect(await screen.findByText("لوحة تحكم المعلم")).toBeInTheDocument();
  expect(screen.getByText("Ali Ahmed")).toBeInTheDocument();

  fireEvent.click(screen.getByRole("button", { name: /إضافة تقييم اليوم/i }));

  expect(screen.getByText(/إضافة تقييم يومي/i)).toBeInTheDocument();

  fireEvent.change(screen.getByPlaceholderText(/مثال: الفاتحة/i), {
    target: { value: "البقرة" },
  });

  fireEvent.click(screen.getByRole("button", { name: /حفظ التقييم/i }));

  await waitFor(() => {
    expect(api.post).toHaveBeenCalledWith(
      "/teacher/evaluations",
      expect.any(FormData),
      expect.objectContaining({
        headers: expect.objectContaining({
          "Content-Type": "multipart/form-data",
        }),
      }),
    );
  });

  expect(
    await screen.findByText("تم حفظ التقييم اليومي بنجاح."),
  ).toBeInTheDocument();
  expect(screen.queryByText(/إضافة تقييم يومي/i)).not.toBeInTheDocument();
});

test("sard evaluation keeps the active contestant and tags mistakes with the last counter category", async () => {
  api.get.mockImplementation((url) => {
    if (url === "/teacher/students-with-evaluations") {
      return Promise.resolve({ data: { students: [] } });
    }
    if (url === "/teacher/sard/settings") {
      return Promise.resolve({
        data: {
          settings: {
            maxScore: 100,
            hesitationPenalty: 0,
            alertPenalty: 3,
            correctionPenalty: 6,
          },
        },
      });
    }
    if (url === "/teacher/sard/students") {
      return Promise.resolve({
        data: {
          students: [
            {
              _id: "contestant-1",
              firstName: "Yusuf",
              lastName: "Ahmed",
              competitionCode: "BDR-105",
              assignedCommittee: "قاعة النور",
            },
          ],
        },
      });
    }
    return Promise.resolve({ data: {} });
  });

  render(
    <MemoryRouter>
      <TeacherDashboard />
    </MemoryRouter>,
  );

  fireEvent.click(
    await screen.findByRole("button", { name: "تقييم السرد القرآني" }),
  );
  await screen.findByText("التصنيف النشط:");
  fireEvent.change(screen.getByLabelText("البحث بكود المسابقة أو اسم الطالب"), {
    target: { value: "105" },
  });
  fireEvent.change(screen.getByLabelText("المتسابق المعين لك"), {
    target: { value: "contestant-1" },
  });

  expect(
    screen.getByText("المتسابق قيد التقييم حالياً:"),
  ).toBeInTheDocument();
  expect(screen.getAllByText(/BDR-105/)).toHaveLength(2);
  fireEvent.click(screen.getByRole("button", { name: /إضافة تردد ذاتي/ }));
  expect(screen.getByRole("button", { name: "🟡 تردد ذاتي" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  fireEvent.click(screen.getByRole("button", { name: "النبأ" }));
  fireEvent.click(screen.getByRole("button", { name: "25" }));
  expect(
    screen.getByText("تردد ذاتي: سورة النبأ - آية 25"),
  ).toBeInTheDocument();

  fireEvent.click(screen.getByRole("button", { name: /إضافة فتح \/ تصحيح المعلم/ }));
  fireEvent.click(screen.getByRole("button", { name: "26" }));
  expect(
    screen.getByText("فتح المعلم: سورة النبأ - آية 26"),
  ).toBeInTheDocument();

  fireEvent.click(screen.getByRole("button", { name: "تغيير المتسابق / مسح" }));
  expect(
    screen.queryByText("المتسابق قيد التقييم حالياً:"),
  ).not.toBeInTheDocument();
  expect(
    screen.queryByText("تردد ذاتي: سورة النبأ - آية 25"),
  ).not.toBeInTheDocument();
});
