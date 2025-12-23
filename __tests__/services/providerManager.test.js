const ProviderManager = require("../../src/services/providerManager");
const Alpha = require("../../src/services/providers/alphaVantage.provider");
const Twelve = require("../../src/services/providers/twelveData.provider");

jest.mock("../../src/services/providers/alphaVantage.provider");
jest.mock("../../src/services/providers/twelveData.provider");

describe("ProviderManager", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset cooldowns
    ProviderManager._internal.cooldowns = {};
  });

  test("getPrice returns result from first available provider", async () => {
    Alpha.fetchPrice.mockResolvedValue({
      provider: "alpha_vantage",
      price: 150.25,
    });

    const result = await ProviderManager.getPrice("AAPL");
    expect(result.price).toBe(150.25);
    expect(Alpha.fetchPrice).toHaveBeenCalledWith("AAPL");
  });

  test("getPrice falls back to second provider on rate limit", async () => {
    const error = new Error("Rate limit");
    error.type = "RATE_LIMIT";
    Alpha.fetchPrice.mockRejectedValue(error);

    Twelve.fetchPrice.mockResolvedValue({
      provider: "twelvedata",
      price: 150.25,
    });

    const result = await ProviderManager.getPrice("AAPL");
    expect(result.price).toBe(150.25);
    expect(Twelve.fetchPrice).toHaveBeenCalledWith("AAPL");
  });

  test("getPrice sets cooldown after RATE_LIMIT", async () => {
    const error = new Error("Rate limit");
    error.type = "RATE_LIMIT";
    Alpha.fetchPrice.mockRejectedValue(error);
    Twelve.fetchPrice.mockResolvedValue({ provider: "twelvedata", price: 150 });

    await ProviderManager.getPrice("AAPL");

    // First provider should be in cooldown now
    expect(ProviderManager.isInCooldown("alpha_vantage")).toBe(true);
  });

  test("getPrice skips provider in cooldown", async () => {
    ProviderManager.setCooldown("alpha_vantage", 300000); // 5 min cooldown

    Twelve.fetchPrice.mockResolvedValue({
      provider: "twelvedata",
      price: 150.25,
    });

    const result = await ProviderManager.getPrice("AAPL");
    expect(Alpha.fetchPrice).not.toHaveBeenCalled();
    expect(Twelve.fetchPrice).toHaveBeenCalledWith("AAPL");
  });

  test("getHistorical returns array from first available provider", async () => {
    Alpha.fetchHistorical.mockResolvedValue([
      {
        symbol: "AAPL",
        date: "2025-12-03",
        open: 150,
        high: 151,
        low: 149,
        close: 150.5,
        volume: 1000000,
        provider: "alpha_vantage",
      },
    ]);

    const result = await ProviderManager.getHistorical("AAPL");
    expect(result.provider).toBe("alpha_vantage");
    expect(result.prices).toHaveLength(1);
    expect(result.prices[0].close).toBe(150.5);
  });

  test("getHistorical falls back on rate limit", async () => {
    const error = new Error("Rate limit");
    error.type = "RATE_LIMIT";
    Alpha.fetchHistorical.mockRejectedValue(error);

    Twelve.fetchHistorical.mockResolvedValue([
      {
        symbol: "AAPL",
        date: "2025-12-03",
        open: 150,
        high: 151,
        low: 149,
        close: 150.5,
        volume: 1000000,
        provider: "twelvedata",
      },
    ]);

    const result = await ProviderManager.getHistorical("AAPL");
    expect(result.provider).toBe("twelvedata");
  });

  test("getPrice throws when all providers fail", async () => {
    const error = new Error("Network error");
    error.type = "UNAVAILABLE";
    Alpha.fetchPrice.mockRejectedValue(error);
    Twelve.fetchPrice.mockRejectedValue(error);

    await expect(ProviderManager.getPrice("AAPL")).rejects.toThrow(
      "All providers failed"
    );
  });
});
