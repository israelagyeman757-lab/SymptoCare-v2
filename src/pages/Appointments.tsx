import { useEffect, useState, type FormEvent } from 'react';
import { CalendarDays, Plus, Trash2, Loader2, MapPin } from 'lucide-react';
import {
  cancelRequest,
  listRequests,
  saveRequest,
  AppointmentsError,
  facilityOptions,
  facilityTranslationKey,
  type AppointmentRequest,
  type FacilityType,
} from '@/lib/appointments';
import { listClinics, REGIONS, type Clinic } from '@/lib/clinics';
import { useI18n } from '@/i18n/useI18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

function errorMessage(err: unknown, t: (k: Parameters<ReturnType<typeof useI18n>['t']>[0]) => string): string {
  if (err instanceof AppointmentsError) {
    if (err.kind === 'backend_missing' || err.kind === 'unconfigured') return t('appointments.backendMissing');
    if (err.kind === 'network') return t('errors.offline');
    if (err.kind === 'duplicate') return t('appointments.duplicate');
  }
  return t('errors.generic');
}

export default function Appointments() {
  const { t } = useI18n();
  const [requests, setRequests] = useState<AppointmentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [facilityType, setFacilityType] = useState<FacilityType | ''>('');
  const [region, setRegion] = useState('');
  const [clinicId, setClinicId] = useState('');
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTime, setPreferredTime] = useState('');
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [confirmCancelId, setConfirmCancelId] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const reload = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      setRequests(await listRequests());
    } catch (err) {
      setLoadError(errorMessage(err, t));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!region) {
      setClinics([]);
      return;
    }
    let active = true;
    listClinics(region).then((list) => {
      if (active) setClinics(list);
    });
    return () => {
      active = false;
    };
  }, [region]);

  const facilityLabel = (id: string) => {
    const key = facilityTranslationKey(id);
    return key ? t(key) : id;
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!facilityType || !region || !preferredDate || !preferredTime) return;
    setSaving(true);
    setSaveError(null);
    try {
      await saveRequest({
        facilityType,
        preferredDate,
        preferredTime,
        reason: reason.trim(),
        region,
        clinicId: clinicId || null,
      });
      setShowForm(false);
      setFacilityType('');
      setRegion('');
      setClinicId('');
      setPreferredDate('');
      setPreferredTime('');
      setReason('');
      setSubmitted(true);
      window.setTimeout(() => setSubmitted(false), 5000);
      await reload();
    } catch (err) {
      setSaveError(errorMessage(err, t));
    } finally {
      setSaving(false);
    }
  };

  const cancel = async (id: string) => {
    if (confirmCancelId !== id) {
      setConfirmCancelId(id);
      return;
    }
    setCancellingId(id);
    try {
      await cancelRequest(id);
      setConfirmCancelId(null);
      await reload();
    } catch (err) {
      setLoadError(errorMessage(err, t));
    } finally {
      setCancellingId(null);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="container max-w-3xl py-8">
      <h1 className="text-2xl font-bold md:text-3xl">{t('appointments.title')}</h1>
      <p className="mt-2 text-muted-foreground">{t('appointments.subtitle')}</p>

      <Alert className="mt-4">
        <p className="font-bold">{t('appointments.whatNext')}</p>
        <p className="mt-1">{t('appointments.whatNextText')}</p>
      </Alert>

      {!showForm && (
        <Button type="button" className="mt-6" onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          {t('appointments.new')}
        </Button>
      )}

      {showForm && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-base">{t('appointments.new')}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} className="space-y-4" noValidate>
              <fieldset>
                <legend className="text-sm font-semibold">{t('appointments.facilityType')}</legend>
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  {facilityOptions.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setFacilityType(option.id)}
                      aria-pressed={facilityType === option.id}
                      className={cn(
                        'min-h-12 cursor-pointer rounded-md border px-4 py-2 text-left text-sm font-semibold transition-colors duration-150',
                        facilityType === option.id
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-input bg-card hover:bg-muted'
                      )}
                    >
                      {t(option.key)}
                    </button>
                  ))}
                </div>
              </fieldset>

              <fieldset>
                <legend className="flex items-center gap-2 text-sm font-semibold">
                  <MapPin className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  {t('appointments.location')}
                </legend>
                <div className="mt-2 grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="region">{t('appointments.region')}</Label>
                    <select
                      id="region"
                      value={region}
                      onChange={(e) => {
                        setRegion(e.target.value);
                        setClinicId('');
                      }}
                      required
                      className="min-h-11 w-full cursor-pointer rounded-md border border-input bg-card px-3 py-2 text-sm font-semibold"
                    >
                      <option value="">{t('appointments.selectRegion')}</option>
                      {REGIONS.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="clinic">
                      {t('appointments.clinic')}{' '}
                      <span className="font-normal text-muted-foreground">({t('common.optional')})</span>
                    </Label>
                    <select
                      id="clinic"
                      value={clinicId}
                      onChange={(e) => setClinicId(e.target.value)}
                      disabled={!region || clinics.length === 0}
                      className="min-h-11 w-full cursor-pointer rounded-md border border-input bg-card px-3 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <option value="">{t('appointments.selectClinic')}</option>
                      {clinics.map((clinic) => (
                        <option key={clinic.id} value={clinic.id}>
                          {clinic.name}
                        </option>
                      ))}
                    </select>
                    {region && clinics.length === 0 && (
                      <p className="text-xs text-muted-foreground">{t('appointments.noClinics')}</p>
                    )}
                  </div>
                </div>
              </fieldset>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="preferredDate">{t('appointments.preferredDate')}</Label>
                  <Input
                    id="preferredDate"
                    type="date"
                    min={today}
                    value={preferredDate}
                    onChange={(e) => setPreferredDate(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="preferredTime">{t('appointments.preferredTime')}</Label>
                  <Input
                    id="preferredTime"
                    type="time"
                    value={preferredTime}
                    onChange={(e) => setPreferredTime(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason">
                  {t('appointments.reason')} <span className="font-normal text-muted-foreground">({t('common.optional')})</span>
                </Label>
                <Textarea
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  maxLength={500}
                  placeholder={t('appointments.reasonPlaceholder')}
                />
                <p className="text-xs text-muted-foreground">{t('appointments.reasonHint')}</p>
              </div>

              {saveError && <Alert variant="destructive" role="alert">{saveError}</Alert>}

              <div className="flex gap-3">
                <Button type="submit" disabled={saving || !facilityType || !region || !preferredDate || !preferredTime}>
                  {saving && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
                  {saving ? t('appointments.submitting') : t('appointments.submit')}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  {t('common.cancel')}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <section aria-live="polite" className="mt-8 space-y-3">
        {submitted && <Alert variant="success">{t('appointments.submittedNote')}</Alert>}
        {loadError && (
          <Alert variant="destructive" role="alert">
            <p>{loadError}</p>
            <Button type="button" variant="outline" size="sm" className="mt-2" onClick={reload}>
              {t('common.retry')}
            </Button>
          </Alert>
        )}

        {loading && (
          <div className="space-y-3">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        )}

        {!loading && !loadError && requests.length === 0 && !showForm && (
          <p className="rounded-lg border bg-card p-4 text-sm text-muted-foreground">{t('appointments.empty')}</p>
        )}

        {!loading &&
          requests.map((request) => (
            <Card key={request.id} className={cn(request.status === 'cancelled' && 'opacity-60')}>
              <CardContent className="p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-bold">{facilityLabel(request.facilityType)}</p>
                    {request.clinicName && <p className="mt-0.5 text-sm font-semibold">{request.clinicName}</p>}
                    {request.region && <p className="text-xs text-muted-foreground">{request.region}</p>}
                    <p className="text-sm text-muted-foreground">
                      {t('appointments.date')}: {request.preferredDate} · {t('appointments.time')}: {request.preferredTime}
                    </p>
                    {request.reason && <p className="mt-1 text-sm">{request.reason}</p>}
                  </div>
                  <Badge variant={request.status === 'requested' ? 'warning' : 'muted'}>
                    {t(`appointments.status.${request.status === 'confirmed' ? 'requested' : request.status}`)}
                  </Badge>
                </div>
                {request.status === 'requested' && (
                  <div className="mt-3">
                    {confirmCancelId === request.id ? (
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold">{t('appointments.cancelConfirm')}</span>
                        <Button
                          type="button"
                          size="sm"
                          variant="destructive"
                          onClick={() => cancel(request.id)}
                          disabled={cancellingId === request.id}
                        >
                          {cancellingId === request.id && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
                          {t('common.yes')}
                        </Button>
                        <Button type="button" size="sm" variant="outline" onClick={() => setConfirmCancelId(null)}>
                          {t('common.no')}
                        </Button>
                      </div>
                    ) : (
                      <Button type="button" size="sm" variant="ghost" onClick={() => cancel(request.id)}>
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                        {t('appointments.cancel')}
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}

        {!loading && (
          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
            {t('appointments.storedSecurely')}
          </p>
        )}
      </section>
    </div>
  );
}
