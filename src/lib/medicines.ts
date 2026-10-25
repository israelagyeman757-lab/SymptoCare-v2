import dataset from '@/data/medicines.json';

export interface MedicineRecord {
  nhis_code: string;
  generic_name: string;
  strength: string | null;
  dosage_form: string | null;
  unit_of_pricing: string | null;
  price_ghs: number | null;
  prescribing_level: string | null;
  source_page: number | null;
  validation_status: string;
}

export interface MedicineDatasetMeta {
  schema_version: string;
  dataset_name: string;
  source_document: string;
  source_version: string;
  generated_at: string;
  extraction_method: string;
  record_count: number;
}

export type SearchStatus = 'found' | 'possible_match' | 'not_found';

export interface SearchResult {
  status: SearchStatus;
  results: MedicineRecord[];
  query: string;
}

const data = dataset as unknown as { records: MedicineRecord[] } & MedicineDatasetMeta;

export const MEDICINE_META: MedicineDatasetMeta = {
  schema_version: data.schema_version,
  dataset_name: data.dataset_name,
  source_document: data.source_document,
  source_version: data.source_version,
  generated_at: data.generated_at,
  extraction_method: data.extraction_method,
  record_count: data.record_count,
};

export const MEDICINES: MedicineRecord[] = data.records;

function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9/ -]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokens(s: string): string[] {
  return normalize(s)
    .split(/[\s/]+/)
    .filter(Boolean);
}

/**
 * Local, deterministic medicine search. Exact matches rank before partial
 * matches; every result keeps its source metadata. No dosage or treatment
 * information is ever invented.
 */
export function searchMedicines(query: string, limit = 20): SearchResult {
  const q = normalize(query);
  if (!q) return { status: 'not_found', results: [], query };

  const qTokens = tokens(query);

  const scored = MEDICINES.map((record) => {
    const name = normalize(record.generic_name);
    const nameTokens = tokens(record.generic_name);
    let score = 0;
    let match = false;

    if (name === q) score = 100;
    else if (name.startsWith(q)) score = 80;
    else if (nameTokens.every((t) => qTokens.includes(t)) && qTokens.length > 0) score = 70;
    else if (nameTokens.some((t) => qTokens.includes(t))) score = 50;
    else if (name.includes(q)) score = 40;

    if (score > 0) match = true;
    return { record, score, match };
  });

  const matches = scored
    .filter((s) => s.match)
    .sort((a, b) => b.score - a.score || a.record.generic_name.localeCompare(b.record.generic_name));

  const results = matches.slice(0, limit).map((s) => s.record);
  const best = matches[0]?.score ?? 0;

  return {
    status: results.length === 0 ? 'not_found' : best >= 70 ? 'found' : 'possible_match',
    results,
    query,
  };
}

export function getMedicineById(id: string): MedicineRecord | undefined {
  return MEDICINES.find((r) => r.nhis_code === id);
}

export function suggestExamples(): string[] {
  return ['Paracetamol', 'Amoxicillin', 'Artemether', 'ORS', 'Metformin'];
}
