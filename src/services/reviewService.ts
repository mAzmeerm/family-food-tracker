import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './firebase';
import { Review } from '../types';

const COLLECTION_NAME = 'reviews';

export const getReviewsForRestaurant = async (restaurantId: string): Promise<Review[]> => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('restaurantId', '==', restaurantId)
    );
    const querySnapshot = await getDocs(q);
    const reviews: Review[] = [];

    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      reviews.push({
        id: docSnap.id,
        restaurantId: data.restaurantId,
        memberId: data.memberId,
        memberName: data.memberName,
        rating: Number(data.rating),
        feedback: data.feedback || '',
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      });
    });

    // Sort client-side by date descending
    reviews.sort((a, b) => {
      const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : (a.createdAt?.seconds ? a.createdAt.seconds * 1000 : 0);
      const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : (b.createdAt?.seconds ? b.createdAt.seconds * 1000 : 0);
      return timeB - timeA;
    });

    return reviews;
  } catch (error) {
    console.error('Error fetching reviews for restaurant:', error);
    throw error;
  }
};

export const getAllReviews = async (): Promise<Review[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
    const reviews: Review[] = [];

    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      reviews.push({
        id: docSnap.id,
        restaurantId: data.restaurantId,
        memberId: data.memberId,
        memberName: data.memberName,
        rating: Number(data.rating),
        feedback: data.feedback || '',
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      });
    });

    return reviews;
  } catch (error) {
    console.error('Error fetching all reviews:', error);
    throw error;
  }
};

export const addReview = async (
  reviewData: Omit<Review, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Review> => {
  try {
    if (!reviewData.restaurantId) throw new Error('Restaurant ID is required.');
    if (!reviewData.memberId) throw new Error('Reviewer is required.');
    if (!reviewData.memberName) throw new Error('Reviewer name is required.');
    if (!reviewData.rating || reviewData.rating < 1 || reviewData.rating > 5) {
      throw new Error('Rating must be between 1 and 5 stars.');
    }

    const newDoc = {
      restaurantId: reviewData.restaurantId,
      memberId: reviewData.memberId,
      memberName: reviewData.memberName.trim(),
      rating: Math.round(reviewData.rating),
      feedback: (reviewData.feedback || '').trim(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, COLLECTION_NAME), newDoc);

    return {
      id: docRef.id,
      ...newDoc,
    };
  } catch (error) {
    console.error('Error adding review:', error);
    throw error;
  }
};

export const updateReview = async (
  id: string,
  reviewData: Partial<Omit<Review, 'id' | 'createdAt'>>
): Promise<void> => {
  try {
    const updatePayload: Record<string, any> = {
      updatedAt: serverTimestamp(),
    };

    if (reviewData.memberId) updatePayload.memberId = reviewData.memberId;
    if (reviewData.memberName) updatePayload.memberName = reviewData.memberName.trim();
    if (reviewData.rating !== undefined) {
      if (reviewData.rating < 1 || reviewData.rating > 5) {
        throw new Error('Rating must be between 1 and 5 stars.');
      }
      updatePayload.rating = Math.round(reviewData.rating);
    }
    if (reviewData.feedback !== undefined) {
      updatePayload.feedback = reviewData.feedback.trim();
    }

    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, updatePayload);
  } catch (error) {
    console.error('Error updating review:', error);
    throw error;
  }
};

export const deleteReview = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
  } catch (error) {
    console.error('Error deleting review:', error);
    throw error;
  }
};

export const calculateAverageRating = (
  reviews: { rating: number }[]
): { average: number | null; count: number } => {
  if (!reviews || reviews.length === 0) {
    return { average: null, count: 0 };
  }

  const validRatings = reviews.map((r) => Number(r.rating)).filter((r) => !isNaN(r) && r >= 1 && r <= 5);
  if (validRatings.length === 0) {
    return { average: null, count: 0 };
  }

  const sum = validRatings.reduce((acc, curr) => acc + curr, 0);
  const average = Math.round((sum / validRatings.length) * 10) / 10;
  return { average, count: validRatings.length };
};
