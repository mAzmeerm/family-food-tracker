export const formatDate = (timestamp: any): string => {
  if (!timestamp) return '';

  let date: Date;
  if (timestamp instanceof Date) {
    date = timestamp;
  } else if (typeof timestamp.toDate === 'function') {
    date = timestamp.toDate();
  } else if (timestamp.seconds) {
    date = new Date(timestamp.seconds * 1000);
  } else if (typeof timestamp === 'string' || typeof timestamp === 'number') {
    date = new Date(timestamp);
  } else {
    return '';
  }

  if (isNaN(date.getTime())) return '';

  return new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
};

export const getGoogleMapsUrl = (latitude: number, longitude: number, name?: string): string => {
  if (name) {
    const encodedName = encodeURIComponent(name);
    return `https://www.google.com/maps/search/?api=1&query=${encodedName}&query_place_id=&center=${latitude},${longitude}`;
  }
  return `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
};

export const formatRating = (rating?: number | null): string => {
  if (rating === undefined || rating === null || isNaN(rating)) {
    return 'No reviews yet';
  }
  return `${rating.toFixed(1)} / 5`;
};
