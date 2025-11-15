/**
 * Location utility functions for meeting finder
 * Handles geolocation permission requests and distance calculations
 */

export interface LocationCoordinates {
  lat: number;
  lng: number;
}

export interface LocationPermissionResult {
  granted: boolean;
  error?: string;
}

/**
 * Request geolocation permission from the user
 * Returns a promise that resolves with permission status
 */
export async function requestLocationPermission(): Promise<LocationPermissionResult> {
  if (!navigator.geolocation) {
    return {
      granted: false,
      error: 'Geolocation is not supported by your browser',
    };
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      () => {
        resolve({ granted: true });
      },
      (error) => {
        let errorMessage = 'Location permission denied';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location permission denied. Please enable location access in your browser settings.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out.';
            break;
          default:
            errorMessage = 'An unknown error occurred while requesting location.';
            break;
        }
        
        resolve({
          granted: false,
          error: errorMessage,
        });
      },
      {
        timeout: 10000,
        maximumAge: 60000, // Cache for 1 minute
      }
    );
  });
}

/**
 * Get the user's current location
 * Returns coordinates or null if permission denied or unavailable
 */
export async function getCurrentLocation(): Promise<LocationCoordinates | null> {
  if (!navigator.geolocation) {
    return null;
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      () => {
        resolve(null);
      },
      {
        timeout: 10000,
        maximumAge: 60000,
        enableHighAccuracy: false, // Use less accurate but faster location
      }
    );
  });
}

/**
 * Calculate the distance between two coordinates using the Haversine formula
 * Returns distance in kilometers
 */
export function calculateDistance(
  coord1: LocationCoordinates,
  coord2: LocationCoordinates
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(coord2.lat - coord1.lat);
  const dLng = toRadians(coord2.lng - coord1.lng);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(coord1.lat)) *
      Math.cos(toRadians(coord2.lat)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 10) / 10; // Round to 1 decimal place
}

/**
 * Convert degrees to radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Format distance for display
 * Returns formatted string like "2.5 km" or "0.3 km"
 */
export function formatDistance(km: number): string {
  if (km < 1) {
    const meters = Math.round(km * 1000);
    return `${meters} m`;
  }
  return `${km.toFixed(1)} km`;
}

