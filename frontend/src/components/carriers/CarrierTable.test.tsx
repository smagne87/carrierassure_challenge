// --- AI-ASSISTED ---
// Tool: Claude 4.5 Sonnet
// Prompt: "Create comprehensive React component tests for CarrierTable with score color coding verification"
// Modifications: Added tests for green (>70), yellow (40-70), red (<40) scoring, empty state, and rendering
// --- END AI-ASSISTED ---

import { render, screen } from '@testing-library/react';
import CarrierTable from './CarrierTable';
import type { Carrier } from '@/lib/types';

describe('CarrierTable', () => {
  const createMockCarrier = (overrides: Partial<Carrier> = {}): Carrier => ({
    carrierId: 'MC-123456',
    dotNumber: '1234567',
    legalName: 'Test Carrier LLC',
    safetyRating: 'Satisfactory',
    outOfServicePct: 10,
    crashTotal: 2,
    driverOosPct: 5,
    insuranceOnFile: true,
    authorityStatus: 'Active',
    currentScore: 85,
    lastInspectionDate: '2025-11-15',
    fleetSize: 45,
    ...overrides,
  });

  describe('Rendering', () => {
    it('should render carrier table with data', () => {
      const carriers = [createMockCarrier()];

      render(<CarrierTable carriers={carriers} />);

      expect(screen.getByText('Test Carrier LLC')).toBeInTheDocument();
      expect(screen.getByText('MC-123456')).toBeInTheDocument();
      expect(screen.getByText('1234567')).toBeInTheDocument();
      expect(screen.getByText('85.00')).toBeInTheDocument();
    });

    it('should render multiple carriers', () => {
      const carriers = [
        createMockCarrier({ carrierId: 'MC-111', legalName: 'Carrier One' }),
        createMockCarrier({ carrierId: 'MC-222', legalName: 'Carrier Two' }),
        createMockCarrier({ carrierId: 'MC-333', legalName: 'Carrier Three' }),
      ];

      render(<CarrierTable carriers={carriers} />);

      expect(screen.getByText('Carrier One')).toBeInTheDocument();
      expect(screen.getByText('Carrier Two')).toBeInTheDocument();
      expect(screen.getByText('Carrier Three')).toBeInTheDocument();
    });

    it('should render table headers', () => {
      const carriers = [createMockCarrier()];

      render(<CarrierTable carriers={carriers} />);

      expect(screen.getByText('Legal Name')).toBeInTheDocument();
      expect(screen.getByText('Carrier ID')).toBeInTheDocument();
      expect(screen.getByText('DOT Number')).toBeInTheDocument();
      expect(screen.getByText('Score')).toBeInTheDocument();
      expect(screen.getByText('Safety Rating')).toBeInTheDocument();
      expect(screen.getByText('Authority')).toBeInTheDocument();
      expect(screen.getByText('Fleet Size')).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('should render empty state when no carriers provided', () => {
      render(<CarrierTable carriers={[]} />);

      expect(screen.getByText('No carriers')).toBeInTheDocument();
      expect(screen.getByText('Upload a CCF file to see carrier data')).toBeInTheDocument();
    });

    it('should not render table when empty', () => {
      render(<CarrierTable carriers={[]} />);

      expect(screen.queryByRole('table')).not.toBeInTheDocument();
    });
  });

  describe('Score Color Coding', () => {
    it('should apply green color for score > 70', () => {
      const carriers = [
        createMockCarrier({ currentScore: 85, carrierId: 'MC-HIGH' }),
      ];

      render(<CarrierTable carriers={carriers} />);

      const scoreElement = screen.getByText('85.00');
      expect(scoreElement).toHaveClass('text-green-800');
      expect(scoreElement).toHaveClass('bg-green-100');
    });

    it('should apply green color for score exactly 71', () => {
      const carriers = [
        createMockCarrier({ currentScore: 71, carrierId: 'MC-EDGE-HIGH' }),
      ];

      render(<CarrierTable carriers={carriers} />);

      const scoreElement = screen.getByText('71.00');
      expect(scoreElement).toHaveClass('text-green-800');
      expect(scoreElement).toHaveClass('bg-green-100');
    });

    it('should apply yellow color for score between 40-70', () => {
      const carriers = [
        createMockCarrier({ currentScore: 55, carrierId: 'MC-MED' }),
      ];

      render(<CarrierTable carriers={carriers} />);

      const scoreElement = screen.getByText('55.00');
      expect(scoreElement).toHaveClass('text-yellow-800');
      expect(scoreElement).toHaveClass('bg-yellow-100');
    });

    it('should apply yellow color for score exactly 70', () => {
      const carriers = [
        createMockCarrier({ currentScore: 70, carrierId: 'MC-EDGE-70' }),
      ];

      render(<CarrierTable carriers={carriers} />);

      const scoreElement = screen.getByText('70.00');
      expect(scoreElement).toHaveClass('text-yellow-800');
      expect(scoreElement).toHaveClass('bg-yellow-100');
    });

    it('should apply yellow color for score exactly 40', () => {
      const carriers = [
        createMockCarrier({ currentScore: 40, carrierId: 'MC-EDGE-40' }),
      ];

      render(<CarrierTable carriers={carriers} />);

      const scoreElement = screen.getByText('40.00');
      expect(scoreElement).toHaveClass('text-yellow-800');
      expect(scoreElement).toHaveClass('bg-yellow-100');
    });

    it('should apply red color for score < 40', () => {
      const carriers = [
        createMockCarrier({ currentScore: 25, carrierId: 'MC-LOW' }),
      ];

      render(<CarrierTable carriers={carriers} />);

      const scoreElement = screen.getByText('25.00');
      expect(scoreElement).toHaveClass('text-red-800');
      expect(scoreElement).toHaveClass('bg-red-100');
    });

    it('should apply red color for score exactly 39', () => {
      const carriers = [
        createMockCarrier({ currentScore: 39, carrierId: 'MC-EDGE-LOW' }),
      ];

      render(<CarrierTable carriers={carriers} />);

      const scoreElement = screen.getByText('39.00');
      expect(scoreElement).toHaveClass('text-red-800');
      expect(scoreElement).toHaveClass('bg-red-100');
    });

    it('should handle multiple carriers with different score colors', () => {
      const carriers = [
        createMockCarrier({ currentScore: 95, carrierId: 'MC-1', legalName: 'High Score' }),
        createMockCarrier({ currentScore: 60, carrierId: 'MC-2', legalName: 'Medium Score' }),
        createMockCarrier({ currentScore: 20, carrierId: 'MC-3', legalName: 'Low Score' }),
      ];

      render(<CarrierTable carriers={carriers} />);

      const highScore = screen.getByText('95.00');
      expect(highScore).toHaveClass('text-green-800');

      const mediumScore = screen.getByText('60.00');
      expect(mediumScore).toHaveClass('text-yellow-800');

      const lowScore = screen.getByText('20.00');
      expect(lowScore).toHaveClass('text-red-800');
    });
  });

  describe('Safety Rating Display', () => {
    it('should display Satisfactory rating with green badge', () => {
      const carriers = [
        createMockCarrier({ safetyRating: 'Satisfactory' }),
      ];

      render(<CarrierTable carriers={carriers} />);

      const ratingElement = screen.getByText('Satisfactory');
      expect(ratingElement).toHaveClass('bg-green-100');
      expect(ratingElement).toHaveClass('text-green-800');
    });

    it('should display Conditional rating with yellow badge', () => {
      const carriers = [
        createMockCarrier({ safetyRating: 'Conditional' }),
      ];

      render(<CarrierTable carriers={carriers} />);

      const ratingElement = screen.getByText('Conditional');
      expect(ratingElement).toHaveClass('bg-yellow-100');
      expect(ratingElement).toHaveClass('text-yellow-800');
    });

    it('should display Unsatisfactory rating with red badge', () => {
      const carriers = [
        createMockCarrier({ safetyRating: 'Unsatisfactory' }),
      ];

      render(<CarrierTable carriers={carriers} />);

      const ratingElement = screen.getByText('Unsatisfactory');
      expect(ratingElement).toHaveClass('bg-red-100');
      expect(ratingElement).toHaveClass('text-red-800');
    });
  });

  describe('Authority Status Display', () => {
    it('should display Active status with green badge', () => {
      const carriers = [
        createMockCarrier({ authorityStatus: 'Active' }),
      ];

      render(<CarrierTable carriers={carriers} />);

      const statusElement = screen.getByText('Active');
      expect(statusElement).toHaveClass('bg-green-100');
      expect(statusElement).toHaveClass('text-green-800');
    });

    it('should display Inactive status with yellow badge', () => {
      const carriers = [
        createMockCarrier({ authorityStatus: 'Inactive' }),
      ];

      render(<CarrierTable carriers={carriers} />);

      const statusElement = screen.getByText('Inactive');
      expect(statusElement).toHaveClass('bg-yellow-100');
      expect(statusElement).toHaveClass('text-yellow-800');
    });

    it('should display Revoked status with red badge', () => {
      const carriers = [
        createMockCarrier({ authorityStatus: 'Revoked' }),
      ];

      render(<CarrierTable carriers={carriers} />);

      const statusElement = screen.getByText('Revoked');
      expect(statusElement).toHaveClass('bg-red-100');
      expect(statusElement).toHaveClass('text-red-800');
    });
  });

  describe('Score Formatting', () => {
    it('should format score with 2 decimal places', () => {
      const carriers = [
        createMockCarrier({ currentScore: 87.123456 }),
      ];

      render(<CarrierTable carriers={carriers} />);

      expect(screen.getByText('87.12')).toBeInTheDocument();
    });

    it('should format integer scores with .00', () => {
      const carriers = [
        createMockCarrier({ currentScore: 100 }),
      ];

      render(<CarrierTable carriers={carriers} />);

      expect(screen.getByText('100.00')).toBeInTheDocument();
    });
  });

  describe('Fleet Size Display', () => {
    it('should display fleet size', () => {
      const carriers = [
        createMockCarrier({ fleetSize: 150 }),
      ];

      render(<CarrierTable carriers={carriers} />);

      expect(screen.getByText('150')).toBeInTheDocument();
    });
  });
});
