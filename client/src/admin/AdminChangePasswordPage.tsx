import { useState, type FormEvent } from 'react';
import { adminApi } from '@/api/endpoints';
import { ApiRequestError } from '@/api/client';
import { useAdminAuth } from './AdminAuthContext';
import { useToast } from '@/context/ToastContext';
import { Wordmark } from '@/components/Wordmark';

export function AdminChangePasswordPage({ forced }: { forced: boolean }) {
  const { admin, setAdmin, logout } = useAdminAuth();
  const { toast } = useToast();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (newPassword !== confirm) {
      setError('The new passwords do not match.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const result = await adminApi.changePassword(currentPassword, newPassword);
      if (result.admin) setAdmin(result.admin);
      setCurrentPassword('');
      setNewPassword('');
      setConfirm('');
      toast('Password updated');
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : 'Could not update the password.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-bone px-5 py-12">
      <div className="w-full max-w-md">
        <Wordmark size="md" asLink={false} className="items-start" />
        <p className="mt-6 eyebrow">{forced ? 'First sign-in' : 'Account'}</p>
        <h1 className="mt-2 font-display text-3xl">
          {forced ? 'Choose your own password' : 'Change password'}
        </h1>
        <p className="mt-2 text-xs leading-relaxed text-ink-soft">
          {forced
            ? 'The panel is locked until the bootstrap password is replaced. Use at least 10 characters, with a letter and a number.'
            : 'Enter your current password, then the new one twice.'}
        </p>

        <form onSubmit={submit} className="mt-6 space-y-4 border border-ink/10 bg-ivory p-5">
          <label className="block">
            <span className="field-label">Current password</span>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              className="field"
            />
          </label>
          <label className="block">
            <span className="field-label">New password</span>
            <input
              type="password"
              required
              autoComplete="new-password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              className="field"
            />
          </label>
          <label className="block">
            <span className="field-label">Confirm new password</span>
            <input
              type="password"
              required
              autoComplete="new-password"
              value={confirm}
              onChange={(event) => setConfirm(event.target.value)}
              className="field"
            />
          </label>

          {error ? (
            <p className="border border-wine-500/30 bg-wine-500/[0.05] px-3 py-2 text-xs text-wine-700">{error}</p>
          ) : null}

          <button type="submit" disabled={busy} className="btn-solid w-full">
            {busy ? 'Saving…' : 'Save password'}
          </button>
        </form>

        <div className="mt-5 flex items-center justify-between text-[10px] uppercase tracking-wide2 text-ink-faint">
          <span>{admin?.email}</span>
          <button type="button" onClick={logout} className="hover:text-ink">
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
