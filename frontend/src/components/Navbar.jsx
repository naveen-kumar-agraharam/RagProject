/**
 * Top Header Component
 * Clean white header with Intellica title, live status indicator, and quick actions.
 */

import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, Upload, MessageSquare, Sparkles } from 'lucide-react'
import { useChat } from '../context/ChatContext'

const Navbar = () => {
  const navigate = useNavigate()
  const { clearChat } = useChat()

  const handleNewChat = async () => {
    await clearChat()
    navigate('/chat')
  }

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between flex-shrink-0 z-20">
      {/* Title & Status */}
      <div className="flex items-center gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Intellica
            </h2>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Online
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Powered by Gemini • RAG Pipeline
          </p>
        </div>
      </div>

      {/* Right Quick Actions */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={handleNewChat}
          className="btn-secondary text-xs flex items-center gap-1.5"
          title="Start fresh conversation"
        >
          <Plus className="w-3.5 h-3.5 text-slate-600" />
          <span>New Chat</span>
        </button>

        <Link
          to="/upload"
          className="btn-primary text-xs flex items-center gap-1.5"
          title="Upload new documents"
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Upload Document</span>
        </Link>
      </div>
    </header>
  )
}

export default Navbar
