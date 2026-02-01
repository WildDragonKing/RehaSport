import { useState } from "react";

interface StarRatingProps {
  rating: number | null;
  onRate?: (rating: number) => void;
  readonly?: boolean;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

function StarIcon({
  filled,
  partial,
}: {
  filled: boolean;
  partial?: number;
}): JSX.Element {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{
        color: filled ? "var(--color-rating-star)" : "var(--color-text-muted)",
      }}
    >
      {partial !== undefined && partial > 0 && partial < 1 && (
        <defs>
          <linearGradient id={`star-grad-${partial}`}>
            <stop
              offset={`${partial * 100}%`}
              stopColor="var(--color-rating-star)"
            />
            <stop offset={`${partial * 100}%`} stopColor="transparent" />
          </linearGradient>
        </defs>
      )}
      <polygon
        points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
        fill={
          partial !== undefined && partial > 0 && partial < 1
            ? `url(#star-grad-${partial})`
            : filled
              ? "currentColor"
              : "none"
        }
      />
    </svg>
  );
}

export default function StarRating({
  rating,
  onRate,
  readonly = false,
  size = "md",
  showLabel = true,
}: StarRatingProps): JSX.Element {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const displayRating = hoverRating ?? rating ?? 0;

  const sizeClasses = {
    sm: "star-rating-sm",
    md: "star-rating-md",
    lg: "star-rating-lg",
  };

  const labels: Record<number, string> = {
    1: "Nicht hilfreich",
    2: "Weniger hilfreich",
    3: "Okay",
    4: "Hilfreich",
    5: "Sehr hilfreich",
  };

  return (
    <div
      className={`star-rating ${sizeClasses[size]} ${readonly ? "readonly" : ""}`}
    >
      <div
        className="star-rating-stars"
        onMouseLeave={() => !readonly && setHoverRating(null)}
      >
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className={`star-rating-star ${star <= displayRating ? "filled" : ""}`}
            onClick={() => !readonly && onRate?.(star)}
            onMouseEnter={() => !readonly && setHoverRating(star)}
            disabled={readonly}
            aria-label={`${star} Stern${star > 1 ? "e" : ""}`}
          >
            <StarIcon filled={star <= displayRating} />
          </button>
        ))}
      </div>

      {showLabel && displayRating > 0 && (
        <span className="star-rating-label">
          {labels[Math.round(displayRating)]}
        </span>
      )}

      {!readonly && rating === null && !hoverRating && (
        <span className="star-rating-prompt">
          Bewerten Sie diese {size === "lg" ? "Stunde" : "Übung"}
        </span>
      )}
    </div>
  );
}
