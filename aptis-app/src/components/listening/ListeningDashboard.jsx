import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Headphones,
  Users,
  MessageSquareQuote,
  Radio,
  ArrowRight,
  Sparkles,
  Trophy,
  Clock,
  CheckCircle,
  AlertCircle,
  Flame,
  Award
} from 'lucide-react';
import part1Data from '../../data/listening_part1.json';
import part2Data from '../../data/listening_part2.json';
import part3Data from '../../data/listening_part3.json';
import part4Data from '../../data/listening_part4.json';

const ListeningDashboard = () => {
  const navigate = useNavigate();

  // Compute stats from localStorage
  const stats = useMemo(() => {
    try {
      const history = JSON.parse(localStorage.getItem('aptis_listening_history') || '[]');
      let totalAttempted = history.length;
      let totalCorrect = 0;
      let totalTime = 0;
      const partStats = {
        'part-1': { attempted: 0, correct: 0, total: part1Data.length },
        'part-2': { attempted: 0, correct: 0, total: part2Data.length },
        'part-3': { attempted: 0, correct: 0, total: part3Data.length },
        'part-4': { attempted: 0, correct: 0, total: part4Data.length }
      };

      const weakSet = new Set();

      history.forEach(item => {
        totalCorrect += item.score || 0;
        totalTime += item.timeSpent || 0;
        if (item.part && partStats[item.part]) {
          partStats[item.part].attempted += 1;
          partStats[item.part].correct += item.score || 0;
        }
        if (item.score < item.total) {
          weakSet.add(item.id);
        }
      });

      return {
        totalAttempted,
        totalCorrect,
        accuracy: totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0,
        totalTimeMinutes: Math.round(totalTime / 60),
        weakCount: weakSet.size,
        partStats
      };
    } catch (e) {
      return { totalAttempted: 0, totalCorrect: 0, accuracy: 0, totalTimeMinutes: 0, weakCount: 0, partStats: {} };
    }
  }, []);

  const parts = [
    {
      id: 'part-1',
      title: 'Part 1: Information Recognition',
      subtitle: 'Questions 1 – 13',
      description: 'Nghe các đoạn hội thoại hoặc thông báo ngắn và chọn 1 trong 3 đáp án (A, B, C). Tập trung vào từ khóa, thời gian, địa điểm, số lượng.',
      itemCount: `${part1Data.length} câu hỏi`,
      icon: <Headphones size={32} />,
      color: '#3b82f6', // blue
      bgColor: 'rgba(59, 130, 246, 0.12)',
      path: '/practice/listening/part-1'
    },
    {
      id: 'part-2',
      title: 'Part 2: Information Matching',
      subtitle: 'Question 14',
      description: 'Lắng nghe 4 người nói (Person A, B, C, D) thảo luận về 1 chủ đề và nối từng người với ý kiến tương ứng trong danh sách 6 phát biểu.',
      itemCount: `${part2Data.length} bộ đề`,
      icon: <Users size={32} />,
      color: '#10b981', // emerald
      bgColor: 'rgba(16, 185, 129, 0.12)',
      path: '/practice/listening/part-2'
    },
    {
      id: 'part-3',
      title: 'Part 3: Opinion Matching',
      subtitle: 'Question 15',
      description: 'Lắng nghe cuộc đối thoại giữa Man (Nam) và Woman (Nữ), sau đó xác định ai đồng ý với 4 nhận định: Man, Woman hay Both.',
      itemCount: `${part3Data.length} bộ đề`,
      icon: <MessageSquareQuote size={32} />,
      color: '#8b5cf6', // violet
      bgColor: 'rgba(139, 92, 246, 0.12)',
      path: '/practice/listening/part-3'
    },
    {
      id: 'part-4',
      title: 'Part 4: Monologue & Interview',
      subtitle: 'Questions 16 – 17',
      description: 'Lắng nghe 2 bài nói chuyện hoặc phỏng vấn dài và trả lời 2 câu hỏi trắc nghiệm (3 lựa chọn) cho mỗi bài nghe.',
      itemCount: `${part4Data.length} bộ đề`,
      icon: <Radio size={32} />,
      color: '#f59e0b', // amber
      bgColor: 'rgba(245, 158, 11, 0.12)',
      path: '/practice/listening/part-4'
    }
  ];

  return (
    <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '1rem 1rem 3rem' }}>
      {/* Hero Banner */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem', paddingTop: '1.5rem' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 16px',
          borderRadius: '20px',
          background: 'rgba(99, 102, 241, 0.12)',
          color: 'var(--primary)',
          fontWeight: 700,
          fontSize: '0.9rem',
          marginBottom: '1rem'
        }}>
          <Headphones size={18} /> APTIS LISTENING SUITE
        </div>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.75rem', color: 'var(--text-main)' }}>
          Aptis Listening Master
        </h1>
        <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', maxWidth: '650px', margin: '0 auto', lineHeight: '1.6' }}>
          Hệ thống luyện thi trọn bộ 4 phần nghe Aptis ESOL với Audio bản quyền, giọng đọc AI chuẩn bản ngữ, phụ đề script chi tiết và chấm điểm tức thì.
        </p>
      </div>

      {/* Stats Quick Bar */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1.25rem',
        marginBottom: '2.5rem'
      }}>
        <div className="glass" style={{ padding: '1.25rem', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Flame size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Lượt làm bài</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>{stats.totalAttempted}</div>
          </div>
        </div>

        <div className="glass" style={{ padding: '1.25rem', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Tỷ lệ chính xác</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#10b981' }}>{stats.accuracy}%</div>
          </div>
        </div>

        <div className="glass" style={{ padding: '1.25rem', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Clock size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Thời gian luyện</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>{stats.totalTimeMinutes} phút</div>
          </div>
        </div>

        <div className="glass" style={{ padding: '1.25rem', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AlertCircle size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Câu cần ôn lại</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ef4444' }}>{stats.weakCount}</div>
          </div>
        </div>
      </div>

      {/* Grid of 4 Parts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.75rem' }}>
        {parts.map((part) => {
          const partStat = stats.partStats[part.id];
          const completedCount = partStat?.attempted || 0;

          return (
            <div
              key={part.id}
              className="glass"
              style={{
                padding: '2rem',
                borderRadius: 'var(--radius-lg, 20px)',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.25s, box-shadow 0.25s',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden',
                border: '1px solid var(--border-color)'
              }}
              onClick={() => navigate(part.path)}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-6px)';
                e.currentTarget.style.boxShadow = `0 16px 32px ${part.bgColor}`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '18px',
                  background: part.bgColor,
                  color: part.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {part.icon}
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span style={{
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    padding: '4px 10px',
                    borderRadius: '20px',
                    background: 'rgba(255, 255, 255, 0.08)',
                    color: 'var(--text-muted)'
                  }}>
                    {part.itemCount}
                  </span>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Đã luyện: <strong>{completedCount}</strong> lượt
                  </div>
                </div>
              </div>

              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: part.color, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
                {part.subtitle}
              </div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-main)' }}>
                {part.title}
              </h2>
              <p style={{ color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '2rem', flex: 1, fontSize: '0.95rem' }}>
                {part.description}
              </p>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: '1rem',
                borderTop: '1px solid var(--border-color)',
                marginTop: 'auto'
              }}>
                <span style={{ color: part.color, fontWeight: 700, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  Luyện tập ngay <ArrowRight size={18} />
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Sparkles size={14} color={part.color} /> Audio + AI TTS
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ListeningDashboard;
