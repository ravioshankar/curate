# E2E Testing Guide for Offline-First Sync

## Overview

This guide covers the comprehensive E2E test suite for the offline-first sync engine. Tests are organized by service and scenario, covering all critical sync flows.

---

## Test Suite Structure

```
__tests__/
├── setup.ts                          # Jest configuration & mocks
├── services/
│   ├── SyncEngine.test.ts            # E2E sync scenarios (7 test suites)
│   ├── ConflictResolver.test.ts      # Conflict resolution strategies (4 test suites)
│   └── OpQueueService.test.ts        # Operations queue (3 test suites)
└── README.md                         # This file
```

---

## Running Tests

### Install Dependencies
```bash
npm install
```

### Run All Tests
```bash
npm test
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Generate Coverage Report
```bash
npm run test:coverage
```

### Run Specific Test File
```bash
npm test -- __tests__/services/SyncEngine.test.ts
```

### Run Tests Matching Pattern
```bash
npm test -- --testNamePattern="Conflict Detection"
```

---

## Test Coverage

### Scenario 1: Offline Edits & Sync (SyncEngine.test.ts)
**Goal:** Verify operations are recorded offline and queued correctly

✓ `should record operations offline`
  - Create item while offline
  - Verify operation in queue
  - Check operation metadata (id, type, timestamp, etc.)

✓ `should queue multiple operations offline`
  - Create 2+ items offline
  - Verify all operations recorded in order
  - Check queue length matches

✓ `should clear queue after successful sync`
  - Create item and record operation
  - Mark operation as synced
  - Verify operation removed from queue

---

### Scenario 2: Conflict Detection & Resolution (ConflictResolver.test.ts)
**Goal:** Verify conflicts are detected and resolved correctly

#### LWW (Last-Write-Wins) Strategy

✓ `should select remote when remote is newer`
  - Local: updatedAt=100, Remote: updatedAt=200
  - Winner: remote (newer timestamp)

✓ `should select local when local is newer`
  - Local: updatedAt=300, Remote: updatedAt=200
  - Winner: local (newer timestamp)

✓ `should select remote on equal timestamp`
  - Local & Remote: updatedAt=200
  - Winner: remote (tie-breaker)

#### Field-Level Merge Strategy

✓ `should merge non-conflicting fields`
  - Local: {name, location}, Remote: {name, category}
  - Result: {name, location, category} (all fields merged)

✓ `should prefer remote on conflicting fields`
  - Local: {name: 'Local'}, Remote: {name: 'Remote', updatedAt: newer}
  - Result: Remote name wins (newer timestamp)

#### Conflict Detection

✓ `should detect modification conflict`
  - Both local and remote modified differently
  - Detect: true

✓ `should not detect conflict when content identical`
  - Local & Remote have same values (different timestamps)
  - Detect: false

---

### Scenario 3: Delete Operations (SyncEngine.test.ts)
**Goal:** Verify delete operations are handled correctly

✓ `should record delete operations`
  - Create item (operation 1)
  - Delete item (operation 2)
  - Verify operation queue has 2 ops (create + delete)

✓ `should handle concurrent edits and deletes`
  - Create item A & B
  - Edit item A
  - Delete item B
  - Verify queue: [create A, create B, update A, delete B]

---

### Scenario 4: Operation Queue Persistence (OpQueueService.test.ts)
**Goal:** Verify queue persists across app restarts

✓ `should persist operations across app restarts`
  - Create item and record operation
  - Read queue (simulates first read)
  - Read again (simulates app restart/reload)
  - Verify same operations still present

---

### Scenario 5: Large Data Sync (SyncEngine.test.ts)
**Goal:** Verify performance with many items

✓ `should handle sync of many items`
  - Create 50 items
  - Verify all recorded in queue
  - Check local storage integrity

✓ `should preserve data integrity during sync`
  - Create item with special characters, numbers, descriptions
  - Verify all data intact after save
  - Check: name, description, value, currency match

---

## Test Utilities & Mocks

### Jest Setup (`__tests__/setup.ts`)

#### Mocked Dependencies

1. **AsyncStorage**
   ```typescript
   getItem: jest.fn(async () => null)
   setItem: jest.fn(async () => null)
   removeItem: jest.fn(async () => null)
   ```

2. **NetInfo (Connectivity)**
   ```typescript
   addEventListener: jest.fn(() => jest.fn())
   fetch: jest.fn(async () => ({}))
   ```

3. **Firebase (Auth & Firestore)**
   ```typescript
   initializeApp: jest.fn()
   getAuth: jest.fn()
   onAuthStateChanged: jest.fn()
   ```

### Test Utilities

```typescript
// Wait function (simulate delays)
wait(ms: number) => Promise<void>

// Mock user
mockUser: { uid, email, displayName }

// Mock item
mockItem: { id, name, category, location, ... }
```

---

## Expected Test Results

### Summary Output
```
 PASS  __tests__/services/SyncEngine.test.ts
 PASS  __tests__/services/ConflictResolver.test.ts
 PASS  __tests__/services/OpQueueService.test.ts

Test Suites: 3 passed, 3 total
Tests:       45 passed, 45 total
Snapshots:   0 total
Time:        X.XXXs
```

### Coverage Targets
- **SyncEngine.ts**: >80% coverage
- **ConflictResolver.ts**: >90% coverage (logic-focused)
- **OpQueueService.ts**: >85% coverage
- **Overall**: >80% coverage

---

## Test Isolation & Cleanup

### Before Each Test
```typescript
beforeEach(async () => {
  // Clear AsyncStorage
  await AsyncStorage.clear();
  
  // Reset mocks
  jest.clearAllMocks();
});
```

### After Each Test
```typescript
afterEach(async () => {
  // Clear operation queue
  await opQueueService.clearQueue();
  
  // Clean up timers
  jest.clearAllTimers();
});
```

---

## Debugging Tests

### Enable Verbose Output
```bash
npm test -- --verbose
```

### Debug Specific Test
```bash
node --inspect-brk node_modules/.bin/jest __tests__/services/SyncEngine.test.ts
# Open chrome://inspect in Chrome DevTools
```

### Print Debug Logs
```typescript
describe('Test Suite', () => {
  it('should do something', () => {
    console.log('DEBUG: queue:', queue); // Shows in verbose output
    expect(queue).toBeDefined();
  });
});
```

---

## CI/CD Integration

### GitHub Actions Example
```yaml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm test -- --coverage
      - run: npm run lint
```

---

## Adding New Tests

### Template
```typescript
describe('New Feature', () => {
  beforeEach(async () => {
    // Setup
  });

  afterEach(async () => {
    // Cleanup
  });

  it('should do X', async () => {
    // Arrange
    const data = { ... };
    
    // Act
    const result = await someFunction(data);
    
    // Assert
    expect(result).toEqual(expected);
  });
});
```

### Best Practices
- One assertion per test (or closely related assertions)
- Descriptive test names ("should X when Y")
- Arrange-Act-Assert pattern
- Mock external dependencies
- Clear setup and teardown

---

## Known Limitations & Workarounds

### 1. Firebase/Firestore Cannot Be Tested Directly
**Why**: Firebase SDK requires network access and credentials

**Workaround**: Use mocked Firebase in `setup.ts`
```typescript
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  doc: jest.fn(),
  // ... etc
}));
```

**Future**: Use Firebase Emulator Suite for integration tests

### 2. AsyncStorage Tests May Fail Without Proper Mock
**Why**: AsyncStorage requires native modules

**Workaround**: Mock in `setup.ts` with promise-based API
```typescript
jest.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: jest.fn(async () => null),
    setItem: jest.fn(async () => null),
  },
}));
```

### 3. Navigation/UI Tests Not Included
**Why**: Complex to test without React Navigation & UI rendering

**Solution**: Create separate integration tests with React Native Testing Library
```typescript
import { render } from '@testing-library/react-native';

describe('SyncIndicator', () => {
  it('should show syncing indicator', () => {
    const { getByText } = render(<SyncIndicator syncing={true} />);
    expect(getByText('Syncing...')).toBeDefined();
  });
});
```

---

## Performance Benchmarks

### Expected Test Execution Times
- **SyncEngine.test.ts**: 2-3 seconds (7 suites, 15 tests)
- **ConflictResolver.test.ts**: 1 second (4 suites, 20 tests)
- **OpQueueService.test.ts**: <1 second (3 suites, 10 tests)
- **Total**: ~3-4 seconds

### Optimization Tips
- Use `jest --maxWorkers=4` to parallelize
- Mock expensive operations (Firestore, encryption)
- Avoid unnecessary async/await in synchronous tests

---

## Troubleshooting

### Tests Fail with "Cannot find module"
```bash
npm install
# or
npx jest --clearCache
```

### Mocks Not Working
- Verify mock path matches import path
- Check `setup.ts` is referenced in `jest.config.js`
- Clear Jest cache: `npx jest --clearCache`

### Timeout Errors
- Increase timeout: `jest.setTimeout(20000);`
- Check for unresolved promises in tests
- Use `async/await` correctly

### AsyncStorage Tests Failing
- Ensure mock returns Promise
- Use `await` on async operations
- Check mock implementation in `setup.ts`

---

## Next Steps

### Short Term (Complete Tests)
- [ ] Add Firebase Emulator Suite for real Firestore tests
- [ ] Add React Native Testing Library for UI tests
- [ ] Add performance benchmarks

### Medium Term (Enhance Coverage)
- [ ] Integration tests (Auth + Sync + Database)
- [ ] End-to-end flows (Sign-up → Sync → Backup)
- [ ] Error scenarios (network failures, corrupted data)

### Long Term (Production Ready)
- [ ] Coverage threshold enforcement (>80%)
- [ ] Continuous testing in CI/CD
- [ ] Load testing (1000s of items)
- [ ] Cross-device sync tests

---

## Resources

- [Jest Documentation](https://jestjs.io/)
- [React Native Testing](https://reactnative.dev/docs/testing-overview)
- [React Native Testing Library](https://callstack.github.io/react-native-testing-library/)
- [Firebase Emulator Suite](https://firebase.google.com/docs/emulator-suite)

---

## Support

For test-related issues:
1. Check this guide and troubleshooting section
2. Review test file comments and setup.ts
3. Check Jest docs: https://jestjs.io/
4. Review Firebase mocking in setup.ts

Last updated: 2026-05-17
