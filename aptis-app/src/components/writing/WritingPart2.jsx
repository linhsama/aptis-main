import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSettings } from '../../contexts/SettingsContext';
import Timer from '../Timer';
import {
  Edit3,
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
  AlertTriangle,
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

const WritingPart2 = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const isStudy = searchParams.get('study') === 'true';

  const [currentIndex, setCurrentIndex] = useState(0);
  const [userText, setUserText] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showSample, setShowSample] = useState(false);
  const [vietnameseTrans, setVietnameseTrans] = useState({});
  const [completedSets, setCompletedSets] = useState({});

  // AI & Template Modals
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiEvaluation, setAiEvaluation] = useState(null);

  const currentSet = writingData[currentIndex] || writingData[0];
  const part2Obj = currentSet.part2 || {};

  const wordCount = countWords(userText);
  const isGoodLength = wordCount >= 20 && wordCount <= 30;
  const isTooShort = wordCount > 0 && wordCount < 20;
  const isTooLong = wordCount > 35;

  // Load saved answer for current set
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('aptis_writing_p2_answers') || '{}');
      if (saved[currentSet.id]) {
        setUserText(saved[currentSet.id]);
        setIsSubmitted(true);
      } else {
        setUserText('');
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
      history.filter(h => h.part === 'part-2').forEach(h => {
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
      if (!vietnameseTrans[`p2_q_${currentSet.id}`] && part2Obj.question) {
        translateToVietnamese(part2Obj.question).then(res => {
          setVietnameseTrans(prev => ({ ...prev, [`p2_q_${currentSet.id}`]: res }));
        });
      }
      if (!vietnameseTrans[`p2_ans_${currentSet.id}`] && part2Obj.sample_answer) {
        translateToVietnamese(part2Obj.sample_answer).then(res => {
          setVietnameseTrans(prev => ({ ...prev, [`p2_ans_${currentSet.id}`]: res }));
        });
      }
    }
  }, [isSubmitted, isStudy, currentSet.id, part2Obj]);

  const handleSubmit = () => {
    setIsSubmitted(true);
    setShowSample(true);

    try {
      const saved = JSON.parse(localStorage.getItem('aptis_writing_p2_answers') || '{}');
      saved[currentSet.id] = userText;
      localStorage.setItem('aptis_writing_p2_answers', JSON.stringify(saved));

      const history = JSON.parse(localStorage.getItem('aptis_writing_history') || '[]');
      const updated = history.filter(h => !(h.part === 'part-2' && h.id === currentSet.id));
      updated.push({
        id: currentSet.id,
        part: 'part-2',
        title: currentSet.club || currentSet.title,
        date: new Date().toISOString(),
        score: isGoodLength ? 1 : 0.5
      });
      localStorage.setItem('aptis_writing_history', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const handleReset = () => {
    setUserText('');
    setIsSubmitted(false);
    setShowSample(false);
    try {
      const saved = JSON.parse(localStorage.getItem('aptis_writing_p2_answers') || '{}');
      delete saved[currentSet.id];
      localStorage.setItem('aptis_writing_p2_answers', JSON.stringify(saved));

      const history = JSON.parse(localStorage.getItem('aptis_writing_history') || '[]');
      const updated = history.filter(h => !(h.part === 'part-2' && h.id === currentSet.id));
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
    const result = evaluateResponse({
      text: userText,
      skill: 'writing',
      part: 'part-2',
      minWords: 20,
      maxWords: 30,
      prompt: part2Obj.question,
      sampleAnswer: part2Obj.sample_answer
    });
    setAiEvaluation(result);
    setIsAiModalOpen(true);
  };

  const handleApplyTemplate = (scaffoldText) => {
    setUserText(scaffoldText);
  };

  return (
    <div className="practice-container">
      {/* 1. Header Card */}
      <div className="practice-top-card">
        <div className="practice-header-row">
          <div className="practice-title-group">
            <span className="practice-badge-skill" style={{ background: 'rgba(59, 130, 246, 0.12)', color: '#3b82f6' }}>
              <Edit3 size={14} /> Writing · Part 2
            </span>
            <div className="practice-topic-badge" title={currentSet.club}>
              <span>{currentSet.club || `Set ${currentSet.id}`}</span>
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
              title="Học cấu trúc câu mở & linh hoạt Band C"
            >
              <BookOpen size={13} />
              <span>Template Band C</span>
            </button>

            <button
              onClick={handleAiGrade}
              className="btn-action-pill btn-action-ai"
              title="AI Chấm & Đánh giá bài viết"
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
        {/* Left Card: Question & Textarea */}
        <div className="listening-card-left">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
            <div>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase' }}>
                Short Text Form Writing
              </span>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', margin: '0.2rem 0 0' }}>
                {currentSet.club}
              </h3>
            </div>
            <div style={{
              fontSize: '0.8rem',
              fontWeight: 700,
              padding: '0.2rem 0.65rem',
              borderRadius: 'var(--radius-full)',
              background: isGoodLength ? 'rgba(16, 185, 129, 0.15)' : isTooLong ? 'rgba(239, 68, 68, 0.15)' : 'rgba(59, 130, 246, 0.1)',
              color: isGoodLength ? 'var(--success)' : isTooLong ? 'var(--danger)' : 'var(--primary)'
            }}>
              {wordCount} / 20 – 30 từ
            </div>
          </div>

          {/* Prompt */}
          <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0.85rem 1rem' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
              Yêu cầu đề bài:
            </div>
            <div style={{ fontSize: '0.96rem', fontWeight: 600, color: 'var(--text-main)', lineHeight: '1.5' }}>
              {part2Obj.question}
            </div>
            {vietnameseTrans[`p2_q_${currentSet.id}`] && (
              <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)', fontStyle: 'italic', marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Languages size={13} />
                <span>{vietnameseTrans[`p2_q_${currentSet.id}`]}</span>
              </div>
            )}
          </div>

          {/* Flexible Scaffold Suggestion */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(16, 185, 129, 0.08)',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            borderRadius: 'var(--radius-sm)',
            padding: '0.5rem 0.85rem',
            fontSize: '0.82rem'
          }}>
            <span style={{ color: '#10b981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Zap size={14} /> Khung tự nhiên: [Lý do thực tế] + [Sở thích cá nhân] + [Mong đợi giao lưu]
            </span>
            <button
              onClick={() => setIsTemplateModalOpen(true)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#10b981',
                fontWeight: 700,
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              Xem mẫu câu
            </button>
          </div>

          {/* Textarea Editor */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Bài viết của bạn:
              </label>
              <button
                onClick={() => setIsTemplateModalOpen(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--primary)',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <BookOpen size={12} /> Chèn khung gợi ý
              </button>
            </div>

            <textarea
              rows={6}
              value={userText}
              disabled={isSubmitted && !isStudy}
              onChange={(e) => setUserText(e.target.value)}
              placeholder="Viết đoạn văn ngắn 20 - 30 từ trả lời câu hỏi trên..."
              style={{
                width: '100%',
                padding: '0.85rem',
                borderRadius: 'var(--radius-sm)',
                border: `1px solid ${isGoodLength ? 'var(--success)' : isTooLong ? 'var(--danger)' : 'var(--border)'}`,
                fontSize: '0.92rem',
                lineHeight: '1.6',
                fontFamily: 'inherit',
                background: isSubmitted && !isStudy ? 'rgba(0,0,0,0.1)' : 'var(--bg-main)',
                color: 'var(--text-main)',
                resize: 'vertical',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
            />

            {/* Word Count Indicator */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem' }}>
              <div>
                {isGoodLength && (
                  <span style={{ color: 'var(--success)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Check size={14} /> Độ dài đạt chuẩn (20 – 30 từ)
                  </span>
                )}
                {isTooShort && (
                  <span style={{ color: 'var(--warning)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <AlertTriangle size={14} /> Hơi ngắn ({wordCount} từ) - Hãy bổ sung thêm chi tiết.
                  </span>
                )}
                {isTooLong && (
                  <span style={{ color: 'var(--danger)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <AlertTriangle size={14} /> Quá dài ({wordCount} từ) - Hãy rút gọn dưới 35 từ.
                  </span>
                )}
              </div>
              <span style={{ color: 'var(--text-muted)' }}>
                {wordCount} words
              </span>
            </div>
          </div>

          {/* Action Button Row */}
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button
              onClick={handleSubmit}
              disabled={wordCount === 0}
              className="btn btn-primary"
              style={{ flex: 1, padding: '0.65rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
            >
              <Check size={16} /> Nộp bài & Xem đối chiếu
            </button>
            <button
              onClick={handleAiGrade}
              disabled={wordCount === 0}
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
              <Sparkles size={16} /> AI Chấm Điểm
            </button>
          </div>
        </div>

        {/* Right Card: Sample Answer & Collocations */}
        <div className="listening-card-right">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={16} color="var(--primary)" />
              <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)' }}>
                Bài Mẫu Chuẩn Band C & Phân Tích
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

          {/* Sample Answer Box */}
          {showSample || isSubmitted || isStudy ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{
                background: 'rgba(99, 102, 241, 0.05)',
                border: '1px solid rgba(99, 102, 241, 0.2)',
                borderRadius: 'var(--radius-sm)',
                padding: '1rem',
                position: 'relative'
              }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                  Sample Answer (High Score):
                </div>
                <div style={{ fontSize: '0.94rem', color: 'var(--text-main)', lineHeight: '1.6', fontStyle: 'italic' }}>
                  "{part2Obj.sample_answer}"
                </div>
                {vietnameseTrans[`p2_ans_${currentSet.id}`] && (
                  <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginTop: '0.6rem', paddingTop: '0.5rem', borderTop: '1px dashed var(--border)', display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                    <Languages size={14} style={{ marginTop: '2px', flexShrink: 0 }} />
                    <span>{vietnameseTrans[`p2_ans_${currentSet.id}`]}</span>
                  </div>
                )}
              </div>

              {/* High Score Vocabulary Highlights */}
              <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0.85rem 1rem' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-main)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                  🎯 Từ vựng & Cấu trúc ghi điểm:
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  <span style={{ fontSize: '0.78rem', padding: '3px 8px', borderRadius: '6px', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', fontWeight: 600 }}>
                    ✦ because I have a great passion for...
                  </span>
                  <span style={{ fontSize: '0.78rem', padding: '3px 8px', borderRadius: '6px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', fontWeight: 600 }}>
                    ✦ enhance my practical skills
                  </span>
                  <span style={{ fontSize: '0.78rem', padding: '3px 8px', borderRadius: '6px', background: 'rgba(168, 85, 247, 0.1)', color: '#a855f7', fontWeight: 600 }}>
                    ✦ connect with like-minded members
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
              <BookOpen size={36} color="var(--primary)" style={{ opacity: 0.5, marginBottom: '0.75rem' }} />
              <p style={{ margin: 0, fontSize: '0.88rem' }}>
                Hãy tự viết bài trả lời và nhấn <strong>Nộp bài</strong> hoặc <strong>AI Chấm</strong> để xem đối chiếu bài mẫu và nhận xét chi tiết.
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
        onApplyUpgraded={(text) => setUserText(text)}
      />

      {/* High-Score Template Learning Modal */}
      <TemplateLearningModal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        skill="writing"
        partKey="part2"
        onApplyTemplate={handleApplyTemplate}
      />
    </div>
  );
};

export default WritingPart2;
