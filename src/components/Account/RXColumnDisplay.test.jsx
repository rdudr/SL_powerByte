/**
 * Unit Tests for RXColumnDisplay Component
 * 
 * Tests verify:
 * - Total consumption is displayed correctly
 * - Energy difference value is shown
 * - Status indicator color matches status
 * - Tooltip displays breakdown
 * 
 * Requirements: 1.3, 2.3
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import RXColumnDisplay from './RXColumnDisplay';

describe('RXColumnDisplay Component', () => {
  const defaultProps = {
    rxName: 'Main Receiver',
    rxValue: 100,
    totalConsumption: 95,
    energyDifference: 5,
    status: 'critical-loss',
    statusColor: 'red',
    onEdit: jest.fn(),
  };

  describe('Total Consumption Display', () => {
    test('should display total consumption correctly', () => {
      render(<RXColumnDisplay {...defaultProps} totalConsumption={250.5} />);
      
      const totalElement = screen.getByTestId('total-consumption');
      expect(totalElement).toBeInTheDocument();
      expect(totalElement.textContent).toBe('250.50 W');
    });

    test('should format total consumption with 2 decimal places', () => {
      render(<RXColumnDisplay {...defaultProps} totalConsumption={123.456} />);
      
      const totalElement = screen.getByTestId('total-consumption');
      expect(totalElement.textContent).toBe('123.46 W');
    });

    test('should display zero total consumption', () => {
      render(<RXColumnDisplay {...defaultProps} totalConsumption={0} />);
      
      const totalElement = screen.getByTestId('total-consumption');
      expect(totalElement.textContent).toBe('0.00 W');
    });
  });

  describe('Energy Difference Display', () => {
    test('should display energy difference value', () => {
      render(<RXColumnDisplay {...defaultProps} energyDifference={3.75} />);
      
      const diffElement = screen.getByTestId('energy-difference');
      expect(diffElement).toBeInTheDocument();
      expect(diffElement.textContent).toBe('3.75 W');
    });

    test('should format energy difference with 2 decimal places', () => {
      render(<RXColumnDisplay {...defaultProps} energyDifference={10.123} />);
      
      const diffElement = screen.getByTestId('energy-difference');
      expect(diffElement.textContent).toBe('10.12 W');
    });

    test('should display zero energy difference', () => {
      render(<RXColumnDisplay {...defaultProps} energyDifference={0} />);
      
      const diffElement = screen.getByTestId('energy-difference');
      expect(diffElement.textContent).toBe('0.00 W');
    });
  });

  describe('Status Indicator Color', () => {
    test('should display green status indicator for no-loss', () => {
      render(
        <RXColumnDisplay 
          {...defaultProps} 
          status="no-loss" 
          statusColor="green"
          energyDifference={1.5}
        />
      );
      
      const indicator = screen.getByTestId('status-indicator');
      expect(indicator).toHaveClass('bg-green-500');
    });

    test('should display yellow status indicator for acceptable-loss', () => {
      render(
        <RXColumnDisplay 
          {...defaultProps} 
          status="acceptable-loss" 
          statusColor="yellow"
          energyDifference={3}
        />
      );
      
      const indicator = screen.getByTestId('status-indicator');
      expect(indicator).toHaveClass('bg-yellow-500');
    });

    test('should display red status indicator for critical-loss', () => {
      render(
        <RXColumnDisplay 
          {...defaultProps} 
          status="critical-loss" 
          statusColor="red"
          energyDifference={5}
        />
      );
      
      const indicator = screen.getByTestId('status-indicator');
      expect(indicator).toHaveClass('bg-red-500');
    });

    test('should match status text with status value', () => {
      const { rerender } = render(
        <RXColumnDisplay 
          {...defaultProps} 
          status="no-loss" 
          statusColor="green"
        />
      );
      
      let statusText = screen.getByTestId('status-text');
      expect(statusText.textContent).toBe('No Loss');

      rerender(
        <RXColumnDisplay 
          {...defaultProps} 
          status="acceptable-loss" 
          statusColor="yellow"
        />
      );
      
      statusText = screen.getByTestId('status-text');
      expect(statusText.textContent).toBe('Acceptable Loss');

      rerender(
        <RXColumnDisplay 
          {...defaultProps} 
          status="critical-loss" 
          statusColor="red"
        />
      );
      
      statusText = screen.getByTestId('status-text');
      expect(statusText.textContent).toBe('Critical Loss');
    });
  });

  describe('Tooltip Breakdown Display', () => {
    test('should display detailed breakdown section', () => {
      render(<RXColumnDisplay {...defaultProps} />);
      
      expect(screen.getByText('Detailed Breakdown')).toBeInTheDocument();
    });

    test('should display calculation formula in breakdown', () => {
      render(
        <RXColumnDisplay 
          {...defaultProps} 
          rxValue={100}
          totalConsumption={95}
          energyDifference={5}
        />
      );
      
      const breakdown = screen.getByText(/\|100\.00 - 95\.00\| = 5\.00/);
      expect(breakdown).toBeInTheDocument();
    });

    test('should display threshold ranges in breakdown', () => {
      render(<RXColumnDisplay {...defaultProps} />);
      
      expect(screen.getByText(/0-2 W: No Loss/)).toBeInTheDocument();
      expect(screen.getByText(/2-4 W: Acceptable/)).toBeInTheDocument();
      expect(screen.getByText(/>4 W: Critical/)).toBeInTheDocument();
    });

    test('should display current status in breakdown', () => {
      render(
        <RXColumnDisplay 
          {...defaultProps} 
          status="critical-loss"
          statusColor="red"
        />
      );
      
      const statusBadges = screen.getAllByText('Critical Loss');
      expect(statusBadges.length).toBeGreaterThan(0);
    });
  });

  describe('RX Value Display', () => {
    test('should display RX value correctly', () => {
      render(<RXColumnDisplay {...defaultProps} rxValue={150.25} />);
      
      const rxElement = screen.getByTestId('rx-value');
      expect(rxElement).toBeInTheDocument();
      expect(rxElement.textContent).toBe('150.25 W');
    });

    test('should format RX value with 2 decimal places', () => {
      render(<RXColumnDisplay {...defaultProps} rxValue={200.999} />);
      
      const rxElement = screen.getByTestId('rx-value');
      expect(rxElement.textContent).toBe('201.00 W');
    });
  });

  describe('Component Header', () => {
    test('should display RX name in header', () => {
      render(<RXColumnDisplay {...defaultProps} rxName="Main Power Meter" />);
      
      expect(screen.getByText('Main Power Meter')).toBeInTheDocument();
    });

    test('should display "Main Receiver" label', () => {
      render(<RXColumnDisplay {...defaultProps} />);
      
      expect(screen.getAllByText('Main Receiver').length).toBeGreaterThan(0);
    });

    test('should have edit button', () => {
      const mockEdit = jest.fn();
      render(<RXColumnDisplay {...defaultProps} onEdit={mockEdit} />);
      
      const editButton = screen.getByRole('button', { name: /Edit/i });
      expect(editButton).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    test('should handle very large values', () => {
      render(
        <RXColumnDisplay 
          {...defaultProps} 
          rxValue={999999.99}
          totalConsumption={999999.99}
          energyDifference={0}
        />
      );
      
      const rxElement = screen.getByTestId('rx-value');
      const totalElement = screen.getByTestId('total-consumption');
      
      expect(rxElement.textContent).toBe('999999.99 W');
      expect(totalElement.textContent).toBe('999999.99 W');
    });

    test('should handle very small values', () => {
      render(
        <RXColumnDisplay 
          {...defaultProps} 
          rxValue={0.01}
          totalConsumption={0.01}
          energyDifference={0}
        />
      );
      
      const rxElement = screen.getByTestId('rx-value');
      expect(rxElement.textContent).toBe('0.01 W');
    });

    test('should handle all status types', () => {
      const statuses = [
        { status: 'no-loss', color: 'green' },
        { status: 'acceptable-loss', color: 'yellow' },
        { status: 'critical-loss', color: 'red' },
      ];

      statuses.forEach(({ status, color }) => {
        const { unmount } = render(
          <RXColumnDisplay 
            {...defaultProps} 
            status={status}
            statusColor={color}
          />
        );
        
        const indicator = screen.getByTestId('status-indicator');
        expect(indicator).toBeInTheDocument();
        
        unmount();
      });
    });
  });

  /**
   * Accessibility Tests for RXColumnDisplay Component
   * 
   * Feature: energy-loss-detection
   * Validates: Accessibility section of design document
   */
  describe('Accessibility', () => {
    test('should have ARIA labels for status indicator', () => {
      render(
        <RXColumnDisplay 
          {...defaultProps} 
          status="critical-loss"
          statusColor="red"
          energyDifference={5}
        />
      );
      
      const statusRegion = screen.getByLabelText(/Status: Critical Loss/);
      expect(statusRegion).toBeInTheDocument();
    });

    test('should have ARIA labels for all numeric values', () => {
      render(
        <RXColumnDisplay 
          {...defaultProps}
          rxValue={100}
          totalConsumption={95}
          energyDifference={5}
        />
      );
      
      const rxValue = screen.getByLabelText(/Main Receiver value: 100\.00 watts/);
      expect(rxValue).toBeInTheDocument();
      
      const totalConsumption = screen.getByLabelText(/Total consumption: 95\.00 watts/);
      expect(totalConsumption).toBeInTheDocument();
      
      const energyDiff = screen.getByLabelText(/Energy difference: 5\.00 watts/);
      expect(energyDiff).toBeInTheDocument();
    });

    test('should have text descriptions alongside color-coded status', () => {
      render(
        <RXColumnDisplay 
          {...defaultProps} 
          status="no-loss"
          statusColor="green"
        />
      );
      
      // Check for status text description
      const statusText = screen.getByTestId('status-text');
      expect(statusText).toHaveAttribute('aria-label');
      expect(statusText.getAttribute('aria-label')).toContain('Current status');
    });

    test('should have ARIA labels for threshold descriptions', () => {
      render(<RXColumnDisplay {...defaultProps} />);
      
      // Check for threshold descriptions with screen reader text
      expect(screen.getByText('Green indicator:')).toBeInTheDocument();
      expect(screen.getByText('Yellow indicator:')).toBeInTheDocument();
      expect(screen.getByText('Red indicator:')).toBeInTheDocument();
    });

    test('should have proper semantic structure for breakdown section', () => {
      const { container } = render(
        <RXColumnDisplay {...defaultProps} />
      );
      
      const breakdownHeading = screen.getByText('Detailed Breakdown');
      expect(breakdownHeading).toBeInTheDocument();
      
      // Check for proper heading hierarchy
      expect(breakdownHeading.tagName).toBe('H4');
    });

    test('should have ARIA labels for calculation display', () => {
      render(
        <RXColumnDisplay 
          {...defaultProps}
          rxValue={100}
          totalConsumption={95}
          energyDifference={5}
        />
      );
      
      const calculation = screen.getByLabelText(/Calculation: absolute value of 100\.00 minus 95\.00 equals 5\.00/);
      expect(calculation).toBeInTheDocument();
    });

    test('should have ARIA labels for status badge', () => {
      render(
        <RXColumnDisplay 
          {...defaultProps}
          status="critical-loss"
          statusColor="red"
        />
      );
      
      const statusBadge = screen.getByLabelText(/Current status badge: Critical Loss/);
      expect(statusBadge).toBeInTheDocument();
    });

    test('should have decorative icons marked as aria-hidden', () => {
      const { container } = render(
        <RXColumnDisplay {...defaultProps} />
      );
      
      const hiddenIcons = container.querySelectorAll('[aria-hidden="true"]');
      expect(hiddenIcons.length).toBeGreaterThan(0);
    });

    test('should have proper heading structure', () => {
      const { container } = render(
        <RXColumnDisplay {...defaultProps} />
      );
      
      const headings = container.querySelectorAll('h3, h4');
      expect(headings.length).toBeGreaterThan(0);
    });

    test('should have accessible edit button', () => {
      const mockEdit = jest.fn();
      render(
        <RXColumnDisplay {...defaultProps} onEdit={mockEdit} />
      );
      
      const editButton = screen.getByRole('button', { name: /Edit/i });
      expect(editButton).toBeInTheDocument();
    });

    test('should display all status categories with text descriptions', () => {
      render(<RXColumnDisplay {...defaultProps} />);
      
      // Verify all threshold descriptions are present
      expect(screen.getByText('0-2 W: No Loss')).toBeInTheDocument();
      expect(screen.getByText('2-4 W: Acceptable')).toBeInTheDocument();
      expect(screen.getByText('>4 W: Critical')).toBeInTheDocument();
    });

    test('should have proper color-to-text mapping for all statuses', () => {
      const statuses = [
        { status: 'no-loss', color: 'green', text: 'No Loss' },
        { status: 'acceptable-loss', color: 'yellow', text: 'Acceptable Loss' },
        { status: 'critical-loss', color: 'red', text: 'Critical Loss' },
      ];

      statuses.forEach(({ status, color, text }) => {
        const { unmount } = render(
          <RXColumnDisplay 
            {...defaultProps} 
            status={status}
            statusColor={color}
          />
        );
        
        const statusText = screen.getByTestId('status-text');
        expect(statusText.textContent).toBe(text);
        
        const indicator = screen.getByTestId('status-indicator');
        expect(indicator).toHaveClass(`bg-${color}-500`);
        
        unmount();
      });
    });
  });
});
