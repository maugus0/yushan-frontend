// Convert CommonJS to ES module syntax
export default {
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.[jt]sx?$': 'babel-jest',
  },
  // Transform node_modules except for those you want to ignore
  transformIgnorePatterns: [
    '/node_modules/(?!(axios)/)', // allow axios to be transformed
  ],
  moduleNameMapper: {
    // Mock static assets if needed
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
};
