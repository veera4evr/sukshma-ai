/**
 * useGpsWeather — custom hook that:
 * 1. Requests device GPS via navigator.geolocation
 * 2. Reverse-geocodes via OpenStreetMap Nominatim (no API key required)
 * 3. Finds the nearest registered panchayat via Haversine distance
 * 4. Returns weather for that panchayat using the existing api.weather() function
 */
import { useState, useCallback } from "react";
import { ALL_PANCHAYATS } from "@/lib/demo/india-panchayats";
import { api } from "@/lib/services/api";
import type { PanchayatWeather } from "@/lib/demo/engine";

/** Haversine great-circle distance in kilometres */
function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export type GpsStatus = "idle" | "requesting" | "locating" | "ready" | "error";

export interface GpsWeatherState {
  status: GpsStatus;
  lat: number | null;
  lon: number | null;
  address: string | null;
  nearestPanchayatId: string | null;
  nearestPanchayatName: string | null;
  distanceKm: number | null;
  weather: PanchayatWeather | null;
  errorMessage: string | null;
}

const INITIAL_STATE: GpsWeatherState = {
  status: "idle",
  lat: null,
  lon: null,
  address: null,
  nearestPanchayatId: null,
  nearestPanchayatName: null,
  distanceKm: null,
  weather: null,
  errorMessage: null,
};

interface NominatimResponse {
  display_name?: string;
  address?: {
    village?: string;
    town?: string;
    city?: string;
    county?: string;
    state?: string;
    country?: string;
  };
  error?: string;
}

/** Format a short address from Nominatim response */
function formatAddress(resp: NominatimResponse): string {
  const a = resp.address;
  if (!a) return resp.display_name ?? "Unknown location";
  const parts: string[] = [];
  if (a.village ?? a.town ?? a.city) parts.push((a.village ?? a.town ?? a.city)!);
  if (a.county) parts.push(a.county);
  if (a.state) parts.push(a.state);
  return parts.join(", ") || resp.display_name || "Unknown location";
}

export function useGpsWeather(): GpsWeatherState & { requestLocation: () => void } {
  const [state, setState] = useState<GpsWeatherState>(INITIAL_STATE);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setState((s) => ({
        ...s,
        status: "error",
        errorMessage: "Your browser does not support GPS location.",
      }));
      return;
    }

    setState({ ...INITIAL_STATE, status: "requesting" });

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lon } = pos.coords;
        setState((s) => ({ ...s, status: "locating", lat, lon }));

        // Step 1: Reverse geocode via Nominatim
        let address = `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
        try {
          const resp = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
            { headers: { "Accept-Language": "en" } },
          );
          if (resp.ok) {
            const data: NominatimResponse = (await resp.json()) as NominatimResponse;
            if (!data.error) address = formatAddress(data);
          }
        } catch {
          // Geocode failure is non-fatal — we still find nearest panchayat
        }

        // Step 2: Find nearest panchayat by Haversine
        let nearest = ALL_PANCHAYATS[0]!;
        let minKm = Infinity;
        for (const p of ALL_PANCHAYATS) {
          const d = haversineKm(lat, lon, p.lat, p.lon);
          if (d < minKm) {
            minKm = d;
            nearest = p;
          }
        }

        // Step 3: Get weather for the nearest registered demo panchayat.
        //         If the nearest panchayat is not registered, use its id to look
        //         up demo weather anyway — api.weather falls back to panchayats[0].
        const weather = api.weather(nearest.id);

        setState({
          status: "ready",
          lat,
          lon,
          address,
          nearestPanchayatId: nearest.id,
          nearestPanchayatName: nearest.name,
          distanceKm: Math.round(minKm * 10) / 10,
          weather,
          errorMessage: null,
        });
      },
      (err) => {
        const messages: Record<number, string> = {
          1: "Location access was denied. Please allow location permissions and try again.",
          2: "Your location could not be determined. Check your GPS signal.",
          3: "Location request timed out. Please try again.",
        };
        setState({
          ...INITIAL_STATE,
          status: "error",
          errorMessage: messages[err.code] ?? "An unknown error occurred.",
        });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
  }, []);

  return { ...state, requestLocation };
}
