import type { LocalizedText } from '@/lib/triage';

export interface EducationTopic {
  id: string;
  title: LocalizedText;
  summary: LocalizedText;
  points: LocalizedText[];
  sourceName: string;
  sourceUrl: string;
  reviewStatus: 'awaiting_review';
}

/**
 * Educational content based on well-established public health guidance
 * (WHO/UNICEF/GHS). Every entry must be reviewed by a qualified clinician
 * before production release; the UI marks it as awaiting review.
 */
export const EDUCATION_TOPICS: EducationTopic[] = [
  {
    id: 'oral-rehydration',
    title: {
      en: 'Diarrhoea and oral rehydration',
      tw: 'Ayamtu ne nsuo a wɔde san hyɛ nipadua mu',
    },
    summary: {
      en: 'Diarrhoea can quickly drain water and salts from the body. Replacing them early is the most important treatment, especially for children.',
      tw: 'Ayamtu betumi ayi nsuo ne nkyene afi nipadua mu ntɛm. Sɛ wɔsan hyɛ mu ntɛm a, ɛno ne ayaresa a ɛho hia paa, titire ma mmofra.',
    },
    points: [
      {
        en: 'Use Oral Rehydration Salts (ORS): mix one sachet in the amount of clean water written on the packet. Do not use less or more water than instructed.',
        tw: 'Fa ORS di dwuma: fra sachet biako wɔ nsuo a emu teɛ dodow a wɔakyerɛw wɔ packet no so no mu. Mfa nsuo kakraa anaasɛ pii nsen nea wɔakyerɛw.',
      },
      {
        en: 'Drink small, frequent sips after each loose stool. Continue normal feeding; for babies, continue breastfeeding.',
        tw: 'Nom nkakrankakra mpɛn pii wɔ agyanan biara akyi. Toa so didi; ma nkokoaa nufu no ara.',
      },
      {
        en: 'Seek care quickly if there is blood in the stool, high fever, repeated vomiting, sunken eyes, or if the person is very weak or sleepy.',
        tw: 'Hwehwɛ ayaresa ntɛm sɛ mogya wɔ agyanan mu, atiridii kɛse wɔ hɔ, feɛ mpɛn pii, ani akɔ mu, anaasɛ onipa no ayɛ mmerɛw paa anaasɛ nna wɔ ne so.',
      },
      {
        en: 'For children, zinc supplements and continued feeding are recommended by WHO where available — ask at the health facility.',
        tw: 'Ma mmofra no, WHO kyerɛ sɛ zinc ne didi a wɔtoa so yɛ papa bere a ɛwɔ hɔ — bisa wɔ ayaresa bea no.',
      },
    ],
    sourceName: 'World Health Organization — Diarrhoeal disease fact sheet',
    sourceUrl: 'https://www.who.int/news-room/fact-sheets/detail/diarrhoeal-disease',
    reviewStatus: 'awaiting_review',
  },
  {
    id: 'malaria',
    title: {
      en: 'Malaria prevention',
      tw: 'Atiridii ano siw',
    },
    summary: {
      en: 'Malaria is spread by mosquito bites, mostly at night. Prevention and early treatment save lives.',
      tw: 'Ntwantwaa aka na ɛde atiridii ba, titire anadwo. Ano siw ne ayaresa a wonya ntɛm gye nkwa.',
    },
    points: [
      {
        en: 'Sleep under an insecticide-treated bed net every night, all year round.',
        tw: 'Da ntwantwaa dan a wɔde aduru ayɛ mu anadwo biara, afe nyinaa.',
      },
      {
        en: 'If you have fever, chills, or body aches, go for a malaria test early. Take anti-malarial medicine exactly as prescribed and finish the course.',
        tw: 'Sɛ wowɔ atiridii, awɔw, anaasɛ nipadua yaw a, kɔ ma wɔnhwehwɛ atiridii ntɛm. Fa atiridii aduru no sɛnea wɔakyerɛw no na wie no nyinaa.',
      },
      {
        en: 'In pregnancy, malaria is especially dangerous. Attend antenatal care and take preventive treatment as advised by the health worker.',
        tw: 'Bere a wonyem no, atiridii yɛ hu paa. Kɔ antenatal care na fa aduru a ɔyaresa ho adwumayɛfo akyerɛ wo no.',
      },
      {
        en: 'Remove standing water around the home where mosquitoes breed, and keep surroundings clean.',
        tw: 'Yi nsuo a egyina hɔ wɔ fie ho a ntwantwaa wo mu no, na ma wo mpɔtam nteɛ.',
      },
    ],
    sourceName: 'World Health Organization — Malaria fact sheet',
    sourceUrl: 'https://www.who.int/news-room/fact-sheets/detail/malaria',
    reviewStatus: 'awaiting_review',
  },
  {
    id: 'hand-hygiene',
    title: {
      en: 'Hand hygiene',
      tw: 'Nsa ho teɛ',
    },
    summary: {
      en: 'Washing hands with soap is one of the most effective ways to stop the spread of illness.',
      tw: 'Nsa a wɔhohoro ne samina yɛ ɔkwan a ɛyɛ den paa a wɔde siw yareɛ trɛ ano.',
    },
    points: [
      {
        en: 'Wash hands with soap and clean water at key times: before eating or preparing food, after using the toilet, after cleaning a child, and after touching animals.',
        tw: 'Hohoro wo nsa ne samina ne nsuo a emu teɛ bere titire mu: ansa na woadidi anaa woanoa aduane, woakyi agyanan, woahohoro abofra, ne woasɔ mmoa mu.',
      },
      {
        en: 'Wash for at least 20 seconds, covering all parts of the hands including between fingers and under nails.',
        tw: 'Hohoro wo nsa simma 20 anaasɛ pii, fa wo nsa nyinaa ka ho a nsateaa ntam ne werɛ ase ka ho.',
      },
      {
        en: 'If soap is not available, use an alcohol-based hand rub with at least 60% alcohol.',
        tw: 'Sɛ samina nni hɔ a, fa alcohol hand rub a alcohol no mu yɛ 60% anaasɛ pii di dwuma.',
      },
    ],
    sourceName: 'World Health Organization — Hand hygiene',
    sourceUrl: 'https://www.who.int/teams/integrated-health-services/infection-prevention-control/hand-hygiene',
    reviewStatus: 'awaiting_review',
  },
  {
    id: 'water-food',
    title: {
      en: 'Safe water and food',
      tw: 'Nsuo ne aduane a ɛyɛ ahobammɔ',
    },
    summary: {
      en: 'Contaminated water and food are common causes of illness. Simple steps make them safer.',
      tw: 'Nsuo ne aduane a afi mu na ɛtaa de yareɛ ba. Nneɛma mmerɛ bi ma ɛyɛ ahobammɔ.',
    },
    points: [
      {
        en: 'Drink water from a safe source. If unsure, treat water by boiling it for at least one minute, filtering, or using water treatment products as directed.',
        tw: 'Nom nsuo fi beae a ahobammɔ wɔ mu. Sɛ wunnim a, noa nsuo no simma biako anaasɛ pii, fa filter so, anaasɛ fa nsuo ho aduru sɛnea wɔakyerɛw.',
      },
      {
        en: 'Keep raw and cooked food separate. Cook food thoroughly, especially meat and eggs.',
        tw: 'Fa aduane a emonom ne deɛ woanoa nto nkɔ baabi koro. Noa aduane yiye, titire nam ne nkesua.',
      },
      {
        en: 'Wash fruits and vegetables with clean water before eating, and cover food to keep flies away.',
        tw: 'Hohoro nnuaba ne atosodeɛ ne nsuo a emu teɛ ansa na woadi, na kata aduane so ma nwansena mmɛn ho.',
      },
    ],
    sourceName: 'World Health Organization — Food safety',
    sourceUrl: 'https://www.who.int/news-room/fact-sheets/detail/food-safety',
    reviewStatus: 'awaiting_review',
  },
  {
    id: 'vaccination',
    title: {
      en: 'Childhood vaccination',
      tw: 'Mmofra nuro a wɔde bɔ',
    },
    summary: {
      en: 'Routine immunisation protects children from serious, preventable diseases.',
      tw: 'Nuro a wɔde bɔ daa bɔ mmofra ho ban fi yareɛ a emu yɛ den a wobetumi asiw ano no ho.',
    },
    points: [
      {
        en: 'Take your child for all routine immunisations at the health facility, following the national schedule and the child health record book.',
        tw: 'Fa wo ba kɔ ayaresa bea ma wɔmfa nuro a ɛsɛ sɛ wɔde bɔ no nyinaa mmɔ no, di ɔman nhyehyɛe ne abofra apɔmuden nwoma no so.',
      },
      {
        en: 'Vaccines are safe and are checked carefully. Mild fever or soreness after vaccination is common and usually passes quickly.',
        tw: 'Nuro no yɛ ahobammɔ na wɔhwehwɛ mu yiye. Atiridii kakraa anaa yaw wɔ bɔbea no ho yɛ ade a ɛtaa ba na ɛtwa ntɛm.',
      },
      {
        en: 'If you missed a vaccination, it is usually not too late — ask the health worker about catch-up doses.',
        tw: 'Sɛ wogyae nuro bi a, ɛnyɛ nnaa koraa — bisa ɔyaresa ho adwumayɛfo fa nuro a aka no ho asɛm.',
      },
    ],
    sourceName: 'World Health Organization — Immunization',
    sourceUrl: 'https://www.who.int/health-topics/vaccines-and-immunization',
    reviewStatus: 'awaiting_review',
  },
  {
    id: 'breastfeeding',
    title: {
      en: 'Breastfeeding',
      tw: 'Nufu a wɔde ma abofra',
    },
    summary: {
      en: 'Breast milk is the best first food for babies and protects them from illness.',
      tw: 'Nufu ne aduane a edi kan a eye ma nkokoaa na ɛbɔ wɔn ho ban fi yareɛ ho.',
    },
    points: [
      {
        en: 'Breastfeed exclusively (breast milk only, no water or other food) for the first 6 months.',
        tw: 'Ma abofra no nufu nko ara (nufu nko, nsuo mpo mma no) wɔ abosome 6 a edi kan no mu.',
      },
      {
        en: 'From 6 months, continue breastfeeding while adding safe, soft complementary foods.',
        tw: 'Fi abosome 6 no, toa so ma abofra no nufu na san de aduane a ɛyɛ mmerɛ a ahobammɔ wɔ mu ka ho.',
      },
      {
        en: 'Breastfeeding supports the baby’s growth and helps protect against infections. Ask a health worker for support if feeding is difficult.',
        tw: 'Nufu boa abofra no nyin ne ne ho ban fi nyarewa ho. Bisa ɔyaresa ho adwumayɛfo sɛ nufu a wɔde ma no yɛ den a.',
      },
    ],
    sourceName: 'World Health Organization — Breastfeeding',
    sourceUrl: 'https://www.who.int/health-topics/breastfeeding',
    reviewStatus: 'awaiting_review',
  },
];

export interface FirstAidTopic {
  id: string;
  title: LocalizedText;
  intro: LocalizedText;
  steps: LocalizedText[];
  warning: LocalizedText;
}

export const FIRST_AID_TOPICS: FirstAidTopic[] = [
  {
    id: 'cpr',
    title: {
      en: 'Adult CPR and AED awareness',
      tw: 'Mpanyimfo CPR ne AED ntease',
    },
    intro: {
      en: 'If an adult collapses and is not breathing normally, start CPR and call for help. These steps follow public resuscitation guidance (AHA/IFRC) for untrained helpers.',
      tw: 'Sɛ ɔpanyin hwe ase na ɔnhome yiye a, hyɛ CPR ase na frɛ mmoa. Anammɔn yi di public resuscitation akwankyerɛ (AHA/IFRC) so.',
    },
    steps: [
      {
        en: 'Check: shake the shoulders gently and shout. If there is no response and no normal breathing, shout for help and call 112.',
        tw: 'Hwɛ: woso n’batire no kakra na teɛ mu. Sɛ ɔnyɛ hwee na ɔnhome yiye a, teɛ mu frɛ mmoa na frɛ 112.',
      },
      {
        en: 'Place the heel of one hand in the centre of the chest, put the other hand on top, and push hard and fast — about 5 to 6 cm deep, 100 to 120 times per minute.',
        tw: 'Fa wo nsa baako kotoku no si koko no mfinimfini, fa nsa foforo no to so, na pia no den na ntɛm — bɛyɛ 5 kosi 6 cm mu, mpɛn 100 kosi 120 simma biara.',
      },
      {
        en: 'Keep going without stopping until help arrives or the person starts breathing normally. If another person is there, take turns every 2 minutes.',
        tw: 'Toa so a wonnyae kosi sɛ mmoa bɛba anaasɛ onipa no bɛhome yiye. Sɛ obi foforo wɔ hɔ a, monnya nsesa simma 2 biara.',
      },
      {
        en: 'If an AED is available: turn it on and follow its voice instructions exactly.',
        tw: 'Sɛ AED wɔ hɔ a: bue so na di ne nne akwankyerɛ no so pɛpɛɛpɛ.',
      },
    ],
    warning: {
      en: 'This is awareness information, not a training certificate. Take a certified first-aid course to learn and practise these skills.',
      tw: 'Eyi yɛ ntease nsɛm, ɛnyɛ ntetee certificate. Kɔ first-aid sukuu a wɔagye atom na sua na yɛ eyinom.',
    },
  },
  {
    id: 'choking',
    title: {
      en: 'Choking',
      tw: 'Mene mu nneɛma',
    },
    intro: {
      en: 'If someone cannot cough, speak, or breathe, they may be choking and need help fast.',
      tw: 'Sɛ obi ntumi nwa, nkasa, anaasɛ ɔnhome a, ebia biribi asi ne mene mu na ɔhia mmoa ntɛm.',
    },
    steps: [
      {
        en: 'If the person can cough, encourage them to keep coughing.',
        tw: 'Sɛ onipa no tumi wa a, hyɛ no nkuran sɛ ɔntoa so nwa.',
      },
      {
        en: 'If they cannot cough or breathe: give up to 5 firm back blows between the shoulder blades with the heel of your hand.',
        tw: 'Sɛ ɔntumi nwa anaasɛ ɔnhome a: bɔ ne akyi mpɛn 5 a emu yɛ den wɔ ne mmati ntam ne wo nsa kotoku.',
      },
      {
        en: 'If that does not work: give up to 5 abdominal thrusts (stand behind, fist above the navel, pull sharply in and up).',
        tw: 'Sɛ ɛnyɛ adwuma a: yɛ abdominal thrust mpɛn 5 (gyina n’akyi, fa wo nsa kutu si ne funuma so, twe kɔ mu na soro ntɛm).',
      },
      {
        en: 'Alternate 5 back blows and 5 abdominal thrusts. If the person becomes unresponsive, start CPR and call 112.',
        tw: 'Sesa akyi bɔ 5 ne abdominal thrust 5. Sɛ onipa no nhaw adwene a, hyɛ CPR ase na frɛ 112.',
      },
    ],
    warning: {
      en: 'For babies under 1 year, use different techniques (back blows and chest thrusts, not abdominal thrusts). Take a first-aid course to learn them.',
      tw: 'Ma nkokoaa a wonnii afe 1 no, fa kwan foforo (akyi bɔ ne koko thrust, ɛnyɛ abdominal thrust). Kɔ first-aid sukuu na sua.',
    },
  },
  {
    id: 'bleeding',
    title: {
      en: 'Severe bleeding',
      tw: 'Mogya tu kɛse',
    },
    intro: {
      en: 'Severe bleeding can be life-threatening. Act quickly and call for help.',
      tw: 'Mogya a ɛretu kɛse betumi akum obi. Yɛ ntɛm na frɛ mmoa.',
    },
    steps: [
      {
        en: 'Call 112 or send someone to call while you help.',
        tw: 'Frɛ 112 anaasɛ soma obi ma ɔnkɔfrɛ bere a woreboa no.',
      },
      {
        en: 'Press firmly on the wound with a clean cloth or your hands. Keep pressing without stopping.',
        tw: 'Pia akuru no so yiye ne ntoma a emu teɛ anaasɛ wo nsa. Toa so pia a wonnyae.',
      },
      {
        en: 'If the cloth becomes soaked with blood, do not remove it — add another cloth on top and keep pressing.',
        tw: 'Sɛ ntoma no ayɛ mogya ma a, nyi no — fa ntoma foforo to so na toa so pia.',
      },
      {
        en: 'If possible, lay the person down and raise the bleeding limb above the level of the heart.',
        tw: 'Sɛ ɛbɛyɛ yiye a, ma onipa no nna hɔ na ma nsa anaa nan a mogya refi mu no nkɔ soro nsen koma no.',
      },
    ],
    warning: {
      en: 'Do not remove objects stuck in a wound. Press around the object and seek emergency care.',
      tw: 'Nyi nneɛma a aka wɔ akuru mu no. Pia ɛho na hwehwɛ amanehunu ayaresa.',
    },
  },
  {
    id: 'burns',
    title: {
      en: 'Burns',
      tw: 'Ɔhyew',
    },
    intro: {
      en: 'Cooling a burn quickly reduces damage. These steps follow public first-aid guidance.',
      tw: 'Sɛ wode nsuo dwodwoo ɔhyew no ntɛm a, ɛte nea ɛsɛe no so. Anammɔn yi di public first-aid akwankyerɛ so.',
    },
    steps: [
      {
        en: 'Cool the burn under cool (not icy) running water for at least 20 minutes.',
        tw: 'Dwodwo ɔhyew no nsuo a ɛyɛ nwunu (ɛnyɛ icy) mu simma 20 anaasɛ pii.',
      },
      {
        en: 'Remove jewellery and tight clothing near the burn before it swells, unless it is stuck to the skin.',
        tw: 'Yi nneɛma ne ntade a ɛyɛ den a ɛbɛn ɔhyew no ansa na ahono, gye sɛ ɛakɔ honam ani mu.',
      },
      {
        en: 'Cover the burn loosely with a clean, dry cloth.',
        tw: 'Kata ɔhyew no kakra ne ntoma a emu teɛ a ɛyɛ kusuu.',
      },
      {
        en: 'Seek emergency care for large burns, burns to the face or joints, or burns in children.',
        tw: 'Hwehwɛ amanehunu ayaresa ma ɔhyew kɛse, ɔhyew a ɛwɔ anim anaa nkwammoa so, anaasɛ ɔhyew wɔ abofra so.',
      },
    ],
    warning: {
      en: 'Do not put ice, butter, oil, or toothpaste on a burn. Do not burst blisters.',
      tw: 'Mfa ice, butter, ngo, anaa toothpaste nto ɔhyew so. Mpae ampɔ̃ no.',
    },
  },
  {
    id: 'stroke',
    title: {
      en: 'Stroke recognition',
      tw: 'Stroke ho nimdeɛ',
    },
    intro: {
      en: 'A stroke is a medical emergency. Remember FAST to recognise it.',
      tw: 'Stroke yɛ amanehunu. Kae FAST na wubehu.',
    },
    steps: [
      {
        en: 'Face: ask the person to smile. Does one side of the face droop?',
        tw: 'Anim: ka kyerɛ onipa no sɛ ɔnsere. Anim fã baako sɛɛ?',
      },
      {
        en: 'Arms: ask them to raise both arms. Does one arm drift down?',
        tw: 'Nsa: ka kyerɛ no sɛ ɔmma ne nsa abien so. Nsa baako kɔ fam?',
      },
      {
        en: 'Speech: ask them to say a simple sentence. Is speech slurred or strange?',
        tw: 'Kasa: ka kyerɛ no sɛ ɔnka kasamu a ɛyɛ mmerɛ. Kasa no abɔ aseɛ anaasɛ ɛyɛ soronko?',
      },
      {
        en: 'Time: if you see any of these signs, call 112 immediately. Note the time the signs started.',
        tw: 'Bere: sɛ wuhu saa nsɛnkyerɛnne yi mu biara a, frɛ 112 seesei ara. Kyerɛw bere a nsɛnkyerɛnne no hyɛɛ aseɛ.',
      },
    ],
    warning: {
      en: 'Do not wait to see if the signs pass. Stroke treatment works best when started quickly.',
      tw: 'Ntwɛn sɛ nsɛnkyerɛnne no bɛtwa mu. Stroke ayaresa yɛ adwuma papa bere a wɔhyɛ ase ntɛm.',
    },
  },
  {
    id: 'seek-help',
    title: {
      en: 'When and how to seek emergency help',
      tw: 'Bere ne sɛnea wobɛhwehwɛ amanehunu mmoa',
    },
    intro: {
      en: 'Knowing how to call for help saves time in an emergency.',
      tw: 'Sɛ wunim sɛnea wobɛfrɛ mmoa a, ɛgye bere wɔ amanehunu mu.',
    },
    steps: [
      {
        en: 'Call 112 (Ghana national emergency line). State clearly: where you are, what happened, and how many people need help.',
        tw: 'Frɛ 112 (Ghana amanehunu line). Ka pefee: baabi a wowɔ, nea asi, ne nnipa dodow a wohia mmoa.',
      },
      {
        en: 'Stay on the line and answer the operator’s questions. Do not hang up until told to.',
        tw: 'Tena line no so na bua operator no nsɛmmisa. Mfa line no nto hɔ kosi sɛ wɔbɛka akyerɛ wo.',
      },
      {
        en: 'If you cannot call, send someone to the nearest facility for help.',
        tw: 'Sɛ wuntumi nfrɛ a, soma obi kɔ ayaresa bea a ɛbɛn hɔ ma ɔnkɔhwehwɛ mmoa.',
      },
    ],
    warning: {
      en: 'Emergency numbers may change. Verify the numbers for your area.',
      tw: 'Amanehunu nɔmba betumi asesa. Hwehwɛ wo mpɔtam nɔmba.',
    },
  },
];
