import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Target, FileText, Users, ArrowRight, CheckCircle } from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();

  const parts = [
    {
      id: 'part-1',
      title: 'Part 1: Sentence Comprehension',
      description: 'Choose the correct word (from three options) to complete a sentence. Focuses on grammar and vocabulary.',
      icon: <FileText size={32} />,
      color: '#3b82f6', // blue
      bgColor: 'rgba(59, 130, 246, 0.1)',
      path: '/practice/reading/part-1'
    },
    {
      id: 'part-2',
      title: 'Part 2: Text Cohesion',
      description: 'Reorder sentences to form a logical story. Tests your ability to link ideas and understand context.',
      icon: <Target size={32} />,
      color: '#10b981', // emerald
      bgColor: 'rgba(16, 185, 129, 0.1)',
      path: '/practice/reading/part-2'
    },
    {
      id: 'part-3',
      title: 'Part 3: Opinion Matching',
      description: 'Read short texts from four people and match their opinions to a list of statements.',
      icon: <Users size={32} />,
      color: '#8b5cf6', // violet
      bgColor: 'rgba(139, 92, 246, 0.1)',
      path: '/practice/reading/part-3'
    },
    {
      id: 'part-4',
      title: 'Part 4: Long Text Comprehension',
      description: 'Match a list of headings to paragraphs in a long text. One heading is always extra.',
      icon: <BookOpen size={32} />,
      color: '#f59e0b', // amber
      bgColor: 'rgba(245, 158, 11, 0.1)',
      path: '/practice/reading/part-4'
    }
  ];

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '1rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem', paddingTop: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: 'var(--text-main)' }}>Aptis Reading Master</h1>
        <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto' }}>
          Welcome back! Select a reading part below to start practicing. Master all four parts to achieve your target Aptis score.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        {parts.map((part) => (
          <div 
            key={part.id} 
            className="glass" 
            style={{ 
              padding: '2rem', 
              borderRadius: 'var(--radius-lg)', 
              display: 'flex', 
              flexDirection: 'column',
              transition: 'transform 0.2s, box-shadow 0.2s',
              cursor: 'pointer',
              position: 'relative',
              overflow: 'hidden'
            }}
            onClick={() => navigate(part.path)}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px)';
              e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
            }}
          >
            <div style={{ 
              width: '64px', 
              height: '64px', 
              borderRadius: '16px', 
              background: part.bgColor, 
              color: part.color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1.5rem'
            }}>
              {part.icon}
            </div>
            
            <h2 style={{ fontSize: '1.3rem', marginBottom: '1rem', color: 'var(--text-main)' }}>{part.title}</h2>
            <p style={{ color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '2rem', flex: 1 }}>
              {part.description}
            </p>
            
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              color: part.color, 
              fontWeight: 600,
              fontSize: '1rem',
              gap: '0.5rem',
              marginTop: 'auto'
            }}>
              Practice Now <ArrowRight size={18} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
