import React, { useState } from 'react';
import { NIPUN_LESSONS } from '../data/nipunCurriculum';
import { TRIBAL_LANGUAGES } from '../data/tribalLexicon';
import { voiceService } from '../services/voiceTranslationService';
import { translateHindiToTribal } from '../services/nlpTranslationEngine';
import { offlineStorage } from '../services/offlineStorage';
import { BookOpen, Award, CheckCircle, Volume2, Sparkles, ListChecks } from 'lucide-react';
import { toast } from 'sonner';

export function LessonCurriculum({ selectedLang }) {
  const [selectedLessonId, setSelectedLessonId] = useState(NIPUN_LESSONS[0].id);
  const [studentName, setStudentName] = useState('');
  const [selectedScore, setSelectedScore] = useState(3);
  const [assessmentRecords, setAssessmentRecords] = useState(offlineStorage.getStudentAssessments());
  const [isGeneratingCustom, setIsGeneratingCustom] = useState(false);
  const [customTopic, setCustomTopic] = useState('');
  const [customGeneratedLesson, setCustomGeneratedLesson] = useState(null);

  const langMeta = TRIBAL_LANGUAGES[selectedLang] || TRIBAL_LANGUAGES.santhali;
  const currentLesson = NIPUN_LESSONS.find((l) => l.id === selectedLessonId) || NIPUN_LESSONS[0];

  const handlePlayAudio = (text, label) => {
    toast.info(`ऑडियो उच्चारण: "${label}"`);
    voiceService.speakText(text, 'hi-IN');
  };

  const handleSaveAssessment = (e) => {
    e.preventDefault();
    if (!studentName.trim()) {
      toast.error('कृपया छात्र का नाम दर्ज करें');
      return;
    }

    const record = {
      studentName: studentName.trim(),
      lessonTitle: currentLesson.titleHindi,
      nipunCode: currentLesson.nipunCode,
      language: selectedLang,
      score: selectedScore,
      scoreLabel: selectedScore === 3 ? 'स्तर 3 (निपुण)' : selectedScore === 2 ? 'स्तर 2 (प्रगतिशील)' : 'स्तर 1 (आरंभिक)',
    };

    const updated = offlineStorage.saveStudentAssessment(record);
    setAssessmentRecords(updated);
    setStudentName('');
    toast.success(`छात्र मूल्यांकन सहेजा गया: ${record.studentName} — ${record.scoreLabel}`);
  };

  const handleGenerateCustomLesson = (e) => {
    e.preventDefault();
    if (!customTopic.trim()) return;

    setIsGeneratingCustom(true);
    toast('एआई पाठ योजना निर्मित हो रही है...', { description: 'झारखंड प्राथमिक पाठ्यचर्या अनुसार' });

    setTimeout(() => {
      const trans = translateHindiToTribal(customTopic, selectedLang);
      const newPlan = {
        titleHindi: `पाठ: ${customTopic}`,
        grade: 'कक्षा 1 एवं 2 (FLN)',
        learningOutcome: `छात्र "${customTopic}" से संबंधित अवधारणाओं को अपनी मातृभाषा ${langMeta.name} में समझ सकेंगे।`,
        openingScriptHindi: `बच्चों, आज हम "${customTopic}" के बारे में सीखेंगे। सभी ध्यान से सुनें।`,
        openingScriptTribal: trans.nativeScript,
        phoneticDeva: trans.phoneticDeva,
        phoneticLatin: trans.phoneticLatin,
        activity: `कक्षा गतिविधि: "${customTopic}" के व्यावहारिक उदाहरणों की पहचान।`,
      };
      setCustomGeneratedLesson(newPlan);
      setIsGeneratingCustom(false);
      toast.success('नई जनजातीय पाठ योजना तैयार!');
    }, 450);
  };

  const currentTranslation = currentLesson.translations[selectedLang] || currentLesson.translations.santhali;
  const currentPrompt = currentLesson.activity.prompts[selectedLang] || currentLesson.activity.prompts.santhali;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Lesson Selector Pills */}
      <div
        className="card-brutal"
        style={{
          padding: '16px 20px',
          backgroundColor: 'var(--color-surface)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <BookOpen size={22} color="var(--color-forest)" />
          <h2 style={{ fontSize: '1.3rem', margin: 0 }}>निपुण भारत FLN पाठ योजना (FLN Curriculum Suite)</h2>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {NIPUN_LESSONS.map((lesson) => {
            const isSelected = lesson.id === selectedLessonId;
            return (
              <button
                key={lesson.id}
                onClick={() => {
                  setSelectedLessonId(lesson.id);
                  setCustomGeneratedLesson(null);
                }}
                className={`btn-brutal ${isSelected ? 'btn-primary' : ''}`}
                style={{
                  padding: '8px 14px',
                  fontSize: '0.85rem',
                  backgroundColor: isSelected ? 'var(--color-forest)' : 'var(--color-surface-card)',
                  color: isSelected ? '#FFFFFF' : 'var(--color-slate)',
                }}
              >
                पाठ {lesson.lessonNumber}: {lesson.titleHindi.split(':')[1]?.trim() || lesson.titleHindi}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Lesson View & Rubric */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
        {/* Left: Interactive Lesson Plan */}
        <div className="card-brutal" style={{ padding: '24px', backgroundColor: 'var(--color-surface-card)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
              <div>
                <span className="badge-tag badge-forest" style={{ marginBottom: '6px' }}>
                  {currentLesson.nipunCode} • {currentLesson.grade}
                </span>
                <h1 style={{ fontSize: '1.6rem', margin: '4px 0 6px 0', color: 'var(--color-slate)' }}>
                  {currentLesson.titleHindi}
                </h1>
                <p style={{ fontSize: '0.9rem', color: 'var(--color-slate-muted)', margin: 0 }}>
                  <strong>अधिगम प्रतिफल (Learning Outcome):</strong> {currentLesson.learningOutcome}
                </p>
              </div>
            </div>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid #EBEBEB' }} />

          {/* Phase 1: Teacher Opening Speech */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-palash)', textTransform: 'uppercase' }}>
                चरण 1: शिक्षक द्वारा पाठ का आरंभ (Opening Script)
              </span>
              <button
                onClick={() =>
                  handlePlayAudio(
                    currentTranslation.audioPrompt || currentTranslation.phoneticDeva,
                    currentLesson.titleHindi
                  )
                }
                className="btn-brutal btn-subtle"
                style={{ padding: '4px 10px', fontSize: '0.78rem' }}
              >
                <Volume2 size={14} />
                उच्चारण सुनें
              </button>
            </div>

            <div
              style={{
                backgroundColor: 'var(--color-surface-hover)',
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                fontSize: '0.95rem',
              }}
            >
              <div style={{ color: 'var(--color-slate-muted)', fontSize: '0.8rem', marginBottom: '2px' }}>
                हिंदी निर्देश:
              </div>
              <div style={{ fontWeight: 600 }}>{currentLesson.teacherOpeningHindi}</div>
            </div>

            {/* Tribal Counter-Speech Display */}
            <div
              style={{
                backgroundColor: 'var(--color-forest-subtle)',
                padding: '14px 16px',
                borderRadius: 'var(--radius-md)',
                border: '1.5px solid var(--color-forest)',
              }}
            >
              <div style={{ color: 'var(--color-forest)', fontSize: '0.78rem', fontWeight: 700 }}>
                {langMeta.name} रूपांतरण ({langMeta.badgeText}):
              </div>
              <div
                className={selectedLang === 'santhali' ? 'font-olchiki' : 'font-deva'}
                style={{ fontSize: '1.25rem', fontWeight: 700, margin: '6px 0', color: 'var(--color-slate)' }}
              >
                {currentTranslation.scriptOlChiki || currentTranslation.script}
              </div>
              <div style={{ fontSize: '0.88rem', color: '#0E5B37', fontWeight: 600 }}>
                शिक्षक हेतु उच्चारण: {currentTranslation.phoneticDeva}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--color-slate-muted)', fontStyle: 'italic', marginTop: '2px' }}>
                रोमन: {currentTranslation.phoneticLatin}
              </div>
            </div>
          </div>

          {/* Phase 2: Interactive Activity */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-forest)', textTransform: 'uppercase' }}>
              चरण 2: कक्षा शिक्षण गतिविधि (Classroom Activity)
            </span>

            <div
              style={{
                backgroundColor: 'var(--color-ochre-subtle)',
                padding: '14px 16px',
                borderRadius: 'var(--radius-md)',
                border: '1.5px solid var(--color-ochre)',
              }}
            >
              <div style={{ fontWeight: 700, color: '#8C5F08', fontSize: '1rem' }}>
                {currentLesson.activity.name}
              </div>
              <p style={{ fontSize: '0.85rem', color: '#523702', margin: '4px 0 10px 0' }}>
                {currentLesson.activity.instructionsHindi}
              </p>

              <div
                style={{
                  backgroundColor: 'var(--color-surface-card)',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px dashed var(--color-ochre)',
                  fontSize: '0.85rem',
                }}
              >
                <div>
                  <strong>शिक्षक पूछें:</strong> {currentPrompt.teacherAsk}
                </div>
                <div style={{ marginTop: '4px', color: 'var(--color-forest)' }}>
                  <strong>छात्र उत्तर:</strong> {currentPrompt.childAnswer}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Formative Assessment & Student Tracker */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Assessment Evaluation Card */}
          <div className="card-brutal" style={{ padding: '24px', backgroundColor: 'var(--color-surface-card)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <Award size={20} color="var(--color-palash)" />
              <h3 style={{ margin: 0, fontSize: '1.2rem' }}>निपुण सतत मूल्यांकन (Formative Assessment)</h3>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--color-slate-muted)', margin: '0 0 14px 0' }}>
              प्रश्नोत्तरी द्वारा प्रत्येक छात्र की सीखने की प्रगति का रिकॉर्ड रखें (100% ऑफलाइन सुरक्षित)।
            </p>

            <div
              style={{
                padding: '12px 14px',
                backgroundColor: 'var(--color-surface-hover)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                marginBottom: '16px',
                fontSize: '0.9rem',
              }}
            >
              <strong>प्रश्न:</strong> {currentLesson.assessment.questionHindi}
              <div style={{ marginTop: '4px', color: 'var(--color-forest)', fontSize: '0.85rem' }}>
                <strong>अपेक्षित मातृभाषा उत्तर:</strong> {currentLesson.assessment.expectedAnswers[selectedLang]}
              </div>
            </div>

            {/* Assessment Input Form */}
            <form onSubmit={handleSaveAssessment} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                  छात्र/छात्रा का नाम:
                </label>
                <input
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="उदा: बिरसा सोरेन / सीता मुंडा / सोमा हो"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-sm)',
                    border: 'var(--border-thick)',
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.95rem',
                  }}
                />
              </div>

              {/* Rubric Score Radios */}
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                  निपुण दक्षता स्तर (Competency Level):
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {currentLesson.assessment.levels.map((lvl) => (
                    <label
                      key={lvl.score}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '8px 12px',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--color-border)',
                        backgroundColor: selectedScore === lvl.score ? 'var(--color-forest-subtle)' : 'var(--color-surface-card)',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                      }}
                    >
                      <input
                        type="radio"
                        name="rubricScore"
                        value={lvl.score}
                        checked={selectedScore === lvl.score}
                        onChange={() => setSelectedScore(lvl.score)}
                      />
                      <div>
                        <strong>{lvl.label}</strong>: {lvl.desc}
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <button type="submit" className="btn-brutal btn-primary" style={{ padding: '10px 18px', width: '100%' }}>
                <CheckCircle size={16} />
                मूल्यांकन सहेजें (Save Record)
              </button>
            </form>
          </div>

          {/* AI Custom Lesson Generator */}
          <div className="card-brutal" style={{ padding: '20px', backgroundColor: 'var(--color-ochre-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Sparkles size={18} color="#B45309" />
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#B45309' }}>
                एआई पाठ योजना जनरेटर (Custom Topic Generator)
              </h3>
            </div>
            <p style={{ fontSize: '0.82rem', color: '#523702', margin: '0 0 10px 0' }}>
              कोई भी नया विषय लिखें (उदा: "गाँव का मेला", "पेड़-पौधे", "रंगों के नाम") और तुरंत मातृभाषा पाठ बनाएं:
            </p>

            <form onSubmit={handleGenerateCustomLesson} style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                value={customTopic}
                onChange={(e) => setCustomTopic(e.target.value)}
                placeholder="नया पाठ विषय दर्ज करें..."
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: 'var(--border-thick)',
                  backgroundColor: 'var(--color-surface-card)',
                  color: 'var(--color-slate)',
                  fontSize: '0.9rem',
                }}
              />
              <button
                type="submit"
                disabled={isGeneratingCustom}
                className="btn-brutal btn-ochre"
                style={{ padding: '8px 14px', fontSize: '0.85rem' }}
              >
                {isGeneratingCustom ? 'बन रहा है...' : 'पाठ बनाएं'}
              </button>
            </form>

            {/* Custom Generated Lesson Preview */}
            {customGeneratedLesson && (
              <div
                style={{
                  marginTop: '12px',
                  padding: '12px',
                  backgroundColor: 'var(--color-surface-card)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border)',
                  fontSize: '0.85rem',
                }}
              >
                <div style={{ fontWeight: 700, color: 'var(--color-forest)' }}>
                  {customGeneratedLesson.titleHindi}
                </div>
                <div style={{ marginTop: '4px' }}>
                  <strong>मातृभाषा संवाद:</strong> {customGeneratedLesson.openingScriptTribal}
                </div>
                <div style={{ color: '#8C5F08', fontSize: '0.8rem' }}>
                  उच्चारण: {customGeneratedLesson.phoneticDeva}
                </div>
              </div>
            )}
          </div>

          {/* Recent Student Records */}
          {assessmentRecords.length > 0 && (
            <div className="card-brutal" style={{ padding: '16px 20px', backgroundColor: 'var(--color-surface-card)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <ListChecks size={16} color="var(--color-forest)" />
                <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>हाल के छात्र रिकॉर्ड ({assessmentRecords.length})</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '180px', overflowY: 'auto' }}>
                {assessmentRecords.slice(0, 5).map((rec) => (
                  <div
                    key={rec.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '0.82rem',
                      padding: '6px 10px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--color-bg)',
                    }}
                  >
                    <span><strong>{rec.studentName}</strong> ({rec.lessonTitle.slice(0, 16)}...)</span>
                    <span className={`badge-tag ${rec.score === 3 ? 'badge-forest' : 'badge-ochre'}`}>
                      {rec.scoreLabel}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
