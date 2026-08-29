import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Plus, Utensils, Search, Star } from 'lucide-react';
import { getRestaurants } from '../services/restaurantService';
import { Restaurant } from '../types';
import { RestaurantMap } from '../components/RestaurantMap';
import { Loading } from '../components/Loading';

export const FoodMap: React.FC = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getRestaurants();
      setRestaurants(data);
    } catch (err) {
      console.error('Error fetching restaurants for map:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredRestaurants = restaurants.filter((r) =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
    (r.address && r.address.toLowerCase().includes(searchQuery.toLowerCase().trim()))
  );

  if (loading) {
    return <Loading message="Loading family food map..." fullScreen />;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-orange-600 mb-1">
            <MapPin className="w-4 h-4" />
            <span>Interactive Map</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Family Food Map
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Explore all {restaurants.length} saved restaurant locations on OpenStreetMap
          </p>
        </div>

        <Link
          to="/add-restaurant"
          id="map-add-restaurant-btn"
          className="px-4 py-2.5 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white text-xs sm:text-sm font-semibold rounded-xl transition-colors shadow-xs inline-flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Restaurant</span>
        </Link>
      </div>

      {restaurants.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-200 shadow-xs max-w-md mx-auto my-8">
          <div className="w-16 h-16 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center mx-auto mb-4 border border-orange-100">
            <MapPin className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            No restaurants saved yet
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            Start pinning your family's favorite food spots to build your family food map.
          </p>
          <Link
            to="/add-restaurant"
            className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-xl transition-colors inline-flex items-center gap-2 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add First Restaurant</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Quick Search & Select Bar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                id="map-search-input"
                type="text"
                placeholder="Filter map by restaurant name or area..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors shadow-2xs"
              />
            </div>

            {/* Quick selector chips */}
            {filteredRestaurants.length > 0 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full sm:max-w-md">
                {filteredRestaurants.slice(0, 4).map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setSelectedId(r.id)}
                    className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
                      selectedId === r.id
                        ? 'bg-orange-500 text-white shadow-xs'
                        : 'bg-white border border-gray-200 text-gray-700 hover:bg-orange-50 hover:text-orange-700 hover:border-orange-200'
                    }`}
                  >
                    <Utensils className="w-3 h-3" />
                    <span className="truncate max-w-[120px]">{r.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Full Map Canvas */}
          <div className="relative">
            <RestaurantMap
              restaurants={filteredRestaurants}
              selectedRestaurantId={selectedId}
              height="600px"
            />
          </div>
        </div>
      )}
    </div>
  );
};
