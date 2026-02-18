// src/pages/Explore.js
import React, { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleMap, useJsApiLoader } from "@react-google-maps/api";

// Map container style
const mapContainerStyle = {
  width: "100%",
  height: "450px",
};

// Default center (Columbia, SC) — adjust if you prefer
const DEFAULT_CENTER = { lat: 34.0007, lng: -81.0348 };

// localStorage key used by CreateTrail / CompletedTrail
const LOCAL_STORAGE_KEY = "savedRoutes_v1";

/* Helper to read saved routes (shared single source of truth) */
function readSavedRoutesFromStorage() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("readSavedRoutesFromStorage error", e);
    return [];
  }
}

export default function Explore() {
  const navigate = useNavigate();

  // Google Maps loader (uses REACT_APP_GOOGLE_MAPS_API_KEY)
  const { isLoaded } = useJsApiLoader({
  googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || "",
  libraries: ["places", "maps"],
  version: "weekly",
});


  const [mapRef, setMapRef] = useState(null);
  const mapRefInternal = useRef(null);

  const onMapLoad = useCallback((map) => {
    mapRefInternal.current = map;
    setMapRef(map);
  }, []);

  // Public routes state
  const [publicRoutes, setPublicRoutes] = useState([]);
  const [loadingPublic, setLoadingPublic] = useState(true);

  // Load public routes from localStorage
  const loadPublicRoutes = useCallback(() => {
    try {
      const all = readSavedRoutesFromStorage();
      const pubs = all.filter((r) => Boolean(r.public));
      setPublicRoutes(pubs);
    } catch (e) {
      console.error("loadPublicRoutes error", e);
      setPublicRoutes([]);
    } finally {
      setLoadingPublic(false);
    }
  }, []);

  // load once and on storage changes (other tabs)
  useEffect(() => {
    loadPublicRoutes();
    function onStorage() {
      loadPublicRoutes();
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [loadPublicRoutes]);

  // helper: open completed detail in-app
  function openCompleted(id) {
    navigate(`/app/completed/${id}`);
  }

  // helper: copy link to clipboard
  function copyCompletedLink(id) {
    const link = `${window.location.origin}/app/completed/${id}`;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(link)
        .then(() => window.alert("Link copied"))
        .catch(() => window.alert("Copy failed"));
    } else {
      // fallback
      window.prompt("Copy this link:", link);
    }
  }

  return (
    <div style={{ padding: 20, maxWidth: 1200, margin: "0 auto" }}>
      <h1 style={{ marginTop: 0 }}>Explore — Public Trails</h1>

      <section style={{ marginBottom: 18 }}>
        <div style={{ border: "1px solid #e6e6e6", borderRadius: 8, overflow: "hidden" }}>
          {isLoaded ? (
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={DEFAULT_CENTER}
              zoom={13}
              onLoad={onMapLoad}
            />
          ) : (
            <div style={{ width: "100%", height: 450, display: "flex", alignItems: "center", justifyContent: "center" }}>
              Loading map…
            </div>
          )}
        </div>
        <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
          <button
            onClick={() => {
              // recenter
              if (mapRefInternal.current) {
                mapRefInternal.current.panTo(DEFAULT_CENTER);
                mapRefInternal.current.setZoom(13);
              }
            }}
          >
            Recenter
          </button>
          <button onClick={() => { loadPublicRoutes(); }}>Refresh public list</button>
        </div>
      </section>

      <section>
        <h2 style={{ marginBottom: 12 }}>Public Trails</h2>

        {loadingPublic ? (
          <div>Loading public trails…</div>
        ) : publicRoutes.length === 0 ? (
          <div>No public trails yet. When users mark a route public it will appear here.</div>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {publicRoutes.map((r) => (
              <div key={r.id} style={{ border: "1px solid #eee", padding: 12, borderRadius: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                  <div style={{ minWidth: 0 }}>
                    <strong style={{ display: "block", fontSize: 16 }}>
                      {r.title || `${r.origin} → ${r.destination}`}
                    </strong>
                    <div style={{ fontSize: 13, color: "#555", marginTop: 6 }}>
                      {r.origin} → {r.destination}
                      <span style={{ marginLeft: 8 }}>• {r.distance || "—"}</span>
                      <span style={{ marginLeft: 8 }}>• ETA: {r.duration || "—"}</span>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                    <button onClick={() => openCompleted(r.id)}>View</button>
                    <button onClick={() => copyCompletedLink(r.id)}>Copy link</button>
                  </div>
                </div>

                {r.review && (
                  <div style={{ marginTop: 10, fontSize: 14 }}>
                    <div><strong>Rating:</strong> {r.review.stars}/5</div>
                    <div><strong>Terrain:</strong> {r.review.terrain}/10</div>
                    {r.review.comment && <div style={{ marginTop: 8 }}>{r.review.comment}</div>}
                    <div style={{ marginTop: 8, color: "#777", fontSize: 12 }}>
                      Updated: {new Date(r.review.updatedAt || r.updatedAt || r.createdAt).toLocaleString()}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
