import React, { useEffect, useRef, useState } from "react";
import { GoogleMap, useJsApiLoader, DirectionsRenderer } from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "600px",
  borderRadius: "12px",
  boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
};

const DEFAULT_CENTER = { lat: 33.996112, lng: -81.027428 };

function travelModeFromType(type) {
  if (type === "🚲") return "BICYCLING";
  if (type === "🚗") return "DRIVING";
  return "WALKING";
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

  const [query, setQuery] = useState("");

  const filteredRoutes = savedRoutes;

  const [selectedRouteId, setSelectedRouteId] = useState(null);
  const [loadingRouteId, setLoadingRouteId] = useState(null);

  useEffect(() => {
    return () => {
      mapRef.current = null;
      setMap(null);
    };
  }, []);

  function panToTarget(target, zoom = 14) {
    if (!mapRef.current) return;
    mapRef.current.panTo(target);
    try {
      mapRef.current.setZoom(zoom);
    } catch (e) {}
    setMapCenter(target);
  }

  function recenterToOrigin() {
    const target = originPosition || DEFAULT_CENTER;
    panToTarget(target, 14);
  }

  async function geocodeAddress(address) {
    return new Promise((resolve, reject) => {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ address }, (results, status) => {
        if (status === "OK" && results && results[0]) {
          const loc = results[0].geometry.location;
          resolve({ lat: loc.lat(), lng: loc.lng() });
        } else {
          reject(new Error(`Geocode failed: ${status}`));
        }
      });
    });
  }

  async function loadSavedRoute(route) {
    if (!isLoaded || !window.google?.maps) return;

    setLoadingRouteId(route.id);
    setSelectedRouteId(route.id);

    try {
      const originLatLng = await geocodeAddress(route.origin);
      setOriginPosition(originLatLng);

      const service = new window.google.maps.DirectionsService();
      const travelMode = travelModeFromType(route.type);

      const result = await new Promise((resolve, reject) => {
        service.route(
          {
            origin: route.origin,
            destination: route.destination,
            travelMode: window.google.maps.TravelMode[travelMode],
            provideRouteAlternatives: false,
          },
          (res, status) => {
            if (status === "OK" && res) resolve(res);
            else reject(new Error(`Directions failed: ${status}`));
          }
        );
      });

      setDirectionsResult(result);

      const leg = result?.routes?.[0]?.legs?.[0];
      const dist = leg?.distance?.text || route.distance || "";
      const dur = leg?.duration?.text || route.duration || "";
      setDistanceText(dist);
      setDurationText(dur);

      setSavedRoutes((prev) =>
        prev.map((r) =>
          r.id === route.id ? { ...r, distance: dist || r.distance, duration: dur || r.duration } : r
        )
      );

      if (mapRef.current && result?.routes?.[0]?.bounds) {
        mapRef.current.fitBounds(result.routes[0].bounds);
      } else {
        panToTarget(originLatLng, 14);
      }
    } catch (err) {
      console.error(err);
      setDirectionsResult(null);
      setDistanceText("");
      setDurationText("");
    } finally {
      setLoadingRouteId(null);
    }
  }

  function deleteSavedRoute(routeId) {
    setSavedRoutes((prev) => prev.filter((r) => r.id !== routeId));

    if (routeId === selectedRouteId) {
      setSelectedRouteId(null);
      setLoadingRouteId(null);
      setDirectionsResult(null);
      setDistanceText("");
      setDurationText("");
      setOriginPosition(null);
      setMapCenter(DEFAULT_CENTER);
    }
  }

  if (loadError)
    return (
      <div style={{ padding: 16 }}>
        Error loading Google Maps API — check console for more details.
      </div>
    );
  if (!isLoaded) return <div style={{ padding: 16 }}>Loading map...</div>;

  return (
    <div style={{ padding: "1.5rem", maxWidth: 1400, margin: "0 auto" }}>
      <h2 style={{ marginBottom: 12 }}>Library</h2>

      <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
        <div style={{ flex: "1 1 0", minWidth: 600 }}>
          <div style={{ marginBottom: 12, display: "flex", gap: 8, alignItems: "center" }}>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search saved routes by title, origin, or destination"
              style={{ flex: 1, padding: "10px 12px", borderRadius: 8, border: "1px solid #ccc" }}
            />
            <button
              onClick={() => setQuery("")}
              style={{
                padding: "8px 12px",
                borderRadius: 8,
                border: "1px solid #888",
                background: "#fff",
                cursor: "pointer",
              }}
            >
              Clear
            </button>
          </div>

          <div
            style={{
              position: "relative",
              borderRadius: 12,
              overflow: "hidden",
              boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
            }}
          >
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
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                viewBox="0 0 16 16"
                aria-hidden
              >
                <path d="M8 3a5 5 0 1 0 0 10A5 5 0 0 0 8 3zM1 8a7 7 0 1 1 14 0A7 7 0 0 1 1 8z" />
                <path d="M8 5.5a.5.5 0 0 1 .5.5v2.25l1.5.875a.5.5 0 0 1-.5.866L8 8V6a.5.5 0 0 1 .5-.5z" />
              </svg>
              <span style={{ fontSize: 13, fontWeight: 600 }}>Recenter</span>
            </button>

            {(distanceText || durationText) && (
              <div
                style={{
                  position: "absolute",
                  right: 16,
                  bottom: 16,
                  zIndex: 1000,
                  padding: "10px 12px",
                  borderRadius: 10,
                  background: "rgba(255,255,255,0.95)",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
                  fontSize: 13,
                  color: "#222",
                  maxWidth: 220,
                }}
              >
                <div style={{ fontWeight: 700, marginBottom: 4 }}>Route</div>
                {distanceText && <div>Distance: {distanceText}</div>}
                {durationText && <div>ETA: {durationText}</div>}
              </div>
            )}
          </div>
        </div>

        <aside
          style={{
            width: 360,
            maxHeight: 720,
            overflowY: "auto",
            borderRadius: 12,
            boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
            padding: 12,
            background: "#fff",
          }}
        >
          <h3 style={{ marginTop: 0 }}>Saved Routes ({filteredRoutes.length})</h3>

          {filteredRoutes.length === 0 && <div style={{ color: "#666", padding: 16 }}>No routes found.</div>}

          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {filteredRoutes.map((route) => {
              const isSelected = route.id === selectedRouteId;
              return (
                <li
                  key={route.id}
                  onClick={() => setSelectedRouteId(route.id)}
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
                    <div style={{ fontWeight: 700 }}>
                      {route.title} {route.type}
                    </div>
                    <div style={{ fontSize: 12, color: "#666" }}>
                      {route.distance || ""}
                      {route.duration ? ` • ${route.duration}` : ""}
                    </div>
                  </div>

                  <div style={{ fontSize: 13, color: "#444", marginTop: 6 }}>
                    {route.origin} → {route.destination}
                  </div>

                  <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        loadSavedRoute(route);
                      }}
                      disabled={loadingRouteId === route.id}
                      style={{
                        padding: "6px 8px",
                        borderRadius: 6,
                        border: "1px solid #888",
                        background: "#fff",
                        cursor: loadingRouteId === route.id ? "not-allowed" : "pointer",
                        opacity: loadingRouteId === route.id ? 0.7 : 1,
                      }}
                    >
                      {loadingRouteId === route.id ? "Loading..." : "Load"}
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteSavedRoute(route.id);
                      }}
                      style={{
                        padding: "6px 8px",
                        borderRadius: 6,
                        border: "1px solid #e0b0b0",
                        background: "#fff",
                        color: "#b00",
                        cursor: "pointer",
                      }}
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