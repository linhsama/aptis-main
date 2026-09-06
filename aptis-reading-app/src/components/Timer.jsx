import React, { useState, useEffect, memo } from 'react';

const Timer = memo(({ initialSeconds, onTimeUp }) => {
  const [timeLeft, setTimeLeft] = useState(initialSeconds);
  const timeUpRef = React.useRef(false);

  useEffect(() => {
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
  }, [onTimeUp]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const isLowTime = timeLeft < 300;

  return (
    <div className="timer" style={{ color: isLowTime ? 'var(--accent-rose)' : 'var(--text-primary)' }}>
      {formatTime(timeLeft)}
    </div>
  );
});

export default Timer;
