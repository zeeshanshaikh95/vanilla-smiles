import { Link } from 'react-router-dom';

interface Props {
  eyebrow: string;
  title: string;
  description?: string;
  linkTo?: string;
  linkLabel?: string;
  align?: 'left' | 'center';
}

export function SectionIntro({
  eyebrow,
  title,
  description,
  linkTo,
  linkLabel = 'View all',
  align = 'left',
}: Props) {
  return (
    <div
      className={`flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between ${
        align === 'center' ? 'sm:flex-col sm:items-center' : ''
      }`}
    >
      <div className={align === 'center' ? 'text-center' : ''}>
        <p className="eyebrow">{eyebrow}</p>
        <h2 className="mt-3 font-display text-3xl leading-tight sm:text-[2.6rem]">{title}</h2>
        {description ? (
          <p className={`mt-3 max-w-xl text-sm leading-relaxed text-ink-soft ${align === 'center' ? 'mx-auto' : ''}`}>
            {description}
          </p>
        ) : null}
      </div>

      {linkTo ? (
        <Link
          to={linkTo}
          className="group inline-flex shrink-0 items-center gap-2 text-[10px] uppercase tracking-wide2 text-ink-soft transition-colors hover:text-ink"
        >
          {linkLabel}
          <span className="h-px w-6 bg-ink/30 transition-all duration-300 group-hover:w-9 group-hover:bg-ink" />
        </Link>
      ) : null}
    </div>
  );
}
