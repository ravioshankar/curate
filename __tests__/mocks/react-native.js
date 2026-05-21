// Mock for react-native module
module.exports = {
  Platform: {
    OS: 'ios',
    select: (obj) => obj.ios || obj.default,
  },
  View: 'View',
  Text: 'Text',
  ScrollView: 'ScrollView',
  StyleSheet: {
    create: (styles) => styles,
  },
  AppState: {
    addEventListener: jest.fn(() => jest.fn()),
  },
};
