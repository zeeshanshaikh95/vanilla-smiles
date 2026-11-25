import type { ReactNode } from 'react';

interface Props {
  title: string;
  description?: string;
  action?: ReactNode;
  tone?: 'default' | 'error';
}

export function EmptyState({ title, description, action, tone = 'default' }: Props) {
  return (
    <div
      className={`flex flex-col items-center gap-3 border px-6 py-14 text-center ${
        tone === 'error' ? 'border-wine-500/25 bg-wine-500/[0.04]' : 'border-ink/10 bg-ivory'
      }`}
    >
      <p className="font-display text-2xl">{title}</p>
      {description ? <p className="max-w-md text-sm leading-relaxed text-ink-soft">{description}</p> : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}
