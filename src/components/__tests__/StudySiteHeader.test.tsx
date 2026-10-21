import { StrictMode } from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { getLocale, setLocale } from '../../i18n';
import { StudySiteHeader } from '../StudySiteHeader';

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
