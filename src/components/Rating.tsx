import React, { useState } from 'react';
import { Star } from 'lucide-react';

interface RatingProps {
  value: number | null | undefined;
  onChange?: (rating: number) => void;
  readOnly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showNumber?: boolean;
  className?: string;
}

export const Rating: React.FC<RatingProps> = ({
  value,
  onChange,
  readOnly = false,
  size = 'md',
  showNumber = false,
  className = '',
}) => {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const starSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-7 h-7',
  };

  const currentVal = hoverRating !== null ? hoverRating : (value || 0);

  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = star <= currentVal;
          const isHalf = !readOnly && false;

          return (
            <button
              key={star}
              type="button"
              disabled={readOnly}
              onClick={() => onChange && onChange(star)}
              onMouseEnter={() => !readOnly && setHoverRating(star)}
              onMouseLeave={() => !readOnly && setHoverRating(null)}
              className={`transition-transform duration-150 ${
                readOnly
                  ? 'cursor-default'
                  : 'cursor-pointer hover:scale-115 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 rounded-sm'
              }`}
              aria-label={readOnly ? `${value || 0} stars` : `Rate ${star} stars`}
            >
              <Star
                className={`${starSizes[size]} ${
                  isFilled
                    ? 'fill-orange-400 text-orange-500 drop-shadow-xs'
                    : 'fill-gray-100 text-gray-300'
                }`}
              />
            </button>
          );
        })}
      </div>
      {showNumber && value !== null && value !== undefined && (
        <span className="text-sm font-bold text-orange-500 ml-1">
          {value.toFixed(1)}
        </span>
      )}
    </div>
  );
};
