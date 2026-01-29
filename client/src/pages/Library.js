/* global google */
import React, { useEffect, useRef, useState } from "react";
import { GoogleMap, useJsApiLoader, DirectionsRenderer } from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "600px",
};

const DEFAULT_CENTER = { lat: 33.996112, lng: -81.027428 };
const LOCAL_STORAGE_KEY = "savedRoutes_v1";

const FALLBACK_ROUTES = [
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
];

function travelModeFromType(type) {
  if (type === "🚲") return google.maps.TravelMode.BICYCLING;
  if (type === "🚗") return google.maps.TravelMode.DRIVING;
  return google.maps.TravelMode.WALKING;
}

export default function Library() {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries: ["places", "maps"],
  });

  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [mapCenter, setMapCenter] = useState(DEFAULT_CENTER);

  const [directionsResult, setDirectionsResult] = useState(null);
  const [distanceText, setDistanceText] = useState("");
  const [durationText, setDurationText] = useState("");
  const [originPosition, setOriginPosition] = useState(null);

  const [selectedRouteId, setSelectedRouteId] = useState(null);
  const [loadingRouteId, setLoadingRouteId] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");

  const [savedRoutes, setSavedRoutes] = useState(() => {
    try {
      const raw = window.localStorage.getItem(LOCAL_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length) return parsed;
      }
    } catch (e) {
      console.warn("Failed to load saved routes", e);
    }
    return FALLBACK_ROUTES;
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(
        LOCAL_STORAGE_KEY,
        JSON.stringify(savedRoutes)
      );
    } catch (e) {
      console.warn("Failed to save routes", e);
    }
  }, [savedRoutes]);

  const filteredRoutes = savedRoutes.filter((route) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      route.title.toLowerCase().includes(q) ||
      route.origin.toLowerCase().includes(q) ||
      route.destination.toLowerCase().includes(q)
    );
  });

  async function loadRoute(route) {
    if (!isLoaded || !google?.maps) return;

    setLoadingRouteId(route.id);
    setSelectedRouteId(route.id);

    try {
      const service = new google.maps.DirectionsService();

      const result = await service.route({
        origin: route.origin,
        destination: route.destination,
        travelMode: travelModeFromType(route.type),
      });

      setDirectionsResult(result);

      const leg = result.routes[0].legs[0];
      setDistanceText(leg.distance?.text || route.distance || "");
      setDurationText(leg.duration?.text || route.duration || "");

      const originLoc = leg.start_location;
      const lat = originLoc.lat();
      const lng = originLoc.lng();
      setOriginPosition({ lat, lng });
      setMapCenter({ lat, lng });

      map?.fitBounds(result.routes[0].bounds);
    } catch (err) {
      console.error("Failed to load route:", err);
      alert("Could not load route.");
    } finally {
      setLoadingRouteId(null);
    }
  }

  function recenterToOrigin() {
    const target = originPosition || DEFAULT_CENTER;
    if (!map) return;
    map.panTo(target);
    map.setZoom(14);
  }

  if (loadError) return <div>Error loading Google Maps</div>;
  if (!isLoaded) return <div>Loading map...</div>;

  return (
    <div style={{ padding: "1.5rem", maxWidth: 1200, margin: "0 auto" }}>
      <h2>Library</h2>

      {/* SEARCH BAR */}
      <input
        type="text"
        placeholder="Search saved routes..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        style={{
          width: "100%",
          padding: "10px 12px",
          marginBottom: 16,
          borderRadius: 8,
          border: "1px solid #ccc",
          fontSize: 14,
        }}
      />

      <div style={{ display: "flex", gap: 16 }}>
        {/* MAP */}
        <div style={{ flex: 1 }}>
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={mapCenter}
            zoom={14}
            onLoad={(m) => {
              setMap(m);
              mapRef.current = m;
            }}
            options={{
              fullscreenControl: false,
              streetViewControl: false,
              mapTypeControl: false,
            }}
          >
            {directionsResult && (
              <DirectionsRenderer directions={directionsResult} />
            )}
          </GoogleMap>

          {(distanceText || durationText) && (
            <div style={{ marginTop: 8 }}>
              <strong>Distance:</strong> {distanceText} &nbsp;
              <strong>ETA:</strong> {durationText}
            </div>
          )}

          <button onClick={recenterToOrigin} style={{ marginTop: 8 }}>
            Recenter
          </button>
        </div>

        {/* ROUTE LIST */}
        <aside
          style={{
            width: 340,
            border: "1px solid #ddd",
            borderRadius: 8,
            padding: 12,
            maxHeight: 600,
            overflowY: "auto",
          }}
        >
          <h3>Saved Routes ({filteredRoutes.length})</h3>

          {filteredRoutes.length === 0 && (
            <div style={{ color: "#666", fontSize: 14 }}>
              No routes match your search.
            </div>
          )}

          {filteredRoutes.map((route) => (
            <div
              key={route.id}
              style={{
                padding: 10,
                marginBottom: 10,
                border: "1px solid #eee",
                borderRadius: 6,
                background:
                  route.id === selectedRouteId ? "#f5f7fa" : "#fff",
              }}
            >
              <div style={{ fontWeight: 700 }}>
                {route.title} {route.type}
              </div>
              <div style={{ fontSize: 13 }}>
                {route.origin} → {route.destination}
              </div>
              <div style={{ fontSize: 12, color: "#666", marginTop: 4 }}>
                {route.distance} {route.duration && `• ${route.duration}`}
              </div>

              <button
                onClick={() => loadRoute(route)}
                disabled={loadingRouteId === route.id}
                style={{ marginTop: 6 }}
              >
                {loadingRouteId === route.id ? "Loading..." : "Load"}
              </button>
            </div>
          ))}
        </aside>
      </div>
    </div>
  );
}