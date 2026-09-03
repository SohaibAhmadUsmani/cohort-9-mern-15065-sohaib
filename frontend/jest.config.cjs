module.exports = {
  testEnvironment: 'jsdom',
  setupFiles: ['./src/setupTests.js'],
  setupFilesAfterEnv: ['./src/jest-dom-setup.js'],
  moduleNameMapper: {
    '\\.(css|less|scss)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|svg)$': '<rootDir>/__mocks__/fileMock.js',
    '^react-quill-new$': '<rootDir>/__mocks__/react-quill-new.js',
  },
  transform: {
    '^.+\\.jsx?$': 'babel-jest',
  },
  transformIgnorePatterns: [
    '/node_modules/(?!react-router-dom|react-quill-new|quill)',
  ],
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!src/**/*.test.*',
    '!src/**/*.spec.*',
    '!src/setupTests.js',
    '!src/jest-dom-setup.js',
    '!src/main.jsx',
    '!src/App.jsx',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['lcov', 'text'],
};
