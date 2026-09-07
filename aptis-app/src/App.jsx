import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import {
  BookOpen,
  LayoutDashboard,
  Target,
  FileText,
  Headphones,
  Edit3,
  Menu,
  X,
  Settings,
  Users,
  MessageSquareQuote,
  Radio,
  Mail,
  MessageSquare,
  Mic,
  Images,
  Image as ImageIcon,
  ChevronDown,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import Dashboard from './components/Dashboard';

// Reading Components
import Practice from './components/Practice';
import PracticePart1 from './components/PracticePart1';
import PracticePart3 from './components/PracticePart3';
import PracticePart4 from './components/PracticePart4';

// Listening Components
import ListeningPart1 from './components/listening/ListeningPart1';
import ListeningPart2 from './components/listening/ListeningPart2';
import ListeningPart3 from './components/listening/ListeningPart3';
import ListeningPart4 from './components/listening/ListeningPart4';

// Writing Components
import WritingPart1 from './components/writing/WritingPart1';
import WritingPart2 from './components/writing/WritingPart2';
import WritingPart3 from './components/writing/WritingPart3';
import WritingPart4 from './components/writing/WritingPart4';

// Speaking Components
import SpeakingPart1 from './components/speaking/SpeakingPart1';
import SpeakingPart2 from './components/speaking/SpeakingPart2';
import SpeakingPart3 from './components/speaking/SpeakingPart3';
import SpeakingPart4 from './components/speaking/SpeakingPart4';

import ComingSoon from './components/ComingSoon';
import { SettingsProvider } from './contexts/SettingsContext';
import './index.css';

function AppContent() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState({
    reading: false,
    listening: false,
    writing: false,
    speaking: false
  });

  const closeSidebar = () => setIsSidebarOpen(false);

  const toggleSection = (sectionKey) => {
    setCollapsedSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
  };

  return (
    <Router>
      <div className="app-layout">
        {/* Sidebar Overlay (Mobile only) */}
        {isSidebarOpen && (
          <div className="sidebar-overlay" onClick={closeSidebar}></div>
        )}

        {/* Sidebar (Desktop static sidebar, Mobile drawer) */}
        <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
          <div className="sidebar-header">
            <NavLink to="/dashboard" onClick={closeSidebar} style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <BookOpen size={18} />
              </div>
              <h1 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
                Aptis
              </h1>
            </NavLink>
            <button className="close-sidebar-btn menu-btn mobile-only" onClick={closeSidebar} title="Đóng menu">
              <X size={18} />
            </button>
          </div>
          
          <nav className="sidebar-nav">
            <NavLink to="/dashboard" onClick={closeSidebar} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <LayoutDashboard size={17} style={{ flexShrink: 0 }} />
              <span>Dashboard</span>
            </NavLink>

            {/* Reading Skill */}
            <div className="nav-section-group">
              <button
                className="nav-section-btn"
                onClick={() => toggleSection('reading')}
                title="Kỹ năng Đọc (Reading)"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <BookOpen size={15} color="#3b82f6" style={{ flexShrink: 0 }} />
                  <span className="nav-section-label">Reading</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span className="nav-count-badge">4 parts</span>
                  {collapsedSections.reading ? <ChevronRight size={13} /> : <ChevronDown size={13} />}
                </div>
              </button>
              {!collapsedSections.reading && (
                <div className="nav-sub-items">
                  <NavLink to="/practice/reading/part-1" onClick={closeSidebar} className={({ isActive }) => `nav-item sub ${isActive ? 'active' : ''}`}>
                    <FileText size={15} />
                    <span>Part 1 (Sentences)</span>
                  </NavLink>
                  <NavLink to="/practice/reading/part-2" onClick={closeSidebar} className={({ isActive }) => `nav-item sub ${isActive ? 'active' : ''}`}>
                    <Target size={15} />
                    <span>Part 2 (Cohesion)</span>
                  </NavLink>
                  <NavLink to="/practice/reading/part-3" onClick={closeSidebar} className={({ isActive }) => `nav-item sub ${isActive ? 'active' : ''}`}>
                    <Users size={15} />
                    <span>Part 3 (Opinions)</span>
                  </NavLink>
                  <NavLink to="/practice/reading/part-4" onClick={closeSidebar} className={({ isActive }) => `nav-item sub ${isActive ? 'active' : ''}`}>
                    <BookOpen size={15} />
                    <span>Part 4 (Headings)</span>
                  </NavLink>
                </div>
              )}
            </div>

            {/* Listening Skill */}
            <div className="nav-section-group">
              <button
                className="nav-section-btn"
                onClick={() => toggleSection('listening')}
                title="Kỹ năng Nghe (Listening)"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Headphones size={15} color="#06b6d4" style={{ flexShrink: 0 }} />
                  <span className="nav-section-label">Listening</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span className="nav-count-badge">4 parts</span>
                  {collapsedSections.listening ? <ChevronRight size={13} /> : <ChevronDown size={13} />}
                </div>
              </button>
              {!collapsedSections.listening && (
                <div className="nav-sub-items">
                  <NavLink to="/practice/listening/part-1" onClick={closeSidebar} className={({ isActive }) => `nav-item sub ${isActive ? 'active' : ''}`}>
                    <Headphones size={15} />
                    <span>Part 1 (Q1 – 13)</span>
                  </NavLink>
                  <NavLink to="/practice/listening/part-2" onClick={closeSidebar} className={({ isActive }) => `nav-item sub ${isActive ? 'active' : ''}`}>
                    <Users size={15} />
                    <span>Part 2 (Speakers)</span>
                  </NavLink>
                  <NavLink to="/practice/listening/part-3" onClick={closeSidebar} className={({ isActive }) => `nav-item sub ${isActive ? 'active' : ''}`}>
                    <MessageSquareQuote size={15} />
                    <span>Part 3 (Opinions)</span>
                  </NavLink>
                  <NavLink to="/practice/listening/part-4" onClick={closeSidebar} className={({ isActive }) => `nav-item sub ${isActive ? 'active' : ''}`}>
                    <Radio size={15} />
                    <span>Part 4 (Monologue)</span>
                  </NavLink>
                </div>
              )}
            </div>

            {/* Writing Skill */}
            <div className="nav-section-group">
              <button
                className="nav-section-btn"
                onClick={() => toggleSection('writing')}
                title="Kỹ năng Viết (Writing)"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Edit3 size={15} color="#10b981" style={{ flexShrink: 0 }} />
                  <span className="nav-section-label">Writing</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span className="nav-count-badge">4 parts</span>
                  {collapsedSections.writing ? <ChevronRight size={13} /> : <ChevronDown size={13} />}
                </div>
              </button>
              {!collapsedSections.writing && (
                <div className="nav-sub-items">
                  <NavLink to="/practice/writing/part-1" onClick={closeSidebar} className={({ isActive }) => `nav-item sub ${isActive ? 'active' : ''}`}>
                    <FileText size={15} />
                    <span>Part 1 (Form Filling)</span>
                  </NavLink>
                  <NavLink to="/practice/writing/part-2" onClick={closeSidebar} className={({ isActive }) => `nav-item sub ${isActive ? 'active' : ''}`}>
                    <Edit3 size={15} />
                    <span>Part 2 (20-30w)</span>
                  </NavLink>
                  <NavLink to="/practice/writing/part-3" onClick={closeSidebar} className={({ isActive }) => `nav-item sub ${isActive ? 'active' : ''}`}>
                    <MessageSquare size={15} />
                    <span>Part 3 (Social Chat)</span>
                  </NavLink>
                  <NavLink to="/practice/writing/part-4" onClick={closeSidebar} className={({ isActive }) => `nav-item sub ${isActive ? 'active' : ''}`}>
                    <Mail size={15} />
                    <span>Part 4 (Emails)</span>
                  </NavLink>
                </div>
              )}
            </div>

            {/* Speaking Skill */}
            <div className="nav-section-group">
              <button
                className="nav-section-btn"
                onClick={() => toggleSection('speaking')}
                title="Kỹ năng Nói (Speaking)"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Mic size={15} color="#f43f5e" style={{ flexShrink: 0 }} />
                  <span className="nav-section-label">Speaking</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span className="nav-count-badge">4 parts</span>
                  {collapsedSections.speaking ? <ChevronRight size={13} /> : <ChevronDown size={13} />}
                </div>
              </button>
              {!collapsedSections.speaking && (
                <div className="nav-sub-items">
                  <NavLink to="/practice/speaking/part-1" onClick={closeSidebar} className={({ isActive }) => `nav-item sub ${isActive ? 'active' : ''}`}>
                    <Mic size={15} />
                    <span>Part 1 (Personal)</span>
                  </NavLink>
                  <NavLink to="/practice/speaking/part-2" onClick={closeSidebar} className={({ isActive }) => `nav-item sub ${isActive ? 'active' : ''}`}>
                    <ImageIcon size={15} />
                    <span>Part 2 (Describe)</span>
                  </NavLink>
                  <NavLink to="/practice/speaking/part-3" onClick={closeSidebar} className={({ isActive }) => `nav-item sub ${isActive ? 'active' : ''}`}>
                    <Images size={15} />
                    <span>Part 3 (Compare)</span>
                  </NavLink>
                  <NavLink to="/practice/speaking/part-4" onClick={closeSidebar} className={({ isActive }) => `nav-item sub ${isActive ? 'active' : ''}`}>
                    <Radio size={15} />
                    <span>Part 4 (Topic 2m)</span>
                  </NavLink>
                </div>
              )}
            </div>
          </nav>
        </aside>
        
        {/* Main Content Area with Top-nav */}
        <div className="main-wrapper">
          <header className="top-nav">
            <div className="top-nav-left">
              {/* Mobile hamburger */}
              <button className="menu-btn mobile-only" onClick={() => setIsSidebarOpen(true)} title="Mở danh mục (Menu)">
                <Menu size={18} />
              </button>

              <NavLink to="/dashboard" className="top-nav-title mobile-only">
                <BookOpen size={20} color="var(--primary)" />
                <h2>Aptis</h2>
              </NavLink>

              <div className="desktop-brand-tag">
                <span className="skill-pill-tag">Aptis - Luyện Thi Aptis ESOL</span>
              </div>
            </div>
          </header>

          <main className="main-content">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />

              {/* Reading Routes */}
              <Route path="/practice/reading" element={<Navigate to="/practice/reading/part-1" replace />} />
              <Route path="/practice/reading/part-1" element={<PracticePart1 />} />
              <Route path="/practice/reading/part-2" element={<Practice />} />
              <Route path="/practice/reading/part-3" element={<PracticePart3 />} />
              <Route path="/practice/reading/part-4" element={<PracticePart4 />} />

              {/* Listening Routes */}
              <Route path="/practice/listening" element={<Navigate to="/practice/listening/part-1" replace />} />
              <Route path="/practice/listening/part-1" element={<ListeningPart1 />} />
              <Route path="/practice/listening/part-2" element={<ListeningPart2 />} />
              <Route path="/practice/listening/part-3" element={<ListeningPart3 />} />
              <Route path="/practice/listening/part-4" element={<ListeningPart4 />} />

              {/* Writing Routes */}
              <Route path="/practice/writing" element={<Navigate to="/practice/writing/part-1" replace />} />
              <Route path="/practice/writing/part-1" element={<WritingPart1 />} />
              <Route path="/practice/writing/part-2" element={<WritingPart2 />} />
              <Route path="/practice/writing/part-3" element={<WritingPart3 />} />
              <Route path="/practice/writing/part-4" element={<WritingPart4 />} />

              {/* Speaking Routes */}
              <Route path="/practice/speaking" element={<Navigate to="/practice/speaking/part-1" replace />} />
              <Route path="/practice/speaking/part-1" element={<SpeakingPart1 />} />
              <Route path="/practice/speaking/part-2" element={<SpeakingPart2 />} />
              <Route path="/practice/speaking/part-3" element={<SpeakingPart3 />} />
              <Route path="/practice/speaking/part-4" element={<SpeakingPart4 />} />

              <Route path="/practice/:skill/:part?" element={<ComingSoon />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

function App() {
  return (
    <SettingsProvider>
      <AppContent />
    </SettingsProvider>
  );
}

export default App;
