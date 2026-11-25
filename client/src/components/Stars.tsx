export function Stars({ rating, className = '' }: { rating: number; className?: string }) {
  return (
    <div
      className={`flex items-center gap-1 ${className}`}
      role="img"
      aria-label={`${rating} out of 5`}
    >
      {[1, 2, 3, 4, 5].map((value) => (
        <svg
          key={value}
          viewBox="0 0 24 24"
          className={`h-3 w-3 ${value <= rating ? 'text-ink' : 'text-ink/20'}`}
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M12 2l2.9 6.2 6.8.8-5 4.7 1.3 6.7L12 17.8 5.99 20.4 7.3 13.7 2.3 9l6.8-.8L12 2z" />
        </svg>
      ))}
    </div>
  );
}
