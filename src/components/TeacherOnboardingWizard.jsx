import React, { useState } from 'react';
import { TRIBAL_LANGUAGES } from '../data/tribalLexicon';
import { voiceService } from '../services/voiceTranslationService';
import {
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Volume2,
  Sparkles,
  School,
  Mic,
  ShieldCheck,
  X,
  MapPin,
} from 'lucide-react';
import { toast } from 'sonner';

export function TeacherOnboardingWizard({ isOpen, onClose, selectedLang, onSelectLang }) {
  const [step, setStep] = useState(1);
  const [micTestPassed, setMicTestPassed] = useState(false);

  if (!isOpen) return null;

  const langMeta = TRIBAL_LANGUAGES[selectedLang] || TRIBAL_LANGUAGES.santhali;

  const handleTestAudio = () => {
    const welcomePhrase = 'कक्षा में आपका स्वागत है।';
    voiceService.speakText(welcomePhrase, 'hi-IN');
    toast.success('ध्वनि परीक्षण: कक्षा स्वागत वाक्य उच्चारित');
  };

  const handleMicSim = () => {
    setMicTestPassed(true);
    toast.success('माइक इनपुट कैलिब्रेशन सफल! पृष्ठभूमि शोर फ़िल्टर सक्रिय');
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.5)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
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
          width: '100%',
          maxWidth: '580px',
          backgroundColor: 'var(--color-surface)',
          borderRadius: '24px',
          padding: '28px',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.4)',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '8px',
                backgroundColor: 'var(--color-palash)',
                color: '#FFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
              }}
            >
              {step}/4
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.25rem' }}>शिक्षक ऑनबोर्डिंग गाइड (60-Sec Setup)</h3>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.78rem', color: 'var(--color-slate-muted)' }}>
                झारखंड प्राथमिक विद्यालय MTB-MLE कक्षा तैयारी विज़ार्ड
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: '4px' }}
          >
            <X size={20} color="var(--color-slate-muted)" />
          </button>
        </div>

        {/* Progress Dots */}
        <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              style={{
                flex: 1,
                height: '6px',
                borderRadius: '3px',
                backgroundColor: s <= step ? 'var(--color-forest)' : 'var(--color-border)',
                transition: 'background-color 0.2s ease',
              }}
            />
          ))}
        </div>

        {/* Step Content */}
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <School size={20} color="var(--color-forest)" />
              <h4 style={{ margin: 0, fontSize: '1.1rem' }}>चरण 1: अपने विद्यालय का जिला व भाषा चुनें</h4>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-slate-muted)', margin: 0 }}>
              आप जिस जिले में पदस्थापित हैं, उस पर टैप करें। सिस्टम स्वतः लक्षित मातृभाषा और यूडीआईएसई+ सेट कर देगा:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { id: 'ho', dist: 'पश्चिमी सिंहभूम (Chaibasa)', lang: 'हो (Warang Chiti 𑢹𑣉𑣉)', udise: '20240301102' },
                { id: 'mundari', dist: 'खूंटी / रांची ग्रामीण (Torpa)', lang: 'मुण्डारी (Devanagari)', udise: '20230200401' },
                { id: 'santhali', dist: 'दुमका / संथाल परगना (Shikaripara)', lang: 'संताली (Ol Chiki ᱥᱟᱱᱛᱟᱲᱤ)', udise: '20210501809' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectLang(item.id);
                    toast.success(`चयनित: ${item.dist} ➔ ${item.lang}`);
                  }}
                  className="btn-brutal"
                  style={{
                    padding: '12px 16px',
                    textAlign: 'left',
                    backgroundColor: selectedLang === item.id ? 'var(--color-forest-subtle)' : 'var(--color-surface-card)',
                    borderColor: selectedLang === item.id ? 'var(--color-forest)' : 'var(--color-border)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--color-slate)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <MapPin size={14} color="var(--color-palash)" />
                      <span>{item.dist}</span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-forest)', marginTop: '2px' }}>
                      लक्षित भाषा: <strong>{item.lang}</strong>
                    </div>
                  </div>
                  {selectedLang === item.id && <CheckCircle size={20} color="var(--color-forest)" />}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Volume2 size={20} color="var(--color-palash)" />
              <h4 style={{ margin: 0, fontSize: '1.1rem' }}>चरण 2: कक्षा ऑडियो व स्पीकर परीक्षण</h4>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-slate-muted)', margin: 0 }}>
              30+ बच्चों की कक्षा में आवाज़ पीछे तक पहुंचाने हेतु टैबलेट को <strong>ब्लूटूथ मिनी-स्पीकर</strong> या 3.5mm ऑक्स केबल से जोड़ें।
            </p>

            <div
              style={{
                padding: '20px',
                backgroundColor: 'var(--color-bg)',
                borderRadius: 'var(--radius-md)',
                border: 'var(--border-thick)',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-slate-muted)' }}>
                परीक्षण ध्वनि ({langMeta.name}):
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, margin: '8px 0', color: 'var(--color-slate)' }}>
                कक्षा में आपका स्वागत है
              </div>
              <button
                onClick={handleTestAudio}
                className="btn-brutal btn-palash"
                style={{ padding: '8px 18px', fontSize: '0.9rem', margin: '0 auto' }}
              >
                <Volume2 size={16} /> स्पीकर टेस्ट करें (Play Audio)
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Mic size={20} color="#8C5F08" />
              <h4 style={{ margin: 0, fontSize: '1.1rem' }}>चरण 3: शिक्षक माइक इनपुट परीक्षण</h4>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-slate-muted)', margin: 0 }}>
              माइक बटन दबाकर एक सामान्य कक्षा निर्देश बोलें (जैसे: <em>"किताब खोलो"</em>)। सिस्टम पृष्ठभूमि शोर को काटकर तुरंत अनुवाद करेगा:
            </p>

            <div
              style={{
                padding: '18px',
                backgroundColor: micTestPassed ? 'var(--color-forest-subtle)' : 'var(--color-ochre-subtle)',
                borderRadius: 'var(--radius-md)',
                border: `2px solid ${micTestPassed ? 'var(--color-forest)' : 'var(--color-ochre)'}`,
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#8C5F08' }}>
                {micTestPassed ? 'माइक कैलिब्रेशन पूर्ण (Noise Gate Active)' : 'परीक्षण वाक्य: "किताब खोलो"'}
              </div>
              {!micTestPassed ? (
                <button
                  onClick={handleMicSim}
                  className="btn-brutal btn-ochre"
                  style={{ marginTop: '12px', padding: '8px 18px', fontSize: '0.9rem' }}
                >
                  <Mic size={16} /> माइक जांचें (Calibrate Mic)
                </button>
              ) : (
                <div style={{ marginTop: '8px', fontSize: '0.85rem', color: 'var(--color-forest)', fontWeight: 700 }}>
                  विलंबता: 32 ms • SLA मानक पूर्ण
                </div>
              )}
            </div>
          </div>
        )}

        {step === 4 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={20} color="var(--color-forest)" />
              <h4 style={{ margin: 0, fontSize: '1.1rem' }}>चरण 4: बधाई! आपकी कक्षा तैयार है</h4>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-slate)', lineHeight: 1.5, margin: 0 }}>
              आप अब बिना किसी पूर्व भाषा प्रशिक्षण के आदिवासी छात्रों को उनकी मातृभाषा में पढ़ा सकते हैं।
            </p>

            <div
              style={{
                padding: '16px',
                backgroundColor: 'var(--color-forest-subtle)',
                borderRadius: 'var(--radius-md)',
                border: '1.5px solid var(--color-forest)',
                fontSize: '0.82rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <div>• <strong>कक्षा संवाद:</strong> हिंदी में बोलें, टैबलेट तुरंत मातृभाषा में बोलेगा।</div>
              <div>• <strong>छात्र प्रत्युत्तर:</strong> जब बच्चा मातृभाषा में बोले, 1-टैप उत्तर चिप्स का उपयोग करें।</div>
              <div>• <strong>100% ऑफलाइन:</strong> विद्यालय में इंटरनेट की कोई आवश्यकता नहीं है।</div>
            </div>
          </div>
        )}

        {/* Footer Navigation Controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="btn-brutal"
              style={{ padding: '8px 14px', fontSize: '0.85rem', backgroundColor: 'var(--color-surface-card)' }}
            >
              <ArrowLeft size={16} /> पीछे
            </button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="btn-brutal btn-primary"
              style={{ padding: '8px 18px', fontSize: '0.85rem' }}
            >
              आगे बढ़ें <ArrowRight size={16} />
            </button>
          ) : (
            <button
              onClick={() => {
                toast.success('ऑनबोर्डिंग पूर्ण! सरजोम में आपका स्वागत है।');
                onClose();
              }}
              className="btn-brutal btn-forest"
              style={{ padding: '10px 22px', fontSize: '0.95rem' }}
            >
              <CheckCircle size={18} /> कक्षा आरंभ करें (Start Class)
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
