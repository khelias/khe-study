import { describe, expect, it } from 'vitest';
import { gameRegistry } from '../../games/registry';
// Side-effect import: registers all bindings into gameRegistry. Without this
// the registry is empty when the test runs.
import '../../games/registrations';
import { LEGACY_GAME_SKILL_IDS } from '../legacyProgress';

describe('LEGACY_GAME_SKILL_IDS coverage', () => {
  it('has an entry for every registered binding', () => {
    const registered = gameRegistry.getIds();
    const missing = registered.filter((id) => !(id in LEGACY_GAME_SKILL_IDS));
    expect(missing).toEqual([]);
  });

  it('does not reference unregistered bindings', () => {
    const registered = new Set(gameRegistry.getIds());
    const stale = Object.keys(LEGACY_GAME_SKILL_IDS).filter((id) => !registered.has(id));
    expect(stale).toEqual([]);
  });
});
