module.exports = {
  testMatch: ['<rootDir>/test/unit/**/*.test.js'],
  rootDir: process.cwd(),
  globals: {
    __DEV__: false,
  },
  moduleNameMapper: {
    '^test/(.*)$': '<rootDir>/test/$1',
    '^core/(.*)$': '<rootDir>/src/core/$1',
    '^utils/(.*)$': '<rootDir>/src/utils/$1',
  },
  verbose: true,
  collectCoverage: true,
  collectCoverageFrom: ['<rootDir>/src/**/*.js'],
  coverageReporters: ['text', 'lcov', 'clover', 'json'],
  testEnvironment: 'jsdom',
}
