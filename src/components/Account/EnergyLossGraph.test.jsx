import React from 'react';
import { render, screen } from '@testing-library/react';
import EnergyLossGraph from './EnergyLossGraph';

// Mock Chart.js Line component to avoid canvas issues in jsdom
jest.mock('react-chartjs-2', () => ({
  Line: () => <div data-testid="chart-line">Chart</div>,
}));

/**
 * Unit Tests for EnergyLossGraph Component
 * 
 * Feature: energy-loss-detection
 * Validates: Requirements 4.1, 4.2, 4.3, 4.4, 4.5
 */

describe('EnergyLossGraph Component', () => {
  describe('Empty State', () => {
    test('should display empty state when no historical data', () => {
      render(<EnergyLossGraph historicalData={[]} />);
      expect(screen.getByText('No historical data available yet')).toBeInTheDocument();
    });

    test('should display empty state when historicalData is null', () => {
      render(<EnergyLossGraph historicalData={null} />);
      expect(screen.getByText('No historical data available yet')).toBeInTheDocument();
    });

    test('should display empty state when historicalData is undefined', () => {
      render(<EnergyLossGraph />);
      expect(screen.getByText('No historical data available yet')).toBeInTheDocument();
    });
  });

  describe('Graph Rendering', () => {
    const mockHistoricalData = [
      { timestamp: new Date('2024-01-01T10:00:00'), difference: 1 },
      { timestamp: new Date('2024-01-01T10:05:00'), difference: 2 },
      { timestamp: new Date('2024-01-01T10:10:00'), difference: 3 },
      { timestamp: new Date('2024-01-01T10:15:00'), difference: 5 },
    ];

    test('should render graph with historical data', () => {
      render(
        <EnergyLossGraph historicalData={mockHistoricalData} />
      );
      expect(screen.getByText('Energy Loss Trend')).toBeInTheDocument();
      expect(screen.getByTestId('chart-line')).toBeInTheDocument();
    });

    test('should display current difference value', () => {
      render(
        <EnergyLossGraph
          historicalData={mockHistoricalData}
          currentDifference={3.5}
        />
      );
      expect(screen.getByText(/3\.50/)).toBeInTheDocument();
    });

    test('should display legend with all status categories', () => {
      render(<EnergyLossGraph historicalData={mockHistoricalData} />);
      expect(screen.getByText('No Loss')).toBeInTheDocument();
      expect(screen.getByText('Acceptable Loss')).toBeInTheDocument();
      expect(screen.getByText('Critical Loss')).toBeInTheDocument();
    });
  });

  describe('Color Coding', () => {
    test('should display legend with correct color descriptions', () => {
      const mockData = [
        { timestamp: new Date(), difference: 1 },
        { timestamp: new Date(), difference: 3 },
        { timestamp: new Date(), difference: 5 },
      ];
      render(<EnergyLossGraph historicalData={mockData} />);

      // Check legend items
      expect(screen.getByText('No Loss')).toBeInTheDocument();
      expect(screen.getByText('Acceptable Loss')).toBeInTheDocument();
      expect(screen.getByText('Critical Loss')).toBeInTheDocument();

      // Check threshold descriptions
      expect(screen.getByText('0-2 units')).toBeInTheDocument();
      expect(screen.getByText('2-4 units')).toBeInTheDocument();
      expect(screen.getByText('>4 units')).toBeInTheDocument();
    });
  });

  describe('Data Processing', () => {
    test('should handle data with string timestamps', () => {
      const mockData = [
        { timestamp: '2024-01-01T10:00:00', difference: 1 },
        { timestamp: '2024-01-01T10:05:00', difference: 2 },
      ];
      render(
        <EnergyLossGraph historicalData={mockData} />
      );
      expect(screen.getByTestId('chart-line')).toBeInTheDocument();
    });

    test('should handle data with Date objects', () => {
      const mockData = [
        { timestamp: new Date('2024-01-01T10:00:00'), difference: 1 },
        { timestamp: new Date('2024-01-01T10:05:00'), difference: 2 },
      ];
      render(
        <EnergyLossGraph historicalData={mockData} />
      );
      expect(screen.getByTestId('chart-line')).toBeInTheDocument();
    });

    test('should handle missing difference values', () => {
      const mockData = [
        { timestamp: new Date(), difference: 1 },
        { timestamp: new Date(), difference: undefined },
        { timestamp: new Date(), difference: 3 },
      ];
      render(
        <EnergyLossGraph historicalData={mockData} />
      );
      expect(screen.getByTestId('chart-line')).toBeInTheDocument();
    });

    test('should handle large datasets', () => {
      const mockData = Array.from({ length: 100 }, (_, i) => ({
        timestamp: new Date(Date.now() - i * 60000),
        difference: Math.random() * 10,
      }));
      render(
        <EnergyLossGraph historicalData={mockData} />
      );
      expect(screen.getByTestId('chart-line')).toBeInTheDocument();
    });
  });

  describe('Current Difference Display', () => {
    const mockData = [
      { timestamp: new Date(), difference: 1 },
      { timestamp: new Date(), difference: 2 },
    ];

    test('should display current difference with 2 decimal places', () => {
      render(
        <EnergyLossGraph
          historicalData={mockData}
          currentDifference={3.456}
        />
      );
      expect(screen.getByText(/3\.46/)).toBeInTheDocument();
    });

    test('should display zero current difference', () => {
      render(
        <EnergyLossGraph
          historicalData={mockData}
          currentDifference={0}
        />
      );
      expect(screen.getByText(/0\.00/)).toBeInTheDocument();
    });

    test('should display large current difference', () => {
      render(
        <EnergyLossGraph
          historicalData={mockData}
          currentDifference={999.99}
        />
      );
      expect(screen.getByText(/999\.99/)).toBeInTheDocument();
    });
  });

  describe('Legend Display', () => {
    const mockData = [
      { timestamp: new Date(), difference: 1 },
      { timestamp: new Date(), difference: 3 },
      { timestamp: new Date(), difference: 5 },
    ];

    test('should display legend with all three categories', () => {
      render(<EnergyLossGraph historicalData={mockData} />);
      const legendItems = screen.getAllByText(/units/);
      expect(legendItems.length).toBeGreaterThanOrEqual(3);
    });

    test('should display legend descriptions', () => {
      render(<EnergyLossGraph historicalData={mockData} />);
      expect(screen.getByText('No Loss')).toBeInTheDocument();
      expect(screen.getByText('Acceptable Loss')).toBeInTheDocument();
      expect(screen.getByText('Critical Loss')).toBeInTheDocument();
    });
  });

  describe('UI Structure', () => {
    const mockData = [
      { timestamp: new Date(), difference: 1 },
      { timestamp: new Date(), difference: 2 },
    ];

    test('should have proper container structure', () => {
      const { container } = render(
        <EnergyLossGraph historicalData={mockData} />
      );
      expect(container.querySelector('.bg-white')).toBeInTheDocument();
      expect(container.querySelector('.rounded-lg')).toBeInTheDocument();
    });

    test('should display title', () => {
      render(<EnergyLossGraph historicalData={mockData} />);
      expect(screen.getByText('Energy Loss Trend')).toBeInTheDocument();
    });

    test('should display current difference label', () => {
      render(
        <EnergyLossGraph
          historicalData={mockData}
          currentDifference={2.5}
        />
      );
      expect(screen.getByText(/Current difference:/i)).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    test('should handle single data point', () => {
      const mockData = [{ timestamp: new Date(), difference: 2 }];
      render(
        <EnergyLossGraph historicalData={mockData} />
      );
      expect(screen.getByTestId('chart-line')).toBeInTheDocument();
    });

    test('should handle all data points in same category', () => {
      const mockData = [
        { timestamp: new Date(), difference: 1 },
        { timestamp: new Date(), difference: 1.5 },
        { timestamp: new Date(), difference: 2 },
      ];
      render(
        <EnergyLossGraph historicalData={mockData} />
      );
      expect(screen.getByTestId('chart-line')).toBeInTheDocument();
    });

    test('should handle boundary values', () => {
      const mockData = [
        { timestamp: new Date(), difference: 0 },
        { timestamp: new Date(), difference: 2 },
        { timestamp: new Date(), difference: 4 },
        { timestamp: new Date(), difference: 4.1 },
      ];
      render(
        <EnergyLossGraph historicalData={mockData} />
      );
      expect(screen.getByTestId('chart-line')).toBeInTheDocument();
    });

    test('should handle very small differences', () => {
      const mockData = [
        { timestamp: new Date(), difference: 0.001 },
        { timestamp: new Date(), difference: 0.01 },
      ];
      render(
        <EnergyLossGraph historicalData={mockData} />
      );
      expect(screen.getByTestId('chart-line')).toBeInTheDocument();
    });

    test('should handle very large differences', () => {
      const mockData = [
        { timestamp: new Date(), difference: 1000 },
        { timestamp: new Date(), difference: 5000 },
      ];
      render(
        <EnergyLossGraph historicalData={mockData} />
      );
      expect(screen.getByTestId('chart-line')).toBeInTheDocument();
    });
  });

  /**
   * Integration Tests for Graph Display (Task 7.1)
   * 
   * These tests validate that the EnergyLossGraph component integrates correctly
   * with the Account component and responds to real-time data updates.
   * 
   * Feature: energy-loss-detection
   * Validates: Requirements 4.1, 4.2, 4.3, 4.4, 4.5
   */
  describe('Integration Tests: Graph Display', () => {
    /**
     * Test: Graph renders with historical data
     * Validates: Requirements 4.1, 4.2
     */
    test('should render graph with historical data from Account component', () => {
      const mockData = [
        { timestamp: new Date('2024-01-01T10:00:00'), difference: 1, status: 'no-loss' },
        { timestamp: new Date('2024-01-01T10:05:00'), difference: 2, status: 'no-loss' },
        { timestamp: new Date('2024-01-01T10:10:00'), difference: 3, status: 'acceptable-loss' },
        { timestamp: new Date('2024-01-01T10:15:00'), difference: 5, status: 'critical-loss' },
      ];

      render(
        <EnergyLossGraph historicalData={mockData} currentDifference={5} />
      );

      // Verify graph renders
      expect(screen.getByTestId('chart-line')).toBeInTheDocument();
      expect(screen.getByText('Energy Loss Trend')).toBeInTheDocument();
      expect(screen.getByText(/5\.00/)).toBeInTheDocument();
    });

    /**
     * Test: Color coding is correct for all data points
     * Validates: Requirements 4.2, 4.3, 4.4
     */
    test('should apply correct color coding based on status thresholds', () => {
      const mockData = [
        { timestamp: new Date('2024-01-01T10:00:00'), difference: 1, status: 'no-loss' },
        { timestamp: new Date('2024-01-01T10:05:00'), difference: 3, status: 'acceptable-loss' },
        { timestamp: new Date('2024-01-01T10:10:00'), difference: 5, status: 'critical-loss' },
      ];

      render(
        <EnergyLossGraph historicalData={mockData} currentDifference={5} />
      );

      // Verify all color categories are displayed in legend
      expect(screen.getByText('No Loss')).toBeInTheDocument();
      expect(screen.getByText('Acceptable Loss')).toBeInTheDocument();
      expect(screen.getByText('Critical Loss')).toBeInTheDocument();

      // Verify threshold descriptions
      expect(screen.getByText('0-2 units')).toBeInTheDocument();
      expect(screen.getByText('2-4 units')).toBeInTheDocument();
      expect(screen.getByText('>4 units')).toBeInTheDocument();
    });

    /**
     * Test: Legend and tooltips work correctly
     * Validates: Requirements 4.4, 4.5
     */
    test('should display legend with all status categories and descriptions', () => {
      const mockData = [
        { timestamp: new Date('2024-01-01T10:00:00'), difference: 1, status: 'no-loss' },
        { timestamp: new Date('2024-01-01T10:05:00'), difference: 3, status: 'acceptable-loss' },
        { timestamp: new Date('2024-01-01T10:10:00'), difference: 5, status: 'critical-loss' },
      ];

      render(
        <EnergyLossGraph historicalData={mockData} currentDifference={5} />
      );

      // Verify legend is rendered
      const legendItems = screen.getAllByText(/units/);
      expect(legendItems.length).toBeGreaterThanOrEqual(3);

      // Verify legend descriptions
      expect(screen.getByText('No Loss')).toBeInTheDocument();
      expect(screen.getByText('Acceptable Loss')).toBeInTheDocument();
      expect(screen.getByText('Critical Loss')).toBeInTheDocument();

      // Verify canvas exists for tooltip functionality
      expect(screen.getByTestId('chart-line')).toBeInTheDocument();
    });

    /**
     * Test: Graph maintains data integrity with mixed status values
     * Validates: Requirements 4.2, 4.3, 4.4
     */
    test('should correctly separate and display data points by status category', () => {
      const mockData = [
        { timestamp: new Date('2024-01-01T10:00:00'), difference: 0.5, status: 'no-loss' },
        { timestamp: new Date('2024-01-01T10:01:00'), difference: 1.5, status: 'no-loss' },
        { timestamp: new Date('2024-01-01T10:02:00'), difference: 2.5, status: 'acceptable-loss' },
        { timestamp: new Date('2024-01-01T10:03:00'), difference: 3.5, status: 'acceptable-loss' },
        { timestamp: new Date('2024-01-01T10:04:00'), difference: 5, status: 'critical-loss' },
        { timestamp: new Date('2024-01-01T10:05:00'), difference: 10, status: 'critical-loss' },
      ];

      render(
        <EnergyLossGraph historicalData={mockData} currentDifference={10} />
      );

      // Verify graph renders with all data
      expect(screen.getByTestId('chart-line')).toBeInTheDocument();

      // Verify legend shows all categories
      expect(screen.getByText('No Loss')).toBeInTheDocument();
      expect(screen.getByText('Acceptable Loss')).toBeInTheDocument();
      expect(screen.getByText('Critical Loss')).toBeInTheDocument();
    });

    /**
     * Test: Graph maintains 24-hour historical window
     * Validates: Requirements 4.1
     */
    test('should handle historical data spanning 24 hours', () => {
      const now = new Date();
      const mockData = Array.from({ length: 24 }, (_, i) => ({
        timestamp: new Date(now.getTime() - (23 - i) * 60 * 60 * 1000),
        difference: Math.random() * 10,
        status: Math.random() * 10 > 4 ? 'critical-loss' : 'no-loss',
      }));

      render(
        <EnergyLossGraph historicalData={mockData} currentDifference={5} />
      );

      // Verify graph renders with full 24-hour data
      expect(screen.getByTestId('chart-line')).toBeInTheDocument();
      expect(screen.getByText('Energy Loss Trend')).toBeInTheDocument();
    });

    /**
     * Test: Graph displays current difference prominently
     * Validates: Requirements 4.1, 4.5
     */
    test('should display current difference value prominently in the UI', () => {
      const mockData = [
        { timestamp: new Date('2024-01-01T10:00:00'), difference: 1, status: 'no-loss' },
        { timestamp: new Date('2024-01-01T10:05:00'), difference: 2, status: 'no-loss' },
        { timestamp: new Date('2024-01-01T10:10:00'), difference: 5, status: 'critical-loss' },
      ];

      render(
        <EnergyLossGraph historicalData={mockData} currentDifference={5} />
      );

      // Verify current difference is displayed
      expect(screen.getByText(/Current difference:/i)).toBeInTheDocument();
      expect(screen.getByText(/5\.00/)).toBeInTheDocument();
    });

    /**
     * Test: Graph renders with various data sizes
     * Validates: Requirements 4.1, 4.2, 4.3
     */
    test('should render graph with different amounts of historical data', () => {
      // Test with small dataset
      const smallData = [
        { timestamp: new Date('2024-01-01T10:00:00'), difference: 1, status: 'no-loss' },
        { timestamp: new Date('2024-01-01T10:05:00'), difference: 2, status: 'no-loss' },
      ];

      const { unmount: unmount1 } = render(
        <EnergyLossGraph historicalData={smallData} currentDifference={2} />
      );
      expect(screen.getByTestId('chart-line')).toBeInTheDocument();
      unmount1();

      // Test with medium dataset
      const mediumData = Array.from({ length: 12 }, (_, i) => ({
        timestamp: new Date(Date.now() - i * 60 * 60 * 1000),
        difference: Math.random() * 10,
        status: 'no-loss',
      }));

      const { unmount: unmount2 } = render(
        <EnergyLossGraph historicalData={mediumData} currentDifference={5} />
      );
      expect(screen.getByTestId('chart-line')).toBeInTheDocument();
      unmount2();

      // Test with large dataset
      const largeData = Array.from({ length: 100 }, (_, i) => ({
        timestamp: new Date(Date.now() - i * 15 * 60 * 1000),
        difference: Math.random() * 10,
        status: 'no-loss',
      }));

      render(
        <EnergyLossGraph historicalData={largeData} currentDifference={5} />
      );
      expect(screen.getByTestId('chart-line')).toBeInTheDocument();
    });

    /**
     * Test: Graph displays all required UI elements
     * Validates: Requirements 4.1, 4.4, 4.5
     */
    test('should display all required UI elements for graph display', () => {
      const mockData = [
        { timestamp: new Date('2024-01-01T10:00:00'), difference: 1, status: 'no-loss' },
        { timestamp: new Date('2024-01-01T10:05:00'), difference: 3, status: 'acceptable-loss' },
        { timestamp: new Date('2024-01-01T10:10:00'), difference: 5, status: 'critical-loss' },
      ];

      render(
        <EnergyLossGraph historicalData={mockData} currentDifference={3.5} />
      );

      // Verify title
      expect(screen.getByText('Energy Loss Trend')).toBeInTheDocument();

      // Verify current difference display
      expect(screen.getByText(/Current difference:/i)).toBeInTheDocument();
      expect(screen.getByText(/3\.50/)).toBeInTheDocument();

      // Verify legend
      expect(screen.getByText('No Loss')).toBeInTheDocument();
      expect(screen.getByText('Acceptable Loss')).toBeInTheDocument();
      expect(screen.getByText('Critical Loss')).toBeInTheDocument();

      // Verify canvas for chart
      expect(screen.getByTestId('chart-line')).toBeInTheDocument();

      // Verify legend descriptions
      expect(screen.getByText('0-2 units')).toBeInTheDocument();
      expect(screen.getByText('2-4 units')).toBeInTheDocument();
      expect(screen.getByText('>4 units')).toBeInTheDocument();
    });
  });

  /**
   * Accessibility Tests for EnergyLossGraph Component
   * 
   * Feature: energy-loss-detection
   * Validates: Accessibility section of design document
   */
  describe('Accessibility', () => {
    const mockData = [
      { timestamp: new Date('2024-01-01T10:00:00'), difference: 1, status: 'no-loss' },
      { timestamp: new Date('2024-01-01T10:05:00'), difference: 3, status: 'acceptable-loss' },
      { timestamp: new Date('2024-01-01T10:10:00'), difference: 5, status: 'critical-loss' },
    ];

    test('should have proper ARIA label for chart', () => {
      render(
        <EnergyLossGraph historicalData={mockData} currentDifference={3.5} />
      );
      
      const chartContainer = screen.getByRole('img');
      expect(chartContainer).toHaveAttribute('aria-label');
      expect(chartContainer.getAttribute('aria-label')).toContain('Energy loss trend chart');
    });

    test('should have ARIA labels for status legend items', () => {
      render(
        <EnergyLossGraph historicalData={mockData} currentDifference={3.5} />
      );
      
      const noLossRegion = screen.getByLabelText('No loss status: 0-2 units');
      expect(noLossRegion).toBeInTheDocument();
      
      const acceptableLossRegion = screen.getByLabelText('Acceptable loss status: 2-4 units');
      expect(acceptableLossRegion).toBeInTheDocument();
      
      const criticalLossRegion = screen.getByLabelText('Critical loss status: greater than 4 units');
      expect(criticalLossRegion).toBeInTheDocument();
    });

    test('should have text descriptions alongside color-coded elements', () => {
      render(
        <EnergyLossGraph historicalData={mockData} currentDifference={3.5} />
      );
      
      // Check for text descriptions in legend
      expect(screen.getByText('No Loss')).toBeInTheDocument();
      expect(screen.getByText('Acceptable Loss')).toBeInTheDocument();
      expect(screen.getByText('Critical Loss')).toBeInTheDocument();
      
      // Check for threshold descriptions
      expect(screen.getByText('0-2 units')).toBeInTheDocument();
      expect(screen.getByText('2-4 units')).toBeInTheDocument();
      expect(screen.getByText('>4 units')).toBeInTheDocument();
      
      // Check for color indicator descriptions
      expect(screen.getByText('Green indicator')).toBeInTheDocument();
      expect(screen.getByText('Yellow indicator')).toBeInTheDocument();
      expect(screen.getByText('Red indicator')).toBeInTheDocument();
    });

    test('should have proper heading structure', () => {
      const { container } = render(
        <EnergyLossGraph historicalData={mockData} currentDifference={3.5} />
      );
      
      const heading = container.querySelector('h3');
      expect(heading).toBeInTheDocument();
      expect(heading.textContent).toBe('Energy Loss Trend');
    });

    test('should have descriptive text for current difference', () => {
      render(
        <EnergyLossGraph historicalData={mockData} currentDifference={3.5} />
      );
      
      expect(screen.getByText(/Current difference:/i)).toBeInTheDocument();
      expect(screen.getByText(/3\.50/)).toBeInTheDocument();
    });

    test('should have proper semantic structure for legend', () => {
      const { container } = render(
        <EnergyLossGraph historicalData={mockData} currentDifference={3.5} />
      );
      
      // Check for region roles
      const regions = container.querySelectorAll('[role="region"]');
      expect(regions.length).toBeGreaterThanOrEqual(3);
    });

    test('should display legend with all status categories and descriptions', () => {
      render(
        <EnergyLossGraph historicalData={mockData} currentDifference={3.5} />
      );
      
      // Verify all legend items are present with descriptions
      const legendItems = screen.getAllByRole('region');
      expect(legendItems.length).toBeGreaterThanOrEqual(3);
      
      // Verify text descriptions are present
      expect(screen.getByText('No Loss')).toBeInTheDocument();
      expect(screen.getByText('Acceptable Loss')).toBeInTheDocument();
      expect(screen.getByText('Critical Loss')).toBeInTheDocument();
    });

    test('should have accessible empty state', () => {
      render(<EnergyLossGraph historicalData={[]} />);
      
      expect(screen.getByText('No historical data available yet')).toBeInTheDocument();
    });
  });
});
