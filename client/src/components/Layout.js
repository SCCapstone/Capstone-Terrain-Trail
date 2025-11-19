import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import "./Layout.css";

const Layout = () => {
  return (
    <div className="app-root">
      {/* LEFT ICON SIDEBAR */}
      <aside className="sidebar">
        {/* Home (send to Explore / map) */}
        <NavLink
          to="explore"
          className={({ isActive }) =>
            isActive ? "side-link active" : "side-link"
          }
        >
          <span className="icon" aria-hidden="true">🏠</span>
          <span className="sr-only">Home / Explore</span>
        </NavLink>

        {/* Create Trail */}
        <NavLink
          to="create"
          className={({ isActive }) =>
            isActive ? "side-link active" : "side-link"
          }
        >
          <span className="icon" aria-hidden="true">＋</span>
          <span className="sr-only">Create Trail</span>
        </NavLink>

        {/* Library */}
        <NavLink
          to="library"
          className={({ isActive }) =>
            isActive ? "side-link active" : "side-link"
          }
        >
          <span className="icon" aria-hidden="true">📚</span>
          <span className="sr-only">Library</span>
        </NavLink>

        {/* Settings */}
        <NavLink
          to="settings"
          className={({ isActive }) =>
            isActive ? "side-link active" : "side-link"
          }
        >
          <span className="icon" aria-hidden="true">⚙️</span>
          <span className="sr-only">Settings</span>
        </NavLink>
      </aside>

      {/* RIGHT SIDE: header + page content */}
      <div className="app-main">
        <header className="app-header">
          <h1>Cola Trails</h1>
          <p>Explore and rate walking, biking, and driving trails across USC</p>
        </header>

        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;

