
import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import "./Layout.css"; 

export default function Layout() {
  return (
    <>
      <header className="app-header">
        <h1>Cola Trails</h1>
        <p>Explore and rate walking, biking, and driving trails across USC</p>
      </header>

      <nav className="main-nav">
        <NavLink to="/create" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>Create Trail</NavLink>
        <NavLink to="/explore" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>Explore</NavLink>
        <NavLink to="/library" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>Library</NavLink>
        <NavLink to="/settings" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>Settings</NavLink>
      </nav>

      <main style={{ paddingLeft: "20%" }}>
        <Outlet /> {}
      </main>
    </>
  );
}
