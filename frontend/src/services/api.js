/**
 * API Service Layer
 * Axios client configured to communicate with the Intellica FastAPI backend.
 */

import axios from 'axios'

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD
    ? 'https://intellica-backend-dlqr.onrender.com'
    : 'http://localhost:8000')

// ─── Axios Instance ──────────────────────────────────────────────────────────

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000, // 2 minutes for RAG responses
  headers: {
    'Content-Type': 'application/json',
  },
})

// ─── Request Interceptor ─────────────────────────────────────────────────────

api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('intellica_token') || localStorage.getItem('collegegpt_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ─── Response Interceptor ────────────────────────────────────────────────────

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.detail ||
      error.response?.data?.error ||
      error.message ||
      'An unexpected error occurred'
    return Promise.reject(new Error(message))
  }
)

// ─── Documents API ────────────────────────────────────────────────────────────

export const documentsApi = {
  /**
   * Upload a PDF document.
   * @param {File} file - The PDF file to upload
   * @param {function} onProgress - Progress callback (0-100)
   */
  upload: async (file, onProgress) => {
    const formData = new FormData()
    formData.append('file', file)

    const response = await api.post('/api/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const pct = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          onProgress(pct)
        }
      },
    })
    return response.data
  },

  /**
   * Get all uploaded documents.
   */
  list: async () => {
    const response = await api.get('/api/documents')
    return response.data
  },

  /**
   * Delete a document by ID.
   * @param {string} documentId
   */
  delete: async (documentId) => {
    const response = await api.delete(`/api/documents/${documentId}`)
    return response.data
  },

  /**
   * Get system statistics.
   */
  getStats: async () => {
    const response = await api.get('/api/documents/stats/summary')
    return response.data
  },
}

// ─── Chat API ─────────────────────────────────────────────────────────────────

export const chatApi = {
  /**
   * Ask a question via the RAG pipeline.
   * @param {string} question - User question
   * @param {string} sessionId - Session identifier
   * @param {string[]} documentIds - Optional: filter to specific documents
   */
  ask: async (question, sessionId, documentIds = null) => {
    const response = await api.post('/api/chat', {
      question,
      session_id: sessionId,
      document_ids: documentIds,
    })
    return response.data
  },

  /**
   * Get chat history for a session.
   * @param {string} sessionId
   */
  getHistory: async (sessionId) => {
    const response = await api.get(`/api/chat/history/${sessionId}`)
    return response.data
  },

  /**
   * Clear chat history for a session.
   * @param {string} sessionId
   */
  clearHistory: async (sessionId) => {
    const response = await api.delete(`/api/chat/history/${sessionId}`)
    return response.data
  },
}

// ─── Health API ───────────────────────────────────────────────────────────────

export const healthApi = {
  check: async () => {
    const response = await api.get('/api/health')
    return response.data
  },
}

export default api
