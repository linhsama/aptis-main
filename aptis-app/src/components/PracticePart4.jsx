import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSettings } from '../contexts/SettingsContext';
import Timer from './Timer';
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
  Check
} from 'lucide-react';
import part4Data from '../data/part4.json';

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
  const origIndex = part4Data.findIndex(q => q.id === question.id);
  if (origIndex !== -1) return origIndex + 1;
  const match = String(question.id).match(/\d+/);
  return match ? parseInt(match[0], 10) : 1;
};

const PracticePart4 = () => {
  const skill = 'reading';
  const part = 'part-4';
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
    // Reset session states
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
    const history = JSON.parse(localStorage.getItem('aptis_history') || '[]');
    const stats = {};
    const sortedHistory = [...history]
      .filter(h => (!h.skill || h.skill === 'reading') && (h.part === 'part-4' || !h.part))
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    sortedHistory.forEach(item => {
      const id = item.id;
      if (id) {
        if (!stats[id]) stats[id] = { perfectCount: 0, latestScore: 0, latestTotal: 7, latestTimeSpent: 0 };
        stats[id].latestScore = item.score;
        stats[id].latestTotal = item.total || 7;
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
        prefilled[id] = 'weak';
      } else if (s.latestTimeSpent > 10) {
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
    return part4Data.filter(q => q.paragraphs && q.paragraphs.length > 0);
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

  const selectedAnswers = currentQuestion ? (allSelectedAnswers[currentQuestion.id] || {}) : {};
  const isChecked = currentQuestion ? !!allChecked[currentQuestion.id] : false;
  const score = currentQuestion ? (allScores[currentQuestion.id] || 0) : 0;

  const [questionStatuses, setQuestionStatuses] = useState(prefilledStatuses);

  useEffect(() => {
    setQuestionStatuses(prev => ({ ...prefilledStatuses, ...prev }));
  }, [prefilledStatuses]);

  const [startTime, setStartTime] = useState(Date.now());
  const [prevQuestionKey, setPrevQuestionKey] = useState('');
  const [shuffledHeadings, setShuffledHeadings] = useState([]);

  // Shuffled Headings and Study mode pre-fill
  const currentQuestionKey = `${currentQuestion?.id}-${isStudy}`;
  if (currentQuestionKey !== prevQuestionKey && currentQuestion) {
    setPrevQuestionKey(currentQuestionKey);
    setStartTime(Date.now());

    // Shuffle headings for dropdown presentation
    const headingsWithIndex = currentQuestion.headings.map((h, i) => ({ text: h, originalIndex: i }));
    setShuffledHeadings(shuffleArray(headingsWithIndex));

    if (isStudy && !allChecked[currentQuestion.id]) {
      const correctAnswers = {};
      currentQuestion.paragraphs.forEach((_, idx) => {
        correctAnswers[idx] = idx; // The correct heading index matches paragraph index
      });
      setAllSelectedAnswers(prev => ({ ...prev, [currentQuestion.id]: correctAnswers }));
      setAllScores(prev => ({ ...prev, [currentQuestion.id]: currentQuestion.paragraphs.length }));
      setAllChecked(prev => ({ ...prev, [currentQuestion.id]: true }));
      setAllAttempted(prev => ({ ...prev, [currentQuestion.id]: true }));
    }
  }

  const handleSelect = (paraIndex, headingIndex) => {
    if (isChecked && !isStudy) return;
    setAllSelectedAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: {
        ...(prev[currentQuestion.id] || {}),
        [paraIndex]: headingIndex
      }
    }));
    setAllAttempted(prev => ({ ...prev, [currentQuestion.id]: true }));
  };

  const handleCheck = useCallback(() => {
    if (!currentQuestion) return;

    let currentScore = 0;
    currentQuestion.paragraphs.forEach((_, idx) => {
      if (selectedAnswers[idx] === idx) {
        currentScore++;
      }
    });

    const timeSpent = Math.max(1, Math.floor((Date.now() - startTime) / 1000));
    setAllTimes(prev => ({ ...prev, [currentQuestion.id]: timeSpent }));
    setAllScores(prev => ({ ...prev, [currentQuestion.id]: currentScore }));
    setAllChecked(prev => ({ ...prev, [currentQuestion.id]: true }));
    setAllAttempted(prev => ({ ...prev, [currentQuestion.id]: true }));

    const isPerfect = currentScore === currentQuestion.paragraphs.length;
    const isSlowAttempt = isPerfect && timeSpent > 240;
    setQuestionStatuses(prev => ({
      ...prev,
      [currentQuestion.id]: !isPerfect ? 'incorrect' : (isSlowAttempt ? 'slow' : 'correct')
    }));

    // Save history
    try {
      const historyString = localStorage.getItem('aptis_history');
      const history = historyString ? JSON.parse(historyString) : [];
      history.push({
        id: currentQuestion.id,
        topic: currentQuestion.topic,
        score: currentScore,
        total: currentQuestion.paragraphs.length,
        timeSpent,
        skill,
        part,
        date: new Date().toISOString()
      });
      localStorage.setItem('aptis_history', JSON.stringify(history));
    } catch (e) {
      console.error('Failed to save history', e);
    }

    // Update history version on check so stats update
    setHistoryVersion(v => v + 1);

    if (isPerfect) {
      setShowResultPopup(false);
      if (currentIndex < activeQuestions.length - 1) {
        setCurrentQuestionId(activeQuestions[currentIndex + 1].id);
      }
    } else {
      setShowResultPopup(true);
    }
  }, [currentQuestion, selectedAnswers, startTime, currentIndex, activeQuestions]);

  const handleExamTimeUp = useCallback(() => {
    handleCheck();
  }, [handleCheck]);

  const handleNext = useCallback(() => {
    if (currentIndex < activeQuestions.length - 1) {
      setCurrentQuestionId(activeQuestions[currentIndex + 1].id);
      setShowResultPopup(false);
    }
  }, [currentIndex, activeQuestions]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentQuestionId(activeQuestions[currentIndex - 1].id);
      setShowResultPopup(false);
    }
  }, [currentIndex, activeQuestions]);

  const jumpToQuestion = (index) => {
    setCurrentQuestionId(activeQuestions[index].id);
    setShowResultPopup(false);
  };

  const handleResetQuestion = () => {
    if (!currentQuestion) return;
    setShowResultPopup(false);
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
    setAllAttempted(prev => ({ ...prev, [currentQuestion.id]: false }));
    setQuestionStatuses(prev => {
      const next = { ...prev };
      delete next[currentQuestion.id];
      return next;
    });
    setStartTime(Date.now());
  };

  const handleResetAll = () => {
    try {
      const historyString = localStorage.getItem('aptis_history');
      if (historyString) {
        const history = JSON.parse(historyString);
        const part4Ids = new Set(part4Data.map(q => q.id));
        const updated = history.filter(h => h.part !== 'part-4' && !part4Ids.has(h.id));
        localStorage.setItem('aptis_history', JSON.stringify(updated));
      }
    } catch (e) {
      console.error('Failed to clear part 4 history', e);
    }

    const defaultFirst = part4Data[0];
    updateSetting('randomizeQuestions', false);
    navigate('?');
    setShowResultPopup(false);
    setAllSelectedAnswers({});
    setAllChecked({});
    setAllScores({});
    setAllAttempted({});
    setQuestionStatuses({});
    setPrevQuestionKey('');
    setCurrentQuestionId(defaultFirst ? defaultFirst.id : null);
    setResetCount(c => c + 1);
    setHistoryVersion(v => v + 1);
    setStartTime(Date.now());
  };

  // Keyboard shortcut support
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;

      if (e.key === 'ArrowRight') {
        if (currentIndex < activeQuestions.length - 1) {
          e.preventDefault();
          handleNext();
        }
      } else if (e.key === 'ArrowLeft') {
        if (currentIndex > 0) {
          e.preventDefault();
          handlePrev();
        }
      } else if (e.key === 'Enter') {
        if (!isChecked && !isStudy) {
          e.preventDefault();
          handleCheck();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, activeQuestions.length, handleNext, handlePrev, handleCheck, isChecked, isStudy]);

  if (!currentQuestion) {
    return (
      <div className="practice-container">
        <div className="panel-card" style={{ padding: '3rem', textAlign: 'center' }}>
          <h2>Không tìm thấy câu hỏi trong mục này.</h2>
          <p className="text-muted" style={{ marginTop: '0.5rem' }}>Hãy chọn danh mục khác hoặc đặt lại bộ đề.</p>
          <button onClick={() => navigate('/practice/reading/part-4')} className="btn btn-primary" style={{ margin: '1.5rem auto 0' }}>
            Quay lại danh sách Part 4
          </button>
        </div>
      </div>
    );
  }

  const isAllAnswered = currentQuestion.paragraphs.every((_, idx) => selectedAnswers[idx] !== undefined && selectedAnswers[idx] !== '');

  return (
    <div className="practice-container">
      {/* Top Header Card */}
      <div className="practice-top-card">
        <div className="practice-header-row">
          <div className="practice-title-group">
            <span className="practice-badge-skill">Reading · Part 4</span>
            <div className="practice-topic-badge" title="Chủ đề bài đọc">
              <Sparkles size={14} color="var(--primary)" />
              <span>Set {getOriginalQuestionNumber(currentQuestion)}: {currentQuestion.topic || `Set ${getOriginalQuestionNumber(currentQuestion)}`}</span>
            </div>
            <Timer
              key={`exam-${resetCount}`}
              initialSeconds={25 * 60}
              onTimeUp={handleExamTimeUp}
              resetKey={`exam-${resetCount}`}
              isPaused={isStudy || isChecked}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
            {/* Mode Toggles */}
            <button
              title="Làm bài theo thứ tự chuẩn từ 1 đến hết"
              onClick={() => handleSelectMode('sequential')}
              className={`btn btn-small ${isSequential ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '0.35rem 0.65rem' }}
            >
              <span>Theo thứ tự</span>
            </button>

            <button
              title="Đảo ngẫu nhiên các bài trong đề"
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
              title="Đặt lại toàn bộ bài tập Part 4"
              style={{ padding: '0.35rem 0.65rem' }}
            >
              <RotateCcw size={13} />
              <span>Reset</span>
            </button>
          </div>
        </div>
      </div>

      {/* Question Navigation Board */}
      <div className="question-board" style={{ margin: 0 }}>
        {activeQuestions.map((q, idx) => {
          const setNum = getOriginalQuestionNumber(q);
          const isFinished = allChecked[q.id];
          const isAttempted = allAttempted[q.id];
          const isCurrent = q.id === currentQuestion.id;

          let statusClass = 'unattempted';
          if (isFinished) {
            statusClass = questionStatuses[q.id] || (allScores[q.id] === q.paragraphs.length ? 'correct' : 'incorrect');
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
              title={`Set ${setNum}: ${q.topic || 'Part 4'}`}
            >
              {setNum}
            </button>
          );
        })}
      </div>

      {/* SPLIT SCREEN LAYOUT: Left (Paragraphs) & Right (Headings Selectors) */}
      <div className="part4-split-layout">
        
        {/* Left Column: Text Paragraphs (Khung đoạn văn) */}
        <div className="part4-reading-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.4rem', borderBottom: '1px solid var(--border)' }}>
            <div>
              <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
                Đoạn văn (Passage - 7 đoạn)
              </h3>
              <p className="text-muted" style={{ fontSize: '0.8rem', margin: '0.1rem 0 0 0' }}>
                Đọc kỹ từng đoạn văn bên dưới để chọn tiêu đề phù hợp nhất.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {currentQuestion.paragraphs.map((para, idx) => (
              <div key={idx} className="part4-para-item">
                <div className="part4-para-header">
                  <div className="part4-para-badge">Đoạn {idx + 1}</div>
                </div>
                <div className="part4-para-text">
                  {para}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Headings Selectors (Khung câu hỏi/tiêu đề) */}
        <div className="part4-questions-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.4rem', borderBottom: '1px solid var(--border)' }}>
            <div>
              <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
                {isStudy ? 'Đáp án chuẩn 7 tiêu đề' : 'Chọn tiêu đề cho từng đoạn (1 - 7)'}
              </h3>
              <p className="text-muted" style={{ fontSize: '0.8rem', margin: '0.1rem 0 0 0' }}>
                Khớp mỗi đoạn văn với tiêu đề (Heading) chính xác nhất.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', flex: 1 }}>
            {currentQuestion.paragraphs.map((_, pIdx) => {
              const userChoice = selectedAnswers[pIdx];
              const isCorrect = isChecked ? userChoice === pIdx : null;
              const correctHeading = currentQuestion.headings[pIdx];

              let itemClass = '';
              if (isChecked) {
                itemClass = isCorrect ? 'is-correct' : 'is-incorrect';
              }

              return (
                <div key={pIdx} className={`part4-question-item ${itemClass}`}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                    <label style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '0.86rem' }}>
                      Đoạn {pIdx + 1}:
                    </label>

                    {/* Feedback tag */}
                    {isChecked && (
                      <div>
                        {isCorrect ? (
                          <span className="feedback-tag correct">
                            <Check size={12} />
                            <span>Đúng</span>
                          </span>
                        ) : (
                          <span className="feedback-tag incorrect">
                            <X size={12} />
                            <span>Sai</span>
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <select
                    className="part4-select"
                    value={userChoice ?? ''}
                    onChange={(e) => handleSelect(pIdx, parseInt(e.target.value, 10))}
                    disabled={isChecked}
                  >
                    <option value="" disabled>-- Chọn tiêu đề thích hợp --</option>
                    {shuffledHeadings.map((h, i) => (
                      <option key={i} value={h.originalIndex}>{h.text}</option>
                    ))}
                  </select>

                  {isChecked && !isCorrect && (
                    <div style={{ fontSize: '0.82rem', color: 'var(--danger)', fontStyle: 'italic', marginTop: '2px' }}>
                      Đáp án đúng: <strong>{correctHeading}</strong>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Action Controls Bar */}
          <div className="action-bar" style={{ paddingTop: '0.85rem', marginTop: 'auto', borderTop: '1px solid var(--border)' }}>
            <div>
              <button
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="btn btn-secondary btn-small"
                style={{ borderRadius: '8px', padding: '0.45rem 0.85rem', fontSize: '0.86rem' }}
              >
                <ChevronLeft size={16} />
                <span>Quay lại</span>
                <span className="kbd-hint">←</span>
              </button>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
              {isChecked && !isStudy && (
                <button
                  onClick={handleResetQuestion}
                  className="btn btn-secondary btn-small"
                  style={{ borderRadius: '8px', padding: '0.45rem 0.85rem', fontSize: '0.86rem' }}
                >
                  <RotateCcw size={14} />
                  <span>Thử lại</span>
                </button>
              )}

              {!isStudy && !isChecked && (
                <button
                  onClick={handleCheck}
                  disabled={!isAllAnswered}
                  className="btn btn-primary btn-small"
                  style={{ minWidth: '115px', borderRadius: '8px', padding: '0.45rem 0.95rem', fontSize: '0.86rem' }}
                >
                  <CheckCircle size={16} />
                  <span>Kiểm tra</span>
                  <span className="kbd-hint" style={{ background: 'rgba(255,255,255,0.25)', color: '#fff', borderColor: 'transparent' }}>Enter</span>
                </button>
              )}

              <button
                onClick={handleNext}
                disabled={currentIndex === activeQuestions.length - 1}
                className={`btn btn-small ${isChecked || isStudy ? 'btn-primary' : 'btn-secondary'}`}
                style={{ borderRadius: '8px', padding: '0.45rem 0.85rem', fontSize: '0.86rem' }}
              >
                <span>Tiếp theo</span>
                <ChevronRight size={16} />
                <span className="kbd-hint" style={isChecked ? { background: 'rgba(255,255,255,0.25)', color: '#fff', borderColor: 'transparent' } : {}}>→</span>
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* RESULT POPUP MODAL (When has wrong answers) */}
      {showResultPopup && (
        <div className="custom-modal-overlay" onClick={() => setShowResultPopup(false)}>
          <div
            className="popup-content popup-large"
            onClick={(e) => e.stopPropagation()}
            style={{ borderRadius: '16px', maxWidth: '620px', maxHeight: '88vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
          >
            {/* Modal Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '1rem 1.25rem',
              borderBottom: '1px solid var(--border)',
              background: '#f8fafc'
            }}>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <CheckCircle size={18} color="var(--success)" />
                  <span>Kết quả Set {getOriginalQuestionNumber(currentQuestion)}</span>
                  <span style={{
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    padding: '0.15rem 0.55rem',
                    borderRadius: '6px',
                    background: score === currentQuestion.paragraphs.length ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                    color: score === currentQuestion.paragraphs.length ? 'var(--success)' : 'var(--danger)',
                    border: `1px solid ${score === currentQuestion.paragraphs.length ? 'var(--success)' : 'var(--danger)'}`
                  }}>
                    {score}/{currentQuestion.paragraphs.length} câu đúng
                  </span>
                </h3>
                <p className="text-muted" style={{ fontSize: '0.78rem', margin: '0.15rem 0 0 0' }}>
                  Chủ đề: <strong>{currentQuestion.topic || `Set ${getOriginalQuestionNumber(currentQuestion)}`}</strong>
                </p>
              </div>
              <button
                className="close-btn"
                onClick={() => setShowResultPopup(false)}
                title="Đóng (Esc)"
                style={{ borderRadius: '50%' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body with Paragraphs breakdown */}
            <div style={{ padding: '1rem 1.25rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.6rem', flex: 1 }}>
              {currentQuestion.paragraphs.map((_, pIdx) => {
                const userChoice = selectedAnswers[pIdx];
                const isCorrect = userChoice === pIdx;
                const correctHeading = currentQuestion.headings[pIdx];
                const userHeading = userChoice !== undefined && currentQuestion.headings[userChoice] ? currentQuestion.headings[userChoice] : 'Chưa chọn';

                return (
                  <div
                    key={pIdx}
                    style={{
                      padding: '0.65rem 0.85rem',
                      background: isCorrect ? '#f0fdf4' : '#fef2f2',
                      border: `1px solid ${isCorrect ? '#bbf7d0' : '#fecaca'}`,
                      borderLeft: `4px solid ${isCorrect ? '#10b981' : '#ef4444'}`,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.25rem',
                      borderRadius: '10px'
                    }}
                  >
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)' }}>
                      Đoạn {pIdx + 1}
                    </div>

                    <div style={{ fontSize: '0.84rem', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                      <div style={{ color: 'var(--success)', fontWeight: 600 }}>
                        Tiêu đề đúng: <strong>{correctHeading}</strong>
                      </div>
                      {!isCorrect && (
                        <div style={{ color: 'var(--danger)', fontSize: '0.8rem' }}>
                          Bạn chọn: <span style={{ textDecoration: 'line-through' }}>{userHeading}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: '0.85rem 1.25rem',
              borderTop: '1px solid var(--border)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: '#f8fafc'
            }}>
              <button
                className="btn btn-secondary btn-small"
                onClick={() => {
                  setShowResultPopup(false);
                  handleResetQuestion();
                }}
                style={{ borderRadius: '8px', padding: '0.4rem 0.85rem', fontSize: '0.85rem' }}
              >
                <RotateCcw size={14} />
                <span>Làm lại câu này</span>
              </button>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  className="btn btn-secondary btn-small"
                  onClick={() => setShowResultPopup(false)}
                  style={{ borderRadius: '8px', padding: '0.4rem 0.85rem', fontSize: '0.85rem' }}
                >
                  Đóng
                </button>
                <button
                  className="btn btn-primary btn-small"
                  onClick={() => {
                    setShowResultPopup(false);
                    handleNext();
                  }}
                  disabled={currentIndex === activeQuestions.length - 1}
                  style={{ borderRadius: '8px', padding: '0.4rem 0.85rem', fontSize: '0.85rem' }}
                >
                  <span>Câu tiếp theo</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PracticePart4;
