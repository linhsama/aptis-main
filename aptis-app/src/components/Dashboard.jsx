import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Target,
  FileText,
  Users,
  ArrowRight,
  Headphones,
  MessageSquareQuote,
  Radio,
  Sparkles,
  Edit3,
  Mail,
  MessageSquare,
  Mic,
  Images,
  Image as ImageIcon
} from 'lucide-react';
import part1Data from '../data/part1.json';
import part2Data from '../data/part2.json';
import part3Data from '../data/part3.json';
import part4Data from '../data/part4.json';
import listeningP1 from '../data/listening_part1.json';
import listeningP2 from '../data/listening_part2.json';
import listeningP3 from '../data/listening_part3.json';
import listeningP4 from '../data/listening_part4.json';
import writingSets from '../data/writing_sets.json';
import speakingP1 from '../data/speaking_part1.json';
import speakingP2 from '../data/speaking_part2.json';
import speakingP3 from '../data/speaking_part3.json';
import speakingP4 from '../data/speaking_part4.json';

const Dashboard = () => {
  const navigate = useNavigate();

  const skills = [
    {
      name: 'Reading Skill (Kỹ Năng Đọc)',
      icon: <BookOpen size={24} />,
      color: '#3b82f6',
      bgColor: 'rgba(59, 130, 246, 0.12)',
      parts: [
        {
          id: 'r-part-1',
          title: 'Part 1: Sentence Comprehension',
          description: 'Chọn từ chính xác điền vào chỗ trống trong đoạn văn ngắn.',
          count: `${part1Data.length} đề`,
          icon: <FileText size={26} />,
          color: '#3b82f6',
          bgColor: 'rgba(59, 130, 246, 0.12)',
          path: '/practice/reading/part-1'
        },
        {
          id: 'r-part-2',
          title: 'Part 2: Text Cohesion',
          description: 'Sắp xếp các câu xáo trộn thành một câu chuyện hoàn chỉnh.',
          count: `${part2Data.length} đề`,
          icon: <Target size={26} />,
          color: '#10b981',
          bgColor: 'rgba(16, 185, 129, 0.12)',
          path: '/practice/reading/part-2'
        },
        {
          id: 'r-part-3',
          title: 'Part 3: Opinion Matching',
          description: 'Đọc ý kiến của 4 người và ghép nối với các nhận định.',
          count: `${part3Data.length} đề`,
          icon: <Users size={26} />,
          color: '#8b5cf6',
          bgColor: 'rgba(139, 92, 246, 0.12)',
          path: '/practice/reading/part-3'
        },
        {
          id: 'r-part-4',
          title: 'Part 4: Long Text Comprehension',
          description: 'Ghép tiêu đề phù hợp cho các đoạn văn trong bài đọc dài.',
          count: `${part4Data.length} đề`,
          icon: <BookOpen size={26} />,
          color: '#f59e0b',
          bgColor: 'rgba(245, 158, 11, 0.12)',
          path: '/practice/reading/part-4'
        }
      ]
    },
    {
      name: 'Listening Skill (Kỹ Năng Nghe)',
      icon: <Headphones size={24} />,
      color: '#06b6d4',
      bgColor: 'rgba(6, 182, 212, 0.12)',
      parts: [
        {
          id: 'l-part-1',
          title: 'Part 1: Information Recognition',
          subtitle: 'Questions 1 – 13',
          description: 'Nghe đoạn thoại ngắn và chọn 1 trong 3 đáp án (A, B, C).',
          count: `${listeningP1.length} câu`,
          icon: <Headphones size={26} />,
          color: '#06b6d4',
          bgColor: 'rgba(6, 182, 212, 0.12)',
          path: '/practice/listening/part-1'
        },
        {
          id: 'l-part-2',
          title: 'Part 2: Information Matching',
          subtitle: 'Question 14',
          description: 'Nối ý kiến của 4 người nói (Person A, B, C, D) với 6 phát biểu.',
          count: `${listeningP2.length} đề`,
          icon: <Users size={26} />,
          color: '#10b981',
          bgColor: 'rgba(16, 185, 129, 0.12)',
          path: '/practice/listening/part-2'
        },
        {
          id: 'l-part-3',
          title: 'Part 3: Opinion Matching',
          subtitle: 'Question 15',
          description: 'Xác định quan điểm giữa Nam (Man) và Nữ (Woman) trong hội thoại.',
          count: `${listeningP3.length} đề`,
          icon: <MessageSquareQuote size={26} />,
          color: '#a855f7',
          bgColor: 'rgba(168, 85, 247, 0.12)',
          path: '/practice/listening/part-3'
        },
        {
          id: 'l-part-4',
          title: 'Part 4: Monologue & Interview',
          subtitle: 'Questions 16 – 17',
          description: 'Nghe bài phỏng vấn/độc thoại dài và trả lời 2 câu hỏi trắc nghiệm.',
          count: `${listeningP4.length} đề`,
          icon: <Radio size={26} />,
          color: '#ec4899',
          bgColor: 'rgba(236, 72, 153, 0.12)',
          path: '/practice/listening/part-4'
        }
      ]
    },
    {
      name: 'Writing Skill (Kỹ Năng Viết)',
      icon: <Edit3 size={24} />,
      color: '#10b981',
      bgColor: 'rgba(16, 185, 129, 0.12)',
      parts: [
        {
          id: 'w-part-1',
          title: 'Part 1: Form Filling',
          subtitle: '5 câu ngắn (1 - 5 từ)',
          description: 'Điền form thông tin cá nhân/câu lạc bộ với câu trả lời ngắn gọn.',
          count: `${writingSets.length} chủ đề`,
          icon: <FileText size={26} />,
          color: '#10b981',
          bgColor: 'rgba(16, 185, 129, 0.12)',
          path: '/practice/writing/part-1'
        },
        {
          id: 'w-part-2',
          title: 'Part 2: Short Form Text',
          subtitle: '20 – 30 từ',
          description: 'Viết đoạn văn ngắn hoàn chỉnh trả lời câu hỏi gia nhập câu lạc bộ.',
          count: `${writingSets.length} chủ đề`,
          icon: <Edit3 size={26} />,
          color: '#3b82f6',
          bgColor: 'rgba(59, 130, 246, 0.12)',
          path: '/practice/writing/part-2'
        },
        {
          id: 'w-part-3',
          title: 'Part 3: Social Club Chat',
          subtitle: '3 câu hỏi (30 – 40 từ)',
          description: 'Mô phỏng trả lời tin nhắn thảo luận trên diễn đàn CLB với 3 thành viên.',
          count: `${writingSets.length} chủ đề`,
          icon: <MessageSquare size={26} />,
          color: '#8b5cf6',
          bgColor: 'rgba(139, 92, 246, 0.12)',
          path: '/practice/writing/part-3'
        },
        {
          id: 'w-part-4',
          title: 'Part 4: Email Writing',
          subtitle: 'Email thân mật & trang trọng',
          description: 'Viết 2 email (bạn bè ~50 từ & ban quản trị 120-150 từ) phản hồi thông báo.',
          count: `${writingSets.length} chủ đề`,
          icon: <Mail size={26} />,
          color: '#f59e0b',
          bgColor: 'rgba(245, 158, 11, 0.12)',
          path: '/practice/writing/part-4'
        }
      ]
    },
    {
      name: 'Speaking Skill (Kỹ Năng Nói)',
      icon: <Mic size={24} />,
      color: '#f43f5e',
      bgColor: 'rgba(244, 63, 94, 0.12)',
      parts: [
        {
          id: 's-part-1',
          title: 'Part 1: Personal Information',
          subtitle: '3 câu hỏi (30s / câu)',
          description: 'Trả lời các câu hỏi phỏng vấn cá nhân ngắn về sở thích, công việc, đời sống.',
          count: `${speakingP1.length} câu hỏi`,
          icon: <Mic size={26} />,
          color: '#f43f5e',
          bgColor: 'rgba(244, 63, 94, 0.12)',
          path: '/practice/speaking/part-1'
        },
        {
          id: 's-part-2',
          title: 'Part 2: Describe Picture',
          subtitle: 'Miêu tả tranh & 2 câu hỏi (45s)',
          description: 'Miêu tả hình ảnh theo công thức 3 bước (Step 1-2-3) và trả lời mở rộng.',
          count: `${speakingP2.length} chủ đề`,
          icon: <ImageIcon size={26} />,
          color: '#ec4899',
          bgColor: 'rgba(236, 72, 153, 0.12)',
          path: '/practice/speaking/part-2'
        },
        {
          id: 's-part-3',
          title: 'Part 3: Compare Two Pictures',
          subtitle: 'So sánh 2 tranh & 2 câu hỏi (45s)',
          description: 'So sánh điểm giống/khác giữa 2 bức tranh và bày tỏ quan điểm cá nhân.',
          count: `${speakingP3.length} chủ đề`,
          icon: <Images size={26} />,
          color: '#a855f7',
          bgColor: 'rgba(168, 85, 247, 0.12)',
          path: '/practice/speaking/part-3'
        },
        {
          id: 's-part-4',
          title: 'Part 4: Personal Experience',
          subtitle: 'Thuyết trình 3 câu hỏi (2 phút)',
          description: 'Chuẩn bị 1 phút và nói liên tục 2 phút về trải nghiệm/cảm xúc cá nhân.',
          count: `${speakingP4.length} chủ đề`,
          icon: <Radio size={26} />,
          color: '#eab308',
          bgColor: 'rgba(234, 179, 8, 0.12)',
          path: '/practice/speaking/part-4'
        }
      ]
    }
  ];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1rem 1rem 3.5rem' }}>
      {/* Hero Welcome */}
      <div style={{ textAlign: 'center', marginBottom: '3rem', paddingTop: '1rem' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 16px',
          borderRadius: '20px',
          background: 'rgba(99, 102, 241, 0.12)',
          color: 'var(--primary)',
          fontWeight: 700,
          fontSize: '0.88rem',
          marginBottom: '1rem'
        }}>
          <Sparkles size={16} /> ALL-IN-ONE APTIS ESOL PREPARATION
        </div>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.75rem', color: 'var(--text-main)' }}>
          Aptis - Luyện Thi Aptis ESOL
        </h1>
        <p style={{ fontSize: '1.05rem', color: 'var(--text-muted)', maxWidth: '700px', margin: '0 auto', lineHeight: '1.6' }}>
          Đầy đủ trọn bộ 4 kỹ năng: <strong>Reading, Listening, Writing, Speaking</strong> với ngân hàng đề phong phú, âm thanh giọng đọc bản ngữ AI và hướng dẫn chi tiết từng câu.
        </p>
      </div>

      {/* SKILLS SECTIONS */}
      {skills.map((skill, sIdx) => (
        <div key={sIdx} style={{ marginBottom: '3.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: skill.bgColor,
              color: skill.color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {skill.icon}
            </div>
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                {skill.name}
              </h2>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Trọn bộ 4 phần luyện tập chuẩn format đề thi Aptis
              </span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.25rem' }}>
            {skill.parts.map((part) => (
              <div
                key={part.id}
                className="glass"
                style={{
                  padding: '1.5rem',
                  borderRadius: '18px',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  cursor: 'pointer',
                  border: '1px solid var(--border-color)'
                }}
                onClick={() => navigate(part.path)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.boxShadow = `0 12px 24px ${part.bgColor}`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '14px',
                    background: part.bgColor,
                    color: part.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {part.icon}
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '3px 8px', borderRadius: '12px', background: 'rgba(255,255,255,0.08)', color: 'var(--text-muted)' }}>
                    {part.count}
                  </span>
                </div>

                {part.subtitle && (
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: part.color, textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                    {part.subtitle}
                  </div>
                )}
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                  {part.title}
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: '1.5', marginBottom: '1.25rem', flex: 1 }}>
                  {part.description}
                </p>

                <div style={{ color: part.color, fontWeight: 700, fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '4px', marginTop: 'auto' }}>
                  Luyện ngay <ArrowRight size={16} />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Dashboard;
