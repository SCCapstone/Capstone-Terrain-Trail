/**
 * Root React component for the "Cola Trails" application. Testing for merge conflicts.
 *
 * Renders the main application layout including:
 * - a header with the application title ("Cola Trails") and a short description,
 * - a main content area (currently styled with left padding) intended to hold page content.
 *
 * This component does not accept any props and serves as the application's entry point.
 *
 * @component
 * @name App
 * @returns {JSX.Element} The root React element containing the header and main content area.
 */
import React from "react";
import "./App.css";

function App() {
  return (
    <div className="app-root">
      <header className="app-header">
        <h1>Cola Trails</h1>
        <p>Explore and rate walking, biking, and driving routes across USC</p>
      </header>
      <main style={{
        paddingLeft: "20%"
      }}>
      </main>
    </div>
  );
}


export default App;


