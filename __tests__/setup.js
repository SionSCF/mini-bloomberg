// Jest setup - configure env vars for tests
require("dotenv").config({ path: ".env.test" });

// Mock axios globally to prevent actual API calls in tests
jest.mock("axios");
