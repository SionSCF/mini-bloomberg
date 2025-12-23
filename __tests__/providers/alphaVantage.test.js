const axios = require("axios");
jest.mock("axios");

describe("AlphaVantage Provider", () => {
  const Provider = require("../../src/services/providers/alphaVantage.provider");

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.ALPHAVANTAGE_API_KEY = "test-key";
    process.env.PRICE_API_TIMEOUT_MS = "5000";
  });

  test("fetchPrice returns price on success", async () => {
    axios.get.mockResolvedValue({
      status: 200,
      data: {
        "Global Quote": {
          "05. price": "150.25",
          "02. symbol": "AAPL",
        },
      },
    });

    const result = await Provider.fetchPrice("AAPL");
    expect(result.price).toBe(150.25);
    expect(result.provider).toBe("alpha_vantage");
  });

  test("fetchPrice throws RATE_LIMIT on Note field", async () => {
    axios.get.mockResolvedValue({
      status: 200,
      data: {
        Note: "RATE_LIMIT",
      },
    });

    await expect(Provider.fetchPrice("AAPL")).rejects.toThrow("RATE_LIMIT");
  });

  test("fetchPrice throws on HTTP 429", async () => {
    axios.get.mockRejectedValue({
      response: { status: 429, data: {} },
    });

    await expect(Provider.fetchPrice("AAPL")).rejects.toThrow("HTTP 429");
  });

  test("fetchHistorical returns array of daily records", async () => {
    axios.get.mockResolvedValue({
      status: 200,
      data: {
        "Time Series (Daily)": {
          "2025-12-03": {
            "1. open": "150.0",
            "2. high": "151.0",
            "3. low": "149.0",
            "4. close": "150.5",
            "5. volume": "1000000",
          },
          "2025-12-02": {
            "1. open": "149.0",
            "2. high": "150.0",
            "3. low": "148.0",
            "4. close": "149.5",
            "5. volume": "900000",
          },
        },
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
