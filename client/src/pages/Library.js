// client/src/pages/Library.js
import React, { useEffect, useMemo, useRef, useState } from "react";
import { GoogleMap, useJsApiLoader, DirectionsRenderer } from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "600px",
  borderRadius: "12px",
  boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
};

const DEFAULT_CENTER = { lat: 33.996112, lng: -81.027428 }; // University of South Carolina

export default function Library() {
  // load the Maps JS API and the places library for autocomplete
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries: ["places", "maps"], // ensure consistent options across app
  });

  // map refs/state
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [mapCenter, setMapCenter] = useState(DEFAULT_CENTER);

  // directions + meta
  const [directionsResult, setDirectionsResult] = useState(null);
  const [distanceText, setDistanceText] = useState("");
  const [durationText, setDurationText] = useState("");
  const [originPosition, setOriginPosition] = useState(null);

  const [savedRoutes, setSavedRoutes] = useState([
    {
      id: "r1",
      title: "Swearingen to LeConte",
      origin: "301 Main St, Columbia, SC 29208",
      destination: "1523 Greene St, Columbia, SC 29225",
      distance: ".8 mi",
      duration: "19 mins",
      type: "👣",
   
    },
    {
      id: "r2",
      title: "Swearingen to LeConte",
      origin: "301 Main St, Columbia, SC 29208",
      destination: "1523 Greene St, Columbia, SC 29225",
      distance: ".7 mi",
      duration: "7 mins",
      type: "🚲",

    },

  ]);

  // search query for saved routes
  const [query, setQuery] = useState("");

  // which route is selected / loading state
  const [selectedRouteId, setSelectedRouteId] = useState(null);
  const [loadingRouteId, setLoadingRouteId] = useState(null);

  // filter saved routes by the search query (title / origin / destination)
  const filteredRoutes = useMemo(() => {
    const q = (query || "").trim().toLowerCase();
    if (!q) return savedRoutes;
    return savedRoutes.filter((r) => {
      return (
        (r.title || "").toLowerCase().includes(q) ||
        (r.origin || "").toLowerCase().includes(q) ||
        (r.destination || "").toLowerCase().includes(q)
      );
    });
  }, [query, savedRoutes]);

  // map load/unload
  useEffect(() => {
    return () => {
      // cleanup on unmount
      mapRef.current = null;
      setMap(null);
    };
  }, []);

  // helper to pan map
  function panToTarget(target, zoom = 14) {
    if (!mapRef.current) return;
    mapRef.current.panTo(target);
    try { mapRef.current.setZoom(zoom); } catch (e) {}
    setMapCenter(target);
  }

  // load a saved route: if cached directions exist, use them; otherwise (if origin/destination present) calculate directions
  async function loadSavedRoute(route) {
    if (!route) return;
    setLoadingRouteId(route.id);
    try {
      if (route.directions) {
        // use cached directions object
        setDirectionsResult(route.directions);
        const leg = route.directions.routes?.[0]?.legs?.[0];
        setDistanceText(leg?.distance?.text || "");
        setDurationText(leg?.duration?.text || "");
        if (leg && leg.start_location) {
          panToTarget({ lat: leg.start_location.lat(), lng: leg.start_location.lng() }, 14);
        }
      } else if (route.origin && route.destination) {
        // calculate directions on the fly but do not re-save
        if (typeof window.google === "undefined") {
          alert("Google API not available");
          return;
        }
        const directionsService = new window.google.maps.DirectionsService();
        const results = await directionsService.route({
          origin: route.origin,
          destination: route.destination,
          travelMode: window.google.maps.TravelMode.DRIVING,
        });
        setDirectionsResult(results);
        const leg = results.routes?.[0]?.legs?.[0];
        setDistanceText(leg?.distance?.text || "");
        setDurationText(leg?.duration?.text || "");
        if (leg && leg.start_location) {
          panToTarget({ lat: leg.start_location.lat(), lng: leg.start_location.lng() }, 14);
        }
      }
      setSelectedRouteId(route.id);
    } catch (err) {
      console.error("Failed to load saved route:", err);
      alert("Failed to load route. See console for details.");
    } finally {
      setLoadingRouteId(null);
    }
  }

  // delete a saved route
  function deleteSavedRoute(routeId) {
    if (!window.confirm("Delete this saved route?")) return;
    setSavedRoutes((prev) => prev.filter((r) => r.id !== routeId));
    if (selectedRouteId === routeId) {
      setSelectedRouteId(null);
      setDirectionsResult(null);
    }
  }

  // recenter button
  function recenterToOrigin() {
    const target = originPosition || DEFAULT_CENTER;
    panToTarget(target, 14);
  }

  if (loadError) return <div style={{ padding: 16 }}>Error loading Google Maps API — check console for more details.</div>;
  if (!isLoaded) return <div style={{ padding: 16 }}>Loading map...</div>;

  return (
    <div style={{ padding: "1.5rem", maxWidth: 1400, margin: "0 auto" }}>
      <h2 style={{ marginBottom: 12 }}>Library</h2>

      <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
        {/* LEFT: map column */}
        <div style={{ flex: "1 1 0", minWidth: 600 }}>
          {/* Search bar above the map to filter saved routes */}
          <div style={{ marginBottom: 12, display: "flex", gap: 8, alignItems: "center" }}>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search saved routes by title, origin, or destination..."
              style={{ flex: 1, padding: "10px 12px", borderRadius: 8, border: "1px solid #ccc" }}
            />
            <button onClick={() => setQuery("")} style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #888", background: "#fff", cursor: "pointer" }}>
              Clear
            </button>
          </div>

          {/* Distance/Duration display */}
          <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap", alignItems: "center" }}>
            <div style={{ marginLeft: "auto", display: "flex", gap: 12, alignItems: "center" }}>
              <div style={{ fontSize: 14 }}><strong>Distance:</strong> {distanceText || "—"}</div>
              <div style={{ fontSize: 14 }}><strong>Duration:</strong> {durationText || "—"}</div>
            </div>
          </div>

          {/* Map */}
          <div style={{ position: "relative", borderRadius: 12, overflow: "hidden", boxShadow: "0 6px 20px rgba(0,0,0,0.06)" }}>
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

            {/* Recenter button */}
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

        {/* RIGHT: saved routes list (scrollable) */}
        <aside style={{ width: 360, maxHeight: 720, overflowY: "auto", borderRadius: 12, boxShadow: "0 6px 20px rgba(0,0,0,0.06)", padding: 12, background: "#fff" }}>
          <h3 style={{ marginTop: 0 }}>Saved Routes ({filteredRoutes.length})</h3>

          {filteredRoutes.length === 0 && <div style={{ color: "#666", padding: 16 }}>No routes found.</div>}

          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {filteredRoutes.map((route) => {
              const isSelected = route.id === selectedRouteId;
              return (
                <li
                  key={route.id}
                  onClick={() => loadSavedRoute(route)}
                  style={{
                    padding: 12,
                    borderRadius: 8,
                    marginBottom: 10,
                    cursor: "pointer",
                    border: "1px solid #eee",
                    background: isSelected ? "#f5f7fa" : "#fff",
                    transition: "background 120ms ease",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ fontWeight: 700 }}>{route.title} {route.type}</div>
                    <div style={{ fontSize: 12, color: "#666" }}>{route.distance || ""}</div>
                  </div>

                  <div style={{ fontSize: 13, color: "#444", marginTop: 6 }}>{route.origin} → {route.destination}</div>

                  <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
                    <button
                      onClick={(e) => { e.stopPropagation(); loadSavedRoute(route); }}
                      style={{ padding: "6px 8px", borderRadius: 6, border: "1px solid #888", background: "#fff", cursor: "pointer" }}
                    >
                      {loadingRouteId === route.id ? "Loading..." : "Load"}
                    </button>

                    <button
                      onClick={(e) => { e.stopPropagation(); deleteSavedRoute(route.id); }}
                      style={{ padding: "6px 8px", borderRadius: 6, border: "1px solid #e0b0b0", background: "#fff", color: "#b00", cursor: "pointer" }}
                    >
                      Delete
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </aside>
      </div>
    </div>
  );
}
