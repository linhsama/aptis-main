import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSettings } from '../contexts/SettingsContext';
import Timer from './Timer';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import {
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  Trophy,
  GripVertical,
  X,
  Shuffle,
  BookOpen,
  AlertCircle,
  Clock,
  LogOut,
  Languages,
  Sparkles,
  Check,
  Send,
  Flag,
  HelpCircle
} from 'lucide-react';
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

const getOriginalQuestionNumber = (question) => {
  if (!question) return 1;
  const origIndex = questionsData.findIndex(q => q.id === question.id);
  if (origIndex !== -1) return origIndex + 1;
  const match = String(question.id).match(/\d+/);
  return match ? parseInt(match[0], 10) : 1;
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

  const [historyVersion, setHistoryVersion] = useState(0);
  const [resetCount, setResetCount] = useState(0);
  const [showSolutionModal, setShowSolutionModal] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);

  const isRandom = (searchParams.get('random') === 'true' || searchParams.get('mode') === 'random' || settings.randomizeQuestions) && !isStudy && !isWeak && !isSlow;
  const isSequential = !isRandom && !isStudy && !isWeak && !isSlow;

  const handleSelectMode = (modeName) => {
    // Reset trạng thái bài làm phiên hiện tại để có thể kéo thả thực hành lại
    setAllChecked({});
    setAllScores({});
    setAllAttempted({});
    setAllItems({});
    setQuestionStatuses(prefilledStatuses);
    setPrevQuestionKey('');
    setCurrentQuestionId(null);
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
      .filter(h => (!h.skill || h.skill === 'reading') && (h.part === 'part-2' || !h.part))
      .sort((a, b) => new Date(a.date) - new Date(b.date));
    
    sortedHistory.forEach(item => {
      const id = item.id || (questionsData.find(q => q.topic === item.topic)?.id);
      if (id) {
        if (!stats[id]) stats[id] = { perfectCount: 0, latestScore: 0, latestTotal: 5, latestTimeSpent: 0 };
        stats[id].latestScore = item.score;
        stats[id].latestTotal = item.total || 5;
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
        // Làm sai (dù 0/5 hay 4/5) -> Câu sai
        weak.push(id);
        prefilled[id] = 'weak';
      } else if (s.latestTimeSpent > 10) {
        // Làm đúng 100% nhưng mất hơn 10 giây -> Làm chậm
        slow.push(id);
        prefilled[id] = 'slow';
      } else if (s.perfectCount >= 2) {
        mastered.push(id);
        prefilled[id] = 'mastered';
      } else {
        // Làm đúng 100% trong vòng 10 giây -> Đúng chuẩn
        prefilled[id] = 'correct';
      }
    });
    
    return { weakIds: weak, slowIds: slow, masteredIds: mastered, prefilledStatuses: prefilled };
  }, [historyVersion]);

  const allValidQuestions = useMemo(() => {
    return questionsData.filter(q => q.sentences && q.sentences.length > 0);
  }, []);

  // Memoized questions list for the active mode session
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

  const [allItems, setAllItems] = useState({});
  const [allChecked, setAllChecked] = useState({});
  const [allScores, setAllScores] = useState({});
  const [allAttempted, setAllAttempted] = useState({});
  const [allTimes, setAllTimes] = useState({});

  const items = currentQuestion ? (allItems[currentQuestion.id] || []) : [];
  const isChecked = currentQuestion ? !!allChecked[currentQuestion.id] : false;
  const score = currentQuestion ? (allScores[currentQuestion.id] || 0) : 0;

  const [questionStatuses, setQuestionStatuses] = useState(prefilledStatuses);

  useEffect(() => {
    setQuestionStatuses(prev => ({ ...prefilledStatuses, ...prev }));
  }, [prefilledStatuses]);
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

  const handleCheck = useCallback(() => {
    if (!currentQuestion) return;

    let currentScore = 0;
    items.forEach((item, index) => {
      if (item.text === currentQuestion.sentences[index]) {
        currentScore++;
      }
    });

    const timeSpent = Math.max(1, Math.floor((Date.now() - startTime) / 1000));
    setAllTimes(prev => ({ ...prev, [currentQuestion.id]: timeSpent }));
    setAllScores(prev => ({ ...prev, [currentQuestion.id]: currentScore }));
    setAllChecked(prev => ({ ...prev, [currentQuestion.id]: true }));
    setAllAttempted(prev => ({ ...prev, [currentQuestion.id]: true }));

    // Update Question Board status: Red (incorrect) if wrong, Orange (slow) if correct but >10s, Green (correct) if correct in <=10s
    const isPerfect = currentScore === currentQuestion.sentences.length;
    const isSlowAttempt = isPerfect && timeSpent > 10;
    setQuestionStatuses(prev => ({
      ...prev,
      [currentQuestion.id]: !isPerfect ? 'incorrect' : (isSlowAttempt ? 'slow' : 'correct')
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

    // Nếu đúng 100% thì tự động next luôn sang câu tiếp theo
    if (isPerfect) {
      setHistoryVersion(v => v + 1);
      if (currentIndex < activeQuestions.length - 1) {
        setCurrentQuestionId(activeQuestions[currentIndex + 1].id);
      }
    }
  }, [currentQuestion, items, startTime, currentIndex, activeQuestions]);


  const handleExamTimeUp = useCallback(() => {
    // Hết 30 phút thi
    handleCheck();
  }, [handleCheck]);

  const handleNext = useCallback(() => {
    if (currentIndex < activeQuestions.length - 1) {
      setCurrentQuestionId(activeQuestions[currentIndex + 1].id);
    }
  }, [currentIndex, activeQuestions]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentQuestionId(activeQuestions[currentIndex - 1].id);
    }
  }, [currentIndex, activeQuestions]);

  const jumpToQuestion = (index) => {
    setCurrentQuestionId(activeQuestions[index].id);
    setShowSolutionModal(false);
  };

  const handleResetQuestion = () => {
    if (!currentQuestion) return;
    const initialItems = currentQuestion.sentences.map((text, i) => ({
      id: `item-${i}-${currentQuestion.id}`,
      text,
      originalIndex: i
    }));
    setAllItems(prev => ({ ...prev, [currentQuestion.id]: shuffleArray(initialItems) }));
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
        const part2QuestionIds = new Set(questionsData.map(q => q.id));
        const updated = history.filter(h => h.part !== 'part-2' && !part2QuestionIds.has(h.id));
        localStorage.setItem('aptis_history', JSON.stringify(updated));
      }
    } catch (e) {
      console.error('Failed to clear history from storage', e);
    }

    const defaultFirstQuestion = questionsData.find(q => q.sentences && q.sentences.length > 0);
    const firstId = defaultFirstQuestion ? defaultFirstQuestion.id : null;

    updateSetting('randomizeQuestions', false);
    navigate('?');
    setAllChecked({});
    setAllScores({});
    setAllAttempted({});
    setAllItems({});
    setQuestionStatuses({});
    setPrevQuestionKey('');
    setCurrentQuestionId(firstId);
    setResetCount(c => c + 1);
    setHistoryVersion(v => v + 1);
    setStartTime(Date.now());
  };

  // Keyboard shortcut support (Left, Right, Enter, Escape)
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger if user is in an input or textarea
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

      if (e.key === 'Escape') {
        setShowSolutionModal(false);
        setShowExitModal(false);
      } else if (e.key === 'ArrowRight' && !showExitModal) {
        if (currentIndex < activeQuestions.length - 1) {
          handleNext();
        }
      } else if (e.key === 'ArrowLeft' && !showExitModal) {
        if (currentIndex > 0) {
          handlePrev();
        }
      } else if (e.key === 'Enter' && !showExitModal && !showSolutionModal) {
        if (!isChecked && !isStudy) {
          handleCheck();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, activeQuestions.length, handleNext, handlePrev, handleCheck, isChecked, isStudy, showExitModal, showSolutionModal]);

  if (!currentQuestion) {
    return (
      <div className="practice-container">
        <div className="panel-card" style={{ padding: '3rem', textAlign: 'center' }}>
          <h2>Không tìm thấy câu hỏi trong mục này.</h2>
          <p className="text-muted" style={{ marginTop: '0.5rem' }}>Hãy chọn một danh mục khác hoặc bật chế độ ngẫu nhiên.</p>
          <button onClick={() => navigate('/practice/reading/part-2')} className="btn btn-primary" style={{ margin: '1.5rem auto 0' }}>
            Quay lại danh sách Part 2
          </button>
        </div>
      </div>
    );
  }

  const completedProgressPercent = Math.round(((currentIndex + 1) / activeQuestions.length) * 100);

  return (
    <div className="practice-container">
      {/* Top Header Card */}
      <div className="practice-top-card">
        <div className="practice-header-row">
          <div className="practice-title-group">
            <span className="practice-badge-skill">Reading · Part 2</span>
            <div className="practice-topic-badge" title="Chủ đề bài đọc">
              <Sparkles size={14} color="var(--primary)" />
              <span>Set {getOriginalQuestionNumber(currentQuestion)}: {currentQuestion.topic || 'General Topic'}</span>
            </div>
            <Timer
              key={`exam-${resetCount}`}
              initialSeconds={30 * 60}
              onTimeUp={handleExamTimeUp}
              resetKey={`exam-${resetCount}`}
              isPaused={isStudy || isChecked}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
            {/* Mode toggles */}
            <button
              title="Làm bài theo thứ tự chuẩn từ 1 đến hết"
              onClick={() => handleSelectMode('sequential')}
              className={`btn btn-small ${isSequential ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '0.35rem 0.65rem' }}
            >
              <span>Theo thứ tự</span>
            </button>

            <button
              title="Đảo ngẫu nhiên các câu hỏi trong đề"
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
              title="Chế độ học: Đọc đoạn văn theo thứ tự chuẩn & bản dịch"
              onClick={() => handleSelectMode('study')}
              className={`btn btn-small ${isStudy ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '0.35rem 0.65rem' }}
            >
              <BookOpen size={13} />
              <span>Học thứ tự</span>
            </button>

            <div style={{ width: '1px', height: '20px', background: 'var(--border)', margin: '0 0.2rem' }}></div>

            <button
              onClick={handleResetAll}
              className="btn btn-small btn-secondary"
              title="Đặt lại toàn bộ bài tập"
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
            statusClass = questionStatuses[q.id] || (allScores[q.id] === q.sentences.length ? 'correct' : 'incorrect');
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
              title={`Set ${setNum}: ${q.topic}`}
            >
              {setNum}
            </button>
          );
        })}
      </div>

      {/* Main Exercise Card */}
      <div className="panel-card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* Instruction header */}
        <div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.25rem' }}>
            {isStudy ? 'Chế độ Học thứ tự chuẩn' : 'Sắp xếp các câu thành đoạn văn hoàn chỉnh'}
          </h3>
          <p className="text-muted" style={{ fontSize: '0.9rem' }}>
            {isStudy 
              ? 'Đọc kỹ câu mở đầu và các câu nối tiếp theo đúng trình tự logic bên dưới.'
              : 'Kéo thả các câu để sắp xếp thành đoạn văn hoàn chỉnh có nghĩa.'}
          </p>
        </div>

        {/* Study Mode View */}
        {isStudy ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {currentQuestion.sentences.map((sentence, index) => (
              <div
                key={index}
                className="sentence-item"
                style={{ cursor: 'default', background: '#f8fafc', padding: '1rem', borderLeft: '4px solid var(--primary)' }}
              >
                <div className="sentence-slot-num" style={{ background: 'var(--primary)', color: '#fff', borderColor: 'var(--primary)' }}>
                  {String.fromCharCode(65 + index)}
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <div style={{ fontSize: '1rem', lineHeight: '1.5', color: 'var(--text-main)' }}>
                    {renderWithHighlights(sentence)}
                  </div>
                  {currentQuestion.translatedSentences && currentQuestion.translatedSentences[index] && (
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                      {currentQuestion.translatedSentences[index]}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Practice Reordering View */
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="sentence-list" isDropDisabled={isChecked}>
              {(provided) => (
                <div
                  className="sentence-list"
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  style={{ marginBottom: 0 }}
                >
                  {items.map((item, index) => (
                    <Draggable key={item.id} draggableId={item.id} index={index} isDragDisabled={isChecked}>
                      {(providedDraggable, snapshot) => {
                        const isCorrect = isChecked ? item.text === currentQuestion.sentences[index] : null;
                        let statusClass = '';
                        if (isChecked) {
                          statusClass = isCorrect ? 'correct' : 'incorrect';
                        }

                        return (
                          <div
                            ref={providedDraggable.innerRef}
                            {...providedDraggable.draggableProps}
                            {...providedDraggable.dragHandleProps}
                            className={`sentence-item ${snapshot.isDragging ? 'is-dragging' : ''} ${statusClass}`}
                            style={{
                              ...providedDraggable.draggableProps.style,
                              cursor: isChecked ? 'default' : (snapshot.isDragging ? 'grabbing' : 'grab'),
                              userSelect: 'none'
                            }}
                          >
                            {/* Drag handle icon */}
                            <div
                              style={{ display: 'flex', alignItems: 'center', color: snapshot.isDragging ? 'var(--primary)' : 'var(--text-light)', cursor: isChecked ? 'default' : 'grab' }}
                              title={isChecked ? undefined : "Kéo thả để đổi vị trí"}
                            >
                              <GripVertical size={18} />
                            </div>

                            {/* Slot number badge */}
                            <div className="sentence-slot-num">
                              {index + 1}
                            </div>

                            {/* Sentence text */}
                            <span style={{ flex: 1, fontSize: '0.98rem', lineHeight: '1.45' }}>
                              {item.text}
                            </span>

                            {/* Result feedback tags */}
                            {isChecked && (
                              <div className={`feedback-tag ${isCorrect ? 'correct' : 'incorrect'}`}>
                                {isCorrect ? (
                                  <>
                                    <Check size={13} />
                                    <span>Đúng</span>
                                  </>
                                ) : (
                                  <>
                                    <X size={13} />
                                    <span>Vị trí đúng: #{currentQuestion.sentences.indexOf(item.text) + 1}</span>
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      }}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        )}

        {/* Display correct order if checked and there are mistakes */}
        {isChecked && score < currentQuestion.sentences.length && !isStudy && (
          <div style={{
            padding: '1.25rem',
            background: '#f8fafc',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border)',
            borderLeft: '4px solid var(--success)'
          }}>
            <h4 style={{
              fontSize: '0.95rem',
              fontWeight: 700,
              color: 'var(--success)',
              marginBottom: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <CheckCircle size={17} />
              <span>Thứ tự đúng chuẩn của đoạn văn:</span>
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {currentQuestion.sentences.map((sentence, sIdx) => (
                <div key={sIdx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', fontSize: '0.92rem', lineHeight: '1.4' }}>
                  <span style={{
                    minWidth: '22px',
                    height: '22px',
                    borderRadius: '4px',
                    background: 'var(--success)',
                    color: '#fff',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: '2px'
                  }}>
                    {sIdx + 1}
                  </span>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                    <div style={{ color: 'var(--text-main)', fontWeight: 500 }}>
                      {renderWithHighlights(sentence)}
                    </div>
                    {currentQuestion.translatedSentences && currentQuestion.translatedSentences[sIdx] && (
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        {currentQuestion.translatedSentences[sIdx]}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Controls Bar */}
        <div className="action-bar" style={{ paddingTop: '1.25rem', borderTop: '1px solid var(--border)' }}>
          <div>
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="btn btn-secondary"
            >
              <ChevronLeft size={18} />
              <span>Quay lại</span>
              <span className="kbd-hint">←</span>
            </button>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
            {isChecked && !isStudy && (
              <button
                onClick={handleResetQuestion}
                className="btn btn-secondary"
              >
                <RotateCcw size={16} />
                <span>Thử lại</span>
              </button>
            )}

            {!isStudy && !isChecked && (
              <button
                onClick={handleCheck}
                className="btn btn-primary"
                style={{ minWidth: '140px' }}
              >
                <CheckCircle size={18} />
                <span>Kiểm tra</span>
                <span className="kbd-hint" style={{ background: 'rgba(255,255,255,0.25)', color: '#fff', borderColor: 'transparent' }}>Enter</span>
              </button>
            )}

            <button
              onClick={handleNext}
              disabled={currentIndex === activeQuestions.length - 1}
              className={`btn ${isChecked || isStudy ? 'btn-primary' : 'btn-secondary'}`}
            >
              <span>Tiếp theo</span>
              <ChevronRight size={18} />
              <span className="kbd-hint" style={isChecked ? { background: 'rgba(255,255,255,0.25)', color: '#fff', borderColor: 'transparent' } : {}}>→</span>
            </button>
          </div>
        </div>

      </div>

      {/* MODAL 1: Solution & Translation Comparison Modal */}
      {showSolutionModal && (
        <div className="custom-modal-overlay" onClick={() => setShowSolutionModal(false)}>
          <div className="popup-content popup-large" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border)' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <BookOpen size={20} color="var(--primary)" />
                  Đáp án chuẩn & Dịch song ngữ
                </h3>
                <p className="text-muted" style={{ fontSize: '0.85rem', margin: '0.2rem 0 0 0' }}>
                  Chủ đề: <strong>{currentQuestion.topic}</strong> · Hãy chú ý các từ in đậm màu vàng (Discourse markers) nối tiếp các câu.
                </p>
              </div>
              <button
                className="close-btn"
                onClick={() => setShowSolutionModal(false)}
                title="Đóng (Esc)"
              >
                <X size={20} />
              </button>
            </div>

            <div className="popup-body">
              {/* Column 1: User's selected order */}
              {!isStudy && items.length > 0 && (
                <div className="popup-column">
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>Thứ tự của bạn</span>
                    <span style={{ fontSize: '0.8rem', color: score === currentQuestion.sentences.length ? 'var(--success)' : 'var(--danger)' }}>
                      Đúng {score}/{currentQuestion.sentences.length}
                    </span>
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {items.map((item, index) => {
                      const isCorrect = item.text === currentQuestion.sentences[index];
                      return (
                        <div
                          key={index}
                          className={`sentence-item ${isCorrect ? 'correct' : 'incorrect'}`}
                          style={{ cursor: 'default', padding: '0.65rem 0.75rem' }}
                        >
                          <div className="sentence-slot-num">
                            {index + 1}
                          </div>
                          <span style={{ flex: 1, fontSize: '0.9rem', lineHeight: '1.35' }}>
                            {item.text}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Column 2: Standard correct order with translation */}
              <div className="popup-column">
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.75rem' }}>
                  Thứ tự chuẩn & Dịch nghĩa song ngữ
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {currentQuestion.sentences.map((sentence, index) => (
                    <div
                      key={index}
                      className="sentence-item"
                      style={{ cursor: 'default', background: '#f8fafc', padding: '0.75rem', borderLeft: '3px solid var(--success)' }}
                    >
                      <div className="sentence-slot-num" style={{ background: 'var(--success)', color: '#fff', borderColor: 'var(--success)' }}>
                        {String.fromCharCode(65 + index)}
                      </div>
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <div style={{ fontSize: '0.92rem', lineHeight: '1.4', color: 'var(--text-main)' }}>
                          {renderWithHighlights(sentence)}
                        </div>
                        {currentQuestion.translatedSentences && currentQuestion.translatedSentences[index] && (
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            {currentQuestion.translatedSentences[index]}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                onClick={() => setShowSolutionModal(false)}
                className="btn btn-secondary"
              >
                Đóng lại (Esc)
              </button>
              {currentIndex < activeQuestions.length - 1 && (
                <button
                  onClick={() => {
                    setShowSolutionModal(false);
                    handleNext();
                  }}
                  className="btn btn-primary"
                >
                  <span>Sang câu tiếp theo</span>
                  <ChevronRight size={16} />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Confirm Exit Modal */}
      {showExitModal && (
        <div className="custom-modal-overlay" onClick={() => setShowExitModal(false)}>
          <div className="custom-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="custom-modal-header">
              <div className="custom-modal-title">
                <LogOut size={18} color="var(--danger)" />
                <span>Rời khỏi bài luyện tập?</span>
              </div>
              <button className="close-btn" onClick={() => setShowExitModal(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="custom-modal-body">
              <p style={{ color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                Tiến trình các câu bạn đã làm sẽ được lưu trong lịch sử luyện tập.
              </p>
              <p className="text-muted" style={{ fontSize: '0.9rem' }}>
                Bạn có chắc chắn muốn quay trở về trang chủ Dashboard không?
              </p>
            </div>
            <div className="custom-modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setShowExitModal(false)}
              >
                Ở lại làm tiếp
              </button>
              <button
                className="btn btn-primary"
                style={{ background: 'var(--danger)', borderColor: 'var(--danger)' }}
                onClick={() => navigate('/dashboard')}
              >
                Thoát về Dashboard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Practice;
