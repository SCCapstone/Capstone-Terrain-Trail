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



// This test verifies that the CreateTrail component renders successfully.
// It ensures the main page title ("Create Trail"),
// confirming that the component loads without crashing and displays
// its primary UI elements correctly.
test("renders Create Trail page", () => {
  render(<CreateTrail />);
  expect(screen.getByText("Create Trail")).toBeInTheDocument();
});


// This test checks a boundary condition where the user clicks
// "Calculate Route" without providing any input values.
// The expected behavior is that the application prevents further
// processing and displays an alert instructing the user to enter
// both an origin and a destination.
test("shows alert if Calculate Route is clicked with empty inputs", () => {
  window.alert = jest.fn();

  render(<CreateTrail />);
  fireEvent.click(screen.getByText("Calculate Route"));

  expect(window.alert).toHaveBeenCalledWith(
    "Please enter both origin and destination."
  );
});


// This test verifies that clicking the "Clear" button resets
// the route-related state within the component.
// It ensures that distance and duration values are cleared
// and that the UI returns to its initial, neutral state.
test("clear button resets distance and duration text", () => {
  render(<CreateTrail />);

  fireEvent.click(screen.getByText("Clear"));

  expect(screen.getByText("Distance:")).toBeInTheDocument();
  expect(screen.getByText("Duration:")).toBeInTheDocument();
});

