module.exports = {
  preset: "ts-jest",
  setupFilesAfterEnv: ["@testing-library/jest-dom"],
  testEnvironment: "jest-environment-jsdom",
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },
};