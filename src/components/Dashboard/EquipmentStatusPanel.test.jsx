import { render } from '@testing-library/react';
import EquipmentStatusPanel from './EquipmentStatusPanel';

describe('EquipmentStatusPanel', () => {
  test('renders without crashing', () => {
    const { container } = render(
      <EquipmentStatusPanel kitchen={{}} systemConfig={{}} />
    );
    expect(container).toBeInTheDocument();
  });

  test('displays no equipment message when no equipment configured', () => {
    const { container } = render(
      <EquipmentStatusPanel kitchen={{}} systemConfig={{}} />
    );
    expect(container.textContent).toContain('No equipment configured');
  });
});
