import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Plus,
  ArrowUpDown,
  Utensils,
  MapPin,
  Star,
  MessageSquare,
  Sparkles,
  SlidersHorizontal,
  Flame
} from 'lucide-react';
import { getRestaurants } from '../services/restaurantService';
import { Restaurant, SortOption } from '../types';
import { RestaurantCard } from '../components/RestaurantCard';
import { Loading } from '../components/Loading';

export const Home: React.FC = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');

  useEffect(() => {
    loadRestaurants();
  }, []);

  const loadRestaurants = async () => {
    setLoading(true);
    try {
      const data = await getRestaurants();
      setRestaurants(data);
    } catch (err) {
      console.error('Error fetching restaurants:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort
  const processedRestaurants = useMemo(() => {
    let result = [...restaurants];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(
        (r) =>
          r.name.toLowerCase().includes(query) ||
          (r.address && r.address.toLowerCase().includes(query))
      );
    }

    // Sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case 'newest': {
          const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : (a.createdAt?.seconds ? a.createdAt.seconds * 1000 : 0);
          const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : (b.createdAt?.seconds ? b.createdAt.seconds * 1000 : 0);
          return timeB - timeA;
        }
        case 'oldest': {
          const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : (a.createdAt?.seconds ? a.createdAt.seconds * 1000 : 0);
          const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : (b.createdAt?.seconds ? b.createdAt.seconds * 1000 : 0);
          return timeA - timeB;
        }
        case 'highest_rating': {
          const ratingA = a.averageRating !== null && a.averageRating !== undefined ? a.averageRating : -1;
          const ratingB = b.averageRating !== null && b.averageRating !== undefined ? b.averageRating : -1;
          return ratingB - ratingA;
        }
        case 'lowest_rating': {
          const ratingA = a.averageRating !== null && a.averageRating !== undefined ? a.averageRating : 999;
          const ratingB = b.averageRating !== null && b.averageRating !== undefined ? b.averageRating : 999;
          return ratingA - ratingB;
        }
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    return result;
  }, [restaurants, searchQuery, sortBy]);

  // Family Stats
  const stats = useMemo(() => {
    const totalCount = restaurants.length;
    const totalReviews = restaurants.reduce((sum, r) => sum + (r.reviewCount || 0), 0);
    const ratedRestaurants = restaurants.filter(
      (r) => r.averageRating !== null && r.averageRating !== undefined
    );
    const avgScore =
      ratedRestaurants.length > 0
        ? ratedRestaurants.reduce((sum, r) => sum + (r.averageRating || 0), 0) / ratedRestaurants.length
        : null;

    return { totalCount, totalReviews, avgScore };
  }, [restaurants]);

  if (loading) {
    return <Loading message="Loading family food spots..." fullScreen />;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Banner & Overview */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-6 sm:p-8 text-white shadow-sm mb-8 relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold backdrop-blur-xs mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Family Food Journal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Family Food Tracker
          </h1>
          <p className="mt-2 text-orange-100 text-sm sm:text-base leading-relaxed">
            Record every restaurant we've visited, pin their exact locations, and save honest ratings from the whole family.
          </p>
        </div>

        {/* Mini stats cards */}
        <div className="mt-6 pt-6 border-t border-white/20 grid grid-cols-3 gap-3 max-w-lg">
          <div className="bg-white/10 rounded-xl p-3 backdrop-blur-xs">
            <div className="text-xs text-orange-100 font-medium">Visited Spots</div>
            <div className="text-xl sm:text-2xl font-bold text-white mt-0.5">
              {stats.totalCount}
            </div>
          </div>
          <div className="bg-white/10 rounded-xl p-3 backdrop-blur-xs">
            <div className="text-xs text-orange-100 font-medium">Total Reviews</div>
            <div className="text-xl sm:text-2xl font-bold text-white mt-0.5">
              {stats.totalReviews}
            </div>
          </div>
          <div className="bg-white/10 rounded-xl p-3 backdrop-blur-xs">
            <div className="text-xs text-orange-100 font-medium">Family Avg</div>
            <div className="text-xl sm:text-2xl font-bold text-white mt-0.5">
              {stats.avgScore ? `⭐ ${stats.avgScore.toFixed(1)}` : '—'}
            </div>
          </div>
        </div>
      </div>

      {/* Search & Actions Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3.5 mb-8">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            id="search-restaurants-input"
            type="text"
            placeholder="Search restaurants by name or area..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors shadow-2xs"
          />
        </div>

        {/* Sort & Add Button */}
        <div className="flex items-center gap-3">
          {/* Sort Dropdown */}
          <div className="relative flex items-center">
            <div className="absolute left-3 pointer-events-none text-gray-400">
              <ArrowUpDown className="w-3.5 h-3.5" />
            </div>
            <select
              id="sort-restaurants-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="pl-9 pr-8 py-2.5 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors shadow-2xs appearance-none cursor-pointer"
            >
              <option value="newest">Sort: Newest</option>
              <option value="oldest">Sort: Oldest</option>
              <option value="highest_rating">Sort: Highest Rating</option>
              <option value="lowest_rating">Sort: Lowest Rating</option>
              <option value="name">Sort: Name (A-Z)</option>
            </select>
          </div>

          <Link
            to="/add-restaurant"
            id="home-add-restaurant-btn"
            className="px-4 py-2.5 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white text-xs sm:text-sm font-semibold rounded-xl transition-colors shadow-xs flex items-center gap-1.5 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Restaurant</span>
          </Link>
        </div>
      </div>

      {/* Content Section */}
      {restaurants.length === 0 ? (
        /* Empty Database State */
        <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-gray-300 max-w-md mx-auto my-12 shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center mx-auto mb-4 border border-orange-100">
            <Utensils className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-1">
            No restaurants yet
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            Start tracking your family food journey.
          </p>
          <Link
            to="/add-restaurant"
            id="empty-state-add-restaurant-btn"
            className="px-6 py-3 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-semibold rounded-xl text-sm shadow-xs transition-colors inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Restaurant</span>
          </Link>
        </div>
      ) : processedRestaurants.length === 0 ? (
        /* No Search Matches */
        <div className="bg-white rounded-3xl p-12 text-center border border-gray-200 max-w-md mx-auto my-12">
          <div className="w-12 h-12 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center mx-auto mb-3">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-gray-900 mb-1">No restaurants found</h3>
          <p className="text-xs text-gray-500 mb-4">
            No food spots matching "{searchQuery}".
          </p>
          <button
            id="clear-search-btn"
            type="button"
            onClick={() => setSearchQuery('')}
            className="text-xs font-semibold text-orange-600 hover:text-orange-800 underline"
          >
            Clear search
          </button>
        </div>
      ) : (
        /* Restaurants Grid */
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Recent Restaurants ({processedRestaurants.length})
            </h2>
            {searchQuery && (
              <span className="text-xs text-gray-500">
                Filtered from {restaurants.length} total
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {processedRestaurants.map((restaurant) => (
              <RestaurantCard key={restaurant.id} restaurant={restaurant} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
