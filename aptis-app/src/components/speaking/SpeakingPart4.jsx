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
  Clock,
  Radio,
  HelpCircle,
  Check,
  Zap
} from 'lucide-react';
import speakingP4Data from '../../data/speaking_part4.json';
import { translateToVietnamese } from '../../utils/translate';
import { evaluateResponse } from '../../utils/aiGrader';
import AIEvaluationModal from '../common/AIEvaluationModal';
import TemplateLearningModal from '../common/TemplateLearningModal';

const SpeakingPart4 = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const isStudy = searchParams.get('study') === 'true';

  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isPlayingTTS, setIsPlayingTTS] = useState(false);
  const [stage, setStage] = useState('idle'); // 'idle' | 'prep' (60s) | 'speak' (120s) | 'done'
  const [prepSeconds, setPrepSeconds] = useState(60);
  const [speakSeconds, setSpeakSeconds] = useState(120);
  const [userSpeechDraft, setUserSpeechDraft] = useState('');
  const [completedSets, setCompletedSets] = useState({});

  // AI & Template Modals
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiEvaluation, setAiEvaluation] = useState(null);

  const currentQ = speakingP4Data[currentIndex] || speakingP4Data[0];

  useEffect(() => {
    setShowAnswer(isStudy);
    setIsPlayingTTS(false);
    setStage('idle');
    setPrepSeconds(60);
    setSpeakSeconds(120);
    setUserSpeechDraft('');
    window.speechSynthesis?.cancel();
  }, [currentIndex, isStudy]);

  useEffect(() => {
    try {
      const history = JSON.parse(localStorage.getItem('aptis_speaking_history') || '[]');
      const doneMap = {};
      history.filter(h => h.part === 'part-4').forEach(h => {
        doneMap[h.id] = true;
      });
      setCompletedSets(doneMap);
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Prep & Speaking timer
  useEffect(() => {
    let timer = null;
    if (stage === 'prep') {
      if (prepSeconds > 0) {
        timer = setInterval(() => setPrepSeconds(prev => prev - 1), 1000);
      } else {
        setStage('speak');
        setSpeakSeconds(120);
      }
    } else if (stage === 'speak') {
      if (speakSeconds > 0) {
        timer = setInterval(() => setSpeakSeconds(prev => prev - 1), 1000);
      } else {
        setStage('done');
        handleFinishPractice();
      }
    }
    return () => clearInterval(timer);
  }, [stage, prepSeconds, speakSeconds]);

  const startExamSimulation = () => {
    setStage('prep');
    setPrepSeconds(60);
    setSpeakSeconds(120);
  };

  const skipToSpeaking = () => {
    setStage('speak');
    setSpeakSeconds(120);
  };

  const finishSpeaking = () => {
    setStage('done');
    handleFinishPractice();
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
      const filtered = history.filter(h => !(h.part === 'part-4' && h.id === currentIndex));
      filtered.push({
        part: 'part-4',
        id: currentIndex,
        title: currentQ.topic || `Chủ đề ${currentIndex + 1}`,
        date: new Date().toISOString()
      });
      localStorage.setItem('aptis_speaking_history', JSON.stringify(filtered));
      setCompletedSets(prev => ({ ...prev, [currentIndex]: true }));
    } catch (e) {
      console.error(e);
    }
  };

  const handleReset = () => {
    setShowAnswer(false);
    setStage('idle');
    setPrepSeconds(60);
    setSpeakSeconds(120);
    setUserSpeechDraft('');
    window.speechSynthesis?.cancel();
    setIsPlayingTTS(false);

    try {
      const history = JSON.parse(localStorage.getItem('aptis_speaking_history') || '[]');
      const filtered = history.filter(h => !(h.part === 'part-4' && h.id === currentIndex));
      localStorage.setItem('aptis_speaking_history', JSON.stringify(filtered));
      setCompletedSets(prev => {
        const copy = { ...prev };
        delete copy[currentIndex];
        return copy;
      });
    } catch (e) {
      console.error(e);
    }
  };

  const getFullSampleText = () => {
    return currentQ.sample_full || `${currentQ.a1 || ''} ${currentQ.a2 || ''} ${currentQ.a3 || ''}`.trim();
  };

  const handleAiGrade = () => {
    const textToEvaluate = userSpeechDraft.trim() || getFullSampleText();
    const result = evaluateResponse({
      text: textToEvaluate,
      skill: 'speaking',
      part: 'part-4',
      minWords: 120,
      maxWords: 220,
      prompt: currentQ.prompt || currentQ.topic || 'Part 4 2-minute personal presentation',
      sampleAnswer: getFullSampleText()
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
            <span className="practice-badge-skill" style={{ background: 'rgba(234, 179, 8, 0.12)', color: '#eab308' }}>
              <Radio size={14} /> Speaking · Part 4
            </span>
            <div className="practice-topic-badge">
              <span>Chủ đề {currentIndex + 1} / {speakingP4Data.length}: Thuyết trình 2 phút</span>
            </div>
            <div className="timer" style={{ color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Timer initialTime={600} />
            </div>
          </div>

          {/* Unified Action Buttons Toolbar */}
          <div className="practice-actions-toolbar">
            <button
              onClick={() => setIsTemplateModalOpen(true)}
              className="btn-action-pill btn-action-template"
              title="Học khung kể chuyện & thuyết trình Band C"
            >
              <BookOpen size={13} />
              <span>Template Band C</span>
            </button>

            <button
              onClick={handleAiGrade}
              className="btn-action-pill btn-action-ai"
              title="AI Chấm & Đánh giá bài nói 2 phút"
            >
              <Sparkles size={13} />
              <span>AI Chấm</span>
            </button>

            <button
              onClick={() => setShowAnswer(!showAnswer)}
              className={`btn-action-pill btn-action-sample ${showAnswer ? 'active' : ''}`}
            >
              {showAnswer ? <EyeOff size={13} /> : <Eye size={13} />}
              <span>{showAnswer ? 'Ẩn câu trả lời' : 'Xem bài mẫu'}</span>
            </button>

            <button
              onClick={handleReset}
              className="btn-action-pill btn-action-reset"
              title="Xóa & Luyện lại chủ đề này"
            >
              <RotateCcw size={13} />
              <span>Reset</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Question Navigation Board */}
      <div className="question-board" style={{ margin: 0 }}>
        {speakingP4Data.map((item, idx) => {
          const isDone = completedSets[idx];
          const isCurrent = idx === currentIndex;
          let cls = 'unattempted';
          if (isDone) cls = 'correct';
          if (isCurrent) cls += ' current';

          return (
            <button
              key={idx}
              className={`q-nav-btn ${cls}`}
              onClick={() => setCurrentIndex(idx)}
              title={`Chủ đề ${idx + 1}: ${item.topic || ''}`}
            >
              {idx + 1}
            </button>
          );
        })}
      </div>

      {/* 3. Main Split Layout */}
      <div className="listening-grid-2col">
        {/* Left Card: Topic & Exam Flow Simulation */}
        <div className="listening-card-left">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#eab308', textTransform: 'uppercase' }}>
              Long Turn Presentation (1m chuẩn bị + 2m nói)
            </span>
            <span style={{ fontSize: '0.75rem', padding: '0.15rem 0.5rem', borderRadius: '4px', background: 'rgba(234, 179, 8, 0.12)', color: '#eab308', fontWeight: 700 }}>
              Chuẩn 3 câu hỏi
            </span>
          </div>

          {/* Topic Question Card */}
          <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border)', borderLeft: '4px solid #eab308', borderRadius: 'var(--radius-sm)', padding: '0.85rem 1rem' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#eab308', textTransform: 'uppercase', marginBottom: '0.3rem' }}>
              Yêu cầu đề bài:
            </div>
            <div style={{ fontSize: '0.96rem', fontWeight: 700, color: 'var(--text-main)', lineHeight: '1.45', marginBottom: '0.5rem' }}>
              {currentQ.prompt || currentQ.topic}
            </div>

            {/* 3 Sub questions */}
            {currentQ.questions && currentQ.questions.length > 0 && (
              <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.88rem', color: 'var(--text-main)', lineHeight: '1.6' }}>
                {currentQ.questions.map((subQ, qIdx) => (
                  <li key={qIdx}>{subQ}</li>
                ))}
              </ul>
            )}
          </div>

          {/* Exam Flow Simulator (Idle / Prep 60s / Speak 120s) */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(234, 179, 8, 0.06) 0%, rgba(99, 102, 241, 0.06) 100%)',
            border: '1px solid rgba(234, 179, 8, 0.25)',
            borderRadius: 'var(--radius-sm)',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.85rem',
            marginTop: '0.5rem'
          }}>
            {stage === 'idle' && (
              <div style={{ textAlign: 'center' }}>
                <Clock size={40} color="#eab308" style={{ marginBottom: '0.5rem' }} />
                <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  Mô phỏng phòng thi Aptis Part 4
                </div>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '0.35rem 0 1rem' }}>
                  Bạn sẽ có <strong>1 phút (60s)</strong> chuẩn bị dàn ý và <strong>2 phút (120s)</strong> nói liên tục.
                </p>
                <button
                  onClick={startExamSimulation}
                  className="btn"
                  style={{
                    background: 'linear-gradient(135deg, #eab308, #ca8a04)',
                    color: '#fff',
                    border: 'none',
                    padding: '0.65rem 1.75rem',
                    borderRadius: 'var(--radius-full)',
                    fontWeight: 700,
                    boxShadow: '0 4px 12px rgba(234, 179, 8, 0.35)'
                  }}
                >
                  <Play size={16} /> Bắt đầu mô phỏng (3 phút)
                </button>
              </div>
            )}

            {stage === 'prep' && (
              <div style={{ textAlign: 'center', width: '100%' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#eab308', textTransform: 'uppercase' }}>
                  Thời gian chuẩn bị ghi chú (Note-taking)
                </div>
                <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#eab308', margin: '0.25rem 0' }}>
                  {prepSeconds}s
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                  <button onClick={skipToSpeaking} className="btn btn-small btn-primary">
                    Bắt đầu nói ngay (Bỏ qua chuẩn bị)
                  </button>
                </div>
              </div>
            )}

            {stage === 'speak' && (
              <div style={{ textAlign: 'center', width: '100%' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#ef4444', textTransform: 'uppercase' }}>
                  Đang ghi âm bài thuyết trình (2 phút)
                </div>
                <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#ef4444', margin: '0.25rem 0', animation: 'pulse 1s infinite' }}>
                  {Math.floor(speakSeconds / 60)}:{(speakSeconds % 60).toString().padStart(2, '0')}
                </div>
                <button onClick={finishSpeaking} className="btn btn-danger" style={{ padding: '0.55rem 1.5rem', borderRadius: 'var(--radius-full)' }}>
                  <Square size={16} fill="#fff" /> Hoàn thành bài nói
                </button>
              </div>
            )}

            {stage === 'done' && (
              <div style={{ textAlign: 'center' }}>
                <CheckCircle size={36} color="var(--success)" style={{ marginBottom: '0.4rem' }} />
                <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>Đã hoàn thành lượt nói!</div>
              </div>
            )}
          </div>

          {/* Self-practice script / draft notes */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginTop: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Ghi chú dàn ý 3 câu hỏi (Luyện viết trước khi nói):
              </label>
              <button
                onClick={() => setIsTemplateModalOpen(true)}
                style={{ background: 'none', border: 'none', color: '#eab308', fontSize: '0.74rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}
              >
                <Zap size={12} /> Gợi ý dàn ý kể chuyện
              </button>
            </div>
            <textarea
              rows={4}
              value={userSpeechDraft}
              onChange={(e) => setUserSpeechDraft(e.target.value)}
              placeholder="Ghi chú các từ khóa: Q1 (Trải nghiệm quá khứ) -> Q2 (Cảm xúc) -> Q3 (Bài học)..."
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
              <Sparkles size={16} /> AI Chấm Bài Nói 2 Phút
            </button>
          </div>
        </div>

        {/* Right Card: Sample Answers & TTS */}
        <div className="listening-card-right">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={16} color="#eab308" />
              <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)' }}>
                Bài Mẫu Chuẩn Band C (AI Voice)
              </span>
            </div>

            <button
              onClick={() => playTTS(getFullSampleText())}
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
                background: 'rgba(234, 179, 8, 0.05)',
                border: '1px solid rgba(234, 179, 8, 0.25)',
                borderRadius: 'var(--radius-sm)',
                padding: '1rem'
              }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#eab308', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                  Full 2-Minute Presentation Model:
                </div>
                <div style={{ fontSize: '0.92rem', color: 'var(--text-main)', lineHeight: '1.6', fontStyle: 'italic', whiteSpace: 'pre-line' }}>
                  "{getFullSampleText()}"
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
              <Radio size={36} color="#eab308" style={{ opacity: 0.5, marginBottom: '0.75rem' }} />
              <p style={{ margin: 0, fontSize: '0.88rem' }}>
                Thực hiện bài thuyết trình 2 phút và nhấn <strong>Xem câu trả lời</strong> để đối chiếu bài mẫu Band C.
              </p>
              <button
                onClick={() => setShowAnswer(true)}
                className="btn btn-outline"
                style={{ marginTop: '1rem', fontSize: '0.82rem' }}
              >
                Xem bài mẫu ngay
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
              Đề {currentIndex + 1} / {speakingP4Data.length}
            </span>
            <button
              onClick={() => currentIndex < speakingP4Data.length - 1 && setCurrentIndex(prev => prev + 1)}
              disabled={currentIndex === speakingP4Data.length - 1}
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
        partKey="part4"
        onApplyTemplate={handleApplyTemplate}
      />
    </div>
  );
};

export default SpeakingPart4;
