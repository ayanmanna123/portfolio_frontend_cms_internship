import React, { useState, useEffect } from 'react';
import { Cpu, Plus, Edit2, Trash2, Search, Star, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { cmsApi } from '@/api/cmsApi';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Badge } from '@/components/ui/Badge';

const CATEGORIES = ['Frontend', 'Backend', 'Database', 'DevOps & Tools', 'Design & Other'];

export function SkillsPage() {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Frontend',
    level: 85,
    icon: 'code',
    isFeatured: false,
    order: 0
  });

  // Delete Dialog State
  const [deleteDialog, setDeleteDialog] = useState({ open: false, skillId: null, skillName: '' });
  const [actionLoading, setActionLoading] = useState(false);

  const fetchSkills = async () => {
    setLoading(true);
    try {
      const res = await cmsApi.getSkills();
      if (res.success) {
        setSkills(res.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch skills:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSkills();
  }, []);

  const openCreateModal = () => {
    setEditingSkill(null);
    setFormData({
      name: '',
      category: 'Frontend',
      level: 85,
      icon: 'code',
      isFeatured: false,
      order: skills.length + 1
    });
    setModalOpen(true);
  };

  const openEditModal = (skill) => {
    setEditingSkill(skill);
    setFormData({
      name: skill.name,
      category: skill.category,
      level: skill.level || 85,
      icon: skill.icon || 'code',
      isFeatured: !!skill.isFeatured,
      order: skill.order || 0
    });
    setModalOpen(true);
  };

  const handleSaveSkill = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      if (editingSkill) {
        await cmsApi.updateSkill(editingSkill._id, formData);
      } else {
        await cmsApi.createSkill(formData);
      }
      setModalOpen(false);
      fetchSkills();
    } catch (err) {
      alert(err.message || 'Failed to save skill');
    } finally {
      setActionLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteDialog.skillId) return;
    setActionLoading(true);
    try {
      await cmsApi.deleteSkill(deleteDialog.skillId);
      setDeleteDialog({ open: false, skillId: null, skillName: '' });
      fetchSkills();
    } catch (err) {
      alert(err.message || 'Failed to delete skill');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredSkills = skills.filter((s) => {
    const matchCat = selectedCategory === 'All' || s.category === selectedCategory;
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Technical Skills Management
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Create, update, and manage your technical abilities, tools, and categories.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-600/30 transition-all"
        >
          <Plus className="w-4 h-4" />
          Add New Skill
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl border border-slate-800 bg-slate-900/60">
        <div className="flex flex-wrap items-center gap-1.5">
          {['All', ...CATEGORIES].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
          <input
            type="text"
            placeholder="Search skills..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-3 py-1.5 rounded-xl text-xs border border-slate-700 bg-slate-800 text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
            style={{ paddingLeft: '2.5rem' }}
          />
        </div>
      </div>

      {/* Skills Table / Grid */}
      {loading ? (
        <div className="flex h-64 items-center justify-center text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        </div>
      ) : filteredSkills.length > 0 ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-800/80 text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="px-6 py-3.5">Skill Name</th>
                  <th className="px-6 py-3.5">Category</th>
                  <th className="px-6 py-3.5">Proficiency Level</th>
                  <th className="px-6 py-3.5">Featured</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {filteredSkills.map((skill) => (
                  <tr key={skill._id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4 font-bold text-white flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-indigo-400" />
                      {skill.name}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="secondary">{skill.category}</Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3 w-40">
                        <div className="flex-1 h-2 rounded-full bg-slate-800 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-indigo-500"
                            style={{ width: `${skill.level}%` }}
                          />
                        </div>
                        <span className="font-mono text-xs text-white">{skill.level}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {skill.isFeatured ? (
                        <span className="inline-flex items-center gap-1 text-amber-400 text-xs font-semibold">
                          <Star className="w-3.5 h-3.5 fill-amber-400" />
                          Featured
                        </span>
                      ) : (
                        <span className="text-slate-500 text-xs">Standard</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(skill)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() =>
                            setDeleteDialog({
                              open: true,
                              skillId: skill._id,
                              skillName: skill.name
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
          No skills found. Click "Add New Skill" to create one.
        </div>
      )}

      {/* Add / Edit Skill Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingSkill ? 'Edit Skill' : 'Create New Skill'}
      >
        <form onSubmit={handleSaveSkill} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">Skill Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Next.js, Docker, Python"
              required
              className="w-full px-3.5 py-2 rounded-xl text-sm border border-slate-700 bg-slate-800 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl text-sm border border-slate-700 bg-slate-800 text-white focus:outline-none focus:border-indigo-500"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">
                Proficiency Level ({formData.level}%)
              </label>
              <input
                type="range"
                min="1"
                max="100"
                value={formData.level}
                onChange={(e) => setFormData({ ...formData, level: Number(e.target.value) })}
                className="w-full h-2 rounded-lg bg-slate-700 accent-indigo-500 cursor-pointer mt-2"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <label className="flex items-center gap-2 text-xs font-bold text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isFeatured}
                onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500"
              />
              Mark as Featured Skill
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
              {actionLoading ? 'Saving...' : editingSkill ? 'Update Skill' : 'Create Skill'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, skillId: null, skillName: '' })}
        onConfirm={confirmDelete}
        title="Delete Skill"
        message={`Are you sure you want to delete skill "${deleteDialog.skillName}"?`}
        loading={actionLoading}
      />
    </div>
  );
}
