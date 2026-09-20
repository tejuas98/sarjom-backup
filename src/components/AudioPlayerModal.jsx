import React, { useState, useRef, useEffect } from 'react';
import { Volume2, Play, Pause, RotateCcw, X, Download, Music, Radio } from 'lucide-react';
import { voiceService } from '../services/voiceTranslationService';

const TRACKS = [
  {
    id: 'johar',
    title: '1. Morning Greeting (प्रात:कालीन अभिवादन)',
    script: 'ᱡᱚᱦᱟᱨ (जोहार / Johār)',
    phonetic: 'Universal tribal greeting in Santhali, Ho, and Mundari',
    category: 'Classroom Greeting',
    file: '/audio/johar_greeting.mp3',
    duration: '0:03',
  },
  {
    id: 'command',
    title: '2. Classroom Directives (कक्षा निर्देश)',
    script: 'यहाँ आओ! बैठ जाओ! किताब खोलो!',
    phonetic: 'Node hijug me / Dub me / Puti kulue',
    category: 'Teacher Directives',
    file: '/audio/classroom_command.mp3',
    duration: '0:04',
  },
  {
    id: 'nipun',
    title: '3. NIPUN FLN Lesson (निपुण भारत पाठ)',
    script: 'प्यारे बच्चों! आज हम सब मिलकर नई भाषा सीखेंगे।',
    phonetic: 'Dular gidra ko! Tehenj aabo johar seched-aa',
    category: '80:20 Transition Lesson',
    file: '/audio/nipun_lesson_opening.mp3',
    duration: '0:07',
  },
  {
    id: 'qr',
    title: '4. Audio QR Prompt (वर्कशीट ध्वनि साथी)',
    script: 'ध्वनि साथी क्यूआर कोड — स्कैन कर उच्चारण सुनें',
    phonetic: 'Scannable take-home audio prompt for rural parents',
    category: 'Home Practice QR',
    file: '/audio/worksheet_qr_prompt.mp3',
    duration: '0:05',
  },
  {
    id: 'praise',
    title: '5. Teacher Praise (शाबाशी व प्रोत्साहन)',
    script: 'शाबाश! बहुत अच्छा! बेस गे! (Besh ge!)',
    phonetic: 'Positive reinforcement in child\'s native tongue',
    category: 'Formative Praise',
    file: '/audio/teacher_praise.mp3',
    duration: '0:03',
  },
  {
    id: 'briefing',
    title: '6. SARJOM System Overview (सिस्टम परिचय)',
    script: 'टीम कारासुनों (Team Karasuno) — SARJOM Briefing',
    phonetic: 'Complete voice explanation of architecture and impact',
    category: 'Jury Briefing',
    file: '/audio/sarjom_overview.mp3',
    duration: '0:15',
  },
];

export function AudioPlayerModal({ isOpen, onClose }) {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const audioRef = useRef(null);

  const currentTrack = TRACKS[currentTrackIndex];

  useEffect(() => {
    if (!isOpen && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, [isOpen]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      voiceService.stopSpeaking();
      audioRef.current.playbackRate = playbackRate;
      audioRef.current.play().then(() => setIsPlaying(true)).catch(e => console.log('Audio error:', e));
    }
  };

  const handleTrackSelect = (index) => {
    voiceService.stopSpeaking();
    setCurrentTrackIndex(index);
    setProgress(0);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.src = TRACKS[index].file;
      audioRef.current.playbackRate = playbackRate;
      audioRef.current.play().then(() => setIsPlaying(true)).catch(e => console.log('Play error:', e));
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current && audioRef.current.duration) {
      setProgress((audioRef.current.currentTime / audioRef.current.duration) * 100);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setProgress(0);
  };

  const handleSpeedChange = (speed) => {
    setPlaybackRate(speed);
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
      onClick={onClose}
    >
      <div
        className="card-brutal"
        style={{
          width: '100%',
          maxWidth: '720px',
          backgroundColor: '#0F172A',
          color: '#FFFFFF',
          padding: '24px',
          borderRadius: '24px',
          boxShadow: '0 25px 60px -12px rgba(0, 0, 0, 0.75), 0 0 40px rgba(14, 91, 55, 0.18)',
          border: '1px solid rgba(14, 91, 55, 0.4)',
          display: 'flex',
          flexDirection: 'column',
          gap: '18px',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Hidden HTML5 Audio Element */}
        <audio
          ref={audioRef}
          src={currentTrack.file}
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleEnded}
        />

        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #334155', paddingBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: 'var(--color-forest)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Radio size={20} color="#FFFFFF" />
            </div>
            <div>
              <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#34D399' }}>
                सरजोम ध्वनि साथी (Interactive Audio Deck)
              </div>
              <div style={{ fontSize: '0.78rem', color: '#94A3B8' }}>
                On-Device Vernacular Speech Synthesis Suite · Team Karasuno
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: '#1E293B',
              border: 'none',
              borderRadius: '8px',
              color: '#94A3B8',
              cursor: 'pointer',
              padding: '6px',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Currently Playing Card */}
        <div
          style={{
            backgroundColor: '#1E293B',
            borderRadius: '12px',
            padding: '18px',
            border: '2px solid #334155',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#F59E0B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {currentTrack.category}
            </span>
            <div style={{ display: 'flex', gap: '6px' }}>
              {[0.75, 1.0, 1.25].map((speed) => (
                <button
                  key={speed}
                  onClick={() => handleSpeedChange(speed)}
                  style={{
                    backgroundColor: playbackRate === speed ? 'var(--color-forest)' : '#0F172A',
                    color: '#FFFFFF',
                    border: '1px solid #475569',
                    borderRadius: '4px',
                    padding: '2px 8px',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {speed}x
                </button>
              ))}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#FFFFFF' }}>
              {currentTrack.title}
            </div>
            <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#A7F3D0', margin: '4px 0' }}>
              {currentTrack.script}
            </div>
            <div style={{ fontSize: '0.82rem', color: '#CBD5E1' }}>
              {currentTrack.phonetic}
            </div>
          </div>

          {/* Progress Bar */}
          <div style={{ width: '100%', height: '6px', backgroundColor: '#334155', borderRadius: '3px', overflow: 'hidden' }}>
            <div
              style={{
                width: `${progress}%`,
                height: '100%',
                backgroundColor: 'var(--color-forest)',
                transition: 'width 0.1s linear',
              }}
            />
          </div>

          {/* Control Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
            <button
              onClick={togglePlay}
              className="btn-brutal btn-forest"
              style={{ padding: '8px 20px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              {isPlaying ? <Pause size={16} /> : <Play size={16} />}
              <span>{isPlaying ? 'रोकें (Pause)' : 'चलाएँ (Play Sample)'}</span>
            </button>

            <a
              href={currentTrack.file}
              download
              className="btn-brutal btn-subtle"
              style={{ padding: '6px 14px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '6px', color: '#CBD5E1', textDecoration: 'none' }}
            >
              <Download size={14} />
              <span>MP3 डाउनलोड</span>
            </a>
          </div>
        </div>

        {/* Track Playlist */}
        <div>
          <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#94A3B8', marginBottom: '8px', textTransform: 'uppercase' }}>
            उपलब्ध ऑडियो ट्रैक (Select Track to Play):
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '220px', overflowY: 'auto' }}>
            {TRACKS.map((t, idx) => {
              const isCur = currentTrackIndex === idx;
              return (
                <div
                  key={t.id}
                  onClick={() => handleTrackSelect(idx)}
                  style={{
                    backgroundColor: isCur ? 'rgba(16, 185, 129, 0.15)' : '#1E293B',
                    border: `1px solid ${isCur ? 'var(--color-forest)' : '#334155'}`,
                    borderRadius: '8px',
                    padding: '8px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ color: isCur ? '#34D399' : '#64748B' }}>
                      {isCur && isPlaying ? <Volume2 size={16} /> : <Play size={16} />}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.88rem', fontWeight: isCur ? 800 : 600, color: isCur ? '#FFFFFF' : '#E2E8F0' }}>
                        {t.title}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                        {t.script}
                      </div>
                    </div>
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B' }}>
                    {t.duration}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
