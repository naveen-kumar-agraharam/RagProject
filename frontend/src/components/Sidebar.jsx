/**
 * Left Sidebar Navigation Component
 * Clean, professional white sidebar with subtle light-gray border.
 * Active items: subtle light-blue background with deep-blue text/icon.
 */

import React, { useState } from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  MessageSquare,
  FileText,
  Upload,
  History,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  User,
  Layers,
} from 'lucide-react'

const navItems = [
  { to: '/',          icon: LayoutDashboard, label: 'Dashboard'       },
  { to: '/chat',      icon: MessageSquare,   label: 'Chat'            },
  { to: '/documents', icon: FileText,        label: 'Documents'       },
  { to: '/upload',    icon: Upload,          label: 'Upload Document' },
  { to: '/history',   icon: History,         label: 'Chat History'    },
  { to: '/settings',  icon: Settings,        label: 'Settings'        },
]

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={`
        flex flex-col h-screen sticky top-0 z-30 transition-all duration-200 ease-in-out
        bg-white border-r border-slate-200
        ${collapsed ? 'w-16' : 'w-64'}
      `}
    >
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-slate-200 flex-shrink-0">
        <div className="w-9 h-9 rounded-lg bg-primary-900 flex items-center justify-center flex-shrink-0 shadow-sm text-white">
          <Layers className="w-5 h-5 text-teal-300" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <h1 className="font-bold text-base text-slate-900 tracking-tight leading-none">
              Intellica
            </h1>
            <p className="text-[11px] text-slate-500 font-medium mt-1 truncate">
              Intelligent Document Assistant
            </p>
          </div>
        )}
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) => `
              flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150
              ${isActive
                ? 'bg-primary-50 text-primary-900 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }
            `}
            title={collapsed ? label : undefined}
          >
            {({ isActive }) => (
              <>
                <Icon
                  className={`w-4 h-4 flex-shrink-0 ${
                    isActive ? 'text-primary-900' : 'text-slate-500'
                  }`}
                />
                {!collapsed && (
                  <span className="truncate">{label}</span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom User Portal & Collapse */}
      <div className="p-3 border-t border-slate-200 flex-shrink-0 space-y-2">
        <NavLink
          to="/login"
          className={({ isActive }) => `
            flex items-center gap-3 px-3 py-2 rounded-lg text-xs transition-colors
            ${isActive ? 'bg-primary-50 text-primary-900' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}
          `}
          title={collapsed ? 'Student Portal' : undefined}
        >
          <div className="w-7 h-7 rounded-md bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 flex-shrink-0">
            <User className="w-3.5 h-3.5" />
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-slate-800 truncate">Student Portal</p>
              <p className="text-[10px] text-slate-500 truncate">Sign In / Switch</p>
            </div>
          )}
        </NavLink>

        {/* Collapse Button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center py-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 text-xs font-medium transition-colors"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4 mr-1.5" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
