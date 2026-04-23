import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { ThemeProvider } from "./theme/ThemeContext";
import Layout from "./components/Layout";
import MapProvider from "./components/MapProvider";
import CreateTrail from "./pages/CreateTrail";
import Explore from "./pages/Explore";
import Settings from "./pages/Settings";
import Library from "./pages/Library";
import SignUp from "./pages/SignUp";
import Login from "./pages/Login";
import CompletedTrail from "./pages/CompletedTrail";
import SplashScreen from "./pages/SplashScreen";
import { SnackbarProvider } from "./components/Snackbar";

const ProtectedRoute = () => {
  const token = localStorage.getItem("token");
  const isAuthenticated = !!token; 

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

function App() {
  return (
    <ThemeProvider>
      <SnackbarProvider>
        <Router>
          <Routes>
            {/* --- Public Routes --- */}
            <Route path="/" element={<SplashScreen />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/login" element={<Login />} />

            {/* --- Protected Routes --- */}
            {/* Everything inside this group requires the user to be logged in */}
            <Route element={<ProtectedRoute />}>
              <Route path="/app" element={<Layout />}>
                <Route element={<MapProvider />}>
                  <Route index element={<Explore />} />
                  <Route path="create" element={<CreateTrail />} />
                  <Route path="explore" element={<Explore />} />
                  <Route path="library" element={<Library />} />
                  <Route path="completed/:id" element={<CompletedTrail />} />
                </Route>
                <Route path="settings" element={<Settings />} />
              </Route>
            </Route>

            {/* Catch-all for 404s */}
            <Route path="*" element={<div>Page not found</div>} />
          </Routes>
        </Router>
      </SnackbarProvider>
    </ThemeProvider>
  );
}

export default App;