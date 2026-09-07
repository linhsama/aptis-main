import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSettings } from '../../contexts/SettingsContext';
import Timer from '../Timer';
import {
  Mail,
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
  Bell,
  UserCheck,
  Send,
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

const WritingPart4 = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const isStudy = searchParams.get('study') === 'true';

  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeTaskTab, setActiveTaskTab] = useState('task1'); // 'task1' | 'task2'
  const [task1Text, setTask1Text] = useState('');
  const [task2Text, setTask2Text] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showSample, setShowSample] = useState(false);
  const [vietnameseTrans, setVietnameseTrans] = useState({});
  const [completedSets, setCompletedSets] = useState({});

  // AI & Template Modals
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiEvaluation, setAiEvaluation] = useState(null);

  const currentSet = writingData[currentIndex] || writingData[0];
  const part4Obj = currentSet.part4 || {};
  const task1Obj = part4Obj.task1 || {};
  const task2Obj = part4Obj.task2 || {};

  const task1WordCount = countWords(task1Text);
  const task2WordCount = countWords(task2Text);

  const isTask1Good = task1WordCount >= 45 && task1WordCount <= 60;
  const isTask2Good = task2WordCount >= 120 && task2WordCount <= 160;

  // Load saved answers
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('aptis_writing_p4_answers') || '{}');
      if (saved[currentSet.id]) {
        setTask1Text(saved[currentSet.id].task1 || '');
        setTask2Text(saved[currentSet.id].task2 || '');
        setIsSubmitted(true);
      } else {
        setTask1Text('');
        setTask2Text('');
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
      history.filter(h => h.part === 'part-4').forEach(h => {
        doneMap[h.id] = true;
      });
      setCompletedSets(doneMap);
    } catch (e) {
      console.error(e);
    }
  }, [isSubmitted]);

  // Translate notice & prompts
  useEffect(() => {
    if (isSubmitted || isStudy) {
      if (!vietnameseTrans[`p4_notice_${currentSet.id}`] && part4Obj.notice) {
        translateToVietnamese(part4Obj.notice).then(res => {
          setVietnameseTrans(prev => ({ ...prev, [`p4_notice_${currentSet.id}`]: res }));
        });
      }
      if (!vietnameseTrans[`p4_t1_prompt_${currentSet.id}`] && task1Obj.prompt) {
        translateToVietnamese(task1Obj.prompt).then(res => {
          setVietnameseTrans(prev => ({ ...prev, [`p4_t1_prompt_${currentSet.id}`]: res }));
        });
      }
      if (!vietnameseTrans[`p4_t1_ans_${currentSet.id}`] && task1Obj.sample_answer) {
        translateToVietnamese(task1Obj.sample_answer).then(res => {
          setVietnameseTrans(prev => ({ ...prev, [`p4_t1_ans_${currentSet.id}`]: res }));
        });
      }
      if (!vietnameseTrans[`p4_t2_prompt_${currentSet.id}`] && task2Obj.prompt) {
        translateToVietnamese(task2Obj.prompt).then(res => {
          setVietnameseTrans(prev => ({ ...prev, [`p4_t2_prompt_${currentSet.id}`]: res }));
        });
      }
      if (!vietnameseTrans[`p4_t2_ans_${currentSet.id}`] && task2Obj.sample_answer) {
        translateToVietnamese(task2Obj.sample_answer).then(res => {
          setVietnameseTrans(prev => ({ ...prev, [`p4_t2_ans_${currentSet.id}`]: res }));
        });
      }
    }
  }, [isSubmitted, isStudy, currentSet.id, part4Obj, task1Obj, task2Obj]);

  const handleSubmit = () => {
    setIsSubmitted(true);
    setShowSample(true);

    try {
      const saved = JSON.parse(localStorage.getItem('aptis_writing_p4_answers') || '{}');
      saved[currentSet.id] = { task1: task1Text, task2: task2Text };
      localStorage.setItem('aptis_writing_p4_answers', JSON.stringify(saved));

      const history = JSON.parse(localStorage.getItem('aptis_writing_history') || '[]');
      const updated = history.filter(h => !(h.part === 'part-4' && h.id === currentSet.id));
      updated.push({
        id: currentSet.id,
        part: 'part-4',
        title: currentSet.club || currentSet.title,
        date: new Date().toISOString(),
        score: isTask1Good && isTask2Good ? 1 : 0.75
      });
      localStorage.setItem('aptis_writing_history', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const handleReset = () => {
    setTask1Text('');
    setTask2Text('');
    setIsSubmitted(false);
    setShowSample(false);
    try {
      const saved = JSON.parse(localStorage.getItem('aptis_writing_p4_answers') || '{}');
      delete saved[currentSet.id];
      localStorage.setItem('aptis_writing_p4_answers', JSON.stringify(saved));

      const history = JSON.parse(localStorage.getItem('aptis_writing_history') || '[]');
      const updated = history.filter(h => !(h.part === 'part-4' && h.id === currentSet.id));
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
    const isTask1 = activeTaskTab === 'task1';
    const textToEvaluate = isTask1 ? task1Text : task2Text;
    const promptText = isTask1 ? task1Obj.prompt : task2Obj.prompt;
    const sampleAnswer = isTask1 ? task1Obj.sample_answer : task2Obj.sample_answer;

    const result = evaluateResponse({
      text: textToEvaluate,
      skill: 'writing',
      part: 'part-4',
      minWords: isTask1 ? 45 : 120,
      maxWords: isTask1 ? 65 : 165,
      prompt: `${part4Obj.notice}\n\n${promptText}`,
      sampleAnswer
    });

    setAiEvaluation(result);
    setIsAiModalOpen(true);
  };

  const handleApplyTemplate = (scaffoldText) => {
    if (activeTaskTab === 'task1') {
      setTask1Text(scaffoldText);
    } else {
      setTask2Text(scaffoldText);
    }
  };

  return (
    <div className="practice-container">
      {/* 1. Top Card */}
      <div className="practice-top-card">
        <div className="practice-header-row">
          <div className="practice-title-group">
            <span className="practice-badge-skill" style={{ background: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b' }}>
              <Mail size={14} /> Writing · Part 4
            </span>
            <div className="practice-topic-badge" title={currentSet.club}>
              <span>{currentSet.club || `Set ${currentSet.id}`}</span>
            </div>
            <div className="timer" style={{ color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Timer initialTime={1200} />
            </div>
          </div>

          {/* Unified Action Buttons Toolbar */}
          <div className="practice-actions-toolbar">
            <button
              onClick={() => setIsTemplateModalOpen(true)}
              className="btn-action-pill btn-action-template"
              title="Học cấu trúc email linh hoạt chuẩn Band C"
            >
              <BookOpen size={13} />
              <span>Template Band C</span>
            </button>

            <button
              onClick={handleAiGrade}
              className="btn-action-pill btn-action-ai"
              title="AI Chấm & Đánh giá email đang làm"
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

      {/* 3. Club Notice Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(99, 102, 241, 0.08) 100%)',
        border: '1px solid rgba(245, 158, 11, 0.25)',
        borderRadius: 'var(--radius-sm)',
        padding: '0.85rem 1.1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.4rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Bell size={16} color="#f59e0b" />
          <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#f59e0b', textTransform: 'uppercase' }}>
            Thông Báo Từ Câu Lạc Bộ ({currentSet.club})
          </span>
        </div>
        <div style={{ fontSize: '0.94rem', color: 'var(--text-main)', lineHeight: '1.55', fontWeight: 500 }}>
          "{part4Obj.notice}"
        </div>
        {vietnameseTrans[`p4_notice_${currentSet.id}`] && (
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Languages size={13} />
            <span>{vietnameseTrans[`p4_notice_${currentSet.id}`]}</span>
          </div>
        )}
      </div>

      {/* 4. Task Tabs (Task 1: Friend ~50w | Task 2: President 120-150w) */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
        <button
          onClick={() => setActiveTaskTab('task1')}
          className={`btn ${activeTaskTab === 'task1' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.86rem', padding: '0.45rem 1rem' }}
        >
          <Mail size={15} />
          <span>Task 1: Email to Friend (~50 words)</span>
          <span style={{
            fontSize: '0.72rem',
            padding: '1px 6px',
            borderRadius: '8px',
            background: isTask1Good ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.1)',
            color: isTask1Good ? '#10b981' : 'inherit'
          }}>
            {task1WordCount} words
          </span>
        </button>

        <button
          onClick={() => setActiveTaskTab('task2')}
          className={`btn ${activeTaskTab === 'task2' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.86rem', padding: '0.45rem 1rem' }}
        >
          <UserCheck size={15} />
          <span>Task 2: Email to President (120–150 words)</span>
          <span style={{
            fontSize: '0.72rem',
            padding: '1px 6px',
            borderRadius: '8px',
            background: isTask2Good ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.1)',
            color: isTask2Good ? '#10b981' : 'inherit'
          }}>
            {task2WordCount} words
          </span>
        </button>
      </div>

      {/* 5. Main Split Layout */}
      <div className="listening-grid-2col">
        {/* Left Card: Active Task Editor */}
        <div className="listening-card-left">
          {activeTaskTab === 'task1' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', marginBottom: '0.2rem' }}>
                  Yêu cầu Task 1 (Informal Email):
                </div>
                <div style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-main)', lineHeight: '1.45' }}>
                  {task1Obj.prompt}
                </div>
                {vietnameseTrans[`p4_t1_prompt_${currentSet.id}`] && (
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontStyle: 'italic', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Languages size={12} />
                    <span>{vietnameseTrans[`p4_t1_prompt_${currentSet.id}`]}</span>
                  </div>
                )}
              </div>

              {/* Textarea Task 1 */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Email thân mật cho bạn (~50 từ):
                  </label>
                  <button
                    onClick={() => setIsTemplateModalOpen(true)}
                    style={{ background: 'none', border: 'none', color: '#f59e0b', fontSize: '0.76rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}
                  >
                    <Zap size={12} /> Gợi ý cấu trúc tự nhiên
                  </button>
                </div>

                <textarea
                  rows={7}
                  value={task1Text}
                  disabled={isSubmitted && !isStudy}
                  onChange={(e) => setTask1Text(e.target.value)}
                  placeholder="Hi [Friend's Name], Have you heard about..."
                  style={{
                    width: '100%',
                    padding: '0.8rem',
                    borderRadius: 'var(--radius-sm)',
                    border: `1px solid ${isTask1Good ? 'var(--success)' : task1WordCount > 65 ? 'var(--danger)' : 'var(--border)'}`,
                    fontSize: '0.9rem',
                    lineHeight: '1.55',
                    fontFamily: 'inherit',
                    background: isSubmitted && !isStudy ? 'rgba(0,0,0,0.1)' : 'var(--bg-main)',
                    color: 'var(--text-main)',
                    resize: 'vertical',
                    outline: 'none'
                  }}
                />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem' }}>
                  <span style={{ color: isTask1Good ? 'var(--success)' : 'var(--text-muted)', fontWeight: 600 }}>
                    {isTask1Good ? '✓ Đạt chuẩn 45-60 từ' : `${task1WordCount} / ~50 từ`}
                  </span>
                  <span style={{ color: 'var(--text-muted)' }}>Khuyên dùng: 45 – 55 từ</span>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', marginBottom: '0.2rem' }}>
                  Yêu cầu Task 2 (Formal Email to President):
                </div>
                <div style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-main)', lineHeight: '1.45' }}>
                  {task2Obj.prompt}
                </div>
                {vietnameseTrans[`p4_t2_prompt_${currentSet.id}`] && (
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontStyle: 'italic', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Languages size={12} />
                    <span>{vietnameseTrans[`p4_t2_prompt_${currentSet.id}`]}</span>
                  </div>
                )}
              </div>

              {/* Textarea Task 2 */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Email trang trọng gửi Ban Quản Trị (120–150 từ):
                  </label>
                  <button
                    onClick={() => setIsTemplateModalOpen(true)}
                    style={{ background: 'none', border: 'none', color: '#f59e0b', fontSize: '0.76rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}
                  >
                    <Zap size={12} /> Gợi ý cấu trúc giải pháp
                  </button>
                </div>

                <textarea
                  rows={10}
                  value={task2Text}
                  disabled={isSubmitted && !isStudy}
                  onChange={(e) => setTask2Text(e.target.value)}
                  placeholder="Dear Club President, I am writing this email to express..."
                  style={{
                    width: '100%',
                    padding: '0.8rem',
                    borderRadius: 'var(--radius-sm)',
                    border: `1px solid ${isTask2Good ? 'var(--success)' : task2WordCount > 170 ? 'var(--danger)' : 'var(--border)'}`,
                    fontSize: '0.9rem',
                    lineHeight: '1.55',
                    fontFamily: 'inherit',
                    background: isSubmitted && !isStudy ? 'rgba(0,0,0,0.1)' : 'var(--bg-main)',
                    color: 'var(--text-main)',
                    resize: 'vertical',
                    outline: 'none'
                  }}
                />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem' }}>
                  <span style={{ color: isTask2Good ? 'var(--success)' : 'var(--text-muted)', fontWeight: 600 }}>
                    {isTask2Good ? '✓ Đạt chuẩn 120-150 từ' : `${task2WordCount} / 120–150 từ`}
                  </span>
                  <span style={{ color: 'var(--text-muted)' }}>Khuyên dùng: 125 – 145 từ</span>
                </div>
              </div>
            </div>
          )}

          {/* Action Row */}
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.75rem' }}>
            <button
              onClick={handleSubmit}
              disabled={!task1Text.trim() && !task2Text.trim()}
              className="btn btn-primary"
              style={{ flex: 1, padding: '0.65rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
            >
              <Check size={16} /> Nộp bài & Đối chiếu
            </button>
            <button
              onClick={handleAiGrade}
              disabled={activeTaskTab === 'task1' ? !task1Text.trim() : !task2Text.trim()}
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
              <Sparkles size={16} /> AI Chấm {activeTaskTab === 'task1' ? 'Task 1' : 'Task 2'}
            </button>
          </div>
        </div>

        {/* Right Card: Sample Answers for Active Tab */}
        <div className="listening-card-right">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={16} color="#f59e0b" />
              <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)' }}>
                Bài Mẫu Chuẩn Band C ({activeTaskTab === 'task1' ? 'Task 1 - Informal' : 'Task 2 - Formal'})
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
              {activeTaskTab === 'task1' ? (
                <div style={{
                  background: 'rgba(245, 158, 11, 0.05)',
                  border: '1px solid rgba(245, 158, 11, 0.2)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '1rem'
                }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#f59e0b', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                    Task 1 Sample Answer:
                  </div>
                  <div style={{ fontSize: '0.92rem', color: 'var(--text-main)', lineHeight: '1.6', fontStyle: 'italic', whiteSpace: 'pre-line' }}>
                    {task1Obj.sample_answer}
                  </div>
                  {vietnameseTrans[`p4_t1_ans_${currentSet.id}`] && (
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.6rem', paddingTop: '0.5rem', borderTop: '1px dashed var(--border)', display: 'flex', alignItems: 'flex-start', gap: '4px' }}>
                      <Languages size={13} style={{ marginTop: '2px', flexShrink: 0 }} />
                      <span>{vietnameseTrans[`p4_t1_ans_${currentSet.id}`]}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{
                  background: 'rgba(99, 102, 241, 0.05)',
                  border: '1px solid rgba(99, 102, 241, 0.2)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '1rem'
                }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                    Task 2 Sample Answer:
                  </div>
                  <div style={{ fontSize: '0.92rem', color: 'var(--text-main)', lineHeight: '1.6', fontStyle: 'italic', whiteSpace: 'pre-line' }}>
                    {task2Obj.sample_answer}
                  </div>
                  {vietnameseTrans[`p4_t2_ans_${currentSet.id}`] && (
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.6rem', paddingTop: '0.5rem', borderTop: '1px dashed var(--border)', display: 'flex', alignItems: 'flex-start', gap: '4px' }}>
                      <Languages size={13} style={{ marginTop: '2px', flexShrink: 0 }} />
                      <span>{vietnameseTrans[`p4_t2_ans_${currentSet.id}`]}</span>
                    </div>
                  )}
                </div>
              )}
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
              <Mail size={36} color="#f59e0b" style={{ opacity: 0.5, marginBottom: '0.75rem' }} />
              <p style={{ margin: 0, fontSize: '0.88rem' }}>
                Viết email cho Task 1 và Task 2 rồi nhấn <strong>Nộp bài</strong> hoặc <strong>AI Chấm</strong> để xem đối chiếu bài mẫu.
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
          if (activeTaskTab === 'task1') setTask1Text(text);
          else setTask2Text(text);
        }}
      />

      {/* High-Score Template Learning Modal */}
      <TemplateLearningModal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        skill="writing"
        partKey="part4"
        onApplyTemplate={handleApplyTemplate}
      />
    </div>
  );
};

export default WritingPart4;
