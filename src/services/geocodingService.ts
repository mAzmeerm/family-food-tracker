export interface ReverseGeocodeResult {
  address: string;
  city?: string;
  state?: string;
  road?: string;
  country?: string;
}

export const reverseGeocode = async (
  latitude: number,
  longitude: number
): Promise<ReverseGeocodeResult | null> => {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`;
    
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Reverse geocoding failed with status: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data || !data.address) {
      return null;
    }

    const addr = data.address;
    const road = addr.road || addr.pedestrian || addr.street || '';
    const suburb = addr.suburb || addr.neighbourhood || addr.quarter || '';
    const city = addr.city || addr.town || addr.municipality || addr.village || addr.county || '';
    const state = addr.state || '';
    const country = addr.country || '';

    // Build readable concise Malaysian / international style address
    const parts = [road, suburb, city, state, country].filter(Boolean);
    const readableAddress = parts.length > 0 ? parts.join(', ') : data.display_name || `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;

    return {
      address: readableAddress,
      city,
      state,
      road,
      country,
    };
  } catch (error) {
    console.warn('Reverse geocoding error:', error);
    return null;
  }
};
