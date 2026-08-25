module.exports = {
  testEnvironment: 'jsdom',
  setupFiles: ['./src/setupTests.js'],
  setupFilesAfterEnv: ['./src/jest-dom-setup.js'],
  moduleNameMapper: {
    '\\.(css|less|scss)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|svg)$': '<rootDir>/__mocks__/fileMock.js',
  },
  transform: {
    '^.+\\.jsx?$': 'babel-jest',
  },
  transformIgnorePatterns: [
    '/node_modules/(?!react-router-dom)',
  ],
};
