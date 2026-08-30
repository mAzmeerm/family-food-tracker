import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import { MapPin, Navigation, Loader2, AlertCircle, Check } from "lucide-react";
import { LocationCoordinates } from "../types";
import { useGeolocation } from "../hooks/useGeolocation";
import { reverseGeocode, searchAddress } from "../services/geocodingService";

interface LocationPickerProps {
  initialLatitude?: number | null;
  initialLongitude?: number | null;
  initialAddress?: string | null;
  onLocationSelected: (coords: LocationCoordinates, address?: string) => void;
}

const createPinIcon = () => {
  return L.divIcon({
    className: "custom-picker-marker",
    html: `
      <div style="
        background: #f97316;
        width: 36px;
        height: 36px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 12px rgba(249, 115, 22, 0.35);
        border: 2px solid white;
        cursor: grab;
      ">
        <div style="transform: rotate(45deg); color: white; font-size: 16px; line-height: 1;">
          📍
        </div>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36],
  });
};

export const LocationPicker: React.FC<LocationPickerProps> = ({
  initialLatitude,
  initialLongitude,
  initialAddress,
  onLocationSelected,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  // Default coordinates (Klang Valley / Malaysia fallback if none provided)
  const defaultLat = initialLatitude || 3.139;
  const defaultLng = initialLongitude || 101.6869;

  const [selectedCoords, setSelectedCoords] =
    useState<LocationCoordinates | null>(
      initialLatitude && initialLongitude
        ? { latitude: initialLatitude, longitude: initialLongitude }
        : null,
    );
  const [geocoding, setGeocoding] = useState<boolean>(false);
  const [addressQuery, setAddressQuery] = useState(initialAddress || "");
  const [searchingAddress, setSearchingAddress] = useState(false);
  const [geocodedAddress, setGeocodedAddress] = useState<string | null>(
    initialAddress || null,
  );
  const [isLocationConfirmed, setIsLocationConfirmed] = useState<boolean>(
    Boolean(initialLatitude && initialLongitude),
  );

  const {
    getCurrentLocation,
    loading: geoLoading,
    error: geoError,
    clearLocationError,
  } = useGeolocation();

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [defaultLat, defaultLng],
        zoom: initialLatitude && initialLongitude ? 15 : 12,
        zoomControl: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      // Add initial marker if coords exist
      if (initialLatitude && initialLongitude) {
        const marker = L.marker([initialLatitude, initialLongitude], {
          icon: createPinIcon(),
          draggable: true,
        }).addTo(map);

        marker.on("dragend", async (e) => {
          const latLng = (e.target as L.Marker).getLatLng();
          handleLocationUpdate(latLng.lat, latLng.lng);
        });

        markerRef.current = marker;
      }

      // Click on map to place/move marker
      map.on("click", (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        handleLocationUpdate(lat, lng);
      });

      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  const handleLocationUpdate = async (lat: number, lng: number) => {
    const coords: LocationCoordinates = { latitude: lat, longitude: lng };
    setSelectedCoords(coords);
    setIsLocationConfirmed(false);
    clearLocationError();

    const map = mapInstanceRef.current;
    if (!map) return;

    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
    } else {
      const marker = L.marker([lat, lng], {
        icon: createPinIcon(),
        draggable: true,
      }).addTo(map);

      marker.on("dragend", async (e) => {
        const latLng = (e.target as L.Marker).getLatLng();
        handleLocationUpdate(latLng.lat, latLng.lng);
      });

      markerRef.current = marker;
    }

    map.panTo([lat, lng]);

    // Reverse geocode
    setGeocoding(true);
    try {
      const result = await reverseGeocode(lat, lng);
      if (result && result.address) {
        setGeocodedAddress(result.address);
        onLocationSelected(coords, result.address);
      } else {
        onLocationSelected(coords);
      }
    } catch (err) {
      console.warn("Geocoding error:", err);
      onLocationSelected(coords);
    } finally {
      setGeocoding(false);
    }
  };
  const handleSearchAddress = async () => {
    const query = addressQuery.trim();

    if (!query) return;

    setSearchingAddress(true);
    setGeocoding(true);
    clearLocationError();

    try {
      console.log("Searching address:", query);

      const result = await searchAddress(query);

      console.log("Search result:", result);

      if (!result) {
        setGeocodedAddress(null);
        alert(
          `Location not found.\n\nTry a more specific address, for example:\n"${query}, Malaysia"`,
        );
        return;
      }

      const coords: LocationCoordinates = {
        latitude: result.latitude,
        longitude: result.longitude,
      };

      setSelectedCoords(coords);
      setGeocodedAddress(result.address);
      setIsLocationConfirmed(false);

      const map = mapInstanceRef.current;

      if (!map) {
        console.error("Leaflet map is not initialized.");
        return;
      }

      // Move map to searched location
      map.setView([result.latitude, result.longitude], 17, {
        animate: true,
      });

      // Move existing marker
      if (markerRef.current) {
        markerRef.current.setLatLng([result.latitude, result.longitude]);
      } else {
        // Create marker if one doesn't exist
        const marker = L.marker([result.latitude, result.longitude], {
          icon: createPinIcon(),
          draggable: true,
        }).addTo(map);

        marker.on("dragend", (e) => {
          const latLng = (e.target as L.Marker).getLatLng();

          handleLocationUpdate(latLng.lat, latLng.lng);
        });

        markerRef.current = marker;
      }

      onLocationSelected(coords, result.address);
    } catch (error) {
      console.error("Address search failed:", error);

      alert("Unable to search this address. Please try again.");
    } finally {
      setSearchingAddress(false);
      setGeocoding(false);
    }
  };

  const handleUseCurrentLocation = async () => {
    clearLocationError();
    try {
      const coords = await getCurrentLocation();
      const map = mapInstanceRef.current;
      if (map) {
        map.setView([coords.latitude, coords.longitude], 16);
      }
      await handleLocationUpdate(coords.latitude, coords.longitude);
      setIsLocationConfirmed(true);
    } catch (err) {
      console.warn("GPS location request failed:", err);
    }
  };

  const handleConfirmLocation = () => {
    if (selectedCoords) {
      setIsLocationConfirmed(true);
      onLocationSelected(selectedCoords, geocodedAddress || undefined);
    }
  };

  return (
    <div className="space-y-3">
      {/* Address Search */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
            <MapPin className="w-4 h-4" />
          </div>

          <input
            id="location-address-search"
            type="text"
            value={addressQuery}
            onChange={(e) => setAddressQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSearchAddress();
              }
            }}
            placeholder="Search restaurant address or place..."
            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          />
        </div>

        <button
          id="search-location-btn"
          type="button"
          onClick={handleSearchAddress}
          disabled={searchingAddress || !addressQuery.trim()}
          className="px-5 py-3 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2"
        >
          {searchingAddress ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Searching...</span>
            </>
          ) : (
            <span>Search Location</span>
          )}
        </button>
      </div>
      {/* Controls row */}
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <button
          id="use-current-gps-btn"
          type="button"
          onClick={handleUseCurrentLocation}
          disabled={geoLoading}
          className="px-3.5 py-2 bg-orange-50 hover:bg-orange-100 active:bg-orange-200 text-orange-700 text-xs sm:text-sm font-medium rounded-xl transition-colors flex items-center gap-2 border border-orange-200 cursor-pointer disabled:opacity-50"
        >
          {geoLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-orange-600" />
          ) : (
            <Navigation className="w-4 h-4 text-orange-600" />
          )}
          <span>
            {geoLoading ? "Detecting GPS..." : "📍 Use Current Location"}
          </span>
        </button>

        <span className="text-xs text-gray-500 hidden sm:inline">
          Or click anywhere on map / drag pin
        </span>
      </div>

      {geoError && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{geoError}</span>
        </div>
      )}

      {/* Map Container */}
      <div className="relative rounded-2xl overflow-hidden border border-gray-200 shadow-xs bg-gray-100">
        <div
          ref={mapContainerRef}
          id="location-picker-leaflet-map"
          className="w-full h-72 sm:h-80 z-0"
        />

        {/* Map overlay hint */}
        <div className="absolute top-2.5 right-2.5 z-20 bg-white/90 backdrop-blur-xs px-3 py-1.5 rounded-xl text-xs font-medium text-gray-700 shadow-xs border border-gray-200 pointer-events-none">
          Click map to drop pin
        </div>
      </div>

      {selectedCoords && (
        <div className="p-3.5 bg-orange-50/50 border border-orange-200 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-900">
              <MapPin className="w-3.5 h-3.5 text-orange-500 shrink-0" />
              <span>
                Selected: {selectedCoords.latitude.toFixed(5)},{" "}
                {selectedCoords.longitude.toFixed(5)}
              </span>
            </div>
            {geocoding ? (
              <p className="text-xs text-gray-500 flex items-center gap-1.5">
                <Loader2 className="w-3 h-3 animate-spin text-orange-500" />
                Finding street address...
              </p>
            ) : geocodedAddress ? (
              <p className="text-xs text-gray-600 leading-snug">
                📍 {geocodedAddress}
              </p>
            ) : null}
          </div>

          <button
            id="confirm-location-btn"
            type="button"
            onClick={handleConfirmLocation}
            className={`px-4 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
              isLocationConfirmed
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "bg-orange-500 hover:bg-orange-600 text-white shadow-xs"
            }`}
          >
            {isLocationConfirmed ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Location Set</span>
              </>
            ) : (
              <span>Confirm Location</span>
            )}
          </button>
        </div>
      )}
    </div>
  );
};
