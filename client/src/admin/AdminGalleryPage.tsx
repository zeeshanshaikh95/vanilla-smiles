import { useState } from 'react';
import { adminApi } from '@/api/endpoints';
import { ApiRequestError, resolveAssetUrl } from '@/api/client';
import { useApi } from '@/hooks/useApi';
import { useToast } from '@/context/ToastContext';
import { PageHeader, Field, TextInput, Toggle, Section, Spinner, EmptyAdmin, Notice } from './AdminUI';
import { ImageField } from './ImageManager';
import { ConfirmDialog } from './ConfirmDialog';
import type { GalleryItem } from '@/types';

interface Draft {
  _id?: string;
  image: string;
  caption: string;
  externalUrl: string;
  displayOrder: number;
  active: boolean;
}

const EMPTY: Draft = { image: '', caption: '', externalUrl: '', displayOrder: 0, active: true };

export function AdminGalleryPage() {
  const { toast } = useToast();
  const { data, loading, error, refetch } = useApi(() => adminApi.listGallery(), []);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<GalleryItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const items = data?.items ?? [];

  const save = async () => {
    if (!draft) return;
    setSaving(true);
    setFormError(null);
    try {
      const payload = {
        image: draft.image,
        caption: draft.caption,
        externalUrl: draft.externalUrl,
        displayOrder: draft.displayOrder,
        active: draft.active,
      };
      if (draft._id) await adminApi.updateGalleryItem(draft._id, payload);
      else await adminApi.createGalleryItem(payload);
      toast(draft._id ? 'Gallery image updated' : 'Gallery image added');
      setDraft(null);
      refetch();
    } catch (err) {
      setFormError(err instanceof ApiRequestError ? err.message : 'Could not save the image.');
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (item: GalleryItem) => {
    try {
      await adminApi.updateGalleryItem(item._id, {
        image: item.image,
        caption: item.caption,
        externalUrl: item.externalUrl,
        displayOrder: item.displayOrder,
        active: !item.active,
      });
      refetch();
    } catch (err) {
      toast(err instanceof ApiRequestError ? err.message : 'Could not update', 'error');
    }
  };

  const remove = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await adminApi.deleteGalleryItem(toDelete._id);
      toast('Image removed');
      setToDelete(null);
      refetch();
    } catch (err) {
      toast(err instanceof ApiRequestError ? err.message : 'Could not remove the image', 'error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="The journal"
        title="Lookbook"
        description="Images shown on the homepage strip and the journal page. Link each one to the original Instagram post if you like."
        actions={
          <button type="button" onClick={() => setDraft({ ...EMPTY, displayOrder: items.length })} className="btn-solid !px-5 !py-2.5 text-[10px]">
            Add image
          </button>
        }
      />

      {draft ? (
        <Section
          title={draft._id ? 'Edit image' : 'New image'}
          actions={
            <button type="button" onClick={() => setDraft(null)} className="text-[10px] uppercase tracking-wide2 text-ink-faint hover:text-ink">
              Close
            </button>
          }
        >
          {formError ? <div className="mb-4"><Notice tone="warn">{formError}</Notice></div> : null}
          <div className="grid gap-4">
            <ImageField label="Image" value={draft.image} onChange={(value) => setDraft((current) => (current ? { ...current, image: value } : current))} />
            <Field label="Caption">
              <TextInput value={draft.caption} onChange={(value) => setDraft((current) => (current ? { ...current, caption: value } : current))} />
            </Field>
            <Field label="Link (optional)" hint="An Instagram post or collection URL">
              <TextInput value={draft.externalUrl} onChange={(value) => setDraft((current) => (current ? { ...current, externalUrl: value } : current))} />
            </Field>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Display order">
                <TextInput
                  type="number"
                  min={0}
                  value={String(draft.displayOrder)}
                  onChange={(value) => setDraft((current) => (current ? { ...current, displayOrder: Number(value) || 0 } : current))}
                />
              </Field>
              <Toggle checked={draft.active} onChange={(value) => setDraft((current) => (current ? { ...current, active: value } : current))} label="Visible in the journal" />
            </div>
          </div>
          <div className="mt-5 flex gap-2">
            <button type="button" onClick={() => setDraft(null)} className="btn-line !px-4 !py-2.5 text-[10px]">Cancel</button>
            <button type="button" onClick={() => void save()} disabled={saving} className="btn-solid !px-5 !py-2.5 text-[10px]">
              {saving ? 'Saving…' : 'Save image'}
            </button>
          </div>
        </Section>
      ) : null}

      {loading ? (
        <Spinner />
      ) : error ? (
        <EmptyAdmin title="Could not load the journal" description={error} />
      ) : !items.length ? (
        <EmptyAdmin title="The journal is empty" description="Add the first photograph to start the lookbook." />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {items.map((item) => (
            <div key={item._id} className="panel">
              <div className="relative aspect-[4/5] bg-sand/40">
                {item.image ? (
                  <img src={resolveAssetUrl(item.image)} alt={item.caption} className="h-full w-full object-cover" />
                ) : null}
                <span className={`absolute left-0 top-0 px-1.5 py-0.5 text-[8px] uppercase tracking-wide2 ${item.active ? 'bg-ink text-ivory' : 'bg-ivory text-ink'}`}>
                  {item.active ? 'Live' : 'Hidden'}
                </span>
              </div>
              <div className="p-2.5">
                <p className="truncate text-[11px] text-ink-soft">{item.caption || 'No caption'}</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => void toggleActive(item)}
                    className="border border-ink/20 px-2 py-1 text-[9px] uppercase tracking-wide2 hover:border-ink"
                  >
                    {item.active ? 'Hide' : 'Show'}
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setDraft({
                        _id: item._id,
                        image: item.image,
                        caption: item.caption,
                        externalUrl: item.externalUrl,
                        displayOrder: item.displayOrder,
                        active: item.active,
                      })
                    }
                    className="border border-ink/20 px-2 py-1 text-[9px] uppercase tracking-wide2 hover:border-ink"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => setToDelete(item)}
                    className="border border-wine-500/30 px-2 py-1 text-[9px] uppercase tracking-wide2 text-wine-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Remove this image?"
        message="It will disappear from the homepage strip and the journal."
        busy={deleting}
        onConfirm={() => void remove()}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
