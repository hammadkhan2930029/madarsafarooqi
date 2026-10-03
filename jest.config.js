module.exports = {
  setupFiles: ['<rootDir>/jest.setup.js'],
  preset: '@react-native/jest-preset',
  testPathIgnorePatterns: ['/node_modules/', '/functions/'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|@shopify/flash-list)/)',
  ],
};
