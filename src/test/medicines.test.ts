import { describe, it, expect } from 'vitest';
import { searchMedicines, getMedicineById, MEDICINE_META, MEDICINES } from '@/lib/medicines';

describe('medicine dataset', () => {
  it('has records with provenance metadata', () => {
    expect(MEDICINES.length).toBeGreaterThan(400);
    expect(MEDICINE_META.source_document).toContain('NHIS');
    expect(MEDICINE_META.source_version).toBeTruthy();
    for (const record of MEDICINES) {
      expect(record.generic_name).toBeTruthy();
      expect(record.nhis_code).toBeTruthy();
    }
  });
});

describe('searchMedicines', () => {
  it('finds an exact match', () => {
    const result = searchMedicines('Paracetamol');
    expect(result.status).toBe('found');
    expect(result.results.length).toBeGreaterThan(0);
    expect(result.results[0].generic_name.toLowerCase()).toContain('paracetamol');
  });

  it('finds a partial match with possible_match status', () => {
    const result = searchMedicines('amox');
    expect(result.status === 'found' || result.status === 'possible_match').toBe(true);
    expect(result.results.some((r) => r.generic_name.toLowerCase().includes('amox'))).toBe(true);
  });

  it('returns not_found for a nonsense query', () => {
    const result = searchMedicines('zzzzqqqqnotarealmedicine');
    expect(result.status).toBe('not_found');
    expect(result.results).toHaveLength(0);
  });

  it('returns not_found for an empty query', () => {
    const result = searchMedicines('   ');
    expect(result.status).toBe('not_found');
    expect(result.results).toHaveLength(0);
  });

  it('returns the record by id', () => {
    const first = MEDICINES[0];
    const record = getMedicineById(first.nhis_code);
    expect(record?.generic_name).toBe(first.generic_name);
  });
});
