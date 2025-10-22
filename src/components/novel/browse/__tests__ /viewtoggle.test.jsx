import { render, screen, fireEvent } from '@testing-library/react';
import ViewToggle from '../viewtoggle';

describe('ViewToggle', () => {
  test('renders two buttons and reflects mode via aria-pressed/type', () => {
    const onChange = jest.fn();
    const { rerender } = render(<ViewToggle mode="grid" onChange={onChange} />);

    // AntD buttons here are icon-only; use role index instead of accessible name
    const buttons = screen.getAllByRole('button');
    const gridBtn = buttons[0];
    const listBtn = buttons[1];

    expect(gridBtn).toBeTruthy();
    expect(listBtn).toBeTruthy();

    // grid is active
    expect(gridBtn).toHaveAttribute('aria-pressed', 'true');
    expect(listBtn).toHaveAttribute('aria-pressed', 'false');

    // clicking list fires onChange('list')
    fireEvent.click(listBtn);
    expect(onChange).toHaveBeenCalledWith('list');

    // update props to list mode and re-query buttons
    rerender(<ViewToggle mode="list" onChange={onChange} />);
    const buttons2 = screen.getAllByRole('button');
    const gridBtn2 = buttons2[0];
    const listBtn2 = buttons2[1];

    expect(listBtn2).toHaveAttribute('aria-pressed', 'true');
    expect(gridBtn2).toHaveAttribute('aria-pressed', 'false');

    // clicking grid fires onChange('grid')
    fireEvent.click(gridBtn2);
    expect(onChange).toHaveBeenCalledWith('grid');
  });
});
