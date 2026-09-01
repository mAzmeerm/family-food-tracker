import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Utensils, ArrowLeft, MapPin, AlertCircle, Save } from "lucide-react";
import { ImageUploader } from "../components/ImageUploader";
import { LocationPicker } from "../components/LocationPicker";
import { addRestaurant } from "../services/restaurantService";
import { LocationCoordinates } from "../types";

export const AddRestaurant: React.FC = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [coords, setCoords] = useState<LocationCoordinates | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLocationSelected = (
    selectedCoords: LocationCoordinates,
    detectedAddress?: string,
  ) => {
    setCoords(selectedCoords);
    if (detectedAddress && !address) {
      setAddress(detectedAddress);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError("Please enter the restaurant name.");
      return;
    }

    if (!coords || isNaN(coords.latitude) || isNaN(coords.longitude)) {
      setError("Please select the restaurant location on the map or use GPS.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const created = await addRestaurant({
        name: name.trim(),
        latitude: coords.latitude,
        longitude: coords.longitude,
        address: address.trim() || null,
        photos,
      });

      navigate(`/restaurant/${created.id}`);
    } catch (err: any) {
      setError(err.message || "Failed to save restaurant. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      {/* Back button */}
      <div className="mb-6">
        <Link
          to="/"
          id="back-to-home-btn"
          className="inline-flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Restaurants</span>
        </Link>
      </div>

      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-200 shadow-xs">
        <div className="flex items-center gap-3 pb-6 border-b border-gray-100">
          <div className="w-12 h-12 rounded-xl bg-orange-500 text-white flex items-center justify-center shadow-xs">
            <Utensils className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Add Visited Restaurant
            </h1>
            <p className="text-xs text-gray-500">
              Record a new food spot for the family journal
            </p>
          </div>
        </div>

        {error && (
          <div className="mt-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          {/* Restaurant Name */}
          <div>
            <label
              htmlFor="restaurant-name-input"
              className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-2"
            >
              Restaurant / Food Shop Name{" "}
              <span className="text-rose-500">*</span>
            </label>
            <input
              id="restaurant-name-input"
              type="text"
              required
              placeholder="e.g. Restoran ABC, Nasi Kandar Ali..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors font-medium"
            />
          </div>

          {/* Location Picker */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-2">
              Restaurant Location <span className="text-rose-500">*</span>
            </label>
            <LocationPicker onLocationSelected={handleLocationSelected} />
          </div>

          {/* Address input */}
          <div>
            <label
              htmlFor="restaurant-address-input"
              className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-2"
            >
              Address / Area (Optional)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <MapPin className="w-4 h-4" />
              </div>
              <input
                id="restaurant-address-input"
                type="text"
                placeholder="e.g. Klang, Selangor or Jalan Hang Kasturi"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
              />
            </div>
          </div>

          {/* Optional Image URL */}
          {/* Restaurant Photos */}
          <div>
            <ImageUploader onImagesUploaded={setPhotos} maxImages={6} />
          </div>

          {/* Action buttons */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100">
            <Link
              to="/"
              id="cancel-add-restaurant-btn"
              className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-medium text-sm hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>
            <button
              id="save-restaurant-submit-btn"
              type="submit"
              disabled={loading || !name.trim() || !coords}
              className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 disabled:opacity-50 text-white font-medium rounded-xl text-sm shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>
                {loading ? "Saving Restaurant..." : "Save Restaurant"}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
