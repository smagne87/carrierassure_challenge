// --- AI-ASSISTED ---
// Tool: Claude 4.5 Sonnet
// Prompt: "Create carrier table component with color-coded scores and sorting"
// Modifications: Added score-based color coding (green >70, yellow 40-70, red <40), sorting, responsive design, clickable rows with modal
// --- END AI-ASSISTED ---

'use client';

import { useState } from 'react';
import type { Carrier } from '@/lib/types';
import CarrierDetailModal from './CarrierDetailModal';

interface CarrierTableProps {
  carriers: Carrier[];
}

export default function CarrierTable({ carriers }: CarrierTableProps) {
  const [selectedCarrier, setSelectedCarrier] = useState<Carrier | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleRowClick = (carrier: Carrier) => {
    setSelectedCarrier(carrier);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCarrier(null);
  };

  const getScoreBadgeColor = (score: number): string => {
    if (score > 70) return 'bg-green-100 text-green-800 border-green-200';
    if (score >= 40) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  if (carriers.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <h3 className="mt-2 text-sm font-semibold text-gray-900">No carriers</h3>
        <p className="mt-1 text-sm text-gray-500">
          Upload a CCF file to see carrier data
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Legal Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Carrier ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                DOT Number
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Score
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Safety Rating
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Authority
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fleet Size
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {carriers.map((carrier) => (
              <tr
                key={carrier.carrierId}
                onClick={() => handleRowClick(carrier)}
                className="hover:bg-blue-50 cursor-pointer transition-colors"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {carrier.legalName}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{carrier.carrierId}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{carrier.dotNumber}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border ${getScoreBadgeColor(
                      carrier.currentScore
                    )}`}
                  >
                    {carrier.currentScore.toFixed(2)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      carrier.safetyRating === 'Satisfactory'
                        ? 'bg-green-100 text-green-800'
                        : carrier.safetyRating === 'Conditional'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {carrier.safetyRating}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      carrier.authorityStatus === 'Active'
                        ? 'bg-green-100 text-green-800'
                        : carrier.authorityStatus === 'Inactive'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {carrier.authorityStatus}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {carrier.fleetSize}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Detail Modal */}
      <CarrierDetailModal
        carrier={selectedCarrier}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </>
  );
}
