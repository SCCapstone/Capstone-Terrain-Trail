// SignUp.test.jsx
// Unit and behavioral tests for the SignUp page.

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import SignUp from "../pages/SignUp";

// Mock navigation so the test does not need the full router setup.
const mockNavigate = jest.fn();

jest.mock(
  "react-router-dom",
  () => ({
    useNavigate: () => mockNavigate,
  }),
  { virtual: true }
);

beforeEach(() => {
  mockNavigate.mockClear();
});

test("unit test: renders the SignUp page", () => {
  render(<SignUp />);

  expect(screen.getByPlaceholderText("Full Name")).toBeInTheDocument();
  expect(screen.getByPlaceholderText("Username")).toBeInTheDocument();
  expect(screen.getByPlaceholderText("Email")).toBeInTheDocument();
  expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
  expect(screen.getByPlaceholderText("Retype Password")).toBeInTheDocument();
});

test("unit test: renders the Sign Up and Log In buttons", () => {
  render(<SignUp />);

  expect(screen.getByRole("button", { name: /sign up/i })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /log in/i })).toBeInTheDocument();
});

test("behavioral test: user can type into the signup form", () => {
  render(<SignUp />);

  const fullNameInput = screen.getByPlaceholderText("Full Name");
  const usernameInput = screen.getByPlaceholderText("Username");
  const emailInput = screen.getByPlaceholderText("Email");
  const passwordInput = screen.getByPlaceholderText("Password");
  const retypePasswordInput = screen.getByPlaceholderText("Retype Password");

  fireEvent.change(fullNameInput, {
    target: { value: "Justin Schlag" },
  });

  fireEvent.change(usernameInput, {
    target: { value: "jschlag" },
  });

  fireEvent.change(emailInput, {
    target: { value: "justin@email.com" },
  });

  fireEvent.change(passwordInput, {
    target: { value: "password123" },
  });

  fireEvent.change(retypePasswordInput, {
    target: { value: "password123" },
  });

  expect(fullNameInput).toHaveValue("Justin Schlag");
  expect(usernameInput).toHaveValue("jschlag");
  expect(emailInput).toHaveValue("justin@email.com");
  expect(passwordInput).toHaveValue("password123");
  expect(retypePasswordInput).toHaveValue("password123");
});

test("behavioral test: clicking Log In goes to the login page", () => {
  render(<SignUp />);

  const loginButton = screen.getByRole("button", { name: /log in/i });

  fireEvent.click(loginButton);

  expect(mockNavigate).toHaveBeenCalled();
});
