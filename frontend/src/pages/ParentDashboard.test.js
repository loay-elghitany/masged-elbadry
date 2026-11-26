import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ParentDashboard from "./ParentDashboard";
import api from "../api/axios";

jest.mock("../api/axios", () => ({
  get: jest.fn(),
  post: jest.fn(),
}));

afterEach(() => {
  jest.clearAllMocks();
});

test("shows the Sard evaluation and evaluator name without a leaderboard opt-in control", async () => {
  api.get.mockImplementation((url) =>
    Promise.resolve(
      url === "/parent/dashboard"
        ? {
            data: {
              parent: { firstName: "Ahmed", lastName: "Yusuf" },
              children: [
                {
                  _id: "child-1",
                  firstName: "Amina",
                  lastName: "Ahmed",
                  group: null,
                  evaluations: [],
                  competitionCode: "BDR-101",
                  sardEvaluation: {
                    completionStatus: "incomplete",
                    encouragementGrade: "جيد جداً",
                    stoppedAtSurah: "النازعات",
                    teacherNote: "نقدّر اجتهادك.",
                    evaluatedBy: { name: "Mona Teacher" },
                  },
                },
              ],
            },
          }
        : {
            data: {
              settings: {
                videoQuestionPoints: 3,
                errorPenaltyMultiplier: 1,
              },
            },
          },
    ),
  );

  render(
    <MemoryRouter>
      <ParentDashboard />
    </MemoryRouter>,
  );

  expect(await screen.findAllByText("Amina Ahmed")).not.toHaveLength(0);
  expect(screen.getByText("تقدير: جيد جداً")).toBeInTheDocument();
  expect(screen.getByText("السورة التي توقف عندها:")).toBeInTheDocument();
  expect(screen.getByText("المعلم المُقيِّم: Mona Teacher")).toBeInTheDocument();
  expect(screen.getByText("نقدّر اجتهادك.")).toBeInTheDocument();
  expect(screen.queryByText("95 / 100")).not.toBeInTheDocument();
  expect(screen.queryByText(/لوحة الشرف العامة/)).not.toBeInTheDocument();
  expect(api.get).toHaveBeenCalledWith("/parent/dashboard");
});
