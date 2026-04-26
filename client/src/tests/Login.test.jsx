// Login.test.jsx
// Unit and behavioral tests for the Login page.

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import Login from "../pages/Login";

// Mock navigation so the test does not need the full router setup.
const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

beforeEach(() => {
  mockNavigate.mockClear();
});

test("unit test: renders the Login page", () => {
  render(<Login />);

  expect(screen.getByPlaceholderText("Username")).toBeInTheDocument();
  expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
});

test("unit test: renders the Login and Sign Up buttons", () => {
  render(<Login />);

  expect(screen.getByRole("button", { name: /log in/i })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /sign up/i })).toBeInTheDocument();
});

test("behavioral test: user can type into the login form", () => {
  render(<Login />);

  const usernameInput = screen.getByPlaceholderText("Username");
  const passwordInput = screen.getByPlaceholderText("Password");

  fireEvent.change(usernameInput, {
    target: { value: "testuser" },
  });

  fireEvent.change(passwordInput, {
    target: { value: "password123" },
  });

  expect(usernameInput).toHaveValue("testuser");
  expect(passwordInput).toHaveValue("password123");
});

test("behavioral test: clicking Sign Up goes to the signup page", () => {
  render(<Login />);

  const signUpButton = screen.getByRole("button", { name: /sign up/i });

  fireEvent.click(signUpButton);

  expect(mockNavigate).toHaveBeenCalled();
});