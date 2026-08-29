export interface FamilyMember {
  id: string;
  name: string;
  createdAt?: any;
}

export interface Restaurant {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  address: string | null;
  imageUrl?: string | null;
  createdAt?: any;
  updatedAt?: any;
  // Computed values
  averageRating?: number | null;
  reviewCount?: number;
}

export interface Review {
  id: string;
  restaurantId: string;
  memberId: string;
  memberName: string;
  rating: number;
  feedback: string;
  createdAt?: any;
  updatedAt?: any;
}

export type SortOption = 'newest' | 'oldest' | 'highest_rating' | 'lowest_rating' | 'name';

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
}

export interface GeocodeResult {
  displayName: string;
  addressDetails?: Record<string, string>;
}
