/**
 * Geofencing Setup
 * 
 * Background location tracking and geofence triggers
 */

import * as Location from "expo-location";
import * as TaskManager from "expo-task-manager";

const LOCATION_TASK_NAME = "background-location-task";
const MIN_RADIUS_M = 50; // Minimum geofence radius

/**
 * Request location permissions
 */
export async function requestLocationPermissions(): Promise<boolean> {
  const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
  if (foregroundStatus !== "granted") {
    return false;
  }

  const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
  return backgroundStatus === "granted";
}

/**
 * Start background location tracking
 */
export async function startBackgroundLocation(): Promise<void> {
  const hasPermission = await requestLocationPermissions();
  if (!hasPermission) {
    throw new Error("Location permissions not granted");
  }

  await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
    accuracy: Location.Accuracy.Balanced,
    timeInterval: 60000, // 1 minute
    distanceInterval: 100, // 100 meters
    foregroundService: {
      notificationTitle: "Location Tracking",
      notificationBody: "Tracking your location for geofenced triggers",
    },
  });
}

/**
 * Stop background location tracking
 */
export async function stopBackgroundLocation(): Promise<void> {
  await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
}

/**
 * Define background task handler
 */
TaskManager.defineTask(LOCATION_TASK_NAME, ({ data, error }) => {
  if (error) {
    console.error("Location task error:", error);
    return;
  }

  if (data) {
    const { locations } = data as { locations: Location.LocationObject[] };
    // Process locations and check geofences
    // This will be implemented with actual geofence checking logic
    console.log("Location update:", locations);
  }
});

/**
 * Check if location is within geofence
 */
export function isWithinGeofence(
  lat: number,
  lng: number,
  centerLat: number,
  centerLng: number,
  radiusM: number
): boolean {
  const distance = Location.distanceBetween(
    { latitude: lat, longitude: lng },
    { latitude: centerLat, longitude: centerLng }
  );
  return distance <= radiusM;
}

