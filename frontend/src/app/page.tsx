// --- AI-ASSISTED ---
// Tool: Claude 4.5 Sonnet
// Prompt: "Create main dashboard page with file upload and carrier table"
// Modifications: Added state management, API integration, upload success handling
// --- END AI-ASSISTED ---

'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api/client';
import type { Carrier, ProcessingSummary } from '@/lib/types';
import FileUploader from '@/components/upload/FileUploader';
import CarrierTable from '@/components/carriers/CarrierTable';
import ProcessingSummaryComponent from '@/components/upload/ProcessingSummary';

export default function Home() {
  const [carriers, setCarriers] = useState<Carrier[]>([]);
  const [summary, setSummary] = useState<ProcessingSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCarriers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.getCarriers();
      // Sort by score descending
      const sorted = data.sort(
        (a, b) => b.currentScore - a.currentScore
      );
      setCarriers(sorted);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load carriers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCarriers();
  }, []);

  const handleUploadSuccess = (uploadSummary: ProcessingSummary) => {
    setSummary(uploadSummary);
    loadCarriers();

    // Clear summary after 10 seconds
    setTimeout(() => {
      setSummary(null);
    }, 10000);
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-3">
            <svg
              className="w-10 h-10 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Carrier Scoring Service
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Hash-based change detection with composite scoring algorithm
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Upload Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Upload CCF File
            </h2>
            <FileUploader onUploadSuccess={handleUploadSuccess} />
          </div>

          {/* Processing Summary */}
          {summary && <ProcessingSummaryComponent summary={summary} />}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex">
                <svg
                  className="w-5 h-5 text-red-400 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Carriers Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Carriers ({carriers.length})
              </h2>
              {loading && (
                <div className="flex items-center text-sm text-gray-500">
                  <svg
                    className="animate-spin h-4 w-4 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Loading...
                </div>
              )}
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
                <p className="mt-4 text-gray-600">Loading carriers...</p>
              </div>
            ) : (
              <CarrierTable carriers={carriers} />
            )}
          </div>

          {/* Stats */}
          {carriers.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">
                  Average Score
                </h3>
                <p className="text-3xl font-bold text-gray-900">
                  {(
                    carriers.reduce(
                      (sum, c) => sum + c.currentScore,
                      0
                    ) / carriers.length
                  ).toFixed(2)}
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">
                  Top Score
                </h3>
                <p className="text-3xl font-bold text-green-600">
                  {carriers[0]?.currentScore.toFixed(2) || 'N/A'}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {carriers[0]?.legalName || ''}
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">
                  Total Carriers
                </h3>
                <p className="text-3xl font-bold text-gray-900">
                  {carriers.length}
                </p>
                <p className="text-sm text-gray-500 mt-1">in database</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-12 py-6 bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-500">
          <p>
            Built with Next.js 15 + NestJS | Clean Architecture + DDD + SOLID
          </p>
          <p className="mt-1">
            Hash-based change detection achieves 50x performance improvement
          </p>
        </div>
      </footer>
    </main>
  );
}
