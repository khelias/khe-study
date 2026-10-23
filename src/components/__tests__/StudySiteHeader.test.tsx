import { StrictMode } from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { getLocale, setLocale } from '../../i18n';
import { StudySiteHeader } from '../StudySiteHeader';
import { THEME_STORAGE_KEY } from '../../theme/themeKey';

const renderHeader = () =>
  render(
    <StrictMode>
      <StudySiteHeader />
    </StrictMode>,
  );

describe('StudySiteHeader', () => {
  beforeEach(() => {
    setLocale('et');
  });

  afterEach(() => {
    localStorage.removeItem(THEME_STORAGE_KEY);
    document.documentElement.removeAttribute('data-theme');
  });

  it('renders the shared header with the Estonian strings', () => {
    const { container } = renderHeader();

    expect(container.querySelectorAll('header.site-header')).toHaveLength(1);
    expect(screen.getByRole('link', { name: 'KHE.ee avaleht' })).toHaveAttribute(
      'href',
      'https://khe.ee/?lang=et',
    );
    expect(container.querySelector('.site-header__rooms')).toHaveAttribute(
      'data-khe-room',
      'games',
    );
    expect(container.querySelector('[aria-current="true"]')).toHaveAttribute(
      'data-khe-room',
      'games',
    );
    expect(container.querySelector('.site-header__title')).toHaveTextContent('Tarkade Mängud');
    expect(screen.getByRole('group', { name: 'Keel' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'ET' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('shows the shared theme toggle, stored under the hub key', () => {
    renderHeader();
    const toggle = screen.getByRole('button', { name: 'Tume teema' });
    expect(toggle).toHaveAttribute('aria-pressed', 'false');
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-pressed', 'true');
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
    fireEvent.click(toggle);
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBeNull();
  });

  it('switches the app locale and keeps it in the URL', () => {
    const { container } = renderHeader();

    fireEvent.click(screen.getByRole('button', { name: 'EN' }));

    expect(getLocale()).toBe('en');
    expect(new URL(window.location.href).searchParams.get('lang')).toBe('en');
    expect(screen.getByRole('button', { name: 'EN' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('group', { name: 'Language' })).toBeInTheDocument();
    expect(screen.getByText('Smart Games')).toBeInTheDocument();
    expect(container.querySelector('.site-header__rooms-name')).toHaveTextContent('Games');
  });

  it('follows a locale change made elsewhere, as the Settings switcher does', () => {
    renderHeader();

    act(() => setLocale('en'));

    expect(screen.getByRole('button', { name: 'EN' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'ET' })).toHaveAttribute('aria-pressed', 'false');
  });
});
