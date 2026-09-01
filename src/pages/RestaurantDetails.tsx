import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  Star,
  Plus,
  ExternalLink,
  Edit2,
  Trash2,
  AlertCircle,
  MessageSquare,
  UtensilsCrossed,
  Share2,
  Images,
} from "lucide-react";
import {
  getRestaurantById,
  deleteRestaurant,
} from "../services/restaurantService";
import {
  getReviewsForRestaurant,
  addReview,
  updateReview,
  deleteReview,
  calculateAverageRating,
} from "../services/reviewService";
import { Restaurant, Review } from "../types";
import { Rating } from "../components/Rating";
import { ReviewCard } from "../components/ReviewCard";
import { ReviewModal } from "../components/ReviewModal";
import { RestaurantMap } from "../components/RestaurantMap";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { Loading } from "../components/Loading";
import { getGoogleMapsUrl } from "../utils/helpers";

export const RestaurantDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Review Modal State
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewToEdit, setReviewToEdit] = useState<Review | null>(null);

  // Delete Restaurant Dialog
  const [isDeleteRestaurantOpen, setIsDeleteRestaurantOpen] = useState(false);
  const [isDeletingRestaurant, setIsDeletingRestaurant] = useState(false);

  // Delete Review Dialog
  const [reviewToDelete, setReviewToDelete] = useState<Review | null>(null);
  const [isDeletingReview, setIsDeletingReview] = useState(false);

  useEffect(() => {
    if (!id) return;
    loadData(id);
  }, [id]);

  const loadData = async (restaurantId: string) => {
    setLoading(true);
    setError(null);
    try {
      const [restData, reviewList] = await Promise.all([
        getRestaurantById(restaurantId),
        getReviewsForRestaurant(restaurantId),
      ]);

      if (!restData) {
        setError("Restaurant not found.");
        return;
      }

      const { average, count } = calculateAverageRating(reviewList);
      setRestaurant({
        ...restData,
        averageRating: average,
        reviewCount: count,
      });
      setReviews(reviewList);
    } catch (err: any) {
      console.error("Error loading restaurant details:", err);
      setError("Failed to load restaurant details.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddReview = () => {
    setReviewToEdit(null);
    setIsReviewModalOpen(true);
  };

  const handleOpenEditReview = (review: Review) => {
    setReviewToEdit(review);
    setIsReviewModalOpen(true);
  };

  const handleReviewSubmit = async (reviewData: {
    restaurantId: string;
    memberId: string;
    memberName: string;
    rating: number;
    feedback: string;
  }) => {
    if (!id) return;

    if (reviewToEdit) {
      // Update
      await updateReview(reviewToEdit.id, reviewData);
      const updatedReviews = reviews.map((r) =>
        r.id === reviewToEdit.id ? { ...r, ...reviewData } : r,
      );
      setReviews(updatedReviews);
      const { average, count } = calculateAverageRating(updatedReviews);
      setRestaurant((prev) =>
        prev ? { ...prev, averageRating: average, reviewCount: count } : null,
      );
    } else {
      // Create
      const created = await addReview(reviewData);
      const updatedReviews = [created, ...reviews];
      setReviews(updatedReviews);
      const { average, count } = calculateAverageRating(updatedReviews);
      setRestaurant((prev) =>
        prev ? { ...prev, averageRating: average, reviewCount: count } : null,
      );
    }
  };

  const handleDeleteReview = async () => {
    if (!reviewToDelete || !id) return;
    setIsDeletingReview(true);
    try {
      await deleteReview(reviewToDelete.id);
      const updatedReviews = reviews.filter((r) => r.id !== reviewToDelete.id);
      setReviews(updatedReviews);
      const { average, count } = calculateAverageRating(updatedReviews);
      setRestaurant((prev) =>
        prev ? { ...prev, averageRating: average, reviewCount: count } : null,
      );
      setReviewToDelete(null);
    } catch (err) {
      console.error("Error deleting review:", err);
      alert("Failed to delete review.");
    } finally {
      setIsDeletingReview(false);
    }
  };

  const handleDeleteRestaurant = async () => {
    if (!id) return;
    setIsDeletingRestaurant(true);
    try {
      await deleteRestaurant(id);
      navigate("/");
    } catch (err) {
      console.error("Error deleting restaurant:", err);
      alert("Failed to delete restaurant.");
      setIsDeletingRestaurant(false);
    }
  };

  if (loading) {
    return <Loading message="Loading restaurant journal..." fullScreen />;
  }

  if (error || !restaurant) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center">
        <div className="p-8 bg-white rounded-3xl border border-stone-200 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-stone-900 mb-2 font-display">
            Restaurant Not Found
          </h2>
          <p className="text-sm text-stone-500 mb-6">
            {error || "This restaurant record does not exist."}
          </p>
          <Link
            to="/"
            className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-sm font-semibold inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Home</span>
          </Link>
        </div>
      </div>
    );
  }

  const hasRating =
    restaurant.averageRating !== null && restaurant.averageRating !== undefined;
  const googleMapsUrl = getGoogleMapsUrl(
    restaurant.latitude,
    restaurant.longitude,
    restaurant.name,
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top action row */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <Link
          to="/"
          id="back-to-home-link"
          className="inline-flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Restaurants</span>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            to={`/edit-restaurant/${restaurant.id}`}
            id="edit-restaurant-btn"
            className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-gray-50 text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Edit</span>
          </Link>

          <button
            id="delete-restaurant-btn"
            type="button"
            onClick={() => setIsDeleteRestaurantOpen(true)}
            className="px-3 py-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* Main Restaurant Info Card */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-200 shadow-xs mb-8">
        {/* Restaurant Photos */}
        {restaurant.photos && restaurant.photos.length > 0 && (
          <div className="mb-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {restaurant.photos.map((photo, index) => (
                <div
                  key={`${photo}-${index}`}
                  className={`rounded-xl overflow-hidden bg-gray-100 ${
                    index === 0
                      ? "col-span-2 sm:col-span-2 aspect-[16/9]"
                      : "aspect-square"
                  }`}
                >
                  <img
                    src={photo}
                    alt={`${restaurant.name} photo ${index + 1}`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    loading={index === 0 ? "eager" : "lazy"}
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-gray-100">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-orange-600 mb-1">
              <UtensilsCrossed className="w-3.5 h-3.5" />
              <span>Family Visited Spot</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              {restaurant.name}
            </h1>

            {restaurant.address && (
              <div className="flex items-start gap-2 mt-2 text-sm text-gray-500">
                <MapPin className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                <span>{restaurant.address}</span>
              </div>
            )}
          </div>

          {/* Average Rating Block */}
          <div className="sm:text-right bg-orange-50/50 sm:bg-transparent p-4 sm:p-0 rounded-xl border sm:border-0 border-orange-100">
            {hasRating ? (
              <div>
                <div className="flex items-center sm:justify-end gap-2 text-orange-500 font-bold">
                  <Star className="w-6 h-6 fill-orange-400 text-orange-500" />
                  <span className="text-3xl font-black text-gray-900">
                    {restaurant.averageRating?.toFixed(1)}
                  </span>
                  <span className="text-sm font-semibold text-gray-400">
                    / 5
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1 font-medium">
                  Based on {reviews.length} family{" "}
                  {reviews.length === 1 ? "review" : "reviews"}
                </p>
              </div>
            ) : (
              <div>
                <span className="inline-block text-xs font-medium text-gray-500 bg-gray-100 px-3 py-1.5 rounded-lg">
                  No reviews yet
                </span>
                <p className="text-xs text-gray-400 mt-1">
                  Be the first to rate!
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Map and Location Preview */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-orange-500" />
              Location & Map
            </h3>

            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              id="open-google-maps-btn"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3.5 py-1.5 rounded-full border border-blue-100 transition-colors"
            >
              <span>Open in Google Maps</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <RestaurantMap
            restaurants={[restaurant]}
            selectedRestaurantId={restaurant.id}
            height="260px"
            zoom={15}
          />
        </div>
      </div>

      {/* Reviews Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400">
              Family Feedback ({reviews.length})
            </h2>
          </div>

          <button
            id="add-review-btn"
            type="button"
            onClick={handleOpenAddReview}
            className="px-3.5 py-2 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white text-xs sm:text-sm font-medium rounded-lg transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Review</span>
          </button>
        </div>

        {reviews.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center border border-dashed border-gray-300">
            <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center mx-auto mb-3 border border-orange-100">
              <Star className="w-6 h-6 fill-orange-300 text-orange-500" />
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-1">
              No family reviews yet
            </h3>
            <p className="text-xs text-gray-500 mb-5 max-w-sm mx-auto">
              Add individual ratings and thoughts from family members for this
              food stop.
            </p>
            <button
              id="empty-add-review-btn"
              type="button"
              onClick={handleOpenAddReview}
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-medium rounded-lg transition-colors inline-flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add First Review</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                onEdit={handleOpenEditReview}
                onDelete={(r) => setReviewToDelete(r)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit Review Modal */}
      <ReviewModal
        isOpen={isReviewModalOpen}
        restaurantId={restaurant.id}
        restaurantName={restaurant.name}
        reviewToEdit={reviewToEdit}
        onClose={() => {
          setIsReviewModalOpen(false);
          setReviewToEdit(null);
        }}
        onSubmit={handleReviewSubmit}
      />

      {/* Delete Restaurant Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteRestaurantOpen}
        title="Delete Restaurant?"
        message={`Are you sure you want to delete "${restaurant.name}"? This will also permanently remove all ${reviews.length} family reviews associated with it.`}
        confirmText="Delete Restaurant"
        isDestructive={true}
        isLoading={isDeletingRestaurant}
        onConfirm={handleDeleteRestaurant}
        onCancel={() => setIsDeleteRestaurantOpen(false)}
      />

      {/* Delete Review Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(reviewToDelete)}
        title="Delete Review?"
        message={`Are you sure you want to remove the review by ${reviewToDelete?.memberName || "this family member"}?`}
        confirmText="Delete Review"
        isDestructive={true}
        isLoading={isDeletingReview}
        onConfirm={handleDeleteReview}
        onCancel={() => setReviewToDelete(null)}
      />
    </div>
  );
};
