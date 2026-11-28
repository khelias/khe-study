import { MemoryRouter } from 'react-router-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { setLocale } from '../../../i18n';
import { useGameStore } from '../../../stores/gameStore';
import { createPin } from '../../../meta/pin';
import { ParentModal } from '../ParentModal';
import { setLearnerMeta } from '../../../test/utils';

const renderModal = () =>
  render(
    <MemoryRouter>
      <ParentModal onClose={vi.fn()} />
    </MemoryRouter>,
  );

const type = (pin: string) => {
  for (const digit of pin) fireEvent.click(screen.getByRole('button', { name: digit }));
};

const meta = () => useGameStore.getState().activeLearnerProfile.meta;

describe('ParentModal', () => {
  beforeEach(() => {
    setLocale('et');
    useGameStore.setState({ parentPin: null });
    setLearnerMeta({ focus: null, stars: 7 });
  });

  it('sets a PIN twice, asks again on a mismatch, then opens the focus', async () => {
    renderModal();
    expect(screen.getByText('Vali uus PIN')).toBeInTheDocument();
    type('1234');
    expect(screen.getByText('Sisesta PIN uuesti')).toBeInTheDocument();
    type('1235');
    expect(screen.getByText('PIN-id ei olnud samad. Proovi uuesti.')).toBeInTheDocument();
    type('1234');
    type('1234');
    expect(await screen.findByRole('radio', { name: /Rada valib ise/ })).toBeChecked();
    expect(useGameStore.getState().parentPin?.hash).toMatch(/^[0-9a-f]{64}$/);
  });

  it('focuses the path on a subject or one of its skills and shows what the child sees', async () => {
    useGameStore.setState({ parentPin: await createPin('2468') });
    renderModal();
    type('2468');
    fireEvent.click(await screen.findByRole('radio', { name: 'Matemaatika' }));
    expect(meta().focus).toEqual({ kind: 'subject', subject: 'math' });

    fireEvent.click(screen.getByRole('radio', { name: 'Liitmine kuni 20' }));
    expect(meta().focus).toMatchObject({ kind: 'skill' });
    expect(screen.getByTestId('parent-preview')).toHaveTextContent(
      'Täna harjutad: Liitmine kuni 20',
    );

    fireEvent.click(screen.getByRole('radio', { name: /Rada valib ise/ }));
    expect(meta().focus).toBeNull();
  });

  it('says a wrong PIN, and a forgotten one clears only the PIN and the focus', async () => {
    useGameStore.setState({ parentPin: await createPin('2468') });
    setLearnerMeta({ focus: { kind: 'subject', subject: 'logic' } });
    renderModal();
    type('1111');
    expect(await screen.findByText('Vale PIN')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Unustasid PIN-i?' }));
    fireEvent.click(screen.getByRole('button', { name: 'Kustuta PIN ja fookus' }));
    expect(useGameStore.getState().parentPin).toBeNull();
    expect(meta().focus).toBeNull();
    expect(meta().stars).toBe(7);
    expect(screen.getByText('Vali uus PIN')).toBeInTheDocument();
  });
});
