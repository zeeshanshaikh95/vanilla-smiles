import { Link } from 'react-router-dom';
import { Seo } from '@/components/seo/Seo';
import { Wordmark } from '@/components/Wordmark';

export function NotFoundPage() {
  return (
    <>
      <Seo title="Page not found — Vanilla Smiles" description="This page could not be found." noIndex />
      <section className="shell flex min-h-[62vh] flex-col items-center justify-center py-20 text-center">
        <Wordmark size="sm" withTagline={false} asLink={false} />
        <p className="mt-8 font-display text-7xl leading-none">404</p>
        <h1 className="mt-4 font-display text-2xl text-ink-soft">This page has left the clinic.</h1>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to="/" className="btn-solid">Back home</Link>
          <Link to="/shop" className="btn-line">Browse treatments</Link>
        </div>
      </section>
    </>
  );
}
