import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
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
          firstName: "Amina",
          lastName: "Ali",
          competitionCode: "BDR-101",
          finalScore: 97,
          maxScore: 100,
          evaluatedBy: "Mona Teacher",
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
  expect(screen.getByText("Amina Ali")).toBeInTheDocument();
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
  await waitFor(() => {
    expect(api.get).toHaveBeenCalledTimes(1);
    expect(api.get).toHaveBeenCalledWith("/leaderboard");
  });
});
