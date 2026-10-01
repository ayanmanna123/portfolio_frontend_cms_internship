import React, { useState, useEffect } from 'react';
import { Briefcase, Plus, Edit2, Trash2, Calendar, Building, MapPin, Loader2 } from 'lucide-react';
import { cmsApi } from '@/api/cmsApi';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Badge } from '@/components/ui/Badge';

export function ExperiencePage() {
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingExp, setEditingExp] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    companyUrl: '',
    location: '',
    type: 'full-time',
    startDate: '',
    endDate: 'Present',
    current: true,
    description: '',
    skillsUsed: '',
    order: 0
  });

  // Delete State
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null, title: '' });
  const [actionLoading, setActionLoading] = useState(false);

  const fetchExperiences = async () => {
    setLoading(true);
    try {
      const res = await cmsApi.getExperiences();
      if (res.success) {
        setExperiences(res.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch experience:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExperiences();
  }, []);

  const openCreateModal = () => {
    setEditingExp(null);
    setFormData({
      title: '',
      company: '',
      companyUrl: '',
      location: '',
      type: 'full-time',
      startDate: '2023',
      endDate: 'Present',
      current: true,
      description: '',
      skillsUsed: '',
      order: experiences.length + 1
    });
    setModalOpen(true);
  };

  const openEditModal = (exp) => {
    setEditingExp(exp);
    setFormData({
      title: exp.title,
      company: exp.company,
      companyUrl: exp.companyUrl || '',
      location: exp.location || '',
      type: exp.type || 'full-time',
      startDate: exp.startDate,
      endDate: exp.endDate || 'Present',
      current: !!exp.current,
      description: (exp.description || []).join('\n'),
      skillsUsed: (exp.skillsUsed || []).join(', '),
      order: exp.order || 0
    });
    setModalOpen(true);
  };

  const handleSaveExp = async (e) => {
    e.preventDefault();
    setActionLoading(true);

    const payload = {
      ...formData,
      description: formData.description
        .split('\n')
        .map((d) => d.trim())
        .filter(Boolean),
      skillsUsed: formData.skillsUsed
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    };

    try {
      if (editingExp) {
        await cmsApi.updateExperience(editingExp._id, payload);
      } else {
        await cmsApi.createExperience(payload);
      }
      setModalOpen(false);
      fetchExperiences();
    } catch (err) {
      alert(err.message || 'Failed to save experience item');
    } finally {
      setActionLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteDialog.id) return;
    setActionLoading(true);
    try {
      await cmsApi.deleteExperience(deleteDialog.id);
      setDeleteDialog({ open: false, id: null, title: '' });
      fetchExperiences();
    } catch (err) {
      alert(err.message || 'Failed to delete experience');
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
            Work Experience & Timeline
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Manage your employment history, client contracts, and key milestones.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-600/30 transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Experience
        </button>
      </div>

      {/* Experience List */}
      {loading ? (
        <div className="flex h-64 items-center justify-center text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        </div>
      ) : experiences.length > 0 ? (
        <div className="space-y-4">
          {experiences.map((exp) => (
            <div
              key={exp._id}
              className="p-6 rounded-2xl border border-slate-800 bg-slate-900/70 hover:border-slate-700 transition-all space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {exp.title}
                  </h3>
                  <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 mt-0.5">
                    <Building className="w-3.5 h-3.5" />
                    <span>{exp.company}</span>
                    {exp.location && (
                      <span className="text-slate-500">• {exp.location}</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="font-mono text-xs">
                    <Calendar className="w-3 h-3" />
                    {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                  </Badge>
                  <Badge variant="default" className="capitalize">
                    {exp.type}
                  </Badge>
                </div>
              </div>

              {exp.description && exp.description.length > 0 && (
                <ul className="space-y-1.5 list-disc list-inside text-xs sm:text-sm text-slate-300">
                  {exp.description.map((d, i) => (
                    <li key={i}>{d}</li>
                  ))}
                </ul>
              )}

              {exp.skillsUsed && exp.skillsUsed.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-800">
                  {exp.skillsUsed.map((s, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-[11px] font-mono">
                      {s}
                    </span>
                  ))}
                </div>
              )}

              <div className="pt-2 flex justify-end gap-2">
                <button
                  onClick={() => openEditModal(exp)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  title="Edit"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() =>
                    setDeleteDialog({
                      open: true,
                      id: exp._id,
                      title: `${exp.title} @ ${exp.company}`
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
          No experience records found. Click "Add Experience" to add one.
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingExp ? 'Edit Experience Item' : 'Add Experience Item'}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSaveExp} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Job Title / Role</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Senior Full Stack Engineer"
                required
                className="w-full px-3.5 py-2 rounded-xl text-sm border border-slate-700 bg-slate-800 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Company Name</label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                placeholder="Acme Corp"
                required
                className="w-full px-3.5 py-2 rounded-xl text-sm border border-slate-700 bg-slate-800 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Employment Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl text-sm border border-slate-700 bg-slate-800 text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="full-time">Full-time</option>
                <option value="part-time">Part-time</option>
                <option value="contract">Contract</option>
                <option value="freelance">Freelance</option>
                <option value="internship">Internship</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="San Francisco, CA / Remote"
                className="w-full px-3.5 py-2 rounded-xl text-sm border border-slate-700 bg-slate-800 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Start Date</label>
              <input
                type="text"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                placeholder="2022 / Jan 2022"
                required
                className="w-full px-3.5 py-2 rounded-xl text-sm border border-slate-700 bg-slate-800 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">End Date</label>
              <input
                type="text"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                placeholder="Present / Dec 2023"
                className="w-full px-3.5 py-2 rounded-xl text-sm border border-slate-700 bg-slate-800 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">
              Key Responsibilities / Bullet Points (One per line)
            </label>
            <textarea
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Architected RESTful microservices...&#10;Mentored team of 4 engineers..."
              className="w-full px-3.5 py-2 rounded-xl text-sm border border-slate-700 bg-slate-800 text-white focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">Skills Used (Comma Separated)</label>
            <input
              type="text"
              value={formData.skillsUsed}
              onChange={(e) => setFormData({ ...formData, skillsUsed: e.target.value })}
              placeholder="React, Node.js, AWS, TypeScript"
              className="w-full px-3.5 py-2 rounded-xl text-sm border border-slate-700 bg-slate-800 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <label className="flex items-center gap-2 text-xs font-bold text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.current}
                onChange={(e) => setFormData({ ...formData, current: e.target.checked })}
                className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500"
              />
              Currently Working Here
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
              {actionLoading ? 'Saving...' : editingExp ? 'Update Experience' : 'Add Experience'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, id: null, title: '' })}
        onConfirm={confirmDelete}
        title="Delete Experience"
        message={`Are you sure you want to delete experience record "${deleteDialog.title}"?`}
        loading={actionLoading}
      />
    </div>
  );
}
