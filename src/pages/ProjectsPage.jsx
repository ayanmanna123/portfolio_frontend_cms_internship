import React, { useState, useEffect, useRef } from 'react';
import { FolderGit2, Plus, Edit2, Trash2, Search, ExternalLink, Star, Loader2, Upload, Image as ImageIcon } from 'lucide-react';
import { Github } from '@/components/Icons';
import { cmsApi } from '@/api/cmsApi';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Badge } from '@/components/ui/Badge';

export function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    title: '',
    tagline: '',
    description: '',
    thumbnail: '',
    category: 'Full Stack',
    tags: '',
    githubUrl: '',
    liveUrl: '',
    featured: false,
    order: 0
  });

  // Delete State
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null, title: '' });
  const [actionLoading, setActionLoading] = useState(false);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await cmsApi.getProjects();
      if (res.success) {
        setProjects(res.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch projects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const openCreateModal = () => {
    setEditingProject(null);
    setFormData({
      title: '',
      tagline: '',
      description: '',
      thumbnail: '',
      category: 'Full Stack',
      tags: '',
      githubUrl: '',
      liveUrl: '',
      featured: false,
      order: projects.length + 1
    });
    setModalOpen(true);
  };

  const openEditModal = (project) => {
    setEditingProject(project);
    setFormData({
      title: project.title,
      tagline: project.tagline || '',
      description: project.description,
      thumbnail: project.thumbnail || '',
      category: project.category || 'Full Stack',
      tags: (project.tags || []).join(', '),
      githubUrl: project.githubUrl || '',
      liveUrl: project.liveUrl || '',
      featured: !!project.featured,
      order: project.order || 0
    });
    setModalOpen(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const data = new FormData();
      data.append('file', file);
      const res = await cmsApi.uploadImage(data);
      if (res.success && res.data?.url) {
        setFormData((prev) => ({ ...prev, thumbnail: res.data.url }));
      }
    } catch (err) {
      alert(err.message || 'Image upload failed');
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSaveProject = async (e) => {
    e.preventDefault();
    setActionLoading(true);

    const payload = {
      ...formData,
      tags: formData.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)
    };

    try {
      if (editingProject) {
        await cmsApi.updateProject(editingProject._id, payload);
      } else {
        await cmsApi.createProject(payload);
      }
      setModalOpen(false);
      fetchProjects();
    } catch (err) {
      alert(err.message || 'Failed to save project');
    } finally {
      setActionLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteDialog.id) return;
    setActionLoading(true);
    try {
      await cmsApi.deleteProject(deleteDialog.id);
      setDeleteDialog({ open: false, id: null, title: '' });
      fetchProjects();
    } catch (err) {
      alert(err.message || 'Failed to delete project');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredProjects = projects.filter((p) => {
    return (
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase()) ||
      (p.category && p.category.toLowerCase().includes(search.toLowerCase()))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Portfolio Projects
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Showcase your completed case studies, applications, and source code repositories.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-600/30 transition-all"
        >
          <Plus className="w-4 h-4" />
          Add New Project
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex items-center justify-between gap-4 p-4 rounded-2xl border border-slate-800 bg-slate-900/60">
        <div className="relative w-full max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl text-xs border border-slate-700 bg-slate-800 text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Projects List Grid */}
      {loading ? (
        <div className="flex h-64 items-center justify-center text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        </div>
      ) : filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredProjects.map((project) => (
            <div
              key={project._id}
              className="p-6 rounded-2xl border border-slate-800 bg-slate-900/70 space-y-4 hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary">{project.category || 'Full Stack'}</Badge>

                  {project.featured && (
                    <span className="inline-flex items-center gap-1 text-amber-400 text-xs font-semibold">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      Featured
                    </span>
                  )}
                </div>

                {project.thumbnail && (
                  <div className="h-36 w-full rounded-xl overflow-hidden bg-slate-800 border border-slate-700/60">
                    <img
                      src={project.thumbnail}
                      alt={project.title}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }}
                    />
                  </div>
                )}

                <div>
                  <h3 className="text-lg font-bold text-white">
                    {project.title}
                  </h3>
                  {project.tagline && (
                    <p className="text-xs text-indigo-400 font-medium mt-0.5">
                      {project.tagline}
                    </p>
                  )}
                </div>

                <p className="text-xs sm:text-sm text-slate-400 line-clamp-3 leading-relaxed">
                  {project.description}
                </p>

                {/* Tags */}
                {project.tags && project.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {project.tags.map((t, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[11px] font-mono">
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Card Footer */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {project.liveUrl && (
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-slate-800 transition-colors"
                      title="Live Link"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                  {project.githubUrl && (
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                      title="GitHub Repository"
                    >
                      <Github className="w-4 h-4" />
                    </a>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditModal(project)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                    title="Edit Project"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() =>
                      setDeleteDialog({
                        open: true,
                        id: project._id,
                        title: project.title
                      })
                    }
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
                    title="Delete Project"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center rounded-2xl border border-slate-800 bg-slate-900/40 text-slate-400 text-sm">
          No projects found. Click "Add New Project" to get started.
        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingProject ? 'Edit Project' : 'Create New Project'}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSaveProject} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">Project Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. AI-Powered Analytics Engine"
              required
              className="w-full px-3.5 py-2 rounded-xl text-sm border border-slate-700 bg-slate-800 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Project Thumbnail Image */}
          <div className="p-4 rounded-xl border border-slate-700 bg-slate-800/60 space-y-3">
            <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
              <span>Project Thumbnail Image (ImageKit / Cloud)</span>
              {formData.thumbnail && (
                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, thumbnail: '' }))}
                  className="text-[11px] text-red-400 hover:underline"
                >
                  Clear Image
                </button>
              )}
            </label>

            <div className="flex items-center gap-4">
              {formData.thumbnail ? (
                <div className="h-20 w-32 rounded-lg bg-slate-900 border border-slate-700 overflow-hidden flex-shrink-0">
                  <img
                    src={formData.thumbnail}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.onerror = null; e.target.src = ''; }}
                  />
                </div>
              ) : (
                <div className="h-20 w-32 rounded-lg bg-slate-900 border border-dashed border-slate-700 flex flex-col items-center justify-center text-slate-500 text-xs flex-shrink-0">
                  <ImageIcon className="w-5 h-5 mb-1" />
                  <span>No image</span>
                </div>
              )}

              <div className="space-y-2 flex-1">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingImage}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-600 hover:text-white transition-colors"
                >
                  <Upload className="w-3.5 h-3.5" />
                  {uploadingImage ? 'Uploading to ImageKit...' : 'Upload Image'}
                </button>
                <input
                  type="text"
                  value={formData.thumbnail}
                  onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                  placeholder="Or paste direct image URL (https://ik.imagekit.io/...)"
                  className="w-full px-3 py-1 rounded-lg text-xs border border-slate-700 bg-slate-900 text-slate-300 font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Category</label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="e.g. Full Stack, Frontend, Mobile"
                className="w-full px-3.5 py-2 rounded-xl text-sm border border-slate-700 bg-slate-800 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Tagline / Short Hook</label>
              <input
                type="text"
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                placeholder="Brief one-liner summary"
                className="w-full px-3.5 py-2 rounded-xl text-sm border border-slate-700 bg-slate-800 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">Description Overview</label>
            <textarea
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Detailed explanation of features, architecture, and problems solved..."
              required
              className="w-full px-3.5 py-2 rounded-xl text-sm border border-slate-700 bg-slate-800 text-white focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">Tech Stack Tags (Comma Separated)</label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder="React, Node.js, Express, MongoDB, Tailwind"
              className="w-full px-3.5 py-2 rounded-xl text-sm border border-slate-700 bg-slate-800 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Live Demo URL</label>
              <input
                type="text"
                value={formData.liveUrl}
                onChange={(e) => setFormData({ ...formData, liveUrl: e.target.value })}
                placeholder="https://example.com"
                className="w-full px-3.5 py-2 rounded-xl text-sm border border-slate-700 bg-slate-800 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">GitHub Repository URL</label>
              <input
                type="text"
                value={formData.githubUrl}
                onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                placeholder="https://github.com/..."
                className="w-full px-3.5 py-2 rounded-xl text-sm border border-slate-700 bg-slate-800 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <label className="flex items-center gap-2 text-xs font-bold text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.featured}
                onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500"
              />
              Mark as Featured Project
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-50"
            >
              {actionLoading ? 'Saving...' : editingProject ? 'Update Project' : 'Create Project'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, id: null, title: '' })}
        onConfirm={confirmDelete}
        title="Delete Project"
        message={`Are you sure you want to delete "${deleteDialog.title}"?`}
        loading={actionLoading}
      />
    </div>
  );
}
