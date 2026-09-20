import React, { useState, useMemo } from 'react';
import { TRIBAL_LEXICON, TRIBAL_LANGUAGES } from '../data/tribalLexicon';
import { UI_TRANSLATIONS } from '../data/uiTranslations';
import { voiceService } from '../services/voiceTranslationService';
import { cleanPrimaryHindi } from '../services/nlpTranslationEngine';
import {
  Printer,
  RefreshCw,
  Volume2,
  Check,
  CheckCircle2,
  XCircle,
  Star,
  RotateCcw,
  BookOpen,
  Hash,
  Layers,
  X,
  HelpCircle,
  Target,
  GraduationCap,
} from 'lucide-react';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';

// Counting illustrations (authentic rural/tribal items)
const COUNT_ITEMS_ICONS = ['🍎', '🍃', '🌸', '🥭', '🐟', '🌳', '🐦', '⭐', '🥥', '🌻'];

// Grade-specific NIPUN Bharat Syllabus & Competency Definitions
export const GRADE_CURRICULUM = {
  grade1: {
    id: 'grade1',
    label: 'Class 1',
    labelHindi: 'कक्षा 1 (बालवाटिका व कक्षा 1)',
    labelEnglish: 'Class 1 (Foundational FLN)',
    nipunCode: 'FLN-L1.2',
    themeHindi: 'मौखिक भाषा, प्राथमिक शब्द व 1-5 संख्या बोध',
    themeEnglish: 'Oral Vocabulary, Concrete Nouns & Numbers 1–5',
    competencyHindi: 'बुनियादी ध्वनि-संकेत पहचान, घरेलू वस्तुएं एवं 1 से 5 तक प्रत्यक्ष गिनती',
    competencyEnglish: 'Basic phoneme recognition, household concrete words & numbers 1 to 5',
    matchingCategories: ['family', 'nature'],
    numberRange: [1, 5],
  },
  grade2: {
    id: 'grade2',
    label: 'Class 2',
    labelHindi: 'कक्षा 2 (मध्यवर्ती FLN)',
    labelEnglish: 'Class 2 (Intermediate FLN)',
    nipunCode: 'FLN-L2.4',
    themeHindi: 'दैनिक क्रियाएं, पशु-पक्षी व 6-10 संख्या गणना',
    themeEnglish: 'Action Verbs, Animals & Numbers 6–10',
    competencyHindi: 'दैनिक कक्षा निर्देश, पशु-पक्षी पहचान एवं 6 से 10 तक समूह गणना',
    competencyEnglish: 'Classroom instructions, animals, and group counting from 6 to 10',
    matchingCategories: ['animals', 'classroom'],
    numberRange: [6, 10],
  },
  grade3: {
    id: 'grade3',
    label: 'Class 3',
    labelHindi: 'कक्षा 3 (उन्नत FLN)',
    labelEnglish: 'Class 3 (Advanced FLN)',
    nipunCode: 'FLN-L3.1',
    themeHindi: 'सामाजिक संवाद, व्याकरण व 1-10 मिश्रित अनुप्रयोग',
    themeEnglish: 'Social Dialogue, Sentence Flow & Applied Numeracy',
    competencyHindi: 'संदर्भगत वाक्य रचना, पर्यावरण समझ एवं मिश्रित गणना',
    competencyEnglish: 'Contextual sentence construction, social greetings, and mixed numeracy',
    matchingCategories: ['greetings', 'nature', 'family'],
    numberRange: [1, 10],
  },
};

const GRADE_SENTENCE_QUESTIONS = {
  grade1: {
    santhali: [
      {
        id: 'sq_g1_1',
        hindiPrompt: 'यह मेरा घर है।',
        englishPrompt: 'This is my house.',
        sentencePre: 'ᱱᱚᱣᱟ ᱫᱚ ᱤᱧᱟᱜ ',
        sentencePost: ' ᱠᱟᱱᱟ᱾',
        correct: 'ᱚᱲᱟᱜ',
        phonetic: 'Oṛak’',
        options: ['ᱫᱟᱜ', 'ᱚᱲᱟᱜ', 'ᱫᱟᱨᱮ'], // Answer is B (index 1)
      },
      {
        id: 'sq_g1_2',
        hindiPrompt: 'मुझे पानी पीना है।',
        englishPrompt: 'I want to drink water.',
        sentencePre: 'ᱤᱧ ᱫᱚ ',
        sentencePost: ' ᱧᱩ ᱥᱟᱱᱟᱹᱧᱟ᱾',
        correct: 'ᱫᱟᱜ',
        phonetic: 'Dāk',
        options: ['ᱫᱟᱠᱟ', 'ᱫᱟᱨᱮ', 'ᱫᱟᱜ'], // Answer is C (index 2)
      },
      {
        id: 'sq_g1_3',
        hindiPrompt: 'माँ मुझे प्यार करती है।',
        englishPrompt: 'Mother loves me.',
        sentencePre: '',
        sentencePost: ' ᱤᱧ ᱫᱩᱞᱟᱹᱲᱟᱹᱧ ᱠᱟᱱᱟᱭ᱾',
        correct: 'ᱟᱭᱳ',
        phonetic: 'Ayo',
        options: ['ᱟᱭᱳ', 'ᱵᱟᱵᱟ', 'ᱜᱟᱛᱮ'], // Answer is A (index 0)
      },
    ],
    ho: [
      {
        id: 'sq_g1_1',
        hindiPrompt: 'यह मेरा घर है।',
        englishPrompt: 'This is my house.',
        sentencePre: 'नेया अयिङ-आ ',
        sentencePost: ' तना।',
        correct: 'ओड़ाः',
        phonetic: 'Ora-ah',
        options: ['दाः', 'ओड़ाः', 'दारु'], // Answer is B (index 1)
      },
      {
        id: 'sq_g1_2',
        hindiPrompt: 'मुझे पानी पीना है।',
        englishPrompt: 'I want to drink water.',
        sentencePre: 'इंग ',
        sentencePost: ' नू सनांग-तन्या।',
        correct: 'दाः',
        phonetic: 'Da-ah',
        options: ['मंडी', 'दारु', 'दाः'], // Answer is C (index 2)
      },
      {
        id: 'sq_g1_3',
        hindiPrompt: 'माँ मुझे प्यार करती है।',
        englishPrompt: 'Mother loves me.',
        sentencePre: '',
        sentencePost: ' इंग-के दुलार-ए तन्या।',
        correct: 'एंगा',
        phonetic: 'Enga',
        options: ['एंगा', 'अप्पा', 'जोता'], // Answer is A (index 0)
      },
    ],
    mundari: [
      {
        id: 'sq_g1_1',
        hindiPrompt: 'यह मेरा घर है।',
        englishPrompt: 'This is my house.',
        sentencePre: 'नेया आइङ-आह ',
        sentencePost: ' तना।',
        correct: 'ओड़ाः',
        phonetic: 'Ora-ah',
        options: ['दाः', 'ओड़ाः', 'दारु'], // Answer is B (index 1)
      },
      {
        id: 'sq_g1_2',
        hindiPrompt: 'मुझे पानी पीना है।',
        englishPrompt: 'I want to drink water.',
        sentencePre: 'आईंग ',
        sentencePost: ' नू सनांग-तन्या।',
        correct: 'दाः',
        phonetic: 'Da-ah',
        options: ['मंडी', 'दारु', 'दाः'], // Answer is C (index 2)
      },
      {
        id: 'sq_g1_3',
        hindiPrompt: 'माँ मुझे प्यार करती है।',
        englishPrompt: 'Mother loves me.',
        sentencePre: '',
        sentencePost: ' आइङ-के दुलार-ए तना।',
        correct: 'एंगा',
        phonetic: 'Enga',
        options: ['एंगा', 'अप्पा', 'गाते'], // Answer is A (index 0)
      },
    ],
    sadri: [
      {
        id: 'sq_g1_1',
        hindiPrompt: 'यह मेरा घर है।',
        englishPrompt: 'This is my house.',
        sentencePre: 'ई मोर ',
        sentencePost: ' हेके।',
        correct: 'घर',
        phonetic: 'Ghor',
        options: ['पानी', 'घर', 'गाछ'], // Answer is B (index 1)
      },
      {
        id: 'sq_g1_2',
        hindiPrompt: 'मुझे पानी पीना है।',
        englishPrompt: 'I want to drink water.',
        sentencePre: 'मोके ',
        sentencePost: ' पिएक मन करत हे।',
        correct: 'पानी',
        phonetic: 'Pani',
        options: ['भात', 'गाछ', 'पानी'], // Answer is C (index 2)
      },
      {
        id: 'sq_g1_3',
        hindiPrompt: 'माँ मुझे प्यार करती है।',
        englishPrompt: 'Mother loves me.',
        sentencePre: '',
        sentencePost: ' मोके प्यार करेला।',
        correct: 'माई',
        phonetic: 'Mai',
        options: ['माई', 'बाप', 'संगी'], // Answer is A (index 0)
      },
    ],
  },
  grade2: {
    santhali: [
      {
        id: 'sq_g2_1',
        hindiPrompt: 'हाथी जंगल में रहता है।',
        englishPrompt: 'The elephant lives in the forest.',
        sentencePre: '',
        sentencePost: ' ᱵᱤᱨ ᱨᱮ ᱛᱟᱦᱮᱸᱱᱟ᱾',
        correct: 'ᱦᱟᱹᱛᱤ',
        phonetic: 'Hāti',
        options: ['ᱥᱮᱛᱟ', 'ᱦᱟᱹᱛᱤ', 'ᱦᱟᱹᱠᱩ'], // Answer is B (index 1)
      },
      {
        id: 'sq_g2_2',
        hindiPrompt: 'पक्षी पेड़ की डाली पर बैठता है।',
        englishPrompt: 'The bird sits on the tree.',
        sentencePre: 'ᱪᱮᱬᱮ ',
        sentencePost: ' ᱨᱮ ᱫᱩᱲᱩᱵᱼᱟ᱾',
        correct: 'ᱫᱟᱨᱮ',
        phonetic: 'Dāre',
        options: ['ᱚᱲᱟᱜ', 'ᱜᱟᱰᱟ', 'ᱫᱟᱨᱮ'], // Answer is C (index 2)
      },
      {
        id: 'sq_g2_3',
        hindiPrompt: 'कक्षा में अपनी किताब खोलो।',
        englishPrompt: 'Open your book in class.',
        sentencePre: 'ᱪᱟᱱᱟᱪ ᱨᱮ ',
        sentencePost: ' ᱡᱷᱤᱡᱽ ᱢᱮ᱾',
        correct: 'ᱯᱩᱛᱷᱤ',
        phonetic: 'Puthi',
        options: ['ᱯᱩᱛᱷᱤ', 'ᱚᱲᱟᱜ', 'ᱥᱮᱛᱟ'], // Answer is A (index 0)
      },
    ],
    ho: [
      {
        id: 'sq_g2_1',
        hindiPrompt: 'हाथी जंगल में रहता है।',
        englishPrompt: 'The elephant lives in the forest.',
        sentencePre: '',
        sentencePost: ' बिर रे ताइना।',
        correct: 'हाती',
        phonetic: 'Hāti',
        options: ['सेता', 'हाती', 'हाकु'], // Answer is B (index 1)
      },
      {
        id: 'sq_g2_2',
        hindiPrompt: 'पक्षी पेड़ पर बैठता है।',
        englishPrompt: 'The bird sits on the tree.',
        sentencePre: 'चेणे ',
        sentencePost: ' रे दुब तन्या।',
        correct: 'दारु',
        phonetic: 'Daru',
        options: ['ओड़ाः', 'गड़ा', 'दारु'], // Answer is C (index 2)
      },
      {
        id: 'sq_g2_3',
        hindiPrompt: 'कक्षा में अपनी किताब खोलो।',
        englishPrompt: 'Open your book in class.',
        sentencePre: 'क्लास रे ',
        sentencePost: ' उताये मे।',
        correct: 'पोथी',
        phonetic: 'Pothi',
        options: ['पोथी', 'ओड़ाः', 'सेता'], // Answer is A (index 0)
      },
    ],
    mundari: [
      {
        id: 'sq_g2_1',
        hindiPrompt: 'हाथी जंगल में रहता है।',
        englishPrompt: 'The elephant lives in the forest.',
        sentencePre: '',
        sentencePost: ' बीर रे तइना।',
        correct: 'हाती',
        phonetic: 'Hāti',
        options: ['सेता', 'हाती', 'हाकु'], // Answer is B (index 1)
      },
      {
        id: 'sq_g2_2',
        hindiPrompt: 'पक्षी पेड़ पर बैठता है।',
        englishPrompt: 'The bird sits on the tree.',
        sentencePre: 'चेणें ',
        sentencePost: ' रे दुब तना।',
        correct: 'दारु',
        phonetic: 'Daru',
        options: ['ओड़ाः', 'गड़ा', 'दारु'], // Answer is C (index 2)
      },
      {
        id: 'sq_g2_3',
        hindiPrompt: 'कक्षा में अपनी किताब खोलो।',
        englishPrompt: 'Open your book in class.',
        sentencePre: 'क्लास रे ',
        sentencePost: ' ओताइमे।',
        correct: 'पुथी',
        phonetic: 'Puthi',
        options: ['पुथी', 'ओड़ाः', 'सेता'], // Answer is A (index 0)
      },
    ],
    sadri: [
      {
        id: 'sq_g2_1',
        hindiPrompt: 'हाथी जंगल में रहता है।',
        englishPrompt: 'The elephant lives in the forest.',
        sentencePre: '',
        sentencePost: ' जंगल मे रहेला।',
        correct: 'हाथी',
        phonetic: 'Hathi',
        options: ['कुकुर', 'हाथी', 'माछ'], // Answer is B (index 1)
      },
      {
        id: 'sq_g2_2',
        hindiPrompt: 'चिड़िया पेड़ पर बैठती है।',
        englishPrompt: 'The bird sits on the tree.',
        sentencePre: 'चिरई ',
        sentencePost: ' ऊपर बैसेला।',
        correct: 'गाछ',
        phonetic: 'Gaachh',
        options: ['घर', 'नदी', 'गाछ'], // Answer is C (index 2)
      },
      {
        id: 'sq_g2_3',
        hindiPrompt: 'कक्षा में अपनी किताब खोलो।',
        englishPrompt: 'Open your book in class.',
        sentencePre: 'क्लास मे अपन ',
        sentencePost: ' खोला।',
        correct: 'किताब',
        phonetic: 'Kitab',
        options: ['किताब', 'घर', 'कुकुर'], // Answer is A (index 0)
      },
    ],
  },
  grade3: {
    santhali: [
      {
        id: 'sq_g3_1',
        hindiPrompt: 'सवेरे पूरब से सूरज निकलता है।',
        englishPrompt: 'In the morning the sun rises in the east.',
        sentencePre: 'ᱥᱮᱛᱟᱜ ᱨᱮ ',
        sentencePost: ' ᱨᱟᱠᱟᱵᱼᱟ᱾',
        correct: 'ᱥᱤᱧᱡᱚ',
        phonetic: 'Sinjo',
        options: ['ᱫᱟᱨᱮ', 'ᱥᱤᱧᱡᱚ', 'ᱜᱟᱰᱟ'], // Answer is B (index 1)
      },
      {
        id: 'sq_g3_2',
        hindiPrompt: 'पेड़ हमें ताज़ी हवा और छाया देते हैं।',
        englishPrompt: 'Trees give us fresh air and shade.',
        sentencePre: 'ᱫᱟᱨᱮ ᱟᱵᱚ ᱥᱟᱯᱷᱟ ',
        sentencePost: ' ᱟᱨ ᱩᱢᱩᱞ ᱮᱢᱟᱵᱚᱱᱟ᱾',
        correct: 'ᱦᱚᱭ',
        phonetic: 'Hoy',
        options: ['ᱦᱚᱭ', 'ᱫᱟᱜ', 'ᱥᱤᱧᱡᱚ'], // Answer is A (index 0)
      },
      {
        id: 'sq_g3_3',
        hindiPrompt: 'स्कूल में मेरा संगी (दोस्त) आया है।',
        englishPrompt: 'My friend has come to school.',
        sentencePre: 'ᱤᱥᱠᱩᱞ ᱨᱮ ᱤᱧ ᱨᱮᱱ ',
        sentencePost: ' ᱦᱮᱡ ᱟᱠᱟᱱᱟ᱾',
        correct: 'ᱜᱟᱛᱮ',
        phonetic: 'Gāte',
        options: ['ᱜᱟᱛᱮ', 'ᱦᱟᱹᱛᱤ', 'ᱚᱲᱟᱜ'], // Answer is A (index 0)
      },
    ],
    ho: [
      {
        id: 'sq_g3_1',
        hindiPrompt: 'सवेरे पूरब से सूरज निकलता है।',
        englishPrompt: 'In the morning the sun rises in the east.',
        sentencePre: 'सेताः रे ',
        sentencePost: ' ओड़ोः तना।',
        correct: 'सिंगी',
        phonetic: 'Singi',
        options: ['दारु', 'सिंगी', 'गड़ा'], // Answer is B (index 1)
      },
      {
        id: 'sq_g3_2',
        hindiPrompt: 'पेड़ हमें ताज़ी हवा और छाया देते हैं।',
        englishPrompt: 'Trees give us fresh air and shade.',
        sentencePre: 'दारु आबुके सफा ',
        sentencePost: ' आर उबुल ओमेया।',
        correct: 'होयो',
        phonetic: 'Hoyo',
        options: ['होयो', 'दाः', 'सिंगी'], // Answer is A (index 0)
      },
      {
        id: 'sq_g3_3',
        hindiPrompt: 'स्कूल में मेरा दोस्त आया है।',
        englishPrompt: 'My friend has come to school.',
        sentencePre: 'स्कूल रे अयिङ-आ ',
        sentencePost: ' हिजुअकना।',
        correct: 'संगी',
        phonetic: 'Sangi',
        options: ['संगी', 'हाती', 'ओड़ाः'], // Answer is A (index 0)
      },
    ],
    mundari: [
      {
        id: 'sq_g3_1',
        hindiPrompt: 'सवेरे पूरब से सूरज निकलता है।',
        englishPrompt: 'In the morning the sun rises in the east.',
        sentencePre: 'सेताः रे ',
        sentencePost: ' ओड़ोः तना।',
        correct: 'सिंगी',
        phonetic: 'Singi',
        options: ['दारु', 'सिंगी', 'गड़ा'], // Answer is B (index 1)
      },
      {
        id: 'sq_g3_2',
        hindiPrompt: 'पेड़ हमें ताज़ी हवा और छाया देते हैं।',
        englishPrompt: 'Trees give us fresh air and shade.',
        sentencePre: 'दारु आबुके सफा ',
        sentencePost: ' आर उबुल ओमेया।',
        correct: 'होयो',
        phonetic: 'Hoyo',
        options: ['होयो', 'दाः', 'सिंगी'], // Answer is A (index 0)
      },
      {
        id: 'sq_g3_3',
        hindiPrompt: 'स्कूल में मेरा दोस्त आया है।',
        englishPrompt: 'My friend has come to school.',
        sentencePre: 'स्कूल रे आइङ-आह ',
        sentencePost: ' हिजुअकना।',
        correct: 'गाते',
        phonetic: 'Gāte',
        options: ['गाते', 'हाती', 'ओड़ाः'], // Answer is A (index 0)
      },
    ],
    sadri: [
      {
        id: 'sq_g3_1',
        hindiPrompt: 'सवेरे पूरब से सूरज निकलता है।',
        englishPrompt: 'In the morning the sun rises in the east.',
        sentencePre: 'बिहाने पूरब से ',
        sentencePost: ' निकलेल।',
        correct: 'सुरुज',
        phonetic: 'Suruj',
        options: ['गाछ', 'सुरुज', 'नदी'], // Answer is B (index 1)
      },
      {
        id: 'sq_g3_2',
        hindiPrompt: 'पेड़ हमें ताज़ी हवा और छाया देते हैं।',
        englishPrompt: 'Trees give us fresh air and shade.',
        sentencePre: 'गाछ-बिरिछ हमके शुद्ध ',
        sentencePost: ' आउर छाहिं देवेला।',
        correct: 'हवा',
        phonetic: 'Hawa',
        options: ['हवा', 'पानी', 'सुरुज'], // Answer is A (index 0)
      },
      {
        id: 'sq_g3_3',
        hindiPrompt: 'स्कूल में मेरा संगी (दोस्त) आया है।',
        englishPrompt: 'My friend has come to school.',
        sentencePre: 'स्कूल मे मोर ',
        sentencePost: ' आवेला।',
        correct: 'संगी',
        phonetic: 'Sangi',
        options: ['संगी', 'हाथी', 'घर'], // Answer is A (index 0)
      },
    ],
  },
};

export function WorksheetStudio({ selectedLang, uiLang = 'hi' }) {
  // Exercise type: 'matching' | 'numeracy' | 'fillblanks'
  const [worksheetType, setWorksheetType] = useState('matching');
  const [gradeLevel, setGradeLevel] = useState('grade1');
  const [seed, setSeed] = useState(1);

  // 1. Matching state (Bidirectional, pair tracking, shake animation)
  // activeSelection: { side: 'left' | 'right', item }
  const [activeSelection, setActiveSelection] = useState(() => ({
    side: 'left',
    item: { id: 'nat_2', hindi: 'पेड़ / वृक्ष', english: 'Tree' },
  }));
  const [matchedPairs, setMatchedPairs] = useState(() => ({
    'nat_1': 'nat_1', // Water -> Da:ah
    'nat_4': 'nat_4', // Sun -> Singi
  }));
  const [pairNumberMap, setPairNumberMap] = useState(() => ({
    'nat_1': 1,
    'nat_4': 2,
  }));
  const [shakeCardId, setShakeCardId] = useState(null);

  // 2. Numeracy / Counting state
  const [numeracyAnswers, setNumeracyAnswers] = useState({}); // { [itemId]: selectedNumber }
  const [tappedCounts, setTappedCounts] = useState({}); // { [itemId]: [1, 2, 3...] }

  // 3. Sentence practice state
  const [interactiveAnswers, setInteractiveAnswers] = useState({}); // { [qId]: selectedWord }
  const [isScoreEvaluated, setIsScoreEvaluated] = useState(false);

  const isEn = uiLang === 'en';
  const t = UI_TRANSLATIONS[uiLang] || UI_TRANSLATIONS.hi;
  const langMeta = TRIBAL_LANGUAGES[selectedLang] || TRIBAL_LANGUAGES.santhali;
  const activeCurriculum = GRADE_CURRICULUM[gradeLevel] || GRADE_CURRICULUM.grade1;

  // Extract tribal word data cleanly
  const getTribalData = (item) => {
    if (!item) return { native: '', phonetic: '', audio: '' };
    const langObj = item[selectedLang] || item.santhali || {};
    const native = selectedLang === 'santhali'
      ? (langObj.nativeOlChiki || langObj.native || item.hindi)
      : (langObj.native || item.hindi);
    const phonetic = langObj.phoneticDeva || langObj.phoneticLatin || '';
    const audio = langObj.audioText || phonetic || native;
    return { native, phonetic, audio };
  };

  // 1. Matching Items (5 concrete nouns filtered dynamically by active Grade Curriculum)
  const matchingItems = useMemo(() => {
    let pool = TRIBAL_LEXICON.filter((i) => activeCurriculum.matchingCategories.includes(i.category));
    if (pool.length < 5) {
      pool = TRIBAL_LEXICON.filter((i) => ['animals', 'nature', 'family', 'classroom', 'greetings'].includes(i.category));
    }
    const offset = (seed * 3) % Math.max(1, pool.length - 4);
    return pool.slice(offset, offset + 5);
  }, [gradeLevel, seed, activeCurriculum]);

  // Shuffled right column for matching
  const matchingRightColumn = useMemo(() => {
    const list = [...matchingItems];
    // Deterministic shuffle with seed
    return list.sort((a, b) => {
      const hashA = (a.id.charCodeAt(0) * 17 + seed * 13) % 23;
      const hashB = (b.id.charCodeAt(0) * 17 + seed * 13) % 23;
      return hashA - hashB;
    });
  }, [matchingItems, seed]);

  // 2. Numeracy Items (Numbers 1-5 for Class 1, 6-10 for Class 2, 1-10 mixed for Class 3)
  const numberItems = useMemo(() => {
    const [minN, maxN] = activeCurriculum.numberRange;
    const nums = TRIBAL_LEXICON.filter((i) => i.category === 'numbers' && i.numeral >= minN && i.numeral <= maxN);
    const offset = (seed * 2) % Math.max(1, nums.length - 4);
    return nums.slice(offset, offset + Math.min(5, nums.length));
  }, [gradeLevel, seed, activeCurriculum]);

  // 3. Sentence Practice contextual questions (Dynamically targeted by Class & Tribal Language)
  const sentenceQuestions = useMemo(() => {
    const gradeSet = GRADE_SENTENCE_QUESTIONS[gradeLevel] || GRADE_SENTENCE_QUESTIONS.grade1;
    const rawList = gradeSet[selectedLang] || gradeSet.santhali;
    return rawList.map((q, idx) => {
      // Dynamic shift based on seed so each shuffle randomizes option positions
      const shift = ((seed - 1) * 2 + idx) % q.options.length;
      const shuffledOptions = q.options.map((_, i) => q.options[(i + shift) % q.options.length]);
      return {
        ...q,
        options: shuffledOptions,
      };
    });
  }, [gradeLevel, selectedLang, seed]);

  // ==========================================================================
  // ACTIONS & HANDLERS
  // ==========================================================================
  const handleShuffle = () => {
    setSeed((prev) => prev + 1);
    setActiveSelection(null);
    setMatchedPairs({});
    setPairNumberMap({});
    setNumeracyAnswers({});
    setTappedCounts({});
    setInteractiveAnswers({});
    setIsScoreEvaluated(false);
    toast.success(isEn ? 'Generated fresh exercise!' : 'नया अभ्यास तैयार किया गया!');
  };

  const handlePrint = () => {
    toast.info(isEn ? 'Opening clean A4 printable view...' : 'प्रिंट / A4 संवाद खुल रहा है...');
    window.print();
  };

  const handleSpeak = (text) => {
    voiceService.speakText(text, 'hi-IN');
  };

  // --------------------------------------------------------------------------
  // 1. BI-DIRECTIONAL WORD MATCHING HANDLER
  // --------------------------------------------------------------------------
  const handleCardClick = (side, item) => {
    // If card is already matched
    if (side === 'left' && matchedPairs[item.id]) {
      const tribal = getTribalData(item);
      voiceService.speakText(tribal.audio, 'hi-IN');
      return;
    }
    if (side === 'right' && Object.values(matchedPairs).includes(item.id)) {
      const tribal = getTribalData(item);
      voiceService.speakText(tribal.audio, 'hi-IN');
      return;
    }

    voiceService.playChime('click');

    // Case A: Nothing is currently selected -> select this card
    if (!activeSelection) {
      setActiveSelection({ side, item });
      return;
    }

    // Case B: Clicked the same card again -> unselect
    if (activeSelection.side === side && activeSelection.item.id === item.id) {
      setActiveSelection(null);
      return;
    }

    // Case C: Clicked another card on the SAME side -> switch selection
    if (activeSelection.side === side) {
      setActiveSelection({ side, item });
      return;
    }

    // Case D: Clicked opposite side -> ATTEMPT MATCH
    const leftItem = activeSelection.side === 'left' ? activeSelection.item : item;
    const rightItem = activeSelection.side === 'right' ? activeSelection.item : item;

    if (leftItem.id === rightItem.id) {
      // CORRECT MATCH!
      const currentCount = Object.keys(matchedPairs).length + 1;
      const nextMatched = { ...matchedPairs, [leftItem.id]: rightItem.id };
      const nextNumbers = { ...pairNumberMap, [leftItem.id]: currentCount };

      setMatchedPairs(nextMatched);
      setPairNumberMap(nextNumbers);
      setActiveSelection(null);

      voiceService.playChime('success');
      const tribal = getTribalData(leftItem);
      voiceService.speakText(tribal.audio, 'hi-IN');

      toast.success(`${t.wsMatchPairSuccess}: ${leftItem.hindi} ↔ ${tribal.native}`);
    } else {
      // MISMATCH!
      voiceService.playChime('error');
      setShakeCardId(item.id);
      toast.error(t.wsMatchPairError);
      setTimeout(() => {
        setShakeCardId(null);
        setActiveSelection(null);
      }, 600);
    }
  };

  const handleUnpair = (leftId, e) => {
    e.stopPropagation();
    const nextPairs = { ...matchedPairs };
    delete nextPairs[leftId];
    const nextNumbers = { ...pairNumberMap };
    delete nextNumbers[leftId];
    setMatchedPairs(nextPairs);
    setPairNumberMap(nextNumbers);
    toast.info(t.wsMatchUnpair);
  };

  // --------------------------------------------------------------------------
  // 2. COUNTING / NUMERACY HANDLERS
  // --------------------------------------------------------------------------
  const handleTapCountDot = (itemId, dotIndex, targetNum) => {
    voiceService.playChime('click');
    const existing = tappedCounts[itemId] || [];
    let updated;
    if (existing.includes(dotIndex)) {
      updated = existing.filter((idx) => idx !== dotIndex);
    } else {
      updated = [...existing, dotIndex];
    }
    setTappedCounts((prev) => ({ ...prev, [itemId]: updated }));

    // Speak count number aloud
    const currentCount = updated.length;
    if (currentCount > 0) {
      const matchNumItem = TRIBAL_LEXICON.find((i) => i.category === 'numbers' && i.numeral === currentCount);
      if (matchNumItem) {
        const tribal = getTribalData(matchNumItem);
        voiceService.speakText(tribal.audio, 'hi-IN');
      }
    }
  };

  const handleSelectNumberAnswer = (item, chosenNum) => {
    setNumeracyAnswers((prev) => ({ ...prev, [item.id]: chosenNum }));

    if (chosenNum === item.numeral) {
      voiceService.playChime('success');
      const tribal = getTribalData(item);
      voiceService.speakText(tribal.audio, 'hi-IN');
      toast.success(`${t.wsCountCorrect} (${item.numeral} = ${tribal.native})`);
    } else {
      voiceService.playChime('error');
      toast.error(t.wsCountTryAgain);
    }
  };

  // --------------------------------------------------------------------------
  // 3. SENTENCE PRACTICE HANDLERS
  // --------------------------------------------------------------------------
  const handleSelectSentenceWord = (qId, option) => {
    setInteractiveAnswers((prev) => ({ ...prev, [qId]: option }));
    voiceService.playChime('click');
    setIsScoreEvaluated(false); // reset until checked
  };

  // --------------------------------------------------------------------------
  // 4. INTELLIGENT & CONTEXT-AWARE "CHECK ANSWERS" HANDLER (ZERO FALSE CHEERS!)
  // --------------------------------------------------------------------------
  const handleCheckAnswers = () => {
    // === EXERCISE 1: WORD MATCHING ===
    if (worksheetType === 'matching') {
      const matchedCount = Object.keys(matchedPairs).length;
      const total = matchingItems.length;

      if (matchedCount === 0) {
        toast.info(t.wsCheckToastIncomplete);
        voiceService.playChime('click');
        return;
      }

      if (matchedCount < total) {
        toast.warning(t.wsCheckToastPartial.replace('{count}', matchedCount).replace('{total}', total));
        voiceService.playChime('error');
        return;
      }

      // Strict verification: Ensure every pair is 100% matched to the correct item
      const isAllValid = matchingItems.every((item) => matchedPairs[item.id] === item.id);
      if (!isAllValid) {
        toast.error(isEn ? 'Some pairs are incorrect! Please review and fix.' : 'कुछ जोड़ियाँ गलत हैं! कृपया सुधारें।');
        voiceService.playChime('error');
        return;
      }

      // All 5 correctly matched!
      confetti({ particleCount: 90, spread: 80, origin: { y: 0.55 } });
      voiceService.playChime('success');
      toast.success(t.wsCheckToastAllCorrect);
      return;
    }

    // === EXERCISE 2: NUMERACY & COUNTING ===
    if (worksheetType === 'numeracy') {
      const total = numberItems.length;
      const answeredKeys = Object.keys(numeracyAnswers);

      if (answeredKeys.length === 0) {
        toast.info(t.wsCheckToastIncomplete);
        voiceService.playChime('click');
        return;
      }

      const correctCount = numberItems.filter((i) => numeracyAnswers[i.id] === i.numeral).length;

      if (answeredKeys.length < total) {
        toast.warning(t.wsCheckToastPartial.replace('{count}', answeredKeys.length).replace('{total}', total));
        voiceService.playChime('error');
        return;
      }

      if (correctCount === total) {
        confetti({ particleCount: 90, spread: 80, origin: { y: 0.55 } });
        voiceService.playChime('success');
        toast.success(t.wsCheckToastAllCorrect);
      } else {
        voiceService.playChime('error');
        toast.error(t.wsCheckToastPartial.replace('{count}', correctCount).replace('{total}', total));
      }
      return;
    }

    // === EXERCISE 3: SENTENCE PRACTICE ===
    if (worksheetType === 'fillblanks') {
      const total = sentenceQuestions.length;
      const answeredKeys = Object.keys(interactiveAnswers);

      if (answeredKeys.length === 0) {
        toast.info(t.wsCheckToastIncomplete);
        voiceService.playChime('click');
        return;
      }

      if (answeredKeys.length < total) {
        toast.warning(t.wsCheckToastIncomplete);
        voiceService.playChime('error');
        return;
      }

      const correctCount = sentenceQuestions.filter((q) => interactiveAnswers[q.id] === q.correct).length;
      setIsScoreEvaluated(true);

      if (correctCount === total) {
        confetti({ particleCount: 90, spread: 80, origin: { y: 0.55 } });
        voiceService.playChime('success');
        toast.success(t.wsCheckToastAllCorrect);
      } else {
        voiceService.playChime('error');
        toast.error(t.wsCheckToastPartial.replace('{count}', correctCount).replace('{total}', total));
      }
      return;
    }
  };

  const handleReset = () => {
    setActiveSelection(null);
    setMatchedPairs({});
    setPairNumberMap({});
    setNumeracyAnswers({});
    setTappedCounts({});
    setInteractiveAnswers({});
    setIsScoreEvaluated(false);
    toast.info(isEn ? 'Exercise reset' : 'अभ्यास रीसेट हुआ');
  };

  return (
    <div style={{ maxWidth: '980px', margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* ==================================================================== */}
      {/* 1. NATIVE IPAD STUDIO HEADER & CONTROLS                              */}
      {/* ==================================================================== */}
      <header className="no-print" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div className="worksheet-title-actions-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '1.65rem', fontWeight: 800, margin: 0, color: 'var(--color-slate)', letterSpacing: '-0.02em' }}>
              {t.wsTitle}
            </h1>
            <p className="worksheet-subtitle-row" style={{ fontSize: '0.86rem', color: 'var(--color-slate-muted)', margin: '4px 0 0 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>{t.wsSubtitle}</span>
              <span>•</span>
              <span style={{ color: 'var(--color-palash)', fontWeight: 600 }}>{langMeta.name} ({langMeta.badgeText})</span>
            </p>
          </div>

          {/* Action Controls: Grade + Shuffle + Print */}
          <div className="worksheet-action-buttons-group" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <select
              id="select-grade-level"
              value={gradeLevel}
              onChange={(e) => {
                const newGrade = e.target.value;
                setGradeLevel(newGrade);
                handleReset();
                const c = GRADE_CURRICULUM[newGrade];
                toast.success(
                  isEn
                    ? `Loaded ${c.labelEnglish}: ${c.themeEnglish}!`
                    : `${c.labelHindi} का पाठ्यक्रम एवं नए अभ्यास लोड किए गए!`
                );
              }}
              style={{
                padding: '7px 14px',
                borderRadius: '6px',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-surface)',
                color: 'var(--color-slate)',
                fontSize: '0.84rem',
                fontWeight: 600,
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="grade1">{isEn ? 'Class 1 (Foundational FLN)' : 'कक्षा 1 (बालवाटिका व कक्षा 1)'}</option>
              <option value="grade2">{isEn ? 'Class 2 (Intermediate FLN)' : 'कक्षा 2 (मध्यवर्ती FLN)'}</option>
              <option value="grade3">{isEn ? 'Class 3 (Advanced FLN)' : 'कक्षा 3 (उन्नत FLN)'}</option>
            </select>

            <button
              type="button"
              onClick={handleShuffle}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 14px',
                borderRadius: '6px',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-surface)',
                color: 'var(--color-slate)',
                fontSize: '0.84rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              title={t.wsShuffleBtn}
            >
              <RefreshCw size={14} />
              <span>{t.wsShuffleBtn}</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 18px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: 'var(--color-palash)',
                color: '#FFFFFF',
                fontSize: '0.84rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(194, 65, 12, 0.25)',
                transition: 'all 0.15s ease',
              }}
            >
              <Printer size={15} />
              <span>{t.wsPrintBtn}</span>
            </button>
          </div>
        </div>

        {/* 2. NATIVE IPAD SEGMENTED CONTROL (SINGLE COHESIVE TRACK) */}
        <div
          className="worksheet-segmented-track"
          style={{
            display: 'inline-flex',
            backgroundColor: 'var(--color-surface-tint)',
            padding: '4px',
            borderRadius: '8px',
            border: '1px solid var(--color-border-subtle)',
            gap: '2px',
            alignSelf: 'flex-start',
          }}
        >
          {[
            { id: 'matching', label: t.wsTypeMatching, mobileLabel: isEn ? 'Matching' : 'मिलान', icon: Layers },
            { id: 'numeracy', label: t.wsTypeNumeracy, mobileLabel: isEn ? 'Numbers' : 'संख्याएं', icon: Hash },
            { id: 'fillblanks', label: t.wsTypeFillBlanks, mobileLabel: isEn ? 'Sentences' : 'वाक्य', icon: BookOpen },
          ].map((tab) => {
            const isActive = worksheetType === tab.id;
            const TabIcon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setWorksheetType(tab.id);
                  setActiveSelection(null);
                  setIsScoreEvaluated(false);
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '7px 16px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: isActive ? 'var(--color-surface-card)' : 'transparent',
                  color: isActive ? 'var(--color-slate)' : 'var(--color-slate-muted)',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '0.86rem',
                  cursor: 'pointer',
                  boxShadow: isActive ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                <TabIcon size={14} color={isActive ? 'var(--color-palash)' : 'currentColor'} />
                <span className="ws-tab-desktop">{tab.label}</span>
                <span className="ws-tab-mobile">{tab.mobileLabel}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* ==================================================================== */}
      {/* 3. THE WORKSHEET DOCUMENT CANVAS (NO BOX-IN-BOX CALLOUTS)            */}
      {/* ==================================================================== */}
      <main
        className="worksheet-main-card"
        style={{
          backgroundColor: 'var(--color-surface-card)',
          borderRadius: '8px',
          padding: '30px 32px',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          border: '1px solid var(--color-border-subtle)',
        }}
      >
        {/* Printable Official Header (Shows when printed or on screen) */}
        <div style={{ borderBottom: '1px solid var(--color-border-subtle)', paddingBottom: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <div className="ws-emblem-govt" style={{ fontSize: '0.70rem', fontWeight: 800, color: 'var(--color-forest)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                {t.wsEmblemGovt}
              </div>
              <h2 className="ws-exercise-title" style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--color-slate)', margin: '4px 0 6px 0' }}>
                {worksheetType === 'matching' && (isEn ? 'Exercise 1: Word & Picture Association' : 'अभ्यास 1: शब्द एवं चित्र मिलान')}
                {worksheetType === 'numeracy' && (isEn ? 'Exercise 2: Foundational Numeracy & Counting' : 'अभ्यास 2: बुनियादी संख्या ज्ञान एवं गिनती')}
                {worksheetType === 'fillblanks' && (isEn ? 'Exercise 3: Bilingual Sentence Practice' : 'अभ्यास 3: द्विभाषी वाक्य रचना अभ्यास')}
              </h2>

              {/* Integrated Editorial Syllabus Line (NO CALLOUT BOX!) */}
              <div className="ws-editorial-syllabus" style={{ fontSize: '0.82rem', color: 'var(--color-slate-muted)', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ fontWeight: 700, color: 'var(--color-slate)' }}>
                  {isEn ? activeCurriculum.labelEnglish : activeCurriculum.labelHindi}
                </span>
                <span>•</span>
                <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--color-forest)' }}>
                  {activeCurriculum.nipunCode}
                </span>
                <span>•</span>
                <span>{isEn ? activeCurriculum.themeEnglish : activeCurriculum.themeHindi}</span>
                <span>•</span>
                <span style={{ color: 'var(--color-palash)', fontWeight: 600 }}>
                  {isEn ? `Medium: Hindi + ${langMeta.name}` : `माध्यम: हिंदी + ${langMeta.name}`}
                </span>
              </div>

              <div className="ws-learning-outcome" style={{ fontSize: '0.78rem', color: 'var(--color-slate-muted)', marginTop: '4px' }}>
                <strong style={{ color: 'var(--color-forest)' }}>{isEn ? 'Learning Outcome (LO): ' : 'दक्षता लक्ष्य: '}</strong>
                {isEn ? activeCurriculum.competencyEnglish : activeCurriculum.competencyHindi}
              </div>
            </div>

            {/* Score & Evaluation Progress Badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', borderRadius: '6px', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border-subtle)' }}>
              <Star size={14} color="#EAB308" fill="#EAB308" />
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-slate)' }}>
                {worksheetType === 'matching' && `${Object.keys(matchedPairs).length} / ${matchingItems.length} matched`}
                {worksheetType === 'numeracy' && `${Object.keys(numeracyAnswers).length} / ${numberItems.length} solved`}
                {worksheetType === 'fillblanks' && `${Object.keys(interactiveAnswers).length} / ${sentenceQuestions.length} completed`}
              </span>
              <button
                type="button"
                onClick={handleReset}
                style={{ background: 'none', border: 'none', color: 'var(--color-slate-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '2px' }}
                title={t.wsResetBtn}
              >
                <RotateCcw size={13} />
              </button>
            </div>
          </div>
        </div>

        {/* ================================================================== */}
        {/* EXERCISE 1: WORD MATCHING (CLEAN TACTILE LIST STRIPS, NO GREY BOXES) */}
        {/* ================================================================== */}
        {worksheetType === 'matching' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
              <p className="ws-match-hint" style={{ fontSize: '0.84rem', color: 'var(--color-slate-muted)', margin: 0 }}>
                {t.wsMatchSelectHint}
              </p>
              {activeSelection && (
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-palash)' }}>
                  {isEn
                    ? `Selected "${cleanPrimaryHindi(activeSelection.item.hindi)}" — Now tap matching in ${activeSelection.side === 'left' ? 'Column B' : 'Column A'}`
                    : `चयनित: "${cleanPrimaryHindi(activeSelection.item.hindi)}" — अब ${activeSelection.side === 'left' ? 'कॉलम B' : 'कॉलम A'} से मिलान करें`}
                </span>
              )}
            </div>

            <div className="worksheet-matching-columns" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {/* Left Column A */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--color-slate-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', paddingBottom: '4px' }}>
                  {isEn ? 'Column A (Hindi / English)' : 'कॉलम A (हिंदी / अंग्रेजी)'}
                </div>

                {matchingItems.map((item, idx) => {
                  const isSelected = activeSelection?.side === 'left' && activeSelection?.item.id === item.id;
                  const isMatched = !!matchedPairs[item.id];
                  const pairNum = pairNumberMap[item.id];

                  return (
                    <div
                      key={item.id}
                      onClick={() => handleCardClick('left', item)}
                      style={{
                        padding: '12px 16px',
                        borderRadius: '6px',
                        backgroundColor: isMatched
                          ? 'rgba(16, 185, 129, 0.08)'
                          : isSelected
                          ? 'rgba(194, 65, 12, 0.08)'
                          : 'var(--color-surface)',
                        border: isMatched
                          ? '1.5px solid rgba(16, 185, 129, 0.4)'
                          : isSelected
                          ? '2px solid var(--color-palash)'
                          : shakeCardId === item.id
                          ? '2px solid #EF4444'
                          : '1px solid var(--color-border-subtle)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        cursor: isMatched ? 'default' : 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span
                          style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '4px',
                            backgroundColor: isSelected ? 'var(--color-palash)' : isMatched ? 'var(--color-forest)' : 'var(--color-surface-tint)',
                            color: isSelected || isMatched ? '#FFFFFF' : 'var(--color-slate-muted)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.78rem',
                            fontWeight: 800,
                          }}
                        >
                          {idx + 1}
                        </span>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.96rem', color: 'var(--color-slate)' }}>
                            {cleanPrimaryHindi(item.hindi)}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--color-slate-muted)' }}>
                            {item.english}
                          </div>
                        </div>
                      </div>

                      {/* Right indicator: Clean Pair Badge or Selection Dot */}
                      {isMatched ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#10B981' }}>
                            ✓ {isEn ? `Pair ${pairNum}` : `जोड़ी ${pairNum}`}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => handleUnpair(item.id, e)}
                            style={{ background: 'none', border: 'none', color: 'var(--color-slate-muted)', cursor: 'pointer', padding: '2px' }}
                            title={t.wsMatchUnpair}
                          >
                            <X size={13} />
                          </button>
                        </div>
                      ) : (
                        <span
                          style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            backgroundColor: isSelected ? 'var(--color-palash)' : 'var(--color-border)',
                            transition: 'all 0.15s ease',
                          }}
                        />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Right Column B */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--color-forest)', textTransform: 'uppercase', letterSpacing: '0.06em', paddingBottom: '4px' }}>
                  {isEn ? `Column B (${langMeta.name})` : `कॉलम B (${langMeta.name})`}
                </div>

                {matchingRightColumn.map((item, idx) => {
                  const tribal = getTribalData(item);
                  const isSelected = activeSelection?.side === 'right' && activeSelection?.item.id === item.id;
                  const isMatched = Object.values(matchedPairs).includes(item.id);
                  const matchedLeftKey = Object.keys(matchedPairs).find((k) => matchedPairs[k] === item.id);
                  const pairNum = matchedLeftKey ? pairNumberMap[matchedLeftKey] : null;

                  return (
                    <div
                      key={item.id}
                      onClick={() => handleCardClick('right', item)}
                      style={{
                        padding: '12px 16px',
                        borderRadius: '6px',
                        backgroundColor: isMatched
                          ? 'rgba(16, 185, 129, 0.08)'
                          : isSelected
                          ? 'rgba(194, 65, 12, 0.08)'
                          : 'var(--color-surface)',
                        border: isMatched
                          ? '1.5px solid rgba(16, 185, 129, 0.4)'
                          : isSelected
                          ? '2px solid var(--color-palash)'
                          : shakeCardId === item.id
                          ? '2px solid #EF4444'
                          : '1px solid var(--color-border-subtle)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        cursor: isMatched ? 'default' : 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span
                          style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '4px',
                            backgroundColor: isSelected ? 'var(--color-palash)' : isMatched ? 'var(--color-forest)' : 'var(--color-surface-tint)',
                            color: isSelected || isMatched ? '#FFFFFF' : 'var(--color-forest)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.78rem',
                            fontWeight: 800,
                          }}
                        >
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <div>
                          <div
                            className={selectedLang === 'santhali' ? 'font-olchiki' : 'font-deva'}
                            style={{ fontWeight: 800, fontSize: '1.15rem', color: isMatched ? '#10B981' : 'var(--color-slate)' }}
                          >
                            {tribal.native}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--color-slate-muted)' }}>
                            {tribal.phonetic}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSpeak(tribal.audio);
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--color-slate-muted)',
                            cursor: 'pointer',
                            padding: '4px',
                            display: 'flex',
                          }}
                          title={isEn ? 'Listen' : 'उच्चारण सुनें'}
                        >
                          <Volume2 size={15} />
                        </button>

                        {isMatched ? (
                          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#10B981' }}>
                            ✓ {isEn ? `Pair ${pairNum}` : `जोड़ी ${pairNum}`}
                          </span>
                        ) : (
                          <span
                            style={{
                              width: '8px',
                              height: '8px',
                              borderRadius: '50%',
                              backgroundColor: isSelected ? 'var(--color-palash)' : 'var(--color-border)',
                              transition: 'all 0.15s ease',
                            }}
                          />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ================================================================== */}
        {/* EXERCISE 2: NUMERACY & COUNTING (INTERACTIVE OBJECTS + QUIZ)       */}
        {/* ================================================================== */}
        {worksheetType === 'numeracy' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <p style={{ fontSize: '0.88rem', color: 'var(--color-slate-muted)', margin: 0 }}>
              {t.wsCountPrompt}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {numberItems.map((item, idx) => {
                const tribal = getTribalData(item);
                const icon = COUNT_ITEMS_ICONS[idx % COUNT_ITEMS_ICONS.length];
                const countArr = Array.from({ length: item.numeral }, (_, i) => i + 1);
                const currentTaps = tappedCounts[item.id] || [];
                const studentAnswer = numeracyAnswers[item.id];
                const isSolved = studentAnswer !== undefined;
                const isCorrect = studentAnswer === item.numeral;

                // 3 Strictly Unique Multiple Choice options
                const maxChoices = gradeLevel === 'grade1' ? 5 : 10;
                const choiceSet = new Set([item.numeral]);
                if (item.numeral + 1 <= maxChoices) choiceSet.add(item.numeral + 1);
                if (item.numeral - 1 >= 1) choiceSet.add(item.numeral - 1);
                if (item.numeral + 2 <= maxChoices) choiceSet.add(item.numeral + 2);
                if (item.numeral - 2 >= 1) choiceSet.add(item.numeral - 2);
                let fallback = 1;
                while (choiceSet.size < 3 && fallback <= maxChoices) {
                  choiceSet.add(fallback);
                  fallback++;
                }
                const choices = Array.from(choiceSet).slice(0, 3).sort((a, b) => a - b);

                return (
                  <div
                    key={item.id}
                    style={{
                      padding: '18px 20px',
                      borderRadius: '6px',
                      backgroundColor: isSolved
                        ? isCorrect
                          ? 'rgba(16, 185, 129, 0.08)'
                          : 'rgba(239, 68, 68, 0.08)'
                        : 'var(--color-surface)',
                      border: isSolved
                        ? isCorrect
                          ? '1.5px solid rgba(16, 185, 129, 0.35)'
                          : '1.5px solid rgba(239, 68, 68, 0.35)'
                        : '1px solid var(--color-border-subtle)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {/* Header of Count Row */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--color-slate-muted)' }}>
                          #{idx + 1}
                        </span>
                        <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-slate)' }}>
                          {isEn ? `Count the ${icon} items:` : `${icon} वस्तुओं को गिनें:`}
                        </div>
                      </div>

                      {/* Native Tribal Audio Button */}
                      <button
                        type="button"
                        onClick={() => handleSpeak(tribal.audio)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--color-forest)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                        }}
                      >
                        <Volume2 size={15} />
                        <span>{tribal.native} ({tribal.phonetic})</span>
                      </button>
                    </div>

                    {/* Interactive Countable Objects (Tap each item to count) */}
                    <div
                      style={{
                        display: 'flex',
                        gap: '10px',
                        flexWrap: 'wrap',
                        alignItems: 'center',
                        padding: '8px 0',
                      }}
                    >
                      {countArr.map((dotNum) => {
                        const isTapped = currentTaps.includes(dotNum);
                        return (
                          <button
                            key={dotNum}
                            type="button"
                            onClick={() => handleTapCountDot(item.id, dotNum, item.numeral)}
                            style={{
                              fontSize: '1.8rem',
                              background: isTapped ? 'rgba(16, 185, 129, 0.15)' : 'var(--color-surface-tint)',
                              border: isTapped ? '2px solid #10B981' : '1px solid var(--color-border-subtle)',
                              borderRadius: '6px',
                              padding: '6px 12px',
                              cursor: 'pointer',
                              transform: isTapped ? 'scale(1.08)' : 'scale(1)',
                              transition: 'all 0.12s ease',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              lineHeight: 1,
                            }}
                            title={isEn ? `Tap to count item ${dotNum}` : `गिनने के लिए दबाएँ: वस्तु ${dotNum}`}
                          >
                            <span>{icon}</span>
                            <span style={{ fontSize: '0.70rem', fontWeight: 800, color: isTapped ? '#10B981' : 'var(--color-slate-muted)', marginTop: '4px' }}>
                              {dotNum}
                            </span>
                          </button>
                        );
                      })}

                      <div style={{ marginLeft: 'auto', fontSize: '0.78rem', color: 'var(--color-slate-muted)' }}>
                        {isEn ? `Counted: ${currentTaps.length} of ${item.numeral}` : `गिना गया: ${currentTaps.length} / ${item.numeral}`}
                      </div>
                    </div>

                    {/* Answer Selection Chips: How Many? */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', paddingTop: '6px', borderTop: '1px dashed var(--color-border-subtle)' }}>
                      <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-slate-muted)' }}>
                        {isEn ? 'Choose correct number:' : 'सही संख्या चुनें:'}
                      </div>

                      <div style={{ display: 'flex', gap: '8px' }}>
                        {choices.map((choiceNum) => {
                          const isThisChoice = studentAnswer === choiceNum;
                          return (
                            <button
                              key={choiceNum}
                              type="button"
                              onClick={() => handleSelectNumberAnswer(item, choiceNum)}
                              style={{
                                minWidth: '40px',
                                height: '36px',
                                padding: '0 14px',
                                borderRadius: '6px',
                                border: isThisChoice
                                  ? choiceNum === item.numeral
                                    ? '2px solid #10B981'
                                    : '2px solid #EF4444'
                                  : '1px solid var(--color-border)',
                                backgroundColor: isThisChoice
                                  ? choiceNum === item.numeral
                                    ? '#10B981'
                                    : '#EF4444'
                                  : 'var(--color-surface)',
                                color: isThisChoice ? '#FFFFFF' : 'var(--color-slate)',
                                fontSize: '0.95rem',
                                fontWeight: 800,
                                cursor: 'pointer',
                                transition: 'all 0.12s ease',
                              }}
                            >
                              {choiceNum}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ================================================================== */}
        {/* EXERCISE 3: SENTENCE PRACTICE (AIRY CLOZE ROWS)                   */}
        {/* ================================================================== */}
        {worksheetType === 'fillblanks' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <p style={{ fontSize: '0.84rem', color: 'var(--color-slate-muted)', margin: 0 }}>
              {isEn
                ? 'Complete each sentence by selecting the matching tribal word.'
                : 'सही जनजातीय शब्द चुनकर वाक्य पूरा करें।'}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {sentenceQuestions.map((q, idx) => {
                const selected = interactiveAnswers[q.id];
                const isAnswered = !!selected;
                const isCorrect = selected === q.correct;

                return (
                  <div
                    key={q.id}
                    style={{
                      padding: '16px 20px',
                      borderRadius: '6px',
                      backgroundColor: isScoreEvaluated
                        ? isCorrect
                          ? 'rgba(16, 185, 129, 0.08)'
                          : 'rgba(239, 68, 68, 0.08)'
                        : 'var(--color-surface)',
                      border: isScoreEvaluated
                        ? isCorrect
                          ? '1.5px solid rgba(16, 185, 129, 0.35)'
                          : '1.5px solid rgba(239, 68, 68, 0.35)'
                        : '1px solid var(--color-border-subtle)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontSize: '0.80rem', color: 'var(--color-slate-muted)' }}>
                        #{idx + 1} {q.hindiPrompt} ({q.englishPrompt})
                      </div>
                      {isScoreEvaluated && (
                        <span style={{ fontSize: '0.78rem', fontWeight: 800, color: isCorrect ? '#10B981' : '#EF4444' }}>
                          {isCorrect ? '✓ सही उत्तर' : `✗ सही शब्द: ${q.correct}`}
                        </span>
                      )}
                    </div>

                    {/* Sentence with interactive blank */}
                    <div
                      className={selectedLang === 'santhali' ? 'font-olchiki' : 'font-deva'}
                      style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-slate)' }}
                    >
                      <span>{q.sentencePre}</span>
                      <span
                        style={{
                          borderBottom: '2px solid var(--color-palash)',
                          padding: '0 12px',
                          color: selected ? 'var(--color-forest)' : 'var(--color-slate-muted)',
                          fontStyle: selected ? 'normal' : 'italic',
                        }}
                      >
                        {selected || '________'}
                      </span>
                      <span>{q.sentencePost}</span>
                    </div>

                    {/* Word choice chips */}
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {q.options.map((opt, i) => {
                        const isThisSelected = selected === opt;
                        return (
                          <button
                            key={i}
                            type="button"
                            onClick={() => handleSelectSentenceWord(q.id, opt)}
                            style={{
                              padding: '5px 12px',
                              borderRadius: '4px',
                              border: '1px solid var(--color-border-subtle)',
                              backgroundColor: isScoreEvaluated && opt === q.correct
                                ? 'rgba(16, 185, 129, 0.25)'
                                : isThisSelected
                                ? 'var(--color-forest)'
                                : 'var(--color-surface-tint)',
                              color: isThisSelected && !isScoreEvaluated ? '#FFFFFF' : 'var(--color-slate)',
                              fontWeight: 700,
                              fontSize: '0.88rem',
                              cursor: 'pointer',
                              transition: 'all 0.12s ease',
                            }}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Clean Footer Controls: Real Intelligent "Check Answers" Button */}
        <div className="ws-footer-actions no-print" style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '12px' }}>
          <button
            type="button"
            onClick={handleCheckAnswers}
            style={{
              padding: '8px 24px',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              backgroundColor: '#16A34A',
              color: '#FFFFFF',
              fontWeight: 700,
              fontSize: '0.86rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 8px rgba(22, 163, 74, 0.25)',
            }}
          >
            <CheckCircle2 size={16} />
            <span>{t.wsCheckBtn}</span>
          </button>
        </div>
      </main>
    </div>
  );
}
