import React, { useState, useEffect, useMemo, memo } from 'react';
import { useParams, useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { useSettings } from '../contexts/SettingsContext';
import Timer from './Timer';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { CheckCircle, ChevronRight, ChevronLeft, RotateCcw, ArrowLeft, ArrowRight, Trophy, GripVertical, X, Shuffle, BookOpen, AlertCircle, Clock } from 'lucide-react';
import questionsData from '../data/questions.json';

// Fisher-Yates shuffle
function shuffleArray(array) {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

// Highlight introductory phrase (up to first comma, or first 3 words)
const renderWithHighlights = (text) => {
  if (!text) return '';
  
  // Try to match a short introductory phrase ending with a comma (up to 6 words)
  const commaMatch = text.match(/^((?:\S+\s+){0,5}\S+?),/);
  if (commaMatch) {
    const phrase = commaMatch[0]; // e.g. "In the past,"
    return (
      <>
        <mark className="keyword-highlight">{phrase}</mark>
        {text.substring(phrase.length)}
      </>
    );
  }
  
  // Fallback: highlight the first 3 words
  const words = text.split(' ');
  if (words.length > 2) {
    const phrase = words.slice(0, 3).join(' ');
    return (
      <>
        <mark className="keyword-highlight">{phrase}</mark>
        {text.substring(phrase.length)}
      </>
    );
  }
  
  return text;
};

const Practice = () => {
  const skill = 'reading';
  const part = 'part-2';
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const navigate = useNavigate();
  const { settings, updateSetting } = useSettings();
  
  const isStudy = searchParams.get('study') === 'true';
  const isWeak = searchParams.get('weak') === 'true';
  const isSlow = searchParams.get('slow') === 'true';

  const handleModeToggle = (modeName) => {
    if (modeName === 'random') {
      const willBeRandom = !settings.randomizeQuestions;
      updateSetting('randomizeQuestions', willBeRandom);
      if (willBeRandom) {
        navigate('?'); // Clear query params if turning on random
      }
    } else {
      updateSetting('randomizeQuestions', false); // Turn off random
      const newParams = new URLSearchParams();
      if (searchParams.get(modeName) !== 'true') {
        newParams.set(modeName, 'true'); // Turn on the selected mode
      }
      navigate(`?${newParams.toString()}`);
    }
  };
  
  const [historyVersion, setHistoryVersion] = useState(0);

  const { weakIds, slowIds, masteredIds, prefilledStatuses } = useMemo(() => {
    const history = JSON.parse(localStorage.getItem('aptis_history') || '[]');
    const stats = {};
    const sortedHistory = [...history].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    sortedHistory.forEach(item => {
      const id = item.id || (questionsData.find(q => q.topic === item.topic)?.id);
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
      // Priority 1: Latest attempt dictates current weak/slow status
      if (s.latestScore < 70) {
        weak.push(id);
        prefilled[id] = 'weak';
      } else if (s.latestScore >= 70 && s.latestTimeSpent > 10) {
        slow.push(id);
        prefilled[id] = 'slow';
      } else if (s.perfectCount >= 2) {
        mastered.push(id);
        prefilled[id] = 'mastered';
      } else if (s.latestScore >= 70) {
        prefilled[id] = 'correct';
      }
    });
    
    return { weakIds: weak, slowIds: slow, masteredIds: mastered, prefilledStatuses: prefilled };
  }, [historyVersion]);

  // Memoized questions list
  const activeQuestions = useMemo(() => {
    let list = questionsData.filter(q => q.sentences.length > 0);
      
    if (isWeak || isSlow) {
      list = list.filter(q => (isWeak && weakIds.includes(q.id)) || (isSlow && slowIds.includes(q.id)));
      if (list.length === 0) list = questionsData.filter(q => q.sentences.length > 0);
    }
      
    if (settings.randomizeQuestions) {
      return shuffleArray(list);
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

  const [userOrder, setUserOrder] = useState([]);
  const [allItems, setAllItems] = useState({});
  const [allChecked, setAllChecked] = useState({});
  const [allScores, setAllScores] = useState({});
  const [allAttempted, setAllAttempted] = useState({});

  const items = currentQuestion ? (allItems[currentQuestion.id] || []) : [];
  const isChecked = currentQuestion ? !!allChecked[currentQuestion.id] : false;
  const score = currentQuestion ? (allScores[currentQuestion.id] || 0) : 0;

  const [questionStatuses, setQuestionStatuses] = useState(prefilledStatuses);
  const [startTime, setStartTime] = useState(Date.now());
  const [prevQuestionKey, setPrevQuestionKey] = useState('');

  // Initialize questions during render phase to absolutely prevent flicker
  const currentQuestionKey = `${currentQuestion?.id}-${isStudy}`;
  if (currentQuestionKey !== prevQuestionKey && currentQuestion?.sentences) {
    setPrevQuestionKey(currentQuestionKey);
    setStartTime(Date.now());
    
    // Only initialize if not already present in session
    if (!allItems[currentQuestion.id]) {
      const initialItems = currentQuestion.sentences.map((text, i) => ({
        id: `item-${i}-${currentQuestion.id}`,
        text,
        originalIndex: i
      }));
      
      if (isStudy) {
        setAllItems(prev => ({ ...prev, [currentQuestion.id]: initialItems }));
        setAllChecked(prev => ({ ...prev, [currentQuestion.id]: true }));
        setAllScores(prev => ({ ...prev, [currentQuestion.id]: currentQuestion.sentences.length }));
      } else {
        setAllItems(prev => ({ ...prev, [currentQuestion.id]: shuffleArray(initialItems) }));
      }
    }
  }

  const handleDragEnd = (result) => {
    if (!result.destination || isChecked) return;

    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;

    if (sourceIndex === destinationIndex) return;

    const newItems = Array.from(items);
    const [removed] = newItems.splice(sourceIndex, 1);
    newItems.splice(destinationIndex, 0, removed);

    setAllItems(prev => ({ ...prev, [currentQuestion.id]: newItems }));
    setAllAttempted(prev => ({ ...prev, [currentQuestion.id]: true }));
  };

  const handleCheck = () => {
    let currentScore = 0;
    items.forEach((item, index) => {
      if (item.text === currentQuestion.sentences[index]) {
        currentScore++;
      }
    });
    setAllScores(prev => ({ ...prev, [currentQuestion.id]: currentScore }));
    setAllChecked(prev => ({ ...prev, [currentQuestion.id]: true }));

    const timeSpent = Math.floor((Date.now() - startTime) / 1000);

    // Update Question Board status (Green if 100% correct, otherwise Red)
    setQuestionStatuses(prev => ({
      ...prev,
      [currentQuestion.id]: currentScore === currentQuestion.sentences.length ? 'correct' : 'incorrect'
    }));

    // Save to local storage safely
    try {
      const historyString = localStorage.getItem('aptis_history');
      const history = historyString ? JSON.parse(historyString) : [];
      history.push({
        id: currentQuestion.id,
        topic: currentQuestion.topic,
        score: currentScore,
        total: currentQuestion.sentences.length,
        timeSpent,
        skill,
        part,
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

  const handleNext = () => {
    setHistoryVersion(v => v + 1); // Safely update stats when moving on
    if (currentIndex < activeQuestions.length - 1) {
      setCurrentQuestionId(activeQuestions[currentIndex + 1].id);
    }
  };

  useEffect(() => {
    let timer;
    if (currentQuestion && isChecked && score === currentQuestion.sentences.length && !isStudy) {
      timer = setTimeout(() => {
        setHistoryVersion(v => v + 1);
        if (currentIndex < activeQuestions.length - 1) {
          handleNext();
        } else {
          window.location.href = '/';
        }
      }, 2000);
    }
    return () => clearTimeout(timer);
  }, [isChecked, score, currentIndex, activeQuestions.length, navigate, currentQuestion]);

  const jumpToQuestion = (index) => {
    setHistoryVersion(v => v + 1);
    setCurrentQuestionId(activeQuestions[index].id);
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setHistoryVersion(v => v + 1);
      setCurrentQuestionId(activeQuestions[currentIndex - 1].id);
    }
  };

  const getDisplayPart = () => {
    return 'Part 2';
  };
  
  const getDisplaySkill = () => {
    return skill ? skill.charAt(0).toUpperCase() + skill.slice(1) : '';
  };

  if (!currentQuestion) {
    return (
      <div className="glass" style={{ padding: '3rem', textAlign: 'center', borderRadius: 'var(--radius-lg)' }}>
        <h2>Không có câu hỏi nào trong mục này.</h2>
        <button onClick={() => window.location.href = '/practice/reading/part-2'} className="btn btn-primary" style={{ margin: '2rem auto 0' }}>
          Quay lại danh sách
        </button>
      </div>
    );
  }

  const targetTopicId = null;

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      
      <div className="practice-header" style={{ alignItems: 'center' }}>
        <div>
          <h2 className="page-title" style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
            Reading - Part 2 
            <span className="topic-badge">{currentQuestion.topic}</span>
            <Timer initialSeconds={60 * 20} onTimeUp={handleTimeUp} />
          </h2>
          {!targetTopicId ? (
            <p className="text-muted">
              Set {questionsData.findIndex(q => q.id === currentQuestion.id) + 1} of {questionsData.filter(q => q.sentences.length > 0).length}
            </p>
          ) : (
            <p style={{ color: 'var(--accent-blue)', fontWeight: 600 }}>Targeted Practice Mode</p>
          )}
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
                <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>{questionsData.filter(q => q.sentences.length > 0).length}</span>
              </label>

              <label title="Study" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', justifyContent: 'center', minWidth: '40px', height: '32px', cursor: 'pointer', borderRadius: 'var(--radius-md)', background: isStudy ? 'rgba(59, 130, 246, 0.1)' : 'var(--bg-card)', color: isStudy ? '#3b82f6' : 'var(--text-muted)', border: `1px solid ${isStudy ? '#3b82f6' : 'var(--border)'}`, transition: 'all 0.2s', padding: '0 0.5rem' }}>
                <input 
                  type="checkbox" 
                  checked={isStudy} 
                  onChange={() => handleModeToggle('study')}
                  style={{ display: 'none' }}
                />
                <BookOpen size={14} />
                <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>{questionsData.filter(q => q.sentences.length > 0).length}</span>
              </label>

              {weakIds.length > 0 && (
                <label title="Weak" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', justifyContent: 'center', minWidth: '40px', height: '32px', cursor: 'pointer', borderRadius: 'var(--radius-md)', background: isWeak ? 'rgba(239, 68, 68, 0.1)' : 'var(--bg-card)', color: isWeak ? 'var(--danger)' : 'var(--text-muted)', border: `1px solid ${isWeak ? 'var(--danger)' : 'var(--border)'}`, transition: 'all 0.2s', padding: '0 0.5rem' }}>
                  <input 
                    type="checkbox" 
                    checked={isWeak} 
                    onChange={() => handleModeToggle('weak')}
                    style={{ display: 'none' }}
                  />
                  <AlertCircle size={14} />
                  <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>{weakIds.length}</span>
                </label>
              )}

              {slowIds.length > 0 && (
                <label title="Slow" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', justifyContent: 'center', minWidth: '40px', height: '32px', cursor: 'pointer', borderRadius: 'var(--radius-md)', background: isSlow ? 'rgba(245, 158, 11, 0.1)' : 'var(--bg-card)', color: isSlow ? '#f59e0b' : 'var(--text-muted)', border: `1px solid ${isSlow ? '#f59e0b' : 'var(--border)'}`, transition: 'all 0.2s', padding: '0 0.5rem' }}>
                  <input 
                    type="checkbox" 
                    checked={isSlow} 
                    onChange={() => handleModeToggle('slow')}
                    style={{ display: 'none' }}
                  />
                  <Clock size={14} />
                  <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>{slowIds.length}</span>
                </label>
              )}
            </div>
        </div>
      </div>

      {!targetTopicId && (
        <div className="question-board">
          {questionsData.filter(q => q.sentences.length > 0).map((origQ, originalIndex) => {
            const activeIndex = activeQuestions.findIndex(q => q.id === origQ.id);
            if ((isWeak || isSlow) && activeIndex === -1) return null;

            let statusClass = 'unattempted';
            const isAttempted = allAttempted[origQ.id];
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
      )}

      <div style={{ marginBottom: '2.5rem' }}>
        {isStudy ? (
          <div>
            <div style={{ padding: '1rem 1.5rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(16, 185, 129, 0.2)', marginBottom: '1.5rem' }}>
              <p style={{ color: 'var(--success)', fontWeight: 500 }}>
                <strong>Chế độ Học thứ tự:</strong> Hãy đọc đoạn văn hoàn chỉnh bên dưới.
              </p>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
              {currentQuestion.sentences.map((sentence, index) => (
                <div key={index} className="sentence-item" style={{ cursor: 'default', background: 'var(--bg-main)', padding: '0.75rem' }}>
                  <div className="sentence-index">
                    <span style={{ fontWeight: 600 }}>{String.fromCharCode(65 + index)}</span>
                  </div>
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ lineHeight: 1.4, fontSize: '0.95rem', flex: 1 }}>
                      {renderWithHighlights(sentence)}
                    </span>

                  </div>
                </div>
              ))}
            </div>
            
            <div className="action-bar">
              {!targetTopicId && (
                <button onClick={handlePrev} disabled={currentIndex === 0} className="btn btn-secondary">
                  <ChevronLeft size={18} /> Previous
                </button>
              )}
              
              <div style={{ display: 'flex', gap: '1rem', marginLeft: 'auto' }}>
                {currentIndex === activeQuestions.length - 1 ? (
                  <button onClick={() => {
                    setHistoryVersion(v => v + 1);
                    setCurrentIndex(0);
                  }} className="btn">
                    Bắt đầu lại
                  </button>
                ) : (
                  <button onClick={handleNext} className="btn">
                    Tiếp tục <ChevronRight size={18} />
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <>
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="sentence-list" isDropDisabled={isChecked}>
                {(provided) => (
                  <div 
                    className="sentence-list"
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                  >
                    {items.map((item, index) => (
                      <Draggable key={item.id} draggableId={item.id} index={index} isDragDisabled={isChecked}>
                        {(provided, snapshot) => {
                          const isCorrect = isChecked ? item.text === currentQuestion.sentences[index] : null;
                          let statusClass = '';
                          if (isChecked) {
                            statusClass = isCorrect ? 'correct' : 'incorrect';
                          }

                          return (
                          <div 
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`sentence-item ${snapshot.isDragging ? 'is-dragging' : ''} ${statusClass}`}
                            style={{
                              ...provided.draggableProps.style,
                              cursor: isChecked ? 'default' : (snapshot.isDragging ? 'grabbing' : 'grab')
                            }}
                          >
                            <div className="sentence-index" style={{ 
                                  background: snapshot.isDragging ? 'var(--primary)' : 'var(--bg-main)',
                                  color: snapshot.isDragging ? 'white' : 'var(--text-main)',
                                  borderColor: snapshot.isDragging ? 'var(--primary)' : 'var(--border)'
                                }}>
                              {isChecked ? (
                                <span style={{ fontWeight: 600 }}>{String.fromCharCode(65 + index)}</span>
                              ) : (
                                <GripVertical size={18} />
                              )}
                            </div>
                            <span style={{ flex: 1 }}>{item.text}</span>
                          </div>
                        )}}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>

            <div className="action-bar">
              {!targetTopicId && (
                <button onClick={handlePrev} disabled={currentIndex === 0} className="btn btn-secondary">
                  <ChevronLeft size={18} /> Previous
                </button>
              )}
            
              <div style={{ display: 'flex', gap: '1rem', marginLeft: 'auto', flexWrap: 'wrap' }}>
                {!isChecked && (
                  <button onClick={handleCheck} className="btn" style={{ minWidth: '180px' }}>
                    <CheckCircle size={18} /> Check Result
                  </button>
                )}

                {!targetTopicId && !isChecked && (
                  <button onClick={handleNext} disabled={currentIndex === activeQuestions.length - 1} className="btn btn-secondary">
                    Next <ChevronRight size={18} />
                  </button>
                )}
              </div>
            </div>
          </>
        )}

        {isChecked && !isStudy && (
          <div className="popup-overlay">
            <div className="popup-content popup-large">
              <div className="popup-header" style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
                <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem', color: score === currentQuestion.sentences.length ? 'var(--success)' : 'var(--text-main)' }}>
                  {score === currentQuestion.sentences.length ? 'Tuyệt vời!' : 'Cần cố gắng thêm!'}
                </h2>
                <p style={{ color: 'var(--text-muted)' }}>Bạn đúng {score} / {currentQuestion.sentences.length} câu</p>
              </div>
              
              <div className="popup-body">
                <div className="popup-column">
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--text-main)' }}>Thứ tự của bạn</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {items.map((item, index) => {
                      const isCorrect = item.text === currentQuestion.sentences[index];
                      return (
                        <div key={index} className={`sentence-item ${isCorrect ? 'correct' : 'incorrect'}`} style={{ cursor: 'default', padding: '0.75rem' }}>
                          <div className="sentence-index">
                            <span style={{ fontWeight: 600 }}>{String.fromCharCode(65 + item.originalIndex)}</span>
                          </div>
                          <span style={{ flex: 1, fontSize: '0.95rem' }}>{item.text}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                <div className="popup-column">
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--text-main)' }}>Thứ tự chuẩn & Dịch</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {currentQuestion.sentences.map((sentence, index) => (
                      <div key={index} className="sentence-item" style={{ cursor: 'default', background: 'var(--bg-main)', padding: '0.75rem' }}>
                        <div className="sentence-index">
                          <span style={{ fontWeight: 600 }}>{String.fromCharCode(65 + index)}</span>
                        </div>
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ lineHeight: 1.4, fontSize: '0.95rem', flex: 1 }}>
                            {renderWithHighlights(sentence)}
                          </span>

                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="popup-footer" style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                {score < currentQuestion.sentences.length && (
                  <button onClick={() => {
                    const initialItems = currentQuestion.sentences.map((text, i) => ({
                      id: `item-${i}-${currentQuestion.id}`,
                      text,
                      originalIndex: i
                    }));
                    setAllItems(prev => ({ ...prev, [currentQuestion.id]: shuffleArray(initialItems) }));
                    setAllChecked(prev => { const next = {...prev}; delete next[currentQuestion.id]; return next; });
                    setAllAttempted(prev => { const next = {...prev}; delete next[currentQuestion.id]; return next; });
                    setStartTime(Date.now());
                  }} className="btn btn-secondary">
                    <RotateCcw size={18} /> Thử lại
                  </button>
                )}
                {currentIndex === activeQuestions.length - 1 ? (
                  <button onClick={() => {
                    setHistoryVersion(v => v + 1);
                    window.location.href = '/';
                  }} className="btn">
                    Hoàn thành
                  </button>
                ) : (
                  <button onClick={handleNext} className="btn">
                    Tiếp tục <ChevronRight size={18} />
                  </button>
                )}
              </div>
              
              {score === currentQuestion.sentences.length && !isStudy && (
                <p style={{ marginTop: '1rem', fontSize: '0.85rem', color: 'var(--text-light)', textAlign: 'center' }}>
                  {currentIndex === activeQuestions.length - 1 ? 'Tự động hoàn thành sau 2s...' : 'Tự động chuyển sau 2s...'}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Practice;
