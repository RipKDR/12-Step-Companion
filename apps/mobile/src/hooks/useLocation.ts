/**
 * Location Tracking Hook
 * 
 * React hook for location tracking
 */

import { useState, useEffect } from "react";
import * as Location from "expo-location";
import { requestLocationPermissions } from "../lib/geofencing";

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number | null;
}

export function useLocation() {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let subscription: Location.LocationSubscription | null = null;

    async function getLocation() {
      try {
        const hasPermission = await requestLocationPermissions();
        if (!hasPermission) {
          setError("Location permission denied");
          setLoading(false);
          return;
        }

        // Get current location
        const currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        setLocation({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
          accuracy: currentLocation.coords.accuracy,
        });

        // Watch for location updates
        subscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.Balanced,
            timeInterval: 30000, // 30 seconds
            distanceInterval: 50, // 50 meters
          },
          (newLocation) => {
            setLocation({
              latitude: newLocation.coords.latitude,
              longitude: newLocation.coords.longitude,
              accuracy: newLocation.coords.accuracy,
            });
          }
        );

        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to get location");
        setLoading(false);
      }
    }

    getLocation();

    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, []);

  return { location, error, loading };
}

