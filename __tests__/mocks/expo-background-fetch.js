// Mock for expo-background-fetch
module.exports = {
  BackgroundFetchStatus: {
    Restricted: 0,
    Denied: 1,
    Available: 2,
  },
  BackgroundFetchResult: {
    NewData: 0,
    NoData: 1,
    Failed: 2,
  },
  registerTaskAsync: jest.fn().mockResolvedValue(undefined),
  unregisterTaskAsync: jest.fn().mockResolvedValue(undefined),
  getStatusAsync: jest.fn().mockResolvedValue(2), // Available
};
