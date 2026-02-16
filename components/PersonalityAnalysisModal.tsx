'use client';

import type { AnalysisResult } from '@/lib/personality-analyzer';

interface PersonalityAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  analysisResult: AnalysisResult | null;
  isLoading: boolean;
}

export default function PersonalityAnalysisModal({
  isOpen,
  onClose,
  analysisResult,
  isLoading,
}: PersonalityAnalysisModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scaleIn">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition"
        >
          ✕
        </button>

        {/* Loading state */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-block w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-xl text-gray-700">Analyzing your doodle personality...</p>
          </div>
        )}

        {/* Error state */}
        {!isLoading && analysisResult && !analysisResult.success && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">😕</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">Oops!</h3>
            <p className="text-gray-600">{analysisResult.error}</p>
          </div>
        )}

        {/* Success state */}
        {!isLoading && analysisResult && analysisResult.success && (
          <div>
            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 bg-clip-text text-transparent mb-2" style={{ fontFamily: 'var(--font-pacifico)' }}>
                Your Doodle Personality
              </h2>
              <p className="text-gray-600">Based on your drawing patterns</p>
            </div>

            {/* Personality Type */}
            {analysisResult.personalityType && (
              <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 rounded-2xl p-6 mb-6 text-white">
                <h3 className="text-2xl font-bold mb-2">{analysisResult.personalityType.name}</h3>
                <p className="text-white/90 mb-4">{analysisResult.personalityType.description}</p>
                <div className="flex flex-wrap gap-2">
                  {analysisResult.personalityType.traits.map((trait, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium"
                    >
                      {trait}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Insights */}
            {analysisResult.insights && analysisResult.insights.length > 0 && (
              <div className="mb-6">
                <h4 className="text-xl font-bold text-gray-800 mb-4">Personality Insights</h4>
                <div className="space-y-3">
                  {analysisResult.insights.map((insight, i) => (
                    <div
                      key={i}
                      className="bg-gray-50 rounded-xl p-4 border-l-4 border-purple-500"
                    >
                      <p className="text-gray-800">{insight.text}</p>
                      <span className="text-xs text-gray-500 mt-1 inline-block capitalize">
                        {insight.category}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Metrics */}
            {analysisResult.metrics && (
              <div>
                <h4 className="text-xl font-bold text-gray-800 mb-4">Drawing Metrics</h4>
                <div className="grid grid-cols-2 gap-4">
                  {analysisResult.metrics.averageSpeed !== null && (
                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="text-sm text-gray-600 mb-1">Drawing Speed</div>
                      <div className="text-2xl font-bold text-purple-600">
                        {analysisResult.metrics.averageSpeed.toFixed(2)} px/ms
                      </div>
                    </div>
                  )}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="text-sm text-gray-600 mb-1">Smoothness</div>
                    <div className="text-2xl font-bold text-pink-600">
                      {(analysisResult.metrics.smoothness * 100).toFixed(0)}%
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="text-sm text-gray-600 mb-1">Colors Used</div>
                    <div className="text-2xl font-bold text-orange-600">
                      {analysisResult.metrics.colorDiversity}
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="text-sm text-gray-600 mb-1">Brushes Used</div>
                    <div className="text-2xl font-bold text-blue-600">
                      {analysisResult.metrics.brushVariety}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
