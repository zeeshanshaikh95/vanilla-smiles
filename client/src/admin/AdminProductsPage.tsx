import { useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '@/api/endpoints';
import { ApiRequestError } from '@/api/client';
import { useApi } from '@/hooks/useApi';
import { useToast } from '@/context/ToastContext';
import { PageHeader, Spinner, EmptyAdmin } from './AdminUI';
import { ConfirmDialog } from './ConfirmDialog';
import { formatPrice } from '@/lib/format';
import type { Product } from '@/types';

export function AdminProductsPage() {
  const { toast } = useToast();
  const { data, loading, error, refetch } = useApi(() => adminApi.listProducts(), []);
  const [search, setSearch] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);

  const products = (data?.products ?? []).filter((product) =>
    `${product.name} ${product.category?.name ?? ''} ${product.colour}`.toLowerCase().includes(search.toLowerCase())
  );

  const toggleArchive = async (product: Product) => {
    setBusyId(product._id);
    try {
      if (product.archived) await adminApi.restoreProduct(product._id);
      else await adminApi.archiveProduct(product._id);
      toast(product.archived ? 'Treatment restored' : 'Treatment archived');
      refetch();
    } catch (err) {
      toast(err instanceof ApiRequestError ? err.message : 'Could not update the piece', 'error');
    } finally {
      setBusyId(null);
    }
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await adminApi.deleteProduct(toDelete._id);
      toast('Treatment deleted');
      setToDelete(null);
      refetch();
    } catch (err) {
      toast(err instanceof ApiRequestError ? err.message : 'Could not delete the piece', 'error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Catalogue"
        title="Treatments"
        description="Add, edit, archive or remove anything in the shop. Archiving keeps the record but hides it from customers."
        actions={
          <Link to="/admin/products/new" className="btn-solid !px-5 !py-2.5 text-[10px]">
            New piece
          </Link>
        }
      />

      <input
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Search by name, department or duration…"
        className="field max-w-sm"
      />

      {loading ? (
        <Spinner />
      ) : error ? (
        <EmptyAdmin title="Could not load the catalogue" description={error} />
      ) : !products.length ? (
        <EmptyAdmin
          title={search ? 'Nothing matches that search' : 'No treatments yet'}
          description={search ? 'Try a shorter search.' : 'Add your first piece to open the shop.'}
          action={
            search ? (
              <button type="button" className="btn-line" onClick={() => setSearch('')}>
                Clear search
              </button>
            ) : (
              <Link to="/admin/products/new" className="btn-solid">
                Add a piece
              </Link>
            )
          }
        />
      ) : (
        <div className="panel divide-y divide-ink/10">
          {products.map((product) => {
            const soldOut = product.stockStatus === 'out_of_stock';
            return (
              <div key={product._id} className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:gap-4">
                <div className="h-24 w-20 shrink-0 overflow-hidden bg-sand/40">
                  {product.images[0] ? (
                    <img src={product.images[0]} alt="" className="h-full w-full object-cover" />
                  ) : null}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link to={`/admin/products/${product._id}`} className="font-display text-lg leading-tight hover:opacity-70">
                      {product.name}
                    </Link>
                    {product.archived ? <span className="badge-line">Archived</span> : null}
                    {soldOut ? <span className="badge-line">Sold out</span> : null}
                    {product.newArrival ? <span className="badge-dark">New</span> : null}
                    {product.bestseller ? <span className="badge-line">Bestseller</span> : null}
                    {product.featured ? <span className="badge-line">Featured</span> : null}
                  </div>
                  <p className="mt-1 text-xs text-ink-faint">
                    {product.category?.name ?? 'No department'} · {product.colour || 'No duration'} ·{' '}
                    {formatPrice(product.price)}
                  </p>
                  <p className="mt-0.5 text-[10px] text-ink-faint">
                    /{product.slug} · {product.variants.length} options · {product.images.length} images
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                  <Link
                    to={`/admin/products/${product._id}`}
                    className="border border-ink/20 px-3 py-1.5 text-[10px] uppercase tracking-wide2 hover:border-ink"
                  >
                    Edit
                  </Link>
                  <button
                    type="button"
                    disabled={busyId === product._id}
                    onClick={() => void toggleArchive(product)}
                    className="border border-ink/20 px-3 py-1.5 text-[10px] uppercase tracking-wide2 hover:border-ink disabled:opacity-40"
                  >
                    {product.archived ? 'Restore' : 'Archive'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setToDelete(product)}
                    className="border border-wine-500/30 px-3 py-1.5 text-[10px] uppercase tracking-wide2 text-wine-600 hover:border-wine-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Delete this piece?"
        message={`“${toDelete?.name ?? ''}” and its record will be removed permanently. Archive it instead if you only want to hide it.`}
        busy={deleting}
        onConfirm={() => void confirmDelete()}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
