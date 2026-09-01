import React from "react";
import { Link } from "react-router-dom";
import {
  MapPin,
  Star,
  MessageSquare,
  UtensilsCrossed,
  ChevronRight,
} from "lucide-react";
import { Restaurant } from "../types";

interface RestaurantCardProps {
  restaurant: Restaurant;
}

export const RestaurantCard: React.FC<RestaurantCardProps> = ({
  restaurant,
}) => {
  const hasRating =
    restaurant.averageRating !== null && restaurant.averageRating !== undefined;

  return (
    <Link
      to={`/restaurant/${restaurant.id}`}
      id={`restaurant-card-${restaurant.id}`}
      className="group block bg-white rounded-2xl p-5 border border-gray-200 shadow-xs hover:shadow-md hover:border-orange-300 transition-all duration-200 flex flex-col justify-between"
    >
      <div>
        {/* Restaurant Image */}
        {restaurant.photos?.[0] ? (
          <div className="w-full h-40 rounded-xl overflow-hidden mb-4 bg-gray-100 relative">
            <img
              src={restaurant.photos[0]}
              alt={restaurant.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
        ) : null}

        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-100 text-orange-500 flex items-center justify-center shrink-0 group-hover:bg-orange-500 group-hover:text-white transition-colors">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-base leading-snug group-hover:text-orange-600 transition-colors">
                {restaurant.name}
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">Family Food Spot</p>
            </div>
          </div>

          <div className="shrink-0">
            {hasRating ? (
              <div className="flex items-center gap-1 text-orange-500 font-bold text-sm bg-orange-50/60 px-2.5 py-1 rounded-lg border border-orange-100">
                <span>⭐</span>
                <span>{restaurant.averageRating?.toFixed(1)}</span>
              </div>
            ) : (
              <span className="text-[11px] font-medium text-gray-400 bg-gray-100 px-2 py-1 rounded-md">
                No reviews
              </span>
            )}
          </div>
        </div>

        {/* Address / Location */}
        <div className="mt-4 flex items-start gap-2 text-gray-500 text-xs leading-relaxed">
          <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
          <span className="line-clamp-2">
            {restaurant.address ||
              `${restaurant.latitude.toFixed(4)}, ${restaurant.longitude.toFixed(4)}`}
          </span>
        </div>
      </div>

      <div className="mt-5 pt-3.5 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-1.5 font-medium">
          <span className="px-2 py-0.5 bg-gray-100 rounded text-[11px] text-gray-600">
            {restaurant.reviewCount === 1
              ? "1 Review"
              : `${restaurant.reviewCount || 0} Reviews`}
          </span>
        </div>

        <div className="flex items-center gap-1 font-semibold text-orange-600 group-hover:translate-x-0.5 transition-transform">
          <span>View Details</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </Link>
  );
};
