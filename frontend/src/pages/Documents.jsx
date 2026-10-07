/**
 * Documents Page
 * Clean, professional document knowledge base manager for Intellica.
 * Search, filter, view details, and delete documents with real-time vector removal.
 */

import React, { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  FileText,
  Upload,
  Search,
  RefreshCw,
  AlertCircle,
  FolderOpen,
  Layers,
  Filter,
} from 'lucide-react'
import DocumentCard from '../components/DocumentCard'
import { documentsApi } from '../services/api'

const Documents = () => {
  const [documents, setDocuments] = useState([])
  const [filtered, setFiltered] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('date_desc')

  const fetchDocuments = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await documentsApi.list()
      setDocuments(data.documents || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDocuments()
  }, [fetchDocuments])

  // Filter and sort
  useEffect(() => {
    let list = [...documents]

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      list = list.filter((d) =>
        d.original_filename.toLowerCase().includes(q)
      )
    }

    if (sortBy === 'date_desc') {
      list.sort((a, b) => new Date(b.upload_date) - new Date(a.upload_date))
    } else if (sortBy === 'date_asc') {
      list.sort((a, b) => new Date(a.upload_date) - new Date(b.upload_date))
    } else if (sortBy === 'name') {
      list.sort((a, b) => a.original_filename.localeCompare(b.original_filename))
    } else if (sortBy === 'pages') {
      list.sort((a, b) => b.num_pages - a.num_pages)
    }

    setFiltered(list)
  }, [documents, searchQuery, sortBy])

  const handleDelete = (documentId) => {
    setDocuments((prev) => prev.filter((d) => d.document_id !== documentId))
  }

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-6 page-enter">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Documents
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your uploaded knowledge sources.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchDocuments}
            id="refresh-documents-btn"
            className="btn-secondary text-xs flex items-center gap-1.5"
            title="Refresh document list"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <Link to="/upload" className="btn-primary text-xs flex items-center gap-1.5">
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Document</span>
          </Link>
        </div>
      </div>

      {/* Search and Sort Toolbar */}
      {documents.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search documents by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-primary-900 shadow-sm"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white border border-slate-200 text-xs text-slate-700 rounded-lg px-3 py-2 focus:outline-none focus:border-primary-900 shadow-sm"
            >
              <option value="date_desc">Newest First</option>
              <option value="date_asc">Oldest First</option>
              <option value="name">Name (A-Z)</option>
              <option value="pages">Most Pages</option>
            </select>
          </div>
        </div>
      )}

      {/* Error alert */}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs animate-fade-in">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
          <div className="flex-1">
            <p className="font-semibold">Failed to load documents</p>
            <p className="text-slate-600">{error}</p>
          </div>
          <button onClick={fetchDocuments} className="text-rose-700 underline font-semibold">
            Retry
          </button>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && !error && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="clean-card p-5 space-y-3 animate-pulse">
              <div className="h-4 bg-slate-200 rounded w-3/4" />
              <div className="h-3 bg-slate-100 rounded w-1/2" />
              <div className="grid grid-cols-2 gap-2 pt-2">
                <div className="h-12 bg-slate-100 rounded" />
                <div className="h-12 bg-slate-100 rounded" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Document Grid */}
      {!loading && !error && filtered.length > 0 && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((doc) => (
            <DocumentCard
              key={doc.document_id}
              document={doc}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && documents.length === 0 && (
        <div className="clean-card p-14 text-center space-y-4 max-w-md mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-primary-50 border border-primary-100 flex items-center justify-center mx-auto text-primary-900">
            <FolderOpen className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">No documents yet</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
              Upload your college syllabus, academic regulations, or notices to populate your Intellica knowledge base.
            </p>
          </div>
          <div className="pt-2">
            <Link to="/upload" className="btn-primary text-xs inline-flex items-center gap-1.5">
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Document</span>
            </Link>
          </div>
        </div>
      )}

      {/* Search No Match State */}
      {!loading && !error && documents.length > 0 && filtered.length === 0 && (
        <div className="clean-card p-10 text-center text-xs text-slate-500 space-y-2">
          <Search className="w-6 h-6 mx-auto text-slate-400" />
          <p>No documents found matching "{searchQuery}".</p>
          <button
            onClick={() => setSearchQuery('')}
            className="text-primary-900 font-semibold hover:underline"
          >
            Clear search query
          </button>
        </div>
      )}
    </div>
  )
}

export default Documents
