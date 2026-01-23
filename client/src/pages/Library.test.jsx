import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import Library from "./Library";

// --- Minimal mocks ---
jest.mock("@react-google-maps/api", () => ({
  useJsApiLoader: () => ({ isLoaded: true }),
  GoogleMap: ({ children }) => <div>{children}</div>,
  DirectionsRenderer: () => <div data-testid="directions-renderer" />,
}));

beforeEach(() => {
  // Minimal Google Maps mocks needed for load to succeed
  global.window.google = {
    maps: {
      Geocoder: function () {
        this.geocode = (opts, cb) =>
          cb(
            [
              {
                geometry: {
                  location: {
                    lat: () => 0,
                    lng: () => 0,
                  },
                },
              },
            ],
            "OK"
          );
      },
      DirectionsService: function () {
        this.route = (req, cb) =>
          cb(
            {
              routes: [
                {
                  legs: [
                    {
                      distance: { text: "1 mi" },
                      duration: { text: "10 mins" },
                    },
                  ],
                },
              ],
            },
            "OK"
          );
      },
      TravelMode: {
        DRIVING: "DRIVING",
      },
    },
  };
});

afterEach(() => {
  delete global.window.google;
});

test("Load button loads a saved route", async () => {
  render(<Library />);
  const loadButton = screen.getAllByRole("button", { name: "Load" })[0];
  userEvent.click(loadButton);

  // Expect route info to appear after loading
  await waitFor(() => {
    expect(screen.getByText(/Distance:/i)).toBeInTheDocument();
    expect(screen.getByText(/ETA:/i)).toBeInTheDocument();
  });

  // Directions renderer should be mounted
  expect(screen.getByTestId("directions-renderer")).toBeInTheDocument();
});

