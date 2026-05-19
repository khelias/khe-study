import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PersistenceService } from '../persistenceService';
import { LocalStorageAdapter } from '../localStorageAdapter';
import type { PersistenceAdapter } from '../types';
import type { GameStore } from '../../../stores/gameStore';

// Mock adapter for testing
class MockAdapter implements PersistenceAdapter {
  private storage = new Map<string, string>();

  // eslint-disable-next-line @typescript-eslint/require-await
  async save(key: string, data: unknown): Promise<void> {
    this.storage.set(key, JSON.stringify(data));
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async load<T>(key: string): Promise<T | null> {
    const item = this.storage.get(key);
    return item ? (JSON.parse(item) as T) : null;
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async delete(key: string): Promise<void> {
    this.storage.delete(key);
  }
}

describe('PersistenceService', () => {
  let service: PersistenceService;
  let adapter: PersistenceAdapter;
  const testGameState: Partial<GameStore> = {
    unlockedAchievements: ['first_win'],
    soundEnabled: true,
    score: 100,
    stars: 5,
    hasSeenTutorial: true,
  };

  beforeEach(() => {
    adapter = new MockAdapter();
    service = new PersistenceService(adapter);
  });

  describe('saveGameState', () => {
    it('should save game state', async () => {
      await service.saveGameState(testGameState as GameStore);

      const loaded = await service.loadGameState();
      expect(loaded).toMatchObject(testGameState);
    });
  });

  describe('loadGameState', () => {
    it('should load game state', async () => {
      await adapter.save('gameState', testGameState);

      const loaded = await service.loadGameState();
      expect(loaded).toMatchObject(testGameState);
    });

    it('should return null if game state does not exist', async () => {
      const loaded = await service.loadGameState();
      expect(loaded).toBeNull();
    });
  });

  describe('save/load generic', () => {
    it('should save and load generic data', async () => {
      const testData = { custom: 'data', number: 42 };

      await service.save('custom_key', testData);
      const loaded = await service.load<typeof testData>('custom_key');

      expect(loaded).toEqual(testData);
    });
  });

  describe('delete', () => {
    it('should delete data', async () => {
      await service.save('test_key', { data: 'test' });
      await service.delete('test_key');

      const loaded = await service.load('test_key');
      expect(loaded).toBeNull();
    });
  });

  describe('sync', () => {
    it('should call sync on adapter if supported', async () => {
      const syncAdapter = {
        ...adapter,
        sync: vi.fn().mockResolvedValue(undefined),
      };
      const syncService = new PersistenceService(syncAdapter);

      await syncService.sync();

      expect(syncAdapter.sync).toHaveBeenCalled();
    });

    it('should throw error if adapter does not support sync', async () => {
      await expect(service.sync()).rejects.toThrow('Sync is not supported');
    });
  });

  describe('getAdapter', () => {
    it('should return the current adapter', () => {
      const returnedAdapter = service.getAdapter();
      expect(returnedAdapter).toBe(adapter);
    });
  });

  describe('integration with LocalStorageAdapter', () => {
    it('should work with LocalStorageAdapter', async () => {
      const localStorageService = new PersistenceService(new LocalStorageAdapter());

      // Clear localStorage first
      localStorage.clear();

      await localStorageService.saveGameState(testGameState as GameStore);
      const loaded = await localStorageService.loadGameState();

      expect(loaded).toMatchObject(testGameState);
    });
  });
});
