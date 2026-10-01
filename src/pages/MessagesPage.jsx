import React, { useState, useEffect } from 'react';
import { Mail, Trash2, Eye, CheckCircle2, Clock, Reply, Loader2 } from 'lucide-react';
import { cmsApi } from '@/api/cmsApi';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Badge } from '@/components/ui/Badge';
import { formatDate } from '@/utils/formatters';

export function MessagesPage() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  // Detail Modal
  const [selectedMessage, setSelectedMessage] = useState(null);

  // Delete State
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null, sender: '' });
  const [actionLoading, setActionLoading] = useState(false);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const res = await cmsApi.getMessages();
      if (res.success) {
        setMessages(res.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch messages:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const openMessage = async (msg) => {
    setSelectedMessage(msg);
    if (!msg.isRead) {
      try {
        await cmsApi.markMessageRead(msg._id);
        setMessages((prev) =>
          prev.map((m) => (m._id === msg._id ? { ...m, isRead: true } : m))
        );
      } catch (err) {
        console.error('Failed to mark read:', err);
      }
    }
  };

  const confirmDelete = async () => {
    if (!deleteDialog.id) return;
    setActionLoading(true);
    try {
      await cmsApi.deleteMessage(deleteDialog.id);
      setDeleteDialog({ open: false, id: null, sender: '' });
      fetchMessages();
    } catch (err) {
      alert(err.message || 'Failed to delete message');
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
            Contact Inquiries & Messages
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Messages submitted by visitors and prospective clients via your portfolio.
          </p>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex h-64 items-center justify-center text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        </div>
      ) : messages.length > 0 ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-800/80 text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Sender</th>
                  <th className="px-6 py-3.5">Subject</th>
                  <th className="px-6 py-3.5">Date Received</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {messages.map((msg) => (
                  <tr
                    key={msg._id}
                    className={`hover:bg-slate-800/40 transition-colors ${
                      !msg.isRead ? 'bg-indigo-950/20 font-semibold' : ''
                    }`}
                  >
                    <td className="px-6 py-4">
                      {msg.isRead ? (
                        <Badge variant="secondary">Read</Badge>
                      ) : (
                        <Badge variant="warning">★ New</Badge>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-white">{msg.name}</div>
                      <div className="text-xs text-slate-400 font-normal">
                        {msg.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 max-w-xs truncate text-slate-200">
                      {msg.subject || 'General Inquiry'}
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-slate-400">
                      {formatDate(msg.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openMessage(msg)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                          title="View Message"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() =>
                            setDeleteDialog({
                              open: true,
                              id: msg._id,
                              sender: msg.name
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
          No contact messages received yet.
        </div>
      )}

      {/* Message Reader Modal */}
      <Modal
        isOpen={!!selectedMessage}
        onClose={() => setSelectedMessage(null)}
        title={selectedMessage?.subject || 'Contact Inquiry'}
      >
        {selectedMessage && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-4 rounded-xl bg-slate-800 border border-slate-700 text-xs">
              <div>
                <span className="text-slate-400 block font-normal">From</span>
                <span className="font-bold text-white text-sm">
                  {selectedMessage.name} ({selectedMessage.email})
                </span>
              </div>
              <div className="text-slate-400 font-mono">
                {formatDate(selectedMessage.createdAt)}
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Message Body
              </span>
              <div className="p-4 rounded-xl border border-slate-700 bg-slate-800/60 text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
                {selectedMessage.message}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <a
                href={`mailto:${selectedMessage.email}?subject=Re: ${encodeURIComponent(
                  selectedMessage.subject || 'Portfolio Inquiry'
                )}`}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-500 transition-colors"
              >
                <Reply className="w-4 h-4" />
                Reply via Email
              </a>

              <button
                type="button"
                onClick={() => setSelectedMessage(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, id: null, sender: '' })}
        onConfirm={confirmDelete}
        title="Delete Message"
        message={`Are you sure you want to delete inquiry from "${deleteDialog.sender}"?`}
        loading={actionLoading}
      />
    </div>
  );
}
