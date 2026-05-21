// __tests__/services/ConflictResolver.test.ts
// Unit tests for conflict resolution strategies
import { ConflictResolver } from '@/src/services/ConflictResolver';

describe('ConflictResolver - Strategies', () => {
  describe('LWW (Last-Write-Wins)', () => {
    it('should select remote when remote is newer', () => {
      const local = { id: '1', name: 'Local', updatedAt: 100 };
      const remote = { id: '1', name: 'Remote', updatedAt: 200 };

      const result = ConflictResolver.resolveLastWriteWins(local, remote);
      expect(result.winner).toBe('remote');
      expect(result.resolved.name).toBe('Remote');
    });

    it('should select local when local is newer', () => {
      const local = { id: '1', name: 'Local', updatedAt: 300 };
      const remote = { id: '1', name: 'Remote', updatedAt: 200 };

      const result = ConflictResolver.resolveLastWriteWins(local, remote);
      expect(result.winner).toBe('local');
      expect(result.resolved.name).toBe('Local');
    });

    it('should select remote on equal timestamp', () => {
      const local = { id: '1', name: 'Local', updatedAt: 200 };
      const remote = { id: '1', name: 'Remote', updatedAt: 200 };

      const result = ConflictResolver.resolveLastWriteWins(local, remote);
      expect(result.winner).toBe('remote');
      expect(result.resolved.name).toBe('Remote');
    });

    it('should handle missing timestamps', () => {
      const local = { id: '1', name: 'Local' };
      const remote = { id: '1', name: 'Remote', updatedAt: 100 };

      const result = ConflictResolver.resolveLastWriteWins(local, remote);
      expect(result.winner).toBe('remote');
    });
  });

  describe('Field-Level Merge', () => {
    it('should merge non-conflicting fields', () => {
      const local = { id: '1', name: 'Local', location: 'Safe' };
      const remote = { id: '1', name: 'Local', category: 'Jewelry' };

      const result = ConflictResolver.resolveFieldMerge(local, remote);
      expect(result.winner).toBe('merged');
      expect(result.resolved.name).toBe('Local');
      expect(result.resolved.location).toBe('Safe');
      expect(result.resolved.category).toBe('Jewelry');
    });

    it('should prefer remote on conflicting fields with newer timestamp', () => {
      const local = { id: '1', name: 'Local', updatedAt: 100 };
      const remote = { id: '1', name: 'Remote', updatedAt: 200 };

      const result = ConflictResolver.resolveFieldMerge(local, remote);
      expect(result.resolved.name).toBe('Remote');
      expect(result.resolved.updatedAt).toBe(200);
    });

    it('should handle empty fields', () => {
      const local = { id: '1', name: 'Local' };
      const remote = { id: '1', location: 'Remote Location' };

      const result = ConflictResolver.resolveFieldMerge(local, remote);
      expect(result.resolved.name).toBe('Local');
      expect(result.resolved.location).toBe('Remote Location');
    });

    it('should merge arrays by taking remote', () => {
      const local = { id: '1', images: ['img1', 'img2'] };
      const remote = { id: '1', images: ['img3', 'img4', 'img5'] };

      const result = ConflictResolver.resolveFieldMerge(local, remote);
      expect(result.resolved.images).toEqual(['img3', 'img4', 'img5']);
    });
  });

  describe('Conflict Detection', () => {
    it('should detect conflict when both modify with same timestamp', () => {
      const local = { id: '1', name: 'Local', updatedAt: 100 };
      const remote = { id: '1', name: 'Remote', updatedAt: 100 };

      const hasConflict = ConflictResolver.detect(local, remote);
      expect(hasConflict).toBe(true);
    });

    it('should not detect conflict when one is newer', () => {
      const local = { id: '1', name: 'Local', updatedAt: 100 };
      const remote = { id: '1', name: 'Remote', updatedAt: 200 };

      const hasConflict = ConflictResolver.detect(local, remote);
      expect(hasConflict).toBe(false);
    });

    it('should not detect conflict on same timestamp & content', () => {
      const local = { id: '1', name: 'Same', updatedAt: 100 };
      const remote = { id: '1', name: 'Same', updatedAt: 100 };

      const hasConflict = ConflictResolver.detect(local, remote);
      expect(hasConflict).toBe(false);
    });

    it('should detect conflict with different updates', () => {
      const local = { id: '1', name: 'Local', category: 'A' };
      const remote = { id: '1', name: 'Remote', category: 'B' };

      const hasConflict = ConflictResolver.detect(local, remote);
      expect(hasConflict).toBe(true);
    });
  });

  describe('Strategy Selector', () => {
    it('should use LWW as default', () => {
      const local = { id: '1', name: 'Local', updatedAt: 100 };
      const remote = { id: '1', name: 'Remote', updatedAt: 200 };

      const resolution = ConflictResolver.resolve(local, remote);
      expect(resolution.strategy).toBe('lww');
      expect(resolution.winner).toBe('remote');
    });

    it('should use specified strategy', () => {
      const local = { id: '1', name: 'Local', updatedAt: 100, x: 1 };
      const remote = { id: '1', name: 'Remote', updatedAt: 200, y: 2 };

      const resolution = ConflictResolver.resolve(local, remote, 'field-merge');
      expect(resolution.strategy).toBe('field-merge');
      expect(resolution.winner).toBe('merged');
      expect(resolution.resolved.x).toBe(1);
      expect(resolution.resolved.y).toBe(2);
    });

    it('should include all resolution metadata', () => {
      const local = { id: '1', name: 'Local' };
      const remote = { id: '1', name: 'Remote' };

      const resolution = ConflictResolver.resolve(local, remote, 'lww');
      expect(resolution).toHaveProperty('strategy');
      expect(resolution).toHaveProperty('winner');
      expect(resolution).toHaveProperty('local');
      expect(resolution).toHaveProperty('remote');
      expect(resolution).toHaveProperty('resolved');
      expect(resolution).toHaveProperty('timestamp');
    });
  });
});
