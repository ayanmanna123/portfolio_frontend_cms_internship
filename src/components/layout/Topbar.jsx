import React, { useState, useEffect } from 'react';
import { Menu, LogOut, User, Activity, Globe, Sun, Moon } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { cmsApi } from '@/api/cmsApi';

export function Topbar({ onToggleSidebar, activeTitle }) {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [serverOnline, setServerOnline] = useState(true);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        await cmsApi.getHealth();
        setServerOnline(true);
      } catch {
        setServerOnline(false);
      }
    };
    checkStatus();
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-slate-800 bg-slate-900/80 px-4 sm:px-6 backdrop-blur-xl">
      {/* Left Title & Mobile Toggle */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        <h1 className="text-lg font-bold text-white capitalize">
          {activeTitle || 'Dashboard'}
        </h1>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        {/* Backend status indicator */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono bg-slate-800 border border-slate-700">
          <span className={`h-2 w-2 rounded-full ${serverOnline ? 'bg-emerald-400 animate-pulse' : 'bg-red-500'}`} />
          <span className="text-slate-300">
            {serverOnline ? 'API Connected' : 'API Offline'}
          </span>
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800 transition-colors"
          title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          aria-label={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
        >
          {isDark ? (
            <Sun className="w-4 h-4 text-amber-400 hover:rotate-45 transition-transform" />
          ) : (
            <Moon className="w-4 h-4 text-indigo-600 hover:-rotate-12 transition-transform" />
          )}
        </button>

        {/* User profile & logout */}
        <div className="flex items-center gap-3 pl-3 border-l border-slate-800">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600/30 text-indigo-400 border border-indigo-500/30 font-bold text-xs">
              {user?.username?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div className="hidden md:block text-left">
              <span className="text-xs font-bold text-white block leading-tight">
                {user?.username || 'Admin'}
              </span>
              <span className="text-[10px] text-slate-400 block leading-tight">
                {user?.email || 'admin@portfolio.com'}
              </span>
            </div>
          </div>

          <button
            onClick={logout}
            className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}

