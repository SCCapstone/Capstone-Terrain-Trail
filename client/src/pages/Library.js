import React, { useRef, useState } from "react";
import { GoogleMap, useJsApiLoader, DirectionsRenderer } from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "600px",
  borderRadius: "12px",
  boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
};

const DEFAULT_CENTER = { lat: 33.996112, lng: -81.027428 }; // University of South Carolina

export default function Library() {
  // load the Maps JS API and the places library (kept for consistency)
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries: ["places"],
  });

  const mapRef = useRef(null);

  const [mapCenter, setMapCenter] = useState(DEFAULT_CENTER);
  const [map, setMap] = useState(null);

  const [directionsResult, setDirectionsResult] = useState(null);
  
  // originPosition kept (recenter will fall back to DEFAULT_CENTER when null)
  const [originPosition, setOriginPosition] = useState(null);

  function recenterToOrigin() {
    const target = originPosition || DEFAULT_CENTER;
    if (!mapRef.current && !map) return;
    const targetRef = mapRef.current || map;
    if (typeof targetRef.panTo === "function") targetRef.panTo(target);
    try {
      if (typeof targetRef.setZoom === "function") targetRef.setZoom(14);
    } catch (e) {}
    setMapCenter(target);
  }

  if (loadError) return <div style={{ padding: 16 }}>Error loading Google Maps API — check console for more details.</div>;
  if (!isLoaded) return <div style={{ padding: 16 }}>Loading map...</div>;

return (
  <div style={{ padding: "1.5rem", maxWidth: 1400, margin: "0 auto" }}>
    <h2 style={{ marginBottom: 12 }}>Saved Routes</h2>

    {/* Two-column layout: map on the left, sidebar on the right */}
    <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
      {/* LEFT: map column */}
      <div style={{ flex: "1 1 0", minWidth: 600 }}>
        {/* distance/duration above the map */}
        <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap", alignItems: "center" }}>
         
        </div>

        <div style={{ position: "relative", borderRadius: 12, overflow: "hidden", boxShadow: "0 6px 20px rgba(0,0,0,0.08)" }}>
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={mapCenter}
            zoom={14}
            onLoad={(m) => {
              setMap(m);
              mapRef.current = m;
            }}
            onUnmount={() => {
              mapRef.current = null;
              setMap(null);
            }}
            options={{
              fullscreenControl: false,
              streetViewControl: false,
              mapTypeControl: false,
              clickableIcons: false,
            }}
          >
            {directionsResult && <DirectionsRenderer directions={directionsResult} />}
          </GoogleMap>

          {/* Recenter button in bottom-left of map */}
          <button
            onClick={recenterToOrigin}
            aria-label="Recenter to origin"
            title="Recenter to origin"
            style={{
              position: "absolute",
              left: 16,
              bottom: 16,
              zIndex: 1000,
              padding: "10px 12px",
              borderRadius: 8,
              border: "none",
              boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
              background: "#fff",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" aria-hidden>
              <path d="M8 3a5 5 0 1 0 0 10A5 5 0 0 0 8 3zM1 8a7 7 0 1 1 14 0A7 7 0 0 1 1 8z"/>
              <path d="M8 5.5a.5.5 0 0 1 .5.5v2.25l1.5.875a.5.5 0 0 1-.5.866L8 8V6a.5.5 0 0 1 .5-.5z"/>
            </svg>
            <span style={{ fontSize: 13, fontWeight: 600 }}>Recenter</span>
          </button>
        </div>
      </div>

      {/* RIGHT: sidebar (saved routes / list) */}
      <aside style={{ width: 360, maxHeight: 720, overflowY: "auto", borderRadius: 12, boxShadow: "0 6px 20px rgba(0,0,0,0.06)", padding: 12, background: "#fff", marginTop: 11, }}>
        <h3 style={{ marginTop: 0 }}>Saved Routes</h3>
        {/* Placeholder content: replace with actual list */}
        <div style={{ color: "#666", padding: 8 }}>No saved routes yet.</div>
      </aside>
    </div>
  </div>
);

}
