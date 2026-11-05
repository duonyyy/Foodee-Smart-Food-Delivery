// src/components/common/map.tsx
"use client";

import React, { useEffect, useRef, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

interface ShipperLocation {
  shipperId: string;
  latitude: number;
  longitude: number;
  updatedAt: string;
}

interface UserLocation {
  lat: number;
  lng: number;
}

interface Props {
  shipperLocation?: ShipperLocation;
  userLocation?: UserLocation;
}

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || "";

/**
 * Calculates compass heading bearing (0 - 360 deg) between two geographical coordinates
 */
function calculateBearing(
  lng1: number,
  lat1: number,
  lng2: number,
  lat2: number
): number {
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;

  const y = Math.sin(dLng) * Math.cos(phi2);
  const x =
    Math.cos(phi1) * Math.sin(phi2) -
    Math.sin(phi1) * Math.cos(phi2) * Math.cos(dLng);

  const brng = (Math.atan2(y, x) * 180) / Math.PI;
  return (brng + 360) % 360;
}

/**
 * Calculates approximate distance in meters between two coordinates
 */
function calculateDistance(
  lng1: number,
  lat1: number,
  lng2: number,
  lat2: number
): number {
  const R = 6371e3; // Earth's radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) *
      Math.cos(phi2) *
      Math.sin(deltaLambda / 2) *
      Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Smooth quadratic ease-in-out interpolation curve
 */
function easeInOutQuad(t: number): number {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

const Map: React.FC<Props> = ({ shipperLocation, userLocation }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const shipperMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const shipperIconElRef = useRef<HTMLDivElement | null>(null);
  const userMarkerRef = useRef<mapboxgl.Marker | null>(null);

  // Animation and coordinate interpolation tracking refs
  const currentCoordsRef = useRef<[number, number] | null>(null);
  const targetCoordsRef = useRef<[number, number] | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const lastBearingRef = useRef<number>(0);
  const lastRouteFetchCoordsRef = useRef<{
    shipper: [number, number];
    user: [number, number];
  } | null>(null);

  // Initialize Mapbox map
  useEffect(() => {
    if (!mapContainer.current || !MAPBOX_TOKEN) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;
    const initialCenter: [number, number] = userLocation
      ? [userLocation.lng, userLocation.lat]
      : shipperLocation
      ? [shipperLocation.longitude, shipperLocation.latitude]
      : [106.660172, 10.762622]; // Ho Chi Minh City default

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: initialCenter,
      zoom: 14,
      pitch: 30, // Slight 3D pitch for modern look
    });

    map.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }), "top-right");

    mapRef.current = map;

    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Handle User Marker
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !userLocation) return;

    if (!userMarkerRef.current) {
      // Create user marker element (home / destination pin)
      const el = document.createElement("div");
      el.className = "user-location-marker";
      el.innerHTML = `
        <div style="position: relative; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;">
          <div style="position: absolute; width: 32px; height: 32px; background: rgba(59, 130, 246, 0.25); border-radius: 50%; animation: pulse 2s infinite;"></div>
          <div style="position: relative; width: 22px; height: 22px; background: #2563eb; border: 3px solid white; border-radius: 50%; box-shadow: 0 4px 10px rgba(0,0,0,0.3);"></div>
        </div>
      `;
      userMarkerRef.current = new mapboxgl.Marker({ element: el, anchor: "center" })
        .setLngLat([userLocation.lng, userLocation.lat])
        .addTo(map);
    } else {
      userMarkerRef.current.setLngLat([userLocation.lng, userLocation.lat]);
    }
  }, [userLocation]);

  // Smooth 60fps Interpolation for Shipper Marker
  const animateShipperMovement = useCallback(
    (
      startLng: number,
      startLat: number,
      endLng: number,
      endLat: number,
      durationMs: number
    ) => {
      const map = mapRef.current;
      const marker = shipperMarkerRef.current;
      const iconEl = shipperIconElRef.current;
      if (!map || !marker) return;

      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }

      const bearing = calculateBearing(startLng, startLat, endLng, endLat);
      if (Math.abs(endLng - startLng) > 1e-6 || Math.abs(endLat - startLat) > 1e-6) {
        lastBearingRef.current = bearing;
        if (iconEl) {
          iconEl.style.transform = `rotate(${bearing}deg)`;
        }
      }

      const startTime = performance.now();

      const frame = (now: number) => {
        const elapsed = now - startTime;
        const rawProgress = Math.min(1, elapsed / durationMs);
        const progress = easeInOutQuad(rawProgress);

        const currentLng = startLng + (endLng - startLng) * progress;
        const currentLat = startLat + (endLat - startLat) * progress;

        currentCoordsRef.current = [currentLng, currentLat];
        marker.setLngLat([currentLng, currentLat]);

        // Smooth camera follow without jarring jump
        if (rawProgress < 1) {
          animFrameIdRef.current = requestAnimationFrame(frame);
        } else {
          currentCoordsRef.current = [endLng, endLat];
          marker.setLngLat([endLng, endLat]);
          animFrameIdRef.current = null;
        }
      };

      animFrameIdRef.current = requestAnimationFrame(frame);
    },
    []
  );

  // Update shipper location with smooth 60fps interpolation
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !shipperLocation) return;

    const nextLng = shipperLocation.longitude;
    const nextLat = shipperLocation.latitude;

    // Create marker if it doesn't exist
    if (!shipperMarkerRef.current) {
      const wrapper = document.createElement("div");
      wrapper.className = "shipper-marker-wrapper";
      wrapper.style.cursor = "pointer";

      // Outer radar pulse + Vehicle icon
      wrapper.innerHTML = `
        <div style="position: relative; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center;">
          <div style="position: absolute; width: 44px; height: 44px; border-radius: 50%; background: rgba(249, 115, 22, 0.3); animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div id="shipper-car-icon" style="position: relative; width: 34px; height: 34px; border-radius: 50%; background: #ffffff; border: 2.5px solid #ea580c; box-shadow: 0 4px 12px rgba(234, 88, 12, 0.4); display: flex; align-items: center; justify-content: center; transition: transform 0.25s ease-out;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ea580c" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/>
              <circle cx="7" cy="17" r="2"/>
              <path d="M9 17h6"/>
              <circle cx="17" cy="17" r="2"/>
            </svg>
          </div>
        </div>
      `;

      shipperIconElRef.current = wrapper.querySelector("#shipper-car-icon");
      shipperMarkerRef.current = new mapboxgl.Marker({
        element: wrapper,
        anchor: "center",
      })
        .setLngLat([nextLng, nextLat])
        .addTo(map);

      currentCoordsRef.current = [nextLng, nextLat];
      targetCoordsRef.current = [nextLng, nextLat];

      // Initial camera positioning
      if (userLocation) {
        const bounds = new mapboxgl.LngLatBounds();
        bounds.extend([userLocation.lng, userLocation.lat]);
        bounds.extend([nextLng, nextLat]);
        map.fitBounds(bounds, { padding: 80, maxZoom: 16 });
      } else {
        map.easeTo({ center: [nextLng, nextLat], zoom: 15, duration: 1000 });
      }
      return;
    }

    // Existing marker: perform smooth 60fps linear/quadratic interpolation
    const prevCoords = currentCoordsRef.current || [nextLng, nextLat];
    const distanceMeters = calculateDistance(
      prevCoords[0],
      prevCoords[1],
      nextLng,
      nextLat
    );

    // If change is tiny or shipper just slightly shifted, interpolate smoothly over 1200ms
    if (distanceMeters > 0.5) {
      targetCoordsRef.current = [nextLng, nextLat];
      // Adaptive duration based on distance (800ms - 2000ms)
      const duration = Math.min(2000, Math.max(800, distanceMeters * 20));
      animateShipperMovement(
        prevCoords[0],
        prevCoords[1],
        nextLng,
        nextLat,
        duration
      );
    }
  }, [shipperLocation, userLocation, animateShipperMovement]);

  // Draw and update driving route (with throttling to avoid excessive API calls)
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !userLocation || !shipperLocation) return;

    const currentShipperCoords: [number, number] = [
      shipperLocation.longitude,
      shipperLocation.latitude,
    ];
    const currentUserCoords: [number, number] = [userLocation.lng, userLocation.lat];

    // Check if coordinates have moved significantly (> 50m) since last fetch
    if (lastRouteFetchCoordsRef.current) {
      const dShipper = calculateDistance(
        lastRouteFetchCoordsRef.current.shipper[0],
        lastRouteFetchCoordsRef.current.shipper[1],
        currentShipperCoords[0],
        currentShipperCoords[1]
      );
      const dUser = calculateDistance(
        lastRouteFetchCoordsRef.current.user[0],
        lastRouteFetchCoordsRef.current.user[1],
        currentUserCoords[0],
        currentUserCoords[1]
      );

      // Skip route refetch if movement is minimal
      if (dShipper < 40 && dUser < 40) return;
    }

    const fetchRoute = async () => {
      try {
        const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${currentShipperCoords[0]},${currentShipperCoords[1]};${currentUserCoords[0]},${currentUserCoords[1]}?geometries=geojson&overview=full&access_token=${MAPBOX_TOKEN}`;
        const res = await fetch(url);
        if (!res.ok) return;
        const data = await res.json();
        const route = data.routes?.[0]?.geometry;

        if (!route || !mapRef.current) return;

        lastRouteFetchCoordsRef.current = {
          shipper: currentShipperCoords,
          user: currentUserCoords,
        };

        const source = mapRef.current.getSource("route") as mapboxgl.GeoJSONSource | undefined;

        if (source) {
          source.setData({
            type: "Feature",
            geometry: route,
            properties: {},
          });
        } else {
          mapRef.current.addSource("route", {
            type: "geojson",
            data: {
              type: "Feature",
              geometry: route,
              properties: {},
            },
          });

          // Route casing / glow
          mapRef.current.addLayer({
            id: "route-casing",
            type: "line",
            source: "route",
            layout: { "line-join": "round", "line-cap": "round" },
            paint: {
              "line-color": "#ffffff",
              "line-width": 8,
              "line-opacity": 0.8,
            },
          });

          // Primary animated route line
          mapRef.current.addLayer({
            id: "route",
            type: "line",
            source: "route",
            layout: { "line-join": "round", "line-cap": "round" },
            paint: {
              "line-color": "#ea580c",
              "line-width": 5,
            },
          });
        }
      } catch (err) {
        console.warn("Failed to fetch Mapbox directions route:", err);
      }
    };

    fetchRoute();
  }, [userLocation, shipperLocation]);

  return (
    <div className="relative w-full h-full min-h-[300px] rounded-2xl overflow-hidden border border-border shadow-xs">
      <div ref={mapContainer} className="w-full h-full" />
    </div>
  );
};

export default Map;
