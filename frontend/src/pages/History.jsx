/**
 * Chat History Page
 * Clean, professional conversation log for Intellica.
 * Shows recent conversations with title, date, message count, and continue button.
 */

import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  History,
  MessageSquare,
  Calendar,
  Trash2,
  ArrowRight,
  Clock,
  Sparkles,
  Layers,
  RefreshCw,
} from 'lucide-react'
import { chatApi } from '../services/api'
import { useChat } from '../context/ChatContext'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

const HistoryPage = () => {
  const navigate = useNavigate()
  const { messages, sessionId, clearChat } = useChat()
  const [historyItems, setHistoryItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true)
      try {
        // Fetch current session history
        const data = await chatApi.getHistory(sessionId)
        if (data && data.messages && data.messages.length > 0) {
          // Group into conversation session entry
          const firstUserMsg = data.messages.find((m) => m.role === 'user')
          const title = firstUserMsg ? firstUserMsg.content : 'Document Query Session'
          setHistoryItems([
            {
              session_id: sessionId,
              title: title.length > 65 ? title.substring(0, 65) + '...' : title,
              message_count: data.messages.length,
              timestamp: data.messages[data.messages.length - 1]?.timestamp || new Date().toISOString(),
              active: true,
            },
          ])
        } else if (messages.length > 0) {
          const firstUserMsg = messages.find((m) => m.role === 'user')
          const title = firstUserMsg ? firstUserMsg.content : 'Document Query Session'
          setHistoryItems([
            {
              session_id: sessionId,
              title: title.length > 65 ? title.substring(0, 65) + '...' : title,
              message_count: messages.length,
              timestamp: new Date().toISOString(),
              active: true,
            },
          ])
        } else {
          setHistoryItems([])
        }
      } catch (err) {
        console.error('History fetch error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchHistory()
  }, [sessionId, messages])

  const handleClear = async () => {
    try {
      await clearChat()
      setHistoryItems([])
      toast.success('Chat history cleared')
    } catch (err) {
      toast.error('Failed to clear history')
    }
  }

  return (
    <div className="p-6 sm:p-8 max-w-5xl mx-auto space-y-6 page-enter">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Chat History
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Review and continue your document conversations.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {historyItems.length > 0 && (
            <button
              onClick={handleClear}
              className="btn-secondary text-xs text-rose-600 hover:text-rose-700 flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          )}
          <Link to="/chat" className="btn-primary text-xs flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Open Chat</span>
          </Link>
        </div>
      </div>

      {/* Conversations Section */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <History className="w-4 h-4 text-primary-900" />
          <span>Recent Conversations</span>
        </h2>

        {historyItems.length > 0 ? (
          <div className="grid gap-3">
            {historyItems.map((item) => (
              <div
                key={item.session_id}
                onClick={() => navigate('/chat')}
                className="clean-card p-5 hover:border-slate-300 hover:shadow-card-hover transition-all cursor-pointer flex items-center justify-between group"
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-primary-50 border border-primary-100 flex items-center justify-center text-primary-900 flex-shrink-0">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-slate-900 truncate group-hover:text-primary-900 transition-colors">
                      {item.title}
                    </h3>
                    <div className="flex items-center gap-4 mt-1 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {format(new Date(item.timestamp), 'MMM d, yyyy · h:mm a')}
                      </span>
                      <span className="font-medium text-slate-600">
                        {item.message_count} message{item.message_count !== 1 ? 's' : ''}
                      </span>
                      {item.active && (
                        <span className="badge-processed text-[10px] py-0 px-2">
                          Active Session
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pl-4 flex-shrink-0">
                  <span className="text-xs font-semibold text-primary-900 hidden sm:inline-block group-hover:underline">
                    Continue Chat
                  </span>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-primary-900 group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="clean-card p-12 text-center space-y-3 max-w-md mx-auto">
            <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 mx-auto">
              <History className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">No Chat History</h3>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              You haven't asked any questions in this session yet. Upload a document or start a new conversation.
            </p>
            <div className="pt-2">
              <Link to="/chat" className="btn-primary text-xs inline-flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Start Chat</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default HistoryPage
