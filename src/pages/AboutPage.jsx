import React, { useState, useEffect, useRef } from 'react';
import {
  User,
  Save,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Camera,
  FileText,
  Upload,
  ExternalLink,
  Image as ImageIcon
} from 'lucide-react';
import { cmsApi } from '@/api/cmsApi';

export function AboutPage() {
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    bio: '',
    avatarUrl: '',
    resumeUrl: '',
    location: '',
    email: '',
    phone: '',
    socialLinks: {
      github: '',
      linkedin: '',
      twitter: '',
      instagram: '',
      website: ''
    },
    stats: [],
    highlights: []
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const avatarInputRef = useRef(null);
  const resumeInputRef = useRef(null);

  useEffect(() => {
    const fetchAbout = async () => {
      try {
        const res = await cmsApi.getAbout();
        if (res.success && res.data) {
          setFormData({
            name: res.data.name || '',
            title: res.data.title || '',
            bio: res.data.bio || '',
            avatarUrl: res.data.avatarUrl || '',
            resumeUrl: res.data.resumeUrl || '',
            location: res.data.location || '',
            email: res.data.email || '',
            phone: res.data.phone || '',
            socialLinks: {
              github: res.data.socialLinks?.github || '',
              linkedin: res.data.socialLinks?.linkedin || '',
              twitter: res.data.socialLinks?.twitter || '',
              instagram: res.data.socialLinks?.instagram || '',
              website: res.data.socialLinks?.website || ''
            },
            stats: res.data.stats || [],
            highlights: res.data.highlights || []
          });
        }
      } catch (err) {
        console.error('Failed to load about data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAbout();
  }, []);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSocialChange = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      socialLinks: { ...prev.socialLinks, [key]: value }
    }));
  };

  // Avatar Upload Handler
  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);
    setFeedback(null);
    try {
      const data = new FormData();
      data.append('file', file);
      const res = await cmsApi.uploadImage(data);
      if (res.success && res.data?.url) {
        setFormData((prev) => ({ ...prev, avatarUrl: res.data.url }));
        setFeedback({ type: 'success', message: 'Profile picture uploaded to media storage!' });
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to upload profile picture.' });
    } finally {
      setUploadingAvatar(false);
      if (avatarInputRef.current) avatarInputRef.current.value = '';
    }
  };

  // Resume Upload Handler
  const handleResumeUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingResume(true);
    setFeedback(null);
    try {
      const data = new FormData();
      data.append('file', file);
      const res = await cmsApi.uploadImage(data);
      if (res.success && res.data?.url) {
        setFormData((prev) => ({ ...prev, resumeUrl: res.data.url }));
        setFeedback({ type: 'success', message: 'Resume uploaded successfully to media storage!' });
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to upload resume file.' });
    } finally {
      setUploadingResume(false);
      if (resumeInputRef.current) resumeInputRef.current.value = '';
    }
  };

  // Stat item handlers
  const handleAddStat = () => {
    setFormData((prev) => ({
      ...prev,
      stats: [...prev.stats, { label: 'New Metric', value: '10+' }]
    }));
  };

  const handleUpdateStat = (index, field, value) => {
    const newStats = [...formData.stats];
    newStats[index][field] = value;
    setFormData((prev) => ({ ...prev, stats: newStats }));
  };

  const handleDeleteStat = (index) => {
    setFormData((prev) => ({
      ...prev,
      stats: prev.stats.filter((_, i) => i !== index)
    }));
  };

  // Highlight item handlers
  const handleAddHighlight = () => {
    setFormData((prev) => ({
      ...prev,
      highlights: [...prev.highlights, '']
    }));
  };

  const handleUpdateHighlight = (index, value) => {
    const newHighlights = [...formData.highlights];
    newHighlights[index] = value;
    setFormData((prev) => ({ ...prev, highlights: newHighlights }));
  };

  const handleDeleteHighlight = (index) => {
    setFormData((prev) => ({
      ...prev,
      highlights: prev.highlights.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);

    try {
      await cmsApi.updateAbout(formData);
      setFeedback({ type: 'success', message: 'About profile & assets updated successfully!' });
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to update about data.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            About & Profile Settings
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Manage your developer avatar, resume, bio, contact details, metrics, and highlights.
          </p>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Changes
            </>
          )}
        </button>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`flex items-center gap-2 p-4 rounded-xl text-xs font-semibold ${
            feedback.type === 'success'
              ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
              : 'bg-red-500/10 border border-red-500/20 text-red-400'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Profile Picture & Resume Assets Card */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 sm:p-8 space-y-6">
        <h3 className="text-base font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
          <Camera className="w-4 h-4 text-indigo-400" />
          Profile Picture & Resume Document (ImageKit / Storage)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          
          {/* Profile Picture (Avatar) */}
          <div className="p-5 rounded-2xl border border-slate-800 bg-slate-950/60 space-y-4">
            <label className="text-xs font-bold text-slate-300 block">
              Profile Picture / Avatar
            </label>

            <div className="flex items-center gap-5">
              <div className="relative group">
                <div className="h-24 w-24 rounded-2xl bg-slate-800 border-2 border-indigo-500/40 overflow-hidden flex items-center justify-center shadow-lg shadow-indigo-600/10">
                  {formData.avatarUrl ? (
                    <img
                      src={formData.avatarUrl}
                      alt="Profile Avatar Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '';
                      }}
                    />
                  ) : (
                    <User className="w-10 h-10 text-slate-500" />
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 rounded-2xl flex flex-col items-center justify-center text-white text-[11px] font-semibold transition-opacity"
                >
                  <Camera className="w-5 h-5 mb-1" />
                  {uploadingAvatar ? 'Uploading...' : 'Change'}
                </button>
              </div>

              <div className="space-y-2 flex-1">
                <input
                  type="file"
                  ref={avatarInputRef}
                  onChange={handleAvatarUpload}
                  accept="image/*"
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-600 hover:text-white transition-colors"
                >
                  <Upload className="w-3.5 h-3.5" />
                  {uploadingAvatar ? 'Uploading Picture...' : 'Upload Image'}
                </button>

                {formData.avatarUrl && (
                  <button
                    type="button"
                    onClick={() => handleChange('avatarUrl', '')}
                    className="block text-[11px] text-red-400 hover:underline pt-1"
                  >
                    Remove Picture
                  </button>
                )}
                <p className="text-[11px] text-slate-500">
                  Supports JPG, PNG, WEBP. Uploads to ImageKit / local storage.
                </p>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400">Avatar Direct URL</label>
              <input
                type="text"
                value={formData.avatarUrl}
                onChange={(e) => handleChange('avatarUrl', e.target.value)}
                placeholder="https://ik.imagekit.io/... or https://..."
                className="w-full px-3 py-1.5 rounded-lg text-xs border border-slate-700 bg-slate-900 text-slate-300 font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Resume Document */}
          <div className="p-5 rounded-2xl border border-slate-800 bg-slate-950/60 space-y-4">
            <label className="text-xs font-bold text-slate-300 block">
              Resume / CV File
            </label>

            <div className="flex items-center gap-5">
              <div className="h-24 w-24 rounded-2xl bg-slate-800 border-2 border-slate-700 flex flex-col items-center justify-center text-slate-400">
                <FileText className="w-8 h-8 text-indigo-400 mb-1" />
                <span className="text-[10px] font-mono">PDF / DOC</span>
              </div>

              <div className="space-y-2 flex-1">
                <input
                  type="file"
                  ref={resumeInputRef}
                  onChange={handleResumeUpload}
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                />

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => resumeInputRef.current?.click()}
                    disabled={uploadingResume}
                    className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-600 hover:text-white transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    {uploadingResume ? 'Uploading Resume...' : 'Upload PDF/Doc'}
                  </button>

                  {formData.resumeUrl && (
                    <a
                      href={formData.resumeUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 hover:text-white border border-slate-700"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Preview
                    </a>
                  )}
                </div>

                <p className="text-[11px] text-slate-500">
                  Allows visitors to download or view your resume on the portfolio.
                </p>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400">Resume Direct URL</label>
              <input
                type="text"
                value={formData.resumeUrl}
                onChange={(e) => handleChange('resumeUrl', e.target.value)}
                placeholder="https://ik.imagekit.io/.../resume.pdf"
                className="w-full px-3 py-1.5 rounded-lg text-xs border border-slate-700 bg-slate-900 text-slate-300 font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

        </div>
      </div>

      {/* Core Profile Details */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 sm:p-8 space-y-6">
        <h3 className="text-base font-bold text-white border-b border-slate-800 pb-3">
          1. General Information
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">Full Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              required
              className="w-full px-3.5 py-2 rounded-xl text-sm border border-slate-700 bg-slate-800 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">Professional Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              required
              className="w-full px-3.5 py-2 rounded-xl text-sm border border-slate-700 bg-slate-800 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-xs font-bold text-slate-300">Bio Summary</label>
            <textarea
              rows={4}
              value={formData.bio}
              onChange={(e) => handleChange('bio', e.target.value)}
              required
              className="w-full px-3.5 py-2 rounded-xl text-sm border border-slate-700 bg-slate-800 text-white focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">Location</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => handleChange('location', e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl text-sm border border-slate-700 bg-slate-800 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">Email Address</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl text-sm border border-slate-700 bg-slate-800 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">Phone Number</label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl text-sm border border-slate-700 bg-slate-800 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Social Links */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 sm:p-8 space-y-6">
        <h3 className="text-base font-bold text-white border-b border-slate-800 pb-3">
          2. Social & Web Profiles
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">GitHub URL</label>
            <input
              type="text"
              value={formData.socialLinks.github}
              onChange={(e) => handleSocialChange('github', e.target.value)}
              placeholder="https://github.com/..."
              className="w-full px-3.5 py-2 rounded-xl text-sm border border-slate-700 bg-slate-800 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">LinkedIn URL</label>
            <input
              type="text"
              value={formData.socialLinks.linkedin}
              onChange={(e) => handleSocialChange('linkedin', e.target.value)}
              placeholder="https://linkedin.com/in/..."
              className="w-full px-3.5 py-2 rounded-xl text-sm border border-slate-700 bg-slate-800 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">Twitter / X URL</label>
            <input
              type="text"
              value={formData.socialLinks.twitter}
              onChange={(e) => handleSocialChange('twitter', e.target.value)}
              placeholder="https://twitter.com/..."
              className="w-full px-3.5 py-2 rounded-xl text-sm border border-slate-700 bg-slate-800 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-base font-bold text-white">
            3. Stats & Metrics Counters
          </h3>
          <button
            type="button"
            onClick={handleAddStat}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-500"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Stat
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {formData.stats.map((stat, idx) => (
            <div key={idx} className="p-4 rounded-xl border border-slate-700 bg-slate-800/80 space-y-3 relative">
              <button
                type="button"
                onClick={() => handleDeleteStat(idx)}
                className="absolute top-3 right-3 text-slate-400 hover:text-red-400 p-1"
                title="Remove Stat"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400">Value</label>
                <input
                  type="text"
                  value={stat.value}
                  onChange={(e) => handleUpdateStat(idx, 'value', e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg text-sm border border-slate-600 bg-slate-900 text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400">Label</label>
                <input
                  type="text"
                  value={stat.label}
                  onChange={(e) => handleUpdateStat(idx, 'label', e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg text-sm border border-slate-600 bg-slate-900 text-white"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Highlights Section */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-base font-bold text-white">
            4. Key Highlights & Achievements
          </h3>
          <button
            type="button"
            onClick={handleAddHighlight}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-500"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Highlight
          </button>
        </div>

        <div className="space-y-3">
          {formData.highlights.map((highlight, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <input
                type="text"
                value={highlight}
                onChange={(e) => handleUpdateHighlight(idx, e.target.value)}
                placeholder="Enter capability or milestone..."
                className="flex-1 px-3.5 py-2 rounded-xl text-sm border border-slate-700 bg-slate-800 text-white focus:outline-none focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={() => handleDeleteHighlight(idx)}
                className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </form>
  );
}
