// Splash.test.jsx
// Unit and behavioral tests for the Splash page.

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import Splash from "../pages/SplashScreen";

// Mock navigation so the test does not need the full router setup.
const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

beforeEach(() => {
  mockNavigate.mockClear();
});

test("unit test: renders the Splash page", () => {
  render(<Splash />);

  expect(screen.getByText(/terrain trail/i)).toBeInTheDocument();
});

test("unit test: renders the main navigation buttons", () => {
  render(<Splash />);

  expect(screen.getByRole("button", { name: /log in/i })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /sign up/i })).toBeInTheDocument();
});

test("behavioral test: clicking Log In navigates to the login page", () => {
  render(<Splash />);

  const loginButton = screen.getByRole("button", { name: /log in/i });

  fireEvent.click(loginButton);

  expect(mockNavigate).toHaveBeenCalled();
});

test("behavioral test: clicking Sign Up navigates to the signup page", () => {
  render(<Splash />);

  const signUpButton = screen.getByRole("button", { name: /sign up/i });

  fireEvent.click(signUpButton);

  expect(mockNavigate).toHaveBeenCalled();
});