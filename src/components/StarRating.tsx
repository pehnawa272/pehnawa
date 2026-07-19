"use client";

import React from 'react';

type StarRatingProps = {
  rating: number; // 1 to 5
  size?: number; // pixel size of each star
  className?: string;
  // optional click handler for editable stars
  onChange?: (newRating: number) => void;
};

const Star = ({ filled, size }: { filled: boolean; size: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={filled ? '#FFC107' : 'none'}
    stroke={filled ? '#FFC107' : '#CCCCCC'}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ marginRight: 2 }}
  >
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

export const StarRating: React.FC<StarRatingProps> = ({ rating, size = 24, className = '', onChange }) => {
  const stars = Array.from({ length: 5 }, (_, i) => i + 1);

  const handleClick = (value: number) => {
    if (onChange) onChange(value);
  };

  return (
    <div className={className} style={{ display: 'flex', alignItems: 'center' }}>
      {stars.map((value) => (
        <span key={value} onClick={() => onChange && handleClick(value)} style={{ cursor: onChange ? 'pointer' : 'default' }}>
          <Star filled={value <= rating} size={size} />
        </span>
      ))}
    </div>
  );
};

export default StarRating;
