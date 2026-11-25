# Vanilla Smiles — Website

Mobile-first site for **Vanilla Smiles Dental & Esthetic Care**, A-002 Aditi CHS, MHADA Rd,
Andheri West, Mumbai 400053 · +91 90047 04391 · Mon–Sat 10:00–21:00 · Instagram
[@vanillasmilesclinic](https://www.instagram.com/vanillasmilesclinic/).

Primary conversion: browse treatments → appointment list → **request the appointment on WhatsApp**
(no payment gateway, by design). The admin panel is the same architecture as the client's earlier
Glow by Parveen / Haya Nur builds — React SPA + Express API + MongoDB + JWT admin — with a
completely different design system, a **3D hero slider**, and a treatment catalogue instead of a
product catalogue.

**Live preview:** https://zeeshanshaikh95.github.io/vanilla-smiles/ (GitHub Pages — static
catalogue snapshot, no admin behind it)

> **Data policy:** fees, reviews, success rates and clinical claims are **not invented**. Every
> price ships as `null`, which the site renders as “Fee quoted at consultation”. Departments and
> treatments mirror the services the clinic advertises publicly; edit or remove anything in
> Admin → Treatments / Departments. Reviews start empty and only show once approved.

## Tech stack

| Layer | Technology |
| Frontend | React 18 + Vite 6 + TypeScript, Tailwind CSS 3, React Router 6, react-helmet-async |
| 3D hero | CSS 3D only — `perspective` + layered `translateZ` planes, pointer tilt, orbital rings, glass chips. No WebGL, no runtime cost |
| Backend | Node + Express 4 + TypeScript, Zod validation |
| Database | MongoDB + Mongoose 8 (Atlas in production; bundled local mongod for dev) |
| Auth | JWT bearer tokens + bcrypt (12 rounds), protected `/api/admin/*` |
| Security | Helmet, CORS allow-list, rate limiting, Zod on every write, forced first-login rotation |
| Media | Multer uploads served from `/uploads` |
| Hosting | Static SPA build (Pages/Render static) + Node API + MongoDB Atlas |

## Structure

```
├── client/                  React SPA
│   ├── public/              images, favicon, robots.txt, demo/catalogue.json (Pages snapshot)
│   └── src/
│       ├── admin/           Protected admin panel (lazy-loaded bundle)
│       ├── api/             Typed API client + endpoint map + demo snapshot reader
│       ├── components/      HeroSlider (3D), ProductCard, MiniCart, Wordmark…
│       ├── context/         Appointment list / Settings / Toast providers
│       ├── hooks/           useApi, usePageView
│       ├── lib/             WhatsApp builder, analytics, formatting, brand assets
│       └── pages/           Public pages
├── server/
│   └── src/
│       ├── config/          Env config + Mongo connection
│       ├── controllers/     Public + admin handlers
│       ├── middleware/      Auth, errors, rate limits, uploads
│       ├── models/          Mongoose schemas
│       ├── routes/          /api and /api/admin routers
│       ├── seed/            Bootstrap (admin + settings) and the shared catalogue
│       ├── services/        Settings singleton
│       ├── utils/           asyncHandler, slugify
│       └── validation/      Zod schemas for every write
├── scripts/
│   ├── demo-snapshot.ts     Writes the Pages catalogue snapshot (no DB needed)
│   └── build-demo-catalogue.mjs  Same, but from a running API
└── docs/DEPLOYMENT.md
```

## Quick start

Prerequisites: Node 20+.

```shell
npm install

cp .env.example server/.env        # then edit JWT_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD

npm run dev:db                     # local mongod, data in server/.data/mongo
npm run seed                       # admin + settings + starter treatment catalogue

npm run dev                        # API :4000 · client :5173
```

**Admin panel:** http://localhost:5173/admin — sign in with `ADMIN_EMAIL` / `ADMIN_PASSWORD`.
A freshly bootstrapped account must choose a new password before the panel opens.

## The 3D hero

`client/src/components/HeroSlider.tsx` builds a real CSS 3D scene:

* a porcelain **smile-arch plate** holding the active slide photograph, on its own `translateZ` plane;
* a rotating champagne **halo** behind it and an **orbit ring** standing on edge (`rotateX(74deg)`);
* a **pearl/gold geometry cluster**, thin light shards and floating **glass treatment chips**;
* **pointer tilt** — each layer shifts proportionally to its depth, so the foreground moves further
  than the photograph;
* full slider behaviour: autoplay with progress bar, arrows, dots, swipe, arrow-key support, and a
  pause on hover/focus.

Every slide is editable in **Admin → Settings → Hero slider** (image, eyebrow, headline, subheadline,
CTA label and target). All animation is transform/opacity only and is disabled under
`prefers-reduced-motion`.

## Admin panel

* **Overview** — 7/30/90-day page views, treatment views, cart adds, booking clicks, top treatments,
  referrers, plus a warning while no WhatsApp number is configured.
* **Treatments** — full CRUD, multi-image upload/reorder, options with per-option fee and
  availability, “most booked” / featured / new flags, archive & restore, SEO, display order.
* **Departments** — CRUD and reordering with live treatment counts.
* **Reviews** — add, edit, approve, hide, delete. Only approved reviews reach the site.
* **Gallery** — images for the homepage strip and smile gallery.
* **Settings** — identity, WhatsApp number, hero slides, announcement bar, clinic story, booking
  message templates, fees/aftercare copy.
* **Security** — forced first-login password change, 10 login attempts / 15 min, JWT re-validated
  against the database on every request, Zod validation on all writes.

## Booking behaviour

* With a WhatsApp number set in Settings, every button builds a `wa.me` link pre-filled with the
  selected treatments, options and indicative total.
* Without one, buttons fall back to the clinic's Instagram DMs so the site is never a dead end —
  and the admin dashboard flags it.
* Fees are nullable end to end: blank means “Fee quoted at consultation”, never ₹0.

## Brand assets

* **Logo** — a drawn tooth-and-sparkle SVG (`client/src/components/Wordmark.tsx` and
  `client/public/favicon.svg`) paired with a Fraunces wordmark. No stretched or recoloured bitmap.
* **Photography** — the images in `client/public/images/` are editorial placeholders generated for
  this build (Instagram does not serve media to logged-out requests). Replace them with the clinic's
  own photographs through Admin → Treatments / Gallery before launch.
* **Palette** — vanilla-cream paper, porcelain surfaces, deep clinical teal (`#0A322E`), mist and a
  champagne gold accent; soft radii and glass panels. Deliberately unlike the square, bone-and-sage
  Haya Nur system.

## Scripts

| Command | Purpose |
| `npm run dev` | API + client together |
| `npm run dev:all` | Database + API + client in one terminal |
| `npm run dev:db` | Local dev MongoDB (persists in `server/.data/mongo`) |
| `npm run seed` | Bootstrap admin + settings, add the catalogue if empty |
| `npm run seed:reset` | Wipe catalogue records and re-create them |
| `npm run build` | Typecheck + build both workspaces |
| `npm run typecheck` | TypeScript project-wide |
| `npm run demo:snapshot` | Regenerate `client/public/demo/catalogue.json` (no DB needed) |

## Environment variables

| Variable | Purpose |
| `PORT` | API port (4000) |
| `MONGODB_URI` | Mongo connection string |
| `JWT_SECRET` | Long random string for signing admin JWTs |
| `JWT_EXPIRES_IN` | Token lifetime (12h) |
| `CORS_ORIGINS` | Comma-separated allowed frontend origins |
| `PUBLIC_SITE_URL` / `PUBLIC_API_URL` | Canonical URLs |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | First admin account (seed only) |
| `UPLOAD_MAX_BYTES` / `UPLOAD_MAX_FILES` | Upload limits |

Client (optional): `VITE_API_URL`, `VITE_PUBLIC_SITE_URL`, `VITE_DEMO_CATALOGUE`, `VITE_BASE`.

## Hosting

| Environment | URL | What works |
| GitHub Pages | https://zeeshanshaikh95.github.io/vanilla-smiles/ | Browsing, filters, treatment pages, appointment list, WhatsApp booking |
| Local (`npm run dev`) | http://localhost:5173 | Everything, including `/admin` and analytics |

Pages is static and cannot run the Express API, so that build reads a committed snapshot of the
catalogue (`client/public/demo/catalogue.json`, generated by `npm run demo:snapshot`, enabled with
`VITE_DEMO_CATALOGUE=true`). To run it as a real clinic site, deploy the API (`render.yaml`), set the
`VITE_API_URL` repository variable and `VITE_DEMO_CATALOGUE=false`.

## Roadmap to production

1. Replace the placeholder photography with the clinic's own images.
2. Confirm the WhatsApp number and booking templates in Admin → Settings.
3. Add real fees (or keep them out), the actual treatment list and approved patient reviews.
4. Set `JWT_SECRET`, a strong admin password and `CORS_ORIGINS` on the host; point MongoDB at Atlas.
