import { useState } from 'react';
import { adminApi } from '@/api/endpoints';
import { ApiRequestError } from '@/api/client';
import { useApi } from '@/hooks/useApi';
import { useToast } from '@/context/ToastContext';
import { PageHeader, Field, TextInput, Textarea, Toggle, Section, Spinner, EmptyAdmin, Notice } from './AdminUI';
import { ImageField } from './ImageManager';
import { slugify } from './slugify';
import { ConfirmDialog } from './ConfirmDialog';
import type { Category } from '@/types';

interface Draft {
  _id?: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  displayOrder: number;
}

const EMPTY: Draft = { name: '', slug: '', description: '', image: '', displayOrder: 0 };

export function AdminCategoriesPage() {
  const { toast } = useToast();
  const { data, loading, error, refetch } = useApi(() => adminApi.listCategories(), []);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState(false);

  const categories = data?.categories ?? [];

  const save = async () => {
    if (!draft) return;
    if (!draft.name.trim()) {
      setFormError('An edit needs a name.');
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      const payload = {
        name: draft.name,
        slug: draft.slug || slugify(draft.name),
        description: draft.description,
        image: draft.image,
        displayOrder: draft.displayOrder,
      };
      if (draft._id) await adminApi.updateCategory(draft._id, payload);
      else await adminApi.createCategory(payload);
      toast(draft._id ? 'Edit updated' : 'Edit created');
      setDraft(null);
      refetch();
    } catch (err) {
      setFormError(err instanceof ApiRequestError ? err.message : 'Could not save the edit.');
    } finally {
      setSaving(false);
    }
  };

  const move = async (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= categories.length) return;
    const next = [...categories];
    [next[index], next[target]] = [next[target], next[index]];
    try {
      await adminApi.reorderCategories(next.map((item, position) => ({ id: item._id, displayOrder: position })));
      refetch();
    } catch (err) {
      toast(err instanceof ApiRequestError ? err.message : 'Could not reorder', 'error');
    }
  };

  const remove = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      const result = await adminApi.deleteCategory(toDelete._id);
      toast(
        result.detachedProducts > 0
          ? `Edit deleted — ${result.detachedProducts} piece${result.detachedProducts === 1 ? '' : 's'} moved to uncategorised`
          : 'Edit deleted'
      );
      setToDelete(null);
      refetch();
    } catch (err) {
      toast(err instanceof ApiRequestError ? err.message : 'Could not delete the edit', 'error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Catalogue"
        title="Departments"
        description="Departments in the treatment menu. Deleting a department keeps its treatments — they become uncategorised."
        actions={
          <button type="button" onClick={() => setDraft({ ...EMPTY, displayOrder: categories.length })} className="btn-solid !px-5 !py-2.5 text-[10px]">
            New edit
          </button>
        }
      />

      {draft ? (
        <Section
          title={draft._id ? 'Edit details' : 'New edit'}
          actions={
            <button type="button" onClick={() => setDraft(null)} className="text-[10px] uppercase tracking-wide2 text-ink-faint hover:text-ink">
              Close
            </button>
          }
        >
          {formError ? <div className="mb-4"><Notice tone="warn">{formError}</Notice></div> : null}
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Name">
              <TextInput
                value={draft.name}
                onChange={(value) =>
                  setDraft((current) =>
                    current
                      ? {
                          ...current,
                          name: value,
                          slug: current._id ? current.slug : slugify(value),
                        }
                      : current
                  )
                }
              />
            </Field>
            <Field label="URL slug">
              <TextInput value={draft.slug} onChange={(value) => setDraft((current) => (current ? { ...current, slug: slugify(value) } : current))} />
            </Field>
            <Field label="Short description" className="sm:col-span-2">
              <Textarea value={draft.description} onChange={(value) => setDraft((current) => (current ? { ...current, description: value } : current))} rows={3} />
            </Field>
            <Field label="Display order" hint="Lower numbers appear first">
              <TextInput
                type="number"
                min={0}
                value={String(draft.displayOrder)}
                onChange={(value) => setDraft((current) => (current ? { ...current, displayOrder: Number(value) || 0 } : current))}
              />
            </Field>
          </div>

          <div className="mt-4">
            <ImageField
              label="Cover image"
              value={draft.image}
              onChange={(value) => setDraft((current) => (current ? { ...current, image: value } : current))}
            />
          </div>

          <div className="mt-5 flex gap-2">
            <button type="button" onClick={() => setDraft(null)} className="btn-line !px-4 !py-2.5 text-[10px]">
              Cancel
            </button>
            <button type="button" onClick={() => void save()} disabled={saving} className="btn-solid !px-5 !py-2.5 text-[10px]">
              {saving ? 'Saving…' : 'Save edit'}
            </button>
          </div>
        </Section>
      ) : null}

      {loading ? (
        <Spinner />
      ) : error ? (
        <EmptyAdmin title="Could not load the edits" description={error} />
      ) : !categories.length ? (
        <EmptyAdmin
          title="No edits yet"
          description="Create a collection to give the shop its navigation."
          action={
            <button type="button" className="btn-solid" onClick={() => setDraft({ ...EMPTY })}>
              New edit
            </button>
          }
        />
      ) : (
        <div className="panel divide-y divide-ink/10">
          {categories.map((category, index) => (
            <div key={category._id} className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center">
              <div className="h-20 w-16 shrink-0 overflow-hidden bg-sand/40">
                {category.image ? <img src={category.image} alt="" className="h-full w-full object-cover" /> : null}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-display text-lg leading-tight">{category.name}</p>
                <p className="mt-0.5 text-[11px] text-ink-faint">
                  /{category.slug} · {category.productCount ?? 0} live treatments
                </p>
                {category.description ? (
                  <p className="mt-1 line-clamp-1 text-xs text-ink-soft">{category.description}</p>
                ) : null}
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => void move(index, -1)}
                  disabled={index === 0}
                  className="border border-ink/20 px-2 py-1.5 text-[10px] hover:border-ink disabled:opacity-30"
                  aria-label="Move up"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => void move(index, 1)}
                  disabled={index === categories.length - 1}
                  className="border border-ink/20 px-2 py-1.5 text-[10px] hover:border-ink disabled:opacity-30"
                  aria-label="Move down"
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setDraft({
                      _id: category._id,
                      name: category.name,
                      slug: category.slug,
                      description: category.description,
                      image: category.image,
                      displayOrder: category.displayOrder,
                    })
                  }
                  className="border border-ink/20 px-3 py-1.5 text-[10px] uppercase tracking-wide2 hover:border-ink"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => setToDelete(category)}
                  className="border border-wine-500/30 px-3 py-1.5 text-[10px] uppercase tracking-wide2 text-wine-600 hover:border-wine-600"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Toggle
        checked={false}
        onChange={() => undefined}
        label="Tip"
        hint="Order here controls the homepage and footer navigation order."
      />

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Delete this edit?"
        message={`“${toDelete?.name ?? ''}” will be removed. Its treatments stay in the catalogue and become uncategorised.`}
        busy={deleting}
        onConfirm={() => void remove()}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
