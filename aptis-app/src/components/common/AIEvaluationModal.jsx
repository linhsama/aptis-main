import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  X,
  Award,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Zap,
  TrendingUp,
  FileCheck,
  Languages,
  BookOpen
} from 'lucide-react';
import { translateToVietnamese } from '../../utils/translate';

const AIEvaluationModal = ({ isOpen, onClose, evaluationResult, onApplyUpgraded }) => {
  const [copied, setCopied] = useState(false);
  const [upgradedTranslation, setUpgradedTranslation] = useState('');
  const [showTranslation, setShowTranslation] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);

  useEffect(() => {
    if (isOpen && evaluationResult?.upgradedAnswer) {
      setIsTranslating(true);
      translateToVietnamese(evaluationResult.upgradedAnswer)
        .then(res => {
          setUpgradedTranslation(res);
          setIsTranslating(false);
        })
        .catch(() => setIsTranslating(false));
    }
  }, [isOpen, evaluationResult?.upgradedAnswer]);

  if (!isOpen || !evaluationResult) return null;

  const {
    band = 'B2',
    bandTitle = 'Vận dụng tốt',
    overallScore = 0,
    maxScore = 50,
    wordCount,
    criteria = {},
    strengths = [],
    suggestions = [],
    upgradedAnswer
  } = evaluationResult;

  const handleCopy = () => {
    if (upgradedAnswer) {
      navigator.clipboard.writeText(upgradedAnswer);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Color mappings based on Band
  const getBandStyles = (b) => {
    if (b.includes('C')) {
      return {
        color: '#059669',
        bg: '#ecfdf5',
        border: '#a7f3d0',
        badgeBg: '#10b981',
        barColor: '#10b981'
      };
    }
    if (b.includes('B2')) {
      return {
        color: '#2563eb',
        bg: '#eff6ff',
        border: '#bfdbfe',
        badgeBg: '#3b82f6',
        barColor: '#3b82f6'
      };
    }
    if (b.includes('B1')) {
      return {
        color: '#d97706',
        bg: '#fffbeb',
        border: '#fde68a',
        badgeBg: '#f59e0b',
        barColor: '#f59e0b'
      };
    }
    return {
      color: '#dc2626',
      bg: '#fef2f2',
      border: '#fecaca',
      badgeBg: '#ef4444',
      barColor: '#ef4444'
    };
  };

  const bandStyle = getBandStyles(band);
  const scorePercent = Math.min(100, Math.round((overallScore / (maxScore || 50)) * 100));

  return (
    <div className="ai-modal-overlay" onClick={onClose}>
      <div className="ai-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="ai-modal-header">
          <div className="ai-modal-header-left">
            <div className="ai-modal-icon-badge">
              <Sparkles size={20} />
            </div>
            <div>
              <h3 className="ai-modal-title">Kết Quả Đánh Giá & Chấm Điểm AI</h3>
              <div className="ai-modal-subtitle">
                Đánh giá theo 4 tiêu chí chuẩn Aptis ESOL & Khung tham chiếu CEFR
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="menu-btn"
            style={{ borderRadius: '50%', width: '36px', height: '36px' }}
            title="Đóng"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="ai-modal-body">
          {/* Hero Band Summary Card */}
          <div className="ai-hero-card" style={{ borderColor: bandStyle.border, background: `linear-gradient(135deg, #ffffff 0%, ${bandStyle.bg} 100%)` }}>
            <div className="ai-hero-left">
              <div
                className="ai-band-badge-lg"
                style={{
                  background: bandStyle.bg,
                  color: bandStyle.color,
                  border: `2px solid ${bandStyle.border}`
                }}
              >
                {band.split('/')[0].trim()}
              </div>
              <div className="ai-hero-title-group">
                <span className="ai-hero-label">Dự đoán kết quả</span>
                <span className="ai-hero-band-name" style={{ color: bandStyle.color }}>
                  Band {band} • {bandTitle}
                </span>
                {wordCount !== undefined && (
                  <span style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>
                    Độ dài bài viết: <strong>{wordCount} từ</strong>
                  </span>
                )}
              </div>
            </div>

            <div className="ai-hero-right">
              <span className="ai-hero-label">Tổng điểm đạt được</span>
              <div className="ai-hero-score-num">
                <span style={{ color: bandStyle.color }}>{overallScore}</span>
                <span style={{ color: '#94a3b8', fontSize: '1rem', fontWeight: 600 }}> / {maxScore} pts</span>
              </div>
              <div className="ai-hero-progress-bar-bg">
                <div
                  className="ai-hero-progress-bar-fill"
                  style={{ width: `${scorePercent}%`, background: bandStyle.barColor }}
                />
              </div>
            </div>
          </div>

          {/* 4 Criteria Details */}
          {criteria && (
            <div>
              <div className="ai-section-title">
                <FileCheck size={16} color="#3b82f6" />
                <span>4 Tiêu Chí Chấm Điểm Chi Tiết</span>
              </div>
              <div className="ai-criteria-grid">
                {/* 1. Task Fulfillment */}
                {criteria.taskAchievement && (
                  <div className="ai-criteria-card">
                    <div className="ai-criteria-header">
                      <span className="ai-criteria-name">1. Task Fulfillment (Yêu cầu đề)</span>
                      <span className="ai-criteria-score-tag" style={{ background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0' }}>
                        {criteria.taskAchievement.score}/{criteria.taskAchievement.max}
                      </span>
                    </div>
                    <p className="ai-criteria-comment">{criteria.taskAchievement.comment}</p>
                  </div>
                )}

                {/* 2. Grammar */}
                {criteria.grammar && (
                  <div className="ai-criteria-card">
                    <div className="ai-criteria-header">
                      <span className="ai-criteria-name">2. Grammar Range & Accuracy</span>
                      <span className="ai-criteria-score-tag" style={{ background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe' }}>
                        {criteria.grammar.score}/{criteria.grammar.max}
                      </span>
                    </div>
                    <p className="ai-criteria-comment">{criteria.grammar.comment}</p>
                  </div>
                )}

                {/* 3. Vocabulary */}
                {criteria.vocabulary && (
                  <div className="ai-criteria-card">
                    <div className="ai-criteria-header">
                      <span className="ai-criteria-name">3. Vocabulary & Collocations</span>
                      <span className="ai-criteria-score-tag" style={{ background: '#f5f3ff', color: '#7c3aed', border: '1px solid #ddd6fe' }}>
                        {criteria.vocabulary.score}/{criteria.vocabulary.max}
                      </span>
                    </div>
                    <p className="ai-criteria-comment">{criteria.vocabulary.comment}</p>
                  </div>
                )}

                {/* 4. Cohesion */}
                {criteria.cohesion && (
                  <div className="ai-criteria-card">
                    <div className="ai-criteria-header">
                      <span className="ai-criteria-name">4. Cohesion & Flow</span>
                      <span className="ai-criteria-score-tag" style={{ background: '#fffbeb', color: '#d97706', border: '1px solid #fde68a' }}>
                        {criteria.cohesion.score}/{criteria.cohesion.max}
                      </span>
                    </div>
                    <p className="ai-criteria-comment">{criteria.cohesion.comment}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Strengths & Improvements */}
          <div className="ai-feedback-grid">
            {strengths && strengths.length > 0 && (
              <div className="ai-feedback-box strengths">
                <div className="ai-feedback-title">
                  <CheckCircle2 size={16} />
                  <span>Điểm Mạnh Nổi Bật</span>
                </div>
                <ul className="ai-feedback-list">
                  {strengths.map((s, idx) => (
                    <li key={idx} style={{ marginBottom: idx < strengths.length - 1 ? '4px' : 0 }}>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {suggestions && suggestions.length > 0 && (
              <div className="ai-feedback-box improvements">
                <div className="ai-feedback-title">
                  <AlertCircle size={16} />
                  <span>Lỗi Cần Khắc Phục & Góp Ý</span>
                </div>
                <ul className="ai-feedback-list">
                  {suggestions.map((s, idx) => (
                    <li key={idx} style={{ marginBottom: idx < suggestions.length - 1 ? '4px' : 0 }}>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Upgraded Band C Model Answer */}
          {upgradedAnswer && (
            <div className="ai-model-card">
              <div className="ai-model-header">
                <div className="ai-model-tag">
                  <Sparkles size={16} />
                  <span>Phiên Bản Nâng Cấp Chuẩn Band C (AI Model Answer)</span>
                </div>
                <div className="ai-model-actions">
                  <button
                    onClick={() => setShowTranslation(!showTranslation)}
                    className="ai-action-btn-sm"
                    title="Bật/tắt dịch tiếng Việt"
                  >
                    <Languages size={13} color="#4338ca" />
                    <span>{showTranslation ? 'Ẩn dịch' : 'Dịch song ngữ'}</span>
                  </button>
                  <button
                    onClick={handleCopy}
                    className="ai-action-btn-sm"
                    title="Sao chép bài mẫu"
                  >
                    {copied ? <Check size={13} color="#10b981" /> : <Copy size={13} />}
                    <span>{copied ? 'Đã sao chép' : 'Sao chép'}</span>
                  </button>
                  {onApplyUpgraded && (
                    <button
                      onClick={() => {
                        onApplyUpgraded(upgradedAnswer);
                        onClose();
                      }}
                      className="ai-action-btn-primary"
                      title="Điền nội dung bài mẫu vào ô làm bài"
                    >
                      <Zap size={13} />
                      <span>Áp dụng vào bài làm</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Model Text */}
              <div className="ai-model-text-box">
                "{upgradedAnswer}"
              </div>

              {/* Translation Text */}
              {showTranslation && (
                <div className="ai-translation-box">
                  <Languages size={15} color="#2563eb" style={{ marginTop: '2px', flexShrink: 0 }} />
                  <div>
                    <strong style={{ color: '#1d4ed8', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '2px', letterSpacing: '0.03em' }}>
                      Bản dịch tiếng Việt tham khảo:
                    </strong>
                    <span>{upgradedTranslation || (isTranslating ? 'Đang tải bản dịch...' : 'Không có bản dịch')}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="ai-modal-footer">
          <button onClick={onClose} className="btn btn-primary" style={{ padding: '0.55rem 1.6rem', fontSize: '0.9rem' }}>
            Đã hiểu
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIEvaluationModal;
