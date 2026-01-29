// npm install @react-google-maps/api
/* global google */

/* global google */
import React, { useEffect, useRef, useState } from "react";
import { GoogleMap, useJsApiLoader, DirectionsRenderer } from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "600px",
};

const DEFAULT_CENTER = { lat: 33.996112, lng: -81.027428 };
const LOCAL_STORAGE_KEY = "savedRoutes_v1";

function travelModeFromType(type) {
  if (type === "🚲") return google.maps.TravelMode.BICYCLING;
  if (type === "🚗") return google.maps.TravelMode.DRIVING;
  return google.maps.TravelMode.WALKING;
}

export default function CreateTrail() {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries: ["places", "maps"],
  });

  const mapRef = useRef(null);
  const originInputRef = useRef(null);
  const destInputRef = useRef(null);
  const originAutocompleteRef = useRef(null);
  const destAutocompleteRef = useRef(null);

  const [map, setMap] = useState(null);
  const [mapCenter, setMapCenter] = useState(DEFAULT_CENTER);

  const [directionsResult, setDirectionsResult] = useState(null);
  const [distanceText, setDistanceText] = useState("");
  const [durationText, setDurationText] = useState("");
  const [originPosition, setOriginPosition] = useState(null);

  const [routeTitle, setRouteTitle] = useState("");
  const [routeType, setRouteType] = useState("👣"); // 👣 🚲 🚗
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isLoaded) return;

    if (originInputRef.current && !originAutocompleteRef.current) {
      originAutocompleteRef.current = new google.maps.places.Autocomplete(
        originInputRef.current,
        { fields: ["formatted_address", "geometry"] }
      );
      originAutocompleteRef.current.addListener("place_changed", () => {
        const place = originAutocompleteRef.current.getPlace();
        if (place?.geometry?.location) {
          const loc = place.geometry.location;
          setOriginPosition({ lat: loc.lat(), lng: loc.lng() });
        }
      });
    }

    if (destInputRef.current && !destAutocompleteRef.current) {
      destAutocompleteRef.current = new google.maps.places.Autocomplete(
        destInputRef.current,
        { fields: ["formatted_address"] }
      );
    }
  }, [isLoaded]);

  async function calculateRoute() {
    const originVal = originInputRef.current?.value?.trim();
    const destVal = destInputRef.current?.value?.trim();

    if (!originVal || !destVal) {
      alert("Please enter both origin and destination.");
      return;
    }

    try {
      const directionsService = new google.maps.DirectionsService();

      const result = await directionsService.route({
        origin: originVal,
        destination: destVal,
        travelMode: travelModeFromType(routeType),
      });

      setDirectionsResult(result);

      const leg = result.routes[0].legs[0];
      setDistanceText(leg.distance?.text || "");
      setDurationText(leg.duration?.text || "");

      const originLoc = leg.start_location;
      const lat = originLoc.lat();
      const lng = originLoc.lng();

      setOriginPosition({ lat, lng });
      setMapCenter({ lat, lng });

      map?.fitBounds(result.routes[0].bounds);
    } catch (err) {
      console.error("Directions error:", err);
      alert("Could not calculate route for this travel mode.");
    }
  }

  function clearRoute() {
    setDirectionsResult(null);
    setDistanceText("");
    setDurationText("");
    if (originInputRef.current) originInputRef.current.value = "";
    if (destInputRef.current) destInputRef.current.value = "";
    setOriginPosition(null);
    map?.panTo(DEFAULT_CENTER);
    map?.setZoom(14);
  }

  function recenterToOrigin() {
    const target = originPosition || DEFAULT_CENTER;
    if (!map) return;
    map.panTo(target);
    map.setZoom(14);
  }

  function saveRouteToLibrary() {
    const originVal = originInputRef.current?.value?.trim();
    const destVal = destInputRef.current?.value?.trim();
    if (!originVal || !destVal) {
      alert("Please calculate a route before saving.");
      return;
    }

    const title =
      routeTitle.trim() || `${originVal} → ${destVal}`;

    const newRoute = {
      id: `r_${Date.now()}`,
      title,
      origin: originVal,
      destination: destVal,
      distance: distanceText,
      duration: durationText,
      type: routeType,
    };

    setSaving(true);
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
      const routes = raw ? JSON.parse(raw) : [];
      routes.unshift(newRoute);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(routes));
      alert("Route saved to library!");
      setRouteTitle("");
    } catch (e) {
      console.error("Save failed", e);
    } finally {
      setSaving(false);
    }
  }

  if (loadError) return <div>Error loading Google Maps</div>;
  if (!isLoaded) return <div>Loading map...</div>;

  return (
    <div style={{ padding: "1.5rem", maxWidth: 1200, margin: "0 auto" }}>
      <h2>Create Trail</h2>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
        <input
          ref={originInputRef}
          placeholder="Origin"
          style={{ padding: 8, minWidth: 240 }}
        />
        <input
          ref={destInputRef}
          placeholder="Destination"
          style={{ padding: 8, minWidth: 240 }}
        />

        <select
          value={routeType}
          onChange={(e) => setRouteType(e.target.value)}
          style={{ padding: 8 }}
        >
          <option value="👣">Walking</option>
          <option value="🚲">Biking</option>
          <option value="🚗">Driving</option>
        </select>

        <button onClick={calculateRoute}>Calculate Route</button>
        <button onClick={clearRoute}>Clear</button>
      </div>

      <div style={{ marginBottom: 12 }}>
        <strong>Distance:</strong> {distanceText || "—"} &nbsp;
        <strong>ETA:</strong> {durationText || "—"}
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <input
          placeholder="Route title (optional)"
          value={routeTitle}
          onChange={(e) => setRouteTitle(e.target.value)}
          style={{ padding: 8, minWidth: 260 }}
        />
        <button onClick={saveRouteToLibrary} disabled={saving}>
          {saving ? "Saving..." : "Save to Library"}
        </button>
      </div>

      <div style={{ position: "relative" }}>
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={mapCenter}
          zoom={14}
          onLoad={setMap}
        >
          {directionsResult && (
            <DirectionsRenderer directions={directionsResult} />
          )}
        </GoogleMap>

        <button
          onClick={recenterToOrigin}
          style={{
            position: "absolute",
            bottom: 16,
            left: 16,
            padding: 8,
          }}
        >
          Recenter
        </button>
      </div>
    </div>
  );
}