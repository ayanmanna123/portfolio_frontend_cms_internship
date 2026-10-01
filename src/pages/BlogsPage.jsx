import React, { useState, useEffect, useRef } from 'react';
import { BookOpen, Plus, Edit2, Trash2, Search, Eye, Calendar, Loader2, Upload, Image as ImageIcon } from 'lucide-react';
import { cmsApi } from '@/api/cmsApi';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Badge } from '@/components/ui/Badge';
import { formatDate } from '@/utils/formatters';

export function BlogsPage() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    coverImage: '',
    tags: '',
    status: 'published'
  });

  // Delete State
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null, title: '' });
  const [actionLoading, setActionLoading] = useState(false);

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const res = await cmsApi.getBlogs();
      if (res.success) {
        setBlogs(res.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch blogs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const openCreateModal = () => {
    setEditingBlog(null);
    setFormData({
      title: '',
      excerpt: '',
      content: '',
      coverImage: '',
      tags: '',
      status: 'published'
    });
    setModalOpen(true);
  };

  const openEditModal = (blog) => {
    setEditingBlog(blog);
    setFormData({
      title: blog.title,
      excerpt: blog.excerpt,
      content: blog.content,
      coverImage: blog.coverImage || '',
      tags: (blog.tags || []).join(', '),
      status: blog.status || 'published'
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
        setFormData((prev) => ({ ...prev, coverImage: res.data.url }));
      }
    } catch (err) {
      alert(err.message || 'Image upload failed');
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSaveBlog = async (e) => {
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
      if (editingBlog) {
        await cmsApi.updateBlog(editingBlog._id, payload);
      } else {
        await cmsApi.createBlog(payload);
      }
      setModalOpen(false);
      fetchBlogs();
    } catch (err) {
      alert(err.message || 'Failed to save blog post');
    } finally {
      setActionLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteDialog.id) return;
    setActionLoading(true);
    try {
      await cmsApi.deleteBlog(deleteDialog.id);
      setDeleteDialog({ open: false, id: null, title: '' });
      fetchBlogs();
    } catch (err) {
      alert(err.message || 'Failed to delete blog post');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredBlogs = blogs.filter((b) => {
    const matchStatus = statusFilter === 'All' || b.status === statusFilter;
    const matchSearch =
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.excerpt.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Blog Posts & Articles
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Publish engineering tutorials, system design notes, and articles.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-600/30 transition-all"
        >
          <Plus className="w-4 h-4" />
          Write New Article
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl border border-slate-800 bg-slate-900/60">
        <div className="flex items-center gap-1.5">
          {['All', 'published', 'draft'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                statusFilter === st
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search articles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl text-xs border border-slate-700 bg-slate-800 text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Blogs List */}
      {loading ? (
        <div className="flex h-64 items-center justify-center text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        </div>
      ) : filteredBlogs.length > 0 ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-800/80 text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="px-6 py-3.5">Article</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Views</th>
                  <th className="px-6 py-3.5">Published Date</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {filteredBlogs.map((blog) => (
                  <tr key={blog._id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {blog.coverImage ? (
                          <img
                            src={blog.coverImage}
                            alt=""
                            className="w-12 h-10 rounded-lg object-cover bg-slate-800 flex-shrink-0"
                            onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }}
                          />
                        ) : (
                          <div className="w-12 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-slate-600 flex-shrink-0">
                            <BookOpen className="w-5 h-5" />
                          </div>
                        )}
                        <div>
                          <div className="font-bold text-white text-sm">
                            {blog.title}
                          </div>
                          <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                            {blog.excerpt}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={blog.status === 'published' ? 'success' : 'warning'}>
                        {blog.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <Eye className="w-3.5 h-3.5 text-slate-500" />
                        <span>{blog.views || 0}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-slate-400">
                      {formatDate(blog.publishedAt || blog.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(blog)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() =>
                            setDeleteDialog({
                              open: true,
                              id: blog._id,
                              title: blog.title
                            })
                          }
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center rounded-2xl border border-slate-800 bg-slate-900/40 text-slate-400 text-sm">
          No blog posts found. Click "Write New Article" to draft one.
        </div>
      )}

      {/* Add / Edit Blog Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingBlog ? 'Edit Blog Post' : 'Write New Article'}
        maxWidth="max-w-3xl"
      >
        <form onSubmit={handleSaveBlog} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">Article Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Building High-Performance REST APIs with Node.js"
              required
              className="w-full px-3.5 py-2 rounded-xl text-sm border border-slate-700 bg-slate-800 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Cover Image Upload */}
          <div className="p-4 rounded-xl border border-slate-700 bg-slate-800/60 space-y-3">
            <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
              <span>Cover Image (ImageKit / Cloud)</span>
              {formData.coverImage && (
                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, coverImage: '' }))}
                  className="text-[11px] text-red-400 hover:underline"
                >
                  Clear Image
                </button>
              )}
            </label>

            <div className="flex items-center gap-4">
              {formData.coverImage ? (
                <div className="h-20 w-32 rounded-lg bg-slate-900 border border-slate-700 overflow-hidden flex-shrink-0">
                  <img
                    src={formData.coverImage}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.onerror = null; e.target.src = ''; }}
                  />
                </div>
              ) : (
                <div className="h-20 w-32 rounded-lg bg-slate-900 border border-dashed border-slate-700 flex flex-col items-center justify-center text-slate-500 text-xs flex-shrink-0">
                  <ImageIcon className="w-5 h-5 mb-1" />
                  <span>No cover</span>
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
                  {uploadingImage ? 'Uploading to ImageKit...' : 'Upload Cover Image'}
                </button>
                <input
                  type="text"
                  value={formData.coverImage}
                  onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                  placeholder="Or paste direct image URL (https://ik.imagekit.io/...)"
                  className="w-full px-3 py-1 rounded-lg text-xs border border-slate-700 bg-slate-900 text-slate-300 font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Publication Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl text-sm border border-slate-700 bg-slate-800 text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Tags (Comma Separated)</label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="JavaScript, Architecture, Express"
                className="w-full px-3.5 py-2 rounded-xl text-sm border border-slate-700 bg-slate-800 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">Short Excerpt</label>
            <textarea
              rows={2}
              value={formData.excerpt}
              onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
              placeholder="Brief summary to display in project and blog preview cards..."
              required
              className="w-full px-3.5 py-2 rounded-xl text-sm border border-slate-700 bg-slate-800 text-white focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">Full Article Markdown Content</label>
            <textarea
              rows={10}
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Write your article body here in Markdown or plain text..."
              required
              className="w-full px-3.5 py-2 rounded-xl text-sm border border-slate-700 bg-slate-800 text-white focus:outline-none focus:border-indigo-500 font-mono text-xs leading-relaxed resize-y"
            />
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
              {actionLoading ? 'Saving...' : editingBlog ? 'Update Article' : 'Publish Article'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, id: null, title: '' })}
        onConfirm={confirmDelete}
        title="Delete Article"
        message={`Are you sure you want to delete article "${deleteDialog.title}"?`}
        loading={actionLoading}
      />
    </div>
  );
}
