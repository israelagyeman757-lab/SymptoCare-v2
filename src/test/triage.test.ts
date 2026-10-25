import { describe, it, expect } from 'vitest';
import {
  evaluateTriage,
  redFlagsForSymptoms,
  RED_FLAGS,
  SYMPTOMS,
} from '@/lib/triage';

const noAnswers = () => Object.fromEntries(RED_FLAGS.map((rf) => [rf.id, false]));

describe('redFlagsForSymptoms', () => {
  it('always includes general red flags', () => {
    const flags = redFlagsForSymptoms([]);
    const general = RED_FLAGS.filter((rf) => rf.relevantSymptomIds === null);
    for (const rf of general) {
      expect(flags.some((f) => f.id === rf.id)).toBe(true);
    }
  });

  it('includes symptom-specific red flags', () => {
    const flags = redFlagsForSymptoms(['chest_pain']);
    expect(flags.some((f) => f.id === 'rf_chest_pain')).toBe(true);
  });
});

describe('evaluateTriage', () => {
  it('returns emergency when an emergency red flag matches', () => {
    const result = evaluateTriage({
      symptomIds: ['chest_pain'],
      redFlagAnswers: { ...noAnswers(), rf_chest_pain: true },
      durationDays: null,
      childUnderFive: null,
    });
    expect(result.urgency).toBe('emergency');
    expect(result.redFlags.some((rf) => rf.id === 'rf_chest_pain')).toBe(true);
    expect(result.nextSteps.length).toBeGreaterThan(0);
  });

  it('red flags override routine symptom categories', () => {
    const result = evaluateTriage({
      symptomIds: ['headache'],
      redFlagAnswers: { ...noAnswers(), rf_consciousness: true },
      durationDays: null,
      childUnderFive: null,
    });
    expect(result.urgency).toBe('emergency');
  });

  it('returns urgent for an urgent red flag', () => {
    const result = evaluateTriage({
      symptomIds: ['diarrhoea'],
      redFlagAnswers: { ...noAnswers(), rf_dehydration: true },
      durationDays: null,
      childUnderFive: null,
    });
    expect(result.urgency).toBe('urgent');
  });

  it('returns urgent when illness lasted more than 3 days with fever', () => {
    const result = evaluateTriage({
      symptomIds: ['fever'],
      redFlagAnswers: noAnswers(),
      durationDays: 'gt3',
      childUnderFive: null,
    });
    expect(result.urgency).toBe('urgent');
  });

  it('returns urgent for a child under 5 with vomiting', () => {
    const result = evaluateTriage({
      symptomIds: ['vomiting'],
      redFlagAnswers: noAnswers(),
      durationDays: null,
      childUnderFive: true,
    });
    expect(result.urgency).toBe('urgent');
  });

  it('returns routine for routine-category symptoms without flags', () => {
    const result = evaluateTriage({
      symptomIds: ['fever'],
      redFlagAnswers: noAnswers(),
      durationDays: '1to3',
      childUnderFive: false,
    });
    expect(result.urgency).toBe('routine');
  });

  it('returns self-care for mild symptoms without flags', () => {
    const result = evaluateTriage({
      symptomIds: ['headache', 'runny_nose'],
      redFlagAnswers: noAnswers(),
      durationDays: 'lt1',
      childUnderFive: false,
    });
    expect(result.urgency).toBe('self_care_information');
  });

  it('never includes a confidence score in any result', () => {
    const inputs = [
      { symptomIds: ['chest_pain'], redFlagAnswers: { ...noAnswers(), rf_chest_pain: true } },
      { symptomIds: ['headache'], redFlagAnswers: noAnswers() },
      { symptomIds: [], redFlagAnswers: noAnswers() },
    ];
    for (const input of inputs) {
      const result = evaluateTriage({
        ...input,
        durationDays: null,
        childUnderFive: null,
      });
      const serialized = JSON.stringify(result);
      expect(serialized).not.toMatch(/confidence/i);
      expect(serialized).not.toMatch(/probability/i);
      expect(serialized).not.toMatch(/78%/);
    }
  });

  it('has rule set version on every result', () => {
    const result = evaluateTriage({
      symptomIds: [],
      redFlagAnswers: noAnswers(),
      durationDays: null,
      childUnderFive: null,
    });
    expect(result.ruleSetVersion).toBeTruthy();
  });
});

describe('triage content', () => {
  it('every symptom has English and Twi labels', () => {
    for (const s of SYMPTOMS) {
      expect(s.label.en).toBeTruthy();
      expect(s.label.tw).toBeTruthy();
    }
  });

  it('every red flag has English and Twi question text', () => {
    for (const rf of RED_FLAGS) {
      expect(rf.question.en).toBeTruthy();
      expect(rf.question.tw).toBeTruthy();
    }
  });
});
