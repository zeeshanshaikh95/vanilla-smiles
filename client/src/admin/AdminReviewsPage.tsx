import { useState } from 'react';
import { adminApi } from '@/api/endpoints';
import { ApiRequestError } from '@/api/client';
import { useApi } from '@/hooks/useApi';
import { useToast } from '@/context/ToastContext';
import { PageHeader, Field, TextInput, Textarea, Section, Spinner, EmptyAdmin, Notice } from './AdminUI';
import { ImageField } from './ImageManager';
import { ConfirmDialog } from './ConfirmDialog';
import { Stars } from '@/components/Stars';
import type { Review, ReviewStatus } from '@/types';

interface Draft {
  _id?: string;
  customerName: string;
  rating: number;
  text: string;
  image: string;
  status: ReviewStatus;
  displayOrder: number;
}

const EMPTY: Draft = {
  customerName: '',
  rating: 5,
  text: '',
  image: '',
  status: 'approved',
  displayOrder: 0,
};

const FILTERS: Array<{ value: 'all' | ReviewStatus; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'hidden', label: 'Hidden' },
];

export function AdminReviewsPage() {
  const { toast } = useToast();
  const { data, loading, error, refetch } = useApi(() => adminApi.listReviews(), []);
  const [filter, setFilter] = useState<'all' | ReviewStatus>('all');
  const [draft, setDraft] = useState<Draft | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<Review | null>(null);
  const [deleting, setDeleting] = useState(false);

  const reviews = (data?.reviews ?? []).filter((review) => filter === 'all' || review.status === filter);

  const save = async () => {
    if (!draft) return;
    if (!draft.customerName.trim() || draft.text.trim().length < 5) {
      setFormError('Add the customer name and at least a sentence of review text.');
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      const payload = {
        customerName: draft.customerName,
        rating: draft.rating,
        text: draft.text,
        image: draft.image,
        status: draft.status,
        displayOrder: draft.displayOrder,
      };
      if (draft._id) await adminApi.updateReview(draft._id, payload);
      else await adminApi.createReview(payload);
      toast(draft._id ? 'Review updated' : 'Review added');
      setDraft(null);
      refetch();
    } catch (err) {
      setFormError(err instanceof ApiRequestError ? err.message : 'Could not save the review.');
    } finally {
      setSaving(false);
    }
  };

  const setStatus = async (review: Review, status: ReviewStatus) => {
    try {
      await adminApi.setReviewStatus(review._id, status);
      toast(`Review ${status}`);
      refetch();
    } catch (err) {
      toast(err instanceof ApiRequestError ? err.message : 'Could not update the review', 'error');
    }
  };

  const remove = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await adminApi.deleteReview(toDelete._id);
      toast('Review deleted');
      setToDelete(null);
      refetch();
    } catch (err) {
      toast(err instanceof ApiRequestError ? err.message : 'Could not delete the review', 'error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Customer words"
        title="Reviews"
        description="Only approved reviews appear on the shop. Add real customer words — never write them on a customer’s behalf."
        actions={
          <button type="button" onClick={() => setDraft({ ...EMPTY, displayOrder: reviews.length })} className="btn-solid !px-5 !py-2.5 text-[10px]">
            Add review
          </button>
        }
      />

      {draft ? (
        <Section
          title={draft._id ? 'Edit review' : 'New review'}
          actions={
            <button type="button" onClick={() => setDraft(null)} className="text-[10px] uppercase tracking-wide2 text-ink-faint hover:text-ink">
              Close
            </button>
          }
        >
          {formError ? <div className="mb-4"><Notice tone="warn">{formError}</Notice></div> : null}
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Customer name">
              <TextInput value={draft.customerName} onChange={(value) => setDraft((current) => (current ? { ...current, customerName: value } : current))} />
            </Field>
            <Field label="Rating">
              <select
                value={draft.rating}
                onChange={(event) => setDraft((current) => (current ? { ...current, rating: Number(event.target.value) } : current))}
                className="field"
              >
                {[5, 4, 3, 2, 1].map((rating) => (
                  <option key={rating} value={rating}>
                    {rating} star{rating === 1 ? '' : 's'}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Review" className="sm:col-span-2">
              <Textarea value={draft.text} onChange={(value) => setDraft((current) => (current ? { ...current, text: value } : current))} rows={4} />
            </Field>
            <Field label="Status">
              <select
                value={draft.status}
                onChange={(event) => setDraft((current) => (current ? { ...current, status: event.target.value as ReviewStatus } : current))}
                className="field"
              >
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="hidden">Hidden</option>
              </select>
            </Field>
            <Field label="Display order">
              <TextInput
                type="number"
                min={0}
                value={String(draft.displayOrder)}
                onChange={(value) => setDraft((current) => (current ? { ...current, displayOrder: Number(value) || 0 } : current))}
              />
            </Field>
          </div>

          <div className="mt-4">
            <ImageField label="Customer photo (optional)" value={draft.image} onChange={(value) => setDraft((current) => (current ? { ...current, image: value } : current))} />
          </div>

          <div className="mt-5 flex gap-2">
            <button type="button" onClick={() => setDraft(null)} className="btn-line !px-4 !py-2.5 text-[10px]">Cancel</button>
            <button type="button" onClick={() => void save()} disabled={saving} className="btn-solid !px-5 !py-2.5 text-[10px]">
              {saving ? 'Saving…' : 'Save review'}
            </button>
          </div>
        </Section>
      ) : null}

      <div className="flex gap-1">
        {FILTERS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setFilter(option.value)}
            className={`border px-3 py-1.5 text-[10px] uppercase tracking-wide2 ${
              filter === option.value ? 'border-ink bg-ink text-ivory' : 'border-ink/15 text-ink-soft hover:border-ink/40'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {loading ? (
        <Spinner />
      ) : error ? (
        <EmptyAdmin title="Could not load reviews" description={error} />
      ) : !reviews.length ? (
        <EmptyAdmin
          title="Nothing here yet"
          description="Reviews marked pending appear here for approval before the shop shows them."
        />
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => (
            <article key={review._id} className="panel p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-3">
                    <p className="font-medium">{review.customerName}</p>
                    <Stars rating={review.rating} />
                    <span className={`badge ${review.status === 'approved' ? 'badge-dark' : 'badge-line'}`}>{review.status}</span>
                  </div>
                  <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-soft">{review.text}</p>
                </div>
                {review.image ? <img src={review.image} alt="" className="h-20 w-16 object-cover" /> : null}
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {review.status !== 'approved' ? (
                  <button type="button" onClick={() => void setStatus(review, 'approved')} className="border border-ink px-3 py-1.5 text-[10px] uppercase tracking-wide2 hover:bg-ink hover:text-ivory">
                    Approve
                  </button>
                ) : null}
                {review.status !== 'hidden' ? (
                  <button type="button" onClick={() => void setStatus(review, 'hidden')} className="border border-ink/20 px-3 py-1.5 text-[10px] uppercase tracking-wide2 hover:border-ink">
                    Hide
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() =>
                    setDraft({
                      _id: review._id,
                      customerName: review.customerName,
                      rating: review.rating,
                      text: review.text,
                      image: review.image,
                      status: review.status,
                      displayOrder: review.displayOrder,
                    })
                  }
                  className="border border-ink/20 px-3 py-1.5 text-[10px] uppercase tracking-wide2 hover:border-ink"
                >
                  Edit
                </button>
                <button type="button" onClick={() => setToDelete(review)} className="border border-wine-500/30 px-3 py-1.5 text-[10px] uppercase tracking-wide2 text-wine-600 hover:border-wine-600">
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Delete this review?"
        message="The review will be removed permanently."
        busy={deleting}
        onConfirm={() => void remove()}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
