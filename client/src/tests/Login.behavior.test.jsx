// Login.behavior.test.jsx
// Tests that the Login page renders the main login form fields and buttons.

import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import Login from "../pages/Login";

// Mock navigation so the test does not need the full router setup.
jest.mock("react-router-dom", () => ({
  useNavigate: () => jest.fn(),
}));

test("renders the Login page form fields", () => {
  render(<Login />);

  expect(screen.getByPlaceholderText("Username")).toBeInTheDocument();
  expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
});

test("renders the Login and Sign Up buttons", () => {
  render(<Login />);

  expect(screen.getByRole("button", { name: /log in/i })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /sign up/i })).toBeInTheDocument();
});