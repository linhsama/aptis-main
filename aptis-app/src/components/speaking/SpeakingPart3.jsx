import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSettings } from '../../contexts/SettingsContext';
import Timer from '../Timer';
import {
  Mic,
  Volume2,
  VolumeX,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  CheckCircle,
  Eye,
  EyeOff,
  Languages,
  BookOpen,
  Sparkles,
  Play,
  Square,
  Images,
  Check,
  Zap,
  HelpCircle
} from 'lucide-react';
import speakingP3Data from '../../data/speaking_part3.json';
import { translateToVietnamese } from '../../utils/translate';
import { evaluateResponse } from '../../utils/aiGrader';
import AIEvaluationModal from '../common/AIEvaluationModal';
import TemplateLearningModal from '../common/TemplateLearningModal';

const SpeakingPart3 = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const isStudy = searchParams.get('study') === 'true';

  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeQuestionTab, setActiveQuestionTab] = useState(1); // 1 | 2 | 3
  const [showAnswer, setShowAnswer] = useState(false);
  const [isPlayingTTS, setIsPlayingTTS] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(45);
  const [userSpeechDraft, setUserSpeechDraft] = useState('');
  const [completedSets, setCompletedSets] = useState({});

  // AI & Template Modals
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiEvaluation, setAiEvaluation] = useState(null);

  const currentSet = speakingP3Data[currentIndex] || speakingP3Data[0];

  useEffect(() => {
    setShowAnswer(isStudy);
    setActiveQuestionTab(1);
    setIsPlayingTTS(false);
    setIsRecording(false);
    setRecordSeconds(45);
    setUserSpeechDraft('');
    window.speechSynthesis?.cancel();
  }, [currentIndex, isStudy]);

  useEffect(() => {
    try {
      const history = JSON.parse(localStorage.getItem('aptis_speaking_history') || '[]');
      const doneMap = {};
      history.filter(h => h.part === 'part-3').forEach(h => {
        doneMap[h.id] = true;
      });
      setCompletedSets(doneMap);
    } catch (e) {
      console.error(e);
    }
  }, []);

  // 45s timer
  useEffect(() => {
    let timer = null;
    if (isRecording && recordSeconds > 0) {
      timer = setInterval(() => {
        setRecordSeconds(prev => prev - 1);
      }, 1000);
    } else if (recordSeconds === 0 && isRecording) {
      setIsRecording(false);
      handleFinishPractice();
    }
    return () => clearInterval(timer);
  }, [isRecording, recordSeconds]);

  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      handleFinishPractice();
    } else {
      setIsRecording(true);
      setRecordSeconds(45);
    }
  };

  const playTTS = (text) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    if (isPlayingTTS) {
      setIsPlayingTTS(false);
      return;
    }

    const cleanText = text.replace(/<[^>]*>/g, '').trim();
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 0.95;
    utterance.lang = 'en-US';
    utterance.onend = () => setIsPlayingTTS(false);
    utterance.onerror = () => setIsPlayingTTS(false);

    setIsPlayingTTS(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleFinishPractice = () => {
    setShowAnswer(true);
    try {
      const history = JSON.parse(localStorage.getItem('aptis_speaking_history') || '[]');
      const updated = history.filter(h => !(h.part === 'part-3' && h.id === currentSet.id));
      updated.push({
        id: currentSet.id,
        part: 'part-3',
        title: currentSet.topic || currentSet.title,
        date: new Date().toISOString(),
        score: 1
      });
      localStorage.setItem('aptis_speaking_history', JSON.stringify(updated));
      setCompletedSets(prev => ({ ...prev, [currentSet.id]: true }));
    } catch (e) {
      console.error(e);
    }
  };

  const getCurrentQText = () => {
    if (activeQuestionTab === 1) return currentSet.q1 || 'Tell me what you see in the two pictures.';
    if (activeQuestionTab === 2) return currentSet.q2;
    return currentSet.q3;
  };

  const getCurrentAnswer = () => {
    if (activeQuestionTab === 1) return currentSet.a1_full || currentSet.a1 || '';
    if (activeQuestionTab === 2) return currentSet.a2;
    return currentSet.a3;
  };

  const handleAiGrade = () => {
    const textToEvaluate = userSpeechDraft.trim() || getCurrentAnswer();
    const result = evaluateResponse({
      text: textToEvaluate,
      skill: 'speaking',
      part: 'part-3',
      minWords: 50,
      maxWords: 100,
      prompt: getCurrentQText(),
      sampleAnswer: getCurrentAnswer()
    });

    setAiEvaluation(result);
    setIsAiModalOpen(true);
  };

  const handleApplyTemplate = (scaffoldText) => {
    setUserSpeechDraft(scaffoldText);
  };

  return (
    <div className="practice-container">
      {/* 1. Header Card */}
      <div className="practice-top-card">
        <div className="practice-header-row">
          <div className="practice-title-group">
            <span className="practice-badge-skill" style={{ background: 'rgba(168, 85, 247, 0.12)', color: '#a855f7' }}>
              <Images size={14} /> Speaking · Part 3
            </span>
            <div className="practice-topic-badge" title={currentSet.topic || currentSet.title}>
              <span>{currentSet.topic || currentSet.title || `Set ${currentSet.id}`}</span>
            </div>
            <div className="timer" style={{ color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Timer initialTime={450} />
            </div>
          </div>

          {/* Unified Action Buttons Toolbar */}
          <div className="practice-actions-toolbar">
            <button
              onClick={() => setIsTemplateModalOpen(true)}
              className="btn-action-pill btn-action-template"
              title="Học cấu trúc so sánh & Template Band C"
            >
              <BookOpen size={13} />
              <span>Template Band C</span>
            </button>

            <button
              onClick={handleAiGrade}
              className="btn-action-pill btn-action-ai"
              title="AI Chấm & Đánh giá câu trả lời"
            >
              <Sparkles size={13} />
              <span>AI Chấm</span>
            </button>

            <button
              onClick={() => setShowAnswer(!showAnswer)}
              className={`btn-action-pill btn-action-sample ${showAnswer ? 'active' : ''}`}
            >
              {showAnswer ? <EyeOff size={13} /> : <Eye size={13} />}
              <span>{showAnswer ? 'Ẩn câu trả lời' : 'Xem câu trả lời'}</span>
            </button>

            <button
              onClick={() => {
                setShowAnswer(false);
                setIsRecording(false);
                setRecordSeconds(45);
                setUserSpeechDraft('');
                window.speechSynthesis?.cancel();
                localStorage.removeItem(`aptis_speaking_p3_set_${currentSet.id}_draft`);
              }}
              className="btn-action-pill btn-action-reset"
              title="Xóa & Luyện lại đề này"
            >
              <RotateCcw size={13} />
              <span>Reset</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Question Navigation Board */}
      <div className="question-board" style={{ margin: 0 }}>
        {speakingP3Data.map((item, idx) => {
          const isDone = completedSets[item.id];
          const isCurrent = idx === currentIndex;
          let cls = 'unattempted';
          if (isDone) cls = 'correct';
          if (isCurrent) cls += ' current';

          return (
            <button
              key={item.id}
              className={`q-nav-btn ${cls}`}
              onClick={() => setCurrentIndex(idx)}
              title={`Đề ${item.id}: ${item.topic || item.title}`}
            >
              {item.id}
            </button>
          );
        })}
      </div>

      {/* 3. Sub Question Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
        <button
          onClick={() => { setActiveQuestionTab(1); setIsPlayingTTS(false); }}
          className={`btn ${activeQuestionTab === 1 ? 'btn-primary' : 'btn-secondary'}`}
          style={{ fontSize: '0.84rem', padding: '0.4rem 0.9rem' }}
        >
          Câu 1: So sánh 2 bức tranh (45s)
        </button>
        {currentSet.q2 && (
          <button
            onClick={() => { setActiveQuestionTab(2); setIsPlayingTTS(false); }}
            className={`btn ${activeQuestionTab === 2 ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '0.84rem', padding: '0.4rem 0.9rem' }}
          >
            Câu 2: Câu hỏi liên hệ (45s)
          </button>
        )}
        {currentSet.q3 && (
          <button
            onClick={() => { setActiveQuestionTab(3); setIsPlayingTTS(false); }}
            className={`btn ${activeQuestionTab === 3 ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '0.84rem', padding: '0.4rem 0.9rem' }}
          >
            Câu 3: Quan điểm cá nhân (45s)
          </button>
        )}
      </div>

      {/* 4. Main Split Layout */}
      <div className="listening-grid-2col">
        {/* Left Card: 2 Pictures & Mic */}
        <div className="listening-card-left">
          <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#a855f7', textTransform: 'uppercase' }}>
              Question {activeQuestionTab} (45 seconds):
            </span>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', margin: '0.25rem 0 0', lineHeight: '1.4' }}>
              "{getCurrentQText()}"
            </h3>
          </div>

          {/* 2 Pictures Side by Side */}
          {activeQuestionTab === 1 && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <div style={{ borderRadius: 'var(--radius-sm)', overflow: 'hidden', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)', height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {currentSet.image1 ? (
                  <img src={currentSet.image1} alt="Picture 1" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => e.currentTarget.style.display = 'none'} />
                ) : (
                  <div style={{ padding: '1rem', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Picture 1</div>
                )}
              </div>
              <div style={{ borderRadius: 'var(--radius-sm)', overflow: 'hidden', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)', height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {currentSet.image2 ? (
                  <img src={currentSet.image2} alt="Picture 2" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => e.currentTarget.style.display = 'none'} />
                ) : (
                  <div style={{ padding: '1rem', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Picture 2</div>
                )}
              </div>
            </div>
          )}

          {/* Recording Box */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.06) 0%, rgba(99, 102, 241, 0.06) 100%)',
            border: '1px solid rgba(168, 85, 247, 0.2)',
            borderRadius: 'var(--radius-sm)',
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            <div style={{
              width: '70px',
              height: '70px',
              borderRadius: '50%',
              border: `4px solid ${isRecording ? '#a855f7' : 'var(--border)'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.4rem',
              fontWeight: 900,
              color: isRecording ? '#a855f7' : 'var(--text-main)'
            }}>
              {recordSeconds}s
            </div>

            <button
              onClick={toggleRecording}
              className="btn"
              style={{
                background: isRecording ? '#ef4444' : 'linear-gradient(135deg, #a855f7, #9333ea)',
                color: '#fff',
                border: 'none',
                padding: '0.55rem 1.5rem',
                borderRadius: 'var(--radius-full)',
                fontWeight: 700,
                fontSize: '0.88rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              {isRecording ? <Square size={15} fill="#fff" /> : <Mic size={15} />}
              <span>{isRecording ? 'Dừng & Chấm bài' : 'Bắt đầu nói (45s)'}</span>
            </button>
          </div>

          {/* Self-practice script / draft notes */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Dàn ý so sánh & cấu trúc câu:
              </label>
              <button
                onClick={() => setIsTemplateModalOpen(true)}
                style={{ background: 'none', border: 'none', color: '#a855f7', fontSize: '0.74rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}
              >
                <Zap size={12} /> Chèn Template So Sánh 2 Tranh
              </button>
            </div>
            <textarea
              rows={3}
              value={userSpeechDraft}
              onChange={(e) => setUserSpeechDraft(e.target.value)}
              placeholder="Nhập dàn ý so sánh (On the one hand... On the other hand)..."
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border)',
                fontSize: '0.86rem',
                lineHeight: '1.45',
                fontFamily: 'inherit',
                background: 'var(--bg-main)',
                color: 'var(--text-main)',
                resize: 'vertical',
                outline: 'none'
              }}
            />
          </div>

          {/* Action Row */}
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={handleFinishPractice}
              className="btn btn-primary"
              style={{ flex: 1, padding: '0.65rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
            >
              <Check size={16} /> Hoàn thành & Xem bài mẫu
            </button>
            <button
              onClick={handleAiGrade}
              className="btn"
              style={{
                flex: 1,
                padding: '0.65rem',
                background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                color: '#fff',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <Sparkles size={16} /> AI Chấm Câu Này
            </button>
          </div>
        </div>

        {/* Right Card: Sample Answer & TTS */}
        <div className="listening-card-right">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={16} color="#a855f7" />
              <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)' }}>
                Bài Mẫu Chuẩn Band C (AI Voice)
              </span>
            </div>

            <button
              onClick={() => playTTS(getCurrentAnswer())}
              className={`btn btn-small ${isPlayingTTS ? 'btn-danger' : 'btn-outline'}`}
              style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '0.3rem 0.65rem', fontSize: '0.78rem' }}
            >
              {isPlayingTTS ? <VolumeX size={14} /> : <Volume2 size={14} />}
              <span>{isPlayingTTS ? 'Dừng đọc' : 'Phát âm AI'}</span>
            </button>
          </div>

          {showAnswer || isStudy ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem' }}>
              <div style={{
                background: 'rgba(168, 85, 247, 0.05)',
                border: '1px solid rgba(168, 85, 247, 0.25)',
                borderRadius: 'var(--radius-sm)',
                padding: '1rem'
              }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#a855f7', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                  Model Comparison Response (Band C):
                </div>
                <div style={{ fontSize: '0.92rem', color: 'var(--text-main)', lineHeight: '1.6', fontStyle: 'italic' }}>
                  "{getCurrentAnswer()}"
                </div>
              </div>

              {/* Linking words reminder */}
              <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0.85rem 1rem' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-main)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                  🎯 Từ nối tương phản ăn điểm:
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  <span style={{ fontSize: '0.78rem', padding: '3px 8px', borderRadius: '6px', background: 'rgba(168, 85, 247, 0.1)', color: '#a855f7', fontWeight: 600 }}>
                    ✦ Both photographs illustrate...
                  </span>
                  <span style={{ fontSize: '0.78rem', padding: '3px 8px', borderRadius: '6px', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', fontWeight: 600 }}>
                    ✦ On the one hand... On the other hand...
                  </span>
                  <span style={{ fontSize: '0.78rem', padding: '3px 8px', borderRadius: '6px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', fontWeight: 600 }}>
                    ✦ In stark contrast to...
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              padding: '2.5rem 1rem',
              color: 'var(--text-muted)',
              background: 'rgba(0,0,0,0.05)',
              borderRadius: 'var(--radius-sm)'
            }}>
              <Images size={36} color="#a855f7" style={{ opacity: 0.5, marginBottom: '0.75rem' }} />
              <p style={{ margin: 0, fontSize: '0.88rem' }}>
                Luyện nói so sánh 2 tranh và nhấn <strong>Xem câu trả lời</strong> để đối chiếu bài mẫu chuẩn Band C.
              </p>
              <button
                onClick={() => setShowAnswer(true)}
                className="btn btn-outline"
                style={{ marginTop: '1rem', fontSize: '0.82rem' }}
              >
                Xem câu trả lời ngay
              </button>
            </div>
          )}

          {/* Navigation Controls */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
            <button
              onClick={() => currentIndex > 0 && setCurrentIndex(prev => prev - 1)}
              disabled={currentIndex === 0}
              className="btn btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '0.45rem 0.85rem' }}
            >
              <ChevronLeft size={16} /> Đề trước
            </button>
            <span style={{ fontSize: '0.84rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              Đề {currentIndex + 1} / {speakingP3Data.length}
            </span>
            <button
              onClick={() => currentIndex < speakingP3Data.length - 1 && setCurrentIndex(prev => prev + 1)}
              disabled={currentIndex === speakingP3Data.length - 1}
              className="btn btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '0.45rem 0.85rem' }}
            >
              Đề sau <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* AI Evaluation Modal */}
      <AIEvaluationModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        evaluationResult={aiEvaluation}
        onApplyUpgraded={(text) => setUserSpeechDraft(text)}
      />

      {/* High-Score Template Learning Modal */}
      <TemplateLearningModal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        skill="speaking"
        partKey="part3"
        onApplyTemplate={handleApplyTemplate}
      />
    </div>
  );
};

export default SpeakingPart3;
