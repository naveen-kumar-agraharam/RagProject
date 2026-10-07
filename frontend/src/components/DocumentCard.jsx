/**
 * Document Card Component
 * Clean white card for knowledge base documents.
 * Actions: View details and Delete with confirmation.
 */

import React, { useState } from 'react'
import { FileText, Trash2, Calendar, Layers, Eye, CheckCircle2, AlertCircle, Clock, Loader2, X } from 'lucide-react'
import { format } from 'date-fns'
import { documentsApi } from '../services/api'
import toast from 'react-hot-toast'

const DocumentCard = ({ document, onDelete }) => {
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [showModal, setShowModal] = useState(false)

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true)
      setTimeout(() => setConfirmDelete(false), 3000)
      return
    }
    setDeleting(true)
    try {
      await documentsApi.delete(document.document_id)
      toast.success(`Deleted ${document.original_filename}`)
      onDelete(document.document_id)
    } catch (err) {
      toast.error(`Delete failed: ${err.message}`)
      setDeleting(false)
      setConfirmDelete(false)
    }
  }

  const sizeMB = document.file_size
    ? (document.file_size / (1024 * 1024)).toFixed(2)
    : null

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'processed':
        return (
          <span className="badge-processed">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Processed
          </span>
        )
      case 'processing':
        return (
          <span className="badge-processing">
            <Clock className="w-3 h-3 text-amber-600 animate-spin" />
            Processing
          </span>
        )
      case 'failed':
        return (
          <span className="badge-failed">
            <AlertCircle className="w-3 h-3 text-rose-600" />
            Failed
          </span>
        )
      default:
        return (
          <span className="badge-neutral">
            {status || 'Unknown'}
          </span>
        )
    }
  }

  return (
    <>
      <div className="clean-card p-5 hover:border-slate-300 hover:shadow-card-hover transition-all duration-200 flex flex-col justify-between">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary-50 border border-primary-100 flex items-center justify-center flex-shrink-0 text-primary-900">
              <FileText className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h3
                className="text-sm font-semibold text-slate-900 truncate"
                title={document.original_filename}
              >
                {document.original_filename}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {sizeMB ? `${sizeMB} MB` : 'PDF Document'}
              </p>
            </div>
            <div className="flex-shrink-0">
              {getStatusBadge(document.status)}
            </div>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-2 py-1">
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-center">
              <p className="text-base font-bold text-slate-900">{document.num_pages}</p>
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Pages</p>
            </div>
            <div className="p-2.5 rounded-lg bg-teal-50 border border-teal-100 text-center">
              <p className="text-base font-bold text-teal-800">{document.num_chunks}</p>
              <p className="text-[10px] font-semibold text-teal-600 uppercase tracking-wider">Vectors</p>
            </div>
          </div>

          {/* Upload Date */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>
              {document.upload_date
                ? format(new Date(document.upload_date), 'MMM d, yyyy · HH:mm')
                : 'Date unknown'
              }
            </span>
          </div>
        </div>

        {/* Actions: View and Delete */}
        <div className="pt-4 mt-3 border-t border-slate-100 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="flex-1 btn-secondary text-xs py-1.5 flex items-center justify-center gap-1.5"
          >
            <Eye className="w-3.5 h-3.5 text-slate-500" />
            <span>View</span>
          </button>

          <button
            type="button"
            id={`delete-doc-${document.document_id}`}
            onClick={handleDelete}
            disabled={deleting}
            className={`
              flex-1 text-xs py-1.5 px-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-1.5
              ${confirmDelete
                ? 'bg-rose-600 text-white hover:bg-rose-700'
                : 'bg-white border border-slate-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300'
              }
              ${deleting ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            {deleting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : confirmDelete ? (
              <span>Confirm</span>
            ) : (
              <>
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* View Document Details Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="clean-card max-w-lg w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center text-primary-900">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{document.original_filename}</h3>
                  <p className="text-xs text-slate-500">Document Knowledge Source Details</p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Status</span>
                <span>{getStatusBadge(document.status)}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Document ID</span>
                <span className="font-mono text-slate-800 text-[11px] truncate max-w-[220px]">{document.document_id}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Page Count</span>
                <span className="font-semibold text-slate-800">{document.num_pages} pages</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Indexed Chunks</span>
                <span className="font-semibold text-teal-700">{document.num_chunks} vector chunks</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-medium">File Size</span>
                <span className="font-semibold text-slate-800">{sizeMB ? `${sizeMB} MB` : 'N/A'}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500 font-medium">Uploaded At</span>
                <span className="text-slate-800">
                  {document.upload_date ? format(new Date(document.upload_date), 'PPP · pp') : 'N/A'}
                </span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="btn-primary text-xs"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default DocumentCard
