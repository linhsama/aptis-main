import React, { useState, useEffect, memo } from 'react';

const Timer = memo(({ initialSeconds = 30 * 60, onTimeUp, resetKey, isPaused = false }) => {
  const [timeLeft, setTimeLeft] = useState(initialSeconds);
  const timeUpRef = React.useRef(false);

  useEffect(() => {
    setTimeLeft(initialSeconds);
    timeUpRef.current = false;
  }, [initialSeconds, resetKey]);

  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          if (onTimeUp && !timeUpRef.current) {
            timeUpRef.current = true;
            onTimeUp();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onTimeUp, resetKey, isPaused]);

  const formatTime = (seconds) => {
    const total = Math.max(0, seconds);
    const m = Math.floor(total / 60);
    const s = total % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const isLowTime = timeLeft <= 300; // Dưới 5 phút hiển thị cảnh báo đỏ

  return (
    <div
      className="timer"
      style={{
        color: isLowTime ? 'var(--danger)' : 'var(--primary)',
        fontWeight: 700,
        fontSize: '1rem',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.35rem',
        padding: '0.25rem 0.65rem',
        borderRadius: 'var(--radius-sm)',
        background: isLowTime ? 'rgba(239, 68, 68, 0.1)' : 'rgba(59, 130, 246, 0.1)',
        border: `1px solid ${isLowTime ? 'var(--danger)' : 'rgba(59, 130, 246, 0.25)'}`,
        transition: 'all 0.2s ease'
      }}
    >
      <span>⏱</span>
      <span>{formatTime(timeLeft)}</span>
    </div>
  );
});

export default Timer;
