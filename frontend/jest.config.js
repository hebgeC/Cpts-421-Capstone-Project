module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['<rootDir>/test/setup.js'],
  testMatch: ['<rootDir>/__tests__/**/*.test.[jt]s?(x)'],
  collectCoverageFrom: ['App.js', 'src/screens/**/*.{js,jsx}', 'src/components/**/*.{js,jsx}', 'src/context/**/*.{js,jsx}'],
  coveragePathIgnorePatterns: ['/LoginScreen.js$', '/AuthContext.js$', '/LogoutConfirmModal.jsx$'],
  coverageDirectory: 'coverage',
  clearMocks: true,
  testTimeout: 15000,
};
