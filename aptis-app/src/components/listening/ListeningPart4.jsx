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
  Radio,
  Languages,
  Headphones
} from 'lucide-react';
import part4Data from '../../data/listening_part4.json';
import { translateToVietnamese } from '../../utils/translate';

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

const ListeningPart4 = () => {
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
      .filter(h => (!h.skill || h.skill === 'listening') && (h.part === 'part-4'))
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    sortedHistory.forEach(item => {
      const id = item.id;
      if (id) {
        if (!stats[id]) stats[id] = { perfectCount: 0, latestScore: 0, latestTotal: 2, latestTimeSpent: 0 };
        stats[id].latestScore = item.score;
        stats[id].latestTotal = item.total || 2;
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
      } else if (s.latestTimeSpent > 90) {
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
    return part4Data.filter(q => q.questions && q.questions.length > 0);
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

  const currentAnswers = currentQuestion ? (allSelectedAnswers[currentQuestion.id] || {}) : {};
  const isChecked = currentQuestion ? !!allChecked[currentQuestion.id] : false;
  const score = currentQuestion ? (allScores[currentQuestion.id] || 0) : 0;

  const [questionStatuses, setQuestionStatuses] = useState(prefilledStatuses);

  useEffect(() => {
    setQuestionStatuses(prev => ({ ...prefilledStatuses, ...prev }));
  }, [prefilledStatuses]);

  const [startTime, setStartTime] = useState(Date.now());

  useEffect(() => {
    if (currentQuestion?.transcript && !vietnameseTrans[currentQuestion.id]) {
      translateToVietnamese(currentQuestion.transcript).then(res => {
        setVietnameseTrans(prev => ({ ...prev, [currentQuestion.id]: res }));
      });
    }
  }, [currentQuestion?.id, currentQuestion?.transcript, vietnameseTrans]);

  const shuffledSubOptions = useMemo(() => {
    if (!currentQuestion?.questions) return {};
    const map = {};
    currentQuestion.questions.forEach(subQ => {
      map[subQ.id] = [...subQ.options].sort(() => 0.5 - Math.random());
    });
    return map;
  }, [currentQuestion?.id]);

  useEffect(() => {
    if (isStudy && currentQuestion && !allChecked[currentQuestion.id]) {
      const autoAns = {};
      currentQuestion.questions.forEach(sq => {
        autoAns[sq.id] = sq.correctAnswer;
      });
      setAllSelectedAnswers(prev => ({ ...prev, [currentQuestion.id]: autoAns }));
      setAllScores(prev => ({ ...prev, [currentQuestion.id]: currentQuestion.questions.length }));
      setAllChecked(prev => ({ ...prev, [currentQuestion.id]: true }));
      setAllAttempted(prev => ({ ...prev, [currentQuestion.id]: true }));
    }
  }, [isStudy, currentQuestion?.id]);

  const handleSelectSubOption = (subQId, option) => {
    if (isChecked && !isStudy) return;
    setAllSelectedAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: {
        ...(prev[currentQuestion.id] || {}),
        [subQId]: option
      }
    }));
    setAllAttempted(prev => ({ ...prev, [currentQuestion.id]: true }));
  };

  const isAllAnswered = currentQuestion?.questions?.every(sq => currentAnswers[sq.id]);

  const handleCheck = useCallback(() => {
    if (!currentQuestion) return;

    let currentScore = 0;
    currentQuestion.questions.forEach(sq => {
      const userChoice = currentAnswers[sq.id];
      if (userChoice === sq.correctAnswer) {
        currentScore++;
      }
    });

    const timeSpent = Math.max(1, Math.floor((Date.now() - startTime) / 1000));
    const isPerfect = currentScore === currentQuestion.questions.length;

    setAllTimes(prev => ({ ...prev, [currentQuestion.id]: timeSpent }));
    setAllScores(prev => ({ ...prev, [currentQuestion.id]: currentScore }));
    setAllChecked(prev => ({ ...prev, [currentQuestion.id]: true }));
    setAllAttempted(prev => ({ ...prev, [currentQuestion.id]: true }));

    setQuestionStatuses(prev => ({
      ...prev,
      [currentQuestion.id]: isPerfect ? (timeSpent > 90 ? 'slow' : 'correct') : 'incorrect'
    }));

    try {
      const history = JSON.parse(localStorage.getItem('aptis_listening_history') || '[]');
      history.push({
        id: currentQuestion.id,
        skill: 'listening',
        part: 'part-4',
        score: currentScore,
        total: currentQuestion.questions.length,
        timeSpent: timeSpent,
        date: new Date().toISOString()
      });
      localStorage.setItem('aptis_listening_history', JSON.stringify(history));
      setHistoryVersion(v => v + 1);
    } catch (e) {}

    if (isPerfect) {
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      if (currentIndex < activeQuestions.length - 1) {
        setCurrentQuestionId(activeQuestions[currentIndex + 1].id);
        setStartTime(Date.now());
      } else {
        setShowResultPopup(true);
      }
    }
  }, [currentQuestion, currentAnswers, startTime, currentIndex, activeQuestions]);

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
        const part4Ids = new Set(allValidQuestions.map(q => q.id));
        const updated = history.filter(h => h.part !== 'part-4' && !part4Ids.has(h.id));
        localStorage.setItem('aptis_listening_history', JSON.stringify(updated));
      }
    } catch (e) {
      console.error('Failed to clear part 4 listening history', e);
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
  const totalCorrectPoints = Object.values(allScores).reduce((a, b) => a + (b || 0), 0);
  const maxPossiblePoints = totalAttempted * 2;

  if (!currentQuestion) {
    return (
      <div className="practice-container">
        <div className="panel-card" style={{ padding: '3rem', textAlign: 'center' }}>
          <h2>Không tìm thấy câu hỏi trong mục này.</h2>
          <p className="text-muted" style={{ marginTop: '0.5rem' }}>Hãy chọn danh mục khác hoặc đặt lại bộ đề.</p>
          <button onClick={() => navigate('/practice/listening/part-4')} className="btn btn-primary" style={{ margin: '1.5rem auto 0' }}>
            Quay lại danh sách Part 4
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="practice-container">
      {/* 1. Top Header Card */}
      <div className="practice-top-card">
        <div className="practice-header-row">
          <div className="practice-title-group">
            <span className="practice-badge-skill">Listening · Part 4</span>
            <div className="practice-topic-badge" title="Chủ đề">
              <Radio size={14} color="var(--primary)" />
              <span>Đề {getOriginalQuestionNumber(currentQuestion)} / {allValidQuestions.length}: {currentQuestion.topic || 'Monologue & Interview'}</span>
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
              title="Đảo ngẫu nhiên các đề"
              onClick={() => handleSelectMode('random')}
              className={`btn btn-small ${isRandom ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '0.35rem 0.65rem' }}
            >
              <Shuffle size={13} />
              <span>Ngẫu nhiên</span>
            </button>

            <button
              title="Luyện tập các đề đã từng làm sai"
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
              <span>Đề sai ({weakIds.length})</span>
            </button>

            <button
              title="Luyện tập các đề hoàn thành chậm"
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

      {/* 2. Navigation Board */}
      <div className="question-board" style={{ margin: 0 }}>
        {activeQuestions.map((q, idx) => {
          const qNum = getOriginalQuestionNumber(q);
          const isFinished = allChecked[q.id];
          const isAttempted = allAttempted[q.id];
          const isCurrent = q.id === currentQuestion.id;

          let statusClass = 'unattempted';
          if (isFinished) {
            statusClass = questionStatuses[q.id] || (allScores[q.id] === 2 ? 'correct' : 'incorrect');
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
              title={`Đề ${qNum}: ${q.topic}`}
            >
              {qNum}
            </button>
          );
        })}
      </div>

      {/* 3. Balanced 2-Column Split Layout */}
      <div className="listening-grid-2col">
        {/* Left Card: Audio Player & Long Interview Transcript */}
        <div className="listening-card-left">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Headphones size={15} />
              <span>Audio & Transcript bài nói</span>
            </span>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Đề {getOriginalQuestionNumber(currentQuestion)} / {allValidQuestions.length}
            </span>
          </div>

          {/* Audio Player */}
          <AudioPlayerBar
            key={`${currentQuestion.id}-${resetCount}`}
            audioUrl={currentQuestion.audioUrl}
            transcript={currentQuestion.transcript}
            maxPlays={2}
          />

          {/* Transcript & Translation */}
          {(isChecked || isStudy) ? (
            <div className="transcript-translate-box" style={{ maxHeight: '460px' }}>
              <div>
                <strong style={{ color: 'var(--primary)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Transcript: </strong>
                <div style={{ fontStyle: 'italic', whiteSpace: 'pre-line', marginTop: '0.25rem', color: 'var(--text-main)', lineHeight: '1.6' }}>
                  "{currentQuestion.transcript}"
                </div>
              </div>

              <div style={{ borderTop: '1px dashed var(--border)', paddingTop: '0.5rem' }}>
                <strong style={{ color: 'var(--success)', fontSize: '0.8rem', textTransform: 'uppercase', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <Languages size={13} /> Dịch nghĩa:
                </strong>
                <div style={{ whiteSpace: 'pre-line', marginTop: '0.25rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                  {vietnameseTrans[currentQuestion.id] || 'Đang tải bản dịch...'}
                </div>
              </div>
            </div>
          ) : (
            <div style={{
              background: '#f8fafc',
              border: '1px dashed var(--border)',
              borderRadius: 'var(--radius-sm)',
              padding: '1.25rem',
              textAlign: 'center',
              color: 'var(--text-muted)',
              fontSize: '0.84rem'
            }}>
              <span>🎧 Lắng nghe bài độc thoại hoặc cuộc phỏng vấn. Bạn có tối đa 2 lần nghe. Transcript và bản dịch sẽ hiển thị sau khi nộp bài kiểm tra.</span>
            </div>
          )}
        </div>

        {/* Right Card: 2 Sub-questions */}
        <div className="listening-card-right">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
            <div>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase' }}>
                Questions 16 – 17 · Monologue & Interview
              </span>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', margin: '0.2rem 0 0' }}>
                Chủ đề: {currentQuestion.topic}
              </h3>
            </div>

            {isChecked && (
              <span className={`feedback-tag ${score === 2 ? 'correct' : 'incorrect'}`} style={{ padding: '0.2rem 0.55rem', fontSize: '0.8rem' }}>
                {score === 2 ? <Check size={13} /> : <AlertCircle size={13} />}
                <span>Điểm: {score} / 2</span>
              </span>
            )}
          </div>

          {/* 2 Sub-Questions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {currentQuestion.questions.map((subQ, qIdx) => {
              const subOptions = shuffledSubOptions[subQ.id] || subQ.options;
              const userChoice = currentAnswers[subQ.id];
              const isCorrect = isChecked ? userChoice === subQ.correctAnswer : null;

              let itemClass = 'statement-card-item';
              if (isChecked) {
                if (isCorrect) itemClass += ' is-correct';
                else itemClass += ' is-incorrect';
              }

              return (
                <div key={subQ.id} className={itemClass}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.45rem', flex: 1 }}>
                      <span style={{
                        width: '22px',
                        height: '22px',
                        borderRadius: '50%',
                        background: 'var(--primary)',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: '0.75rem',
                        flexShrink: 0,
                        marginTop: '2px'
                      }}>
                        {qIdx + 1}
                      </span>
                      <strong style={{ fontSize: '0.92rem', color: 'var(--text-main)', lineHeight: 1.4 }}>
                        {subQ.question}
                      </strong>
                    </div>

                    {isChecked && (
                      <span style={{ fontSize: '0.78rem', fontWeight: 700, color: isCorrect ? 'var(--success)' : 'var(--danger)', display: 'flex', alignItems: 'center', gap: '3px', flexShrink: 0 }}>
                        {isCorrect ? <Check size={13} /> : <X size={13} />}
                        {isCorrect ? 'Đúng (+1)' : 'Sai'}
                      </span>
                    )}
                  </div>

                  {/* 3 MCQ Options */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', paddingLeft: '1.75rem' }}>
                    {subOptions.map((opt, optIdx) => {
                      const letter = String.fromCharCode(65 + optIdx);
                      const isSelected = userChoice === opt;
                      const isCorrectAnswer = opt === subQ.correctAnswer;

                      let cardClass = 'listening-opt-card';
                      if (isChecked) {
                        if (isCorrectAnswer) cardClass += ' is-correct';
                        else if (isSelected && !isCorrectAnswer) cardClass += ' is-wrong';
                      } else if (isSelected) {
                        cardClass += ' selected';
                      }

                      return (
                        <div
                          key={optIdx}
                          className={cardClass}
                          style={{ padding: '0.55rem 0.85rem' }}
                          onClick={() => handleSelectSubOption(subQ.id, opt)}
                        >
                          <div className="listening-opt-letter" style={{ width: '24px', height: '24px', fontSize: '0.78rem' }}>
                            {letter}
                          </div>
                          <span style={{ fontSize: '0.9rem', fontWeight: isSelected ? 600 : 400, flex: 1 }}>{opt}</span>
                          {isChecked && isCorrectAnswer && (
                            <CheckCircle size={16} color="var(--success)" />
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {isChecked && !isCorrect && (
                    <div style={{ fontSize: '0.8rem', color: 'var(--success)', fontWeight: 600, paddingLeft: '1.75rem', display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <Check size={12} /> Đáp án đúng: <strong>{subQ.correctAnswer}</strong>
                    </div>
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
              <span>Đề trước</span>
            </button>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={handleResetCurrent}
                className="btn btn-secondary"
                title="Làm lại đề này"
              >
                <RotateCcw size={14} />
                <span>Làm lại</span>
              </button>

              {!isChecked ? (
                <button
                  onClick={handleCheck}
                  disabled={!isAllAnswered}
                  className="btn btn-primary"
                  style={{ opacity: !isAllAnswered ? 0.6 : 1 }}
                >
                  <CheckCircle size={16} />
                  <span>Kiểm tra kết quả</span>
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="btn btn-primary"
                >
                  <span>{currentIndex < activeQuestions.length - 1 ? 'Đề tiếp theo' : 'Xem tổng kết'}</span>
                  <ChevronRight size={16} />
                </button>
              )}
            </div>

            <button
              onClick={handleNext}
              disabled={currentIndex === activeQuestions.length - 1 && !isChecked}
              className="btn btn-secondary"
            >
              <span>Đề sau</span>
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
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Kết quả luyện tập Part 4</h2>
              <button className="close-btn" onClick={() => setShowResultPopup(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="stat-card" style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Tổng điểm đạt được</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--success)', margin: '0.25rem 0' }}>
                {totalCorrectPoints} / {maxPossiblePoints}
              </div>
              <div style={{ fontSize: '0.9rem', color: 'var(--primary)', fontWeight: 600 }}>
                Tỷ lệ chính xác: {maxPossiblePoints > 0 ? Math.round((totalCorrectPoints / maxPossiblePoints) * 100) : 0}%
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

export default ListeningPart4;
