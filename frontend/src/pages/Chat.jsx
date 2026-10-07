/**
 * Chat Page
 * Clean, professional AI chat interface for Intellica.
 * Deep blue user bubbles, white AI cards with source citations, and modern spacious input.
 */

import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Send,
  Trash2,
  MessageSquare,
  Upload,
  Lightbulb,
  Layers,
  Sparkles,
  RefreshCw,
  Plus,
} from 'lucide-react'
import ChatMessage from '../components/ChatMessage'
import TypingIndicator from '../components/TypingIndicator'
import { useChat } from '../context/ChatContext'

const SUGGESTED_QUESTIONS = [
  "What is the minimum CGPA required for placements?",
  "What are the attendance requirements to appear for exams?",
  "What is the grading policy and condonation rule?",
  "What topics are included in the course syllabus?",
]

const Chat = () => {
  const { messages, isLoading, sendMessage, clearChat } = useChat()
  const [input, setInput] = useState('')
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  // Auto-scroll on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  const handleSend = async (e) => {
    if (e) e.preventDefault()
    const q = input.trim()
    if (!q || isLoading) return
    setInput('')
    await sendMessage(q)
    inputRef.current?.focus()
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handlePromptClick = (question) => {
    setInput(question)
    inputRef.current?.focus()
  }

  return (
    <div className="flex flex-col h-screen max-h-screen bg-slate-50">
      {/* Top Header */}
      <div className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between flex-shrink-0 z-10 shadow-subtle">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary-900 flex items-center justify-center text-white shadow-sm flex-shrink-0">
            <Layers className="w-5 h-5 text-teal-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-base text-slate-900 tracking-tight leading-none">
                Intellica
              </h1>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Online
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Powered by Gemini • RAG Pipeline
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {messages.length > 0 && (
            <button
              type="button"
              onClick={clearChat}
              id="clear-chat-btn"
              className="btn-secondary text-xs flex items-center gap-1.5"
              title="Start a fresh conversation"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Chat</span>
            </button>
          )}

          <Link
            to="/upload"
            className="btn-primary text-xs flex items-center gap-1.5"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Document</span>
          </Link>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 space-y-6">
        {/* Empty State */}
        {messages.length === 0 && !isLoading && (
          <div className="flex flex-col items-center justify-center min-h-[70%] text-center max-w-xl mx-auto space-y-6 page-enter py-8">
            <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center text-primary-900">
              <Layers className="w-8 h-8 text-primary-900" />
            </div>

            <div className="space-y-1.5">
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                Ask Intellica Anything
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                Ask specific questions about your uploaded documents. Intellica retrieves relevant text chunks and generates grounded answers with exact source citations.
              </p>
            </div>

            {/* Suggested Prompts */}
            <div className="w-full space-y-2">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center justify-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                <span>Suggested Questions</span>
              </p>
              <div className="grid sm:grid-cols-2 gap-2 pt-1 text-left">
                {SUGGESTED_QUESTIONS.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => handlePromptClick(q)}
                    className="clean-card p-3 text-xs text-slate-700 hover:text-primary-900 hover:border-primary-400 hover:bg-white transition-all text-left flex items-start justify-between group"
                  >
                    <span>{q}</span>
                    <Sparkles className="w-3 h-3 text-slate-400 group-hover:text-teal-600 flex-shrink-0 mt-0.5 ml-2" />
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 text-xs text-slate-500 flex items-center gap-1.5">
              <span>Have a new document?</span>
              <Link to="/upload" className="font-semibold text-primary-900 hover:underline">
                Upload PDF here
              </Link>
            </div>
          </div>
        )}

        {/* Message List */}
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}

        {/* Typing Loading Indicator */}
        {isLoading && <TypingIndicator />}

        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input Container */}
      <div className="p-4 sm:p-6 bg-white border-t border-slate-200 flex-shrink-0">
        <div className="max-w-4xl mx-auto space-y-2">
          <form onSubmit={handleSend} className="relative flex items-center">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              placeholder="Ask about your uploaded documents..."
              className="w-full pl-4 pr-14 py-3 bg-white border border-slate-300 rounded-xl text-sm text-slate-800 placeholder-slate-400 shadow-sm focus:outline-none focus:border-primary-900 focus:ring-1 focus:ring-primary-900 transition-all disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="absolute right-2 px-3 py-2 bg-primary-900 hover:bg-primary-950 disabled:opacity-40 text-white rounded-lg transition-colors flex items-center justify-center shadow-sm"
              title="Send question"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

          {/* Grounding Disclaimer */}
          <p className="text-[11px] text-center text-slate-500 font-medium">
            Intellica answers based on your uploaded documents.
          </p>
        </div>
      </div>
    </div>
  )
}

export default Chat
