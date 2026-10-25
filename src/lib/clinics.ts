import { supabase, supabaseConfigured } from '@/integrations/supabase/client';

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

export async function listClinics(region?: string): Promise<Clinic[]> {
  if (!supabaseConfigured || !supabase) return [];
  let query = supabase
    .from('clinics')
    .select('id, name, region, facility_type')
    .order('name', { ascending: true });
  if (region) query = query.eq('region', region);
  const { data, error } = await query;
  if (error) return [];
  return ((data ?? []) as ClinicRow[]).map((row) => ({
    id: row.id,
    name: row.name,
    region: row.region,
    facilityType: row.facility_type,
  }));
}
