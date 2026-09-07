import React, { useState } from 'react';
import {
  BookOpen,
  X,
  Sparkles,
  Zap,
  CheckCircle2,
  Copy,
  Check,
  Layers,
  HelpCircle,
  Lightbulb,
  Compass
} from 'lucide-react';
import templateData from '../../data/highScoreTemplates.json';

const TemplateLearningModal = ({
  isOpen,
  onClose,
  skill = 'writing',
  partKey = 'part2',
  onApplyTemplate
}) => {
  const [copiedIndex, setCopiedIndex] = useState(null);

  if (!isOpen) return null;

  const partInfo = templateData[skill]?.[partKey] || {
    name: 'Khung Cấu Trúc & Template Band Cao',
    tips: 'Sử dụng cấu trúc câu chuẩn Band C và các từ nối học thuật để đạt điểm tối đa.',
    templates: []
  };

  const handleCopy = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="ai-modal-overlay" onClick={onClose}>
      <div className="ai-modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '820px' }}>
        {/* Modal Header */}
        <div className="ai-modal-header" style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #ecfdf5 100%)' }}>
          <div className="ai-modal-header-left">
            <div
              className="ai-modal-icon-badge"
              style={{ background: 'linear-gradient(135deg, #059669, #10b981)', boxShadow: '0 4px 10px rgba(16, 185, 129, 0.3)' }}
            >
              <BookOpen size={20} />
            </div>
            <div>
              <h3 className="ai-modal-title">
                {partInfo.name} - Template Học Band Cao
              </h3>
              <div className="ai-modal-subtitle">
                Công thức & Khung câu mẫu tự nhiên chinh phục Band B2 / C1 / C2
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

        {/* Modal Body Content */}
        <div className="ai-modal-body">
          {/* Tips Banner */}
          <div style={{
            padding: '0.9rem 1.15rem',
            borderRadius: '14px',
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px'
          }}>
            <Lightbulb size={18} color="#059669" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong style={{ fontSize: '0.86rem', color: '#047857', display: 'block', marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                Bí quyết đạt điểm cao:
              </strong>
              <p style={{ margin: 0, fontSize: '0.84rem', color: '#166534', lineHeight: '1.5' }}>
                {partInfo.tips}
              </p>
            </div>
          </div>

          {/* List of Templates */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {partInfo.templates?.map((tpl, tIdx) => (
              <div
                key={tIdx}
                style={{
                  padding: '1.15rem 1.25rem',
                  borderRadius: '16px',
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.03)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem'
                }}
              >
                {/* Template Item Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                      fontSize: '0.74rem',
                      fontWeight: 800,
                      padding: '3px 8px',
                      borderRadius: '6px',
                      background: '#ecfdf5',
                      color: '#059669',
                      border: '1px solid #a7f3d0'
                    }}>
                      TEMPLATE {tIdx + 1}
                    </span>
                    <h4 style={{ margin: 0, fontSize: '0.96rem', fontWeight: 800, color: '#0f172a' }}>
                      {tpl.name}
                    </h4>
                  </div>

                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      onClick={() => handleCopy(tpl.scaffold || tpl.pattern || '', tIdx)}
                      className="ai-action-btn-sm"
                      title="Sao chép khung mẫu"
                    >
                      {copiedIndex === tIdx ? <Check size={13} color="#10b981" /> : <Copy size={13} />}
                      <span>{copiedIndex === tIdx ? 'Đã sao chép' : 'Sao chép'}</span>
                    </button>
                    {onApplyTemplate && (tpl.scaffold || tpl.pattern) && (
                      <button
                        onClick={() => {
                          onApplyTemplate(tpl.scaffold || tpl.pattern);
                          onClose();
                        }}
                        className="ai-action-btn-primary"
                        style={{ background: '#059669' }}
                        title="Chèn khung này vào ô làm bài"
                      >
                        <Zap size={13} />
                        <span>Chèn vào bài làm</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Structure / Formula */}
                {tpl.structure && (
                  <div style={{
                    fontSize: '0.8rem',
                    color: '#4338ca',
                    fontWeight: 600,
                    background: '#eef2ff',
                    border: '1px solid #c7d2fe',
                    padding: '5px 10px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}>
                    <span>🎯</span>
                    <span><strong>Cấu trúc:</strong> {tpl.structure}</span>
                  </div>
                )}

                {/* Scaffold Text Box */}
                {(tpl.scaffold || tpl.pattern) && (
                  <div style={{
                    padding: '0.85rem 1rem',
                    borderRadius: '10px',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderLeft: '4px solid #10b981',
                    fontSize: '0.88rem',
                    color: '#1e293b',
                    lineHeight: '1.6',
                    fontFamily: 'inherit',
                    whiteSpace: 'pre-wrap'
                  }}>
                    {tpl.scaffold || tpl.pattern}
                  </div>
                )}

                {/* Useful Connectors */}
                {tpl.connectors && tpl.connectors.length > 0 && (
                  <div>
                    <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '5px' }}>
                      Cụm từ vựng & Liên từ ăn điểm:
                    </span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                      {tpl.connectors.map((c, cIdx) => (
                        <span
                          key={cIdx}
                          style={{
                            fontSize: '0.78rem',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            background: '#f1f5f9',
                            border: '1px solid #cbd5e1',
                            color: '#334155',
                            fontWeight: 500
                          }}
                        >
                          ✦ {c}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Examples */}
                {tpl.examples && tpl.examples.length > 0 && (
                  <div>
                    <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '4px' }}>
                      Ví dụ ứng dụng mẫu:
                    </span>
                    <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.82rem', color: '#475569', lineHeight: '1.5' }}>
                      {tpl.examples.map((ex, eIdx) => (
                        <li key={eIdx}>{ex}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="ai-modal-footer">
          <button onClick={onClose} className="btn btn-secondary" style={{ padding: '0.55rem 1.6rem', fontSize: '0.9rem' }}>
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default TemplateLearningModal;
