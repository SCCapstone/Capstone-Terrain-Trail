import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CompletedTrail from "../pages/CompletedTrail";

beforeAll(() => {
  document.queryCommandValue = jest.fn(() => "p");
  document.queryCommandState = jest.fn(() => false);
});

const mockNavigate = jest.fn();
jest.mock(
  "react-router-dom",
  () => ({
    MemoryRouter: ({ children }) => <>{children}</>,
    Link: ({ to, children, ...props }) => (
      <a href={to} {...props}>
        {children}
      </a>
    ),
    useNavigate: () => mockNavigate,
    useParams: () => ({ id: "123" }),
  }),
  { virtual: true }
);

import { MemoryRouter } from "react-router-dom";

// Mock Snackbar
jest.mock("../components/Snackbar.jsx", () => ({
  useSnackbar: () => ({
    showSnackbar: jest.fn(),
  }),
}));

// Mock Theme
jest.mock("../theme/ThemeContext", () => ({
  useTheme: () => ({
    darkMode: false,
  }),
}));

// Mock Google Maps
jest.mock("@react-google-maps/api", () => ({
  GoogleMap: ({ children }) => <div data-testid="google-map">{children}</div>,
  DirectionsRenderer: () => null,
  Marker: () => null,
  Polyline: () => null,
}));

describe("CompletedTrail Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    global.fetch = jest.fn((url) => {
      // Mock route fetch
      if (url.includes("/api/routes/")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              route: {
  title: "Test Route",
                public: true,
                hazards: [],
                photos: [],
                review: { stars: 4, terrain: 5, comment: "" },
                origin: "A",
                destination: "B",
                distance: "1 mi",
                duration: "10 min",
                type: "🚶",

                // 🔥 REQUIRED
                owner: {
                    _id: "user1",
                    username: "testuser"
                },

                user: {
                _id: "user1",
                username: "testuser"
                },

                // 🔥 ALSO REQUIRED
                authorUsername: "testuser"
                },
            }),
        });
      }

      // Mock account fetch
      if (url.includes("/api/account")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              user: { _id: "user1", username: "testuser" },
            }),
        });
      }

      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    });
  });

  // Unit Tests
  describe("Unit", () => {
    test("buildReviewSnapshot returns a string", async () => {
      const { buildReviewSnapshot } = await import("../pages/CompletedTrail");

      const snapshot = buildReviewSnapshot({
        stars: 5,
        terrain: 7,
        comment: "Nice trail",
        isPublic: true,
        hazards: [],
        photos: [],
      });

      expect(typeof snapshot).toBe("string");
      expect(snapshot).toContain("Nice trail");
    });
  });

  // Component Tests
  describe("Rendering", () => {
    test("shows loading initially", () => {
      global.fetch.mockImplementationOnce(
        () =>
          new Promise(() => {})
      );

      render(
        <MemoryRouter>
          <CompletedTrail />
        </MemoryRouter>
      );

      expect(screen.getByText(/loading trail/i)).toBeInTheDocument();
    });

    test("renders route title after fetch", async () => {
      render(
        <MemoryRouter>
          <CompletedTrail />
        </MemoryRouter>
      );

      expect(await screen.findByText("Test Route")).toBeInTheDocument();
    });

    test("displays correct star rating", async () => {
      render(
        <MemoryRouter>
          <CompletedTrail />
        </MemoryRouter>
      );

      expect(await screen.findByText(/4\/5/)).toBeInTheDocument();
    });

    test("renders photo section", async () => {
      render(
        <MemoryRouter>
          <CompletedTrail />
        </MemoryRouter>
      );

      expect(await screen.findByText(/trail photos/i)).toBeInTheDocument();
    });
  });

  // Behavioral Tests
  describe("Behavior", () => {
    test("user can type into review textbox (owner view)", async () => {
  render(
    <MemoryRouter>
      <CompletedTrail />
    </MemoryRouter>
  );

  await screen.findByText("Test Route");

  const textbox = document.querySelector('[contenteditable="true"]');

  expect(textbox).toBeTruthy();

  await userEvent.type(textbox, "Amazing trail!");

  expect(textbox.innerHTML).toContain("Amazing trail!");
});

    test("delete button triggers API call", async () => {
  render(
    <MemoryRouter>
      <CompletedTrail />
    </MemoryRouter>
  );

  await screen.findByText("Test Route");

  // Step 1: click Delete
  const deleteBtn = screen.getByText(/delete/i);
  await userEvent.click(deleteBtn);

  // Step 2: click Confirm
  const confirmBtn = await screen.findByText(/confirm/i);
  await userEvent.click(confirmBtn);

  await waitFor(() => {
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/routes/123"),
      expect.objectContaining({ method: "DELETE" })
    );
  });
});

  });
});
