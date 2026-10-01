import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { LoginPage } from './pages/LoginPage';
import { AdminLayout } from './components/layout/AdminLayout';
import { DashboardPage } from './pages/DashboardPage';
import { AboutPage } from './pages/AboutPage';
import { SkillsPage } from './pages/SkillsPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { BlogsPage } from './pages/BlogsPage';
import { ExperiencePage } from './pages/ExperiencePage';
import { ServicesPage } from './pages/ServicesPage';
import { TestimonialsPage } from './pages/TestimonialsPage';
import { MessagesPage } from './pages/MessagesPage';
import { MediaPage } from './pages/MediaPage';
import { SettingsPage } from './pages/SettingsPage';
import { Loader2 } from 'lucide-react';

function CMSContent() {
  const { isAuthenticated, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400 space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
        <span className="text-sm font-semibold tracking-wider uppercase font-mono">
          Loading Custom CMS...
        </span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardPage onNavigate={setActiveTab} />;
      case 'about':
        return <AboutPage />;
      case 'skills':
        return <SkillsPage />;
      case 'projects':
        return <ProjectsPage />;
      case 'blogs':
        return <BlogsPage />;
      case 'experience':
        return <ExperiencePage />;
      case 'services':
        return <ServicesPage />;
      case 'testimonials':
        return <TestimonialsPage />;
      case 'messages':
        return <MessagesPage />;
      case 'media':
        return <MediaPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <DashboardPage onNavigate={setActiveTab} />;
    }
  };

  return (
    <AdminLayout activeTab={activeTab} onSelectTab={setActiveTab}>
      {renderContent()}
    </AdminLayout>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CMSContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

