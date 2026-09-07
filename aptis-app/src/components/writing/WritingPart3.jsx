import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSettings } from '../../contexts/SettingsContext';
import Timer from '../Timer';
import {
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  CheckCircle,
  Eye,
  EyeOff,
  Languages,
  BookOpen,
  Check,
  Sparkles,
  Users,
  Send,
  AlertTriangle,
  Zap
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

const WritingPart3 = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const isStudy = searchParams.get('study') === 'true';

  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState(['', '', '']);
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
  const questions = currentSet.part3 || [];

  const chatMembers = ['Alex', 'Sarah', 'Michael'];

  // Load saved answers
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('aptis_writing_p3_answers') || '{}');
      if (saved[currentSet.id]) {
        setUserAnswers(saved[currentSet.id]);
        setIsSubmitted(true);
      } else {
        setUserAnswers(['', '', '']);
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
      history.filter(h => h.part === 'part-3').forEach(h => {
        doneMap[h.id] = true;
      });
      setCompletedSets(doneMap);
    } catch (e) {
      console.error(e);
    }
  }, [isSubmitted]);

  // Translation
  useEffect(() => {
    if (isSubmitted || isStudy) {
      questions.forEach((qItem, idx) => {
        if (!vietnameseTrans[`p3_q_${idx}`] && qItem.question) {
          translateToVietnamese(qItem.question).then(res => {
            setVietnameseTrans(prev => ({ ...prev, [`p3_q_${idx}`]: res }));
          });
        }
        if (!vietnameseTrans[`p3_ans_${idx}`] && qItem.sample_answer) {
          translateToVietnamese(qItem.sample_answer).then(res => {
            setVietnameseTrans(prev => ({ ...prev, [`p3_ans_${idx}`]: res }));
          });
        }
      });
    }
  }, [isSubmitted, isStudy, questions]);

  const handleInputChange = (idx, value) => {
    const updated = [...userAnswers];
    updated[idx] = value;
    setUserAnswers(updated);
  };

  const handleSubmit = () => {
    setIsSubmitted(true);
    setShowSample(true);

    try {
      const saved = JSON.parse(localStorage.getItem('aptis_writing_p3_answers') || '{}');
      saved[currentSet.id] = userAnswers;
      localStorage.setItem('aptis_writing_p3_answers', JSON.stringify(saved));

      const history = JSON.parse(localStorage.getItem('aptis_writing_history') || '[]');
      const updated = history.filter(h => !(h.part === 'part-3' && h.id === currentSet.id));
      updated.push({
        id: currentSet.id,
        part: 'part-3',
        title: currentSet.club || currentSet.title,
        date: new Date().toISOString(),
        score: userAnswers.every(ans => countWords(ans) >= 30 && countWords(ans) <= 45) ? 1 : 0.7
      });
      localStorage.setItem('aptis_writing_history', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const handleReset = () => {
    setUserAnswers(['', '', '']);
    setIsSubmitted(false);
    setShowSample(false);
    try {
      const saved = JSON.parse(localStorage.getItem('aptis_writing_p3_answers') || '{}');
      delete saved[currentSet.id];
      localStorage.setItem('aptis_writing_p3_answers', JSON.stringify(saved));

      const history = JSON.parse(localStorage.getItem('aptis_writing_history') || '[]');
      const updated = history.filter(h => !(h.part === 'part-3' && h.id === currentSet.id));
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
    const combinedText = userAnswers.filter(Boolean).join('\n\n');
    const combinedSample = questions.map((q, i) => `${chatMembers[i]}: ${q.sample_answer}`).join('\n\n');

    const result = evaluateResponse({
      text: combinedText,
      skill: 'writing',
      part: 'part-3',
      minWords: 90,
      maxWords: 130,
      prompt: 'Social Club Chat with 3 members (30-40 words each)',
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
      {/* 1. Top Card */}
      <div className="practice-top-card">
        <div className="practice-header-row">
          <div className="practice-title-group">
            <span className="practice-badge-skill" style={{ background: 'rgba(139, 92, 246, 0.12)', color: '#8b5cf6' }}>
              <MessageSquare size={14} /> Writing · Part 3
            </span>
            <div className="practice-topic-badge" title={currentSet.club}>
              <Users size={14} />
              <span>{currentSet.club || `Set ${currentSet.id}`}</span>
            </div>
            <div className="timer" style={{ color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Timer initialTime={600} />
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
              title="Học cấu trúc thảo luận nhóm Band C"
            >
              <BookOpen size={13} />
              <span>Template Band C</span>
            </button>

            <button
              onClick={handleAiGrade}
              className="btn-action-pill btn-action-ai"
              title="AI Chấm & Đánh giá cả 3 câu trả lời"
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
        {/* Left Card: 3 Chat Questions & Inputs */}
        <div className="listening-card-left">
          <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#8b5cf6', textTransform: 'uppercase' }}>
              Social Club Chat (3 câu hỏi · 30 – 40 từ / câu)
            </span>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', margin: '0.2rem 0 0' }}>
              Diễn đàn CLB: {currentSet.club}
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '0.5rem' }}>
            {questions.map((qItem, qIdx) => {
              const text = userAnswers[qIdx] || '';
              const wCount = countWords(text);
              const isGood = wCount >= 30 && wCount <= 40;
              const isShort = wCount > 0 && wCount < 30;
              const isLong = wCount > 45;
              const memberName = chatMembers[qIdx] || `Member ${qIdx + 1}`;

              return (
                <div
                  key={qIdx}
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.85rem 1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem'
                  }}
                >
                  {/* Chat message header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        background: 'rgba(139, 92, 246, 0.2)',
                        color: '#8b5cf6',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.75rem',
                        fontWeight: 700
                      }}>
                        {memberName[0]}
                      </div>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>
                        {memberName}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button
                        onClick={() => {
                          setActiveQuestionForTemplate(qIdx);
                          setIsTemplateModalOpen(true);
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#8b5cf6',
                          fontSize: '0.74rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '3px'
                        }}
                      >
                        <Zap size={12} /> Gợi ý trả lời
                      </button>
                      <span style={{
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        padding: '1px 6px',
                        borderRadius: '10px',
                        background: isGood ? 'rgba(16, 185, 129, 0.15)' : isLong ? 'rgba(239, 68, 68, 0.15)' : 'rgba(139, 92, 246, 0.1)',
                        color: isGood ? 'var(--success)' : isLong ? 'var(--danger)' : '#8b5cf6'
                      }}>
                        {wCount} / 30–40 từ
                      </span>
                    </div>
                  </div>

                  {/* Question Bubble */}
                  <div style={{
                    background: 'rgba(139, 92, 246, 0.06)',
                    borderLeft: '3px solid #8b5cf6',
                    padding: '0.6rem 0.85rem',
                    borderRadius: '0 8px 8px 0',
                    fontSize: '0.92rem',
                    fontWeight: 600,
                    color: 'var(--text-main)',
                    lineHeight: '1.45'
                  }}>
                    "{qItem.question}"
                    {vietnameseTrans[`p3_q_${qIdx}`] && (
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Languages size={12} />
                        <span>{vietnameseTrans[`p3_q_${qIdx}`]}</span>
                      </div>
                    )}
                  </div>

                  {/* Answer Input */}
                  <textarea
                    rows={3}
                    value={text}
                    disabled={isSubmitted && !isStudy}
                    onChange={(e) => handleInputChange(qIdx, e.target.value)}
                    placeholder={`Trả lời ${memberName} (30 - 40 từ)...`}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: 'var(--radius-sm)',
                      border: `1px solid ${isGood ? 'var(--success)' : isLong ? 'var(--danger)' : 'var(--border)'}`,
                      fontSize: '0.88rem',
                      lineHeight: '1.5',
                      fontFamily: 'inherit',
                      background: isSubmitted && !isStudy ? 'rgba(0,0,0,0.1)' : 'var(--bg-main)',
                      color: 'var(--text-main)',
                      resize: 'vertical',
                      outline: 'none'
                    }}
                  />
                </div>
              );
            })}
          </div>

          {/* Action Button Row */}
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
            <button
              onClick={handleSubmit}
              disabled={userAnswers.every(ans => !ans.trim())}
              className="btn btn-primary"
              style={{ flex: 1, padding: '0.65rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
            >
              <Check size={16} /> Nộp bài & Xem đối chiếu
            </button>
            <button
              onClick={handleAiGrade}
              disabled={userAnswers.every(ans => !ans.trim())}
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
              <Sparkles size={16} /> AI Chấm Cả 3 Câu
            </button>
          </div>
        </div>

        {/* Right Card: Sample Answers */}
        <div className="listening-card-right">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={16} color="#8b5cf6" />
              <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)' }}>
                Bài Mẫu Chuẩn Band C (3 Thành Viên)
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem' }}>
              {questions.map((qItem, sIdx) => {
                const member = chatMembers[sIdx] || `Member ${sIdx + 1}`;
                return (
                  <div
                    key={sIdx}
                    style={{
                      background: 'rgba(139, 92, 246, 0.05)',
                      border: '1px solid rgba(139, 92, 246, 0.2)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '0.85rem'
                    }}
                  >
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#8b5cf6', textTransform: 'uppercase', marginBottom: '0.3rem' }}>
                      Trả lời {member} (Band C):
                    </div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: '1.55', fontStyle: 'italic' }}>
                      "{qItem.sample_answer}"
                    </div>
                    {vietnameseTrans[`p3_ans_${sIdx}`] && (
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.5rem', paddingTop: '0.4rem', borderTop: '1px dashed var(--border)', display: 'flex', alignItems: 'flex-start', gap: '4px' }}>
                        <Languages size={13} style={{ marginTop: '2px', flexShrink: 0 }} />
                        <span>{vietnameseTrans[`p3_ans_${sIdx}`]}</span>
                      </div>
                    )}
                  </div>
                );
              })}
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
              <MessageSquare size={36} color="#8b5cf6" style={{ opacity: 0.5, marginBottom: '0.75rem' }} />
              <p style={{ margin: 0, fontSize: '0.88rem' }}>
                Nhập câu trả lời cho cả 3 thành viên và nhấn <strong>Nộp bài</strong> hoặc <strong>AI Chấm</strong> để xem phân tích.
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
          // split or set text
        }}
      />

      {/* High-Score Template Learning Modal */}
      <TemplateLearningModal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        skill="writing"
        partKey="part3"
        onApplyTemplate={handleApplyTemplate}
      />
    </div>
  );
};

export default WritingPart3;
