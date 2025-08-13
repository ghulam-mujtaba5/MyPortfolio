import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

// Mocks
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    isReady: true,
    query: {},
  }),
}));

jest.mock('../../../components/Admin/AdminLayout/AdminLayout', () => ({ children, title }) => (
  <div data-testid="admin-layout" data-title={title}>{children}</div>
));

jest.mock('../../../components/Admin/Icon/Icon', () => ({ name }) => (
  <span data-testid={`icon-${name || 'icon'}`} />
));

jest.mock('../../../components/Admin/Tooltip/Tooltip', () => ({ children }) => <span>{children}</span>);

// Render modal content inline to simplify testing
jest.mock('../../../components/Admin/Modal/Modal', () => ({ open, onClose, children }) => (
  open ? <div role="dialog">{children}</div> : null
));

// Under test
import ArticlesPage from '../../../pages/admin/articles/index';

const seedSavedSearches = (n) => {
  const entries = Array.from({ length: n }, (_, i) => ({ name: `S${i+1}`, query: { search: `q${i+1}` } }));
  window.localStorage.setItem('articles-saved-searches', JSON.stringify(entries));
};

describe('Admin Articles - Saved Searches V2', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  test('Save button is disabled when 8 saved searches exist', () => {
    seedSavedSearches(8);
    const { container } = render(<ArticlesPage />);
    const saveBtn = container.querySelector('button[aria-keyshortcuts~="s"]');
    expect(saveBtn).toBeTruthy();
    expect(saveBtn).toBeDisabled();
  });

  test('Has aria-live region for announcements', () => {
    render(<ArticlesPage />);
    const live = document.querySelector('[aria-live="polite"]');
    expect(live).toBeInTheDocument();
  });

  test('Global shortcut "/" focuses search input', () => {
    const { container } = render(<ArticlesPage />);
    const textboxes = screen.getAllByRole('textbox');
    const search = textboxes[0] || container.querySelector('input[type="text"]');
    expect(search).toBeTruthy();
    expect(document.activeElement).not.toBe(search);
    fireEvent.keyDown(window, { key: '/' });
    expect(document.activeElement).toBe(search);
  });
});
