interface Props {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Delete',
  busy = false,
  onConfirm,
  onCancel,
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center px-5">
      <button type="button" aria-label="Cancel" onClick={onCancel} className="absolute inset-0 bg-ink/50" />
      <div role="dialog" aria-modal="true" className="relative w-full max-w-sm border border-ink/15 bg-bone p-6 shadow-panel">
        <h2 className="font-display text-2xl">{title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">{message}</p>
        <div className="mt-6 flex gap-2">
          <button type="button" onClick={onCancel} className="btn-line flex-1">
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className="btn flex-1 border-wine-600 bg-wine-600 text-ivory hover:bg-wine-700"
          >
            {busy ? 'Working…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
