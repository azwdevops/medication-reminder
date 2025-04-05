export default {
  testEnvironment: "node",
  verbose: true,
  collectCoverage: true,
  coverageDirectory: "coverage",
  transform: {},
  setupFilesAfterEnv: ["./tests/setup.js"],
};
