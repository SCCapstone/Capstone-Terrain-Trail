import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { NavLink } from "react-router-dom";

import Layout from "./components/Layout";
import CreateTrail from "./pages/CreateTrail";
import Explore from "./pages/Explore";
import Settings from "./pages/Settings";
import Library from "./pages/Library";
import SignUp from "./pages/SignUp";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SignUp />} />
        <Route path="/app" element={<Layout />}>
          <Route path="create" element={<CreateTrail />} />
          <Route path="explore" element={<Explore />} />
          <Route path="settings" element={<Settings />} />
          <Route path="library" element={<Library />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;