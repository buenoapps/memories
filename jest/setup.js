/* eslint-disable @typescript-eslint/no-require-imports */

// AsyncStorage has no native module under jest; back it with a simple in-memory
// store so settings persistence can be exercised without the native bridge.
jest.mock('@react-native-async-storage/async-storage', () => {
  let store = {};
  return {
    __esModule: true,
    default: {
      getItem: jest.fn((key) => Promise.resolve(key in store ? store[key] : null)),
      setItem: jest.fn((key, value) => {
        store[key] = value;
        return Promise.resolve();
      }),
      removeItem: jest.fn((key) => {
        delete store[key];
        return Promise.resolve();
      }),
      clear: jest.fn(() => {
        store = {};
        return Promise.resolve();
      }),
    },
  };
});

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

// Native media/UI modules: swap the views for plain Views and stub the rest so
// components that import them can render under jest.
jest.mock('expo-symbols', () => {
  const React = require('react');
  const { View } = require('react-native');
  return { SymbolView: (props) => React.createElement(View, props) };
});

jest.mock('@react-native-community/datetimepicker', () => {
  const React = require('react');
  const { View } = require('react-native');
  return { __esModule: true, default: (props) => React.createElement(View, props) };
});

jest.mock('expo-video', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    VideoView: (props) => React.createElement(View, props),
    useVideoPlayer: () => ({ play: jest.fn(), pause: jest.fn(), loop: false }),
    createVideoPlayer: () => ({ play: jest.fn(), pause: jest.fn(), loop: false }),
  };
});

jest.mock('expo-sharing', () => ({
  isAvailableAsync: jest.fn().mockResolvedValue(true),
  shareAsync: jest.fn().mockResolvedValue(undefined),
}));

// expo-media-library pulls in a nested expo copy that fails under jest. Stub
// the surface the app uses; tests that exercise the query path mock it locally.
jest.mock('expo-media-library', () => {
  class Query {
    eq() {
      return this;
    }
    within() {
      return this;
    }
    gte() {
      return this;
    }
    lte() {
      return this;
    }
    limit() {
      return this;
    }
    orderBy() {
      return this;
    }
    exe() {
      return Promise.resolve([]);
    }
  }
  return {
    AssetField: {
      MEDIA_TYPE: 'mediaType',
      CREATION_TIME: 'creationTime',
    },
    MediaType: { IMAGE: 'image', VIDEO: 'video' },
    Query,
    // The new asset API used by src/utils/share.ts. `getUri()` resolves to a
    // shareable file:// URI for downloaded assets.
    Asset: class Asset {
      constructor(id) {
        this.id = id;
      }
      getUri() {
        return Promise.resolve('file://x.jpg');
      }
    },
    getPermissionsAsync: jest.fn().mockResolvedValue({ granted: false, canAskAgain: false }),
    requestPermissionsAsync: jest.fn().mockResolvedValue({ granted: false, canAskAgain: false }),
  };
});

jest.mock('expo-notifications', () => ({
  setNotificationHandler: jest.fn(),
  getPermissionsAsync: jest.fn().mockResolvedValue({ granted: false, canAskAgain: false }),
  requestPermissionsAsync: jest.fn().mockResolvedValue({ granted: false, canAskAgain: false }),
  cancelAllScheduledNotificationsAsync: jest.fn().mockResolvedValue(undefined),
  scheduleNotificationAsync: jest.fn().mockResolvedValue('id'),
  SchedulableTriggerInputTypes: { DATE: 'date' },
}));
