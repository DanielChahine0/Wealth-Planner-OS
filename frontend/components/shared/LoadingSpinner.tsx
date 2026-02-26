interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  message?: string;
}

export function LoadingSpinner({ size = "md", message }: LoadingSpinnerProps) {
  const sizes = { sm: "h-5 w-5", md: "h-8 w-8", lg: "h-12 w-12" };
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-2">
      <div className="relative">
        <svg
          aria-hidden="true"
          className={`animate-spin text-gold ${sizes[size]}`}
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-15"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="3"
          />
          <path
            className="opacity-80"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      </div>
      {message && (
        <span role="status" aria-live="polite" className="text-sm text-mist font-medium tracking-wide">
          {message}
        </span>
      )}
    </div>
  );
}
