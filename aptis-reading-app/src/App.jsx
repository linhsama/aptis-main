import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { BookOpen, LayoutDashboard, Target, FileText, Headphones, Edit3, Menu, X, Settings } from 'lucide-react';
import Dashboard from './components/Dashboard';
import Practice from './components/Practice';
import PracticePart1 from './components/PracticePart1';
import PracticePart3 from './components/PracticePart3';
import PracticePart4 from './components/PracticePart4';
import ComingSoon from './components/ComingSoon';
import { SettingsProvider } from './contexts/SettingsContext';
import './index.css';

function AppContent() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <Router>
      <div className="app-layout">
        {/* Mobile Top Navigation */}
        <div className="top-nav">
          <button className="menu-btn" onClick={() => setIsSidebarOpen(true)}>
            <Menu size={24} />
          </button>
          <div className="top-nav-title">
            <BookOpen size={24} color="var(--primary)" />
            <h2>Aptis Master</h2>
          </div>
        </div>

        {/* Sidebar Overlay (Mobile) */}
        {isSidebarOpen && (
          <div className="sidebar-overlay" onClick={closeSidebar}></div>
        )}

        <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
          <div className="sidebar-header">
            <h1>
              <BookOpen size={28} color="var(--primary)" />
              Aptis Master
            </h1>
            <button className="close-sidebar-btn menu-btn" onClick={closeSidebar}>
              <X size={24} />
            </button>
          </div>
          
          <nav className="sidebar-nav">
            <NavLink to="/dashboard" onClick={closeSidebar} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <LayoutDashboard size={20} />
              Dashboard
            </NavLink>

            <div className="nav-section-title">Reading Skill</div>
            <NavLink to="/practice/reading/part-1" onClick={closeSidebar} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <FileText size={20} />
              Part 1
            </NavLink>
            <NavLink to="/practice/reading/part-2" onClick={closeSidebar} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Target size={20} />
              Part 2
            </NavLink>
            <NavLink to="/practice/reading/part-3" onClick={closeSidebar} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <FileText size={20} />
              Part 3
            </NavLink>
            <NavLink to="/practice/reading/part-4" onClick={closeSidebar} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <FileText size={20} />
              Part 4
            </NavLink>

            <div className="nav-section-title">Other Skills</div>
            <NavLink to="/practice/listening" onClick={closeSidebar} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Headphones size={20} />
              Listening
            </NavLink>
            <NavLink to="/practice/writing" onClick={closeSidebar} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Edit3 size={20} />
              Writing
            </NavLink>
          </nav>
        </aside>
        
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/practice/reading/part-1" element={<PracticePart1 />} />
            <Route path="/practice/reading/part-2" element={<Practice />} />
            <Route path="/practice/reading/part-3" element={<PracticePart3 />} />
            <Route path="/practice/reading/part-4" element={<PracticePart4 />} />
            <Route path="/practice/:skill/:part?" element={<ComingSoon />} />
          </Routes>
        </main>
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
