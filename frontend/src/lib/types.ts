// --- AI-ASSISTED ---
// Tool: Claude 4.5 Sonnet
// Prompt: "Create TypeScript interfaces matching backend DTOs for carrier scoring service"
// Modifications: Updated to match CarrierResponseDto structure from backend
// --- END AI-ASSISTED ---

export interface ScoreBreakdown {
  safetyRating: number;
  outOfServicePct: number;
  crashTotal: number;
  driverOosPct: number;
  insuranceOnFile: number;
  authorityStatus: number;
}

export interface ScoreHistory {
  score: number;
  scoreBreakdown: ScoreBreakdown;
  recordedAt: string;
}

export interface Carrier {
  carrierId: string;
  dotNumber: string;
  legalName: string;
  safetyRating: 'Satisfactory' | 'Conditional' | 'Unsatisfactory';
  outOfServicePct: number;
  crashTotal: number;
  driverOosPct: number;
  insuranceOnFile: boolean;
  authorityStatus: 'Active' | 'Inactive' | 'Revoked';
  lastInspectionDate: string;
  fleetSize: number;
  currentScore: number;
  scoreBreakdown: ScoreBreakdown;
  currentHash: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProcessingSummary {
  totalProcessed: number;
  newCarriers: number;
  updatedCarriers: number;
  unchangedCarriers: number;
  errors: number;
  processingTimeMs: number;
  avgScoreComputationTimeMs: number;
}

export interface UploadResponse {
  success: boolean;
  message: string;
  summary: ProcessingSummary;
}

export interface ApiError {
  statusCode: number;
  message: string;
  error?: string;
}
