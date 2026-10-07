/**
 * Chat Message Component
 * Clean light AI SaaS message presentation.
 * User message: Deep Blue background (#1E3A8A) with white text.
 * AI message: White card with light gray border, dark text, and clear source citations.
 */

import React, { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { User, FileText, ChevronDown, ChevronUp, Layers, CheckCircle2 } from 'lucide-react'
import { format } from 'date-fns'

const SourceBadge = ({ source }) => (
  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700">
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-1.5 font-semibold text-primary-900 truncate">
        <FileText className="w-3.5 h-3.5 text-teal-700 flex-shrink-0" />
        <span className="truncate">{source.document_name}</span>
      </div>
      {source.page_number && (
        <span className="px-1.5 py-0.5 rounded bg-white border border-slate-200 text-[11px] font-medium text-slate-600 flex-shrink-0">
          Page {source.page_number}
        </span>
      )}
    </div>
    {source.relevance_score != null && (
      <div className="mt-1 flex items-center gap-1 text-[11px] text-slate-500">
        <span>Relevance:</span>
        <span className="font-semibold text-teal-700">
          {Math.round(source.relevance_score * 100)}%
        </span>
      </div>
    )}
    {source.excerpt && (
      <p className="mt-1.5 text-slate-600 italic bg-white p-2 rounded border border-slate-100 text-[11px] leading-relaxed line-clamp-3">
        "{source.excerpt}"
      </p>
    )}
  </div>
)

const ChatMessage = ({ message }) => {
  const [showSources, setShowSources] = useState(true)
  const isUser = message.role === 'user'
  const hasSources = message.sources && message.sources.length > 0

  return (
    <div className={`flex gap-3 animate-slide-up ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      <div className={`
        flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-semibold
        ${isUser
          ? 'bg-primary-900 text-white shadow-sm'
          : 'bg-teal-700 text-white shadow-sm'
        }
      `}>
        {isUser ? (
          <User className="w-4 h-4 text-white" />
        ) : (
          <Layers className="w-4 h-4 text-teal-100" />
        )}
      </div>

      {/* Message Bubble */}
      <div className={`max-w-[82%] sm:max-w-[75%] space-y-2 ${isUser ? 'items-end' : 'items-start'} flex flex-col`}>
        {/* Name and Role Label */}
        <div className="flex items-center gap-2 text-xs text-slate-500 px-0.5">
          <span className="font-semibold text-slate-700">
            {isUser ? 'You' : 'Intellica'}
          </span>
          {message.timestamp && (
            <span className="text-[10px]">
              {format(new Date(message.timestamp), 'h:mm a')}
            </span>
          )}
        </div>

        {/* Bubble Content */}
        <div className={`
          px-4 py-3 rounded-xl text-sm leading-relaxed shadow-sm
          ${isUser
            ? 'bg-primary-900 text-white rounded-tr-none'
            : message.isError
              ? 'bg-rose-50 border border-rose-200 text-rose-800 rounded-tl-none'
              : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'
          }
        `}>
          {isUser ? (
            <p className="whitespace-pre-wrap font-normal text-white">{message.content}</p>
          ) : (
            <div className="prose prose-sm max-w-none text-slate-800 space-y-2">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {message.content}
              </ReactMarkdown>
            </div>
          )}

          {/* Sources Section directly below response */}
          {!isUser && hasSources && (
            <div className="mt-4 pt-3 border-t border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-primary-900" />
                  Sources
                </span>
                <button
                  type="button"
                  onClick={() => setShowSources(!showSources)}
                  className="inline-flex items-center gap-1 text-xs font-medium text-primary-900 hover:text-primary-700 transition-colors"
                >
                  <span className="bg-primary-50 px-2 py-0.5 rounded text-[11px] font-semibold text-primary-900 border border-primary-200">
                    {message.sources.length} {message.sources.length === 1 ? 'source used' : 'sources used'}
                  </span>
                  {showSources ? (
                    <ChevronUp className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>

              {showSources && (
                <div className="grid gap-2 mt-2">
                  {message.sources.map((source, i) => (
                    <SourceBadge key={i} source={source} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ChatMessage
