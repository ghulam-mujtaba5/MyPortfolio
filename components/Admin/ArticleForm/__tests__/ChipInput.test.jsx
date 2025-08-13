import React, { useState } from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ChipInput from '../ChipInput';

function Harness({ initial = '' , props = {} }) {
  const [val, setVal] = useState(initial);
  return (
    <div>
      <div data-testid="chip-container">
        <ChipInput value={val} onChange={setVal} ariaLabel="Add item" addButtonLabel="Add" {...props} />
      </div>
      <div data-testid="csv">{val}</div>
    </div>
  );
}

describe('ChipInput', () => {
  test('adds items via typing and Enter, syncing CSV', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    const input = screen.getByRole('textbox', { name: /add item/i });

    await user.type(input, 'alpha');
    await user.keyboard('{Enter}');
    await user.type(input, 'beta');
    await user.keyboard('{Enter}');

    const chipContainer = screen.getByTestId('chip-container');
    expect(screen.getByTestId('csv').textContent).toBe('alpha, beta');
    expect(within(chipContainer).getByText('alpha')).toBeInTheDocument();
    expect(within(chipContainer).getByText('beta')).toBeInTheDocument();
  });

  test('backspace removes last chip when input empty', async () => {
    const user = userEvent.setup();
    render(<Harness initial="alpha, beta" />);
    const input = screen.getByRole('textbox', { name: /add item/i });

    // ensure input is empty and focused, then backspace
    await user.clear(input);
    await user.click(input);
    await user.keyboard('{Backspace}');

    expect(screen.getByTestId('csv').textContent).toBe('alpha');
    expect(screen.queryByText('beta')).not.toBeInTheDocument();
  });

  test('keyboard reordering with Alt+Arrow changes order', async () => {
    const user = userEvent.setup();
    render(<Harness initial="alpha, beta, gamma" props={{ reorderable: true }} />);

    // Focus first chip (alpha) via tab
    await user.tab(); // focuses first chip span (tabIndex=0 when reorderable)
    // Alt+ArrowRight should move alpha to index 1 => beta, alpha, gamma
    await user.keyboard('{Alt>}{ArrowRight}{/Alt}');

    expect(screen.getByTestId('csv').textContent).toBe('beta, alpha, gamma');

    // Move alpha (now index 1) right again => beta, gamma, alpha
    await user.keyboard('{Alt>}{ArrowRight}{/Alt}');
    expect(screen.getByTestId('csv').textContent).toBe('beta, gamma, alpha');
  });

  test('adds item via Add button click', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    const input = screen.getByRole('textbox', { name: /add item/i });
    const addButton = screen.getByRole('button', { name: /add item/i });
    const chipContainer = screen.getByTestId('chip-container');

    await user.type(input, 'delta');
    await user.click(addButton);

    expect(screen.getByTestId('csv').textContent).toBe('delta');
    expect(within(chipContainer).getByText('delta')).toBeInTheDocument();
    expect(input).toHaveValue('');
  });

  test('does not add duplicate items', async () => {
    const user = userEvent.setup();
    render(<Harness initial="alpha" />);
    const input = screen.getByRole('textbox', { name: /add item/i });
    const chipContainer = screen.getByTestId('chip-container');

    await user.type(input, 'alpha');
    await user.keyboard('{Enter}');

    expect(screen.getByTestId('csv').textContent).toBe('alpha');
    // Check that only one 'alpha' chip exists within the container
    expect(within(chipContainer).getAllByText('alpha')).toHaveLength(1);
  });

  test('trims whitespace from added items', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    const input = screen.getByRole('textbox', { name: /add item/i });
    const chipContainer = screen.getByTestId('chip-container');

    await user.type(input, '  spaced out  ');
    await user.keyboard('{Enter}');

    expect(screen.getByTestId('csv').textContent).toBe('spaced out');
    expect(within(chipContainer).getByText('spaced out')).toBeInTheDocument();
  });

  test('renders quoted items when prop is set', () => {
    render(<Harness initial="quote me" props={{ quoted: true }} />);
    const chipContainer = screen.getByTestId('chip-container');
    expect(within(chipContainer).getByText('“quote me”')).toBeInTheDocument();
  });

  test('remove button removes the specific chip', async () => {
    const user = userEvent.setup();
    render(<Harness initial="alpha, beta" />);
    const chipContainer = screen.getByTestId('chip-container');

    // Find the chip containing the text 'alpha' by finding the text
    // and then locating its parent container chip.
    const alphaChip = within(chipContainer).getByText('alpha').closest('span[draggable]');
    
    // Find the remove button specifically within that chip
    const alphaRemove = within(alphaChip).getByRole('button', { name: /remove item: alpha/i });
    
    expect(alphaRemove).toBeInTheDocument();
    await user.click(alphaRemove);

    expect(screen.getByTestId('csv').textContent).toBe('beta');
    expect(within(chipContainer).queryByText('alpha')).not.toBeInTheDocument();
  });
});
