import { Link } from 'react-router-dom';

interface Props {
  size?: 'sm' | 'md' | 'lg';
  withTagline?: boolean;
  onDark?: boolean;
  asLink?: boolean;
  className?: string;
}

const SIZES: Record<NonNullable<Props['size']>, string> = {
  sm: 'text-[15px] tracking-[0.16em]',
  md: 'text-xl tracking-[0.15em]',
  lg: 'text-3xl sm:text-4xl tracking-[0.12em]',
};

const MARK_SIZES: Record<NonNullable<Props['size']>, string> = {
  sm: 'h-7 w-7',
  md: 'h-9 w-9',
  lg: 'h-12 w-12',
};

/** A tooth silhouette with a champagne sparkle — drawn, never a stretched bitmap. */
function ToothMark({ className = '', onDark = false }: { className?: string; onDark?: boolean }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true" fill="none">
      <defs>
        <linearGradient id="vs-tooth" x1="6" y1="2" x2="34" y2="38" gradientUnits="userSpaceOnUse">
          <stop stopColor={onDark ? '#FFFDF8' : '#FFFFFF'} />
          <stop offset="0.55" stopColor={onDark ? '#C8E4DE' : '#D8EDE9'} />
          <stop offset="1" stopColor={onDark ? '#7FC5BA' : '#AEDBD3'} />
        </linearGradient>
      </defs>
      <path
        d="M20 4.6c-4.4 0-6.6 1.9-9 1.9-1.7 0-3.4-1.3-4.8-.2-1.9 1.5-2.3 5.6-1.4 9.7.7 3.2 1.2 4.6 2 7.4.7 2.5 1 5.2 1.9 8.9.5 2.1 1.2 3.9 2.6 3.9 1.6 0 2.1-2.2 2.5-4.4.5-2.7 1.2-6 3.1-6 1.9 0 2.6 3.3 3.1 6 .4 2.2.9 4.4 2.5 4.4 1.4 0 2.1-1.8 2.6-3.9.9-3.7 1.2-6.4 1.9-8.9.8-2.8 1.3-4.2 2-7.4.9-4.1.5-8.2-1.4-9.7-1.4-1.1-3.1.2-4.8.2-2.4 0-4.6-1.9-9-1.9Z"
        fill="url(#vs-tooth)"
        stroke={onDark ? 'rgba(255,255,255,0.55)' : '#7FC5BA'}
        strokeWidth="0.9"
        strokeLinejoin="round"
      />
      <path
        d="M25.6 14.2l.85 2.2 2.2.85-2.2.85-.85 2.2-.85-2.2-2.2-.85 2.2-.85.85-2.2Z"
        fill={onDark ? '#E3CB90' : '#C09A45'}
      />
    </svg>
  );
}

/**
 * The house lockup: a drawn tooth mark beside VANILLA SMILES in a soft serif,
 * with the clinic's department line beneath. Type and vector only.
 */
export function Wordmark({
  size = 'md',
  withTagline = true,
  onDark = false,
  asLink = true,
  className = '',
}: Props) {
  const content = (
    <span className={`inline-flex items-center gap-2.5 leading-none ${className}`}>
      <ToothMark className={`${MARK_SIZES[size]} shrink-0`} onDark={onDark} />
      <span className="flex flex-col">
        <span
          className={`font-display uppercase ${SIZES[size]} ${onDark ? 'text-ivory' : 'text-teal-900'}`}
        >
          Vanilla&nbsp;Smiles
        </span>
        {withTagline ? (
          <span
            className={`mt-1.5 text-[7.5px] font-semibold uppercase tracking-micro sm:text-[8px] ${
              onDark ? 'text-ivory/60' : 'text-teal-600/80'
            }`}
          >
            Dental &amp; Esthetic Care
          </span>
        ) : null}
      </span>
    </span>
  );

  if (!asLink) return content;

  return (
    <Link to="/" aria-label="Vanilla Smiles — home" className="shrink-0">
      {content}
    </Link>
  );
}

export { ToothMark };
