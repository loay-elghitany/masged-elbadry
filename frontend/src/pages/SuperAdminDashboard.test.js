import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import SuperAdminDashboard from "./SuperAdminDashboard";
import api from "../api/axios";

jest.mock("../api/axios", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

beforeEach(() => {
  api.get.mockImplementation((url) => {
    if (
      url === "/admin/settings/gamification" ||
      url === "/settings/gamification"
    ) {
      return Promise.resolve({
        data: {
          settings: {
            attendancePoints: 5,
            excusedAbsencePoints: 0,
            unexcusedAbsencePoints: 0,
            score_1: 1,
            score_2: 2,
            score_3: 3,
            score_4: 4,
            score_5: 5,
            score_6: 6,
            score_7: 7,
            score_8: 8,
            score_9: 9,
            score_10: 10,
            errorPenaltyMultiplier: 1,
          },
        },
      });
    }

    if (url === "/admin/users") {
      return Promise.resolve({
        data: {
          users: [
            {
              _id: "teacher-1",
              firstName: "Teacher",
              lastName: "A",
              role: "Teacher",
            },
            {
              _id: "student-1",
              firstName: "Amina",
              lastName: "Khalid",
              email: "amina@example.com",
              phone: "+966500000001",
              teacherId: "teacher-1",
              role: "Student",
            },
          ],
        },
      });
    }

    if (url === "/admin/groups") {
      return Promise.resolve({ data: { groups: [] } });
    }

    if (url === "/admin/evaluations") {
      return Promise.resolve({ data: { evaluations: [] } });
    }

    return Promise.resolve({ data: {} });
  });

  api.post.mockResolvedValue({ data: {} });
  api.put.mockResolvedValue({ data: { user: {} } });
  api.delete.mockResolvedValue({ data: {} });
});

afterEach(() => {
  jest.clearAllMocks();
});

test("renders the SuperAdmin dashboard user management sections", async () => {
  render(
    <MemoryRouter>
      <SuperAdminDashboard />
    </MemoryRouter>,
  );

  expect(
    screen.getByRole("heading", { name: "إنشاء مستخدم جديد" }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("button", { name: "أنشئ معلم" }),
  ).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "المجموعات" }));
  expect(
    await screen.findByRole("heading", { name: "أنشئ مجموعة" }),
  ).toBeInTheDocument();
});

test("groups admin navigation and keeps announcement creation in its section", () => {
  render(
    <MemoryRouter>
      <SuperAdminDashboard />
    </MemoryRouter>,
  );

  expect(screen.getByText("الأفراد والحسابات")).toBeInTheDocument();
  expect(screen.getByText("المتابعة الأكاديمية")).toBeInTheDocument();
  expect(screen.getByText("المحتوى والتحفيز")).toBeInTheDocument();
  expect(screen.getByText("التواصل والدعم")).toBeInTheDocument();
  expect(screen.queryByText("انشر إعلانًا جديدًا")).not.toBeInTheDocument();

  fireEvent.click(screen.getByRole("button", { name: /الإعلانات/i }));
  expect(screen.getByText("انشر إعلانًا جديدًا")).toBeInTheDocument();

  fireEvent.click(screen.getByRole("button", { name: "المعلمين" }));
  expect(screen.queryByText("انشر إعلانًا جديدًا")).not.toBeInTheDocument();
});

test("loads evaluations on demand, caches them, and refreshes on request", async () => {
  render(
    <MemoryRouter>
      <SuperAdminDashboard />
    </MemoryRouter>,
  );

  expect(api.get).not.toHaveBeenCalledWith("/admin/evaluations");
  fireEvent.click(screen.getByRole("button", { name: /سجل التقييمات الشامل/i }));
  await waitFor(() =>
    expect(
      api.get.mock.calls.filter(([url]) => url === "/admin/evaluations"),
    ).toHaveLength(1),
  );
  expect(
    api.get.mock.calls.filter(([url]) => url === "/admin/evaluations"),
  ).toHaveLength(1);

  fireEvent.click(screen.getByRole("button", { name: "الطلاب" }));
  fireEvent.click(screen.getByRole("button", { name: /سجل التقييمات الشامل/i }));
  expect(
    api.get.mock.calls.filter(([url]) => url === "/admin/evaluations"),
  ).toHaveLength(1);

  fireEvent.click(screen.getByRole("button", { name: "تحديث السجل" }));
  await waitFor(() =>
    expect(
      api.get.mock.calls.filter(([url]) => url === "/admin/evaluations"),
    ).toHaveLength(2),
  );
});

test("avoids duplicate admin reference requests under StrictMode", async () => {
  render(
    <React.StrictMode>
      <MemoryRouter>
        <SuperAdminDashboard />
      </MemoryRouter>
    </React.StrictMode>,
  );

  await waitFor(() => {
    expect(api.get).toHaveBeenCalledWith("/admin/users");
    expect(api.get).toHaveBeenCalledWith("/admin/groups");
  });
  expect(
    api.get.mock.calls.filter(([url]) => url === "/admin/users"),
  ).toHaveLength(1);
  expect(
    api.get.mock.calls.filter(([url]) => url === "/admin/groups"),
  ).toHaveLength(1);
  expect(api.get).not.toHaveBeenCalledWith("/admin/evaluations");
});

test("submits a create user form and calls api post", async () => {
  render(
    <MemoryRouter>
      <SuperAdminDashboard />
    </MemoryRouter>,
  );

  fireEvent.change(screen.getByLabelText(/دور المستخدم/i), {
    target: { value: "Teacher" },
  });
  fireEvent.change(screen.getByPlaceholderText("الاسم الأول"), {
    target: { value: "Sami" },
  });
  fireEvent.change(screen.getByPlaceholderText("الاسم الأخير"), {
    target: { value: "Hassan" },
  });
  fireEvent.change(screen.getByPlaceholderText("معلم@مثال.com"), {
    target: { value: "sami@example.com" },
  });
  fireEvent.change(screen.getByPlaceholderText("كلمة مرور آمنة"), {
    target: { value: "securepass" },
  });

  fireEvent.click(screen.getByRole("button", { name: "أنشئ معلم" }));

  await waitFor(() => {
    expect(api.post).toHaveBeenCalledWith("/admin/users", {
      role: "Teacher",
      firstName: "Sami",
      lastName: "Hassan",
      email: "sami@example.com",
      password: "securepass",
      phone: "",
    });
  });
});

test("submits a create group form and calls api post", async () => {
  render(
    <MemoryRouter>
      <SuperAdminDashboard />
    </MemoryRouter>,
  );

  fireEvent.click(screen.getByRole("button", { name: "المجموعات" }));
  fireEvent.change(
    await screen.findByPlaceholderText("مثال: مجموعة القرآن الصباحية"),
    {
    target: { value: "Evening Batch" },
    },
  );
  fireEvent.click(screen.getByLabelText("Amina Khalid"));
  fireEvent.click(screen.getByRole("button", { name: "أنشئ مجموعة" }));

  await waitFor(() => {
    expect(api.post).toHaveBeenCalledWith("/admin/groups", {
      name: "Evening Batch",
      teacherId: "teacher-1",
      studentIds: ["student-1"],
    });
  });
});

test("sends core profile fields when editing a student", async () => {
  render(
    <MemoryRouter>
      <SuperAdminDashboard />
    </MemoryRouter>,
  );

  fireEvent.click(screen.getByRole("button", { name: "الطلاب" }));
  await waitFor(() =>
    expect(screen.getByText(/إدارة الطلاب/i)).toBeInTheDocument(),
  );
  fireEvent.click(await screen.findByRole("button", { name: /تحرير/i }));

  const firstNameInput =
    screen
      .getAllByPlaceholderText(/الاسم الأول/i)
      .find((input) => input.value === "Amina") ||
    screen.getAllByPlaceholderText(/الاسم الأول/i)[0];
  const lastNameInput =
    screen
      .getAllByPlaceholderText(/الاسم الأخير/i)
      .find((input) => input.value === "Khalid") ||
    screen.getAllByPlaceholderText(/الاسم الأخير/i)[0];
  const emailInput =
    screen
      .getAllByPlaceholderText(/student@example.com/i)
      .find((input) => input.value === "amina@example.com") ||
    screen.getAllByPlaceholderText(/student@example.com/i)[0];
  const phoneInput =
    screen
      .getAllByPlaceholderText(/مثال: \+966512345678/i)
      .find((input) => input.value === "+966500000001") ||
    screen.getAllByPlaceholderText(/مثال: \+966512345678/i)[0];
  const passwordInput = screen.getAllByPlaceholderText(/كلمة مرور جديدة/i)[0];

  fireEvent.change(firstNameInput, { target: { value: "Amal" } });
  fireEvent.change(lastNameInput, { target: { value: "Saleh" } });
  fireEvent.change(emailInput, { target: { value: "amal@example.com" } });
  fireEvent.change(phoneInput, { target: { value: "+966500000002" } });
  fireEvent.change(passwordInput, { target: { value: "newpassword123" } });

  fireEvent.click(screen.getByRole("button", { name: /حفظ التغييرات/i }));

  await waitFor(() => {
    expect(api.put).toHaveBeenCalledWith(
      "/admin/users/students/student-1",
      expect.objectContaining({
        firstName: "Amal",
        lastName: "Saleh",
        email: "amal@example.com",
        phone: "+966500000002",
        password: "newpassword123",
        teacherId: "teacher-1",
        groupId: "",
        parentId: "",
      }),
    );
  });
});

test("searches reception contestants instantly and assigns a teacher in one selection", async () => {
  api.get.mockImplementation((url) => {
    if (url === "/admin/users") {
      return Promise.resolve({
        data: {
          users: [
            {
              _id: "teacher-1",
              firstName: "Teacher",
              lastName: "A",
              role: "Teacher",
            },
          ],
        },
      });
    }
    if (url === "/admin/groups") {
      return Promise.resolve({ data: { groups: [] } });
    }
    if (url === "/admin/sard/settings") {
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
    if (url === "/admin/sard/leaderboard") {
      return Promise.resolve({
        data: {
          students: [
            {
              _id: "contestant-1",
              firstName: "Yusuf",
              lastName: "Ahmed",
              competitionCode: "BDR-105",
              assignedCommittee: "",
              teacherId: null,
              parentId: { firstName: "Ahmed", lastName: "Yusuf" },
              latestEvaluation: null,
            },
          ],
        },
      });
    }
    return Promise.resolve({ data: {} });
  });

  render(
    <MemoryRouter>
      <SuperAdminDashboard />
    </MemoryRouter>,
  );
  fireEvent.click(
    screen.getByRole("button", { name: "مسابقة السرد (جزء عمّ)" }),
  );

  const search = await screen.findByPlaceholderText(
    "ابحث بالكود 105 أو باسم الطالب أو ولي الأمر...",
  );
  fireEvent.change(search, { target: { value: "105" } });
  await screen.findAllByText("Yusuf Ahmed");
  const contestantRow = search.closest("section").querySelector("article");
  expect(contestantRow).not.toBeNull();
  expect(within(contestantRow).getByText("BDR-105")).toBeInTheDocument();
  expect(within(contestantRow).getByText(/ولي الأمر: Ahmed Yusuf/)).toBeInTheDocument();
  expect(screen.queryByText("تعيين سريع لمعلم")).not.toBeInTheDocument();
});
