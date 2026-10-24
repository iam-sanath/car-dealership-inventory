module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src"],
   collectCoverageFrom: ["src/**/*.ts", "!src/server.ts", "!src/db/**", "!src/repositories/prisma*.ts","!src/testing/**","!src/scripts/**"],
};