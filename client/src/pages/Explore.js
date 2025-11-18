import React from "react";
import { GoogleMap, useJsApiLoader } from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "600px",
  borderRadius: "12px",
  boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
};

const CENTER = { lat: 33.996112, lng: -81.027428 }; //University of South Carolina

function Explore() {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY, 
  });

  if (!isLoaded) return <div>Loading map...</div>;

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Explore</h1>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={CENTER}
        zoom={14}
      >
        {/* You can add markers or other map features here later */}
      </GoogleMap>
    </div>
  );
}

export default Explore;
