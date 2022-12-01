"use strict";

import getHar from "../../src/helpers/har-fetcher";

describe("har-fetcher", () => {
  describe("gerHar", () => {
    it("test ability to fetch har file from url", async () => {
      const response = await getHar("https://www.thegreenwebfoundation.org");
      expect(response.log.version).toBe("1.2");
    });
  });
});
