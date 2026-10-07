/**
 * Stats Card Component for Dashboard
 * Clean white card with subtle light-gray border, deep blue and teal icons.
 */

import React from 'react'

const StatsCard = ({ icon: Icon, label, value, subtitle, iconBg = 'bg-primary-50', iconColor = 'text-primary-900' }) => (
  <div className="clean-card p-5 hover:border-slate-300 transition-all duration-150">
    <div className="flex items-center justify-between mb-3">
      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
        {label}
      </span>
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${iconBg} ${iconColor}`}>
        <Icon className="w-5 h-5" />
      </div>
    </div>
    <div>
      <p className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
        {value ?? '—'}
      </p>
      {subtitle && (
        <p className="text-xs text-slate-500 mt-1 font-medium">{subtitle}</p>
      )}
    </div>
  </div>
)

export default StatsCard
