// --- AI-ASSISTED ---
// Tool: Claude 4.5 Sonnet
// Prompt: "Create modal component for displaying detailed carrier information with score breakdown"
// Modifications: Added 6-factor breakdown display, score visualization, modal controls, responsive design
// --- END AI-ASSISTED ---

'use client';

import type { Carrier } from '@/lib/types';

interface CarrierDetailModalProps {
  carrier: Carrier | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function CarrierDetailModal({
  carrier,
  isOpen,
  onClose,
}: CarrierDetailModalProps) {
  if (!isOpen || !carrier) return null;

  // Calculate individual factor contributions
  const calculateFactorScore = (factor: keyof typeof SCORING_WEIGHTS): number => {
    let componentScore = 0;

    switch (factor) {
      case 'safetyRating':
        componentScore =
          carrier.safetyRating === 'Satisfactory'
            ? 100
            : carrier.safetyRating === 'Conditional'
            ? 50
            : 0;
        break;
      case 'outOfServicePct':
        componentScore = Math.max(0, 100 - carrier.outOfServicePct);
        break;
      case 'crashTotal':
        componentScore = Math.max(0, 100 - Math.min(carrier.crashTotal, 10) * 10);
        break;
      case 'driverOosPct':
        componentScore = Math.max(0, 100 - carrier.driverOosPct);
        break;
      case 'insuranceOnFile':
        componentScore = carrier.insuranceOnFile ? 100 : 0;
        break;
      case 'authorityStatus':
        componentScore =
          carrier.authorityStatus === 'Active'
            ? 100
            : carrier.authorityStatus === 'Inactive'
            ? 50
            : 0;
        break;
    }

    return Number((componentScore * SCORING_WEIGHTS[factor]).toFixed(2));
  };

  const SCORING_WEIGHTS = {
    safetyRating: 0.25,
    outOfServicePct: 0.2,
    crashTotal: 0.2,
    driverOosPct: 0.15,
    insuranceOnFile: 0.1,
    authorityStatus: 0.1,
  };

  const breakdown = {
    safetyRating: calculateFactorScore('safetyRating'),
    outOfServicePct: calculateFactorScore('outOfServicePct'),
    crashTotal: calculateFactorScore('crashTotal'),
    driverOosPct: calculateFactorScore('driverOosPct'),
    insuranceOnFile: calculateFactorScore('insuranceOnFile'),
    authorityStatus: calculateFactorScore('authorityStatus'),
  };

  const getScoreColor = (score: number): string => {
    if (score > 70) return 'text-green-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-3xl transform overflow-hidden rounded-lg bg-white shadow-xl transition-all">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h3
                  className="text-2xl font-bold text-white"
                  id="modal-title"
                >
                  {carrier.legalName}
                </h3>
                <p className="mt-1 text-sm text-blue-100">
                  {carrier.carrierId} • DOT {carrier.dotNumber}
                </p>
              </div>
              <button
                onClick={onClose}
                className="rounded-lg p-2 text-white hover:bg-blue-700 transition-colors"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-6">
            {/* Overall Score */}
            <div className="mb-6 rounded-lg border-2 border-gray-200 bg-gray-50 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Composite Safety Score
                  </p>
                  <p className={`mt-1 text-5xl font-bold ${getScoreColor(carrier.currentScore)}`}>
                    {carrier.currentScore.toFixed(2)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Safety Rating</p>
                  <span
                    className={`mt-1 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      carrier.safetyRating === 'Satisfactory'
                        ? 'bg-green-100 text-green-800'
                        : carrier.safetyRating === 'Conditional'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {carrier.safetyRating}
                  </span>
                </div>
              </div>
            </div>

            {/* Score Breakdown */}
            <div className="mb-6">
              <h4 className="mb-4 text-lg font-semibold text-gray-900">
                Score Breakdown
              </h4>
              <div className="space-y-4">
                {/* Safety Rating */}
                <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        Safety Rating
                      </span>
                      <span className="text-sm font-semibold text-gray-900">
                        {breakdown.safetyRating.toFixed(2)} / 25.00
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 transition-all"
                        style={{
                          width: `${(breakdown.safetyRating / 25) * 100}%`,
                        }}
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Weight: 25% • Value: {carrier.safetyRating}
                    </p>
                  </div>
                </div>

                {/* Out of Service % */}
                <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        Out-of-Service Percentage
                      </span>
                      <span className="text-sm font-semibold text-gray-900">
                        {breakdown.outOfServicePct.toFixed(2)} / 20.00
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 transition-all"
                        style={{
                          width: `${(breakdown.outOfServicePct / 20) * 100}%`,
                        }}
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Weight: 20% • Value: {carrier.outOfServicePct.toFixed(1)}%
                    </p>
                  </div>
                </div>

                {/* Crash Total */}
                <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        Total Crashes
                      </span>
                      <span className="text-sm font-semibold text-gray-900">
                        {breakdown.crashTotal.toFixed(2)} / 20.00
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 transition-all"
                        style={{
                          width: `${(breakdown.crashTotal / 20) * 100}%`,
                        }}
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Weight: 20% • Value: {carrier.crashTotal} crashes
                    </p>
                  </div>
                </div>

                {/* Driver OOS % */}
                <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        Driver Out-of-Service %
                      </span>
                      <span className="text-sm font-semibold text-gray-900">
                        {breakdown.driverOosPct.toFixed(2)} / 15.00
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 transition-all"
                        style={{
                          width: `${(breakdown.driverOosPct / 15) * 100}%`,
                        }}
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Weight: 15% • Value: {carrier.driverOosPct.toFixed(1)}%
                    </p>
                  </div>
                </div>

                {/* Insurance on File */}
                <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        Insurance on File
                      </span>
                      <span className="text-sm font-semibold text-gray-900">
                        {breakdown.insuranceOnFile.toFixed(2)} / 10.00
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 transition-all"
                        style={{
                          width: `${(breakdown.insuranceOnFile / 10) * 100}%`,
                        }}
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Weight: 10% • Value: {carrier.insuranceOnFile ? 'Yes' : 'No'}
                    </p>
                  </div>
                </div>

                {/* Authority Status */}
                <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        Authority Status
                      </span>
                      <span className="text-sm font-semibold text-gray-900">
                        {breakdown.authorityStatus.toFixed(2)} / 10.00
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 transition-all"
                        style={{
                          width: `${(breakdown.authorityStatus / 10) * 100}%`,
                        }}
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Weight: 10% • Value: {carrier.authorityStatus}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Info */}
            <div className="grid grid-cols-2 gap-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
              <div>
                <p className="text-xs font-medium text-gray-500">Fleet Size</p>
                <p className="mt-1 text-lg font-semibold text-gray-900">
                  {carrier.fleetSize} vehicles
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">
                  Last Inspection
                </p>
                <p className="mt-1 text-lg font-semibold text-gray-900">
                  {new Date(carrier.lastInspectionDate).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4">
            <button
              onClick={onClose}
              className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
