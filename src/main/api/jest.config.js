module.exports = {
    preset: "ts-jest",
    resetMocks: true,
    testEnvironment: "node",
    setupFiles: ["./setJestEnvVars.js"]
}