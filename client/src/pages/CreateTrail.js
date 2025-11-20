// npm install @react-google-maps/api
/* global google */

import React, { useEffect, useRef, useState } from "react";
import { GoogleMap, useJsApiLoader, DirectionsRenderer } from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "600px",
  borderRadius: "12px",
  boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
};

const DEFAULT_CENTER = { lat: 33.996112, lng: -81.027428 }; // University of South Carolina

export default function CreateTrail() {
  // load the Maps JS API and the places library for autocomplete
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries: ["places", "maps"],
  });

  const mapRef = useRef(null);
  const originInputRef = useRef(null);
  const destInputRef = useRef(null);
  const originAutocompleteRef = useRef(null);
  const destAutocompleteRef = useRef(null);

  const [mapCenter, setMapCenter] = useState(DEFAULT_CENTER);
  const [map, setMap] = useState(null);

  const [directionsResult, setDirectionsResult] = useState(null);
  const [distanceText, setDistanceText] = useState("");
  const [durationText, setDurationText] = useState("");
  // store the origin lat/lng so we can recenter to it
  const [originPosition, setOriginPosition] = useState(null);

  useEffect(() => {
    if (!isLoaded) return;

    // Initialize Autocomplete on the two input elements (if they exist)
    if (originInputRef.current && !originAutocompleteRef.current) {
      originAutocompleteRef.current = new google.maps.places.Autocomplete(originInputRef.current, { fields: ["formatted_address", "geometry", "name"] });
      // if user selects a place from autocomplete, capture its location so recenter can use it
      originAutocompleteRef.current.addListener("place_changed", () => {
        const place = originAutocompleteRef.current.getPlace();
        if (place && place.geometry && place.geometry.location) {
          const loc = place.geometry.location;
          setOriginPosition({ lat: loc.lat(), lng: loc.lng() });
        }
      });
    }
    if (destInputRef.current && !destAutocompleteRef.current) {
      destAutocompleteRef.current = new google.maps.places.Autocomplete(destInputRef.current, { fields: ["formatted_address", "geometry", "name"] });
    }
  }, [isLoaded]);

  async function calculateRoute() {
    const originVal = originInputRef.current?.value?.trim();
    const destVal = destInputRef.current?.value?.trim();
    if (!originVal || !destVal) {
      alert("Please enter both origin and destination.");
      return;
    }

    // Use DirectionsService
    const directionsService = new google.maps.DirectionsService();
    try {
      const results = await directionsService.route({
        origin: originVal,
        destination: destVal,
        travelMode: google.maps.TravelMode.DRIVING, // change to WALKING/BICYCLING if desired
      });

      setDirectionsResult(results);
      const leg = results.routes[0].legs[0];
      setDistanceText(leg.distance?.text || "");
      setDurationText(leg.duration?.text || "");

      // center map on origin (start_location)
      const originLoc = leg.start_location;
      const lat = originLoc.lat();
      const lng = originLoc.lng();
      setOriginPosition({ lat, lng }); // save origin for recenter button
      setMapCenter({ lat, lng });
      map?.panTo(originLoc);
    } catch (err) {
      console.error("Directions error:", err);
      alert("Could not calculate route. Check console for details.");
    }
  }

  function clearRoute() {
    setDirectionsResult(null);
    setDistanceText("");
    setDurationText("");
    if (originInputRef.current) originInputRef.current.value = "";
    if (destInputRef.current) destInputRef.current.value = "";
    if (map) {
      map.panTo(DEFAULT_CENTER);
      map.setZoom(14);
    }
    // optional: clear saved origin when clearing
    setOriginPosition(null);
  }

  function recenterToOrigin() {
    const target = originPosition || DEFAULT_CENTER;
    if (!map) return;
    map.panTo(target);
    // set a friendly zoom level when recentering
    map.setZoom(14);
    setMapCenter(target);
  }

  // if (loadError) return <div style={{ padding: 16 }}>Error loading Google Maps API</div>;
  if (!isLoaded) return <div style={{ padding: 16 }}>Loading map...</div>;

  return (
    <div style={{ padding: "1.5rem", maxWidth: 1200, margin: "0 auto" }}>
      <h2 style={{ marginBottom: 12 }}>Create Trail</h2>

      <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
        <input
          ref={originInputRef}
          placeholder="Origin (address or place)"
          style={{ padding: "8px 10px", borderRadius: 6, border: "1px solid #ccc", minWidth: 240 }}
        />
        <input
          ref={destInputRef}
          placeholder="Destination (address or place)"
          style={{ padding: "8px 10px", borderRadius: 6, border: "1px solid #ccc", minWidth: 240 }}
        />
        <button onClick={calculateRoute} style={{ padding: "8px 12px", borderRadius: 6, background: "#7b0f12", color: "#fff", border: "none", cursor: "pointer" }}>
          Calculate Route
        </button>
        <button onClick={clearRoute} style={{ padding: "8px 12px", borderRadius: 6, border: "1px solid #888", background: "#fff", cursor: "pointer" }}>
          Clear
        </button>

        <div style={{ marginLeft: "auto", display: "flex", gap: 12, alignItems: "center" }}>
          <div style={{ fontSize: 14 }}><strong>Distance:</strong> {distanceText || "—"}</div>
          <div style={{ fontSize: 14 }}><strong>Duration:</strong> {durationText || "—"}</div>
        </div>
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
  );
}

