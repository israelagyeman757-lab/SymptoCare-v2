import { supabase, supabaseConfigured } from '@/integrations/supabase/client';

export type AppointmentStatus = 'requested' | 'cancelled' | 'confirmed';

export const facilityOptions = [
  { id: 'healthCentre', key: 'appointments.facility.healthCentre' },
  { id: 'districtHospital', key: 'appointments.facility.districtHospital' },
  { id: 'polyclinic', key: 'appointments.facility.polyclinic' },
  { id: 'pharmacy', key: 'appointments.facility.pharmacy' },
  { id: 'other', key: 'appointments.facility.other' },
] as const;

export type FacilityType = (typeof facilityOptions)[number]['id'];

export function facilityTranslationKey(facilityType: string) {
  return facilityOptions.find((option) => option.id === facilityType)?.key;
}

export interface AppointmentRequest {
  id: string;
  facilityType: string;
  preferredDate: string;
  preferredTime: string;
  reason: string | null;
  status: AppointmentStatus;
  createdAt: string;
  region: string | null;
  clinicId: string | null;
  clinicName: string | null;
}

interface AppointmentRow {
  id: string;
  facility_type: string;
  preferred_date: string;
  preferred_time: string;
  reason: string | null;
  status: string;
  created_at: string;
  region: string | null;
  clinic_id: string | null;
}

export type AppointmentsErrorKind = 'unconfigured' | 'backend_missing' | 'network' | 'duplicate' | 'unknown';

export class AppointmentsError extends Error {
  kind: AppointmentsErrorKind;
  constructor(kind: AppointmentsErrorKind, message: string) {
    super(message);
    this.kind = kind;
  }
}

function toAppointment(row: AppointmentRow): AppointmentRequest {
  return {
    id: row.id,
    facilityType: row.facility_type,
    preferredDate: row.preferred_date,
    preferredTime: row.preferred_time,
    reason: row.reason,
    status: (row.status === 'confirmed' ? 'confirmed' : row.status === 'cancelled' ? 'cancelled' : 'requested'),
    createdAt: row.created_at,
    region: row.region ?? null,
    clinicId: row.clinic_id ?? null,
    clinicName: null,
  };
}

export function mapError(err: { message?: string; code?: string } | null): AppointmentsError {
  const message = err?.message ?? 'unknown';
  if (err?.code === '23505') return new AppointmentsError('duplicate', message);
  if (!supabaseConfigured) return new AppointmentsError('unconfigured', message);
  if (/could not find the table|relation .*does not exist|schema cache/i.test(message)) {
    return new AppointmentsError('backend_missing', message);
  }
  if (/fetch failed|network|failed to fetch/i.test(message)) {
    return new AppointmentsError('network', message);
  }
  return new AppointmentsError('unknown', message);
}

export { toAppointment };

/**
 * Appointment requests persist in Supabase, protected by Row-Level Security.
 * A request is never a confirmed booking; status stays 'requested' until a
 * future provider confirmation workflow exists (out of scope for the MVP).
 */
export async function listRequests(): Promise<AppointmentRequest[]> {
  if (!supabaseConfigured || !supabase) return [];
  const [requestsResult, clinicsResult] = await Promise.all([
    supabase.from('appointment_requests').select('*').order('created_at', { ascending: false }),
    supabase.from('clinics').select('id, name'),
  ]);
  if (requestsResult.error) throw mapError(requestsResult.error);
  const clinicNames = new Map<string, string>();
  for (const row of (clinicsResult.data ?? []) as { id: string; name: string }[]) {
    clinicNames.set(row.id, row.name);
  }
  return ((requestsResult.data ?? []) as AppointmentRow[]).map((row) => {
    const appointment = toAppointment(row);
    appointment.clinicName = row.clinic_id ? clinicNames.get(row.clinic_id) ?? null : null;
    return appointment;
  });
}

export async function saveRequest(input: {
  facilityType: FacilityType;
  preferredDate: string;
  preferredTime: string;
  reason: string;
  region: string;
  clinicId: string | null;
}): Promise<AppointmentRequest> {
  if (!supabaseConfigured || !supabase) throw mapError(null);
  const clinicId =
    input.clinicId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(input.clinicId)
      ? input.clinicId
      : null;
  const { data, error } = await supabase
    .from('appointment_requests')
    .insert({
      facility_type: input.facilityType,
      preferred_date: input.preferredDate,
      preferred_time: input.preferredTime,
      reason: input.reason.trim() || null,
      region: input.region,
      clinic_id: clinicId,
    })
    .select()
    .single();
  if (error) throw mapError(error);
  return toAppointment(data as AppointmentRow);
}

export async function cancelRequest(id: string): Promise<void> {
  if (!supabaseConfigured || !supabase) throw mapError(null);
  const { error } = await supabase
    .from('appointment_requests')
    .update({ status: 'cancelled' })
    .eq('id', id);
  if (error) throw mapError(error);
}
