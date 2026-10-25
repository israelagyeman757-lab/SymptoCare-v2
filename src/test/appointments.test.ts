import { describe, it, expect } from 'vitest';
import { toAppointment, mapError } from '@/lib/appointments';

describe('toAppointment (row mapping)', () => {
  it('maps database columns to the domain shape', () => {
    const row = {
      id: 'abc',
      facility_type: 'District hospital',
      preferred_date: '2026-01-02',
      preferred_time: '10:00',
      reason: 'check-up',
      status: 'requested',
      created_at: '2026-01-01T00:00:00Z',
      region: null,
      clinic_id: null,
    };
    expect(toAppointment(row)).toEqual({
      id: 'abc',
      facilityType: 'District hospital',
      preferredDate: '2026-01-02',
      preferredTime: '10:00',
      reason: 'check-up',
      status: 'requested',
      createdAt: '2026-01-01T00:00:00Z',
      region: null,
      clinicId: null,
      clinicName: null,
    });
  });

  it('normalises unknown statuses to requested', () => {
    const row = {
      id: 'x',
      facility_type: 'f',
      preferred_date: '2026-01-01',
      preferred_time: '09:00',
      reason: null,
      status: 'weird',
      created_at: '2026-01-01T00:00:00Z',
      region: null,
      clinic_id: null,
    };
    expect(toAppointment(row).status).toBe('requested');
  });

  it('preserves confirmed and cancelled statuses', () => {
    const base = {
      id: 'x',
      facility_type: 'f',
      preferred_date: '2026-01-01',
      preferred_time: '09:00',
      reason: null,
      created_at: '2026-01-01T00:00:00Z',
      region: null,
      clinic_id: null,
    };
    expect(toAppointment({ ...base, status: 'cancelled' }).status).toBe('cancelled');
    expect(toAppointment({ ...base, status: 'confirmed' }).status).toBe('confirmed');
  });
});

describe('mapError', () => {
  it('maps a missing-table (schema cache) message to backend_missing', () => {
    const err = mapError({ message: "Could not find the table 'public.appointment_requests' in the schema cache" });
    expect(err.kind).toBe('backend_missing');
  });

  it('maps a relation-does-not-exist message to backend_missing', () => {
    const err = mapError({ message: 'relation "public.appointment_requests" does not exist' });
    expect(err.kind).toBe('backend_missing');
  });

  it('maps network failures to network', () => {
    const err = mapError({ message: 'TypeError: fetch failed' });
    expect(err.kind).toBe('network');
  });

  it('maps unknown errors to unknown', () => {
    const err = mapError({ message: 'something else' });
    expect(err.kind).toBe('unknown');
  });
});
