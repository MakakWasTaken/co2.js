"use strict";

import getHar from "./har-fetcher.js";

describe("har-fetcher", () => {
  describe("gerHar", () => {
    it("test ability to fetch har file from url", async () => {
      const response = await getHar("https://www.thegreenwebfoundation.org");
      expect(response.log.version).toBe("1.2");
    });
  });
});
