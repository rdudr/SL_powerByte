import React, { useState } from 'react';

/**
 * FormulaTooltip Component
 * 
 * Displays a "?" icon that shows formula and calculation logic when clicked
 * 
 * Props:
 * - title: Title of the metric
 * - formula: The mathematical formula
 * - variables: Object with variable definitions
 * - example: Optional example calculation
 * - notes: Optional additional notes
 */
export default function FormulaTooltip({ title, formula, variables, example, notes }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative inline-block">
      {/* Question Mark Icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="ml-2 w-5 h-5 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors flex items-center justify-center text-xs font-bold cursor-pointer"
        aria-label="Show formula"
      >
        ?
      </button>

      {/* Tooltip Modal */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-30 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Modal Content */}
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl p-6 z-50 max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto">
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-gray-900">{title}</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
              >
                ×
              </button>
            </div>

            {/* Formula */}
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Formula:</h4>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <code className="text-blue-900 font-mono text-sm">{formula}</code>
              </div>
            </div>

            {/* Variables */}
            {variables && Object.keys(variables).length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Variables:</h4>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 space-y-2">
                  {Object.entries(variables).map(([key, value]) => (
                    <div key={key} className="text-sm">
                      <span className="font-mono text-gray-900 font-semibold">{key}</span>
                      <span className="text-gray-600"> = {value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Example */}
            {example && (
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Example:</h4>
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-sm text-gray-800 whitespace-pre-line">{example}</p>
                </div>
              </div>
            )}

            {/* Notes */}
            {notes && (
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Notes:</h4>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-sm text-gray-800 whitespace-pre-line">{notes}</p>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
