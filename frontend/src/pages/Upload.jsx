/**
 * Upload Page
 * Clean, professional document upload interface for Intellica.
 * Preserves exact upload API and processing logic.
 */

import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Upload,
  ArrowRight,
  FileText,
  Info,
  CheckCircle2,
  ShieldCheck,
  Cpu,
  Layers,
  MessageSquare,
} from 'lucide-react'
import UploadZone from '../components/UploadZone'

const UploadPage = () => {
  const [uploadedDocs, setUploadedDocs] = useState([])

  const handleUploadSuccess = (result) => {
    setUploadedDocs((prev) => [result, ...prev])
  }

  return (
    <div className="p-6 sm:p-8 max-w-5xl mx-auto space-y-8 page-enter">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Upload Documents
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Add PDFs to your Intellica knowledge base.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/documents" className="btn-secondary text-xs flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-slate-600" />
            <span>Manage Documents</span>
          </Link>
          <Link to="/chat" className="btn-primary text-xs flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Go to Chat</span>
          </Link>
        </div>
      </div>

      {/* Upload Zone */}
      <UploadZone onUploadSuccess={handleUploadSuccess} />

      {/* RAG Processing Workflow Cards */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="clean-card p-4 space-y-2">
          <div className="w-8 h-8 rounded-lg bg-primary-50 text-primary-900 flex items-center justify-center font-bold text-xs">
            1
          </div>
          <h3 className="font-semibold text-slate-800 text-xs">Text Extraction</h3>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            PyPDF extracts text page-by-page, cleans whitespace, and removes non-printable characters.
          </p>
        </div>

        <div className="clean-card p-4 space-y-2">
          <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-800 flex items-center justify-center font-bold text-xs">
            2
          </div>
          <h3 className="font-semibold text-slate-800 text-xs">Chunking & Vectorizing</h3>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Recursive character splitting partitions text into overlapping chunks, generating high-dimensional vectors.
          </p>
        </div>

        <div className="clean-card p-4 space-y-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold text-xs">
            3
          </div>
          <h3 className="font-semibold text-slate-800 text-xs">ChromaDB Indexing</h3>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Vectors and document metadata are stored in ChromaDB, enabling instantaneous cosine similarity search.
          </p>
        </div>
      </div>

      {/* Tips Banner */}
      <div className="p-4 rounded-xl bg-primary-50 border border-primary-100 flex items-start gap-3">
        <Info className="w-4 h-4 text-primary-900 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-primary-950 space-y-1">
          <p className="font-semibold">Recommended Document Types</p>
          <p className="text-primary-800 leading-relaxed">
            Upload text-based PDFs such as course syllabi, university exam rules, campus placement criteria, department notices, or academic handbooks for optimal retrieval quality.
          </p>
        </div>
      </div>
    </div>
  )
}

export default UploadPage
