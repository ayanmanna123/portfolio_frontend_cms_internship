import React from 'react';
import {
  LayoutDashboard,
  User,
  Cpu,
  FolderGit2,
  BookOpen,
  Briefcase,
  Zap,
  MessageSquareQuote,
  Mail,
  Image,
  Settings,
  Shield,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

const MENU_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'about', label: 'About & Bio', icon: User },
  { id: 'skills', label: 'Skills', icon: Cpu },
  { id: 'projects', label: 'Projects', icon: FolderGit2 },
  { id: 'blogs', label: 'Blog Posts', icon: BookOpen },
  { id: 'experience', label: 'Work Experience', icon: Briefcase },
  { id: 'services', label: 'Services', icon: Zap },
  { id: 'testimonials', label: 'Testimonials', icon: MessageSquareQuote },
  { id: 'messages', label: 'Inquiries', icon: Mail },
  { id: 'media', label: 'Media Library', icon: Image },
  { id: 'settings', label: 'Settings', icon: Settings }
];

export function Sidebar({ activeTab, onSelectTab, unreadMessages = 0, isOpen, onClose }) {
  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/70 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 border-r border-slate-800 bg-slate-900/95 backdrop-blur-xl flex flex-col justify-between transition-transform duration-200 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div>
          <div className="flex h-16 items-center justify-between px-6 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-600/30">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <span className="font-extrabold text-sm text-white tracking-tight block">
                  CMS ADMIN
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  Custom Platform
                </span>
              </div>
            </div>
          </div>

          {/* Nav List */}
          <div className="py-4 px-3 space-y-1">
            <div className="px-3 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Content Management
            </div>

            {MENU_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectTab(item.id);
                    if (onClose) onClose();
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </div>

                  {item.id === 'messages' && unreadMessages > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-slate-950">
                      {unreadMessages}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer Link to live portfolio */}
        <div className="p-4 border-t border-slate-800">
          <a
            href="http://localhost:5173"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800/40 hover:bg-slate-800 transition-colors"
          >
            <div className="flex items-center gap-2">
              <ExternalLink className="w-4 h-4 text-indigo-400" />
              <span>View Live Portfolio</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 opacity-50" />
          </a>
        </div>
      </aside>
    </>
  );
}
