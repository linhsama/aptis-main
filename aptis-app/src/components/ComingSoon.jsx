import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Clock, Sparkles } from 'lucide-react';

const ComingSoon = () => {
  const navigate = useNavigate();
  const { skill, part } = useParams();

  const getDisplayTitle = () => {
    let title = '';
    if (skill) title += skill.charAt(0).toUpperCase() + skill.slice(1);
    if (part) {
      const partName = part.split('-').map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
      title += ` - ${partName}`;
    }
    return title;
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center', paddingTop: '4rem' }}>
      <button 
        onClick={() => navigate('/dashboard')} 
        className="btn btn-secondary btn-small"
        style={{ position: 'absolute', top: '2rem', left: '2rem', background: 'transparent', border: 'none' }}
      >
        <ArrowLeft size={16} /> Back to Dashboard
      </button>

      <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '80px', height: '80px', borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary)', marginBottom: '2rem' }}>
        <Clock size={40} />
      </div>

      <h1 className="page-title" style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
        {getDisplayTitle() || 'Module'} Coming Soon
      </h1>

      <p className="text-muted" style={{ fontSize: '1.1rem', maxWidth: '500px', margin: '0 auto 3rem', lineHeight: 1.6 }}>
        We're working hard to bring you the best practice experience for this section. Check back later for updates!
      </p>

      <div className="panel-card" style={{ maxWidth: '600px', margin: '0 auto', background: 'linear-gradient(to right, #eff6ff, #f8fafc)', border: '1px solid var(--border)' }}>
        <Sparkles size={24} color="var(--primary)" style={{ margin: '0 auto 1rem' }} />
        <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Want to practice now?</h3>
        <p className="text-muted" style={{ marginBottom: '1.5rem' }}>
          Head over to Reading Part 2 & 3 to test your logic and sentence ordering skills.
        </p>
        <button className="btn" onClick={() => navigate('/practice/reading/part-2-3')} style={{ margin: '0 auto' }}>
          Practice Reading Part 2 & 3
        </button>
      </div>
    </div>
  );
};

export default ComingSoon;
