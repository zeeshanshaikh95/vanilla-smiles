import { Helmet } from 'react-helmet-async';
import { OG_IMAGE, SITE_URL } from '@/lib/brand';

interface Props {
  title: string;
  description: string;
  canonicalPath?: string;
  image?: string;
  jsonLd?: Record<string, unknown>;
  noIndex?: boolean;
}

export function Seo({ title, description, canonicalPath, image, jsonLd, noIndex }: Props) {
  const canonical = canonicalPath ? new URL(canonicalPath, SITE_URL).href : undefined;
  const imageUrl = new URL(image || OG_IMAGE, SITE_URL).href;

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      {canonical ? <link rel="canonical" href={canonical} /> : null}
      {noIndex ? <meta name="robots" content="noindex,nofollow" /> : null}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={imageUrl} />
      {canonical ? <meta property="og:url" content={canonical} /> : null}
      <meta name="twitter:card" content="summary_large_image" />
      {jsonLd ? <script type="application/ld+json">{JSON.stringify(jsonLd)}</script> : null}
    </Helmet>
  );
}
