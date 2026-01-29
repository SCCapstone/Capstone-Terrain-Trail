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
  if (type === "🚗") return google.maps.TravelMode.DRIVING;
  if (type === "🚲") return google.maps.TravelMode.BICYCLING;
  if (type === "🛴" || type === "🛹") return google.maps.TravelMode.BICYCLING;
  return google.maps.TravelMode.WALKING; // 👣 🏃 ♿
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




// put this above calculateRoute (with your other helpers)
function calculateCustomDurationFromWalking(walkingSeconds, multiplier) {
  if (!walkingSeconds || !multiplier) return "";
  // walkingSeconds is seconds as returned by Google (leg.duration.value)
  const runningSeconds = walkingSeconds / multiplier; // multiplier=2 => running = half time
  const minutes = Math.round(runningSeconds / 60);
  return `${minutes} min`;
}

async function calculateRoute(typeArg) {
  const originVal = originInputRef.current?.value?.trim();
  const destVal = destInputRef.current?.value?.trim();
  if (!originVal || !destVal) return;

  const usedType = typeArg || routeType;
  const travelMode = travelModeFromType(usedType);

  try {
    const directionsService = new google.maps.DirectionsService();

    const request = {
      origin: originVal,
      destination: destVal,
      travelMode,
    };

    const result = await directionsService.route(request);

    setDirectionsResult(result);

    const leg = result.routes[0].legs[0];
    setDistanceText(leg.distance.text);

    // 🚗 Driving → Google ETA
    if (travelMode === google.maps.TravelMode.DRIVING) {
      setDurationText(leg.duration.text);
    }

    // 🚲 Biking OR 👣 Walking → Google ETA
    else if (usedType === "🚲" || usedType === "👣") {
      setDurationText(leg.duration.text);
    }

    // 🏃 Running → DOUBLE walking speed
    else if (usedType === "🏃") {
      setDurationText(
        calculateCustomDurationFromWalking(
          leg.duration.value,
          2.0
        )
      );
    }

    // ♿ Wheelchair → slower than walking
    else if (usedType === "♿") {
      setDurationText(
        calculateCustomDurationFromWalking(
          leg.duration.value,
          0.8
        )
      );
    }

    // 🛴 🛹 → estimated faster than walking
    // might need to fix time/speed later
    else {
      setDurationText(
        calculateCustomDurationFromWalking(
          leg.duration.value,
          1.0
        )
      );
    }
  } catch (err) {
    console.error("calculateRoute error:", err);
    alert("Could not calculate route. See console for details.");
  }
}


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

 // Replace the old calculateRoute function with this exact function
// inside the CreateTrail component (where your old one currently is).



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

        {/* === transport icon toolbar (replace your select) === */}
<div style={{ display: "flex", alignItems: "center", gap: 8 }}>
  {[
    { key: "👣", label: "Walking" },
    { key: "🚲", label: "Biking" },
    { key: "🚗", label: "Driving" },
    { key: "🛹", label: "Skateboarding" },
    { key: "🏃", label: "Running" },
    { key: "🛴", label: "Scootering" },
    { key: "♿", label: "Wheelchair" },
  ].map((opt) => {
    const selected = routeType === opt.key;
    return (
      <button
        key={opt.key}
        title={opt.label}
        onClick={async () => {
  setRouteType(opt.key);
  const originVal = originInputRef.current?.value?.trim();
  const destVal = destInputRef.current?.value?.trim();
  if (originVal && destVal) {
    try {
      // pass opt.key so calculateRoute uses the new selection immediately
      await calculateRoute(opt.key);
    } catch (e) { /* calculateRoute handles errors */ }
  }
}}
        style={{
          fontSize: 18,
          padding: "6px 10px",
          borderRadius: 6,
          border: selected ? "2px solid #0b63d6" : "1px solid #ddd",
          background: selected ? "#e8f0ff" : "white",
          cursor: "pointer",
          lineHeight: 1,
        }}
        aria-pressed={selected}
      >
        {opt.key}
      </button>
    );
  })}
</div>

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