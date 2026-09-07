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
  Radio,
  Check,
  Award,
  Zap,
  HelpCircle
} from 'lucide-react';
import speakingP1Data from '../../data/speaking_part1.json';
import { translateToVietnamese } from '../../utils/translate';
import { evaluateResponse } from '../../utils/aiGrader';
import AIEvaluationModal from '../common/AIEvaluationModal';
import TemplateLearningModal from '../common/TemplateLearningModal';

const SpeakingPart1 = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const isStudy = searchParams.get('study') === 'true';

  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [activeAnswerTab, setActiveAnswerTab] = useState('ans1'); // 'ans1' | 'ans2'
  const [isPlayingTTS, setIsPlayingTTS] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(30);
  const [userSpeechDraft, setUserSpeechDraft] = useState('');
  const [completedQuestions, setCompletedQuestions] = useState({});
  const [vietnameseTrans, setVietnameseTrans] = useState({});

  // AI & Template Modals
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiEvaluation, setAiEvaluation] = useState(null);

  const currentQ = speakingP1Data[currentIndex] || speakingP1Data[0];

  useEffect(() => {
    setShowAnswer(isStudy);
    setIsPlayingTTS(false);
    setIsRecording(false);
    setRecordSeconds(30);
    setUserSpeechDraft('');
    window.speechSynthesis?.cancel();
  }, [currentIndex, isStudy]);

  useEffect(() => {
    try {
      const history = JSON.parse(localStorage.getItem('aptis_speaking_history') || '[]');
      const doneMap = {};
      history.filter(h => h.part === 'part-1').forEach(h => {
        doneMap[h.id] = true;
      });
      setCompletedQuestions(doneMap);
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Translation
  useEffect(() => {
    if (showAnswer || isStudy) {
      if (!vietnameseTrans[`p1_q_${currentIndex}`] && currentQ.question) {
        translateToVietnamese(currentQ.question).then(res => {
          setVietnameseTrans(prev => ({ ...prev, [`p1_q_${currentIndex}`]: res }));
        });
      }
      if (!vietnameseTrans[`p1_ans1_${currentIndex}`] && currentQ.answer1) {
        translateToVietnamese(currentQ.answer1).then(res => {
          setVietnameseTrans(prev => ({ ...prev, [`p1_ans1_${currentIndex}`]: res }));
        });
      }
      if (!vietnameseTrans[`p1_ans2_${currentIndex}`] && currentQ.answer2) {
        translateToVietnamese(currentQ.answer2).then(res => {
          setVietnameseTrans(prev => ({ ...prev, [`p1_ans2_${currentIndex}`]: res }));
        });
      }
    }
  }, [showAnswer, isStudy, currentIndex, currentQ]);

  // Recording countdown
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
      setRecordSeconds(30);
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
      const updated = history.filter(h => !(h.part === 'part-1' && h.id === currentQ.id));
      updated.push({
        id: currentQ.id,
        part: 'part-1',
        title: currentQ.question,
        date: new Date().toISOString(),
        score: 1
      });
      localStorage.setItem('aptis_speaking_history', JSON.stringify(updated));
      setCompletedQuestions(prev => ({ ...prev, [currentQ.id]: true }));
    } catch (e) {
      console.error(e);
    }
  };

  const handleReset = () => {
    setShowAnswer(false);
    setIsRecording(false);
    setRecordSeconds(30);
    setUserSpeechDraft('');
    window.speechSynthesis?.cancel();
    setIsPlayingTTS(false);

    try {
      const history = JSON.parse(localStorage.getItem('aptis_speaking_history') || '[]');
      const updated = history.filter(h => !(h.part === 'part-1' && h.id === currentQ.id));
      localStorage.setItem('aptis_speaking_history', JSON.stringify(updated));
      setCompletedQuestions(prev => {
        const copy = { ...prev };
        delete copy[currentQ.id];
        return copy;
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleAiGrade = () => {
    const textToEvaluate = userSpeechDraft.trim() || currentQ.answer2 || currentQ.answer1;
    const result = evaluateResponse({
      text: textToEvaluate,
      skill: 'speaking',
      part: 'part-1',
      minWords: 35,
      maxWords: 75,
      prompt: currentQ.question,
      sampleAnswer: currentQ.answer2 || currentQ.answer1
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
            <span className="practice-badge-skill" style={{ background: 'rgba(244, 63, 94, 0.12)', color: '#f43f5e' }}>
              <Mic size={14} /> Speaking · Part 1
            </span>
            <div className="practice-topic-badge" title="Personal Information">
              <span>Personal Questions (30s)</span>
            </div>
            <div className="timer" style={{ color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Timer initialTime={300} />
            </div>
          </div>

          {/* Unified Action Buttons Toolbar */}
          <div className="practice-actions-toolbar">
            <button
              onClick={() => setIsTemplateModalOpen(true)}
              className="btn-action-pill btn-action-template"
              title="Học cấu trúc & khung trả lời tự nhiên Band C"
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
              onClick={handleReset}
              className="btn-action-pill btn-action-reset"
              title="Xóa & Luyện lại câu này"
            >
              <RotateCcw size={13} />
              <span>Reset</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Question Navigation Board */}
      <div className="question-board" style={{ margin: 0 }}>
        {speakingP1Data.map((item, idx) => {
          const isDone = completedQuestions[item.id];
          const isCurrent = idx === currentIndex;
          let cls = 'unattempted';
          if (isDone) cls = 'correct';
          if (isCurrent) cls += ' current';

          return (
            <button
              key={item.id}
              className={`q-nav-btn ${cls}`}
              onClick={() => setCurrentIndex(idx)}
              title={`Câu ${item.id}: ${item.question}`}
            >
              {item.id}
            </button>
          );
        })}
      </div>

      {/* 3. Main Split Layout */}
      <div className="listening-grid-2col">
        {/* Left Card: Question & Speaking Simulator */}
        <div className="listening-card-left">
          <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#f43f5e', textTransform: 'uppercase' }}>
              Speaking Question {currentIndex + 1} / {speakingP1Data.length} (30s)
            </span>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', margin: '0.35rem 0 0', lineHeight: '1.4' }}>
              "{currentQ.question}"
            </h3>
            {vietnameseTrans[`p1_q_${currentIndex}`] && (
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic', marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Languages size={13} />
                <span>{vietnameseTrans[`p1_q_${currentIndex}`]}</span>
              </div>
            )}
          </div>

          {/* Practice Recording & Timer Box */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(244, 63, 94, 0.06) 0%, rgba(99, 102, 241, 0.06) 100%)',
            border: '1px solid rgba(244, 63, 94, 0.2)',
            borderRadius: 'var(--radius-sm)',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem',
            marginTop: '0.5rem'
          }}>
            {/* Circular Timer Ring */}
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              border: `4px solid ${isRecording ? '#f43f5e' : 'var(--border)'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
              fontWeight: 900,
              color: isRecording ? '#f43f5e' : 'var(--text-main)'
            }}>
              {recordSeconds}s
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-main)', marginBottom: '0.2rem' }}>
                {isRecording ? 'Đang ghi âm câu trả lời...' : 'Nhấn nút Mic để bắt đầu nói (30s)'}
              </div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Nói liên tục, tự nhiên, áp dụng công thức [Trả lời] + [Lý do] + [Ví dụ]
              </span>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={toggleRecording}
                className="btn"
                style={{
                  background: isRecording ? '#ef4444' : 'linear-gradient(135deg, #f43f5e, #e11d48)',
                  color: '#fff',
                  border: 'none',
                  padding: '0.65rem 1.75rem',
                  borderRadius: 'var(--radius-full)',
                  fontWeight: 700,
                  fontSize: '0.92rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 12px rgba(244, 63, 94, 0.35)'
                }}
              >
                {isRecording ? <Square size={16} fill="#fff" /> : <Mic size={16} />}
                <span>{isRecording ? 'Dừng & Chấm bài' : 'Bắt đầu nói (30s)'}</span>
              </button>
            </div>
          </div>

          {/* Self-practice script / draft notes */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Ghi chú ý tưởng / Luyện viết trước khi nói:
              </label>
              <button
                onClick={() => setIsTemplateModalOpen(true)}
                style={{ background: 'none', border: 'none', color: '#f43f5e', fontSize: '0.76rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}
              >
                <Zap size={12} /> Gợi ý cấu trúc tự nhiên
              </button>
            </div>
            <textarea
              rows={3}
              value={userSpeechDraft}
              onChange={(e) => setUserSpeechDraft(e.target.value)}
              placeholder="Nhập dàn ý hoặc câu trả lời tự chuẩn bị để AI phân tích..."
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border)',
                fontSize: '0.88rem',
                lineHeight: '1.5',
                fontFamily: 'inherit',
                background: 'var(--bg-main)',
                color: 'var(--text-main)',
                resize: 'vertical',
                outline: 'none'
              }}
            />
          </div>

          {/* Action Row */}
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
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
              <Sparkles size={16} /> AI Chấm Câu Trả Lời
            </button>
          </div>
        </div>

        {/* Right Card: Sample Answers & AI Voice TTS */}
        <div className="listening-card-right">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                onClick={() => setActiveAnswerTab('ans1')}
                className={`btn btn-small ${activeAnswerTab === 'ans1' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.78rem', padding: '0.3rem 0.65rem' }}
              >
                Mẫu 1 (Band B1/B2)
              </button>
              <button
                onClick={() => setActiveAnswerTab('ans2')}
                className={`btn btn-small ${activeAnswerTab === 'ans2' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.78rem', padding: '0.3rem 0.65rem' }}
              >
                Mẫu 2 (Band B2/C)
              </button>
            </div>

            <button
              onClick={() => playTTS(activeAnswerTab === 'ans1' ? currentQ.answer1 : currentQ.answer2)}
              className={`btn btn-small ${isPlayingTTS ? 'btn-danger' : 'btn-outline'}`}
              style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '0.3rem 0.65rem', fontSize: '0.78rem' }}
            >
              {isPlayingTTS ? <VolumeX size={14} /> : <Volume2 size={14} />}
              <span>{isPlayingTTS ? 'Dừng đọc' : 'Phát âm AI Voice'}</span>
            </button>
          </div>

          {showAnswer || isStudy ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem' }}>
              <div style={{
                background: activeAnswerTab === 'ans2' ? 'rgba(16, 185, 129, 0.06)' : 'rgba(59, 130, 246, 0.06)',
                border: `1px solid ${activeAnswerTab === 'ans2' ? 'rgba(16, 185, 129, 0.25)' : 'rgba(59, 130, 246, 0.25)'}`,
                borderRadius: 'var(--radius-sm)',
                padding: '1rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    color: activeAnswerTab === 'ans2' ? '#10b981' : '#3b82f6'
                  }}>
                    {activeAnswerTab === 'ans2' ? '🌟 Band B2/C High Score Model' : '🔹 Band B1/B2 Natural Model'}
                  </span>
                </div>

                <div style={{ fontSize: '0.94rem', color: 'var(--text-main)', lineHeight: '1.6', fontStyle: 'italic' }}>
                  "{activeAnswerTab === 'ans1' ? currentQ.answer1 : currentQ.answer2}"
                </div>

                {vietnameseTrans[activeAnswerTab === 'ans1' ? `p1_ans1_${currentIndex}` : `p1_ans2_${currentIndex}`] && (
                  <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginTop: '0.75rem', paddingTop: '0.5rem', borderTop: '1px dashed var(--border)', display: 'flex', alignItems: 'flex-start', gap: '4px' }}>
                    <Languages size={13} style={{ marginTop: '2px', flexShrink: 0 }} />
                    <span>{vietnameseTrans[activeAnswerTab === 'ans1' ? `p1_ans1_${currentIndex}` : `p1_ans2_${currentIndex}`]}</span>
                  </div>
                )}
              </div>

              {/* Collocation tips */}
              <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0.85rem 1rem' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-main)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                  🎯 Cấu trúc & Từ nối phản xạ nhanh:
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  <span style={{ fontSize: '0.78rem', padding: '3px 8px', borderRadius: '6px', background: 'rgba(244, 63, 94, 0.1)', color: '#f43f5e', fontWeight: 600 }}>
                    ✦ Well, to be honest,...
                  </span>
                  <span style={{ fontSize: '0.78rem', padding: '3px 8px', borderRadius: '6px', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', fontWeight: 600 }}>
                    ✦ The main reason is that...
                  </span>
                  <span style={{ fontSize: '0.78rem', padding: '3px 8px', borderRadius: '6px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', fontWeight: 600 }}>
                    ✦ It always makes me feel relaxed.
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
              <Mic size={36} color="#f43f5e" style={{ opacity: 0.5, marginBottom: '0.75rem' }} />
              <p style={{ margin: 0, fontSize: '0.88rem' }}>
                Nhấn <strong>Bắt đầu nói</strong> hoặc <strong>Xem câu trả lời</strong> để nghe bài mẫu chuẩn bản xứ và AI chấm điểm.
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
              <ChevronLeft size={16} /> Câu trước
            </button>
            <span style={{ fontSize: '0.84rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              Câu {currentIndex + 1} / {speakingP1Data.length}
            </span>
            <button
              onClick={() => currentIndex < speakingP1Data.length - 1 && setCurrentIndex(prev => prev + 1)}
              disabled={currentIndex === speakingP1Data.length - 1}
              className="btn btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '0.45rem 0.85rem' }}
            >
              Câu sau <ChevronRight size={16} />
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
        partKey="part1"
        onApplyTemplate={handleApplyTemplate}
      />
    </div>
  );
};

export default SpeakingPart1;
