import type { AppLanguage } from '@/i18n/translations';
import { generatedTriage } from '@/i18n/generated/languages';

export type Urgency = 'emergency' | 'urgent' | 'routine' | 'self_care_information';

export interface LocalizedText {
  en: string;
  tw: string;
}

export interface SymptomOption {
  id: string;
  label: LocalizedText;
  selfCareNote: LocalizedText;
  category: 'self_care' | 'routine';
}

export interface RedFlag {
  id: string;
  question: LocalizedText;
  severity: 'emergency' | 'urgent';
  matchedNote: LocalizedText;
  relevantSymptomIds: string[] | null; // null = always asked
}

export interface TriageInput {
  symptomIds: string[];
  redFlagAnswers: Record<string, boolean>;
  durationDays: string | null; // 'lt1' | '1to3' | 'gt3'
  childUnderFive: boolean | null;
}

export interface TriageResult {
  urgency: Urgency;
  explanation: LocalizedText;
  redFlags: RedFlag[];
  nextSteps: LocalizedText[];
  disclaimer: LocalizedText;
  ruleSetVersion: string;
}

/**
 * Deterministic, rule-based guidance. This rule set is a draft that must be
 * reviewed by a qualified clinician before production release (project
 * safety requirement). The engine never produces probabilities or scores.
 */
export const RULE_SET_VERSION = 'symptoCare-triage-v1 (draft — awaiting clinical review)';

export const SYMPTOMS: SymptomOption[] = [
  {
    id: 'fever',
    label: { en: 'Fever', tw: 'Atiridii / ho a ɛhye' },
    selfCareNote: { en: 'Drink plenty of fluids, rest, and take paracetamol only as directed by a pharmacist or health worker.', tw: 'Nom nsuo pii, home, na fa paracetamol sɛ pharmacist anaasɛ ɔyaresa ho adwumayɛfo akyerɛ sɛɛ ara.' },
    category: 'routine',
  },
  {
    id: 'headache',
    label: { en: 'Headache', tw: 'Tipaeɛ' },
    selfCareNote: { en: 'Rest, drink water, and reduce stress. Seek care if the headache is severe or unusual for you.', tw: 'Home, nom nsuo, na ma adwennwen so te. Hwehwɛ ayaresa sɛ tipaeɛ no yɛ den anaasɛ ɛnyɛ nea wota hu.' },
    category: 'self_care',
  },
  {
    id: 'cough',
    label: { en: 'Cough', tw: 'Wa' },
    selfCareNote: { en: 'Drink warm fluids and rest. Seek care if you cough blood, have chest pain, or cannot breathe well.', tw: 'Nom nsuo a ɛyɛ hyew na home. Hwehwɛ ayaresa sɛ mogya wɔ wo wa mu, wo koko yɛ wo ya, anaasɛ wuntumi nhome yiye.' },
    category: 'self_care',
  },
  {
    id: 'sore_throat',
    label: { en: 'Sore throat', tw: 'Mene mu yaw' },
    selfCareNote: { en: 'Drink warm fluids and rest. Seek care if you cannot swallow or the pain is severe.', tw: 'Nom nsuo a ɛyɛ hyew na home. Hwehwɛ ayaresa sɛ wuntumi nmene anaasɛ yaw no yɛ den.' },
    category: 'self_care',
  },
  {
    id: 'runny_nose',
    label: { en: 'Runny or blocked nose', tw: 'Hwene a ɛsen anaasɛ asi' },
    selfCareNote: { en: 'Rest and drink fluids. Most colds get better on their own within a week.', tw: 'Home na nom nsuo. Nsɛnkyerɛnne pii fi wɔn ankasa ho wɔ dapɛn biako mu.' },
    category: 'self_care',
  },
  {
    id: 'diarrhoea',
    label: { en: 'Diarrhoea', tw: 'Ayamtu' },
    selfCareNote: { en: 'Drink oral rehydration salts (ORS) in clean water and keep drinking. Seek care if there is blood, high fever, or signs of dehydration.', tw: 'Nom ORS wɔ nsuo a emu teɛ mu na toa so nom. Hwehwɛ ayaresa sɛ mogya wɔ mu, atiridii wɔ hɔ, anaasɛ wo nipadua mu nsuo asa.' },
    category: 'routine',
  },
  {
    id: 'vomiting',
    label: { en: 'Vomiting', tw: 'Feɛ' },
    selfCareNote: { en: 'Sip small amounts of clean water or ORS often. Seek care if you cannot keep fluids down for more than a few hours.', tw: 'Nom nsuo a emu teɛ anaasɛ ORS nkakrankakra mpɛn pii. Hwehwɛ ayaresa sɛ wuntumi nkura nsuo mu mma dɔnhwere kakra.' },
    category: 'routine',
  },
  {
    id: 'abdominal_pain',
    label: { en: 'Belly (abdominal) pain', tw: 'Yafunu mu yaw' },
    selfCareNote: { en: 'Rest and avoid heavy food. Seek care if the pain is severe, constant, or comes with fever or vomiting.', tw: 'Home na nni aduane a emu yɛ duru. Hwehwɛ ayaresa sɛ yaw no yɛ den, ɛntwa da, anaasɛ atiridii anaa feɛ ka ho.' },
    category: 'routine',
  },
  {
    id: 'chest_pain',
    label: { en: 'Chest pain or tightness', tw: 'Koko mu yaw anaasɛ ahyɛ' },
    selfCareNote: { en: 'Chest pain should always be checked by a health professional.', tw: 'Ɛsɛ sɛ ɔyaresa ho adwumayɛfo hwɛ koko mu yaw bere biara.' },
    category: 'routine',
  },
  {
    id: 'difficulty_breathing',
    label: { en: 'Difficulty breathing', tw: 'Home a ɛyɛ den' },
    selfCareNote: { en: 'Difficulty breathing should always be checked by a health professional.', tw: 'Ɛsɛ sɛ ɔyaresa ho adwumayɛfo hwɛ home a ɛyɛ den bere biara.' },
    category: 'routine',
  },
  {
    id: 'dizziness',
    label: { en: 'Dizziness or feeling faint', tw: 'Ani bereɛ / wobɛtɔ' },
    selfCareNote: { en: 'Sit or lie down and drink water. Seek care if it keeps happening or you faint.', tw: 'Tena ase anaasɛ da hɔ na nom nsuo. Hwehwɛ ayaresa sɛ ɛtoa so anaasɛ wotɔ.' },
    category: 'routine',
  },
  {
    id: 'fatigue',
    label: { en: 'Unusual tiredness', tw: 'Bereɛ a ɛyɛ soronko' },
    selfCareNote: { en: 'Rest, eat well, and drink water. Seek care if tiredness lasts more than a week or is severe.', tw: 'Home, didi yiye, na nom nsuo. Hwehwɛ ayaresa sɛ bereɛ no twa dapɛn anaasɛ ɛyɛ den.' },
    category: 'self_care',
  },
  {
    id: 'body_aches',
    label: { en: 'Body or joint aches', tw: 'Nipadua mu yaw' },
    selfCareNote: { en: 'Rest and drink fluids. Seek care if aches come with high fever or do not improve.', tw: 'Home na nom nsuo. Hwehwɛ ayaresa sɛ atiridii kɛse ka ho anaasɛ ɛnyɛ yiye.' },
    category: 'self_care',
  },
  {
    id: 'skin_rash',
    label: { en: 'Skin rash', tw: 'Honam ani yareɛ' },
    selfCareNote: { en: 'Keep the area clean and avoid scratching. Seek care if the rash spreads, is painful, or comes with fever.', tw: 'Ma beae no nteɛ na mfa wo nsa mmɔ hɔ. Hwehwɛ ayaresa sɛ ɛtrɛ, ɛyɛ ya, anaasɛ atiridii ka ho.' },
    category: 'routine',
  },
  {
    id: 'ear_pain',
    label: { en: 'Ear pain or discharge', tw: 'Aso mu yaw anaasɛ nsuo fi mu' },
    selfCareNote: { en: 'Seek care if ear pain is severe, lasts more than 2 days, or there is discharge.', tw: 'Hwehwɛ ayaresa sɛ aso mu yaw yɛ den, ɛtwam nna abien, anaasɛ nsuo refi mu.' },
    category: 'routine',
  },
];

export const RED_FLAGS: RedFlag[] = [
  {
    id: 'rf_chest_pain',
    question: { en: 'Do you have chest pain or a feeling of pressure in the chest that does not go away?', tw: 'Wowɔ koko mu yaw anaasɛ biribi rehyɛ wo koko so a ɛnyɛ koraa?' },
    severity: 'emergency',
    matchedNote: { en: 'Chest pain that does not go away can be a sign of a heart problem.', tw: 'Koko mu yaw a ɛnyɛ koraa betumi ayɛ koma haw ho sɛnkyerɛnne.' },
    relevantSymptomIds: ['chest_pain'],
  },
  {
    id: 'rf_breathing',
    question: { en: 'Is it very hard to breathe, or are you breathing very fast even while resting?', tw: 'Home yɛ den paa, anaasɛ worehome ntɛmntɛm mpo bere a worehome?' },
    severity: 'emergency',
    matchedNote: { en: 'Severe difficulty breathing needs urgent medical attention.', tw: 'Home a ɛyɛ den paa hia ayaresa ntɛm ara.' },
    relevantSymptomIds: ['difficulty_breathing', 'cough', 'chest_pain'],
  },
  {
    id: 'rf_consciousness',
    question: { en: 'Is the person confused, difficult to wake, or have they fainted?', tw: 'Onipa no adwene ayɛ basaa, ɛyɛ den sɛ wobɛnyan no, anaasɛ watɔ?' },
    severity: 'emergency',
    matchedNote: { en: 'Confusion, fainting, or difficulty waking are serious warning signs.', tw: 'Adwene basaa, tɔ, anaa ɛyɛ den sɛ wobɛnyan obi yɛ nsɛnkyerɛnne a emu yɛ den.' },
    relevantSymptomIds: null,
  },
  {
    id: 'rf_bleeding',
    question: { en: 'Is there severe bleeding that will not stop, or blood in vomit or stool?', tw: 'Mogya retu kɛse a ɛngyae, anaasɛ mogya wɔ feɛ anaa agyanan mu?' },
    severity: 'emergency',
    matchedNote: { en: 'Uncontrolled bleeding or blood in vomit or stool is an emergency.', tw: 'Mogya a ɛngyae anaasɛ mogya wɔ feɛ anaa agyanan mu yɛ amanehunu.' },
    relevantSymptomIds: ['vomiting', 'diarrhoea', 'abdominal_pain'],
  },
  {
    id: 'rf_stroke',
    question: { en: 'Has one side of the face or body suddenly become weak, or is speech suddenly slurred?', tw: 'Anim anaasɛ nipadua fã aseɛ mpofirim, anaasɛ kasa no abɔ aseɛ mpofirim?' },
    severity: 'emergency',
    matchedNote: { en: 'Sudden face, arm, or speech weakness can be a sign of stroke — act fast.', tw: 'Anim, nsa, anaasɛ kasa a aseɛ mpofirim betumi ayɛ stroke ho sɛnkyerɛnne — yɛ ntɛm.' },
    relevantSymptomIds: null,
  },
  {
    id: 'rf_seizure',
    question: { en: 'Has the person had a fit (seizure) or uncontrollable shaking?', tw: 'Onipa no anya fit (seizure) anaasɛ woso a wontumi nsi?' },
    severity: 'emergency',
    matchedNote: { en: 'A first seizure or a seizure lasting more than 5 minutes is an emergency.', tw: 'Seizure a edi kan anaasɛ seizure a ɛtwam simma 5 yɛ amanehunu.' },
    relevantSymptomIds: null,
  },
  {
    id: 'rf_stiff_neck',
    question: { en: 'Do you have a high fever with a stiff neck or severe headache?', tw: 'Wowɔ atiridii kɛse ne kɔn mu a ɛyɛ den anaasɛ tipaeɛ a emu yɛ den?' },
    severity: 'emergency',
    matchedNote: { en: 'High fever with a stiff neck or severe headache needs urgent assessment.', tw: 'Atiridii kɛse ne kɔn a ɛyɛ den anaasɛ tipaeɛ a emu yɛ den hia ayaresa ntɛm.' },
    relevantSymptomIds: ['fever', 'headache'],
  },
  {
    id: 'rf_dehydration',
    question: { en: 'Is the mouth very dry, with little or no urine, or sunken eyes?', tw: 'Anom awo paa, dwonsɔ kakraa anaasɛ biara nni hɔ, anaasɛ ani akɔ mu?' },
    severity: 'urgent',
    matchedNote: { en: 'These can be signs of dehydration, which needs quick treatment.', tw: 'Eyi betumi ayɛ nipadua mu nsuo asa ho sɛnkyerɛnne, na ɛhia ayaresa ntɛm.' },
    relevantSymptomIds: ['diarrhoea', 'vomiting', 'fever'],
  },
  {
    id: 'rf_fever_duration',
    question: { en: 'Has the fever or illness lasted more than 3 days?', tw: 'Atiridii anaasɛ yareɛ no atwam nna 3?' },
    severity: 'urgent',
    matchedNote: { en: 'An illness lasting more than 3 days should be assessed by a health worker.', tw: 'Ɛsɛ sɛ ɔyaresa ho adwumayɛfo hwɛ yareɛ a atwam nna 3.' },
    relevantSymptomIds: ['fever', 'cough', 'diarrhoea', 'vomiting'],
  },
  {
    id: 'rf_child_fever',
    question: { en: 'Is this about a child under 5 years with fever, vomiting, or diarrhoea?', tw: 'Abofra a wadi mfe 5 nni hɔ no na atiridii, feɛ, anaasɛ ayamtu wɔ ne so?' },
    severity: 'urgent',
    matchedNote: { en: 'Young children with fever, vomiting, or diarrhoea can get worse quickly — seek care soon.', tw: 'Mmofra nketewa a wɔwɔ atiridii, feɛ, anaasɛ ayamtu betumi ayɛ den ntɛm — hwehwɛ ayaresa ntɛm.' },
    relevantSymptomIds: ['fever', 'vomiting', 'diarrhoea'],
  },
  {
    id: 'rf_pregnancy',
    question: { en: 'Is the person pregnant and having severe pain or bleeding?', tw: 'Onipa no nyem a ɔwɔ yaw kɛse anaasɛ mogya retu?' },
    severity: 'emergency',
    matchedNote: { en: 'Severe pain or bleeding in pregnancy is an emergency.', tw: 'Yaw kɛse anaa mogya a ɛretu bere a wonyem yɛ amanehunu.' },
    relevantSymptomIds: null,
  },
];

export const EMERGENCY_STEPS: LocalizedText[] = [
  { en: 'Call 112 (Ghana national emergency line) or the nearest ambulance service now.', tw: 'Frɛ 112 (Ghana amanehunu line) anaasɛ ambulance a ɛbɛn hɔ seesei.' },
  { en: 'Go to the nearest hospital or health facility immediately. Do not drive yourself if you feel unwell.', tw: 'Kɔ ayaresabea a ɛbɛn hɔ ntɛm ara. Nka kar sɛ wo ho nye wo.' },
  { en: 'Stay with the person until help arrives and follow the operator’s instructions.', tw: 'Tena onipa no nkyɛn kosi sɛ mmoa bɛba na di operator no akwankyerɛ so.' },
];

export const URGENT_STEPS: LocalizedText[] = [
  { en: 'See a doctor, nurse, or clinical officer today or as soon as possible.', tw: 'Hwɛ dɔkota, nurse, anaasɛ clinical officer ɛnnɛ anaasɛ ntɛm ara.' },
  { en: 'If you cannot reach a facility quickly, call 112 for advice.', tw: 'Sɛ wuntumi nkɔ ayaresa bea ntɛm a, frɛ 112 ma wɔmmoa wo.' },
  { en: 'Do not wait for symptoms to get worse before seeking help.', tw: 'Ntwɛn kosi sɛ nsɛnkyerɛnne no bɛyɛ den ansa na woahwehwɛ mmoa.' },
];

export const ROUTINE_STEPS: LocalizedText[] = [
  { en: 'Book a visit with a health worker at your nearest facility when you can.', tw: 'Yɛ nhyiamu ne ɔyaresa ho adwumayɛfo wɔ beae a ɛbɛn wo bere a wubetumi.' },
  { en: 'Keep notes of your symptoms and when they started.', tw: 'Kyerɛw wo nsɛnkyerɛnne ne bere a ehyɛɛ aseɛ no.' },
  { en: 'If symptoms get worse or new warning signs appear, seek care sooner.', tw: 'Sɛ nsɛnkyerɛnne no yɛ den anaasɛ nneɛma foforo ba a, hwehwɛ ayaresa ntɛm.' },
];

export const SELF_CARE_STEPS: LocalizedText[] = [
  { en: 'Most mild symptoms like these improve on their own with rest and fluids.', tw: 'Nsɛnkyerɛnne a ɛyɛ mmerɛ te sɛ eyinom tu fi wɔn ho so bere a wohome na wonom nsuo.' },
  { en: 'Use only medicines advised by a pharmacist or health worker, at the advised dose.', tw: 'Fa aduru a pharmacist anaasɛ ɔyaresa ho adwumayɛfo akyerɛ wo nko ara, wɔ dose a wɔkyerɛɛ wo no so.' },
  { en: 'Seek care if symptoms last more than 3 days or get worse.', tw: 'Hwehwɛ ayaresa sɛ nsɛnkyerɛnne no twam nna 3 anaasɛ ɛyɛ den.' },
];

const DISCLAIMER: LocalizedText = {
  en: 'This guidance does not replace professional medical assessment. It was produced by deterministic rules, not a diagnosis.',
  tw: 'Akwankyerɛ yi nsi dɔkota nhwehwɛmu ananmu. Wɔde nhyehyɛe a ɛnsesa na ɛyɛe, ɛnyɛ yareɛ ho ɔkasa.',
};

export function redFlagsForSymptoms(symptomIds: string[]): RedFlag[] {
  return RED_FLAGS.filter((rf) => rf.relevantSymptomIds === null || rf.relevantSymptomIds.some((id) => symptomIds.includes(id)));
}

export function evaluateTriage(input: TriageInput): TriageResult {
  const matched = RED_FLAGS.filter((rf) => input.redFlagAnswers[rf.id] === true);

  const emergency = matched.filter((rf) => rf.severity === 'emergency');
  const urgent = matched.filter((rf) => rf.severity === 'urgent');

  // Duration rule: illness over 3 days with certain symptoms -> urgent
  const durationConcern =
    input.durationDays === 'gt3' &&
    input.symptomIds.some((id) => ['fever', 'cough', 'diarrhoea', 'vomiting'].includes(id));

  // Child under 5 with fever/vomiting/diarrhoea -> urgent
  const childConcern =
    input.childUnderFive === true &&
    input.symptomIds.some((id) => ['fever', 'vomiting', 'diarrhoea'].includes(id));

  if (emergency.length > 0) {
    return {
      urgency: 'emergency',
      explanation: {
        en: 'One or more emergency warning signs matched your answers.',
        tw: 'Amanehunu nsɛnkyerɛnne biako anaasɛ pii ne wo mmuae hyiae.',
      },
      redFlags: emergency,
      nextSteps: EMERGENCY_STEPS,
      disclaimer: DISCLAIMER,
      ruleSetVersion: RULE_SET_VERSION,
    };
  }

  if (urgent.length > 0 || durationConcern || childConcern) {
    return {
      urgency: 'urgent',
      explanation: {
        en: 'Your answers matched signs that should be checked by a health professional soon.',
        tw: 'Wo mmuae ne nsɛnkyerɛnne a ɛsɛ sɛ ɔyaresa ho adwumayɛfo hwɛ ntɛm hyiae.',
      },
      redFlags: matched.filter((rf) => rf.severity === 'urgent'),
      nextSteps: URGENT_STEPS,
      disclaimer: DISCLAIMER,
      ruleSetVersion: RULE_SET_VERSION,
    };
  }

  const selected = SYMPTOMS.filter((s) => input.symptomIds.includes(s.id));
  const hasRoutine = selected.some((s) => s.category === 'routine');

  if (selected.length === 0) {
    return {
      urgency: 'self_care_information',
      explanation: {
        en: 'No symptoms were selected, so general wellness guidance applies.',
        tw: 'Woampaw nsɛnkyerɛnne biara, enti akwankyerɛ a ɛfa apɔmuden pa ho no na ɛyɛ adwuma.',
      },
      redFlags: [],
      nextSteps: [
        { en: 'Keep up good habits: clean water, balanced meals, rest, and hand washing.', tw: 'Toa akwan pa so: nsuo a emu teɛ, aduane pa, home, ne nsa ho teɛ.' },
        { en: 'If you develop symptoms, use this checker again or see a health worker.', tw: 'Sɛ nsɛnkyerɛnne bi ba a, fa hwɛfo yi di dwuma bio anaasɛ hwɛ ɔyaresa ho adwumayɛfo.' },
      ],
      disclaimer: DISCLAIMER,
      ruleSetVersion: RULE_SET_VERSION,
    };
  }

  if (hasRoutine) {
    return {
      urgency: 'routine',
      explanation: {
        en: 'Your answers suggest routine care — book a visit when you can.',
        tw: 'Wo mmuae kyerɛ da biara ayaresa — yɛ nhyiamu bere a wubetumi.',
      },
      redFlags: [],
      nextSteps: ROUTINE_STEPS,
      disclaimer: DISCLAIMER,
      ruleSetVersion: RULE_SET_VERSION,
    };
  }

  return {
    urgency: 'self_care_information',
    explanation: {
      en: 'Your answers suggest mild symptoms that can often be managed at home.',
      tw: 'Wo mmuae kyerɛ nsɛnkyerɛnne a ɛyɛ mmerɛ a wotumi hwɛ wɔ fie.',
    },
    redFlags: [],
    nextSteps: SELF_CARE_STEPS,
    disclaimer: DISCLAIMER,
    ruleSetVersion: RULE_SET_VERSION,
  };
}

export function pickText(text: LocalizedText, lang: AppLanguage): string {
  if (lang === 'en' || lang === 'tw') return text[lang];
  return generatedTriage[lang]?.[text.en] ?? text.en;
}
