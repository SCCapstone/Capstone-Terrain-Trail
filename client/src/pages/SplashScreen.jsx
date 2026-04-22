import React from "react";
import { Link } from "react-router-dom";
import "./SplashScreen.css";
import horseshoeImage from "./horseshoe_now.jpg";

function SplashScreen() {
  return (
    <div className="splash-page">
      <header className="app-header splash-header">
        <img
          src="/img/colaCan.png"
          alt="Cola Trails logo"
          className="splash-logo"
        />

        <div className="splash-header-inner">
          <h1>Cola Trails</h1>
          <p>Explore, record, review, and share trails around USC</p>
        </div>
      </header>

      <main className="splash-main">
        <div className="splash-card">
          <div className="splash-left">
            <p className="splash-tag">Built for getting around USC</p>

            <h2 className="splash-title">
              Find the best way around campus.
            </h2>

            <p className="splash-description">
              Cola Trails helps students discover, create, save, and share
              routes around USC. Explore public trails, compare terrain and
              accessibility, and read reviews to choose the path that fits your
              needs best.
            </p>

            <div className="splash-feature-list">
              <div className="splash-feature-pill">Explore public trails</div>
              <div className="splash-feature-pill">Create your own routes</div>
              <div className="splash-feature-pill">Save and review favorites</div>
            </div>

            <div className="splash-button-group">
              <Link to="/login" className="splash-button splash-button-primary">
                Log In
              </Link>

              <Link
                to="/signup"
                className="splash-button splash-button-secondary"
              >
                Create Account
              </Link>
            </div>
          </div>

          <div className="splash-right">
            <img
              src={horseshoeImage}
              alt="The Horseshoe at USC"
              className="splash-image"
            />
          </div>
        </div>
      </main>
    </div>
  );
}

export default SplashScreen;