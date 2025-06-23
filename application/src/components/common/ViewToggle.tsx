import React from 'react'

interface ViewToggleProps {
  view: 'individual' | 'multi'
  onViewChange: (view: 'individual' | 'multi') => void
}

export const ViewToggle: React.FC<ViewToggleProps> = ({ view, onViewChange }) => {
  return (
    <div className="flex items-center bg-gray-800/30 rounded-lg p-1">
      <button
        onClick={() => onViewChange('individual')}
        className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
          view === 'individual'
            ? 'bg-purple-600 text-white shadow-md'
            : 'text-white/70 hover:text-white hover:bg-gray-700/50'
        }`}
      >
        Individual
      </button>
      <button
        onClick={() => onViewChange('multi')}
        className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
          view === 'multi'
            ? 'bg-purple-600 text-white shadow-md'
            : 'text-white/70 hover:text-white hover:bg-gray-700/50'
        }`}
      >
        Multi View
      </button>
    </div>
  )
}