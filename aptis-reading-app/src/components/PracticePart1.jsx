import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Shuffle, BookOpen, ChevronRight } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';
import part1Data from '../data/part1.json';
import Timer from './Timer';

const PracticePart1 = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const { settings, updateSetting } = useSettings();
  
  const isStudy = searchParams.get('study') === 'true';
  const isWeak = searchParams.get('weak') === 'true';
  const isSlow = searchParams.get('slow') === 'true';

  const handleModeToggle = (modeName) => {
    if (modeName === 'random') {
      const willBeRandom = !settings.randomizeQuestions;
      updateSetting('randomizeQuestions', willBeRandom);
      if (willBeRandom) navigate('?'); 
    } else {
      updateSetting('randomizeQuestions', false); 
      const newParams = new URLSearchParams();
      if (searchParams.get(modeName) !== 'true') newParams.set(modeName, 'true'); 
      navigate(`?${newParams.toString()}`);
    }
  };

  const [historyVersion, setHistoryVersion] = useState(0);

  const { weakIds, slowIds, masteredIds, prefilledStatuses } = useMemo(() => {
    const history = JSON.parse(localStorage.getItem('aptis_history') || '[]');
    const stats = {};
    const sortedHistory = [...history].filter(h => h.part === 'part-1').sort((a, b) => new Date(a.date) - new Date(b.date));
    
    sortedHistory.forEach(item => {
      const id = item.id;
      if (id) {
        if (!stats[id]) stats[id] = { perfectCount: 0, latestScore: 0, latestTimeSpent: 0 };
        const scorePct = (item.score / item.total) * 100;
        stats[id].latestScore = scorePct;
        stats[id].latestTimeSpent = item.timeSpent || 0;
        if (scorePct === 100) stats[id].perfectCount += 1;
      }
    });
    
    const weak = [];
    const slow = [];
    const mastered = [];
    const prefilled = {};
    
    Object.keys(stats).forEach(id => {
      const s = stats[id];
      if (s.latestScore < 100) { 
        weak.push(id);
        prefilled[id] = 'weak';
      } else if (s.latestScore === 100 && s.latestTimeSpent > 300) { 
        slow.push(id);
        prefilled[id] = 'slow';
      } else if (s.perfectCount >= 2) {
        mastered.push(id);
        prefilled[id] = 'mastered';
      } else if (s.latestScore === 100) {
        prefilled[id] = 'correct';
      }
    });
    
    return { weakIds: weak, slowIds: slow, masteredIds: mastered, prefilledStatuses: prefilled };
  }, [historyVersion]);

  const activeQuestions = useMemo(() => {
    let list = [...part1Data];
    if (isWeak || isSlow) {
      list = list.filter(q => (isWeak && weakIds.includes(q.id)) || (isSlow && slowIds.includes(q.id)));
      if (list.length === 0) list = [...part1Data];
    }
    if (settings.randomizeQuestions) {
      const newArray = [...list];
      for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
      }
      return newArray;
    }
    return list;
  }, [isStudy, isWeak, isSlow, settings.randomizeQuestions, weakIds, slowIds]);

  const [currentQuestionId, setCurrentQuestionId] = useState(null);
  
  const currentQuestion = useMemo(() => {
    if (activeQuestions.length === 0) return null;
    const found = activeQuestions.find(q => q.id === currentQuestionId);
    return found || activeQuestions[0];
  }, [activeQuestions, currentQuestionId]);

  const currentIndex = currentQuestion ? activeQuestions.findIndex(q => q.id === currentQuestion.id) : 0;

  const [allSelectedAnswers, setAllSelectedAnswers] = useState({});
  const [allChecked, setAllChecked] = useState({});
  const [allScores, setAllScores] = useState({});
  
  const selectedAnswers = currentQuestion ? (allSelectedAnswers[currentQuestion.id] || {}) : {};
  const isChecked = currentQuestion ? !!allChecked[currentQuestion.id] : false;
  const score = currentQuestion ? (allScores[currentQuestion.id] || 0) : 0;

  const [questionStatuses, setQuestionStatuses] = useState(prefilledStatuses);
  const [startTime, setStartTime] = useState(Date.now());

  useEffect(() => {
    setStartTime(Date.now());
    
    if (currentQuestion && isStudy) {
      const correctAnswers = {};
      currentQuestion.answers.forEach((ansIdx, blankIdx) => {
        correctAnswers[blankIdx] = currentQuestion.options[blankIdx][ansIdx]; 
      });
      setAllSelectedAnswers(prev => ({ ...prev, [currentQuestion.id]: correctAnswers }));
      setAllScores(prev => ({ ...prev, [currentQuestion.id]: currentQuestion.answers.length }));
      setAllChecked(prev => ({ ...prev, [currentQuestion.id]: true }));
    }
  }, [currentIndex, historyVersion, isStudy, currentQuestion]);

  useEffect(() => {
    let timer;
    if (currentQuestion && isChecked && score === currentQuestion.answers.length && !isStudy) {
      timer = setTimeout(() => {
        setHistoryVersion(v => v + 1);
        if (currentIndex < activeQuestions.length - 1) {
          setCurrentQuestionId(activeQuestions[currentIndex + 1].id);
        } else {
          window.location.href = '/';
        }
      }, 2000);
    }
    return () => clearTimeout(timer);
  }, [isChecked, score, currentIndex, activeQuestions.length, currentQuestion, isStudy]);

  const jumpToQuestion = (index) => {
    setHistoryVersion(v => v + 1);
    setCurrentQuestionId(activeQuestions[index].id);
  };
  
  const handlePrev = () => {
    setHistoryVersion(v => v + 1);
    if (currentIndex > 0) setCurrentQuestionId(activeQuestions[currentIndex - 1].id);
  };
  
  const handleNext = () => {
    setHistoryVersion(v => v + 1);
    if (currentIndex < activeQuestions.length - 1) setCurrentQuestionId(activeQuestions[currentIndex + 1].id);
  };

  const handleCheck = () => {
    let currentScore = 0;
    currentQuestion.answers.forEach((ansIdx, blankIdx) => {
      const correctAnswerStr = currentQuestion.options[blankIdx][ansIdx];
      if (selectedAnswers[blankIdx] === correctAnswerStr) {
        currentScore++;
      }
    });
    setAllScores(prev => ({ ...prev, [currentQuestion.id]: currentScore }));
    setAllChecked(prev => ({ ...prev, [currentQuestion.id]: true }));

    setQuestionStatuses(prev => ({
      ...prev,
      [currentQuestion.id]: currentScore === currentQuestion.answers.length ? 'correct' : 'incorrect'
    }));

    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    try {
      const historyString = localStorage.getItem('aptis_history');
      const history = historyString ? JSON.parse(historyString) : [];
      history.push({
        id: currentQuestion.id,
        topic: currentQuestion.topic,
        score: currentScore,
        total: currentQuestion.answers.length,
        timeSpent,
        skill: 'reading',
        part: 'part-1',
        date: new Date().toISOString()
      });
      localStorage.setItem('aptis_history', JSON.stringify(history));
    } catch (e) {
      console.error('Failed to save history', e);
    }
  };

  const handleTimeUp = () => {
    handleCheck();
    setTimeout(() => {
      window.location.href = '/';
    }, 2000);
  };

  const handleSelectChange = (blankIdx, value) => {
    if (!isChecked) {
      setAllSelectedAnswers(prev => ({
        ...prev,
        [currentQuestion.id]: {
          ...(prev[currentQuestion.id] || {}),
          [blankIdx]: value
        }
      }));
    }
  };

  if (!currentQuestion) return <div>Loading...</div>;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '3rem' }}>
      
      {/* Header and Toolbar */}
      <div className="practice-header" style={{ alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h2 className="page-title" style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
            Reading - Part 1
            <span className="topic-badge">{currentQuestion.topic}</span>
            <Timer initialSeconds={60 * 20} onTimeUp={handleTimeUp} />
          </h2>
          <p className="text-muted">
            Set {part1Data.findIndex(q => q.id === currentQuestion.id) + 1} of {part1Data.length}
          </p>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <label title="Random" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', justifyContent: 'center', minWidth: '40px', height: '32px', cursor: 'pointer', borderRadius: 'var(--radius-md)', background: settings.randomizeQuestions ? 'rgba(59, 130, 246, 0.1)' : 'var(--bg-card)', color: settings.randomizeQuestions ? 'var(--primary)' : 'var(--text-muted)', border: `1px solid ${settings.randomizeQuestions ? 'var(--primary)' : 'var(--border)'}`, transition: 'all 0.2s', padding: '0 0.5rem' }}>
                <input 
                  type="checkbox" 
                  checked={settings.randomizeQuestions} 
                  onChange={() => handleModeToggle('random')}
                  style={{ display: 'none' }}
                />
                <Shuffle size={14} />
                <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>{part1Data.length}</span>
              </label>

              <label title="Study" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', justifyContent: 'center', minWidth: '40px', height: '32px', cursor: 'pointer', borderRadius: 'var(--radius-md)', background: isStudy ? 'rgba(59, 130, 246, 0.1)' : 'var(--bg-card)', color: isStudy ? '#3b82f6' : 'var(--text-muted)', border: `1px solid ${isStudy ? '#3b82f6' : 'var(--border)'}`, transition: 'all 0.2s', padding: '0 0.5rem' }}>
                <input 
                  type="checkbox" 
                  checked={isStudy} 
                  onChange={() => handleModeToggle('study')}
                  style={{ display: 'none' }}
                />
                <BookOpen size={14} />
                <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>{part1Data.length}</span>
              </label>
            </div>
        </div>
      </div>

      <div className="question-board" style={{ marginBottom: '1.5rem' }}>
        {part1Data.map((origQ, originalIndex) => {
          const activeIndex = activeQuestions.findIndex(q => q.id === origQ.id);
          if ((isWeak || isSlow) && activeIndex === -1) return null;

          let statusClass = 'unattempted';
          const isAttempted = allSelectedAnswers[origQ.id] && Object.keys(allSelectedAnswers[origQ.id]).length > 0;
          const isFinished = allChecked[origQ.id];
          
          if (isFinished && questionStatuses[origQ.id]) {
            statusClass = questionStatuses[origQ.id];
          } else if (isAttempted) {
            statusClass = 'attempted';
          } else if (questionStatuses[origQ.id]) {
            statusClass = questionStatuses[origQ.id];
          }
          
          if (currentQuestion && origQ.id === currentQuestion.id) {
            statusClass = statusClass === 'attempted' ? 'current attempted' : 'current';
          }
          return (
            <button 
              key={origQ.id}
              className={`q-nav-btn ${statusClass}`}
              onClick={() => {
                if (activeIndex !== -1) jumpToQuestion(activeIndex);
              }}
              disabled={activeIndex === -1}
            >
              {originalIndex + 1}
            </button>
          );
        })}
      </div>

      {isStudy && (
        <div style={{ padding: '1rem 1.5rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(16, 185, 129, 0.2)', marginBottom: '1.5rem' }}>
          <p style={{ color: 'var(--success)', fontWeight: 500 }}>
            <strong>Chế độ Học tập:</strong> Các đáp án đúng đã được điền sẵn.
          </p>
        </div>
      )}

      {/* SINGLE COLUMN INLINE BUTTONS LAYOUT */}
      <div className="practice-board glass" style={{ padding: '0', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '2.5rem', flex: 1 }}>
          <h3 style={{ marginBottom: '2rem', color: 'var(--primary)', borderBottom: '2px solid var(--primary)', paddingBottom: '0.75rem', display: 'inline-block' }}>Đọc đoạn văn và chọn từ phù hợp</h3>
          
          <div style={{ fontSize: '1.15rem', lineHeight: '2.2', color: 'var(--text-main)' }}>
            <p style={{ whiteSpace: 'pre-wrap', margin: 0 }}>
              {currentQuestion.text.split(/\[\d+\]/).map((part, idx, arr) => {
                const blankIdx = idx;
                const isLast = idx === arr.length - 1;
                let selectUI = null;
                
                if (!isLast) {
                  const optsArray = currentQuestion.options[blankIdx] || [];
                  const correctAnswerStr = optsArray[currentQuestion.answers[blankIdx]];
                  const isSelectedCorrect = isChecked && selectedAnswers[blankIdx] === correctAnswerStr;
                  const isSelectedWrong = isChecked && selectedAnswers[blankIdx] && selectedAnswers[blankIdx] !== correctAnswerStr;
                  
                  selectUI = (
                    <span key={`blank-${blankIdx}`} style={{ display: 'inline-flex', alignItems: 'center', margin: '0 0.25rem', flexWrap: 'wrap', gap: '0.25rem', position: 'relative' }}>
                      <span style={{ 
                        display: 'inline-block',
                        minWidth: '30px',
                        borderBottom: '2px dashed var(--border)',
                        marginRight: '0.5rem',
                        color: (isStudy || isSelectedCorrect) ? 'var(--success)' : isSelectedWrong ? 'var(--danger)' : 'var(--primary)',
                        fontWeight: 'bold',
                        textAlign: 'center'
                      }}>
                        {selectedAnswers[blankIdx] || ''}
                      </span>
                      
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>(</span>
                      {optsArray.map((opt, optIdx) => {
                        const isSelected = selectedAnswers[blankIdx] === opt;
                        let btnBg = 'var(--bg-main)';
                        let btnColor = 'var(--text-main)';
                        let btnBorder = 'var(--border)';

                        if (isStudy || (isChecked && opt === correctAnswerStr)) {
                          btnBg = 'rgba(16, 185, 129, 0.1)';
                          btnColor = 'var(--success)';
                          btnBorder = 'var(--success)';
                        } else if (isSelectedWrong && isSelected) {
                          btnBg = 'rgba(239, 68, 68, 0.1)';
                          btnColor = 'var(--danger)';
                          btnBorder = 'var(--danger)';
                        } else if (isSelected) {
                          btnBg = 'rgba(59, 130, 246, 0.1)';
                          btnColor = 'var(--primary)';
                          btnBorder = 'var(--primary)';
                        }

                        return (
                          <React.Fragment key={optIdx}>
                            <button
                              onClick={() => handleSelectChange(blankIdx, opt)}
                              disabled={isChecked}
                              style={{
                                padding: '0.15rem 0.5rem',
                                borderRadius: 'var(--radius-sm)',
                                background: btnBg,
                                color: btnColor,
                                border: `1px solid ${btnBorder}`,
                                cursor: isChecked ? 'default' : 'pointer',
                                fontSize: '0.95rem',
                                transition: 'all 0.2s ease',
                                fontWeight: (isSelected || (isStudy && opt === correctAnswerStr)) ? 'bold' : 'normal'
                              }}
                            >
                              {opt}
                            </button>
                            {optIdx < optsArray.length - 1 && <span style={{ color: 'var(--border)', margin: '0 0.1rem' }}>|</span>}
                          </React.Fragment>
                        );
                      })}
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>)</span>
                    </span>
                  );
                }

                return (
                  <React.Fragment key={idx}>
                    {part}
                    {selectUI}
                  </React.Fragment>
                );
              })}
            </p>
          </div>
        </div>
        
        {/* Unified Footer */}
        <div className="board-footer" style={{ padding: '1.5rem 2rem', borderTop: '1px solid var(--border)', background: 'var(--bg-card)', borderRadius: '0 0 var(--radius-lg) var(--radius-lg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button onClick={handlePrev} disabled={currentIndex === 0} className="btn btn-secondary">
              Quay lại
            </button>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem' }}>
            {!isStudy && (
              <button 
                onClick={handleCheck} 
                disabled={isChecked || Object.keys(selectedAnswers).length < currentQuestion.answers.length} 
                className="btn btn-primary"
                style={{ minWidth: '120px' }}
              >
                Kiểm tra
              </button>
            )}
            {isChecked && !isStudy && (
              <button onClick={() => { 
                setAllSelectedAnswers(prev => { const next = {...prev}; delete next[currentQuestion.id]; return next; }); 
                setAllChecked(prev => { const next = {...prev}; delete next[currentQuestion.id]; return next; });
                setStartTime(Date.now());
              }} className="btn btn-secondary">
                Thử lại
              </button>
            )}
            <button onClick={handleNext} disabled={currentIndex === activeQuestions.length - 1} className="btn btn-secondary">
              Tiếp tục
            </button>
            {(isStudy || isChecked) && currentIndex === activeQuestions.length - 1 && (
              <button onClick={() => window.location.href = '/'} className="btn btn-success" style={{ background: 'var(--success)', color: '#fff', border: 'none' }}>
                Hoàn thành
              </button>
            )}
          </div>
        </div>
      </div>

    </div>
  );
};

export default PracticePart1;
