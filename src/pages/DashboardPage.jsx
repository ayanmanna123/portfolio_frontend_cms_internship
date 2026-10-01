import React, { useState, useEffect } from 'react';
import {
  FolderGit2,
  Cpu,
  BookOpen,
  Briefcase,
  Zap,
  MessageSquareQuote,
  Mail,
  Image,
  Plus,
  ArrowRight,
  TrendingUp,
  Activity,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { cmsApi } from '@/api/cmsApi';

export function DashboardPage({ onNavigate }) {
  const [stats, setStats] = useState({
    projects: 0,
    skills: 0,
    blogs: 0,
    services: 0,
    experiences: 0,
    testimonials: 0,
    messages: 0,
    media: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const [
          projectsRes,
          skillsRes,
          blogsRes,
          servicesRes,
          expRes,
          testRes,
          msgRes,
          mediaRes
        ] = await Promise.all([
          cmsApi.getProjects(),
          cmsApi.getSkills(),
          cmsApi.getBlogs(),
          cmsApi.getServices(),
          cmsApi.getExperiences(),
          cmsApi.getTestimonials(),
          cmsApi.getMessages(),
          cmsApi.getMedia()
        ]);

        setStats({
          projects: projectsRes.data?.length || 0,
          skills: skillsRes.data?.length || 0,
          blogs: blogsRes.data?.length || 0,
          services: servicesRes.data?.length || 0,
          experiences: expRes.data?.length || 0,
          testimonials: testRes.data?.length || 0,
          messages: msgRes.data?.length || 0,
          media: mediaRes.data?.length || 0
        });
      } catch (err) {
        console.error('Failed to load dashboard metrics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCounts();
  }, []);

  const statCards = [
    { id: 'projects', title: 'Projects', count: stats.projects, icon: FolderGit2, color: 'text-blue-400 bg-blue-500/10' },
    { id: 'skills', title: 'Skills', count: stats.skills, icon: Cpu, color: 'text-emerald-400 bg-emerald-500/10' },
    { id: 'blogs', title: 'Blog Posts', count: stats.blogs, icon: BookOpen, color: 'text-purple-400 bg-purple-500/10' },
    { id: 'services', title: 'Services', count: stats.services, icon: Zap, color: 'text-amber-400 bg-amber-500/10' },
    { id: 'experience', title: 'Work History', count: stats.experiences, icon: Briefcase, color: 'text-indigo-400 bg-indigo-500/10' },
    { id: 'testimonials', title: 'Testimonials', count: stats.testimonials, icon: MessageSquareQuote, color: 'text-pink-400 bg-pink-500/10' },
    { id: 'messages', title: 'Contact Inquiries', count: stats.messages, icon: Mail, color: 'text-cyan-400 bg-cyan-500/10' },
    { id: 'media', title: 'Media Assets', count: stats.media, icon: Image, color: 'text-orange-400 bg-orange-500/10' }
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative rounded-3xl border border-slate-800 bg-gradient-to-r from-indigo-900/40 via-slate-900 to-purple-900/20 p-6 sm:p-8 backdrop-blur-xl overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Sparkles className="w-3.5 h-3.5" />
            Custom Headless CMS v1.0
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Welcome to your Portfolio Command Center
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            Manage your personal brand, projects, technical skills, articles, and client inquiries from a single custom-engineered dashboard.
          </p>
        </div>
      </div>

      {/* Metrics Grid */}
      <div>
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">
          Content Metrics Overview
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {statCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.id}
                onClick={() => onNavigate(card.id)}
                className="p-5 rounded-2xl border border-slate-800 bg-slate-900/70 hover:border-indigo-500/40 hover:bg-slate-900 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${card.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
                </div>
                <div className="space-y-0.5">
                  <span className="text-2xl sm:text-3xl font-black text-white">
                    {loading ? '...' : card.count}
                  </span>
                  <span className="text-xs font-medium text-slate-400 block">
                    {card.title}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Actions Bar */}
      <div>
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button
            onClick={() => onNavigate('projects')}
            className="flex items-center gap-3 p-4 rounded-2xl border border-slate-800 bg-slate-900/60 hover:bg-indigo-600/10 hover:border-indigo-500/30 text-left transition-all group"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white font-bold group-hover:scale-105 transition-transform">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <span className="text-sm font-bold text-white block">Add Project</span>
              <span className="text-xs text-slate-400">Showcase a new portfolio piece</span>
            </div>
          </button>

          <button
            onClick={() => onNavigate('blogs')}
            className="flex items-center gap-3 p-4 rounded-2xl border border-slate-800 bg-slate-900/60 hover:bg-purple-600/10 hover:border-purple-500/30 text-left transition-all group"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-600 text-white font-bold group-hover:scale-105 transition-transform">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <span className="text-sm font-bold text-white block">Write Blog Post</span>
              <span className="text-xs text-slate-400">Draft or publish tech article</span>
            </div>
          </button>

          <button
            onClick={() => onNavigate('media')}
            className="flex items-center gap-3 p-4 rounded-2xl border border-slate-800 bg-slate-900/60 hover:bg-emerald-600/10 hover:border-emerald-500/30 text-left transition-all group"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white font-bold group-hover:scale-105 transition-transform">
              <Image className="w-5 h-5" />
            </div>
            <div>
              <span className="text-sm font-bold text-white block">Upload Media</span>
              <span className="text-xs text-slate-400">Store images & resume files</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
