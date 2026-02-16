export default {
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.(jsx?|tsx?)$': 'babel-jest',
  },
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  testMatch: ['**/*.test.js', '**/*.test.jsx'],
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!src/**/*.test.{js,jsx}',
    '!src/index.jsx',
  ],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
};
