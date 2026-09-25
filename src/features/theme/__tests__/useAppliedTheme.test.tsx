import { act, render, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { getDefaultTheme, getTheme } from '../../../meta/themeCatalog';
import { useGameStore } from '../../../stores/gameStore';
import { ThemeApplier } from '../ThemeApplier';
import { themeCssVariables, useAppliedTheme } from '../useAppliedTheme';

function setAppliedTheme(theme: string | undefined, ownedThemeIds: string[]) {
  const learner = useGameStore.getState().activeLearnerProfile;
  const next = { ...learner, preferences: { ...learner.preferences, theme } };
  useGameStore.setState({
    learners: [next],
    activeLearnerId: next.id,
    activeLearnerProfile: next,
    ownedThemeIds,
  });
}

describe('useAppliedTheme', () => {
  beforeEach(() => {
    setAppliedTheme(undefined, []);
  });

  it('resolves to the default theme when nothing is applied', () => {
    const { result } = renderHook(() => useAppliedTheme());
    expect(result.current.id).toBe(getDefaultTheme().id);
  });

  it('resolves an owned applied theme', () => {
    setAppliedTheme('sea', ['sea']);
    const { result } = renderHook(() => useAppliedTheme());
    expect(result.current.id).toBe('sea');
  });

  it('falls back to the default for an unowned theme', () => {
    setAppliedTheme('space', []);
    const { result } = renderHook(() => useAppliedTheme());
    expect(result.current.id).toBe(getDefaultTheme().id);
  });

  it('tolerates a learner without preferences', () => {
    const learner = useGameStore.getState().activeLearnerProfile;
    const bare = { ...learner, preferences: undefined } as unknown as typeof learner;
    useGameStore.setState({ learners: [bare], activeLearnerProfile: bare });
    const { result } = renderHook(() => useAppliedTheme());
    expect(result.current.id).toBe(getDefaultTheme().id);
  });
});

describe('themeCssVariables', () => {
  it('quotes the art url', () => {
    const sea = getTheme('sea')!;
    const vars = themeCssVariables({ ...sea, artUrl: "data:image/svg+xml,%3csvg a='b'" });
    expect(vars['--app-bg-image']).toBe(`url("data:image/svg+xml,%3csvg a='b'")`);
    expect(vars['--app-bg']).toBe(sea.palette.background);
    expect(vars['--app-accent']).toBe(sea.palette.accent);
  });

  it('uses none for a theme without art', () => {
    expect(themeCssVariables(getDefaultTheme())['--app-bg-image']).toBe('none');
  });
});

describe('ThemeApplier', () => {
  it('writes the applied theme to <html> and follows changes', () => {
    render(<ThemeApplier />);
    const style = document.documentElement.style;
    expect(style.getPropertyValue('--app-bg')).toBe(getDefaultTheme().palette.background);

    act(() => setAppliedTheme('sea', ['sea']));
    expect(style.getPropertyValue('--app-bg')).toBe(getTheme('sea')!.palette.background);
    expect(style.getPropertyValue('--app-bg-image')).toMatch(/^url\(".+"\)$/);
  });
});
