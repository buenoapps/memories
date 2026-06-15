/* eslint-disable @typescript-eslint/no-require-imports */

// expo-image renders a native view; swap it for a plain RN View in tests.
jest.mock('expo-image', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    Image: (props) => React.createElement(View, props),
  };
});

// Provide deterministic safe-area insets without needing a provider.
jest.mock('react-native-safe-area-context', () => {
  const mock = require('react-native-safe-area-context/jest/mock');
  return { __esModule: true, ...mock.default };
});
