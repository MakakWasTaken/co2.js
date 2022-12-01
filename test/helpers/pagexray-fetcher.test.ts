"use strict";

import { getPageXray } from "../../src/helpers/pagexray-fetcher";

describe("har-fetcher", () => {
  describe("gerHar", () => {
    it("test ability to fetch har file from url", async () => {
      const response = await getPageXray(
        "https://www.thegreenwebfoundation.org"
      );
      expect(response).toBeDefined();
    });
  });
});
