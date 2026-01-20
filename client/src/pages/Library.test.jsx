/**
 * @file Library.test.jsx
 *
 * Tests for the Library component without loading the real Google Maps API.
 * We mock @react-google-maps/api to avoid network + script loading.
 */

import React from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import Library from "./Library";

// ---- Mock @react-google-maps/api ----
jest.mock("@react-google-maps/api", () => {
  const React = require("react");

  return {
    // We control loaded/error states from inside each test by changing this mock implementation if needed.
    useJsApiLoader: jest.fn(() => ({ isLoaded: true, loadError: undefined })),

    // Render a simple div instead of the real map. Call onLoad/onUnmount like the real component would.
    GoogleMap: ({ children, onLoad, onUnmount }) => {
      React.useEffect(() => {
        const fakeMap = {
          panTo: jest.fn(),
          setZoom: jest.fn(),
          fitBounds: jest.fn(),
        };
        onLoad?.(fakeMap);
        return () => onUnmount?.();
      }, [onLoad, onUnmount]);

      return <div data-testid="google-map">{children}</div>;
    },

    // Render a placeholder for DirectionsRenderer
    DirectionsRenderer: ({ directions }) => (
      <div data-testid="directions-renderer">
        {directions ? "has-directions" : "no-directions"}
      </div>
    ),
  };
});

function setUseJsApiLoaderReturn(value) {
  const maps = require("@react-google-maps/api");
  maps.useJsApiLoader.mockImplementation(() => value);
}

describe("Library", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // By default, Library checks window.google?.maps in loadSavedRoute
    // so leave it undefined unless a test needs it.
    delete window.google;
  });

  test("shows loading state when maps are not loaded", () => {
    setUseJsApiLoaderReturn({ isLoaded: false, loadError: undefined });

    render(<Library />);
    expect(screen.getByText("Loading map...")).toBeInTheDocument();
  });

  test("shows error state when maps loader fails", () => {
    setUseJsApiLoaderReturn({ isLoaded: false, loadError: new Error("boom") });

    render(<Library />);
    expect(
      screen.getByText(/Error loading Google Maps API/i)
    ).toBeInTheDocument();
  });

  test("renders header, search input, and saved routes list", () => {
    render(<Library />);

    expect(screen.getByRole("heading", { name: "Library" })).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText(
        /Search saved routes by title, origin, or destination/i
      )
    ).toBeInTheDocument();

    // Saved Routes (2) initially based on component state
    expect(
      screen.getByRole("heading", { name: /Saved Routes \(2\)/i })
    ).toBeInTheDocument();

    // Both routes render with Load/Delete controls
    const loadButtons = screen.getAllByRole("button", { name: "Load" });
    const deleteButtons = screen.getAllByRole("button", { name: "Delete" });
    expect(loadButtons).toHaveLength(2);
    expect(deleteButtons).toHaveLength(2);
  });

  test("Clear button clears the search input", async () => {
    const user = userEvent.setup();
    render(<Library />);

    const input = screen.getByPlaceholderText(
      /Search saved routes by title, origin, or destination/i
    );

    await user.type(input, "LeConte");
    expect(input).toHaveValue("LeConte");

    await user.click(screen.getByRole("button", { name: "Clear" }));
    expect(input).toHaveValue("");
  });

  test("delete removes a route and updates the count", async () => {
    const user = userEvent.setup();
    render(<Library />);

    // Confirm initial count
    expect(
      screen.getByRole("heading", { name: /Saved Routes \(2\)/i })
    ).toBeInTheDocument();

    // Delete the first route item (there are two Delete buttons)
    const deleteButtons = screen.getAllByRole("button", { name: "Delete" });
    await user.click(deleteButtons[0]);

    // Count should become 1
    expect(
      screen.getByRole("heading", { name: /Saved Routes \(1\)/i })
    ).toBeInTheDocument();
  });

  test("clicking list item selects it (visual state change via background) [smoke]", async () => {
    const user = userEvent.setup();
    render(<Library />);

    // There are 2 list items; click the first one
    const list = screen.getByRole("list");
    const items = within(list).getAllByRole("listitem");
    await user.click(items[0]);

    // The component changes background inline when selected.
    // JSDOM can read inline styles, so we can assert it flipped.
    // Selected background: "#f5f7fa"
    expect(items[0]).toHaveStyle({ background: "#f5f7fa" });
  });

  test("clicking Load does NOT crash even if window.google is missing (early return)", async () => {
    const user = userEvent.setup();
    render(<Library />);

    // In your component, loadSavedRoute returns early if !isLoaded or !window.google?.maps.
    // So clicking Load should do nothing but also not throw.
    const loadButtons = screen.getAllByRole("button", { name: "Load" });
    await user.click(loadButtons[0]);

    // DirectionsRenderer should not appear (no directionsResult set)
    expect(screen.queryByTestId("directions-renderer")).not.toBeInTheDocument();
  });

  test("Recenter button is present and clickable", async () => {
    const user = userEvent.setup();
    render(<Library />);

    const recenter = screen.getByRole("button", { name: /Recenter to origin/i });
    expect(recenter).toBeInTheDocument();

    await user.click(recenter);
    // No assertion needed beyond "doesn't throw"; map pan/zoom are internal.
  });
});
