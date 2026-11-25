import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import api from "../api/axios";
import SardRegistrationPage from "./SardRegistrationPage";

jest.mock("../api/axios", () => ({
  __esModule: true,
  default: { post: jest.fn() },
}));

test("registers multiple children without manual email fields and displays generated credentials", async () => {
  const user = userEvent.setup();
  api.post.mockResolvedValue({
    data: {
      parent: {
        email: "parent.01001234567@albadri.local",
        password: "01001234567",
      },
      children: [
        {
          childName: "Yusuf Ahmed",
          sardCode: "BDR-101",
          email: "yusuf.101@albadri.local",
          password: "01001234567",
        },
        {
          childName: "Sara Ahmed",
          sardCode: "BDR-102",
          email: "sara.102@albadri.local",
          password: "01001234567",
        },
      ],
    },
  });

  render(
    <MemoryRouter>
      <SardRegistrationPage />
    </MemoryRouter>,
  );

  await user.type(screen.getByLabelText("اسم ولي الأمر بالكامل"), "Ahmed Yusuf");
  await user.type(screen.getByLabelText("رقم هاتف ولي الأمر"), "01001234567");
  const childNameInputs = screen.getAllByLabelText("اسم الابن بالكامل");
  const ageInputs = screen.getAllByLabelText("العمر / المرحلة الدراسية");
  await user.type(childNameInputs[0], "Yusuf Ahmed");
  await user.type(ageInputs[0], "12 سنة");
  await user.click(screen.getByRole("button", { name: "+ إضافة ابن آخر" }));
  await user.type(screen.getAllByLabelText("اسم الابن بالكامل")[1], "Sara Ahmed");
  await user.type(screen.getAllByLabelText("العمر / المرحلة الدراسية")[1], "10 سنة");
  await user.click(screen.getByRole("button", { name: "تأكيد التسجيل في التحدي" }));

  await waitFor(() => {
    expect(api.post).toHaveBeenCalledWith("/sard/register", {
      parentName: "Ahmed Yusuf",
      parentPhone: "01001234567",
      parentPassword: "",
      children: [
        { childName: "Yusuf Ahmed", ageOrGrade: "12 سنة" },
        { childName: "Sara Ahmed", ageOrGrade: "10 سنة" },
      ],
    });
  });
  expect(await screen.findByText("BDR-101")).toBeInTheDocument();
  expect(screen.getByText("BDR-102")).toBeInTheDocument();
  expect(screen.getByText("yusuf.101@albadri.local")).toBeInTheDocument();
});
