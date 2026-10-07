/**
 * Settings Page
 * Clean, professional configuration and application details page for Intellica.
 * Sections: Profile, Appearance, Application Information.
 */

import React, { useState, useEffect } from 'react'
import {
  Settings,
  User,
  Palette,
  Info,
  CheckCircle2,
  Layers,
  Sparkles,
  ShieldCheck,
  Cpu,
  Database,
  ExternalLink,
} from 'lucide-react'
import toast from 'react-hot-toast'

const SettingsPage = () => {
  const [user, setUser] = useState({
    name: 'Student User',
    email: 'student@university.edu',
    rollNo: '21CS042',
    department: 'Computer Science',
  })

  useEffect(() => {
    const saved = localStorage.getItem('collegegpt_user')
    if (saved) {
      try {
        setUser(JSON.parse(saved))
      } catch (e) {
        // use default
      }
    }
  }, [])

  const handleSaveProfile = (e) => {
    e.preventDefault()
    localStorage.setItem('collegegpt_user', JSON.stringify(user))
    toast.success('Profile details saved successfully!')
  }

  return (
    <div className="p-6 sm:p-8 max-w-4xl mx-auto space-y-8 page-enter">
      {/* Header */}
      <div className="pb-2 border-b border-slate-200">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Settings
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage your profile and review application specifications.
        </p>
      </div>

      <div className="space-y-6">
        {/* Section 1: Profile */}
        <div className="clean-card p-6 space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-primary-50 text-primary-900 flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Student Profile</h2>
              <p className="text-xs text-slate-500">Personal information associated with document queries</p>
            </div>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={user.name || ''}
                  onChange={(e) => setUser({ ...user, name: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-primary-900 shadow-sm"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">University Email</label>
                <input
                  type="email"
                  value={user.email || ''}
                  onChange={(e) => setUser({ ...user, email: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-primary-900 shadow-sm"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Roll / Registration Number</label>
                <input
                  type="text"
                  value={user.rollNo || ''}
                  onChange={(e) => setUser({ ...user, rollNo: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-primary-900 shadow-sm"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Department / Branch</label>
                <input
                  type="text"
                  value={user.department || ''}
                  onChange={(e) => setUser({ ...user, department: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-primary-900 shadow-sm"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button type="submit" className="btn-primary text-xs">
                Save Changes
              </button>
            </div>
          </form>
        </div>

        {/* Section 2: Appearance */}
        <div className="clean-card p-6 space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-800 flex items-center justify-center">
              <Palette className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Appearance</h2>
              <p className="text-xs text-slate-500">Interface theme and visual preferences</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-800">Clean SaaS Light Theme</p>
                <p className="text-slate-500 text-[11px] mt-0.5">High-contrast white background with Deep Blue & Teal</p>
              </div>
              <span className="badge-processed">Active</span>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200 flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-700">Typography Scale</p>
                <p className="text-slate-500 text-[11px] mt-0.5">Inter variable font with JetBrains Mono code rendering</p>
              </div>
              <span className="badge-neutral">Standard</span>
            </div>
          </div>
        </div>

        {/* Section 3: Application Information */}
        <div className="clean-card p-6 space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-primary-900 flex items-center justify-center">
              <Info className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Application Information</h2>
              <p className="text-xs text-slate-500">System architecture and model specifications</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                <Layers className="w-4 h-4 text-primary-900" />
                <span>Intellica</span>
              </div>
              <p className="text-slate-600 font-medium">
                Intelligent Document Assistant
              </p>
              <p className="text-slate-500 text-[11px] leading-relaxed">
                Powered by Gemini • RAG-based document question answering
              </p>
            </div>

            <div className="grid sm:grid-cols-3 gap-3 pt-1">
              <div className="p-3 rounded-lg bg-white border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400">LLM Generation</span>
                <p className="font-semibold text-slate-800 mt-1">Google Gemini 2.5 Flash</p>
              </div>
              <div className="p-3 rounded-lg bg-white border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400">Vector Embeddings</span>
                <p className="font-semibold text-slate-800 mt-1">gemini-embedding-001</p>
              </div>
              <div className="p-3 rounded-lg bg-white border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400">Vector Storage</span>
                <p className="font-semibold text-slate-800 mt-1">ChromaDB Persistent</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SettingsPage
