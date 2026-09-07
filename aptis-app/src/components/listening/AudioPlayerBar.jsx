import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  FastForward,
  Rewind,
  Eye,
  EyeOff,
  Sparkles,
  Headphones,
  Languages,
  Info
} from 'lucide-react';
import { translateToVietnamese } from '../../utils/translate';

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
  const [showTranscript, setShowTranscript] = useState(false);
  const [playCount, setPlayCount] = useState(0);
  const [useTTS, setUseTTS] = useState(false);
  const [audioError, setAudioError] = useState(false);
  const [translatedText, setTranslatedText] = useState('');
  const [isLoadingTrans, setIsLoadingTrans] = useState(false);

  const audioRef = useRef(null);
  const speechRef = useRef(null);
  const ttsIntervalRef = useRef(null);

  // Reset audio & state when audioUrl or transcript changes
  useEffect(() => {
    stopAllPlayback();
    setCurrentTime(0);
    setDuration(0);
    setPlayCount(0);
    setAudioError(false);
    setShowTranscript(false);
    setTranslatedText('');

    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
      audioRef.current.load();
    }
  }, [audioUrl, transcript]);

  // Translate transcript on demand or when shown
  useEffect(() => {
    if (showTranscript && transcript && !translatedText) {
      setIsLoadingTrans(true);
      translateToVietnamese(transcript)
        .then(res => setTranslatedText(res))
        .finally(() => setIsLoadingTrans(false));
    }
  }, [showTranscript, transcript, translatedText]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
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
  };

  const handleAudioLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration || 0);
      setAudioError(false);
    }
  };

  const handleAudioTimeUpdate = () => {
    if (audioRef.current) {
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

  const playTTS = () => {
    if (!('speechSynthesis' in window) || !transcript) {
      alert('Trình duyệt không hỗ trợ Web Speech API.');
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = transcript
      .replace(/Person [A-D]:/g, '')
      .replace(/W:|M:/g, '')
      .replace(/\[\d+\]/g, '')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = playbackRate;
    utterance.lang = 'en-US';

    const voices = window.speechSynthesis.getVoices();
    const englishVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('David')));
    if (englishVoice) {
      utterance.voice = englishVoice;
    }

    const words = cleanText.split(/\s+/).length;
    const estDuration = Math.max(5, (words / (140 * playbackRate)) * 60);
    setDuration(estDuration);

    const startTime = Date.now();
    if (ttsIntervalRef.current) clearInterval(ttsIntervalRef.current);

    ttsIntervalRef.current = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      setCurrentTime(Math.min(elapsed, estDuration));
    }, 250);

    utterance.onend = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      if (ttsIntervalRef.current) clearInterval(ttsIntervalRef.current);
      const newCount = playCount + 1;
      setPlayCount(newCount);
      if (onPlayCountChange) onPlayCountChange(newCount);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      if (ttsIntervalRef.current) clearInterval(ttsIntervalRef.current);
    };

    speechRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
  };

  const togglePlay = () => {
    if (isPlaying) {
      stopAllPlayback();
    } else {
      if (useTTS || audioError) {
        playTTS();
      } else if (audioRef.current) {
        audioRef.current.play().then(() => {
          setIsPlaying(true);
        }).catch(() => {
          setUseTTS(true);
          playTTS();
        });
      }
    }
  };

  const handleSeek = (e) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (!useTTS && audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  const handleRewind = () => {
    if (!useTTS && audioRef.current) {
      audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 5);
    } else {
      setCurrentTime(prev => Math.max(0, prev - 5));
    }
  };

  const handleFastForward = () => {
    if (!useTTS && audioRef.current) {
      audioRef.current.currentTime = Math.min(duration, audioRef.current.currentTime + 5);
    } else {
      setCurrentTime(prev => Math.min(duration, prev + 5));
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
    }
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (audioRef.current) {
      audioRef.current.volume = val;
      audioRef.current.muted = val === 0;
    }
    setIsMuted(val === 0);
  };

  const formatTime = (seconds) => {
    if (isNaN(seconds) || seconds === 0) return '00:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div style={{
      padding: '0.85rem 1.15rem',
      borderRadius: 'var(--radius-sm)',
      marginBottom: '0.5rem',
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

      {/* Row 1: Header tags, Speed, Mode, Script Toggle */}
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
            justifyContent: 'center'
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
              background: 'rgba(234, 179, 8, 0.15)',
              color: '#d97706',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '3px'
            }}>
              <Sparkles size={10} /> AI Voice (TTS)
            </span>
          )}
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Lượt nghe: <strong style={{ color: playCount >= maxPlays ? 'var(--danger)' : 'var(--primary)' }}>{playCount}</strong>/{maxPlays}
          </span>
        </div>

        {/* Right action pills: Speed & Script */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <div style={{ display: 'flex', background: 'var(--bg-hover)', borderRadius: '6px', padding: '2px', border: '1px solid var(--border)' }}>
            {[0.75, 1, 1.25, 1.5].map((rate) => (
              <button
                key={rate}
                onClick={() => setPlaybackRate(rate)}
                style={{
                  padding: '2px 6px',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  borderRadius: '4px',
                  border: 'none',
                  background: playbackRate === rate ? 'var(--primary)' : 'transparent',
                  color: playbackRate === rate ? '#fff' : 'var(--text-muted)',
                  cursor: 'pointer'
                }}
              >
                {rate}x
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              stopAllPlayback();
              setUseTTS(!useTTS);
            }}
            title="Đổi nguồn âm thanh"
            style={{
              padding: '3px 8px',
              borderRadius: '6px',
              border: '1px solid var(--border)',
              background: useTTS ? 'rgba(59, 130, 246, 0.1)' : '#fff',
              color: useTTS ? 'var(--primary)' : 'var(--text-muted)',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            {useTTS ? 'AI Voice' : 'Original MP3'}
          </button>

          <button
            onClick={() => setShowTranscript(!showTranscript)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '3px 9px',
              borderRadius: '6px',
              border: '1px solid var(--border)',
              background: showTranscript ? 'rgba(16, 185, 129, 0.1)' : '#fff',
              color: showTranscript ? 'var(--success)' : 'var(--text-muted)',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            {showTranscript ? <EyeOff size={13} /> : <Eye size={13} />}
            {showTranscript ? 'Hide Script' : 'Show Script'}
          </button>
        </div>
      </div>

      {/* Row 2: Playback controls & Seek timeline */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
        <button
          onClick={handleRewind}
          title="Tua lùi 5s"
          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '2px', display: 'flex' }}
        >
          <Rewind size={16} />
        </button>

        <button
          onClick={togglePlay}
          style={{
            width: '34px',
            height: '34px',
            borderRadius: '50%',
            background: 'var(--primary)',
            color: '#fff',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            flexShrink: 0
          }}
        >
          {isPlaying ? <Pause size={16} /> : <Play size={16} style={{ marginLeft: '2px' }} />}
        </button>

        <button
          onClick={handleFastForward}
          title="Tua tới 5s"
          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '2px', display: 'flex' }}
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
          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '2px', display: 'flex' }}
        >
          {isMuted || volume === 0 ? <VolumeX size={15} /> : <Volume2 size={15} />}
        </button>
      </div>

      {/* Transcript & Vietnamese Translation Collapsible Box */}
      {showTranscript && transcript && (
        <div style={{
          marginTop: '0.85rem',
          padding: '0.85rem 1rem',
          borderRadius: '10px',
          background: 'rgba(0, 0, 0, 0.2)',
          borderLeft: '3px solid var(--primary)',
          fontSize: '0.86rem',
          lineHeight: '1.6',
          color: 'var(--text-main)',
          animation: 'fadeIn 0.2s ease'
        }}>
          {/* Transcript English */}
          <div style={{ marginBottom: '0.75rem' }}>
            <div style={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--primary)', marginBottom: '0.25rem' }}>
              Transcript:
            </div>
            <div style={{ fontStyle: 'italic', color: 'var(--text-main)' }}>
              "{transcript}"
            </div>
          </div>

          {/* Translation Vietnamese */}
          <div style={{ borderTop: '1px dashed var(--border-color)', paddingTop: '0.6rem' }}>
            <div style={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--success)', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Languages size={13} /> Dịch nghĩa (Translate):
            </div>
            <div style={{ color: 'var(--text-muted)' }}>
              {isLoadingTrans ? 'Đang dịch...' : (translatedText || 'Đang tải bản dịch...')}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AudioPlayerBar;
