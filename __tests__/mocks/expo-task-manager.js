// Mock for expo-task-manager
module.exports = {
  defineTask: jest.fn(),
  isTaskDefined: jest.fn().mockResolvedValue(true),
  getTaskOptions: jest.fn().mockResolvedValue({}),
  unregisterAllTasksAsync: jest.fn().mockResolvedValue(undefined),
};
