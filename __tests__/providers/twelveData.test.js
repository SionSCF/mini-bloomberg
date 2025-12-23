const axios = require("axios");
jest.mock("axios");

describe("TwelveData Provider", () => {
  const Provider = require("../../src/services/providers/twelveData.provider");

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.TWELVE_DATA_API_KEY = "test-key";
    process.env.PRICE_API_TIMEOUT_MS = "5000";
  });

  test("fetchPrice returns price on success", async () => {
    axios.get.mockResolvedValue({
      status: 200,
      data: {
        symbol: "AAPL",
        price: "150.25",
        currency: "USD",
      },
    });

    const result = await Provider.fetchPrice("AAPL");
    expect(result.price).toBe(150.25);
    expect(result.provider).toBe("twelvedata");
  });

  test("fetchPrice throws RATE_LIMIT on rate limit message", async () => {
    axios.get.mockResolvedValue({
      status: 200,
      data: {
        status: "error",
        message:
          "You have reach the limit of your plan. Please visit https://twelvedata.com/pricing",
      },
    });

    await expect(Provider.fetchPrice("AAPL")).rejects.toThrow(
      "You have reach the limit of your plan. Please visit https://twelvedata.com/pricing"
    );
  });

  test("fetchPrice throws on HTTP 429", async () => {
    axios.get.mockRejectedValue({
      response: { status: 429, data: {} },
    });

    await expect(Provider.fetchPrice("AAPL")).rejects.toThrow("429");
  });

  test("fetchHistorical returns array of daily records", async () => {
    axios.get.mockResolvedValue({
      status: 200,
      data: {
        symbol: "AAPL",
        values: [
          {
            datetime: "2025-12-03",
            open: "150.0",
            high: "151.0",
            low: "149.0",
            close: "150.5",
            volume: "1000000",
          },
          {
            datetime: "2025-12-02",
            open: "149.0",
            high: "150.0",
            low: "148.0",
            close: "149.5",
            volume: "900000",
          },
        ],
      },
    });

    const result = await Provider.fetchHistorical("AAPL");
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(2);
    expect(result[0].date).toBe("2025-12-03");
    expect(result[0].close).toBe(150.5);
  });

  test("fetchPrice throws on network error", async () => {
    axios.get.mockRejectedValue(new Error("ECONNREFUSED"));

    await expect(Provider.fetchPrice("AAPL")).rejects.toThrow("ECONNREFUSED");
  });
});
