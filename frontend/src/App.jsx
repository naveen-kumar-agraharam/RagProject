/**
 * Main Application Component
 * Configures routing, layout, and global notification toaster for Intellica.
 */

import React, { Suspense, lazy } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Sidebar from './components/Sidebar'
import { ChatProvider } from './context/ChatContext'

// Lazy load pages for fast initial bundle
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Chat = lazy(() => import('./pages/Chat'))
const Documents = lazy(() => import('./pages/Documents'))
const Upload = lazy(() => import('./pages/Upload'))
const HistoryPage = lazy(() => import('./pages/History'))
const SettingsPage = lazy(() => import('./pages/Settings'))
const Login = lazy(() => import('./pages/Login'))

const PageLoader = () => (
  <div className="flex items-center justify-center h-full min-h-[300px]">
    <div className="flex flex-col items-center gap-2.5">
      <div className="w-7 h-7 border-2 border-primary-900 border-t-transparent rounded-full animate-spin" />
      <p className="text-xs font-medium text-slate-500">Loading...</p>
    </div>
  </div>
)

const Layout = ({ children }) => (
  <div className="flex h-screen overflow-hidden bg-slate-50">
    <Sidebar />
    <main className="flex-1 overflow-hidden flex flex-col bg-slate-50">
      <div className="flex-1 overflow-y-auto">
        <Suspense fallback={<PageLoader />}>
          {children}
        </Suspense>
      </div>
    </main>
  </div>
)

const App = () => {
  return (
    <BrowserRouter>
      <ChatProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/documents" element={<Documents />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </Layout>

        {/* Global Toast Notifications - Clean White Light Theme */}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#FFFFFF',
              color: '#1E293B',
              border: '1px solid #E2E8F0',
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: 500,
              boxShadow: '0 4px 12px 0 rgba(15, 23, 42, 0.08)',
            },
            success: {
              iconTheme: { primary: '#0F766E', secondary: '#F0FDFA' },
            },
            error: {
              iconTheme: { primary: '#E11D48', secondary: '#FFF1F2' },
            },
            duration: 3500,
          }}
        />
      </ChatProvider>
    </BrowserRouter>
  )
}

export default App
