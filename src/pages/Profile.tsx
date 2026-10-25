import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserRound, LogOut, Settings2, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { updateProfile } from '@/lib/profile';
import { useI18n } from '@/i18n/useI18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Profile() {
  const { t } = useI18n();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState(() => (user?.user_metadata?.full_name as string | undefined) ?? '');
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmSignOut, setConfirmSignOut] = useState(false);

  if (!user) return null;

  const memberSince = new Date(user.created_at ?? Date.now()).toLocaleDateString();

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setSaved(false);
    try {
      if (supabase) {
        const { error: updateError } = await supabase.auth.updateUser({ data: { full_name: displayName.trim() } });
        if (updateError) {
          setError(t('profile.saveFailed'));
          return;
        }
        await updateProfile({ displayName: displayName.trim() });
      }
      setSaved(true);
    } finally {
      setBusy(false);
    }
  };

  const signOut = async () => {
    if (supabase) await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <div className="container max-w-2xl py-8">
      <h1 className="text-2xl font-bold md:text-3xl">{t('profile.title')}</h1>
      <p className="mt-2 text-muted-foreground">{t('profile.subtitle')}</p>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <UserRound className="h-4 w-4 text-primary" aria-hidden="true" />
            {t('profile.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-4" noValidate>
            <div className="space-y-2">
              <Label htmlFor="displayName">{t('profile.displayName')}</Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                autoComplete="name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">{t('profile.email')}</Label>
              <Input id="email" value={user.email ?? ''} disabled readOnly />
              <p className="text-xs text-muted-foreground">{t('profile.emailLocked')}</p>
            </div>

            <p className="text-sm text-muted-foreground">
              {t('profile.memberSince')}: {memberSince}
            </p>

            {saved && <Alert variant="success">{t('profile.saved')}</Alert>}
            {error && <Alert variant="destructive" role="alert">{error}</Alert>}

            <div className="flex flex-wrap gap-3">
              <Button type="submit" disabled={busy}>
                {busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
                {t('common.save')}
              </Button>
              <Link
                to="/settings"
                className="inline-flex min-h-11 items-center gap-2 rounded-md border border-input bg-card px-4 py-2 text-sm font-semibold shadow-sm transition-colors hover:bg-muted"
              >
                <Settings2 className="h-4 w-4" aria-hidden="true" />
                {t('nav.settings')}
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>

      <p className="mt-4 text-sm text-muted-foreground">{t('profile.languageHint')}</p>

      <div className="mt-6 rounded-xl border border-destructive/40 bg-destructive/5 p-4">
        <p className="text-sm font-bold">{t('auth.signOutConfirm')}</p>
        {confirmSignOut ? (
          <div className="mt-3 flex flex-wrap gap-2">
            <Button type="button" variant="destructive" onClick={signOut}>
              <LogOut className="h-4 w-4" aria-hidden="true" />
              {t('common.signOut')}
            </Button>
            <Button type="button" variant="outline" onClick={() => setConfirmSignOut(false)}>
              {t('common.cancel')}
            </Button>
          </div>
        ) : (
          <Button type="button" variant="outline" className="mt-3" onClick={() => setConfirmSignOut(true)}>
            <LogOut className="h-4 w-4" aria-hidden="true" />
            {t('common.signOut')}
          </Button>
        )}
      </div>
    </div>
  );
}
