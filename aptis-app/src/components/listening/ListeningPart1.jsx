import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSettings } from '../../contexts/SettingsContext';
import Timer from '../Timer';
import AudioPlayerBar from './AudioPlayerBar';
import {
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  X,
  Shuffle,
  BookOpen,
  AlertCircle,
  Clock,
  Sparkles,
  Check,
  Headphones,
  Languages
} from 'lucide-react';
import part1Data from '../../data/listening_part1.json';
import { translateToVietnamese } from '../../utils/translate';

// Fisher-Yates shuffle
function shuffleArray(array) {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

const getOriginalQuestionNumber = (question) => {
  if (!question) return 1;
  const origIndex = part1Data.findIndex(q => q.id === question.id);
  if (origIndex !== -1) return origIndex + 1;
  const match = String(question.id).match(/\d+/);
  return match ? parseInt(match[0], 10) : 1;
};

const ListeningPart1 = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const navigate = useNavigate();
  const { settings, updateSetting } = useSettings();

  const isStudy = searchParams.get('study') === 'true';
  const isWeak = searchParams.get('weak') === 'true';
  const isSlow = searchParams.get('slow') === 'true';

  const [historyVersion, setHistoryVersion] = useState(0);
  const [resetCount, setResetCount] = useState(0);
  const [showResultPopup, setShowResultPopup] = useState(false);

  const isRandom = (searchParams.get('random') === 'true' || searchParams.get('mode') === 'random' || settings.randomizeQuestions) && !isStudy && !isWeak && !isSlow;
  const isSequential = !isRandom && !isStudy && !isWeak && !isSlow;

  const handleSelectMode = (modeName) => {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    setAllSelectedAnswers({});
    setAllChecked({});
    setAllScores({});
    setAllAttempted({});
    setQuestionStatuses(prefilledStatuses);
    setCurrentQuestionId(null);
    setShowResultPopup(false);
    setStartTime(Date.now());
    setResetCount(c => c + 1);

    if (modeName === 'sequential') {
      updateSetting('randomizeQuestions', false);
      navigate('?');
    } else if (modeName === 'random') {
      updateSetting('randomizeQuestions', true);
      navigate('?random=true');
    } else if (modeName === 'weak') {
      updateSetting('randomizeQuestions', false);
      navigate('?weak=true');
    } else if (modeName === 'slow') {
      updateSetting('randomizeQuestions', false);
      navigate('?slow=true');
    } else if (modeName === 'study') {
      updateSetting('randomizeQuestions', false);
      navigate('?study=true');
    }
  };

  const { weakIds, slowIds, masteredIds, prefilledStatuses } = useMemo(() => {
    const history = JSON.parse(localStorage.getItem('aptis_listening_history') || '[]');
    const stats = {};
    const sortedHistory = [...history]
      .filter(h => (!h.skill || h.skill === 'listening') && (h.part === 'part-1' || !h.part))
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    sortedHistory.forEach(item => {
      const id = item.id;
      if (id) {
        if (!stats[id]) stats[id] = { perfectCount: 0, latestScore: 0, latestTotal: 1, latestTimeSpent: 0 };
        stats[id].latestScore = item.score;
        stats[id].latestTotal = item.total || 1;
        stats[id].latestTimeSpent = item.timeSpent || 0;
        if (item.score === item.total) stats[id].perfectCount += 1;
      }
    });

    const weak = [];
    const slow = [];
    const mastered = [];
    const prefilled = {};

    Object.keys(stats).forEach(id => {
      const s = stats[id];
      const isPerfect = s.latestScore === s.latestTotal;
      if (!isPerfect) {
        weak.push(id);
        prefilled[id] = 'incorrect';
      } else if (s.latestTimeSpent > 30) {
        slow.push(id);
        prefilled[id] = 'slow';
      } else if (s.perfectCount >= 2) {
        mastered.push(id);
        prefilled[id] = 'mastered';
      } else {
        prefilled[id] = 'correct';
      }
    });

    return { weakIds: weak, slowIds: slow, masteredIds: mastered, prefilledStatuses: prefilled };
  }, [historyVersion]);

  const allValidQuestions = useMemo(() => {
    return part1Data.filter(q => q.options && q.options.length > 0);
  }, []);

  const activeQuestions = useMemo(() => {
    if (isWeak) {
      const filtered = allValidQuestions.filter(q => weakIds.includes(q.id));
      return filtered.length > 0 ? filtered : allValidQuestions;
    }
    if (isSlow) {
      const filtered = allValidQuestions.filter(q => slowIds.includes(q.id));
      return filtered.length > 0 ? filtered : allValidQuestions;
    }
    if (isRandom) {
      return shuffleArray(allValidQuestions);
    }
    return allValidQuestions;
  }, [isWeak, isSlow, isRandom, allValidQuestions, resetCount]);

  const [currentQuestionId, setCurrentQuestionId] = useState(null);

  useEffect(() => {
    if (activeQuestions.length > 0) {
      if (!currentQuestionId || !activeQuestions.some(q => q.id === currentQuestionId)) {
        setCurrentQuestionId(activeQuestions[0].id);
      }
    }
  }, [activeQuestions, currentQuestionId]);

  const currentQuestion = useMemo(() => {
    if (activeQuestions.length === 0) return null;
    const found = activeQuestions.find(q => q.id === currentQuestionId);
    return found || activeQuestions[0];
  }, [activeQuestions, currentQuestionId]);

  const currentIndex = currentQuestion ? activeQuestions.findIndex(q => q.id === currentQuestion.id) : 0;

  const [allSelectedAnswers, setAllSelectedAnswers] = useState({});
  const [allChecked, setAllChecked] = useState({});
  const [allScores, setAllScores] = useState({});
  const [allAttempted, setAllAttempted] = useState({});
  const [allTimes, setAllTimes] = useState({});
  const [vietnameseTrans, setVietnameseTrans] = useState({});

  const selectedAnswer = currentQuestion ? allSelectedAnswers[currentQuestion.id] : undefined;
  const isChecked = currentQuestion ? !!allChecked[currentQuestion.id] : false;
  const score = currentQuestion ? (allScores[currentQuestion.id] || 0) : 0;

  const [questionStatuses, setQuestionStatuses] = useState(prefilledStatuses);

  useEffect(() => {
    setQuestionStatuses(prev => ({ ...prefilledStatuses, ...prev }));
  }, [prefilledStatuses]);

  const [startTime, setStartTime] = useState(Date.now());

  // Translate transcript on demand
  useEffect(() => {
    if (currentQuestion?.transcript && !vietnameseTrans[currentQuestion.id]) {
      translateToVietnamese(currentQuestion.transcript).then(res => {
        setVietnameseTrans(prev => ({ ...prev, [currentQuestion.id]: res }));
      });
    }
  }, [currentQuestion?.id, currentQuestion?.transcript, vietnameseTrans]);

  // Pre-fill answers in Study mode
  useEffect(() => {
    if (isStudy && currentQuestion && !allChecked[currentQuestion.id]) {
      setAllSelectedAnswers(prev => ({ ...prev, [currentQuestion.id]: currentQuestion.correctAnswer }));
      setAllScores(prev => ({ ...prev, [currentQuestion.id]: 1 }));
      setAllChecked(prev => ({ ...prev, [currentQuestion.id]: true }));
      setAllAttempted(prev => ({ ...prev, [currentQuestion.id]: true }));
    }
  }, [isStudy, currentQuestion?.id]);

  const handleSelectOption = (opt) => {
    if (isChecked && !isStudy) return;
    setAllSelectedAnswers(prev => ({ ...prev, [currentQuestion.id]: opt }));
    setAllAttempted(prev => ({ ...prev, [currentQuestion.id]: true }));
  };

  const handleCheck = useCallback(() => {
    if (!currentQuestion) return;

    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    const currentScore = isCorrect ? 1 : 0;
    const timeSpent = Math.max(1, Math.floor((Date.now() - startTime) / 1000));

    setAllTimes(prev => ({ ...prev, [currentQuestion.id]: timeSpent }));
    setAllScores(prev => ({ ...prev, [currentQuestion.id]: currentScore }));
    setAllChecked(prev => ({ ...prev, [currentQuestion.id]: true }));
    setAllAttempted(prev => ({ ...prev, [currentQuestion.id]: true }));

    setQuestionStatuses(prev => ({
      ...prev,
      [currentQuestion.id]: isCorrect ? (timeSpent > 30 ? 'slow' : 'correct') : 'incorrect'
    }));

    try {
      const history = JSON.parse(localStorage.getItem('aptis_listening_history') || '[]');
      history.push({
        id: currentQuestion.id,
        skill: 'listening',
        part: 'part-1',
        score: currentScore,
        total: 1,
        timeSpent: timeSpent,
        date: new Date().toISOString()
      });
      localStorage.setItem('aptis_listening_history', JSON.stringify(history));
      setHistoryVersion(v => v + 1);
    } catch (e) {}

    if (isCorrect) {
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      if (currentIndex < activeQuestions.length - 1) {
        setCurrentQuestionId(activeQuestions[currentIndex + 1].id);
        setStartTime(Date.now());
      } else {
        setShowResultPopup(true);
      }
    }
  }, [currentQuestion, selectedAnswer, startTime, currentIndex, activeQuestions]);

  const handleNext = () => {
    if (currentIndex < activeQuestions.length - 1) {
      setCurrentQuestionId(activeQuestions[currentIndex + 1].id);
      setStartTime(Date.now());
    } else {
      setShowResultPopup(true);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentQuestionId(activeQuestions[currentIndex - 1].id);
      setStartTime(Date.now());
    }
  };

  const jumpToQuestion = (index) => {
    if (index >= 0 && index < activeQuestions.length) {
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      setCurrentQuestionId(activeQuestions[index].id);
      setStartTime(Date.now());
    }
  };

  const handleResetCurrent = () => {
    if (!currentQuestion) return;
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    setAllSelectedAnswers(prev => {
      const next = { ...prev };
      delete next[currentQuestion.id];
      return next;
    });
    setAllChecked(prev => {
      const next = { ...prev };
      delete next[currentQuestion.id];
      return next;
    });
    setAllScores(prev => {
      const next = { ...prev };
      delete next[currentQuestion.id];
      return next;
    });
    setAllAttempted(prev => {
      const next = { ...prev };
      delete next[currentQuestion.id];
      return next;
    });
    setQuestionStatuses(prev => {
      const next = { ...prev };
      delete next[currentQuestion.id];
      return next;
    });
    setStartTime(Date.now());
    setResetCount(c => c + 1);
  };

  const handleResetAll = () => {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    try {
      const historyString = localStorage.getItem('aptis_listening_history');
      if (historyString) {
        const history = JSON.parse(historyString);
        const part1Ids = new Set(allValidQuestions.map(q => q.id));
        const updated = history.filter(h => h.part !== 'part-1' && !part1Ids.has(h.id));
        localStorage.setItem('aptis_listening_history', JSON.stringify(updated));
      }
    } catch (e) {
      console.error('Failed to clear part 1 listening history', e);
    }

    setAllSelectedAnswers({});
    setAllChecked({});
    setAllScores({});
    setAllAttempted({});
    setQuestionStatuses({});
    setCurrentQuestionId(allValidQuestions[0]?.id || activeQuestions[0]?.id);
    setShowResultPopup(false);
    setStartTime(Date.now());
    setResetCount(c => c + 1);
    navigate('?');
  };

  const totalAttempted = Object.keys(allChecked).filter(k => allChecked[k]).length;
  const totalCorrect = Object.values(allScores).filter(s => s === 1).length;

  if (!currentQuestion) {
    return (
      <div className="practice-container">
        <div className="panel-card" style={{ padding: '3rem', textAlign: 'center' }}>
          <h2>Không tìm thấy câu hỏi trong mục này.</h2>
          <p className="text-muted" style={{ marginTop: '0.5rem' }}>Hãy chọn danh mục khác hoặc đặt lại bộ đề.</p>
          <button onClick={() => navigate('/practice/listening/part-1')} className="btn btn-primary" style={{ margin: '1.5rem auto 0' }}>
            Quay lại danh sách Part 1
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="practice-container">
      {/* 1. Top Header Card Synchronized with Reading */}
      <div className="practice-top-card">
        <div className="practice-header-row">
          <div className="practice-title-group">
            <span className="practice-badge-skill">Listening · Part 1</span>
            <div className="practice-topic-badge" title="Câu hỏi">
              <Headphones size={14} color="var(--primary)" />
              <span>Câu {getOriginalQuestionNumber(currentQuestion)} / {allValidQuestions.length}: {currentQuestion.heading || 'Information Recognition'}</span>
            </div>
            <Timer
              key={`exam-${resetCount}`}
              initialSeconds={30 * 60}
              resetKey={`exam-${resetCount}`}
              isPaused={isStudy || isChecked}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
            <button
              title="Làm bài theo thứ tự chuẩn từ 1 đến hết"
              onClick={() => handleSelectMode('sequential')}
              className={`btn btn-small ${isSequential ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '0.35rem 0.65rem' }}
            >
              <span>Theo thứ tự</span>
            </button>

            <button
              title="Đảo ngẫu nhiên các câu trong đề"
              onClick={() => handleSelectMode('random')}
              className={`btn btn-small ${isRandom ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '0.35rem 0.65rem' }}
            >
              <Shuffle size={13} />
              <span>Ngẫu nhiên</span>
            </button>

            <button
              title="Luyện tập các câu đã từng làm sai"
              onClick={() => handleSelectMode('weak')}
              disabled={weakIds.length === 0}
              className={`btn btn-small ${isWeak ? 'btn-primary' : 'btn-secondary'}`}
              style={{
                padding: '0.35rem 0.65rem',
                borderColor: isWeak ? 'var(--danger)' : undefined,
                color: isWeak ? '#fff' : weakIds.length > 0 ? 'var(--danger)' : 'var(--text-light)',
                background: isWeak ? 'var(--danger)' : undefined
              }}
            >
              <AlertCircle size={13} />
              <span>Câu sai ({weakIds.length})</span>
            </button>

            <button
              title="Luyện tập các câu hoàn thành chậm"
              onClick={() => handleSelectMode('slow')}
              disabled={slowIds.length === 0}
              className={`btn btn-small ${isSlow ? 'btn-primary' : 'btn-secondary'}`}
              style={{
                padding: '0.35rem 0.65rem',
                borderColor: isSlow ? '#f59e0b' : undefined,
                color: isSlow ? '#fff' : slowIds.length > 0 ? '#d97706' : 'var(--text-light)',
                background: isSlow ? '#f59e0b' : undefined
              }}
            >
              <Clock size={13} />
              <span>Làm chậm ({slowIds.length})</span>
            </button>

            <button
              title="Chế độ học: Xem trước đáp án chuẩn"
              onClick={() => handleSelectMode('study')}
              className={`btn btn-small ${isStudy ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '0.35rem 0.65rem' }}
            >
              <BookOpen size={13} />
              <span>Học tập</span>
            </button>

            <div style={{ width: '1px', height: '20px', background: 'var(--border)', margin: '0 0.2rem' }}></div>

            <button
              onClick={handleResetAll}
              className="btn btn-small btn-secondary"
              title="Đặt lại toàn bộ bài tập Part 1"
              style={{ padding: '0.35rem 0.65rem' }}
            >
              <RotateCcw size={13} />
              <span>Reset</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Question Navigation Board (Grid of numbers like Reading) */}
      <div className="question-board" style={{ margin: 0 }}>
        {activeQuestions.map((q, idx) => {
          const qNum = getOriginalQuestionNumber(q);
          const isFinished = allChecked[q.id];
          const isAttempted = allAttempted[q.id];
          const isCurrent = q.id === currentQuestion.id;

          let statusClass = 'unattempted';
          if (isFinished) {
            statusClass = questionStatuses[q.id] || (allScores[q.id] === 1 ? 'correct' : 'incorrect');
          } else if (isAttempted) {
            statusClass = 'attempted';
          } else if (questionStatuses[q.id] || prefilledStatuses[q.id]) {
            statusClass = questionStatuses[q.id] || prefilledStatuses[q.id];
          }

          if (isCurrent) {
            statusClass = `${statusClass} current`;
          }

          return (
            <button
              key={q.id}
              className={`q-nav-btn ${statusClass}`}
              onClick={() => jumpToQuestion(idx)}
              title={`Câu ${qNum}: ${q.question}`}
            >
              {qNum}
            </button>
          );
        })}
      </div>

      {/* 3. Balanced 2-Column Split Layout */}
      <div className="listening-grid-2col">
        {/* Left Card: Audio Player & Explanation */}
        <div className="listening-card-left">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Headphones size={15} />
              <span>Audio & Transcript</span>
            </span>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Câu {getOriginalQuestionNumber(currentQuestion)} / {allValidQuestions.length}
            </span>
          </div>

          {/* Audio Player Bar */}
          <AudioPlayerBar
            key={`${currentQuestion.id}-${resetCount}`}
            audioUrl={currentQuestion.audioUrl}
            transcript={currentQuestion.transcript}
            maxPlays={2}
          />

          {/* Transcript & Vietnamese Translation Box */}
          {(isChecked || isStudy) ? (
            <div className="transcript-translate-box">
              <div>
                <strong style={{ color: 'var(--primary)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Transcript: </strong>
                <p style={{ fontStyle: 'italic', margin: '0.25rem 0 0', color: 'var(--text-main)' }}>
                  "{currentQuestion.transcript}"
                </p>
              </div>

              <div style={{ borderTop: '1px dashed var(--border)', paddingTop: '0.5rem' }}>
                <strong style={{ color: 'var(--success)', fontSize: '0.8rem', textTransform: 'uppercase', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <Languages size={13} /> Dịch nghĩa:
                </strong>
                <p style={{ margin: '0.25rem 0 0', color: 'var(--text-muted)' }}>
                  {vietnameseTrans[currentQuestion.id] || 'Đang tải bản dịch...'}
                </p>
              </div>
            </div>
          ) : (
            <div style={{
              background: '#f8fafc',
              border: '1px dashed var(--border)',
              borderRadius: 'var(--radius-sm)',
              padding: '1rem',
              textAlign: 'center',
              color: 'var(--text-muted)',
              fontSize: '0.84rem'
            }}>
              <span>🎧 Bấm nút phát âm thanh bên trên để nghe (tối đa 2 lần). Transcript & bản dịch sẽ mở tự động khi bạn kiểm tra đáp án.</span>
            </div>
          )}
        </div>

        {/* Right Card: Question & Options */}
        <div className="listening-card-right">
          {/* Question Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
            <div>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase' }}>
                {currentQuestion.heading || `Question ${getOriginalQuestionNumber(currentQuestion)}`}
              </span>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', margin: '0.2rem 0 0' }}>
                {currentQuestion.question}
              </h3>
            </div>

            {isChecked && (
              <div style={{ flexShrink: 0 }}>
                {score === 1 ? (
                  <span className="feedback-tag correct" style={{ padding: '0.2rem 0.55rem', fontSize: '0.8rem' }}>
                    <Check size={13} />
                    <span>Chính xác (+1)</span>
                  </span>
                ) : (
                  <span className="feedback-tag incorrect" style={{ padding: '0.2rem 0.55rem', fontSize: '0.8rem' }}>
                    <X size={13} />
                    <span>Chưa đúng</span>
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Options List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {currentQuestion.options.map((opt, oIdx) => {
              const letter = String.fromCharCode(65 + oIdx);
              const isSelected = selectedAnswer === opt;
              const isCorrectAnswer = opt === currentQuestion.correctAnswer;

              let cardClass = 'listening-opt-card';
              if (isChecked) {
                if (isCorrectAnswer) cardClass += ' is-correct';
                else if (isSelected && !isCorrectAnswer) cardClass += ' is-wrong';
              } else if (isSelected) {
                cardClass += ' selected';
              }

              return (
                <div
                  key={oIdx}
                  className={cardClass}
                  onClick={() => handleSelectOption(opt)}
                >
                  <div className="listening-opt-letter">
                    {letter}
                  </div>
                  <span style={{ fontSize: '0.94rem', fontWeight: isSelected ? 600 : 400, flex: 1 }}>
                    {opt}
                  </span>

                  {isChecked && isCorrectAnswer && (
                    <CheckCircle size={18} color="var(--success)" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Action Bar */}
          <div className="action-bar" style={{ marginTop: 'auto', paddingTop: '0.85rem' }}>
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="btn btn-secondary"
              style={{ opacity: currentIndex === 0 ? 0.5 : 1 }}
            >
              <ChevronLeft size={16} />
              <span>Câu trước</span>
            </button>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={handleResetCurrent}
                className="btn btn-secondary"
                title="Làm lại câu này"
              >
                <RotateCcw size={14} />
                <span>Làm lại</span>
              </button>

              {!isChecked ? (
                <button
                  onClick={handleCheck}
                  disabled={!selectedAnswer}
                  className="btn btn-primary"
                  style={{ opacity: !selectedAnswer ? 0.6 : 1 }}
                >
                  <CheckCircle size={16} />
                  <span>Kiểm tra đáp án</span>
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="btn btn-primary"
                >
                  <span>{currentIndex < activeQuestions.length - 1 ? 'Câu tiếp theo' : 'Xem tổng kết'}</span>
                  <ChevronRight size={16} />
                </button>
              )}
            </div>

            <button
              onClick={handleNext}
              disabled={currentIndex === activeQuestions.length - 1 && !isChecked}
              className="btn btn-secondary"
            >
              <span>Câu sau</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Completion Modal */}
      {showResultPopup && (
        <div className="drawer-overlay" onClick={() => setShowResultPopup(false)}>
          <div className="result-drawer" onClick={e => e.stopPropagation()}>
            <div className="drawer-header">
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Kết quả luyện tập Part 1</h2>
              <button className="close-btn" onClick={() => setShowResultPopup(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="stat-card" style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Số câu làm đúng</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--success)', margin: '0.25rem 0' }}>
                {totalCorrect} / {totalAttempted}
              </div>
              <div style={{ fontSize: '0.9rem', color: 'var(--primary)', fontWeight: 600 }}>
                Tỷ lệ chính xác: {totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0}%
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: 'auto' }}>
              <button
                className="btn btn-primary"
                onClick={() => {
                  setShowResultPopup(false);
                  handleSelectMode('sequential');
                }}
              >
                Làm lại từ đầu
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => navigate('/dashboard')}
              >
                Về Dashboard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListeningPart1;
