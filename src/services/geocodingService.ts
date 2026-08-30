export interface ReverseGeocodeResult {
  address: string;
  city?: string;
  state?: string;
  road?: string;
  country?: string;
}

export const reverseGeocode = async (
  latitude: number,
  longitude: number,
): Promise<ReverseGeocodeResult | null> => {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`;

    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(
        `Reverse geocoding failed with status: ${response.status}`,
      );
    }

    const data = await response.json();

    if (!data || !data.address) {
      return null;
    }

    const addr = data.address;
    const road = addr.road || addr.pedestrian || addr.street || "";
    const suburb = addr.suburb || addr.neighbourhood || addr.quarter || "";
    const city =
      addr.city ||
      addr.town ||
      addr.municipality ||
      addr.village ||
      addr.county ||
      "";
    const state = addr.state || "";
    const country = addr.country || "";

    // Build readable concise Malaysian / international style address
    const parts = [road, suburb, city, state, country].filter(Boolean);
    const readableAddress =
      parts.length > 0
        ? parts.join(", ")
        : data.display_name ||
          `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;

    return {
      address: readableAddress,
      city,
      state,
      road,
      country,
    };
  } catch (error) {
    console.warn("Reverse geocoding error:", error);
    return null;
  }
};
export const searchAddress = async (
  query: string,
): Promise<
  (ReverseGeocodeResult & {
    latitude: number;
    longitude: number;
  }) | null
> => {
  try {
    const apiKey = import.meta.env.VITE_GEOAPIFY_API_KEY;

    if (!apiKey) {
      console.error("Geoapify API key is missing.");
      return null;
    }

    const url =
      `https://api.geoapify.com/v1/geocode/search` +
      `?text=${encodeURIComponent(query)}` +
      `&format=json` +
      `&limit=5` +
      `&lang=en` +
      `&filter=countrycode:my` +
      `&apiKey=${encodeURIComponent(apiKey)}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();

      console.error(
        "Geoapify search failed:",
        response.status,
        errorText,
      );

      throw new Error(
        `Geoapify search failed with status: ${response.status}`,
      );
    }

    const data = await response.json();

    console.log("Geoapify search results:", data);

    if (!Array.isArray(data.results) || data.results.length === 0) {
      console.warn("Geoapify returned no results for:", query);
      return null;
    }

    const result = data.results[0];

    const latitude = Number(result.lat);
    const longitude = Number(result.lon);

    if (
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude)
    ) {
      console.warn("Geoapify returned invalid coordinates:", result);
      return null;
    }

    const road =
      result.street ||
      "";

    const city =
      result.city ||
      result.town ||
      result.village ||
      "";

    const state =
      result.state ||
      "";

    const country =
      result.country ||
      "";

    const address =
      result.formatted ||
      [
        result.name,
        result.housenumber,
        result.street,
        result.postcode,
        city,
        state,
        country,
      ]
        .filter(Boolean)
        .join(", ") ||
      query;

    return {
      latitude,
      longitude,
      address,
      city,
      state,
      road,
      country,
    };
  } catch (error) {
    console.error("Geoapify address search error:", error);
    return null;
  }
};
