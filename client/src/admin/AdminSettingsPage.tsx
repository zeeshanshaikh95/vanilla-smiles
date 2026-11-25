import { useEffect, useState } from 'react';
import { adminApi, type AdminSettings } from '@/api/endpoints';
import { ApiRequestError } from '@/api/client';
import { useApi } from '@/hooks/useApi';
import { useToast } from '@/context/ToastContext';
import { PageHeader, Field, TextInput, Textarea, Toggle, Section, Spinner, Notice } from './AdminUI';
import { ImageField } from './ImageManager';

export function AdminSettingsPage() {
  const { toast } = useToast();
  const { data, loading, error } = useApi(() => adminApi.getSettings(), []);
  const [form, setForm] = useState<AdminSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (data?.settings) setForm(data.settings);
  }, [data]);

  const update = <K extends keyof AdminSettings>(key: K, value: AdminSettings[K]) =>
    setForm((current) => (current ? { ...current, [key]: value } : current));

  const save = async () => {
    if (!form) return;
    setSaving(true);
    setFormError(null);
    try {
      const result = await adminApi.updateSettings(form);
      setForm({ ...result.settings });
      toast('Settings saved');
    } catch (err) {
      if (err instanceof ApiRequestError) {
        setFormError(
          err.details?.length
            ? `${err.message} (${err.details.map((detail) => detail.message).join('; ')})`
            : err.message
        );
      } else {
        setFormError('Could not save the settings.');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading || !form) {
    return <Spinner label="Loading settings…" />;
  }

  if (error) {
    return <Notice tone="warn">{error}</Notice>;
  }

  const slides = form.heroSlides ?? [];

  return (
    <div className="space-y-6 pb-16">
      <PageHeader
        eyebrow="Configuration"
        title="Settings"
        description="Everything the shop reads from here — contact details, the hero slider, the house story and the order messages."
        actions={
          <button type="button" onClick={() => void save()} disabled={saving} className="btn-solid !px-5 !py-2.5 text-[10px]">
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        }
      />

      {formError ? <Notice tone="warn">{formError}</Notice> : null}

      <Section title="Identity" description="The name, tagline and social details used across the site.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Business name">
            <TextInput value={form.businessName} onChange={(value) => update('businessName', value)} />
          </Field>
          <Field label="Tagline">
            <TextInput value={form.tagline} onChange={(value) => update('tagline', value)} />
          </Field>
          <Field label="Instagram handle" hint="Without the @">
            <TextInput value={form.instagramHandle} onChange={(value) => update('instagramHandle', value)} />
          </Field>
          <Field label="Instagram URL">
            <TextInput value={form.instagramUrl} onChange={(value) => update('instagramUrl', value)} />
          </Field>
          <Field label="City">
            <TextInput value={form.city} onChange={(value) => update('city', value)} />
          </Field>
          <Field label="Email">
            <TextInput value={form.email} onChange={(value) => update('email', value)} />
          </Field>
        </div>
      </Section>

      <Section
        title="Orders & contact"
        description="Orders are sent to WhatsApp. Until a number is set, order buttons open Instagram DMs instead."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="WhatsApp number" hint="Country code + number, digits only, e.g. 919876543210">
            <TextInput value={form.whatsappNumber} onChange={(value) => update('whatsappNumber', value)} />
          </Field>
          <Field label="Google Maps link (optional)">
            <TextInput value={form.mapsUrl} onChange={(value) => update('mapsUrl', value)} />
          </Field>
        </div>
        <div className="mt-4">
          <Toggle
            checked={form.announcements.enabled}
            onChange={(value) => update('announcements', { ...form.announcements, enabled: value })}
            label="Show the announcement bar"
          />
          <div className="mt-3">
            <Field label="Announcement text">
              <TextInput
                value={form.announcements.text}
                onChange={(value) => update('announcements', { ...form.announcements, text: value })}
              />
            </Field>
          </div>
        </div>
      </Section>

      <Section
        title="Hero slider"
        description="Slides run in order, automatically, and can be swiped. Each slide needs an image; copy is optional."
        actions={
          <button
            type="button"
            onClick={() =>
              update('heroSlides', [
                ...slides,
                {
                  imageUrl: '',
                  eyebrow: 'New edit',
                  headline: '',
                  subheadline: '',
                  ctaLabel: 'Book an appointment',
                  ctaHref: '/contact',
                  active: true,
                },
              ])
            }
            className="border border-ink/20 px-3 py-1.5 text-[10px] uppercase tracking-wide2 hover:border-ink"
          >
            Add slide
          </button>
        }
      >
        {slides.length === 0 ? (
          <Notice>
            No slides configured — the shop shows its built-in hero. Add a slide to take control of the
            homepage.
          </Notice>
        ) : (
          <div className="space-y-4">
            {slides.map((slide, index) => (
              <div key={index} className="border border-ink/10 bg-bone p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-[10px] uppercase tracking-wide2 text-ink-faint">
                    Slide {String(index + 1).padStart(2, '0')}
                  </p>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        if (index === 0) return;
                        const next = [...slides];
                        [next[index - 1], next[index]] = [next[index], next[index - 1]];
                        update('heroSlides', next);
                      }}
                      disabled={index === 0}
                      className="border border-ink/20 px-2 py-1 text-[10px] hover:border-ink disabled:opacity-30"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (index === slides.length - 1) return;
                        const next = [...slides];
                        [next[index + 1], next[index]] = [next[index], next[index + 1]];
                        update('heroSlides', next);
                      }}
                      disabled={index === slides.length - 1}
                      className="border border-ink/20 px-2 py-1 text-[10px] hover:border-ink disabled:opacity-30"
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      onClick={() => update('heroSlides', slides.filter((_, position) => position !== index))}
                      className="border border-wine-500/30 px-2 py-1 text-[10px] uppercase tracking-wide2 text-wine-600"
                    >
                      Remove
                    </button>
                  </div>
                </div>

                <div className="mt-3 grid gap-4 sm:grid-cols-2">
                  <ImageField
                    label="Image"
                    value={slide.imageUrl}
                    onChange={(value) => {
                      const next = [...slides];
                      next[index] = { ...slide, imageUrl: value };
                      update('heroSlides', next);
                    }}
                  />
                  <div className="space-y-3">
                    <Field label="Eyebrow">
                      <TextInput
                        value={slide.eyebrow}
                        onChange={(value) => {
                          const next = [...slides];
                          next[index] = { ...slide, eyebrow: value };
                          update('heroSlides', next);
                        }}
                      />
                    </Field>
                    <Field label="Headline">
                      <TextInput
                        value={slide.headline}
                        onChange={(value) => {
                          const next = [...slides];
                          next[index] = { ...slide, headline: value };
                          update('heroSlides', next);
                        }}
                      />
                    </Field>
                  </div>
                  <Field label="Subheadline" className="sm:col-span-2">
                    <Textarea
                      value={slide.subheadline}
                      rows={2}
                      onChange={(value) => {
                        const next = [...slides];
                        next[index] = { ...slide, subheadline: value };
                        update('heroSlides', next);
                      }}
                    />
                  </Field>
                  <Field label="Button label">
                    <TextInput
                      value={slide.ctaLabel}
                      onChange={(value) => {
                        const next = [...slides];
                        next[index] = { ...slide, ctaLabel: value };
                        update('heroSlides', next);
                      }}
                    />
                  </Field>
                  <Field label="Button link">
                    <TextInput
                      value={slide.ctaHref}
                      onChange={(value) => {
                        const next = [...slides];
                        next[index] = { ...slide, ctaHref: value };
                        update('heroSlides', next);
                      }}
                    />
                  </Field>
                </div>

                <div className="mt-3">
                  <Toggle
                    checked={slide.active}
                    onChange={(value) => {
                      const next = [...slides];
                      next[index] = { ...slide, active: value };
                      update('heroSlides', next);
                    }}
                    label="Show this slide"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>

      <Section title="The house" description="Shown on the About page and the homepage story block.">
        <div className="grid gap-4">
          <Field label="Short introduction">
            <Textarea value={form.about.intro} rows={3} onChange={(value) => update('about', { ...form.about, intro: value })} />
          </Field>
          <Field label="Full story" hint="Leave a blank line between paragraphs.">
            <Textarea value={form.about.story} rows={8} onChange={(value) => update('about', { ...form.about, story: value })} />
          </Field>
          <ImageField
            label="Atelier / founder image"
            value={form.about.founderImageUrl}
            onChange={(value) => update('about', { ...form.about, founderImageUrl: value })}
          />
        </div>
      </Section>

      <Section
        title="Order messages"
        description="Tokens are replaced when the customer taps an order button: {{ITEMS}}, {{TOTAL}}, {{PRODUCT}}, {{VARIANT_LINE}}, {{QTY_LINE}}, {{PRICE}}."
      >
        <div className="grid gap-4">
          <Field label="Cart order message">
            <Textarea value={form.whatsappTemplate} rows={7} onChange={(value) => update('whatsappTemplate', value)} />
          </Field>
          <Field label="Single-piece enquiry message">
            <Textarea
              value={form.whatsappSingleProductTemplate}
              rows={7}
              onChange={(value) => update('whatsappSingleProductTemplate', value)}
            />
          </Field>
        </div>
      </Section>

      <Section title="Policies" description="Shown in product accordions and on the contact page. Leave blank for house copy.">
        <div className="grid gap-4">
          <Field label="Shipping">
            <Textarea value={form.policies.shipping} rows={4} onChange={(value) => update('policies', { ...form.policies, shipping: value })} />
          </Field>
          <Field label="Returns & exchanges">
            <Textarea value={form.policies.returns} rows={4} onChange={(value) => update('policies', { ...form.policies, returns: value })} />
          </Field>
        </div>
      </Section>

      <div className="sticky bottom-0 flex justify-end border-t border-ink/10 bg-bone/95 py-4 backdrop-blur">
        <button type="button" onClick={() => void save()} disabled={saving} className="btn-solid !px-6 !py-3 text-[10px]">
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </div>
    </div>
  );
}
