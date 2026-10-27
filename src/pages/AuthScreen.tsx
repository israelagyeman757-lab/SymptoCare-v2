import { useEffect, useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { HeartPulse, Loader2, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { useI18n } from '@/i18n/useI18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher';

type Mode = 'signin' | 'signup' | 'reset' | 'recovery';

function mapAuthError(message: string, t: (key: Parameters<ReturnType<typeof useI18n>['t']>[0]) => string): string {
  if (/invalid login credentials|invalid email or password/i.test(message)) return t('auth.error.invalidCredentials');
  if (/email not confirmed/i.test(message)) return t('auth.error.emailNotConfirmed');
  if (/password should be at least/i.test(message)) return t('auth.error.weakPassword');
  if (/already registered|already exists/i.test(message)) return t('auth.error.emailInUse');
  if (/fetch failed|network|failed to fetch/i.test(message)) return t('auth.error.offline');
  return t('errors.generic');
}

export default function AuthScreen() {
  const { t } = useI18n();
  const { session, loading, configured } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [emailInUse, setEmailInUse] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setMode('recovery');
        setError(null);
        setNotice(null);
      }
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  if (!loading && session && mode !== 'recovery') return <Navigate to="/dashboard" replace />;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setBusy(true);
    setEmailInUse(false);
    try {
      if (!configured || !supabase) {
        setError(t('auth.error.unconfigured'));
        return;
      }

      const missingFields =
        (mode !== 'recovery' && !email.trim()) ||
        (mode === 'signup' && !fullName.trim()) ||
        (mode !== 'reset' && mode !== 'recovery' && !password) ||
        (mode === 'recovery' && (!password || !confirmPassword));
      if (missingFields) {
        setError(t('auth.error.requiredFields'));
        return;
      }
      if (mode !== 'recovery' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        setError(t('auth.error.invalidEmail'));
        return;
      }
      if (mode !== 'reset' && password.length < 6) {
        setError(t('auth.error.weakPassword'));
        return;
      }

      if (mode === 'recovery') {
        if (password !== confirmPassword) {
          setError(t('auth.error.passwordMismatch'));
          return;
        }
        const { error: updateError } = await supabase.auth.updateUser({ password });
        if (updateError) {
          setError(mapAuthError(updateError.message, t));
          return;
        }
        await supabase.auth.signOut();
        setPassword('');
        setConfirmPassword('');
        setMode('signin');
        setNotice(t('auth.passwordUpdated'));
        return;
      }

      if (mode === 'reset') {
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: `${window.location.origin}/auth`,
        });
        if (resetError) {
          setError(mapAuthError(resetError.message, t));
        } else {
          setNotice(t('auth.resetSent'));
        }
        return;
      }

      if (mode === 'signup') {
        const { data, error: signupError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: { full_name: fullName.trim() },
            emailRedirectTo: `${window.location.origin}/auth`,
          },
        });
        if (signupError) {
          if (/already registered|already exists/i.test(signupError.message)) {
            setEmailInUse(true);
          } else {
            setError(mapAuthError(signupError.message, t));
          }
        } else if (data.session) {
          navigate('/dashboard', { replace: true });
        } else if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
          // Supabase returns an existing user with no identities when email
          // confirmation is enabled, instead of an error.
          setEmailInUse(true);
        } else {
          setNotice(t('auth.error.emailNotConfirmed'));
        }
        return;
      }

      const { error: signinError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (signinError) {
        setError(mapAuthError(signinError.message, t));
      } else {
        navigate('/dashboard', { replace: true });
      }
    } finally {
      setBusy(false);
    }
  };

  const titles: Record<Mode, string> = {
    signin: t('auth.signInTitle'),
    signup: t('auth.signUpTitle'),
    reset: t('auth.resetTitle'),
    recovery: t('auth.recoveryTitle'),
  };
  const subtitles: Record<Mode, string> = {
    signin: t('auth.signInSubtitle'),
    signup: t('auth.signUpSubtitle'),
    reset: t('auth.resetSubtitle'),
    recovery: t('auth.recoverySubtitle'),
  };

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="border-b border-border bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-primary" aria-label="SymptoCare">
            <HeartPulse className="h-7 w-7 text-primary" aria-hidden="true" />
            <span className="font-heading text-lg font-bold tracking-tight">SymptoCare</span>
          </Link>
          <LanguageSwitcher />
        </div>
      </header>

      <main id="main-content" className="container flex flex-1 items-start justify-center py-10 md:items-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl">{titles[mode]}</CardTitle>
            <CardDescription>{subtitles[mode]}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} noValidate className="space-y-4">
              {mode === 'signup' && (
                <div className="space-y-2">
                  <Label htmlFor="fullName">{t('auth.fullName')}</Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    autoComplete="name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    maxLength={100}
                    required
                  />
                </div>
              )}

              {mode !== 'recovery' && (
                <div className="space-y-2">
                  <Label htmlFor="email">{t('auth.email')}</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    inputMode="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              )}

              {mode !== 'reset' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">
                      {mode === 'recovery' ? t('auth.newPassword') : t('auth.password')}
                    </Label>
                    {mode === 'signin' && (
                      <button
                        type="button"
                        onClick={() => {
                          setMode('reset');
                          setError(null);
                          setNotice(null);
                        }}
                        className="min-h-11 cursor-pointer text-sm font-semibold text-primary hover:underline"
                      >
                        {t('auth.forgotPassword')}
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="pr-12"
                      aria-describedby={mode !== 'signin' ? 'passwordHint' : undefined}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={showPassword ? t('auth.hidePassword') : t('auth.showPassword')}
                      className="absolute right-1 top-1/2 flex h-9 w-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-md text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
                    </button>
                  </div>
                  {mode !== 'signin' && (
                    <p id="passwordHint" className="text-xs text-muted-foreground">
                      {t('auth.passwordHint')}
                    </p>
                  )}
                </div>
              )}

              {mode === 'recovery' && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">{t('auth.confirmPassword')}</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              )}

              {error && <Alert variant="destructive" role="alert">{error}</Alert>}
              {emailInUse && (
                <Alert variant="warning" role="alert">
                  <p>{t('auth.error.emailInUse')}</p>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('signin');
                      setEmailInUse(false);
                      setPassword('');
                      setConfirmPassword('');
                      setError(null);
                      setNotice(null);
                    }}
                    className="mt-2 min-h-11 cursor-pointer font-semibold text-primary hover:underline"
                  >
                    {t('auth.signInInstead')}
                  </button>
                </Alert>
              )}
              {notice && <Alert variant="success">{notice}</Alert>}

              <Button type="submit" className="w-full" disabled={busy}>
                {busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
                {busy
                  ? mode === 'reset'
                    ? t('auth.sending')
                    : mode === 'recovery'
                      ? t('auth.updatingPassword')
                      : mode === 'signup'
                        ? t('auth.creating')
                        : t('auth.signingIn')
                  : mode === 'reset'
                    ? t('auth.sendResetLink')
                    : mode === 'recovery'
                      ? t('auth.updatePassword')
                      : mode === 'signup'
                        ? t('auth.signUp')
                        : t('auth.signIn')}
              </Button>

              <div className="text-center text-sm">
                {mode === 'recovery' ? null : mode === 'signin' ? (
                  <button
                    type="button"
                    onClick={() => {
                      setMode('signup');
                      setError(null);
                      setNotice(null);
                      setEmailInUse(false);
                    }}
                    className="min-h-11 cursor-pointer font-semibold text-primary hover:underline"
                  >
                    {t('auth.noAccount')}
                  </button>
                ) : mode === 'signup' ? (
                  <button
                    type="button"
                    onClick={() => {
                      setMode('signin');
                      setError(null);
                      setNotice(null);
                      setEmailInUse(false);
                    }}
                    className="min-h-11 cursor-pointer font-semibold text-primary hover:underline"
                  >
                    {t('auth.hasAccount')}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setMode('signin');
                      setError(null);
                      setNotice(null);
                    }}
                    className="min-h-11 cursor-pointer font-semibold text-primary hover:underline"
                  >
                    {t('auth.backToSignIn')}
                  </button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
