import { supabase, supabaseConfigured } from '@/integrations/supabase/client';
import clinicData from '@/data/clinics.json';

export const REGIONS = [
  'Ahafo',
  'Ashanti',
  'Bono',
  'Bono East',
  'Central',
  'Eastern',
  'Greater Accra',
  'North East',
  'Northern',
  'Oti',
  'Savannah',
  'Upper East',
  'Upper West',
  'Volta',
  'Western',
  'Western North',
] as const;

export interface Clinic {
  id: string;
  name: string;
  region: string;
  facilityType: string | null;
}

interface ClinicRow {
  id: string;
  name: string;
  region: string;
  facility_type: string | null;
}

interface LocalClinic {
  id: string;
  name: string;
  type: string;
}

interface LocalRegion {
  name: string;
  clinics: LocalClinic[];
}

const localClinics: Clinic[] = (clinicData as { regions: LocalRegion[] }).regions.flatMap((region) =>
  region.clinics.map((clinic) => ({
    id: clinic.id,
    name: clinic.name,
    region: region.name,
    facilityType: clinic.type,
  }))
);

export async function listClinics(region?: string): Promise<Clinic[]> {
  const local = region ? localClinics.filter((c) => c.region === region) : localClinics;
  if (!supabaseConfigured || !supabase) return local;

  let query = supabase
    .from('clinics')
    .select('id, name, region, facility_type')
    .order('name', { ascending: true });
  if (region) query = query.eq('region', region);

  const { data, error } = await query;
  if (error) return local;

  const rows = ((data ?? []) as ClinicRow[]).map((row) => ({
    id: row.id,
    name: row.name,
    region: row.region,
    facilityType: row.facility_type,
  }));

  return rows.length > 0 ? rows : local;
}
