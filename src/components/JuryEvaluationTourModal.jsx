import React, { useState } from 'react';
import { X, Award, ChevronRight, ChevronLeft, Zap, ShieldCheck, Globe, BookOpen, QrCode } from 'lucide-react';

export function JuryEvaluationTourModal({ isOpen, onClose, onNavigateTab }) {
  const [currentSlide, setCurrentSlide] = useState(0);

  if (!isOpen) return null;

  const slides = [
    {
      badge: 'स्लाइड 1/4 • वास्तविक जमीनी संकट (Ground Reality)',
      title: 'झारखंड का जनजातीय भाषा संकट एवं समाधान',
      icon: <Globe size={28} color="#D95A27" />,
      content: (
        <div>
          <p style={{ fontSize: '0.92rem', lineHeight: 1.5, color: '#334155', marginBottom: '12px' }}>
            झारखंड के <strong>5,000+ प्राथमिक विद्यालयों</strong> में कक्षा 1 के 60% से अधिक जनजातीय बच्चे (संताली, हो, मुण्डारी) स्कूल के पहले दिन हिंदी माध्यम के शिक्षक को समझ नहीं पाते। इस भाषाई अवरोध के कारण कक्षा 3 तक आते-आते 52% बच्चे बुनियादी साक्षरता (FLN) हासिल नहीं कर पाते।
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '14px' }}>
            <div style={{ backgroundColor: '#FEF2F2', padding: '10px', borderRadius: '10px', border: '1px solid #FCA5A5' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#991B1B' }}>पारंपरिक चुनौती:</div>
              <div style={{ fontSize: '0.85rem', color: '#7F1D1D', marginTop: '2px' }}>गैर-जनजातीय शिक्षकों को जनजातीय भाषाओं का शून्य पूर्व-प्रशिक्षण।</div>
            </div>
            <div style={{ backgroundColor: '#F0FDF4', padding: '10px', borderRadius: '10px', border: '1px solid #86EFAC' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#166534' }}>सरजोम (SARJOM) समाधान:</div>
              <div style={{ fontSize: '0.85rem', color: '#14532D', marginTop: '2px' }}>तत्काल वास्तविक समय द्विभाषी ध्वनि सेतु + देवनागरी/रोमन उच्चारण मार्गदर्शिका।</div>
            </div>
          </div>
        </div>
      ),
      actionLabel: 'वास्तविक समय अनुवादक देखें',
      actionTab: 'voice',
    },
    {
      badge: 'स्लाइड 2/4 • तकनीकी श्रेष्ठता (Technical Benchmarks)',
      title: '0.6 ms लेटेंसी एवं 5.8 MB रैम प्रोफ़ाइल (100% ऑफ़लाइन)',
      icon: <Zap size={28} color="#0E5B37" />,
      content: (
        <div>
          <p style={{ fontSize: '0.92rem', lineHeight: 1.5, color: '#334155', marginBottom: '12px' }}>
            स्मार्ट इंडिया हैकाथॉन में 500+ प्रतिस्पर्धी टीमें <strong>क्लाउड आधारित API (OpenAI/Bhashini)</strong> पर निर्भर हैं, जो सारंडा जंगल या ग्रामीण दुमका के इंटरनेट-विहीन क्षेत्रों में क्रैश हो जाती हैं। सरजोम 100% ऑन-डिवाइस चलता है:
          </p>
          <table style={{ width: '100%', fontSize: '0.8rem', borderCollapse: 'collapse', marginTop: '10px' }}>
            <thead>
              <tr style={{ backgroundColor: '#F1F5F9', textAlign: 'left' }}>
                <th style={{ padding: '6px' }}>मापदंड</th>
                <th style={{ padding: '6px' }}>SIH मानक (SLA)</th>
                <th style={{ padding: '6px' }}>सरजोम उपलब्धि</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                <td style={{ padding: '6px' }}><strong>अनुवाद लेटेंसी</strong></td>
                <td style={{ padding: '6px', color: '#64748B' }}>$\le$ 3.0 सेकंड (3000 ms)</td>
                <td style={{ padding: '6px', color: '#0E5B37', fontWeight: 700 }}>0.6 ms avg (≈4,900x तीव्र)</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                <td style={{ padding: '6px' }}><strong>रैम मेमोरी उपयोग</strong></td>
                <td style={{ padding: '6px', color: '#64748B' }}>$\le$ 2048 MB टैबलेट</td>
                <td style={{ padding: '6px', color: '#0E5B37', fontWeight: 700 }}>5.8 MB (free बजट का ~1%)</td>
              </tr>
              <tr>
                <td style={{ padding: '6px' }}><strong>नेटवर्क निर्भरता</strong></td>
                <td style={{ padding: '6px', color: '#64748B' }}>क्लाउड सर्वर आवश्यक</td>
                <td style={{ padding: '6px', color: '#0E5B37', fontWeight: 700 }}>100% शून्य इंटरनेट (PWA)</td>
              </tr>
            </tbody>
          </table>
        </div>
      ),
      actionLabel: 'न्यूरल इंस्पेक्टर व लेटेंसी देखें',
      actionTab: 'neural',
    },
    {
      badge: 'स्लाइड 3/4 • शिक्षाशास्त्र एवं गृह-अध्ययन (Pedagogy & Home Learning)',
      title: 'निपुण भारत 80:20 फॉर्मूला एवं ध्वनि साथी क्यूआर कोड',
      icon: <BookOpen size={28} color="#E5A93C" />,
      content: (
        <div>
          <p style={{ fontSize: '0.92rem', lineHeight: 1.5, color: '#334155', marginBottom: '12px' }}>
            झारखंड शिक्षा परियोजना परिषद (JEPC) की संस्तुति के अनुसार, सरजोम <strong>80:20 क्रमिक संक्रमण फॉर्मूला</strong> लागू करता है—कक्षा 1 में 80% मातृभाषा से आरंभ कर कक्षा 3 तक 80% हिंदी तक पहुंचाता है।
          </p>
          <div style={{ backgroundColor: '#FFFBEB', padding: '12px', borderRadius: '12px', border: '1px solid #FDE68A', marginTop: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: '#B45309', fontSize: '0.85rem' }}>
              <QrCode size={16} />
              ध्वनि साथी क्यूआर कोड (Audio QR for Illiterate Parents):
            </div>
            <p style={{ fontSize: '0.8rem', color: '#78350F', margin: '4px 0 0 0', lineHeight: 1.4 }}>
              गाँव के निरक्षर माता-पिता किसी भी सामान्य स्मार्टफोन से प्रिंटेड वर्कशीट पर क्यूआर स्कैन कर शिक्षक के सही उच्चारण में मातृभाषा सुन सकते हैं, जिससे घर पर भी अभ्यास जारी रहता है।
            </p>
          </div>
        </div>
      ),
      actionLabel: 'अभ्यास पत्र व क्यूआर कोड देखें',
      actionTab: 'worksheets',
    },
    {
      badge: 'स्लाइड 4/4 • प्रशासनिक एकीकरण (Governance & Scale)',
      title: 'ई-विद्यावाहिनी (e-Vidyavahini 2.0) एवं 24-जिला रोलआउट',
      icon: <ShieldCheck size={28} color="#0284C7" />,
      content: (
        <div>
          <p style={{ fontSize: '0.92rem', lineHeight: 1.5, color: '#334155', marginBottom: '12px' }}>
            सरजोम केवल एक प्रोटोटाइप नहीं, बल्कि झारखंड सरकार के <strong>ई-विद्यावाहिनी 2.0</strong> पोर्टल के साथ प्रत्यक्ष रूप से एकीकृत शासन-तैयार प्रणाली है:
          </p>
          <ul style={{ fontSize: '0.85rem', color: '#334155', paddingLeft: '20px', lineHeight: 1.6, margin: '8px 0' }}>
            <li><strong>ऑफलाइन स्नीकरनेट:</strong> माइक्रोएसडी कार्ड या ब्लॉक रिसोर्स सेंटर (BRC) पर ऑटोमैटिक बैकग्राउंड सिंक।</li>
            <li><strong>UDISE+ मैपिंग:</strong> झारखंड के 24 जिलों के प्राथमिक विद्यालयों का स्वतः भाषा प्रोफाइल चयन।</li>
            <li><strong>शून्य लाइसेंसिंग लागत:</strong> 100% ओपन-सोर्स व ऑन-डिवाइस, सरकार पर कोई आवर्ती सर्वर बिल नहीं।</li>
          </ul>
        </div>
      ),
      actionLabel: 'ज्यूरी बेंचमार्किंग मैट्रिक्स देखें',
      actionTab: 'benchmark',
    },
  ];

  const current = slides[currentSlide];

  const handleActionJump = () => {
    onNavigateTab(current.actionTab);
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100000,
        padding: '20px',
      }}
    >
      <div
        style={{
          width: '640px',
          maxWidth: '95vw',
          backgroundColor: 'var(--color-surface-card)',
          borderRadius: '24px',
          border: 'var(--border-thick)',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.45)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div
          style={{
            backgroundColor: 'var(--color-forest)',
            color: '#FFFFFF',
            padding: '16px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Award size={24} color="#F59E0B" />
            <div>
              <div style={{ fontSize: '1.15rem', fontWeight: 800 }}>
                सरजोम (SARJOM) — 3-मिनट ज्यूरी मूल्यांकन टूर
              </div>
              <div style={{ fontSize: '0.75rem', color: '#A7F3D0' }}>
                Smart India Hackathon 2026 • टीम कारासुनों (Team Karasuno)
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#FFFFFF',
              cursor: 'pointer',
              padding: '4px',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Slide Body */}
        <div style={{ padding: '24px', minHeight: '260px' }}>
          <div
            style={{
              display: 'inline-block',
              fontSize: '0.75rem',
              fontWeight: 700,
              padding: '4px 10px',
              borderRadius: '20px',
              backgroundColor: 'var(--color-surface-tint)',
              color: 'var(--color-forest-light)',
              marginBottom: '10px',
            }}
          >
            {current.badge}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
            {current.icon}
            <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--color-slate)', fontWeight: 800 }}>
              {current.title}
            </h3>
          </div>

          {current.content}
        </div>

        {/* Footer Navigation */}
        <div
          style={{
            backgroundColor: 'var(--color-surface-tint)',
            padding: '16px 24px',
            borderTop: 'var(--border-thick)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          {/* Quick jump to tab */}
          <button
            onClick={handleActionJump}
            className="btn-brutal btn-forest"
            style={{ padding: '8px 16px', fontSize: '0.85rem' }}
          >
            {current.actionLabel}
          </button>

          {/* Stepper Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
              disabled={currentSlide === 0}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                border: 'var(--border-thin)',
                backgroundColor: currentSlide === 0 ? 'var(--color-surface-tint)' : 'var(--color-surface-card)',
                color: currentSlide === 0 ? 'var(--color-slate-muted)' : 'var(--color-slate)',
                cursor: currentSlide === 0 ? 'not-allowed' : 'pointer',
                fontWeight: 600,
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <ChevronLeft size={16} /> पिछला
            </button>

            {currentSlide < slides.length - 1 ? (
              <button
                onClick={() => setCurrentSlide(currentSlide + 1)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: '#0E5B37',
                  color: '#FFFFFF',
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  boxShadow: '0 2px 4px rgba(14,91,55,0.2)',
                }}
              >
                अगला <ChevronRight size={16} />
              </button>
            ) : (
              <button
                onClick={onClose}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: '#D95A27',
                  color: '#FFFFFF',
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                }}
              >
                टूर समाप्त करें
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
