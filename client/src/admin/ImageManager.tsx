import { useRef, useState } from 'react';
import { adminApi } from '@/api/endpoints';
import { ApiRequestError, resolveAssetUrl } from '@/api/client';
import { useToast } from '@/context/ToastContext';

export function ImageField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const upload = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true);
    try {
      const result = await adminApi.uploadImages(files);
      if (result.urls[0]) onChange(result.urls[0]);
      toast('Image uploaded');
    } catch (err) {
      toast(err instanceof ApiRequestError ? err.message : 'Upload failed', 'error');
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div>
      <span className="field-label">{label}</span>
      <div className="flex gap-2">
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="/images/… or https://…"
          className="field flex-1"
        />
        <button
          type="button"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
          className="btn-line shrink-0 !px-4 !py-2 text-[10px]"
        >
          {busy ? '…' : 'Upload'}
        </button>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        className="hidden"
        onChange={(event) => void upload(event.target.files)}
      />
      {value ? (
        <div className="mt-2 flex items-center gap-3">
          <img src={resolveAssetUrl(value)} alt="" className="h-16 w-12 border border-ink/10 object-cover" />
          <button
            type="button"
            onClick={() => onChange('')}
            className="text-[10px] uppercase tracking-wide2 text-ink-faint hover:text-wine-600"
          >
            Remove
          </button>
        </div>
      ) : null}
    </div>
  );
}

export function ImageManager({
  images,
  onChange,
}: {
  images: string[];
  onChange: (images: string[]) => void;
}) {
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [url, setUrl] = useState('');

  const upload = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true);
    try {
      const result = await adminApi.uploadImages(files);
      onChange([...images, ...result.urls].slice(0, 10));
      toast(`${result.urls.length} image${result.urls.length === 1 ? '' : 's'} uploaded`);
    } catch (err) {
      toast(err instanceof ApiRequestError ? err.message : 'Upload failed', 'error');
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const move = (index: number, direction: -1 | 1) => {
    const next = [...images];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  return (
    <div>
      <div className="flex flex-wrap items-end gap-2">
        <label className="min-w-[12rem] flex-1">
          <span className="field-label">Add by URL</span>
          <input
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder="/images/piece.jpg or https://…"
            className="field"
          />
        </label>
        <button
          type="button"
          onClick={() => {
            const value = url.trim();
            if (!value) return;
            onChange([...images, value].slice(0, 10));
            setUrl('');
          }}
          className="btn-line !px-4 !py-2.5 text-[10px]"
        >
          Add
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
          className="btn-solid !px-4 !py-2.5 text-[10px]"
        >
          {busy ? 'Uploading…' : 'Upload images'}
        </button>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,image/avif"
          className="hidden"
          onChange={(event) => void upload(event.target.files)}
        />
      </div>

      {images.length ? (
        <ul className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
          {images.map((image, index) => (
            <li key={`${image}-${index}`} className="border border-ink/10 bg-bone">
              <div className="relative aspect-[3/4] bg-sand/40">
                <img src={resolveAssetUrl(image)} alt="" className="h-full w-full object-cover" />
                {index === 0 ? (
                  <span className="absolute left-0 top-0 bg-ink px-1.5 py-0.5 text-[8px] uppercase tracking-wide2 text-ivory">
                    Cover
                  </span>
                ) : null}
              </div>
              <div className="flex items-center justify-between gap-1 px-1 py-1">
                <div className="flex gap-px">
                  <button
                    type="button"
                    onClick={() => move(index, -1)}
                    disabled={index === 0}
                    className="px-1.5 py-1 text-xs text-ink-soft hover:text-ink disabled:opacity-30"
                    aria-label="Move image earlier"
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    onClick={() => move(index, 1)}
                    disabled={index === images.length - 1}
                    className="px-1.5 py-1 text-xs text-ink-soft hover:text-ink disabled:opacity-30"
                    aria-label="Move image later"
                  >
                    →
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => onChange(images.filter((_, position) => position !== index))}
                  className="px-1.5 py-1 text-[9px] uppercase tracking-wide2 text-ink-faint hover:text-wine-600"
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-xs text-ink-faint">
          No images yet. Upload a photograph or paste a path — the first image is the cover.
        </p>
      )}
    </div>
  );
}
