// ConflictResolver.ts - Implements conflict resolution strategies

export type ConflictStrategy = 'lww' | 'manual' | 'field-merge';

export interface ConflictResolution {
  strategy: ConflictStrategy;
  winner: 'local' | 'remote' | 'merged';
  local: any;
  remote: any;
  resolved: any;
  timestamp: number;
}

export class ConflictResolver {
  static resolveLastWriteWins(local: any, remote: any): any {
    // Last Write Wins - remote (server) timestamp wins by default
    const localTime = local.updatedAt || local.createdAt || 0;
    const remoteTime = remote.updatedAt || remote.createdAt || 0;

    if (remoteTime >= localTime) {
      return { winner: 'remote', resolved: remote };
    } else {
      return { winner: 'local', resolved: local };
    }
  }

  static resolveFieldMerge(local: any, remote: any): any {
    // Field-level merge: take newest value for each field
    const merged: any = {};
    const allKeys = new Set([...Object.keys(local), ...Object.keys(remote)]);

    for (const key of allKeys) {
      const localVal = local[key];
      const remoteVal = remote[key];

      if (key === 'updatedAt' || key === 'version') {
        merged[key] = Math.max(localVal || 0, remoteVal || 0);
      } else if (localVal === remoteVal) {
        merged[key] = localVal;
      } else if (!localVal) {
        merged[key] = remoteVal;
      } else if (!remoteVal) {
        merged[key] = localVal;
      } else {
        // Both have different values - use remote as default
        merged[key] = remoteVal;
      }
    }

    return { winner: 'merged', resolved: merged };
  }

  static detect(local: any, remote: any): boolean {
    // Conflict if both have been modified independently
    const localTime = local.updatedAt || 0;
    const remoteTime = remote.updatedAt || 0;

    if (localTime === remoteTime) {
      // Same timestamp - check if content differs
      return JSON.stringify(local) !== JSON.stringify(remote);
    }

    return false;
  }

  static resolve(
    local: any,
    remote: any,
    strategy: ConflictStrategy = 'lww'
  ): ConflictResolution {
    let result: any;

    switch (strategy) {
      case 'field-merge':
        result = this.resolveFieldMerge(local, remote);
        break;
      case 'lww':
      default:
        result = this.resolveLastWriteWins(local, remote);
        break;
    }

    return {
      strategy,
      winner: result.winner,
      local,
      remote,
      resolved: result.resolved,
      timestamp: Date.now(),
    };
  }
}
