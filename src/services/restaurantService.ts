import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from './firebase';
import { Restaurant } from '../types';
import { getAllReviews, calculateAverageRating } from './reviewService';

const COLLECTION_NAME = 'restaurants';

export const getRestaurants = async (): Promise<Restaurant[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
    const allReviews = await getAllReviews().catch(() => []);

    // Map reviews by restaurantId
    const reviewsByRestaurant: Record<string, { rating: number }[]> = {};
    allReviews.forEach((review) => {
      if (!reviewsByRestaurant[review.restaurantId]) {
        reviewsByRestaurant[review.restaurantId] = [];
      }
      reviewsByRestaurant[review.restaurantId].push({ rating: review.rating });
    });

    const restaurants: Restaurant[] = [];

    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const restaurantReviews = reviewsByRestaurant[docSnap.id] || [];
      const { average, count } = calculateAverageRating(restaurantReviews);

      restaurants.push({
        id: docSnap.id,
        name: data.name || 'Unnamed Restaurant',
        latitude: Number(data.latitude),
        longitude: Number(data.longitude),
        address: data.address || null,
        imageUrl: data.imageUrl || null,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        averageRating: average,
        reviewCount: count,
      });
    });

    // Default sort by newest
    restaurants.sort((a, b) => {
      const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : (a.createdAt?.seconds ? a.createdAt.seconds * 1000 : 0);
      const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : (b.createdAt?.seconds ? b.createdAt.seconds * 1000 : 0);
      return timeB - timeA;
    });

    return restaurants;
  } catch (error) {
    console.error('Error fetching restaurants:', error);
    throw error;
  }
};

export const getRestaurantById = async (id: string): Promise<Restaurant | null> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    const data = docSnap.data();
    return {
      id: docSnap.id,
      name: data.name,
      latitude: Number(data.latitude),
      longitude: Number(data.longitude),
      address: data.address || null,
      imageUrl: data.imageUrl || null,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  } catch (error) {
    console.error(`Error fetching restaurant with id ${id}:`, error);
    throw error;
  }
};

export const addRestaurant = async (
  restaurantData: Omit<Restaurant, 'id' | 'createdAt' | 'updatedAt' | 'averageRating' | 'reviewCount'>
): Promise<Restaurant> => {
  try {
    if (!restaurantData.name || !restaurantData.name.trim()) {
      throw new Error('Restaurant name is required.');
    }
    if (
      restaurantData.latitude === undefined ||
      restaurantData.latitude === null ||
      isNaN(restaurantData.latitude) ||
      restaurantData.longitude === undefined ||
      restaurantData.longitude === null ||
      isNaN(restaurantData.longitude)
    ) {
      throw new Error('Valid location coordinates (latitude and longitude) are required.');
    }

    const newDoc = {
      name: restaurantData.name.trim(),
      latitude: Number(restaurantData.latitude),
      longitude: Number(restaurantData.longitude),
      address: restaurantData.address ? restaurantData.address.trim() : null,
      imageUrl: restaurantData.imageUrl ? restaurantData.imageUrl.trim() : null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, COLLECTION_NAME), newDoc);

    return {
      id: docRef.id,
      ...newDoc,
      averageRating: null,
      reviewCount: 0,
    };
  } catch (error) {
    console.error('Error adding restaurant:', error);
    throw error;
  }
};

export const updateRestaurant = async (
  id: string,
  restaurantData: Partial<Omit<Restaurant, 'id' | 'createdAt'>>
): Promise<void> => {
  try {
    const updatePayload: Record<string, any> = {
      updatedAt: serverTimestamp(),
    };

    if (restaurantData.name !== undefined) {
      if (!restaurantData.name.trim()) throw new Error('Restaurant name cannot be empty.');
      updatePayload.name = restaurantData.name.trim();
    }

    if (restaurantData.latitude !== undefined && restaurantData.longitude !== undefined) {
      if (isNaN(Number(restaurantData.latitude)) || isNaN(Number(restaurantData.longitude))) {
        throw new Error('Coordinates must be numeric.');
      }
      updatePayload.latitude = Number(restaurantData.latitude);
      updatePayload.longitude = Number(restaurantData.longitude);
    }

    if (restaurantData.address !== undefined) {
      updatePayload.address = restaurantData.address ? restaurantData.address.trim() : null;
    }

    if (restaurantData.imageUrl !== undefined) {
      updatePayload.imageUrl = restaurantData.imageUrl ? restaurantData.imageUrl.trim() : null;
    }

    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, updatePayload);
  } catch (error) {
    console.error('Error updating restaurant:', error);
    throw error;
  }
};

export const deleteRestaurant = async (id: string): Promise<void> => {
  try {
    // 1. Find all reviews associated with this restaurant
    const reviewsQuery = query(collection(db, 'reviews'), where('restaurantId', '==', id));
    const reviewsSnapshot = await getDocs(reviewsQuery);

    const batch = writeBatch(db);

    // 2. Delete all related reviews in batch
    reviewsSnapshot.forEach((reviewDoc) => {
      batch.delete(reviewDoc.ref);
    });

    // 3. Delete the restaurant document
    const restaurantRef = doc(db, COLLECTION_NAME, id);
    batch.delete(restaurantRef);

    // Commit batch
    await batch.commit();
  } catch (error) {
    console.error('Error deleting restaurant and reviews:', error);
    throw error;
  }
};
