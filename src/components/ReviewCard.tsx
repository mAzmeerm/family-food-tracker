import React from 'react';
import { Edit3, Trash2, Clock } from 'lucide-react';
import { Review } from '../types';
import { Rating } from './Rating';
import { formatDate } from '../utils/helpers';

interface ReviewCardProps {
  review: Review;
  onEdit: (review: Review) => void;
  onDelete: (review: Review) => void;
}

const getMemberAvatarStyle = (name: string) => {
  const colors = [
    'bg-blue-100 text-blue-700 border-blue-200',
    'bg-emerald-100 text-emerald-700 border-emerald-200',
    'bg-purple-100 text-purple-700 border-purple-200',
    'bg-orange-100 text-orange-700 border-orange-200',
    'bg-rose-100 text-rose-700 border-rose-200',
    'bg-amber-100 text-amber-700 border-amber-200',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

export const ReviewCard: React.FC<ReviewCardProps> = ({
  review,
  onEdit,
  onDelete,
}) => {
  const avatarStyle = getMemberAvatarStyle(review.memberName || 'Family');

  return (
    <div
      id={`review-card-${review.id}`}
      className="p-4 rounded-xl bg-gray-50/70 border border-gray-100 hover:border-gray-200 transition-all duration-200"
    >
      <div className="flex items-start justify-between gap-3 mb-2.5">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full border flex items-center justify-center font-bold text-xs shrink-0 ${avatarStyle}`}>
            {review.memberName ? review.memberName.charAt(0).toUpperCase() : 'F'}
          </div>
          <div>
            <h4 className="font-bold text-gray-900 text-sm leading-tight">
              {review.memberName}
            </h4>
            <div className="flex items-center gap-2 mt-0.5">
              <Rating value={review.rating} readOnly size="sm" />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            id={`edit-review-${review.id}-btn`}
            type="button"
            onClick={() => onEdit(review)}
            className="p-1.5 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors cursor-pointer"
            title="Edit review"
            aria-label="Edit review"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          <button
            id={`delete-review-${review.id}-btn`}
            type="button"
            onClick={() => onDelete(review)}
            className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
            title="Delete review"
            aria-label="Delete review"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {review.feedback ? (
        <div className="mt-2 text-gray-600 text-sm leading-relaxed pl-11">
          <p className="italic">"{review.feedback}"</p>
          {review.createdAt && (
            <div className="text-[11px] text-gray-400 flex items-center gap-1 mt-1.5 not-italic">
              <Clock className="w-3 h-3" />
              <span>{formatDate(review.createdAt)}</span>
            </div>
          )}
        </div>
      ) : (
        <div className="mt-1 text-xs text-gray-400 italic pl-11">
          No written feedback provided.
          {review.createdAt && (
            <span className="ml-2 not-italic">• {formatDate(review.createdAt)}</span>
          )}
        </div>
      )}
    </div>
  );
};
