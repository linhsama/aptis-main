import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSettings } from '../../contexts/SettingsContext';
import Timer from '../Timer';
import {
  FileText,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  CheckCircle,
  Eye,
  EyeOff,
  Languages,
  BookOpen,
  Check,
  X,
  Sparkles,
  Zap,
  HelpCircle
} from 'lucide-react';
import writingData from '../../data/writing_sets.json';
import { translateToVietnamese } from '../../utils/translate';
import { evaluateResponse } from '../../utils/aiGrader';
import AIEvaluationModal from '../common/AIEvaluationModal';
import TemplateLearningModal from '../common/TemplateLearningModal';

function countWords(str) {
  if (!str) return 0;
  return str.trim().split(/\s+/).filter(Boolean).length;
}

const WritingPart1 = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const isStudy = searchParams.get('study') === 'true';

  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState(['', '', '', '', '']);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showSample, setShowSample] = useState(false);
  const [vietnameseTrans, setVietnameseTrans] = useState({});
  const [completedSets, setCompletedSets] = useState({});

  // AI & Template Modals
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiEvaluation, setAiEvaluation] = useState(null);
  const [activeQuestionForTemplate, setActiveQuestionForTemplate] = useState(0);

  const currentSet = writingData[currentIndex] || writingData[0];
  const questions = currentSet.part1 || [];

  // Load answers from localStorage
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('aptis_writing_p1_answers') || '{}');
      if (saved[currentSet.id]) {
        setUserAnswers(saved[currentSet.id]);
        setIsSubmitted(true);
      } else {
        setUserAnswers(['', '', '', '', '']);
        setIsSubmitted(false);
      }
      setShowSample(isStudy);
    } catch (e) {
      console.error(e);
    }
  }, [currentIndex, currentSet.id, isStudy]);

  // Load completed sets
  useEffect(() => {
    try {
      const history = JSON.parse(localStorage.getItem('aptis_writing_history') || '[]');
      const doneMap = {};
      history.filter(h => h.part === 'part-1').forEach(h => {
        doneMap[h.id] = true;
      });
      setCompletedSets(doneMap);
    } catch (e) {
      console.error(e);
    }
  }, [isSubmitted]);

  // Translate questions
  useEffect(() => {
    if (isSubmitted || isStudy) {
      questions.forEach((q, idx) => {
        if (!vietnameseTrans[`q_${idx}`]) {
          translateToVietnamese(q.question).then(res => {
            setVietnameseTrans(prev => ({ ...prev, [`q_${idx}`]: res }));
          });
        }
        if (!vietnameseTrans[`ans_${idx}`]) {
          translateToVietnamese(q.sample_answer).then(res => {
            setVietnameseTrans(prev => ({ ...prev, [`ans_${idx}`]: res }));
          });
        }
      });
    }
  }, [isSubmitted, isStudy, questions]);

  const handleInputChange = (idx, value) => {
    const newAnswers = [...userAnswers];
    newAnswers[idx] = value;
    setUserAnswers(newAnswers);
  };

  const handleSubmit = () => {
    setIsSubmitted(true);
    setShowSample(true);

    try {
      const saved = JSON.parse(localStorage.getItem('aptis_writing_p1_answers') || '{}');
      saved[currentSet.id] = userAnswers;
      localStorage.setItem('aptis_writing_p1_answers', JSON.stringify(saved));

      const history = JSON.parse(localStorage.getItem('aptis_writing_history') || '[]');
      const updated = history.filter(h => !(h.part === 'part-1' && h.id === currentSet.id));
      updated.push({
        id: currentSet.id,
        part: 'part-1',
        title: currentSet.club || currentSet.title,
        date: new Date().toISOString(),
        score: userAnswers.filter(a => countWords(a) >= 1 && countWords(a) <= 5).length / 5
      });
      localStorage.setItem('aptis_writing_history', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const handleReset = () => {
    setUserAnswers(['', '', '', '', '']);
    setIsSubmitted(false);
    setShowSample(false);
    try {
      const saved = JSON.parse(localStorage.getItem('aptis_writing_p1_answers') || '{}');
      delete saved[currentSet.id];
      localStorage.setItem('aptis_writing_p1_answers', JSON.stringify(saved));

      const history = JSON.parse(localStorage.getItem('aptis_writing_history') || '[]');
      const updated = history.filter(h => !(h.part === 'part-1' && h.id === currentSet.id));
      localStorage.setItem('aptis_writing_history', JSON.stringify(updated));

      setCompletedSets(prev => {
        const copy = { ...prev };
        delete copy[currentSet.id];
        return copy;
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleAiGrade = () => {
    const combinedText = userAnswers.filter(Boolean).join('. ');
    const combinedSample = questions.map(q => q.sample_answer).join('. ');

    const result = evaluateResponse({
      text: combinedText,
      skill: 'writing',
      part: 'part-1',
      minWords: 5,
      maxWords: 25,
      prompt: 'Part 1: 5 short questions (1-5 words each)',
      sampleAnswer: combinedSample
    });

    setAiEvaluation(result);
    setIsAiModalOpen(true);
  };

  const handleApplyTemplate = (scaffoldText) => {
    const updated = [...userAnswers];
    updated[activeQuestionForTemplate] = scaffoldText;
    setUserAnswers(updated);
  };

  return (
    <div className="practice-container">
      {/* 1. Header Card */}
      <div className="practice-top-card">
        <div className="practice-header-row">
          <div className="practice-title-group">
            <span className="practice-badge-skill" style={{ background: 'rgba(16, 185, 129, 0.12)', color: '#10b981' }}>
              <FileText size={14} /> Writing · Part 1
            </span>
            <div className="practice-topic-badge" title={currentSet.club}>
              <span>{currentSet.club || `Set ${currentSet.id}`}</span>
            </div>
            <div className="timer" style={{ color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Timer initialTime={180} />
            </div>
          </div>

          {/* Unified Action Buttons Toolbar */}
          <div className="practice-actions-toolbar">
            <button
              onClick={() => {
                setActiveQuestionForTemplate(0);
                setIsTemplateModalOpen(true);
              }}
              className="btn-action-pill btn-action-template"
              title="Học cấu trúc câu ngắn chuẩn & không rập khuôn"
            >
              <BookOpen size={13} />
              <span>Template Band C</span>
            </button>

            <button
              onClick={handleAiGrade}
              className="btn-action-pill btn-action-ai"
              title="AI Chấm & Đánh giá cả 5 câu"
            >
              <Sparkles size={13} />
              <span>AI Chấm</span>
            </button>

            <button
              onClick={() => setShowSample(!showSample)}
              className={`btn-action-pill btn-action-sample ${showSample ? 'active' : ''}`}
            >
              {showSample ? <EyeOff size={13} /> : <Eye size={13} />}
              <span>{showSample ? 'Ẩn bài mẫu' : 'Xem bài mẫu'}</span>
            </button>

            <button
              onClick={handleReset}
              className="btn-action-pill btn-action-reset"
              title="Xóa bài làm & luyện lại đề này"
            >
              <RotateCcw size={13} />
              <span>Reset</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Question Navigation Board */}
      <div className="question-board" style={{ margin: 0 }}>
        {writingData.map((item, idx) => {
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
              title={`Đề ${item.id}: ${item.club || item.title}`}
            >
              {item.id}
            </button>
          );
        })}
      </div>

      {/* 3. Main Split Layout */}
      <div className="listening-grid-2col">
        {/* Left Card: 5 Form Inputs */}
        <div className="listening-card-left">
          <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#10b981', textTransform: 'uppercase' }}>
              Form Filling (5 câu hỏi · 1 – 5 từ / câu)
            </span>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', margin: '0.2rem 0 0' }}>
              {currentSet.club}
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginTop: '0.5rem' }}>
            {questions.map((q, idx) => {
              const ans = userAnswers[idx] || '';
              const wCount = countWords(ans);
              const isGood = wCount >= 1 && wCount <= 5;
              const isTooLong = wCount > 5;

              return (
                <div
                  key={idx}
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.75rem 0.9rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.35rem'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.86rem', fontWeight: 600, color: 'var(--text-main)' }}>
                      {idx + 1}. {q.question}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <button
                        onClick={() => {
                          setActiveQuestionForTemplate(idx);
                          setIsTemplateModalOpen(true);
                        }}
                        style={{ background: 'none', border: 'none', color: '#10b981', fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '2px' }}
                      >
                        <Zap size={11} /> Gợi ý
                      </button>
                      <span style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        padding: '1px 5px',
                        borderRadius: '6px',
                        background: isGood ? 'rgba(16, 185, 129, 0.15)' : isTooLong ? 'rgba(239, 68, 68, 0.15)' : 'rgba(255,255,255,0.06)',
                        color: isGood ? 'var(--success)' : isTooLong ? 'var(--danger)' : 'var(--text-muted)'
                      }}>
                        {wCount}/5 từ
                      </span>
                    </div>
                  </div>

                  {vietnameseTrans[`q_${idx}`] && (
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Languages size={12} />
                      <span>{vietnameseTrans[`q_${idx}`]}</span>
                    </div>
                  )}

                  <input
                    type="text"
                    value={ans}
                    disabled={isSubmitted && !isStudy}
                    onChange={(e) => handleInputChange(idx, e.target.value)}
                    placeholder="Điền 1 - 5 từ..."
                    style={{
                      width: '100%',
                      padding: '0.5rem 0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      border: `1px solid ${isGood ? 'var(--success)' : isTooLong ? 'var(--danger)' : 'var(--border)'}`,
                      fontSize: '0.9rem',
                      background: isSubmitted && !isStudy ? 'rgba(0,0,0,0.1)' : 'var(--bg-main)',
                      color: 'var(--text-main)',
                      outline: 'none'
                    }}
                  />
                </div>
              );
            })}
          </div>

          {/* Action Row */}
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.75rem' }}>
            <button
              onClick={handleSubmit}
              disabled={userAnswers.every(a => !a.trim())}
              className="btn btn-primary"
              style={{ flex: 1, padding: '0.65rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
            >
              <Check size={16} /> Nộp bài & Đối chiếu
            </button>
            <button
              onClick={handleAiGrade}
              disabled={userAnswers.every(a => !a.trim())}
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
              <Sparkles size={16} /> AI Chấm 5 Câu
            </button>
          </div>
        </div>

        {/* Right Card: Sample Answers */}
        <div className="listening-card-right">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={16} color="#10b981" />
              <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)' }}>
                Câu Trả Lời Mẫu Chuẩn Band C
              </span>
            </div>
            <span style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              padding: '0.2rem 0.6rem',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(16, 185, 129, 0.12)',
              color: '#10b981'
            }}>
              Band C Model
            </span>
          </div>

          {showSample || isSubmitted || isStudy ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
              {questions.map((q, idx) => (
                <div
                  key={idx}
                  style={{
                    background: 'rgba(16, 185, 129, 0.05)',
                    border: '1px solid rgba(16, 185, 129, 0.2)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.75rem 0.9rem'
                  }}
                >
                  <div style={{ fontSize: '0.76rem', fontWeight: 700, color: '#10b981', textTransform: 'uppercase', marginBottom: '0.2rem' }}>
                    Câu {idx + 1} - Sample Answer:
                  </div>
                  <div style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-main)' }}>
                    "{q.sample_answer}"
                  </div>
                  {vietnameseTrans[`ans_${idx}`] && (
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic', marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Languages size={12} />
                      <span>{vietnameseTrans[`ans_${idx}`]}</span>
                    </div>
                  )}
                </div>
              ))}
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
              <FileText size={36} color="#10b981" style={{ opacity: 0.5, marginBottom: '0.75rem' }} />
              <p style={{ margin: 0, fontSize: '0.88rem' }}>
                Điền câu trả lời cho cả 5 câu và nhấn <strong>Nộp bài</strong> hoặc <strong>AI Chấm</strong> để xem đối chiếu.
              </p>
              <button
                onClick={() => setShowSample(true)}
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
              Đề {currentIndex + 1} / {writingData.length}
            </span>
            <button
              onClick={() => currentIndex < writingData.length - 1 && setCurrentIndex(prev => prev + 1)}
              disabled={currentIndex === writingData.length - 1}
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
        onApplyUpgraded={(text) => {
          // split
        }}
      />

      {/* High-Score Template Learning Modal */}
      <TemplateLearningModal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        skill="writing"
        partKey="part1"
        onApplyTemplate={handleApplyTemplate}
      />
    </div>
  );
};

export default WritingPart1;
