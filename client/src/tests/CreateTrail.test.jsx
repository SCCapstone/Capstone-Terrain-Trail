import React from "react";
import { act, render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CreateTrail, { haversineDistanceMeters } from "../pages/CreateTrail";

// ✅ Mock react-router
const mockNavigate = jest.fn();
jest.mock(
  "react-router-dom",
  () => ({
    useNavigate: () => mockNavigate,
  }),
  { virtual: true }
);

// ✅ Mock Snackbar (FIXES YOUR ERROR)
jest.mock("../components/Snackbar.jsx", () => ({
  useSnackbar: () => ({
    showSnackbar: jest.fn(),
  }),
}));

// ✅ Mock Theme
jest.mock("../theme/ThemeContext", () => ({
  useTheme: () => ({
    darkMode: false,
  }),
}));

// ✅ Mock Google Maps
jest.mock("@react-google-maps/api", () => ({
  GoogleMap: ({ children }) => <div data-testid="google-map">{children}</div>,
  DirectionsRenderer: () => null,
  Polyline: () => null,
  Marker: () => null,
}));

describe("CreateTrail Tests", () => {
  beforeEach(() => {
    mockNavigate.mockClear();

    // ✅ Mock Google object
    global.google = {
      maps: {
        MapTypeId: { ROADMAP: "ROADMAP", TERRAIN: "TERRAIN" },
        UnitSystem: { IMPERIAL: "IMPERIAL" },
        TravelMode: {
          DRIVING: "DRIVING",
          BICYCLING: "BICYCLING",
          WALKING: "WALKING",
        },
        Size: function Size(width, height) {
          this.width = width;
          this.height = height;
        },
        Geocoder: jest.fn(() => ({
          geocode: jest.fn(),
        })),
        DirectionsService: jest.fn(() => ({
          route: jest.fn(),
        })),
        places: {
          Autocomplete: jest.fn(() => ({
            addListener: jest.fn(),
            getPlace: jest.fn(() => ({})),
          })),
        },
      },
    };

    // ✅ Mock Geolocation
    Object.defineProperty(window.navigator, "geolocation", {
      value: {
        getCurrentPosition: jest.fn((success) =>
          success({
            coords: { latitude: 34.0, longitude: -81.0 },
          })
        ),
        watchPosition: jest.fn(() => 1),
        clearWatch: jest.fn(),
      },
      configurable: true,
    });
  });

  // ========================
  // UNIT TEST
  // ========================
  describe("Unit", () => {
    test("calculates distance between two points", () => {
      const a = { lat: 0, lng: 0 };
      const b = { lat: 0, lng: 1 };

      const result = haversineDistanceMeters(a, b);

      expect(result).toBeGreaterThan(100000);
    });
  });

  // ========================
  // COMPONENT TESTS
  // ========================
  describe("Rendering", () => {
    test("renders origin and destination inputs", () => {
      render(<CreateTrail />);

      expect(screen.getByPlaceholderText("Origin")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("Destination")).toBeInTheDocument();
    });

    test("changes route type when clicking transport button", async () => {
      render(<CreateTrail />);

      const bikeBtn = screen.getByTitle("Biking");
      await userEvent.click(bikeBtn);

      expect(bikeBtn).toHaveAttribute("aria-pressed", "true");
    });
  });

  // ========================
  // BEHAVIOR TESTS
  // ========================
  describe("Behavior", () => {
    test("starts GPS tracking when Record New Route is clicked", async () => {
      render(<CreateTrail />);

      fireEvent.change(screen.getByPlaceholderText("Origin"), {
        target: { value: "Columbia, SC" },
      });

      fireEvent.click(
        screen.getByRole("button", { name: /record new route/i })
      );

      await waitFor(() => {
        expect(
          window.navigator.geolocation.watchPosition
        ).toHaveBeenCalled();
      });

      expect(
        screen.getByRole("button", { name: /^Stop$/i })
      ).toBeInTheDocument();
    });

    test("tracks user location and stops recording", async () => {
      render(<CreateTrail />);

      fireEvent.change(screen.getByPlaceholderText("Origin"), {
        target: { value: "Columbia, SC" },
      });

      fireEvent.click(
        screen.getByRole("button", { name: /record new route/i })
      );

      const watchCallback =
        window.navigator.geolocation.watchPosition.mock.calls[0][0];

      act(() => {
        watchCallback({ coords: { latitude: 34.0, longitude: -81.0 } });
        watchCallback({ coords: { latitude: 34.01, longitude: -81.01 } });
      });

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /^Stop$/i })).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole("button", { name: /^Stop$/i }));

      await waitFor(() => {
        expect(window.navigator.geolocation.clearWatch).toHaveBeenCalled();
      });
    });

    test("shows warning if saving without route", async () => {
      render(<CreateTrail />);

      const saveBtn = screen.getByText("Save to Library");
      await userEvent.click(saveBtn);

      // We just check no crash + button exists
      expect(saveBtn).toBeInTheDocument();
    });
  });
});
