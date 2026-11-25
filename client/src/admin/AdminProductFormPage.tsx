import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { adminApi, type ProductInput } from '@/api/endpoints';
import { ApiRequestError } from '@/api/client';
import { useApi } from '@/hooks/useApi';
import { useToast } from '@/context/ToastContext';
import { PageHeader, Field, TextInput, NumberInput, Textarea, Toggle, Section, Spinner, Notice } from './AdminUI';
import { ImageManager } from './ImageManager';
import { slugify } from './slugify';
import { ConfirmDialog } from './ConfirmDialog';

const EMPTY: ProductInput = {
  name: '',
  slug: '',
  description: '',
  price: null,
  compareAtPrice: null,
  fabric: '',
  care: '',
  colour: '',
  category: null,
  images: [],
  variants: [{ name: 'M', price: null, stockStatus: 'in_stock' }],
  stockStatus: 'in_stock',
  bestseller: false,
  featured: false,
  newArrival: true,
  seoTitle: '',
  seoDescription: '',
  displayOrder: 0,
  archived: false,
};

export function AdminProductFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { toast } = useToast();

  const categories = useApi(() => adminApi.listCategories(), []);
  const existing = useApi(
    () => (id ? adminApi.getProduct(id) : Promise.resolve(null)),
    [id]
  );

  const [form, setForm] = useState<ProductInput>(EMPTY);
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const product = existing.data?.product;
    if (!product) return;
    setForm({
      name: product.name,
      slug: product.slug,
      description: product.description,
      price: product.price,
      compareAtPrice: product.compareAtPrice,
      fabric: product.fabric,
      care: product.care,
      colour: product.colour,
      category: (product.category as { _id?: string } | null)?._id ?? null,
      images: product.images,
      variants: product.variants.length
        ? product.variants.map((variant) => ({
            name: variant.name,
            price: variant.price,
            stockStatus: variant.stockStatus,
          }))
        : [{ name: 'Free size', price: null, stockStatus: 'in_stock' }],
      stockStatus: product.stockStatus,
      bestseller: product.bestseller,
      featured: product.featured,
      newArrival: product.newArrival,
      seoTitle: product.seoTitle,
      seoDescription: product.seoDescription,
      displayOrder: product.displayOrder,
      archived: product.archived,
    });
    setSlugTouched(true);
  }, [existing.data]);

  const update = <K extends keyof ProductInput>(key: K, value: ProductInput[K]) =>
    setForm((current) => ({ ...current, [key]: value }));

  const save = async () => {
    if (!form.name.trim()) {
      setError('A piece needs a name.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const payload: ProductInput = {
        ...form,
        slug: form.slug?.trim() || undefined,
        images: form.images.filter(Boolean),
      };
      if (isEdit && id) await adminApi.updateProduct(id, payload);
      else await adminApi.createProduct(payload);
      toast(isEdit ? 'Treatment updated' : 'Treatment created');
      navigate('/admin/products');
    } catch (err) {
      if (err instanceof ApiRequestError) {
        setError(err.details?.length ? `${err.message} (${err.details[0].field}: ${err.details[0].message})` : err.message);
      } else {
        setError('Could not save the piece.');
      }
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!id) return;
    setDeleting(true);
    try {
      await adminApi.deleteProduct(id);
      toast('Treatment deleted');
      navigate('/admin/products');
    } catch (err) {
      toast(err instanceof ApiRequestError ? err.message : 'Could not delete', 'error');
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  if (isEdit && existing.loading) return <Spinner label="Loading the piece…" />;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Catalogue"
        title={isEdit ? 'Edit piece' : 'New piece'}
        description="Prices are optional — leave them blank for “price on request”, which is how the studio quotes today."
        actions={
          <>
            <button type="button" onClick={() => navigate('/admin/products')} className="btn-line !px-4 !py-2.5 text-[10px]">
              Cancel
            </button>
            <button type="button" onClick={() => void save()} disabled={saving} className="btn-solid !px-5 !py-2.5 text-[10px]">
              {saving ? 'Saving…' : 'Save piece'}
            </button>
          </>
        }
      />

      {error ? <Notice tone="warn">{error}</Notice> : null}

      <Section title="The piece">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Name" hint="As it appears in the shop, e.g. Rubaab">
            <TextInput
              value={form.name}
              onChange={(value) => {
                update('name', value);
                if (!slugTouched) update('slug', slugify(value));
              }}
            />
          </Field>
          <Field label="URL slug" hint="Lowercase, hyphenated. Must be unique.">
            <TextInput
              value={form.slug ?? ''}
              onChange={(value) => {
                setSlugTouched(true);
                update('slug', slugify(value));
              }}
            />
          </Field>
          <Field label="Edit / category">
            <select
              value={form.category ?? ''}
              onChange={(event) => update('category', event.target.value || null)}
              className="field"
            >
              <option value="">No edit</option>
              {(categories.data?.categories ?? []).map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Duration / notes">
            <TextInput value={form.colour} onChange={(value) => update('colour', value)} />
          </Field>
          <Field label="Price (₹)" hint="Blank = price on request">
            <NumberInput value={form.price} onChange={(value) => update('price', value)} />
          </Field>
          <Field label="Compare-at price (₹)" hint="Optional — shows a struck-through price">
            <NumberInput value={form.compareAtPrice} onChange={(value) => update('compareAtPrice', value)} />
          </Field>
          <Field label="Display order" hint="Lower numbers appear first">
            <NumberInput value={form.displayOrder} onChange={(value) => update('displayOrder', value ?? 0)} />
          </Field>
          <Field label="Stock status">
            <select
              value={form.stockStatus}
              onChange={(event) => update('stockStatus', event.target.value as ProductInput['stockStatus'])}
              className="field"
            >
              <option value="in_stock">In stock</option>
              <option value="out_of_stock">Sold out</option>
            </select>
          </Field>
        </div>

        <div className="mt-4">
          <Field label="Description">
            <Textarea value={form.description} onChange={(value) => update('description', value)} rows={5} />
          </Field>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="What it involves">
            <Textarea value={form.fabric} onChange={(value) => update('fabric', value)} rows={3} />
          </Field>
          <Field label="Care">
            <Textarea value={form.care} onChange={(value) => update('care', value)} rows={3} />
          </Field>
        </div>
      </Section>

      <Section title="Images" description="The first image is the cover. Up to 10 images per piece.">
        <ImageManager images={form.images} onChange={(images) => update('images', images)} />
      </Section>

      <Section
        title="Sizes & options"
        description="Options for a treatment (single visit, upper and lower arch, in-clinic or take-home). Each option can carry its own fee and availability."
        actions={
          <button
            type="button"
            onClick={() => update('variants', [...form.variants, { name: '', price: null, stockStatus: 'in_stock' }])}
            className="border border-ink/20 px-3 py-1.5 text-[10px] uppercase tracking-wide2 hover:border-ink"
          >
            Add option
          </button>
        }
      >
        {form.variants.length === 0 ? (
          <p className="text-xs text-ink-faint">No options — the piece will be sold as one size.</p>
        ) : (
          <div className="space-y-2">
            {form.variants.map((variant, index) => (
              <div key={index} className="flex flex-wrap items-end gap-2 border border-ink/10 bg-bone p-2.5">
                <Field label="Label" className="min-w-[6rem] flex-1">
                  <input
                    value={variant.name}
                    onChange={(event) => {
                      const next = [...form.variants];
                      next[index] = { ...variant, name: event.target.value };
                      update('variants', next);
                    }}
                    placeholder="M, XL, Sage…"
                    className="field"
                  />
                </Field>
                <Field label="Price (₹)" className="w-32">
                  <input
                    type="number"
                    min={0}
                    value={variant.price ?? ''}
                    placeholder="On request"
                    onChange={(event) => {
                      const next = [...form.variants];
                      next[index] = {
                        ...variant,
                        price: event.target.value === '' ? null : Number(event.target.value),
                      };
                      update('variants', next);
                    }}
                    className="field"
                  />
                </Field>
                <label className="flex items-center gap-2 pb-2.5 text-xs text-ink-soft">
                  <input
                    type="checkbox"
                    checked={variant.stockStatus === 'out_of_stock'}
                    onChange={(event) => {
                      const next = [...form.variants];
                      next[index] = {
                        ...variant,
                        stockStatus: event.target.checked ? 'out_of_stock' : 'in_stock',
                      };
                      update('variants', next);
                    }}
                    className="h-4 w-4 accent-ink"
                  />
                  Sold out
                </label>
                <button
                  type="button"
                  onClick={() => update('variants', form.variants.filter((_, position) => position !== index))}
                  className="pb-3 text-[10px] uppercase tracking-wide2 text-ink-faint hover:text-wine-600"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </Section>

      <Section title="Merchandising">
        <div className="grid gap-3 sm:grid-cols-2">
          <Toggle checked={form.newArrival} onChange={(value) => update('newArrival', value)} label="New in" hint="Shows the “New in” badge" />
          <Toggle checked={form.bestseller} onChange={(value) => update('bestseller', value)} label="Bestseller" hint="Appears in bestseller listings" />
          <Toggle checked={form.featured} onChange={(value) => update('featured', value)} label="Featured" hint="Favoured on the homepage" />
          <Toggle checked={form.archived} onChange={(value) => update('archived', value)} label="Archived" hint="Hidden from customers, kept in the panel" />
        </div>
      </Section>

      <Section title="Search engine listing" description="Optional — falls back to the name and description.">
        <div className="grid gap-4">
          <Field label="SEO title">
            <TextInput value={form.seoTitle} onChange={(value) => update('seoTitle', value)} />
          </Field>
          <Field label="SEO description">
            <Textarea value={form.seoDescription} onChange={(value) => update('seoDescription', value)} rows={3} />
          </Field>
        </div>
      </Section>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-ink/10 pt-6">
        <div>
          {isEdit ? (
            <button type="button" onClick={() => setConfirmDelete(true)} className="text-[10px] uppercase tracking-wide2 text-wine-600 hover:underline">
              Delete this piece
            </button>
          ) : null}
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => navigate('/admin/products')} className="btn-line !px-4 !py-2.5 text-[10px]">
            Cancel
          </button>
          <button type="button" onClick={() => void save()} disabled={saving} className="btn-solid !px-5 !py-2.5 text-[10px]">
            {saving ? 'Saving…' : 'Save piece'}
          </button>
        </div>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete this piece?"
        message="This removes the record permanently. Archive it instead if you only want to hide it."
        busy={deleting}
        onConfirm={() => void remove()}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}
