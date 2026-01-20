// CreateTrail.test.js
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import CreateTrail from "./CreateTrail";

// Mock Google Maps API loader
jest.mock("@react-google-maps/api", () => ({
  GoogleMap: ({ children }) => <div data-testid="google-map">{children}</div>,
  DirectionsRenderer: () => <div data-testid="directions-renderer" />,
  useJsApiLoader: () => ({
    isLoaded: true,
    loadError: false,
  }),
}));

// Mock global google object
beforeAll(() => {
  global.google = {
    maps: {
      TravelMode: { WALKING: "WALKING" },
      DirectionsService: function () {
        this.route = jest.fn();
      },
      places: {
        Autocomplete: function () {
          return {
            addListener: jest.fn(),
            getPlace: jest.fn(),
          };
        },
      },
    },
  };
});



// Basic render test
test("renders Create Trail page", () => {
  render(<CreateTrail />);
  expect(screen.getByText("Create Trail")).toBeInTheDocument();
});


// calculate route test when empty
test("shows alert if Calculate Route is clicked with empty inputs", () => {
  window.alert = jest.fn();

  render(<CreateTrail />);
  fireEvent.click(screen.getByText("Calculate Route"));

  expect(window.alert).toHaveBeenCalledWith(
    "Please enter both origin and destination."
  );
});


// clear button test
test("clear button resets distance and duration text", () => {
  render(<CreateTrail />);

  fireEvent.click(screen.getByText("Clear"));

  expect(screen.getByText("Distance:")).toBeInTheDocument();
  expect(screen.getByText("Duration:")).toBeInTheDocument();
});

