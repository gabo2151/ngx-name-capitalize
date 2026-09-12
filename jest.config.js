/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-preset-angular',
  globalSetup: 'jest-preset-angular/global-setup',
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
  testMatch: ['<rootDir>/projects/**/*.spec.ts'],
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/dist/'],
  // jest-preset-angular 12 (the last line supporting Angular 12) reads its ts-jest
  // options from `globals`, not from per-transform options like the 2.x/3.x branches.
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/projects/ngx-name-capitalize/tsconfig.spec.json',
      stringifyContentPathRegex: '\\.(html|svg)$',
    },
  },
  collectCoverage: true,
  collectCoverageFrom: [
    '<rootDir>/projects/ngx-name-capitalize/src/**/*.ts',
    '!<rootDir>/projects/ngx-name-capitalize/src/**/*.spec.ts',
    '!<rootDir>/projects/ngx-name-capitalize/src/public-api.ts',
  ],
  // The library is a single pipe delegating to name-capitalize. Anything short of
  // full coverage means a branch nobody thought about.
  coverageThreshold: {
    global: {
      statements: 100,
      branches: 100,
      functions: 100,
      lines: 100,
    },
  },
};
