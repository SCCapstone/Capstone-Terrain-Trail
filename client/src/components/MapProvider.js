import React from "react";
import { Outlet } from "react-router-dom";
import { useJsApiLoader } from "@react-google-maps/api";

const GOOGLE_MAPS_LIBRARIES = ["places"];

export default function MapProvider() {
  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries: GOOGLE_MAPS_LIBRARIES,
  });

    if (loadError) {
    return (
      <div style={{ padding: 16 }}>
        Failed to load Google Maps. Check your API key and Google Maps setup.
      </div>
    );
  }

  if (!isLoaded) {
    return <div style={{ padding: 16 }}>Loading map...</div>;
  }

  return <Outlet />;
}