import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onChange?: (rating: number) => void;
  showValue?: boolean;
}

const StarRating = ({ 
  rating, 
  maxRating = 5, 
  size = 'md', 
  interactive = false,
  onChange,
  showValue = false
}: StarRatingProps) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  const handleClick = (value: number) => {
    if (interactive && onChange) {
      onChange(value);
    }
  };

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: maxRating }, (_, i) => i + 1).map((value) => (
        <button
          key={value}
          type="button"
          onClick={() => handleClick(value)}
          disabled={!interactive}
          className={cn(
            'transition-colors',
            interactive && 'cursor-pointer hover:scale-110 transition-transform',
            !interactive && 'cursor-default'
          )}
        >
          <Star
            className={cn(
              sizeClasses[size],
              value <= rating 
                ? 'fill-yellow-400 text-yellow-400' 
                : 'fill-transparent text-muted-foreground/30'
            )}
          />
        </button>
      ))}
      {showValue && (
        <span className="ml-2 text-sm font-medium text-muted-foreground">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
};

export default StarRating;
