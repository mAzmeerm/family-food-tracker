import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Utensils, ArrowLeft, Image, MapPin, AlertCircle, Save } from 'lucide-react';
import { LocationPicker } from '../components/LocationPicker';
import { getRestaurantById, updateRestaurant } from '../services/restaurantService';
import { LocationCoordinates, Restaurant } from '../types';
import { Loading } from '../components/Loading';

export const EditRestaurant: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [coords, setCoords] = useState<LocationCoordinates | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    loadRestaurant(id);
  }, [id]);

  const loadRestaurant = async (restaurantId: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getRestaurantById(restaurantId);
      if (!data) {
        setError('Restaurant not found.');
        return;
      }
      setRestaurant(data);
      setName(data.name);
      setAddress(data.address || '');
      setImageUrl(data.imageUrl || '');
      setCoords({ latitude: data.latitude, longitude: data.longitude });
    } catch (err: any) {
      setError('Failed to load restaurant details.');
    } finally {
      setLoading(false);
    }
  };

  const handleLocationSelected = (selectedCoords: LocationCoordinates, detectedAddress?: string) => {
    setCoords(selectedCoords);
    if (detectedAddress && !address) {
      setAddress(detectedAddress);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    if (!name.trim()) {
      setError('Please enter the restaurant name.');
      return;
    }

    if (!coords || isNaN(coords.latitude) || isNaN(coords.longitude)) {
      setError('Please select valid location coordinates.');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await updateRestaurant(id, {
        name: name.trim(),
        latitude: coords.latitude,
        longitude: coords.longitude,
        address: address.trim() || null,
        imageUrl: imageUrl.trim() || null,
      });

      navigate(`/restaurant/${id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to update restaurant.');
      setSaving(false);
    }
  };

  if (loading) {
    return <Loading message="Loading restaurant details..." fullScreen />;
  }

  if (error && !restaurant) {
    return (
      <div className="max-w-xl mx-auto py-12 px-4 text-center">
        <div className="p-6 bg-rose-50 border border-rose-200 rounded-3xl text-rose-700">
          <p className="font-semibold text-base mb-4">{error}</p>
          <Link
            to="/"
            className="px-5 py-2.5 bg-stone-800 text-white rounded-xl text-sm font-semibold inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Restaurants</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <Link
          to={`/restaurant/${id}`}
          id="back-to-restaurant-btn"
          className="inline-flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Restaurant Details</span>
        </Link>
      </div>

      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-200 shadow-xs">
        <div className="flex items-center gap-3 pb-6 border-b border-gray-100">
          <div className="w-12 h-12 rounded-xl bg-orange-500 text-white flex items-center justify-center shadow-xs">
            <Utensils className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Restaurant</h1>
            <p className="text-xs text-gray-500">Update restaurant details or adjust location pin</p>
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
              htmlFor="edit-restaurant-name-input"
              className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-2"
            >
              Restaurant Name <span className="text-rose-500">*</span>
            </label>
            <input
              id="edit-restaurant-name-input"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors font-medium"
            />
          </div>

          {/* Location Picker */}
          {restaurant && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-2">
                Location on Map <span className="text-rose-500">*</span>
              </label>
              <LocationPicker
                initialLatitude={restaurant.latitude}
                initialLongitude={restaurant.longitude}
                initialAddress={restaurant.address}
                onLocationSelected={handleLocationSelected}
              />
            </div>
          )}

          {/* Address input */}
          <div>
            <label
              htmlFor="edit-restaurant-address-input"
              className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-2"
            >
              Address / Area
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <MapPin className="w-4 h-4" />
              </div>
              <input
                id="edit-restaurant-address-input"
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
              />
            </div>
          </div>

          {/* Optional Image URL */}
          <div>
            <label
              htmlFor="edit-restaurant-image-input"
              className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-2"
            >
              Photo URL
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Image className="w-4 h-4" />
              </div>
              <input
                id="edit-restaurant-image-input"
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100">
            <Link
              to={`/restaurant/${id}`}
              id="cancel-edit-restaurant-btn"
              className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-medium text-sm hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>
            <button
              id="save-edit-restaurant-btn"
              type="submit"
              disabled={saving || !name.trim()}
              className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 disabled:opacity-50 text-white font-medium rounded-xl text-sm shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving Changes...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
