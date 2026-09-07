import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  FastForward,
  Rewind,
  Headphones,
  Sparkles
} from 'lucide-react';

const prepareSpeechText = (rawText) => {
  if (!rawText) return '';
  return rawText
    .replace(/\bPerson\s+([A-D]):/gi, 'Person $1. ')
    .replace(/\b([WM]):/gi, 'Speaker. ')
    .replace(/\[\d+\]/g, '')
    .replace(/[\r\n]+/g, ' ')
    .trim();
};

const AudioPlayerBar = ({
  audioUrl,
  transcript,
  onPlayCountChange,
  maxPlays = 2
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [playCount, setPlayCount] = useState(0);
  const [useTTS, setUseTTS] = useState(true);
  const [audioError, setAudioError] = useState(false);

  const audioRef = useRef(null);
  const ttsIntervalRef = useRef(null);
  const isPausedRef = useRef(false);

  // Initialize voices
  useEffect(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
      const onVoices = () => {
        window.speechSynthesis.getVoices();
      };
      window.speechSynthesis.onvoiceschanged = onVoices;
      return () => {
        window.speechSynthesis.onvoiceschanged = null;
      };
    }
  }, []);

  // Reset audio & state when audioUrl or transcript changes
  useEffect(() => {
    stopAllPlayback();
    setCurrentTime(0);
    setDuration(0);
    setPlayCount(0);
    setAudioError(false);
    isPausedRef.current = false;

    // Check if audio file can be loaded
    if (audioUrl) {
      setUseTTS(false);
      if (audioRef.current) {
        audioRef.current.playbackRate = playbackRate;
        audioRef.current.load();
      }
    } else {
      setUseTTS(true);
    }
  }, [audioUrl, transcript]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
    }
    if (isPlaying && useTTS) {
      // If speed changed during TTS, restart TTS with new rate
      startTTSPlayback();
    }
  }, [playbackRate]);

  useEffect(() => {
    return () => {
      stopAllPlayback();
    };
  }, []);

  const stopAllPlayback = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    if (ttsIntervalRef.current) {
      clearInterval(ttsIntervalRef.current);
    }
    setIsPlaying(false);
    isPausedRef.current = false;
  };

  const handleAudioLoadedMetadata = () => {
    if (audioRef.current && audioRef.current.duration) {
      setDuration(audioRef.current.duration);
      setAudioError(false);
    }
  };

  const handleAudioTimeUpdate = () => {
    if (audioRef.current && !useTTS) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    const newCount = playCount + 1;
    setPlayCount(newCount);
    if (onPlayCountChange) onPlayCountChange(newCount);
  };

  const handleAudioError = () => {
    setAudioError(true);
    setUseTTS(true);
  };

  const startTTSPlayback = (startOffsetSec = 0) => {
    if (!('speechSynthesis' in window)) {
      alert('Trình duyệt không hỗ trợ Web Speech API. Vui lòng sử dụng Chrome, Edge hoặc Safari.');
      return;
    }

    if (!transcript) {
      console.warn('No transcript text available for audio playback.');
      return;
    }

    // Cancel existing speech
    window.speechSynthesis.cancel();
    if (ttsIntervalRef.current) clearInterval(ttsIntervalRef.current);

    setTimeout(() => {
      try {
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }

        const cleanText = prepareSpeechText(transcript);
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.rate = playbackRate;
        utterance.lang = 'en-US';
        utterance.volume = isMuted ? 0 : volume;

        const voices = window.speechSynthesis.getVoices();
        const englishVoice = voices.find(v => 
          (v.lang.startsWith('en') || v.lang.includes('US') || v.lang.includes('GB')) &&
          (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('David') || v.name.includes('Jenny') || v.name.includes('Guy') || v.name.includes('Zira') || v.name.includes('English') || v.name.includes('US'))
        ) || voices.find(v => v.lang.startsWith('en'));

        if (englishVoice) {
          utterance.voice = englishVoice;
        }

        const words = cleanText.split(/\s+/).filter(Boolean).length;
        const estDuration = Math.max(5, Math.round((words / (135 * playbackRate)) * 60));
        setDuration(estDuration);

        utterance.onstart = () => {
          setIsPlaying(true);
          isPausedRef.current = false;
          setAudioError(false);
        };

        utterance.onend = () => {
          setIsPlaying(false);
          setCurrentTime(0);
          isPausedRef.current = false;
          if (ttsIntervalRef.current) clearInterval(ttsIntervalRef.current);
          const newCount = playCount + 1;
          setPlayCount(newCount);
          if (onPlayCountChange) onPlayCountChange(newCount);
        };

        utterance.onerror = (e) => {
          if (e.error !== 'canceled' && e.error !== 'interrupted') {
            console.warn('Speech synthesis error:', e);
          }
          setIsPlaying(false);
          isPausedRef.current = false;
          if (ttsIntervalRef.current) clearInterval(ttsIntervalRef.current);
        };

        // Prevent garbage collection in Chrome
        window._aptisSpeechUtterance = utterance;

        window.speechSynthesis.speak(utterance);
        setIsPlaying(true);
        isPausedRef.current = false;

        const startTimestamp = Date.now() - (startOffsetSec * 1000);
        ttsIntervalRef.current = setInterval(() => {
          const elapsed = (Date.now() - startTimestamp) / 1000;
          if (elapsed >= estDuration) {
            clearInterval(ttsIntervalRef.current);
          } else {
            setCurrentTime(Math.min(elapsed, estDuration));
          }
        }, 200);
      } catch (err) {
        console.error('Failed to start TTS:', err);
        setIsPlaying(false);
      }
    }, 40);
  };

  const togglePlay = () => {
    if (isPlaying) {
      if (useTTS || audioError) {
        if (window.speechSynthesis.speaking) {
          window.speechSynthesis.pause();
          isPausedRef.current = true;
          if (ttsIntervalRef.current) clearInterval(ttsIntervalRef.current);
        }
        setIsPlaying(false);
      } else if (audioRef.current) {
        audioRef.current.pause();
        setIsPlaying(false);
      }
    } else {
      if (useTTS || audioError) {
        if (isPausedRef.current && window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
          isPausedRef.current = false;
          setIsPlaying(true);
          // Resume timer
          const estDuration = duration || 10;
          const startTimestamp = Date.now() - (currentTime * 1000);
          if (ttsIntervalRef.current) clearInterval(ttsIntervalRef.current);
          ttsIntervalRef.current = setInterval(() => {
            const elapsed = (Date.now() - startTimestamp) / 1000;
            if (elapsed >= estDuration) {
              clearInterval(ttsIntervalRef.current);
            } else {
              setCurrentTime(Math.min(elapsed, estDuration));
            }
          }, 200);
        } else {
          startTTSPlayback(0);
        }
      } else if (audioRef.current) {
        audioRef.current.play().then(() => {
          setIsPlaying(true);
        }).catch(() => {
          setUseTTS(true);
          startTTSPlayback(0);
        });
      }
    }
  };

  const handleSeek = (e) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (!useTTS && !audioError && audioRef.current) {
      audioRef.current.currentTime = newTime;
    } else {
      if (isPlaying) {
        startTTSPlayback(newTime);
      }
    }
  };

  const handleRewind = () => {
    const targetTime = Math.max(0, currentTime - 5);
    setCurrentTime(targetTime);
    if (!useTTS && !audioError && audioRef.current) {
      audioRef.current.currentTime = targetTime;
    } else if (isPlaying) {
      startTTSPlayback(targetTime);
    }
  };

  const handleFastForward = () => {
    const maxT = duration > 0 ? duration : 30;
    const targetTime = Math.min(maxT, currentTime + 5);
    setCurrentTime(targetTime);
    if (!useTTS && !audioError && audioRef.current) {
      audioRef.current.currentTime = targetTime;
    } else if (isPlaying) {
      startTTSPlayback(targetTime);
    }
  };

  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (audioRef.current) {
      audioRef.current.muted = nextMuted;
    }
    if (window._aptisSpeechUtterance) {
      window._aptisSpeechUtterance.volume = nextMuted ? 0 : volume;
    }
  };

  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    const isNowMuted = val === 0;
    setIsMuted(isNowMuted);
    if (audioRef.current) {
      audioRef.current.volume = val;
      audioRef.current.muted = isNowMuted;
    }
    if (window._aptisSpeechUtterance) {
      window._aptisSpeechUtterance.volume = val;
    }
  };

  const formatTime = (seconds) => {
    if (isNaN(seconds) || seconds <= 0) return '00:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div style={{
      padding: '0.85rem 1.15rem',
      borderRadius: 'var(--radius-sm)',
      marginBottom: '0.65rem',
      border: '1px solid var(--border)',
      background: '#f8fafc'
    }}>
      <audio
        ref={audioRef}
        src={audioUrl ? (audioUrl.startsWith('/') ? audioUrl : `/${audioUrl}`) : ''}
        onLoadedMetadata={handleAudioLoadedMetadata}
        onTimeUpdate={handleAudioTimeUpdate}
        onEnded={handleAudioEnded}
        onError={handleAudioError}
        preload="metadata"
      />

      {/* Row 1: Header tags, Speed, Play Counter */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.65rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            background: isPlaying ? 'var(--primary)' : 'rgba(59, 130, 246, 0.12)',
            color: isPlaying ? '#fff' : 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease'
          }}>
            <Headphones size={15} />
          </div>
          <span style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-main)' }}>
            Aptis Audio Player
          </span>
          {useTTS && (
            <span style={{
              fontSize: '0.7rem',
              padding: '1px 6px',
              borderRadius: '8px',
              background: 'rgba(59, 130, 246, 0.12)',
              color: 'var(--primary)',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '3px'
            }}>
              <Sparkles size={10} /> AI Voice
            </span>
          )}
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Lượt nghe: <strong style={{ color: playCount >= maxPlays ? 'var(--danger)' : 'var(--primary)' }}>{playCount}</strong>/{maxPlays}
          </span>
        </div>

        {/* Speed Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <div style={{ display: 'flex', background: 'var(--bg-hover)', borderRadius: '6px', padding: '2px', border: '1px solid var(--border)' }}>
            {[0.75, 1, 1.25, 1.5].map((rate) => (
              <button
                key={rate}
                onClick={() => setPlaybackRate(rate)}
                style={{
                  padding: '2px 7px',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  borderRadius: '4px',
                  border: 'none',
                  background: playbackRate === rate ? 'var(--primary)' : 'transparent',
                  color: playbackRate === rate ? '#fff' : 'var(--text-muted)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {rate}x
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Row 2: Playback controls & Seek timeline */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
        <button
          onClick={handleRewind}
          title="Tua lùi 5s"
          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '3px', display: 'flex' }}
        >
          <Rewind size={16} />
        </button>

        <button
          onClick={togglePlay}
          title={isPlaying ? 'Tạm dừng' : 'Phát âm thanh'}
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: 'var(--primary)',
            color: '#fff',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            flexShrink: 0,
            boxShadow: '0 2px 6px rgba(59, 130, 246, 0.35)',
            transition: 'transform 0.15s ease'
          }}
        >
          {isPlaying ? <Pause size={17} /> : <Play size={17} style={{ marginLeft: '2px' }} />}
        </button>

        <button
          onClick={handleFastForward}
          title="Tua tới 5s"
          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '3px', display: 'flex' }}
        >
          <FastForward size={16} />
        </button>

        <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--text-muted)', minWidth: '35px' }}>
          {formatTime(currentTime)}
        </span>

        <input
          type="range"
          min="0"
          max={duration > 0 ? duration : 100}
          step="0.1"
          value={currentTime}
          onChange={handleSeek}
          style={{
            flex: 1,
            accentColor: 'var(--primary)',
            cursor: 'pointer',
            height: '4px'
          }}
        />

        <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--text-muted)', minWidth: '35px' }}>
          {formatTime(duration)}
        </span>

        <button
          onClick={toggleMute}
          title={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '3px', display: 'flex' }}
        >
          {isMuted || volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </button>
      </div>
    </div>
  );
};

export default AudioPlayerBar;
