// SignUp.behavior.test.jsx
// Tests that the SignUp page renders the main form fields and buttons.

import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import SignUp from "../pages/SignUp";

// Mock navigation so the test does not need the full router setup.
jest.mock("react-router-dom", () => ({
  useNavigate: () => jest.fn(),
}));

test("renders the SignUp page form fields", () => {
  render(<SignUp />);

  expect(screen.getByPlaceholderText("Full Name")).toBeInTheDocument();
  expect(screen.getByPlaceholderText("Username")).toBeInTheDocument();
  expect(screen.getByPlaceholderText("Email")).toBeInTheDocument();
  expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
  expect(screen.getByPlaceholderText("Retype Password")).toBeInTheDocument();
});

test("renders the SignUp and Log In buttons", () => {
  render(<SignUp />);

  expect(screen.getByRole("button", { name: /sign up/i })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /log in/i })).toBeInTheDocument();
});