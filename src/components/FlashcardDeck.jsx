import React, { useState, useMemo, useEffect } from 'react';
import { TRIBAL_LEXICON, TRIBAL_LANGUAGES } from '../data/tribalLexicon';
import { CLASSROOM_PHRASES } from '../data/classroomPhrases';
import { UI_TRANSLATIONS } from '../data/uiTranslations';
import { translateHindiToTribal } from '../services/nlpTranslationEngine';
import { voiceService } from '../services/voiceTranslationService';
import {
  Volume2,
  RotateCw,
  Sparkles,
  Leaf,
  Hash,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Award,
  Mic,
  MicOff,
  Search,
  Plus,
  Trash2,
  MessageSquare,
  BookOpen,
  Layers,
  X,
  HelpCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { toast } from 'sonner';

const CUSTOM_FLASHCARDS_STORAGE_KEY = 'sarjom_custom_flashcards_v1';

export function FlashcardDeck({ selectedLang, uiLang = 'hi' }) {
  // Navigation & Mode States
  const [deckTab, setDeckTab] = useState('all'); // 'all' | 'sentences' | 'words' | 'custom'
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [flippedCards, setFlippedCards] = useState({});
  const [isQuizMode, setIsQuizMode] = useState(false);
  const [quizType, setQuizType] = useState('all'); // 'all' | 'words' | 'sentences'

  // Custom Flashcard Creation State
  const [customCards, setCustomCards] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [customHindiInput, setCustomHindiInput] = useState('');
  const [customEnglishInput, setCustomEnglishInput] = useState('');
  const [customCategory, _setCustomCategory] = useState('classroom');
  const [customTranslations, setCustomTranslations] = useState(null);
  const [isAutoTranslating, setIsAutoTranslating] = useState(false);
  const [isDictatingModal, setIsDictatingModal] = useState(false);

  // Pronunciation Practice State
  const [practicingCardId, setPracticingCardId] = useState(null);
  const [practiceFeedback, setPracticeFeedback] = useState({}); // cardId -> { score, text, isSuccess }

  // Quiz Mode States
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isQuizFinished, setIsQuizFinished] = useState(false);

  const isEn = uiLang === 'en';
  const t = UI_TRANSLATIONS[uiLang] || UI_TRANSLATIONS.hi;
  const langMeta = TRIBAL_LANGUAGES[selectedLang] || TRIBAL_LANGUAGES.santhali;

  // Load custom flashcards from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(CUSTOM_FLASHCARDS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setCustomCards(parsed);
        }
      }
    } catch (e) {
      console.error('Failed to load custom flashcards:', e);
    }
  }, []);

  // Save custom flashcards
  const saveCustomCards = (updated) => {
    setCustomCards(updated);
    try {
      localStorage.setItem(CUSTOM_FLASHCARDS_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to persist custom flashcards:', e);
    }
  };

  // 1. Prepare Sentence Flashcards from CLASSROOM_PHRASES
  const sentenceCards = useMemo(() => {
    return CLASSROOM_PHRASES.map((p) => ({
      id: `sent_${p.id}`,
      type: 'sentence',
      hindi: p.hindi,
      english: p.english,
      category: p.category || 'classroom',
      categoryNameHindi: p.categoryNameHindi,
      ho: {
        native: p.ho?.native || p.hindi,
        phoneticDeva: p.ho?.phoneticDeva || p.hindi,
        phoneticLatin: p.ho?.phoneticLatin || '',
        audioText: p.ho?.audio || p.ho?.phoneticDeva || p.ho?.native || p.hindi,
      },
      mundari: {
        native: p.mundari?.native || p.hindi,
        phoneticDeva: p.mundari?.phoneticDeva || p.hindi,
        phoneticLatin: p.mundari?.phoneticLatin || '',
        audioText: p.mundari?.audio || p.mundari?.phoneticDeva || p.mundari?.native || p.hindi,
      },
      santhali: {
        nativeOlChiki: p.santhali?.nativeOlChiki || p.santhali?.native || p.hindi,
        nativeDeva: p.santhali?.nativeDeva || p.santhali?.phoneticDeva || p.hindi,
        phoneticDeva: p.santhali?.phoneticDeva || p.santhali?.nativeDeva || p.hindi,
        phoneticLatin: p.santhali?.phoneticLatin || '',
        audioText: p.santhali?.audio || p.santhali?.phoneticDeva || p.santhali?.nativeDeva || p.hindi,
      },
      sadri: {
        native: p.sadri?.native || p.hindi,
        phoneticDeva: p.sadri?.phoneticDeva || p.hindi,
        phoneticLatin: p.sadri?.phoneticLatin || '',
        audioText: p.sadri?.audio || p.sadri?.phoneticDeva || p.sadri?.native || p.hindi,
      },
    }));
  }, []);

  // 2. Prepare Vocabulary Word Flashcards from TRIBAL_LEXICON
  const wordCards = useMemo(() => {
    return TRIBAL_LEXICON.map((w) => ({
      ...w,
      type: 'word',
    }));
  }, []);

  // 3. Combined Deck Pool
  const allCards = useMemo(() => {
    return [...sentenceCards, ...wordCards, ...customCards];
  }, [sentenceCards, wordCards, customCards]);

  // Categories list with counts
  const categories = [
    { id: 'all', label: isEn ? 'All Categories' : 'सभी श्रेणियां' },
    { id: 'management', label: isEn ? 'Classroom Discipline' : 'कक्षा अनुशासन' },
    { id: 'instruction', label: isEn ? 'Instructions' : 'शिक्षण निर्देश' },
    { id: 'praise', label: isEn ? 'Praise & Encouragement' : 'प्रशंसा' },
    { id: 'routine', label: isEn ? 'Daily Routine' : 'दिनचर्या' },
    { id: 'questions', label: isEn ? 'Questions' : 'संवाद व प्रश्न' },
    { id: 'greetings', label: isEn ? 'Greetings' : 'अभिवादन' },
    { id: 'numbers', label: isEn ? 'Numbers & Math' : 'संख्याएँ व गणित' },
    { id: 'nature', label: isEn ? 'Nature' : 'प्रकृति' },
    { id: 'animals', label: isEn ? 'Animals' : 'पशु-पक्षी' },
    { id: 'family', label: isEn ? 'Family' : 'परिवार' },
    { id: 'custom', label: isEn ? 'Custom Cards' : 'कस्टम कार्ड्स' },
  ];

  // Helper to extract tribal word data cleanly for selected language
  const getCardTribalData = (card) => {
    if (!card) return { native: '', phonetic: '', audio: '' };
    const langObj = card[selectedLang] || card.santhali || {};
    const native =
      selectedLang === 'santhali'
        ? langObj.nativeOlChiki || langObj.native || card.hindi
        : langObj.native || card.hindi;
    const phonetic = langObj.phoneticDeva || langObj.nativeDeva || langObj.phoneticLatin || '';
    const audio = langObj.audioText || langObj.audio || phonetic || native;
    return { native, phonetic, audio };
  };

  // Filtered Cards according to Tab, Category & Search
  const filteredCards = useMemo(() => {
    return allCards.filter((card) => {
      // Tab filter: all vs words vs sentences vs custom
      if (deckTab === 'words' && card.type !== 'word') return false;
      if (deckTab === 'sentences' && card.type !== 'sentence') return false;
      if (deckTab === 'custom' && !card.isCustom) return false;

      // Category filter
      if (selectedCategory !== 'all') {
        if (selectedCategory === 'custom' && !card.isCustom) return false;
        if (selectedCategory !== 'custom' && card.category !== selectedCategory) return false;
      }

      // Search Query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const data = getCardTribalData(card);
        const h = (card.hindi || '').toLowerCase();
        const e = (card.english || '').toLowerCase();
        const n = (data.native || '').toLowerCase();
        const p = (data.phonetic || '').toLowerCase();
        return h.includes(q) || e.includes(q) || n.includes(q) || p.includes(q);
      }

      return true;
    });
  }, [allCards, deckTab, selectedCategory, searchQuery, selectedLang]);

  // Flip Toggle
  const toggleFlip = (id) => {
    setFlippedCards((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Audio Playback
  const handlePlayAudio = (e, text, label) => {
    if (e) e.stopPropagation();
    toast.info(isEn ? `Pronunciation: "${label}"` : `उच्चारण: "${label}"`);
    voiceService.speakText(text, 'hi-IN');
  };

  // Pronunciation Practice via Microphone
  const handlePracticePronunciation = async (e, card) => {
    if (e) e.stopPropagation();
    if (practicingCardId === card.id) {
      voiceService.stopListening();
      setPracticingCardId(null);
      return;
    }

    const tribalData = getCardTribalData(card);
    voiceService.stopSpeaking();
    setPracticingCardId(card.id);
    toast.info(
      isEn
        ? `Listening... Please speak "${tribalData.phonetic || tribalData.native}"`
        : `माइक चालू है... कृपया बोलें: "${tribalData.phonetic || tribalData.native}"`
    );

    try {
      await voiceService.startListening({
        lang: 'hi-IN',
        onResult: (spokenText) => {
          setPracticingCardId(null);
          const cleanSpoken = (spokenText || '').toLowerCase().trim();
          const cleanTarget = (tribalData.phonetic || tribalData.native || card.hindi).toLowerCase().trim();

          // Calculate similarity score
          let isMatch = false;
          let score = 75;

          if (cleanSpoken === cleanTarget || cleanTarget.includes(cleanSpoken) || cleanSpoken.includes(cleanTarget)) {
            isMatch = true;
            score = 100;
          } else {
            const spokenWords = cleanSpoken.split(/\s+/).filter(Boolean);
            const targetWords = cleanTarget.split(/\s+/).filter(Boolean);
            let matchCount = 0;
            for (const w of spokenWords) {
              if (targetWords.some((tw) => tw.includes(w) || w.includes(tw))) matchCount++;
            }
            if (matchCount > 0) {
              score = Math.round((matchCount / Math.max(targetWords.length, 1)) * 100);
              isMatch = score >= 50;
            }
          }

          if (isMatch) {
            voiceService.playChime('success');
            confetti({ particleCount: 60, spread: 60, origin: { y: 0.7 } });
            toast.success(
              isEn
                ? `Excellent Pronunciation! (${score}% Match) You said: "${spokenText}"`
                : `शानदार उच्चारण! (${score}% शुद्धता) आपने बोला: "${spokenText}"`
            );
            setPracticeFeedback((prev) => ({
              ...prev,
              [card.id]: { score, isSuccess: true, spoken: spokenText },
            }));
          } else {
            voiceService.playChime('error');
            toast.warning(
              isEn
                ? `Good attempt! (${score}% Match) Try again: "${tribalData.phonetic || tribalData.native}"`
                : `अच्छा प्रयास! (${score}% मेल) पुनः बोलें: "${tribalData.phonetic || tribalData.native}"`
            );
            setPracticeFeedback((prev) => ({
              ...prev,
              [card.id]: { score, isSuccess: false, spoken: spokenText },
            }));
          }
        },
        onError: (err) => {
          setPracticingCardId(null);
          toast.error(isEn ? `Mic Error: ${err.message || 'Check mic permission'}` : 'माइक त्रुटि! अनुमति जांचें।');
        },
      });
    } catch (err) {
      setPracticingCardId(null);
      toast.error(isEn ? `Could not start mic: ${err.message}` : 'माइक प्रारंभ नहीं हो सका।');
    }
  };

  // Voice Dictation in "Add Custom Flashcard" Modal
  const handleDictateModal = async () => {
    if (isDictatingModal) {
      voiceService.stopListening();
      setIsDictatingModal(false);
      return;
    }
    voiceService.stopSpeaking();
    setIsDictatingModal(true);
    toast.info(isEn ? 'Listening... Speak your sentence or word' : 'सुन रहे हैं... अपना वाक्य या शब्द बोलें');

    try {
      await voiceService.startListening({
        lang: 'hi-IN',
        onResult: (text) => {
          setIsDictatingModal(false);
          setCustomHindiInput(text);
          triggerAutoTranslate(text);
        },
        onError: (err) => {
          setIsDictatingModal(false);
          toast.error(isEn ? `Dictation Error: ${err.message}` : 'डिक्टेशन त्रुटि');
        },
      });
    } catch (e) {
      setIsDictatingModal(false);
      toast.error('Could not activate mic');
    }
  };

  // Trigger Offline NLP Translation for custom card creation
  const triggerAutoTranslate = (hindiText) => {
    if (!hindiText || !hindiText.trim()) return;
    setIsAutoTranslating(true);

    try {
      const hoRes = translateHindiToTribal(hindiText, 'ho');
      const santhaliRes = translateHindiToTribal(hindiText, 'santhali');
      const mundariRes = translateHindiToTribal(hindiText, 'mundari');
      const sadriRes = translateHindiToTribal(hindiText, 'sadri');

      setCustomTranslations({
        ho: {
          native: hoRes.nativeScript,
          phoneticDeva: hoRes.phoneticDeva,
          phoneticLatin: hoRes.phoneticLatin,
          audioText: hoRes.audioText,
        },
        santhali: {
          nativeOlChiki: santhaliRes.nativeScript,
          nativeDeva: santhaliRes.phoneticDeva,
          phoneticDeva: santhaliRes.phoneticDeva,
          phoneticLatin: santhaliRes.phoneticLatin,
          audioText: santhaliRes.audioText,
        },
        mundari: {
          native: mundariRes.nativeScript,
          phoneticDeva: mundariRes.phoneticDeva,
          phoneticLatin: mundariRes.phoneticLatin,
          audioText: mundariRes.audioText,
        },
        sadri: {
          native: sadriRes.nativeScript,
          phoneticDeva: sadriRes.phoneticDeva,
          phoneticLatin: sadriRes.phoneticLatin,
          audioText: sadriRes.audioText,
        },
      });
      toast.success(isEn ? 'Offline translation generated!' : 'ऑफ़लाइन अनुवाद तैयार है!');
    } catch (err) {
      console.error('Translation error:', err);
      toast.error('Translation failed');
    } finally {
      setIsAutoTranslating(false);
    }
  };

  // Save new custom card
  const handleSaveCustomCard = () => {
    if (!customHindiInput.trim()) {
      toast.error(isEn ? 'Please enter a Hindi sentence or word!' : 'कृपया हिंदी वाक्य या शब्द दर्ज करें!');
      return;
    }

    const translations =
      customTranslations || {
        ho: translateHindiToTribal(customHindiInput, 'ho'),
        santhali: translateHindiToTribal(customHindiInput, 'santhali'),
        mundari: translateHindiToTribal(customHindiInput, 'mundari'),
        sadri: translateHindiToTribal(customHindiInput, 'sadri'),
      };

    const newCard = {
      id: `custom_${Date.now()}`,
      isCustom: true,
      type: customHindiInput.trim().split(/\s+/).length > 2 ? 'sentence' : 'word',
      hindi: customHindiInput.trim(),
      english: customEnglishInput.trim() || 'Custom Classroom Instruction',
      category: customCategory || 'custom',
      ho: translations.ho,
      santhali: translations.santhali,
      mundari: translations.mundari,
      sadri: translations.sadri,
    };

    saveCustomCards([newCard, ...customCards]);
    confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
    toast.success(isEn ? 'Custom Flashcard added to your offline deck!' : 'नया फ्लैशकार्ड आपके डेक में जोड़ा गया!');

    // Reset and close
    setCustomHindiInput('');
    setCustomEnglishInput('');
    setCustomTranslations(null);
    setIsAddModalOpen(false);
  };

  // Delete custom card
  const handleDeleteCustomCard = (e, cardId) => {
    e.stopPropagation();
    const updated = customCards.filter((c) => c.id !== cardId);
    saveCustomCards(updated);
    toast.info(isEn ? 'Custom card deleted' : 'कस्टम कार्ड हटा दिया गया');
  };

  // QUIZ LOGIC OVERHAUL
  // Quiz card pool: respects words vs sentences vs all
  const quizPool = useMemo(() => {
    if (quizType === 'words') return wordCards;
    if (quizType === 'sentences') return sentenceCards;
    return filteredCards.length >= 4 ? filteredCards : allCards;
  }, [quizType, wordCards, sentenceCards, filteredCards, allCards]);

  const safeQuizIndex = currentQuizIndex < quizPool.length ? currentQuizIndex : 0;
  const currentQuizCard = quizPool[safeQuizIndex] || quizPool[0];

  const getCardSeed = (cardId, index) => {
    let hash = (index + 1) * 31337;
    for (let i = 0; i < (cardId || '').length; i++) {
      hash = (hash * 31 + cardId.charCodeAt(i)) & 0x7fffffff;
    }
    return hash;
  };

  const seededShuffle = (arr, seed) => {
    const copy = [...arr];
    let s = seed;
    const nextRand = () => {
      s = (s * 9301 + 49297) % 233280;
      return s / 233280;
    };
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(nextRand() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };

  const quizOptions = useMemo(() => {
    if (!currentQuizCard) return [];
    const correct = getCardTribalData(currentQuizCard);
    const seed = getCardSeed(currentQuizCard.id, safeQuizIndex);

    // Filter distractors from quiz pool
    const otherCards = quizPool.filter((c) => c.id !== currentQuizCard.id);
    const shuffledOthers = seededShuffle(otherCards, seed)
      .filter((c) => {
        const d = getCardTribalData(c);
        return d.native && d.native !== correct.native;
      })
      .slice(0, 3);

    const rawOptions = [
      {
        id: currentQuizCard.id,
        text: correct.native,
        phonetic: correct.phonetic,
        audio: correct.audio,
        isCorrect: true,
      },
      ...shuffledOthers.map((c) => {
        const d = getCardTribalData(c);
        return {
          id: c.id,
          text: d.native,
          phonetic: d.phonetic,
          audio: d.audio,
          isCorrect: false,
        };
      }),
    ];

    return seededShuffle(rawOptions, seed + 999);
  }, [currentQuizCard?.id, selectedLang, safeQuizIndex, quizPool]);

  const handleSelectQuizOption = (option) => {
    if (selectedOption) return;
    setSelectedOption(option);

    if (option.audio) {
      voiceService.speakText(option.audio, 'hi-IN');
    }

    if (option.isCorrect) {
      setQuizScore((prev) => prev + 1);
      voiceService.playChime('success');
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      toast.success(isEn ? `Excellent! "${option.text}" is correct!` : `शाबाश! सही उत्तर: "${option.text}"`);
    } else {
      voiceService.playChime('error');
      const correctOpt = quizOptions.find((o) => o.isCorrect);
      toast.error(
        isEn
          ? `Incorrect! Correct answer is "${correctOpt?.text}"`
          : `गलत उत्तर! सही उत्तर "${correctOpt?.text}" है।`
      );
    }
  };

  const handleNextQuiz = () => {
    setSelectedOption(null);
    if (currentQuizIndex + 1 >= quizPool.length) {
      setIsQuizFinished(true);
    } else {
      setCurrentQuizIndex((prev) => prev + 1);
    }
  };

  const handleResetQuiz = () => {
    setSelectedOption(null);
    setCurrentQuizIndex(0);
    setQuizScore(0);
    setIsQuizFinished(false);
    toast.info(isEn ? 'Quiz restarted!' : 'प्रश्नोत्तरी पुनः प्रारंभ की गई!');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* 1. TOP HEADER & PRIMARY ACTION CONTROLS */}
      <div
        className="card-brutal"
        style={{
          padding: '18px 24px',
          backgroundColor: 'var(--color-surface)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              backgroundColor: 'rgba(217, 90, 39, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Sparkles size={24} color="var(--color-palash)" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.4rem', margin: 0, color: 'var(--color-slate)', fontWeight: 800 }}>
              {t.fcTitle} ({langMeta.name})
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--color-slate-muted)', margin: '2px 0 0 0' }}>
              {isEn
                ? 'Comprehensive Multi-Lingual Classroom Sentences & Vocabulary Flashcards'
                : 'कक्षा के पूर्ण वाक्य, शब्दावली एवं ऑडियो उच्चारण सहित संवादात्मक फ्लैशकार्ड्स'}
            </p>
          </div>
        </div>

        {/* Right Actions: Add Card & Mode Switcher */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="btn-brutal btn-palash"
            style={{
              padding: '9px 16px',
              fontSize: '0.88rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Plus size={16} />
            <span>{isEn ? 'Add Custom Card' : 'नया कार्ड जोड़ें'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setIsQuizMode(false);
              setSelectedOption(null);
              setIsQuizFinished(false);
            }}
            className={`btn-brutal ${!isQuizMode ? 'btn-primary' : ''}`}
            style={{
              padding: '9px 16px',
              fontSize: '0.88rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Layers size={16} />
            <span>{t.fcModeCards}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setIsQuizMode(true);
              setSelectedOption(null);
              setCurrentQuizIndex(0);
              setQuizScore(0);
              setIsQuizFinished(false);
            }}
            className={`btn-brutal ${isQuizMode ? 'btn-ochre' : ''}`}
            style={{
              padding: '9px 16px',
              fontSize: '0.88rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Award size={16} />
            <span>{t.fcModeQuiz}</span>
          </button>
        </div>
      </div>

      {/* 2. SUB-BAR: TABS (Sentences vs Words vs All vs Custom) & SEARCH BAR */}
      {!isQuizMode && (
        <div
          className="card-brutal"
          style={{
            padding: '12px 18px',
            backgroundColor: 'var(--color-surface-card)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          {/* Deck Scope Tabs */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => setDeckTab('all')}
              className="btn-brutal"
              style={{
                padding: '7px 14px',
                fontSize: '0.84rem',
                backgroundColor: deckTab === 'all' ? 'var(--color-forest)' : 'var(--color-bg)',
                color: deckTab === 'all' ? '#FFFFFF' : 'var(--color-slate)',
                fontWeight: deckTab === 'all' ? 700 : 500,
              }}
            >
              {isEn ? `All (${allCards.length})` : `सभी (${allCards.length})`}
            </button>

            <button
              type="button"
              onClick={() => setDeckTab('sentences')}
              className="btn-brutal"
              style={{
                padding: '7px 14px',
                fontSize: '0.84rem',
                backgroundColor: deckTab === 'sentences' ? 'var(--color-forest)' : 'var(--color-bg)',
                color: deckTab === 'sentences' ? '#FFFFFF' : 'var(--color-slate)',
                fontWeight: deckTab === 'sentences' ? 700 : 500,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <MessageSquare size={14} />
              <span>{isEn ? `Classroom Sentences (${sentenceCards.length})` : `कक्षा वाक्य (${sentenceCards.length})`}</span>
            </button>

            <button
              type="button"
              onClick={() => setDeckTab('words')}
              className="btn-brutal"
              style={{
                padding: '7px 14px',
                fontSize: '0.84rem',
                backgroundColor: deckTab === 'words' ? 'var(--color-forest)' : 'var(--color-bg)',
                color: deckTab === 'words' ? '#FFFFFF' : 'var(--color-slate)',
                fontWeight: deckTab === 'words' ? 700 : 500,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <BookOpen size={14} />
              <span>{isEn ? `Vocabulary Words (${wordCards.length})` : `शब्दावली (${wordCards.length})`}</span>
            </button>

            {customCards.length > 0 && (
              <button
                type="button"
                onClick={() => setDeckTab('custom')}
                className="btn-brutal"
                style={{
                  padding: '7px 14px',
                  fontSize: '0.84rem',
                  backgroundColor: deckTab === 'custom' ? 'var(--color-palash)' : 'var(--color-bg)',
                  color: deckTab === 'custom' ? '#FFFFFF' : 'var(--color-slate)',
                  fontWeight: deckTab === 'custom' ? 700 : 500,
                }}
              >
                ✏️ {isEn ? `My Custom Cards (${customCards.length})` : `मेरे कार्ड्स (${customCards.length})`}
              </button>
            )}
          </div>

          {/* Search Box */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: 'var(--color-bg)',
              padding: '6px 12px',
              borderRadius: 'var(--radius-md)',
              border: '1.5px solid var(--color-border)',
              minWidth: '240px',
              flex: '1 1 240px',
              maxWidth: '360px',
            }}
          >
            <Search size={16} color="var(--color-slate-muted)" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isEn ? 'Search words, sentences, script...' : 'खोजें: शब्द, वाक्य या लिपि...'}
              style={{
                border: 'none',
                background: 'transparent',
                outline: 'none',
                width: '100%',
                fontSize: '0.85rem',
                color: 'var(--color-slate)',
              }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                <X size={14} color="var(--color-slate-muted)" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* 3. CATEGORY PILLS FILTER */}
      {!isQuizMode && (
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className="btn-brutal"
              style={{
                padding: '6px 14px',
                fontSize: '0.80rem',
                backgroundColor: selectedCategory === cat.id ? 'var(--color-forest)' : 'var(--color-surface-card)',
                color: selectedCategory === cat.id ? '#FFFFFF' : 'var(--color-slate)',
                border: '1.5px solid var(--color-border)',
                whiteSpace: 'nowrap',
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>
      )}

      {/* 4. MODAL: ADD CUSTOM FLASHCARD */}
      {isAddModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
        >
          <div
            className="card-brutal"
            style={{
              maxWidth: '560px',
              width: '100%',
              backgroundColor: 'var(--color-surface)',
              padding: '28px',
              display: 'flex',
              flexDirection: 'column',
              gap: '18px',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Plus size={20} color="var(--color-palash)" />
                <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--color-slate)', fontWeight: 800 }}>
                  {isEn ? 'Add Custom Flashcard' : 'नया जनजातीय फ्लैशकार्ड बनाएं'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} color="var(--color-slate-muted)" />
              </button>
            </div>

            <p style={{ fontSize: '0.84rem', color: 'var(--color-slate-muted)', margin: 0 }}>
              {isEn
                ? 'Type or speak any Hindi sentence or word. The offline NLP engine will instantly generate authentic tribal translations for classroom pedagogy.'
                : 'कोई भी हिंदी वाक्य या शब्द लिखें अथवा बोलें। ऑन-डिवाइस NLP इंजन स्वतः प्रामाणिक संताली, हो, मुण्डारी व सादरी रूपांतरण तैयार करेगा।'}
            </p>

            {/* Input Field with Mic */}
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px', color: 'var(--color-slate)' }}>
                {isEn ? 'Hindi Sentence or Word:' : 'हिंदी वाक्य या शब्द:'}
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  value={customHindiInput}
                  onChange={(e) => setCustomHindiInput(e.target.value)}
                  placeholder={isEn ? 'e.g. कक्षा में ध्यान से सुनो, पानी पियो...' : 'जैसे: कक्षा में ध्यान से सुनो, पानी पियो...'}
                  style={{
                    flex: 1,
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    border: '1.5px solid var(--color-border)',
                    backgroundColor: 'var(--color-bg)',
                    fontSize: '0.92rem',
                    color: 'var(--color-slate)',
                  }}
                />
                <button
                  type="button"
                  onClick={handleDictateModal}
                  className={`btn-brutal ${isDictatingModal ? 'btn-danger' : 'btn-palash'}`}
                  style={{ padding: '10px 14px' }}
                  title="बोलकर लिखें"
                >
                  {isDictatingModal ? <MicOff size={18} /> : <Mic size={18} />}
                </button>
              </div>
            </div>

            {/* English Meaning Optional */}
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px', color: 'var(--color-slate)' }}>
                {isEn ? 'English Meaning (Optional):' : 'अंग्रेजी अर्थ (वैकल्पिक):'}
              </label>
              <input
                type="text"
                value={customEnglishInput}
                onChange={(e) => setCustomEnglishInput(e.target.value)}
                placeholder="e.g. Listen attentively in class"
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: '1.5px solid var(--color-border)',
                  backgroundColor: 'var(--color-bg)',
                  fontSize: '0.92rem',
                  color: 'var(--color-slate)',
                }}
              />
            </div>

            {/* Auto-Translate Button */}
            <button
              type="button"
              onClick={() => triggerAutoTranslate(customHindiInput)}
              disabled={isAutoTranslating || !customHindiInput.trim()}
              className="btn-brutal btn-ochre"
              style={{ padding: '10px 16px', fontSize: '0.88rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              <Sparkles size={16} />
              <span>{isAutoTranslating ? (isEn ? 'Translating...' : 'अनुवाद कर रहे हैं...') : (isEn ? 'Generate Offline Translation' : 'स्वचालित अनुवाद करें')}</span>
            </button>

            {/* Live Translation Preview */}
            {customTranslations && (
              <div
                style={{
                  padding: '14px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-forest-subtle)',
                  border: '1.5px solid var(--color-forest)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-forest)' }}>
                  ✓ {isEn ? `Generated ${langMeta.name} Translation:` : `तैयार ${langMeta.name} रूपांतरण:`}
                </div>
                <div
                  className={selectedLang === 'santhali' ? 'font-olchiki' : 'font-deva'}
                  style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--color-slate)' }}
                >
                  {selectedLang === 'santhali'
                    ? customTranslations.santhali?.nativeOlChiki
                    : customTranslations[selectedLang]?.native}
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--color-forest-light)', fontWeight: 600 }}>
                  ({customTranslations[selectedLang]?.phoneticDeva || customTranslations[selectedLang]?.native})
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="btn-brutal"
                style={{ padding: '9px 18px', backgroundColor: 'var(--color-bg)' }}
              >
                {isEn ? 'Cancel' : 'रद्द करें'}
              </button>
              <button
                type="button"
                onClick={handleSaveCustomCard}
                className="btn-brutal btn-primary"
                style={{ padding: '9px 20px', backgroundColor: 'var(--color-forest)', color: '#FFFFFF' }}
              >
                {isEn ? 'Save to My Deck' : 'फ्लैशकार्ड सहेजें'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. VIEW 1: FLASHCARDS GRID */}
      {!isQuizMode && (
        <>
          {filteredCards.length === 0 ? (
            <div
              className="card-brutal"
              style={{
                padding: '48px 24px',
                textAlign: 'center',
                backgroundColor: 'var(--color-surface-card)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <HelpCircle size={40} color="var(--color-slate-muted)" />
              <h3 style={{ margin: 0, color: 'var(--color-slate)' }}>
                {isEn ? 'No Flashcards Matched' : 'कोई फ्लैशकार्ड नहीं मिला'}
              </h3>
              <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--color-slate-muted)' }}>
                {isEn
                  ? 'Try changing your search query or category filter.'
                  : 'कृपया अपना खोज शब्द बदलें या श्रेणी फ़िल्टर रीसेट करें।'}
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setDeckTab('all');
                }}
                className="btn-brutal"
                style={{ marginTop: '8px', padding: '8px 16px' }}
              >
                {isEn ? 'Clear Filters' : 'फ़िल्टर हटाएं'}
              </button>
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))',
                gap: '20px',
              }}
            >
              {filteredCards.map((card) => {
                const tribalData = getCardTribalData(card);
                const isFlipped = !!flippedCards[card.id];
                const feedback = practiceFeedback[card.id];
                const isPracticing = practicingCardId === card.id;

                return (
                  <div
                    key={card.id}
                    className={`flip-card-container ${isFlipped ? 'is-flipped' : ''}`}
                    style={{ minHeight: '310px', cursor: 'pointer' }}
                    onClick={() => toggleFlip(card.id)}
                  >
                    <div className="flip-card-inner">
                      {/* FRONT: Hindi Text & Metadata */}
                      <div
                        className="flip-card-front"
                        style={{
                          backgroundColor: 'var(--color-surface-card)',
                          border: 'var(--border-thick)',
                          padding: '18px',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                            <span
                              className={`badge-tag ${
                                card.type === 'sentence' ? 'badge-forest' : card.isCustom ? 'badge-palash' : 'badge-ochre'
                              }`}
                              style={{ fontSize: '0.70rem' }}
                            >
                              {card.isCustom
                                ? isEn
                                  ? 'Custom'
                                  : 'कस्टम'
                                : card.type === 'sentence'
                                ? isEn
                                  ? 'Sentence'
                                  : 'वाक्य'
                                : isEn
                                ? 'Word'
                                : 'शब्द'}
                            </span>
                            <span style={{ fontSize: '0.72rem', color: 'var(--color-slate-muted)' }}>
                              {card.categoryNameHindi || card.category}
                            </span>
                          </div>

                          {card.isCustom && (
                            <button
                              type="button"
                              onClick={(e) => handleDeleteCustomCard(e, card.id)}
                              style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '4px',
                                color: '#EF4444',
                              }}
                              title="Delete Card"
                            >
                              <Trash2 size={15} />
                            </button>
                          )}
                        </div>

                        <div style={{ margin: 'auto 0', textAlign: 'center', padding: '10px 0' }}>
                          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
                            <div
                              style={{
                                width: '42px',
                                height: '42px',
                                borderRadius: '10px',
                                backgroundColor: 'var(--color-bg)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              {card.type === 'sentence' ? (
                                <MessageSquare size={20} color="var(--color-forest)" />
                              ) : card.category === 'nature' ? (
                                <Leaf size={20} color="var(--color-forest)" />
                              ) : card.category === 'numbers' ? (
                                <Hash size={20} color="var(--color-palash)" />
                              ) : (
                                <Sparkles size={20} color="#D97706" />
                              )}
                            </div>
                          </div>

                          <h3
                            style={{
                              fontSize: card.hindi.length > 25 ? '1.15rem' : '1.38rem',
                              margin: '4px 0',
                              color: 'var(--color-slate)',
                              lineHeight: 1.3,
                              fontWeight: 800,
                            }}
                          >
                            {card.hindi}
                          </h3>
                          <div style={{ fontSize: '0.82rem', color: 'var(--color-slate-muted)', marginTop: '4px' }}>
                            {card.english}
                          </div>
                        </div>

                        {/* Pronunciation Practice Result Badge on Front if present */}
                        {feedback && (
                          <div
                            style={{
                              fontSize: '0.74rem',
                              padding: '4px 8px',
                              borderRadius: 'var(--radius-xs)',
                              backgroundColor: feedback.isSuccess ? 'rgba(16, 185, 129, 0.12)' : 'rgba(217, 119, 6, 0.12)',
                              color: feedback.isSuccess ? '#10B981' : '#D97706',
                              fontWeight: 700,
                              textAlign: 'center',
                            }}
                          >
                            {feedback.isSuccess ? `✓ ${feedback.score}% उच्चारण शुद्धता` : `↻ ${feedback.score}% मेल (पुनः बोलें)`}
                          </div>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.74rem', color: 'var(--color-palash)', fontWeight: 600 }}>
                          <span>{isEn ? `Tap: View ${langMeta.name}` : `क्लिक करें: ${langMeta.name}`}</span>
                          <RotateCw size={12} />
                        </div>
                      </div>

                      {/* BACK: Tribal Script & Audio Playback & Voice Practice */}
                      <div
                        className="flip-card-back"
                        style={{
                          backgroundColor: 'var(--color-forest-subtle)',
                          border: 'var(--border-thick)',
                          borderColor: 'var(--color-forest)',
                          padding: '18px',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span className="badge-tag badge-forest">{langMeta.name}</span>
                          <span style={{ fontSize: '0.72rem', color: 'var(--color-slate-muted)' }}>
                            {isEn ? 'Flip Back' : 'वापस पलटें'}
                          </span>
                        </div>

                        <div style={{ margin: 'auto 0', textAlign: 'center', padding: '6px 0' }}>
                          <div
                            className={selectedLang === 'santhali' ? 'font-olchiki' : 'font-deva'}
                            style={{
                              fontSize: tribalData.native.length > 25 ? '1.3rem' : '1.75rem',
                              fontWeight: 800,
                              color: 'var(--color-slate)',
                              lineHeight: 1.25,
                              wordBreak: 'break-word',
                            }}
                          >
                            {tribalData.native}
                          </div>

                          <div
                            style={{
                              marginTop: '8px',
                              fontSize: '0.94rem',
                              fontWeight: 700,
                              color: 'var(--color-forest-light)',
                            }}
                          >
                            {tribalData.phonetic}
                          </div>

                          {card[selectedLang]?.phoneticLatin && (
                            <div style={{ fontSize: '0.76rem', color: 'var(--color-slate-muted)', fontStyle: 'italic', marginTop: '2px' }}>
                              Roman: {card[selectedLang]?.phoneticLatin}
                            </div>
                          )}
                        </div>

                        {/* Interactive Practice Controls */}
                        <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                          <button
                            type="button"
                            onClick={(e) => handlePlayAudio(e, tribalData.audio, tribalData.native)}
                            className="btn-brutal btn-palash"
                            style={{
                              flex: 1,
                              padding: '8px 10px',
                              fontSize: '0.80rem',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '6px',
                            }}
                            title="उच्चारण सुनें"
                          >
                            <Volume2 size={15} />
                            <span>{isEn ? 'Listen' : 'उच्चारण'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={(e) => handlePracticePronunciation(e, card)}
                            className={`btn-brutal ${isPracticing ? 'btn-danger' : 'btn-ochre'}`}
                            style={{
                              flex: 1,
                              padding: '8px 10px',
                              fontSize: '0.80rem',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '6px',
                            }}
                            title="बोलकर अभ्यास करें"
                          >
                            {isPracticing ? <MicOff size={15} /> : <Mic size={15} />}
                            <span>{isPracticing ? (isEn ? 'Listening...' : 'सुन रहे हैं...') : (isEn ? 'Practice' : 'बोलें')}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* 6. VIEW 2: INTERACTIVE CLASSROOM QUIZ MODE */}
      {isQuizMode && isQuizFinished && (
        <div
          className="card-brutal"
          style={{
            maxWidth: '680px',
            margin: '0 auto',
            width: '100%',
            padding: '40px 32px',
            backgroundColor: 'var(--color-surface-card)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: '20px',
          }}
        >
          <div
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              backgroundColor: 'rgba(217, 119, 6, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Award size={40} color="#D97706" />
          </div>

          <div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '0 0 8px 0', color: 'var(--color-slate)' }}>
              {isEn ? 'Quiz Completed!' : 'प्रश्नोत्तरी पूर्ण हुई!'}
            </h2>
            <p style={{ fontSize: '0.92rem', color: 'var(--color-slate-muted)', margin: 0 }}>
              {isEn
                ? `You finished all ${quizPool.length} ${langMeta.name} questions.`
                : `आपने ${langMeta.name} भाषा के सभी ${quizPool.length} प्रश्न हल कर लिए हैं।`}
            </p>
          </div>

          <div
            style={{
              padding: '20px 36px',
              borderRadius: 'var(--radius-xl)',
              backgroundColor: 'rgba(16, 185, 129, 0.08)',
              border: '2px solid rgba(16, 185, 129, 0.3)',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              alignItems: 'center',
            }}
          >
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#10B981', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {isEn ? 'Your Final Score' : 'आपका अंतिम स्कोर'}
            </div>
            <div style={{ fontSize: '2.8rem', fontWeight: 900, color: 'var(--color-slate)', lineHeight: 1 }}>
              {quizScore} <span style={{ fontSize: '1.5rem', color: 'var(--color-slate-muted)', fontWeight: 600 }}>/ {quizPool.length}</span>
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--color-slate-muted)' }}>
              {Math.round((quizScore / quizPool.length) * 100)}% {isEn ? 'accuracy' : 'सटीकता'}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '14px', marginTop: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button
              type="button"
              onClick={handleResetQuiz}
              className="btn-brutal btn-primary"
              style={{
                padding: '12px 24px',
                fontSize: '0.95rem',
                backgroundColor: 'var(--color-forest)',
                color: '#FFFFFF',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <RotateCcw size={16} />
              <span>{isEn ? 'Play Again' : 'पुनः खेलें'}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setIsQuizMode(false);
                setIsQuizFinished(false);
              }}
              className="btn-brutal"
              style={{
                padding: '12px 24px',
                fontSize: '0.95rem',
                backgroundColor: 'var(--color-surface)',
                color: 'var(--color-slate)',
                border: '1.5px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
              }}
            >
              <span>{isEn ? 'Browse Flashcards' : 'फ्लैशकार्ड देखें'}</span>
            </button>
          </div>
        </div>
      )}

      {/* ACTIVE QUIZ QUESTION */}
      {isQuizMode && !isQuizFinished && currentQuizCard && (
        <div
          className="card-brutal"
          style={{
            maxWidth: '680px',
            margin: '0 auto',
            width: '100%',
            padding: '32px',
            backgroundColor: 'var(--color-surface-card)',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
          }}
        >
          {/* Quiz Header with Progress, Target Selector & Score */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="badge-tag badge-forest">
                {currentQuizCard.type === 'sentence' ? (isEn ? 'Sentence Quiz' : 'वाक्य प्रश्नोत्तरी') : (isEn ? 'Vocabulary Quiz' : 'शब्दावली प्रश्नोत्तरी')}
              </span>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-slate-muted)', padding: '3px 8px', borderRadius: 'var(--radius-xs)', backgroundColor: 'var(--color-surface-tint)' }}>
                {isEn ? `Q ${safeQuizIndex + 1} of ${quizPool.length}` : `प्रश्न ${safeQuizIndex + 1} / ${quizPool.length}`}
              </span>
            </div>

            {/* Selector: Test Sentences vs Words */}
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                type="button"
                onClick={() => {
                  setQuizType('all');
                  setCurrentQuizIndex(0);
                  setQuizScore(0);
                  setSelectedOption(null);
                }}
                className="btn-brutal"
                style={{
                  padding: '4px 10px',
                  fontSize: '0.75rem',
                  backgroundColor: quizType === 'all' ? 'var(--color-forest)' : 'var(--color-bg)',
                  color: quizType === 'all' ? '#FFFFFF' : 'var(--color-slate)',
                }}
              >
                {isEn ? 'All' : 'सभी'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setQuizType('sentences');
                  setCurrentQuizIndex(0);
                  setQuizScore(0);
                  setSelectedOption(null);
                }}
                className="btn-brutal"
                style={{
                  padding: '4px 10px',
                  fontSize: '0.75rem',
                  backgroundColor: quizType === 'sentences' ? 'var(--color-forest)' : 'var(--color-bg)',
                  color: quizType === 'sentences' ? '#FFFFFF' : 'var(--color-slate)',
                }}
              >
                {isEn ? 'Sentences' : 'वाक्य'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setQuizType('words');
                  setCurrentQuizIndex(0);
                  setQuizScore(0);
                  setSelectedOption(null);
                }}
                className="btn-brutal"
                style={{
                  padding: '4px 10px',
                  fontSize: '0.75rem',
                  backgroundColor: quizType === 'words' ? 'var(--color-forest)' : 'var(--color-bg)',
                  color: quizType === 'words' ? '#FFFFFF' : 'var(--color-slate)',
                }}
              >
                {isEn ? 'Words' : 'शब्द'}
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ fontWeight: 800, color: 'var(--color-forest)', fontSize: '0.95rem' }}>
                {t.fcQuizScore} {quizScore}
              </div>
              <button
                type="button"
                onClick={handleResetQuiz}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-slate-muted)',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                }}
                title={isEn ? 'Restart Quiz' : 'प्रश्नोत्तरी पुनः शुरू करें'}
              >
                <RotateCcw size={16} />
              </button>
            </div>
          </div>

          {/* Question Box */}
          <div
            style={{
              textAlign: 'center',
              padding: '24px',
              backgroundColor: 'var(--color-ochre-subtle)',
              borderRadius: 'var(--radius-lg)',
              border: '2px dashed var(--color-ochre)',
            }}
          >
            <div style={{ fontSize: '0.86rem', color: '#8C5F08', fontWeight: 600 }}>
              {isEn
                ? `What is the correct ${langMeta.name} translation for:`
                : `निम्नलिखित का ${langMeta.name} भाषा में सही रूप क्या है?`}
            </div>
            <div style={{ fontSize: currentQuizCard.hindi.length > 25 ? '1.6rem' : '2.2rem', fontWeight: 800, margin: '10px 0', color: 'var(--color-slate)' }}>
              "{currentQuizCard.hindi}"
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--color-slate-muted)' }}>
              ({currentQuizCard.english})
            </div>
          </div>

          {/* Multiple Choice Options */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            {quizOptions.map((opt, i) => {
              const isSelected = selectedOption && (selectedOption.id === opt.id || selectedOption.text === opt.text);
              const isAnswered = !!selectedOption;

              let bgColor = 'var(--color-surface-card)';
              let borderColor = 'var(--color-border)';
              let textColor = 'var(--color-slate)';
              let opacity = 1;

              if (isAnswered) {
                if (isSelected && opt.isCorrect) {
                  bgColor = 'rgba(16, 185, 129, 0.16)';
                  borderColor = '#10B981';
                  textColor = '#10B981';
                } else if (isSelected && !opt.isCorrect) {
                  bgColor = 'rgba(239, 68, 68, 0.14)';
                  borderColor = '#EF4444';
                  textColor = '#EF4444';
                } else if (!isSelected && opt.isCorrect) {
                  bgColor = 'rgba(16, 185, 129, 0.08)';
                  borderColor = '#10B981';
                  textColor = '#10B981';
                } else {
                  bgColor = 'var(--color-surface-tint)';
                  borderColor = 'transparent';
                  textColor = 'var(--color-slate-muted)';
                  opacity = 0.45;
                }
              }

              return (
                <button
                  key={opt.id || i}
                  onClick={() => handleSelectQuizOption(opt)}
                  disabled={isAnswered}
                  className="btn-brutal"
                  style={{
                    padding: '16px 14px',
                    fontSize: '1.15rem',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                    backgroundColor: bgColor,
                    borderColor: borderColor,
                    color: textColor,
                    opacity: opacity,
                    borderRadius: 'var(--radius-lg)',
                    cursor: isAnswered ? 'default' : 'pointer',
                    transition: 'all 0.18s ease',
                  }}
                >
                  <span
                    className={selectedLang === 'santhali' ? 'font-olchiki' : 'font-deva'}
                    style={{ fontWeight: 800, fontSize: opt.text.length > 25 ? '1.05rem' : '1.25rem', textAlign: 'center' }}
                  >
                    {opt.text}
                  </span>
                  {opt.phonetic && (
                    <span style={{ fontSize: '0.80rem', color: isAnswered && opt.isCorrect ? '#10B981' : isAnswered && isSelected ? '#EF4444' : 'var(--color-slate-muted)', fontWeight: 500, textAlign: 'center' }}>
                      ({opt.phonetic})
                    </span>
                  )}

                  {/* Immediate Badges */}
                  {isAnswered && isSelected && opt.isCorrect && (
                    <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#10B981', marginTop: '2px' }}>
                      ✓ {isEn ? 'Your Choice: Correct (+1)' : 'आपका उत्तर: सही (+1 अंक)'}
                    </span>
                  )}
                  {isAnswered && isSelected && !opt.isCorrect && (
                    <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#EF4444', marginTop: '2px' }}>
                      ✗ {isEn ? 'Your Choice: Incorrect (0)' : 'आपका चयन: गलत उत्तर (0 अंक)'}
                    </span>
                  )}
                  {isAnswered && !isSelected && opt.isCorrect && (
                    <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#10B981', marginTop: '2px' }}>
                      ✓ {isEn ? 'Correct Answer' : 'सही उत्तर यह है'}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Explicit Result Banner below options */}
          {selectedOption && (
            <div
              style={{
                padding: '12px 18px',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: selectedOption.isCorrect ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                border: `1.5px solid ${selectedOption.isCorrect ? '#10B981' : '#EF4444'}`,
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                color: selectedOption.isCorrect ? '#10B981' : '#EF4444',
                fontWeight: 700,
                fontSize: '0.92rem',
              }}
            >
              {selectedOption.isCorrect ? (
                <>
                  <CheckCircle2 size={20} color="#10B981" />
                  <span>
                    {isEn
                      ? `Excellent! "${selectedOption.text}" is correct (+1 point).`
                      : `शाबाश! "${selectedOption.text}" बिल्कुल सही उत्तर है (+1 अंक जोड़ा गया)।`}
                  </span>
                </>
              ) : (
                <>
                  <XCircle size={20} color="#EF4444" />
                  <span>
                    {isEn
                      ? `Incorrect! Your choice was wrong. The true correct answer is highlighted above.`
                      : `गलत उत्तर! आपका चयन सही नहीं था। सही उत्तर ऊपर हरे रंग में दिखाया गया है।`}
                  </span>
                </>
              )}
            </div>
          )}

          {/* Next Button */}
          {selectedOption && (
            <button
              id="btn-quiz-next"
              type="button"
              onClick={handleNextQuiz}
              className="btn-brutal btn-primary"
              style={{
                padding: '12px 24px',
                fontSize: '1rem',
                backgroundColor: 'var(--color-forest)',
                color: '#FFFFFF',
                fontWeight: 700,
                borderRadius: 'var(--radius-md)',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 2px 8px rgba(14, 91, 55, 0.25)',
              }}
            >
              <span>{safeQuizIndex + 1 >= quizPool.length ? (isEn ? 'View Final Results ➔' : 'अंतिम परिणाम देखें ➔') : t.fcNextQuestion}</span>
              <span>➔</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
