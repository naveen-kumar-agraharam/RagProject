/**
 * React Context for managing chat session state.
 */

import React, { createContext, useCallback, useContext, useRef, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { chatApi } from '../services/api'

const ChatContext = createContext(null)

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const sessionIdRef = useRef(uuidv4())

  const sessionId = sessionIdRef.current

  const sendMessage = useCallback(async (question, documentIds = null) => {
    if (!question.trim() || isLoading) return

    setError(null)

    // Add user message immediately
    const userMessage = {
      id: uuidv4(),
      role: 'user',
      content: question.trim(),
      timestamp: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, userMessage])
    setIsLoading(true)

    try {
      const response = await chatApi.ask(question.trim(), sessionId, documentIds)

      const assistantMessage = {
        id: uuidv4(),
        role: 'assistant',
        content: response.answer,
        sources: response.sources || [],
        timestamp: new Date().toISOString(),
        metadata: {
          retrieval_time_ms: response.retrieval_time_ms,
          generation_time_ms: response.generation_time_ms,
          tokens_used: response.tokens_used,
        },
      }
      setMessages((prev) => [...prev, assistantMessage])
    } catch (err) {
      setError(err.message)
      // Add error message to chat
      const errorMessage = {
        id: uuidv4(),
        role: 'assistant',
        content: `⚠️ Error: ${err.message}`,
        sources: [],
        timestamp: new Date().toISOString(),
        isError: true,
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }, [isLoading, sessionId])

  const clearChat = useCallback(async () => {
    try {
      await chatApi.clearHistory(sessionId)
    } catch {
      // Ignore errors when clearing (session may not exist on backend yet)
    }
    setMessages([])
    setError(null)
    sessionIdRef.current = uuidv4()
  }, [sessionId])

  return (
    <ChatContext.Provider value={{
      messages,
      isLoading,
      error,
      sessionId,
      sendMessage,
      clearChat,
    }}>
      {children}
    </ChatContext.Provider>
  )
}

export const useChat = () => {
  const ctx = useContext(ChatContext)
  if (!ctx) throw new Error('useChat must be used within ChatProvider')
  return ctx
}
