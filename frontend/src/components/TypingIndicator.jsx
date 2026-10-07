/**
 * Typing Indicator component - shown while Intellica is searching & generating.
 */

import React from 'react'
import { Layers } from 'lucide-react'

const TypingIndicator = () => (
  <div className="flex gap-3 animate-fade-in">
    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-teal-700 flex items-center justify-center text-white shadow-sm">
      <Layers className="w-4 h-4 text-teal-100" />
    </div>
    <div className="bg-white border border-slate-200 rounded-xl rounded-tl-none px-4 py-3 shadow-sm">
      <div className="flex items-center gap-1.5 py-1">
        <span className="w-2 h-2 rounded-full bg-primary-700 animate-pulse" />
        <span className="w-2 h-2 rounded-full bg-teal-600 animate-pulse delay-150" />
        <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse delay-300" />
      </div>
      <p className="text-[11px] text-slate-500 mt-1 font-medium">
        Intellica is searching documents & generating response...
      </p>
    </div>
  </div>
)

export default TypingIndicator
