module.exports = {
  testMatch: ['<rootDir>/test/unit/**/*.test.js'],
  rootDir: process.cwd(),
  globals: {
    __DEV__: false,
  },
  moduleNameMapper: {
    '^index$': '<rootDir>/src/index',
    '^test/(.*)$': '<rootDir>/test/$1',
    '^core/(.*)$': '<rootDir>/src/core/$1',
    '^utils/(.*)$': '<rootDir>/src/utils/$1',
    '^plugins/(.*)$': '<rootDir>/src/plugins/$1',
  },
  verbose: true,
  collectCoverage: true,
  collectCoverageFrom: ['<rootDir>/src/**/*.js'],
  coverageReporters: ['text', 'lcov', 'clover', 'json'],
  testEnvironment: 'node',
  coveragePathIgnorePatterns: ['/node_modules/', '<rootDir>/src/inject/*'],
}
