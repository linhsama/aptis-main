import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Edit3,
  CheckCircle,
  FileText,
  Mail,
  Users,
  MessageSquare,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Award,
  RotateCcw
} from 'lucide-react';
import writingData from '../../data/writing_sets.json';

const WritingDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    'part-1': { attempted: 0, total: writingData.length },
    'part-2': { attempted: 0, total: writingData.length },
    'part-3': { attempted: 0, total: writingData.length },
    'part-4': { attempted: 0, total: writingData.length }
  });

  useEffect(() => {
    try {
      const history = JSON.parse(localStorage.getItem('aptis_writing_history') || '[]');
      const newStats = {
        'part-1': { attempted: 0, total: writingData.length },
        'part-2': { attempted: 0, total: writingData.length },
        'part-3': { attempted: 0, total: writingData.length },
        'part-4': { attempted: 0, total: writingData.length }
      };

      history.forEach(item => {
        if (newStats[item.part]) {
          newStats[item.part].attempted++;
        }
      });

      setStats(newStats);
    } catch (e) {
      console.error(e);
    }
  }, []);

  const totalAttempted = Object.values(stats).reduce((acc, curr) => acc + curr.attempted, 0);
  const totalTasks = writingData.length * 4;
  const overallPercentage = Math.round((totalAttempted / totalTasks) * 100);

  const partsConfig = [
    {
      id: 'part-1',
      title: 'Part 1: Form Filling',
      subtitle: 'Điền biểu mẫu thông tin (5 câu hỏi ngắn)',
      desc: 'Trả lời 5 câu hỏi nhanh bằng 1 - 5 từ, giúp hoàn thiện hồ sơ đăng ký thành viên.',
      badge: '1 - 5 từ/câu',
      itemCount: `${writingData.length} bộ đề`,
      time: '~3 phút/đề',
      icon: <FileText size={28} color="var(--primary)" />,
      route: '/practice/writing/part-1',
      color: '#3b82f6'
    },
    {
      id: 'part-2',
      title: 'Part 2: Short Form Writing',
      subtitle: 'Viết câu ngắn tham gia CLB (20 - 30 từ)',
      desc: 'Viết một đoạn văn ngắn giải thích lý do, sở thích hoặc trải nghiệm cá nhân liên quan đến chủ đề CLB.',
      badge: '20 - 30 từ',
      itemCount: `${writingData.length} bộ đề`,
      time: '~7 phút/đề',
      icon: <Edit3 size={28} color="#10b981" />,
      route: '/practice/writing/part-2',
      color: '#10b981'
    },
    {
      id: 'part-3',
      title: 'Part 3: Social Club Chat',
      subtitle: 'Trả lời thảo luận nhóm mạng xã hội (3 câu)',
      desc: 'Phản hồi 3 tin nhắn thảo luận từ các thành viên trong câu lạc bộ (30 - 40 từ mỗi câu).',
      badge: '30 - 40 từ/câu',
      itemCount: `${writingData.length} bộ đề`,
      time: '~10 phút/đề',
      icon: <MessageSquare size={28} color="#f59e0b" />,
      route: '/practice/writing/part-3',
      color: '#f59e0b'
    },
    {
      id: 'part-4',
      title: 'Part 4: Email Writing',
      subtitle: 'Viết 2 Email (Thân mật & Trang trọng)',
      desc: 'Task 1: Email gửi bạn (~50 từ). Task 2: Email trang trọng gửi Chủ tịch CLB (120 - 150 từ).',
      badge: '50 từ & 120-150 từ',
      itemCount: `${writingData.length} bộ đề`,
      time: '~30 phút/đề',
      icon: <Mail size={28} color="#8b5cf6" />,
      route: '/practice/writing/part-4',
      color: '#8b5cf6'
    }
  ];

  return (
    <div className="practice-container">
      {/* Hero Header */}
      <div className="practice-top-card" style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', color: '#fff', border: 'none' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
              <span className="skill-pill-tag" style={{ background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', borderColor: 'rgba(59, 130, 246, 0.4)' }}>
                APTIS WRITING MASTERY
              </span>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>• 40 Bộ Đề Thi Thật Đầy Đủ</span>
            </div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '0 0 0.4rem 0', color: '#fff' }}>
              Luyện Thi Aptis Writing Toàn Diện
            </h1>
            <p style={{ color: '#cbd5e1', fontSize: '0.9rem', margin: 0, maxWidth: '650px' }}>
              Rèn luyện kỹ năng viết câu, trả lời hội thoại mạng xã hội và viết email chuẩn văn phong thân mật & trang trọng với bộ đếm từ thông minh và bài mẫu Band C.
            </p>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.08)', padding: '1rem 1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255, 255, 255, 0.12)', textAlign: 'center', minWidth: '150px' }}>
            <div style={{ fontSize: '0.78rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Tiến độ chung</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#60a5fa', margin: '0.2rem 0' }}>
              {overallPercentage}%
            </div>
            <div style={{ fontSize: '0.78rem', color: '#cbd5e1' }}>
              {totalAttempted} / {totalTasks} bài đã viết
            </div>
          </div>
        </div>
      </div>

      {/* 4 Parts Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
        {partsConfig.map(part => {
          const partStat = stats[part.id] || { attempted: 0, total: writingData.length };
          const percent = Math.round((partStat.attempted / partStat.total) * 100);

          return (
            <div
              key={part.id}
              className="panel-card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '1.35rem',
                borderTop: `4px solid ${part.color}`,
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: 'pointer'
              }}
              onClick={() => navigate(part.route)}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.85rem' }}>
                  <div style={{ background: 'var(--bg-hover)', padding: '0.6rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                    {part.icon}
                  </div>
                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '0.2rem 0.55rem',
                    borderRadius: 'var(--radius-full)',
                    background: `${part.color}15`,
                    color: part.color,
                    border: `1px solid ${part.color}30`
                  }}>
                    {part.badge}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', margin: '0 0 0.25rem 0' }}>
                  {part.title}
                </h3>
                <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary)', margin: '0 0 0.5rem 0' }}>
                  {part.subtitle}
                </p>
                <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', lineHeight: '1.5', margin: 0 }}>
                  {part.desc}
                </p>
              </div>

              <div style={{ marginTop: '1.25rem', paddingTop: '0.85rem', borderTop: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                  <span>{part.itemCount} • {part.time}</span>
                  <strong>{partStat.attempted}/{partStat.total} bài ({percent}%)</strong>
                </div>

                <div style={{ width: '100%', height: '6px', background: 'var(--bg-hover)', borderRadius: 'var(--radius-full)', overflow: 'hidden', marginBottom: '1rem' }}>
                  <div style={{ width: `${percent}%`, height: '100%', background: part.color, borderRadius: 'var(--radius-full)', transition: 'width 0.3s ease' }}></div>
                </div>

                <button
                  className="btn btn-primary"
                  style={{ width: '100%', justifyContent: 'center', background: part.color, borderColor: part.color }}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(part.route);
                  }}
                >
                  <span>Bắt đầu luyện tập</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WritingDashboard;
