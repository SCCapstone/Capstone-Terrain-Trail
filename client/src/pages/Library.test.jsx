import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import Library from "./Library";

const LOCAL_STORAGE_KEY = "savedRoutes_v1";

// --- Minimal mocks ---
jest.mock("@react-google-maps/api", () => ({
  useJsApiLoader: () => ({ isLoaded: true }),
  GoogleMap: ({ children }) => <div>{children}</div>,
  DirectionsRenderer: () => <div data-testid="directions-renderer" />,
}));

beforeEach(() => {
  window.localStorage.clear();
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
        this.route = jest.fn().mockResolvedValue({
          routes: [
            {
              legs: [
                {
                  distance: { text: "1 mi" },
                  duration: { text: "10 mins" },
                  start_location: {
                    lat: () => 0,
                    lng: () => 0,
                  },
                },
              ],
              bounds: {},
            },
          ],
        });
      },
      TravelMode: {
        WALKING: "WALKING",
        BICYCLING: "BICYCLING",
        DRIVING: "DRIVING",
      },
    },
  };

  window.confirm = jest.fn(() => true);
});

afterEach(() => {
  delete global.window.google;
  jest.restoreAllMocks();
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

test("Delete button removes a saved route", async () => {
  const savedRoute = {
    id: "delete-me",
    title: "Delete target route",
    origin: "301 Main St, Columbia, SC 29208",
    destination: "1523 Greene St, Columbia, SC 29225",
    distance: ".8 mi",
    duration: "19 mins",
    type: "WALKING",
  };

  window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify([savedRoute]));

  render(<Library />);
  expect(screen.getByText("Delete target route WALKING")).toBeInTheDocument();

  await userEvent.click(screen.getByRole("button", { name: "Delete" }));

  await waitFor(() => {
    expect(
      screen.queryByText("Delete target route WALKING")
    ).not.toBeInTheDocument();
  });
});

test("Filter button applies type, distance, and time together", async () => {
  const routes = [
    {
      id: "r1",
      title: "Walk Fast Short",
      origin: "A",
      destination: "B",
      distance: ".8 mi",
      duration: "19 mins",
      type: "WALKING",
    },
    {
      id: "r2",
      title: "Bike Short Slow",
      origin: "C",
      destination: "D",
      distance: ".7 mi",
      duration: "25 mins",
      type: "BIKING",
    },
    {
      id: "r3",
      title: "Walk Long",
      origin: "E",
      destination: "F",
      distance: "2.1 mi",
      duration: "30 mins",
      type: "WALKING",
    },
  ];

  window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(routes));
  render(<Library />);

  await userEvent.click(screen.getByRole("button", { name: "Filter" }));
  await userEvent.selectOptions(screen.getByLabelText("Route Type"), "WALKING");
  await userEvent.type(screen.getByLabelText("Max Distance (mi)"), "1");
  await userEvent.type(screen.getByLabelText("Max Time (min)"), "20");

  expect(screen.getByText("Walk Fast Short WALKING")).toBeInTheDocument();
  expect(screen.queryByText("Bike Short Slow BIKING")).not.toBeInTheDocument();
  expect(screen.queryByText("Walk Long WALKING")).not.toBeInTheDocument();
});

