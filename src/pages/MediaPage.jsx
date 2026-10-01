import React, { useState, useEffect, useRef } from 'react';
import { Image, UploadCloud, Copy, Check, Trash2, ExternalLink, Loader2 } from 'lucide-react';
import { cmsApi } from '@/api/cmsApi';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { formatBytes, formatDate } from '@/utils/formatters';

export function MediaPage() {
  const [mediaList, setMediaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  // Delete State
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null, filename: '' });
  const [actionLoading, setActionLoading] = useState(false);

  const fileInputRef = useRef(null);

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const res = await cmsApi.getMedia();
      if (res.success) {
        setMediaList(res.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch media:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const handleFileUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        await cmsApi.uploadImage(formData);
      }
      fetchMedia();
    } catch (err) {
      alert(err.message || 'Upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const copyUrl = (url, id) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const confirmDelete = async () => {
    if (!deleteDialog.id) return;
    setActionLoading(true);
    try {
      await cmsApi.deleteMedia(deleteDialog.id);
      setDeleteDialog({ open: false, id: null, filename: '' });
      fetchMedia();
    } catch (err) {
      alert(err.message || 'Failed to delete file');
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
            Media Library & Assets
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Upload images, project screenshots, and assets stored on your custom server.
          </p>
        </div>

        <div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            multiple
            accept="image/*,application/pdf"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Uploading Files...
              </>
            ) : (
              <>
                <UploadCloud className="w-4 h-4" />
                Upload New Files
              </>
            )}
          </button>
        </div>
      </div>

      {/* Media Grid */}
      {loading ? (
        <div className="flex h-64 items-center justify-center text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        </div>
      ) : mediaList.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {mediaList.map((item) => {
            const isImage = item.mimeType?.startsWith('image/');
            return (
              <div
                key={item._id}
                className="rounded-2xl border border-slate-800 bg-slate-900/70 overflow-hidden hover:border-slate-700 transition-all flex flex-col justify-between"
              >
                {/* Image Preview / Thumbnail */}
                <div className="h-36 bg-slate-800 flex items-center justify-center overflow-hidden relative group">
                  {isImage ? (
                    <img
                      src={item.url}
                      alt={item.originalName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  ) : (
                    <Image className="w-10 h-10 text-slate-500" />
                  )}

                  <a
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Open Full File"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                {/* Details & Actions */}
                <div className="p-4 space-y-3">
                  <div>
                    <h4 className="text-xs font-bold text-white truncate" title={item.originalName}>
                      {item.originalName}
                    </h4>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono mt-1">
                      <span>{formatBytes(item.size)}</span>
                      <span>{formatDate(item.createdAt)}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                    <button
                      onClick={() => copyUrl(item.url, item._id)}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-400 hover:text-indigo-300"
                    >
                      {copiedId === item._id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Copied URL</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy URL</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() =>
                        setDeleteDialog({
                          open: true,
                          id: item._id,
                          filename: item.originalName
                        })
                      }
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
                      title="Delete Asset"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-16 text-center rounded-2xl border border-dashed border-slate-800 bg-slate-900/30 space-y-3">
          <UploadCloud className="w-10 h-10 text-slate-500 mx-auto" />
          <h3 className="text-sm font-bold text-white">No media files uploaded yet</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Upload images, portfolio screenshots, and document assets to host directly on your CMS.
          </p>
        </div>
      )}

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, id: null, filename: '' })}
        onConfirm={confirmDelete}
        title="Delete Media File"
        message={`Are you sure you want to permanently delete "${deleteDialog.filename}"?`}
        loading={actionLoading}
      />
    </div>
  );
}
