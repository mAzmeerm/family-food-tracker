import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import { Restaurant } from '../types';

interface RestaurantMapProps {
  restaurants: Restaurant[];
  selectedRestaurantId?: string | null;
  height?: string;
  zoom?: number;
  center?: [number, number];
}

const createRestaurantPin = (hasRating: boolean, rating?: number | null) => {
  const ratingBadge = hasRating && rating ? rating.toFixed(1) : '🍴';
  
  return L.divIcon({
    className: 'custom-food-marker',
    html: `
      <div style="
        background: #f97316;
        width: 38px;
        height: 38px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 6px 14px rgba(249, 115, 22, 0.4);
        border: 2.5px solid white;
        cursor: pointer;
      ">
        <div style="transform: rotate(45deg); color: white; font-weight: 700; font-size: 11px; line-height: 1; display: flex; align-items: center; justify-content: center;">
          ${ratingBadge}
        </div>
      </div>
    `,
    iconSize: [38, 38],
    iconAnchor: [19, 38],
    popupAnchor: [0, -38],
  });
};

export const RestaurantMap: React.FC<RestaurantMapProps> = ({
  restaurants,
  selectedRestaurantId,
  height = '500px',
  zoom,
  center,
}) => {
  const navigate = useNavigate();
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Default initial center (Malaysia or first restaurant)
      const initialLat = center ? center[0] : (restaurants.length > 0 ? restaurants[0].latitude : 3.1390);
      const initialLng = center ? center[1] : (restaurants.length > 0 ? restaurants[0].longitude : 101.6869);

      const map = L.map(mapContainerRef.current, {
        center: [initialLat, initialLng],
        zoom: zoom || 13,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      const markersLayer = L.layerGroup().addTo(map);
      markersLayerRef.current = markersLayer;
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update markers when restaurants change
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    if (!map || !markersLayer) return;

    markersLayer.clearLayers();

    if (restaurants.length === 0) return;

    const bounds = L.latLngBounds([]);

    restaurants.forEach((restaurant) => {
      if (isNaN(restaurant.latitude) || isNaN(restaurant.longitude)) return;

      const latLng = L.latLng(restaurant.latitude, restaurant.longitude);
      bounds.extend(latLng);

      const hasRating = restaurant.averageRating !== null && restaurant.averageRating !== undefined;
      const marker = L.marker(latLng, {
        icon: createRestaurantPin(hasRating, restaurant.averageRating),
      });

      // Custom Leaflet Popup HTML
      const popupDiv = document.createElement('div');
      popupDiv.className = 'p-4 max-w-[260px] text-gray-800 font-sans';
      
      const ratingHtml = hasRating
        ? `<div style="display:flex; align-items:center; gap:4px; font-weight:700; color:#f97316; font-size:13px; margin-top:2px;">
            <span>⭐ ${restaurant.averageRating?.toFixed(1)} / 5</span>
            <span style="font-size:11px; color:#6b7280; font-weight:500;">(${restaurant.reviewCount || 0} reviews)</span>
          </div>`
        : `<div style="font-size:11px; color:#9ca3af; margin-top:2px;">No reviews yet</div>`;

      const addressHtml = restaurant.address
        ? `<p style="font-size:11px; color:#4b5563; margin-top:6px; line-height:1.3; overflow:hidden; text-overflow:ellipsis; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical;">📍 ${restaurant.address}</p>`
        : '';

      popupDiv.innerHTML = `
        <h4 style="font-size:15px; font-weight:700; color:#111827; margin:0 0 2px 0;">
          ${restaurant.name}
        </h4>
        ${ratingHtml}
        ${addressHtml}
        <div style="margin-top:10px; padding-top:8px; border-top:1px solid #f3f4f6; display:flex; justify-content:flex-end;">
          <button 
            id="popup-details-btn-${restaurant.id}"
            style="background:#f97316; color:white; border:none; padding:6px 12px; border-radius:8px; font-size:12px; font-weight:600; cursor:pointer;"
          >
            View Details →
          </button>
        </div>
      `;

      // Attach button click event
      const detailsBtn = popupDiv.querySelector(`#popup-details-btn-${restaurant.id}`);
      if (detailsBtn) {
        detailsBtn.addEventListener('click', () => {
          navigate(`/restaurant/${restaurant.id}`);
        });
      }

      marker.bindPopup(popupDiv);
      markersLayer.addLayer(marker);

      if (selectedRestaurantId && restaurant.id === selectedRestaurantId) {
        marker.openPopup();
      }
    });

    if (bounds.isValid()) {
      if (restaurants.length === 1) {
        map.setView(bounds.getCenter(), zoom || 15);
      } else {
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
      }
    }
  }, [restaurants, selectedRestaurantId, zoom, navigate]);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-stone-200 shadow-xs bg-stone-100">
      <div
        ref={mapContainerRef}
        id="restaurant-map-canvas"
        style={{ height }}
        className="w-full z-0"
      />
    </div>
  );
};
