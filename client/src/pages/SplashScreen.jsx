import React from "react";
import { Link } from "react-router-dom";
import "./SplashScreen.css";
import horseshoeImage from "./horseshoe_now.jpg";

function SplashScreen() {
  return (
    <div className="splash-page">
      <div className="splash-overlay">
        <div className="splash-card">
          <div className="splash-left">
            <p className="splash-tag">Welcome to Terrain Trail</p>

            <h1 className="splash-title">
              Discover trails that match your route, terrain, and style.
            </h1>

            <p className="splash-description">
              Terrain Trail helps users explore, create, save, and review trails
              around campus. Find routes based on terrain and accessibility,
              share public trails with others, and keep your favorite paths all
              in one place.
            </p>

            <div className="splash-button-group">
              <Link to="/login" className="splash-button splash-button-primary">
                Log In
              </Link>

              <Link
                to="/signup"
                className="splash-button splash-button-secondary"
              >
                Sign Up
              </Link>
            </div>

            <Link to="/app/explore" className="splash-guest-link">
              Continue as Guest
            </Link>
          </div>

          <div className="splash-right">
            <img
              src={horseshoeImage}
              alt="The Horseshoe at USC"
              className="splash-image"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default SplashScreen;