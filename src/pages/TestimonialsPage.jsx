import React, { useState, useEffect, useRef } from 'react';
import { MessageSquareQuote, Plus, Edit2, Trash2, Star, Loader2, Upload, User, Image as ImageIcon } from 'lucide-react';
import { cmsApi } from '@/api/cmsApi';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

export function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTest, setEditingTest] = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    clientName: '',
    position: '',
    company: '',
    avatar: '',
    quote: '',
    rating: 5,
    order: 0
  });

  // Delete State
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null, title: '' });
  const [actionLoading, setActionLoading] = useState(false);

  const fetchTestimonials = async () => {
    setLoading(true);
    try {
      const res = await cmsApi.getTestimonials();
      if (res.success) {
        setTestimonials(res.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch testimonials:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const openCreateModal = () => {
    setEditingTest(null);
    setFormData({
      clientName: '',
      position: '',
      company: '',
      avatar: '',
      quote: '',
      rating: 5,
      order: testimonials.length + 1
    });
    setModalOpen(true);
  };

  const openEditModal = (t) => {
    setEditingTest(t);
    setFormData({
      clientName: t.clientName,
      position: t.position || '',
      company: t.company || '',
      avatar: t.avatar || '',
      quote: t.quote,
      rating: t.rating || 5,
      order: t.order || 0
    });
    setModalOpen(true);
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);
    try {
      const data = new FormData();
      data.append('file', file);
      const res = await cmsApi.uploadImage(data);
      if (res.success && res.data?.url) {
        setFormData((prev) => ({ ...prev, avatar: res.data.url }));
      }
    } catch (err) {
      alert(err.message || 'Avatar upload failed');
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSaveTestimonial = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      if (editingTest) {
        await cmsApi.updateTestimonial(editingTest._id, formData);
      } else {
        await cmsApi.createTestimonial(formData);
      }
      setModalOpen(false);
      fetchTestimonials();
    } catch (err) {
      alert(err.message || 'Failed to save testimonial');
    } finally {
      setActionLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteDialog.id) return;
    setActionLoading(true);
    try {
      await cmsApi.deleteTestimonial(deleteDialog.id);
      setDeleteDialog({ open: false, id: null, title: '' });
      fetchTestimonials();
    } catch (err) {
      alert(err.message || 'Failed to delete testimonial');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Client Testimonials
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Showcase recommendations, quotes, and 5-star reviews from clients and colleagues.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-600/30 transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Testimonial
        </button>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex h-64 items-center justify-center text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        </div>
      ) : testimonials.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div
              key={t._id}
              className="p-6 rounded-2xl border border-slate-800 bg-slate-900/70 space-y-4 hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-1">
                  {Array.from({ length: t.rating || 5 }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>

                <p className="text-xs sm:text-sm text-slate-300 italic leading-relaxed">
                  "{t.quote}"
                </p>

                <div className="pt-2 border-t border-slate-800 flex items-center gap-3">
                  {t.avatar ? (
                    <img
                      src={t.avatar}
                      alt={t.clientName}
                      className="w-10 h-10 rounded-full object-cover border border-slate-700 bg-slate-800 flex-shrink-0"
                      onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }}
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-500 flex-shrink-0">
                      <User className="w-5 h-5" />
                    </div>
                  )}
                  <div>
                    <h4 className="text-sm font-bold text-white">{t.clientName}</h4>
                    <p className="text-xs text-slate-400">
                      {t.position} {t.company ? `• ${t.company}` : ''}
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  onClick={() => openEditModal(t)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  title="Edit"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() =>
                    setDeleteDialog({
                      open: true,
                      id: t._id,
                      title: `${t.clientName}'s review`
                    })
                  }
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center rounded-2xl border border-slate-800 bg-slate-900/40 text-slate-400 text-sm">
          No testimonials added yet. Click "Add Testimonial" to add one.
        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingTest ? 'Edit Testimonial' : 'Add Testimonial'}
      >
        <form onSubmit={handleSaveTestimonial} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">Client / Recommender Name</label>
            <input
              type="text"
              value={formData.clientName}
              onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
              placeholder="Sarah Jenkins"
              required
              className="w-full px-3.5 py-2 rounded-xl text-sm border border-slate-700 bg-slate-800 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Client Avatar Upload */}
          <div className="p-4 rounded-xl border border-slate-700 bg-slate-800/60 space-y-3">
            <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
              <span>Client Photo / Avatar (ImageKit / Cloud)</span>
              {formData.avatar && (
                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, avatar: '' }))}
                  className="text-[11px] text-red-400 hover:underline"
                >
                  Clear Photo
                </button>
              )}
            </label>

            <div className="flex items-center gap-4">
              {formData.avatar ? (
                <div className="h-14 w-14 rounded-full bg-slate-900 border border-slate-700 overflow-hidden flex-shrink-0">
                  <img
                    src={formData.avatar}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.onerror = null; e.target.src = ''; }}
                  />
                </div>
              ) : (
                <div className="h-14 w-14 rounded-full bg-slate-900 border border-dashed border-slate-700 flex items-center justify-center text-slate-500 flex-shrink-0">
                  <User className="w-6 h-6" />
                </div>
              )}

              <div className="space-y-2 flex-1">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleAvatarUpload}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-600 hover:text-white transition-colors"
                >
                  <Upload className="w-3.5 h-3.5" />
                  {uploadingAvatar ? 'Uploading to ImageKit...' : 'Upload Photo'}
                </button>
                <input
                  type="text"
                  value={formData.avatar}
                  onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                  placeholder="Or paste direct image URL (https://ik.imagekit.io/...)"
                  className="w-full px-3 py-1 rounded-lg text-xs border border-slate-700 bg-slate-900 text-slate-300 font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Position / Role</label>
              <input
                type="text"
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                placeholder="VP of Engineering"
                className="w-full px-3.5 py-2 rounded-xl text-sm border border-slate-700 bg-slate-800 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Company</label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                placeholder="Acme Corp"
                className="w-full px-3.5 py-2 rounded-xl text-sm border border-slate-700 bg-slate-800 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">Rating ({formData.rating} Stars)</label>
            <select
              value={formData.rating}
              onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })}
              className="w-full px-3.5 py-2 rounded-xl text-sm border border-slate-700 bg-slate-800 text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="5">⭐⭐⭐⭐⭐ (5 Stars)</option>
              <option value="4">⭐⭐⭐⭐ (4 Stars)</option>
              <option value="3">⭐⭐⭐ (3 Stars)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">Quote / Recommendation Content</label>
            <textarea
              rows={4}
              value={formData.quote}
              onChange={(e) => setFormData({ ...formData, quote: e.target.value })}
              placeholder="What did they say about your work and communication..."
              required
              className="w-full px-3.5 py-2 rounded-xl text-sm border border-slate-700 bg-slate-800 text-white focus:outline-none focus:border-indigo-500 resize-none"
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
              {actionLoading ? 'Saving...' : editingTest ? 'Update Testimonial' : 'Add Testimonial'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, id: null, title: '' })}
        onConfirm={confirmDelete}
        title="Delete Testimonial"
        message={`Are you sure you want to delete ${deleteDialog.title}?`}
        loading={actionLoading}
      />
    </div>
  );
}
