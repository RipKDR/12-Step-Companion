/**
 * Web Geofencing Wrapper
 * 
 * Uses browser Geolocation API for web-based geofencing
 */

export interface Geofence {
  id: string;
  label: string;
  lat: number;
  lng: number;
  radiusM: number;
}

/**
 * Calculate distance between two coordinates (Haversine formula)
 */
function distanceBetween(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371000; // Earth radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Check if current location is within any geofence
 */
export async function checkGeofences(
  geofences: Geofence[]
): Promise<Geofence | null> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation not supported"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

        for (const geofence of geofences) {
          const distance = distanceBetween(
            latitude,
            longitude,
            geofence.lat,
            geofence.lng
          );

          if (distance <= geofence.radiusM) {
            resolve(geofence);
            return;
          }
        }

        resolve(null);
      },
      (error) => reject(error)
    );
  });
}

