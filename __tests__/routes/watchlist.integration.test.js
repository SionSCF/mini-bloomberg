const request = require("supertest");
const app = require("../../src/app");

// Mock the services used by the route to avoid network/DB calls
jest.mock("../../src/services/price.service");
jest.mock("../../src/models/watchlist.model");

const { saveHistoricalData } = require("../../src/services/price.service");
const { addOrActivateSymbol } = require("../../src/models/watchlist.model");

describe("POST /api/watchlist (integration)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("adds symbol to watchlist and returns savedDays", async () => {
    // saveHistoricalData resolves with an array of daily price objects
    saveHistoricalData.mockResolvedValue([
      { date: "2025-12-03", close: 150.5 },
      { date: "2025-12-02", close: 149.0 },
    ]);
    addOrActivateSymbol.mockResolvedValue([
      { symbol: "BBRI.JK", active: true },
    ]);

    const res = await request(app)
      .post("/api/watchlist")
      .send({ symbol: "BBRI.JK" })
      .set("Accept", "application/json");

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("symbol", "BBRI.JK");
    expect(res.body).toHaveProperty("savedDays", 2);
    expect(saveHistoricalData).toHaveBeenCalledWith("BBRI.JK");
    expect(addOrActivateSymbol).toHaveBeenCalledWith("BBRI.JK");
  });

  test("returns 400 for invalid payload", async () => {
    const res = await request(app)
      .post("/api/watchlist")
      .send({})
      .set("Accept", "application/json");

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
  });
});
