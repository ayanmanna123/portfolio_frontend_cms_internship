import React, { useState, useEffect } from 'react';
import { Zap, Plus, Edit2, Trash2, Check, Star, Loader2 } from 'lucide-react';
import { cmsApi } from '@/api/cmsApi';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Badge } from '@/components/ui/Badge';

export function ServicesPage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    features: '',
    priceRange: '',
    isFeatured: true,
    order: 0
  });

  // Delete State
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null, title: '' });
  const [actionLoading, setActionLoading] = useState(false);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const res = await cmsApi.getServices();
      if (res.success) {
        setServices(res.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch services:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const openCreateModal = () => {
    setEditingService(null);
    setFormData({
      title: '',
      description: '',
      features: '',
      priceRange: 'Custom Quote',
      isFeatured: true,
      order: services.length + 1
    });
    setModalOpen(true);
  };

  const openEditModal = (srv) => {
    setEditingService(srv);
    setFormData({
      title: srv.title,
      description: srv.description,
      features: (srv.features || []).join('\n'),
      priceRange: srv.priceRange || '',
      isFeatured: !!srv.isFeatured,
      order: srv.order || 0
    });
    setModalOpen(true);
  };

  const handleSaveService = async (e) => {
    e.preventDefault();
    setActionLoading(true);

    const payload = {
      ...formData,
      features: formData.features
        .split('\n')
        .map((f) => f.trim())
        .filter(Boolean)
    };

    try {
      if (editingService) {
        await cmsApi.updateService(editingService._id, payload);
      } else {
        await cmsApi.createService(payload);
      }
      setModalOpen(false);
      fetchServices();
    } catch (err) {
      alert(err.message || 'Failed to save service');
    } finally {
      setActionLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteDialog.id) return;
    setActionLoading(true);
    try {
      await cmsApi.deleteService(deleteDialog.id);
      setDeleteDialog({ open: false, id: null, title: '' });
      fetchServices();
    } catch (err) {
      alert(err.message || 'Failed to delete service');
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
            Services & Offerings
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Define your freelance offerings, enterprise consulting packages, and deliverables.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-600/30 transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Service
        </button>
      </div>

      {/* Services Grid */}
      {loading ? (
        <div className="flex h-64 items-center justify-center text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        </div>
      ) : services.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((srv) => (
            <div
              key={srv._id}
              className="p-6 rounded-2xl border border-slate-800 bg-slate-900/70 space-y-4 hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
                    <Zap className="w-5 h-5" />
                  </div>
                  {srv.priceRange && (
                    <Badge variant="warning">{srv.priceRange}</Badge>
                  )}
                </div>

                <h3 className="text-lg font-bold text-white">{srv.title}</h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  {srv.description}
                </p>

                {srv.features && srv.features.length > 0 && (
                  <ul className="space-y-1.5 pt-2 border-t border-slate-800 text-xs text-slate-300">
                    {srv.features.map((f, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-2">
                <button
                  onClick={() => openEditModal(srv)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  title="Edit"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() =>
                    setDeleteDialog({
                      open: true,
                      id: srv._id,
                      title: srv.title
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
          No services created yet. Click "Add Service" to create one.
        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingService ? 'Edit Service' : 'Add New Service'}
      >
        <form onSubmit={handleSaveService} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">Service Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Custom Headless CMS Development"
              required
              className="w-full px-3.5 py-2 rounded-xl text-sm border border-slate-700 bg-slate-800 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">Price Range / Estimate</label>
            <input
              type="text"
              value={formData.priceRange}
              onChange={(e) => setFormData({ ...formData, priceRange: e.target.value })}
              placeholder="e.g. Starting at $2,500 or Custom Quote"
              className="w-full px-3.5 py-2 rounded-xl text-sm border border-slate-700 bg-slate-800 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">Description</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Summary of what you deliver..."
              required
              className="w-full px-3.5 py-2 rounded-xl text-sm border border-slate-700 bg-slate-800 text-white focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">Features Checklist (One per line)</label>
            <textarea
              rows={4}
              value={formData.features}
              onChange={(e) => setFormData({ ...formData, features: e.target.value })}
              placeholder="Full REST API architecture&#10;JWT Authentication&#10;Media Upload System"
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
              {actionLoading ? 'Saving...' : editingService ? 'Update Service' : 'Add Service'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, id: null, title: '' })}
        onConfirm={confirmDelete}
        title="Delete Service"
        message={`Are you sure you want to delete service "${deleteDialog.title}"?`}
        loading={actionLoading}
      />
    </div>
  );
}
