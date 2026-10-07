/**
 * Dashboard Page
 * Professional AI SaaS dashboard for Intellica.
 * Stats cards, quick actions, and recent documents.
 */

import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  FileText,
  MessageSquare,
  Upload,
  Layers,
  ArrowRight,
  CheckCircle2,
  Database,
  HelpCircle,
  Plus,
  BookOpen,
} from 'lucide-react'
import StatsCard from '../components/StatsCard'
import { documentsApi } from '../services/api'
import { format } from 'date-fns'

const Dashboard = () => {
  const [stats, setStats] = useState(null)
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, docsData] = await Promise.allSettled([
          documentsApi.getStats(),
          documentsApi.list(),
        ])
        if (statsData.status === 'fulfilled') setStats(statsData.value)
        if (docsData.status === 'fulfilled') setDocuments(docsData.value.documents || [])
      } catch (err) {
        console.error('Dashboard fetch error:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-8 page-enter">
      {/* Welcome Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Welcome to Intellica
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Your intelligent assistant for understanding documents.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-3">
          <Link
            to="/upload"
            className="btn-primary text-xs flex items-center gap-1.5"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload a Document</span>
          </Link>
          <Link
            to="/chat"
            className="btn-secondary text-xs flex items-center gap-1.5"
          >
            <MessageSquare className="w-3.5 h-3.5 text-primary-900" />
            <span>Start New Chat</span>
          </Link>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          icon={FileText}
          label="Total Documents"
          value={stats?.total_documents ?? documents.length}
          subtitle="Uploaded knowledge sources"
          iconBg="bg-primary-50"
          iconColor="text-primary-900"
        />
        <StatsCard
          icon={HelpCircle}
          label="Total Questions"
          value={stats?.total_questions ?? 0}
          subtitle="Questions processed via RAG"
          iconBg="bg-teal-50"
          iconColor="text-teal-700"
        />
        <StatsCard
          icon={CheckCircle2}
          label="Documents Processed"
          value={stats?.total_documents ?? documents.length}
          subtitle="Fully vectorized & ready"
          iconBg="bg-emerald-50"
          iconColor="text-emerald-700"
        />
        <StatsCard
          icon={Database}
          label="Active Sources"
          value={stats?.total_chunks ?? documents.reduce((acc, d) => acc + (d.num_chunks || 0), 0)}
          subtitle="Vector chunks in ChromaDB"
          iconBg="bg-blue-50"
          iconColor="text-blue-700"
        />
      </div>

      {/* Quick Action Cards */}
      <div>
        <h2 className="text-base font-bold text-slate-900 mb-3">Quick Actions</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <Link
            to="/upload"
            className="clean-card p-5 hover:border-slate-300 hover:shadow-card-hover transition-all flex items-center gap-4 group"
          >
            <div className="w-11 h-11 rounded-xl bg-primary-50 border border-primary-100 flex items-center justify-center text-primary-900 flex-shrink-0 group-hover:scale-105 transition-transform">
              <Upload className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-slate-900 text-sm">Upload a Document</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Add syllabus, academic rules, or handbooks to knowledge base
              </p>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-primary-900 group-hover:translate-x-1 transition-all" />
          </Link>

          <Link
            to="/chat"
            className="clean-card p-5 hover:border-slate-300 hover:shadow-card-hover transition-all flex items-center gap-4 group"
          >
            <div className="w-11 h-11 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700 flex-shrink-0 group-hover:scale-105 transition-transform">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-slate-900 text-sm">Start New Chat</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Ask questions and receive instant answers with source citations
              </p>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-teal-700 group-hover:translate-x-1 transition-all" />
          </Link>
        </div>
      </div>

      {/* Recent Documents Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary-900" />
            <span>Recent Documents</span>
          </h2>
          {documents.length > 0 && (
            <Link
              to="/documents"
              className="text-xs font-semibold text-primary-900 hover:underline flex items-center gap-1"
            >
              <span>View all documents</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>

        {documents.length > 0 ? (
          <div className="clean-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                    <th className="px-5 py-3">Document Name</th>
                    <th className="px-5 py-3">Upload Date</th>
                    <th className="px-5 py-3">Number of Pages</th>
                    <th className="px-5 py-3">Processing Status</th>
                    <th className="px-5 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {documents.slice(0, 5).map((doc) => (
                    <tr key={doc.document_id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <FileText className="w-4 h-4 text-primary-900 flex-shrink-0" />
                          <span className="font-semibold text-slate-800 truncate max-w-[240px]">
                            {doc.original_filename}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-slate-500">
                        {doc.upload_date
                          ? format(new Date(doc.upload_date), 'MMM d, yyyy · HH:mm')
                          : '—'
                        }
                      </td>
                      <td className="px-5 py-3.5 text-slate-700 font-medium">
                        {doc.num_pages} pages
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="badge-processed">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          {doc.status || 'Processed'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <Link
                          to="/documents"
                          className="text-xs font-medium text-primary-900 hover:underline"
                        >
                          Manage
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="clean-card p-10 text-center space-y-3">
            <div className="w-12 h-12 rounded-xl bg-primary-50 border border-primary-100 flex items-center justify-center text-primary-900 mx-auto">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-slate-900">No Documents Uploaded Yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Upload your first syllabus, rules, or lecture material to enable intelligent Q&A with Intellica.
            </p>
            <div className="pt-2">
              <Link to="/upload" className="btn-primary text-xs inline-flex items-center gap-1.5">
                <Upload className="w-3.5 h-3.5" />
                <span>Upload a Document</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard
