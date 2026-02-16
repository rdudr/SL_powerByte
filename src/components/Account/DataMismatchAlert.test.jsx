import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import DataMismatchAlert from './DataMismatchAlert';

/**
 * Unit Tests for DataMismatchAlert Component
 * 
 * Feature: energy-loss-detection
 * Validates: Requirements 5.1, 5.2, 5.3, 5.4
 */

describe('DataMismatchAlert Component', () => {
  const defaultProps = {
    isOpen: true,
    rxValue: 500,
    totalConsumption: 300,
    energyDifference: 200,
    onDismiss: jest.fn(),
    onInvestigate: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Visibility', () => {
    test('should not render when isOpen is false', () => {
      const { container } = render(
        <DataMismatchAlert {...defaultProps} isOpen={false} />
      );
      expect(container.firstChild).toBeNull();
    });

    test('should render when isOpen is true', () => {
      render(<DataMismatchAlert {...defaultProps} />);
      expect(screen.getByText('Data Mismatch Alert')).toBeInTheDocument();
    });
  });

  describe('Alert Message', () => {
    test('should display correct alert message format', () => {
      render(<DataMismatchAlert {...defaultProps} energyDifference={5.5} />);
      expect(
        screen.getByText(/There is an error of data mismatch with value:/i)
      ).toBeInTheDocument();
      expect(screen.getByText('5.50')).toBeInTheDocument();
    });

    test('should display energy difference with 2 decimal places', () => {
      render(<DataMismatchAlert {...defaultProps} energyDifference={3.456} />);
      expect(screen.getByText('3.46')).toBeInTheDocument();
    });
  });

  describe('Display Values', () => {
    test('should display RX value correctly', () => {
      render(<DataMismatchAlert {...defaultProps} rxValue={750.5} />);
      expect(screen.getByText('750.50 W')).toBeInTheDocument();
    });

    test('should display total consumption correctly', () => {
      render(<DataMismatchAlert {...defaultProps} totalConsumption={450.75} />);
      expect(screen.getByText('450.75 W')).toBeInTheDocument();
    });

    test('should display energy difference correctly', () => {
      render(<DataMismatchAlert {...defaultProps} energyDifference={100.25} />);
      expect(screen.getByText('100.25 W')).toBeInTheDocument();
    });

    test('should display all values with proper labels', () => {
      render(<DataMismatchAlert {...defaultProps} />);
      expect(screen.getByText('Main Receiver (RX):')).toBeInTheDocument();
      expect(screen.getByText('Total Consumption:')).toBeInTheDocument();
      expect(screen.getByText('Energy Difference:')).toBeInTheDocument();
    });
  });

  describe('Dismiss Button', () => {
    test('should call onDismiss when dismiss button is clicked', () => {
      const onDismiss = jest.fn();
      render(
        <DataMismatchAlert {...defaultProps} onDismiss={onDismiss} />
      );
      const dismissButton = screen.getByText('Dismiss');
      fireEvent.click(dismissButton);
      expect(onDismiss).toHaveBeenCalledTimes(1);
    });

    test('should call onDismiss when close button is clicked', () => {
      const onDismiss = jest.fn();
      render(
        <DataMismatchAlert {...defaultProps} onDismiss={onDismiss} />
      );
      const closeButton = screen.getByLabelText('Close alert (press ESC)');
      fireEvent.click(closeButton);
      expect(onDismiss).toHaveBeenCalledTimes(1);
    });
  });

  describe('Investigate Button', () => {
    test('should call onInvestigate when investigate button is clicked', () => {
      const onInvestigate = jest.fn();
      render(
        <DataMismatchAlert {...defaultProps} onInvestigate={onInvestigate} />
      );
      const investigateButton = screen.getByText('Investigate');
      fireEvent.click(investigateButton);
      expect(onInvestigate).toHaveBeenCalledTimes(1);
    });

    test('should not call onDismiss when investigate button is clicked', () => {
      const onDismiss = jest.fn();
      const onInvestigate = jest.fn();
      render(
        <DataMismatchAlert
          {...defaultProps}
          onDismiss={onDismiss}
          onInvestigate={onInvestigate}
        />
      );
      const investigateButton = screen.getByText('Investigate');
      fireEvent.click(investigateButton);
      expect(onDismiss).not.toHaveBeenCalled();
      expect(onInvestigate).toHaveBeenCalledTimes(1);
    });
  });

  describe('Alert Message Formatting', () => {
    test('should format message with different energy differences', () => {
      const { rerender } = render(
        <DataMismatchAlert {...defaultProps} energyDifference={5} />
      );
      expect(screen.getByText('5.00')).toBeInTheDocument();

      rerender(
        <DataMismatchAlert {...defaultProps} energyDifference={10.5} />
      );
      expect(screen.getByText('10.50')).toBeInTheDocument();

      rerender(
        <DataMismatchAlert {...defaultProps} energyDifference={0.1} />
      );
      expect(screen.getByText('0.10')).toBeInTheDocument();
    });

    test('should handle zero values', () => {
      render(
        <DataMismatchAlert
          {...defaultProps}
          rxValue={0}
          totalConsumption={0}
          energyDifference={0}
        />
      );
      const zeroValues = screen.getAllByText('0.00');
      expect(zeroValues.length).toBeGreaterThan(0);
    });

    test('should handle large values', () => {
      render(
        <DataMismatchAlert
          {...defaultProps}
          rxValue={10000}
          totalConsumption={9500}
          energyDifference={500}
        />
      );
      expect(screen.getByText('10000.00 W')).toBeInTheDocument();
      expect(screen.getByText('9500.00 W')).toBeInTheDocument();
      expect(screen.getByText('500.00 W')).toBeInTheDocument();
    });
  });

  describe('UI Elements', () => {
    test('should have proper modal structure', () => {
      const { container } = render(
        <DataMismatchAlert {...defaultProps} />
      );
      const modal = container.querySelector('.fixed.inset-0');
      expect(modal).toBeInTheDocument();
    });

    test('should display alert icon', () => {
      const { container } = render(
        <DataMismatchAlert {...defaultProps} />
      );
      const icon = container.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });

    test('should have both action buttons', () => {
      render(<DataMismatchAlert {...defaultProps} />);
      expect(screen.getByText('Dismiss')).toBeInTheDocument();
      expect(screen.getByText('Investigate')).toBeInTheDocument();
    });

    test('should display descriptive text', () => {
      render(<DataMismatchAlert {...defaultProps} />);
      expect(
        screen.getByText(/potential power loss or data mismatch/i)
      ).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    test('should handle very small differences', () => {
      render(
        <DataMismatchAlert
          {...defaultProps}
          energyDifference={0.001}
        />
      );
      expect(screen.getByText('0.00')).toBeInTheDocument();
    });

    test('should handle very large differences', () => {
      render(
        <DataMismatchAlert
          {...defaultProps}
          energyDifference={9999.99}
        />
      );
      expect(screen.getByText('9999.99')).toBeInTheDocument();
    });

    test('should handle negative values (should not occur but test robustness)', () => {
      render(
        <DataMismatchAlert
          {...defaultProps}
          energyDifference={-5}
        />
      );
      expect(screen.getByText('-5.00')).toBeInTheDocument();
    });
  });

  /**
   * Accessibility Tests for DataMismatchAlert Component
   * 
   * Feature: energy-loss-detection
   * Validates: Accessibility section of design document
   */
  describe('Accessibility', () => {
    test('should have proper ARIA attributes for alert dialog', () => {
      const { container } = render(
        <DataMismatchAlert {...defaultProps} />
      );
      
      const alertDialog = container.querySelector('[role="alertdialog"]');
      expect(alertDialog).toHaveAttribute('aria-labelledby', 'alert-title');
      expect(alertDialog).toHaveAttribute('aria-describedby', 'alert-description');
      expect(alertDialog).toHaveAttribute('aria-modal', 'true');
    });

    test('should have alert title with proper ID', () => {
      render(<DataMismatchAlert {...defaultProps} />);
      
      const title = screen.getByText('Data Mismatch Alert');
      expect(title).toHaveAttribute('id', 'alert-title');
    });

    test('should have alert description with proper ID and live region', () => {
      render(<DataMismatchAlert {...defaultProps} />);
      
      const description = screen.getByText(/There is an error of data mismatch/);
      expect(description).toHaveAttribute('id', 'alert-description');
      expect(description).toHaveAttribute('role', 'status');
      expect(description).toHaveAttribute('aria-live', 'polite');
    });

    test('should have ARIA labels for all numeric values', () => {
      render(
        <DataMismatchAlert 
          {...defaultProps}
          rxValue={500}
          totalConsumption={300}
          energyDifference={200}
        />
      );
      
      const rxValue = screen.getByLabelText(/Main Receiver value: 500\.00 watts/);
      expect(rxValue).toBeInTheDocument();
      
      const totalConsumption = screen.getByLabelText(/Total consumption: 300\.00 watts/);
      expect(totalConsumption).toBeInTheDocument();
      
      const energyDiff = screen.getByLabelText(/Energy difference: 200\.00 watts - Critical threshold exceeded/);
      expect(energyDiff).toBeInTheDocument();
    });

    test('should have ARIA labels for action buttons', () => {
      render(<DataMismatchAlert {...defaultProps} />);
      
      const dismissButton = screen.getByLabelText('Dismiss alert notification');
      expect(dismissButton).toBeInTheDocument();
      
      const investigateButton = screen.getByLabelText('Investigate data mismatch issue');
      expect(investigateButton).toBeInTheDocument();
    });

    test('should have ARIA label for close button with ESC hint', () => {
      render(<DataMismatchAlert {...defaultProps} />);
      
      const closeButton = screen.getByLabelText('Close alert (press ESC)');
      expect(closeButton).toBeInTheDocument();
      expect(closeButton).toHaveAttribute('title', 'Close alert (press ESC)');
    });

    test('should dismiss alert when ESC key is pressed', () => {
      const onDismiss = jest.fn();
      const { container } = render(
        <DataMismatchAlert {...defaultProps} onDismiss={onDismiss} />
      );
      
      const backdrop = container.querySelector('[role="presentation"]');
      fireEvent.keyDown(backdrop, { key: 'Escape' });
      
      expect(onDismiss).toHaveBeenCalledTimes(1);
    });

    test('should not dismiss alert on other key presses', () => {
      const onDismiss = jest.fn();
      const { container } = render(
        <DataMismatchAlert {...defaultProps} onDismiss={onDismiss} />
      );
      
      const backdrop = container.querySelector('[role="presentation"]');
      fireEvent.keyDown(backdrop, { key: 'Enter' });
      fireEvent.keyDown(backdrop, { key: 'Space' });
      
      expect(onDismiss).not.toHaveBeenCalled();
    });

    test('should have aria-hidden on decorative icon', () => {
      const { container } = render(
        <DataMismatchAlert {...defaultProps} />
      );
      
      const iconContainer = container.querySelector('[aria-hidden="true"]');
      expect(iconContainer).toBeInTheDocument();
    });

    test('should have proper semantic structure for screen readers', () => {
      const { container } = render(
        <DataMismatchAlert {...defaultProps} />
      );
      
      // Check for proper heading hierarchy
      const heading = container.querySelector('h2');
      expect(heading).toBeInTheDocument();
      
      // Check for proper button elements
      const buttons = container.querySelectorAll('button');
      expect(buttons.length).toBeGreaterThanOrEqual(3); // Dismiss, Investigate, Close
    });

    test('should be keyboard navigable', () => {
      render(<DataMismatchAlert {...defaultProps} />);
      
      const dismissButton = screen.getByLabelText('Dismiss alert notification');
      const investigateButton = screen.getByLabelText('Investigate data mismatch issue');
      
      // Buttons should be focusable
      expect(dismissButton).toBeInTheDocument();
      expect(investigateButton).toBeInTheDocument();
    });
  });
});
