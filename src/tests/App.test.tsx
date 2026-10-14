import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '@/App';
import { resetHistoryStore } from '@/lib/historyStore';

/**
 * Component tests for the states that are awkward to reach in a browser:
 * an unsolvable margin, a cost of nothing, a browser that refuses to store.
 * The happy path is covered end to end by scripts/verify-ui.mjs instead.
 */

beforeEach(() => {
  window.localStorage.clear();
  resetHistoryStore();
});

async function clearAndType(user: ReturnType<typeof userEvent.setup>, label: string, value: string) {
  const field = screen.getByLabelText(label);
  await user.clear(field);
  if (value) await user.type(field, value);
  return field;
}

describe('the calculator', () => {
  it('opens on a worked example rather than an empty form', () => {
    render(<App />);
    expect(screen.getByTestId('suggested-price')).toHaveTextContent('60,00');
  });

  it('asks for a cost instead of showing a price of nothing', async () => {
    const user = userEvent.setup();
    render(<App />);
    for (const label of ['Variable cost', 'Share of fixed costs', 'Other costs']) {
      await clearAndType(user, label, '');
    }
    expect(screen.queryByTestId('suggested-price')).not.toBeInTheDocument();
    expect(screen.getByText('Fill in a cost to see a price.')).toBeInTheDocument();
  });

  it('explains an unsolvable margin instead of blanking the result', async () => {
    const user = userEvent.setup();
    render(<App />);
    await clearAndType(user, 'Payment fee', '60');
    await clearAndType(user, 'Net margin you want', '50');

    const problem = screen.getByTestId('engine-problem');
    expect(problem).toHaveTextContent(/leaves nothing for cost/);
    expect(screen.queryByTestId('suggested-price')).not.toBeInTheDocument();
  });

  it('explains rates that eat the whole price', async () => {
    const user = userEvent.setup();
    render(<App />);
    await clearAndType(user, 'Payment fee', '100');

    expect(screen.getByTestId('engine-problem')).toHaveTextContent(/no price covers them/);
  });

  it('rejects a negative cost per field, before any arithmetic', async () => {
    const user = userEvent.setup();
    render(<App />);
    const field = await clearAndType(user, 'Variable cost', '-5');

    expect(field).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByRole('alert')).toHaveTextContent('A cost cannot be negative.');
  });

  it('rejects a rate above 100%', async () => {
    const user = userEvent.setup();
    render(<App />);
    const field = await clearAndType(user, 'Commission', '120');

    expect(field).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByRole('alert')).toHaveTextContent('Enter a rate of 100% or less.');
  });

  it('prices from a single cost, with the other two left blank', async () => {
    const user = userEvent.setup();
    render(<App />);
    for (const label of ['Share of fixed costs', 'Other costs']) {
      await clearAndType(user, label, '');
    }
    await clearAndType(user, 'Variable cost', '25');

    // C = 25.00, rates 20%, margin 30% -> 25 / 0.5 = 50.00.
    expect(screen.getByTestId('suggested-price')).toHaveTextContent('50,00');
  });

  it('reports a markup for every priceable calculation', async () => {
    const user = userEvent.setup();
    render(<App />);
    // The interface refuses to price a cost of nothing, which is the only
    // case where markup has no answer. So the row always carries a figure.
    await clearAndType(user, 'Variable cost', '20');
    expect(screen.getByText('Markup').parentElement).toHaveTextContent('%');
  });
});

describe('the history', () => {
  it('starts empty and cannot export nothing', () => {
    render(<App />);
    expect(screen.getByText('Nothing saved yet.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Export CSV' })).toBeDisabled();
  });

  it('names an unnamed calculation rather than saving a blank row', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: 'Save this calculation' }));

    const entries = screen.getAllByRole('listitem');
    expect(entries).toHaveLength(1);
    expect(within(entries[0]!).getByText('Untitled')).toBeInTheDocument();
  });

  it('cannot save while the result is unsolvable', async () => {
    const user = userEvent.setup();
    render(<App />);
    await clearAndType(user, 'Payment fee', '100');

    expect(screen.getByRole('button', { name: 'Save this calculation' })).toBeDisabled();
  });

  it('says so when the browser refuses to store anything', () => {
    const getItem = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('denied');
    });
    resetHistoryStore();

    render(<App />);
    expect(screen.getByText(/not letting the page save anything/)).toBeInTheDocument();

    getItem.mockRestore();
  });
});

describe('currency', () => {
  it('relabels the figures without converting them', async () => {
    const user = userEvent.setup();
    render(<App />);
    expect(screen.getByTestId('suggested-price')).toHaveTextContent('R$');

    await user.click(screen.getByRole('button', { name: '$ USD' }));

    const price = screen.getByTestId('suggested-price');
    expect(price).toHaveTextContent('$60.00');
    expect(price).not.toHaveTextContent('R$');
  });
});
