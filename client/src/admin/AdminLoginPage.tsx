import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAdminAuth } from './AdminAuthContext';
import { useToast } from '@/context/ToastContext';
import { ApiRequestError } from '@/api/client';
import { Wordmark } from '@/components/Wordmark';

export function AdminLoginPage() {
  const { login } = useAdminAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const admin = await login(email, password);
      if (admin.mustChangePassword) {
        toast('Choose a new password to continue');
      }
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : 'Sign-in failed. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-bone px-5 py-12">
      <div className="w-full max-w-sm">
        <Wordmark size="md" asLink={false} className="items-start" />
        <p className="mt-6 eyebrow">Clinic access</p>
        <h1 className="mt-2 font-display text-3xl">Sign in</h1>
        <p className="mt-2 text-xs leading-relaxed text-ink-soft">
          The panel is for Vanilla Smiles clinic staff only. Credentials are set by whoever bootstrapped
          the database.
        </p>

        <form onSubmit={submit} className="mt-6 space-y-4 border border-ink/10 bg-ivory p-5">
          <label className="block">
            <span className="field-label">Email</span>
            <input
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="field"
            />
          </label>
          <label className="block">
            <span className="field-label">Password</span>
            <input
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="field"
            />
          </label>

          {error ? (
            <p className="border border-wine-500/30 bg-wine-500/[0.05] px-3 py-2 text-xs text-wine-700">{error}</p>
          ) : null}

          <button type="submit" disabled={busy} className="btn-solid w-full">
            {busy ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <Link to="/" className="mt-6 inline-block text-[10px] uppercase tracking-wide2 text-ink-faint hover:text-ink">
          ← Back to the site
        </Link>
      </div>
    </div>
  );
}
