import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import SignUp from "./SignUp";

// Virtual mock so Jest doesn't need to resolve react-router-dom
jest.mock(
  "react-router-dom",
  () => ({
    useNavigate: () => jest.fn(),
  }),
  { virtual: true }
);

test("SignUp page renders key inputs and buttons", () => {
  render(<SignUp />);

  // Inputs (unique)
  expect(screen.getByPlaceholderText("Full Name")).toBeInTheDocument();
  expect(screen.getByPlaceholderText("Username")).toBeInTheDocument();
  expect(screen.getByPlaceholderText("Email")).toBeInTheDocument();
  expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
  expect(screen.getByPlaceholderText("Retype Password")).toBeInTheDocument();

  // Buttons (unique by role + name)
  expect(screen.getByRole("button", { name: /^sign up$/i })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /^log in$/i })).toBeInTheDocument();
});