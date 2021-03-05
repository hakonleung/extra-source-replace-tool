const path = require('path')

module.exports = {
  rootDir: process.cwd(),
  // preset: 'ts-jest/presets/js-with-ts',
  // transform: {
  //     '^.+\\.tsx?$': 'ts-jest',
  // },
  globals: {
    // 'ts-jest': {
    //     tsConfig: '<rootDir>/spread-sheet/tsconfig.test.json',
    //     diagnostics: false,
    // },
    __DEV__: false,
  },
  moduleDirectories: ['<rootDir>/node_modules', '<rootDir>'],
  moduleNameMapper: {
    '^test/(.*)$': '<rootDir>/src/test/$1',
    '^core/(.*)$': '<rootDir>/src/core/$1',
    '^utils/(.*)$': '<rootDir>/src/utils/$1',
  },
  // setupFiles: ['<rootDir>/spread-sheet/test/rely/index.js'],
  verbose: true,
  collectCoverage: true,
  collectCoverageFrom: ['<rootDir>/src/**/*.js'],
  coverageReporters: ['text', 'lcov', 'clover', 'json'],
}
