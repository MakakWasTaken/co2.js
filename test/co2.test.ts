"use strict";

import fs from "fs";
import path from "path";

// @ts-ignore
import pagexray from "pagexray";

import CO2 from "../src/co2";
import { averageIntensity, marginalIntensity } from "../src";
import { MILLION, ONEBYTE, SWD } from "./test-constants";

describe("co2", () => {
  let har: any;
  let co2: CO2;

  describe("1 byte model", () => {
    beforeEach(() => {
      co2 = new CO2({ model: "1byte" });
      har = JSON.parse(
        fs.readFileSync(
          path.resolve(__dirname, "../data/fixtures/tgwf.har"),
          "utf8"
        )
      );
    });

    describe("perByte", () => {
      it("returns a CO2 number for data transfer using 'grey' power", () => {
        expect(co2.perByte(MILLION).total.toPrecision(5)).toBe(
          ONEBYTE.MILLION_GREY.toPrecision(5)
        );
      });

      it("returns a lower CO2 number for data transfer from domains using entirely 'green' power", () => {
        expect(co2.perByte(MILLION).total.toPrecision(5)).toBe(
          ONEBYTE.MILLION_GREY.toPrecision(5)
        );
        expect(co2.perByte(MILLION, true).total.toPrecision(5)).toBe(
          ONEBYTE.MILLION_GREEN.toPrecision(5)
        );
      });
    });

    describe("perPage", () => {
      it("returns CO2 for total transfer for page", () => {
        const pages = pagexray.convert(har);
        const pageXrayRun = pages[0];

        expect(co2.perPage(pageXrayRun).toPrecision(5)).toBe(
          ONEBYTE.TGWF_GREY_VALUE.toPrecision(5)
        );
      });
      it("returns lower CO2 for page served from green site", () => {
        const pages = pagexray.convert(har);
        const pageXrayRun = pages[0];
        const green = [
          "www.thegreenwebfoundation.org",
          "fonts.googleapis.com",
          "ajax.googleapis.com",
          "assets.digitalclimatestrike.net",
          "cdnjs.cloudflare.com",
          "graphite.thegreenwebfoundation.org",
          "analytics.thegreenwebfoundation.org",
          "fonts.gstatic.com",
          "api.thegreenwebfoundation.org",
        ];
        expect(co2.perPage(pageXrayRun, green)).toBeLessThan(
          ONEBYTE.TGWF_GREY_VALUE
        );
      });
      it("returns a lower CO2 number where *some* domains use green power", () => {
        const pages = pagexray.convert(har);
        const pageXrayRun = pages[0];
        // green can be true, or a array containing entries
        const green = [
          "www.thegreenwebfoundation.org",
          "fonts.googleapis.com",
          "ajax.googleapis.com",
          "assets.digitalclimatestrike.net",
          "cdnjs.cloudflare.com",
          "graphite.thegreenwebfoundation.org",
          "analytics.thegreenwebfoundation.org",
          "fonts.gstatic.com",
          "api.thegreenwebfoundation.org",
        ];
        expect(co2.perPage(pageXrayRun, green).toPrecision(5)).toBe(
          ONEBYTE.TGWF_MIXED_VALUE.toPrecision(5)
        );
      });
    });
    describe("perDomain", () => {
      it("shows object listing Co2 for each domain", () => {
        const pages = pagexray.convert(har);
        const pageXrayRun = pages[0];
        const res = co2.perDomain(pageXrayRun);

        const domains = [
          "thegreenwebfoundation.org",
          "www.thegreenwebfoundation.org",
          "maxcdn.bootstrapcdn.com",
          "fonts.googleapis.com",
          "ajax.googleapis.com",
          "assets.digitalclimatestrike.net",
          "cdnjs.cloudflare.com",
          "graphite.thegreenwebfoundation.org",
          "analytics.thegreenwebfoundation.org",
          "fonts.gstatic.com",
          "api.thegreenwebfoundation.org",
        ];

        for (const obj of res) {
          expect(domains.indexOf(obj.domain)).toBeGreaterThan(-1);
          expect(typeof obj.co2).toBe("number");
        }
      });
      it("shows lower Co2 for green domains", () => {
        const pages = pagexray.convert(har);
        const pageXrayRun = pages[0];

        const greenDomains = [
          "www.thegreenwebfoundation.org",
          "fonts.googleapis.com",
          "ajax.googleapis.com",
          "maxcdn.bootstrapcdn.com",
          "assets.digitalclimatestrike.net",
          "cdnjs.cloudflare.com",
          "graphite.thegreenwebfoundation.org",
          "analytics.thegreenwebfoundation.org",
          "fonts.gstatic.com",
          "api.thegreenwebfoundation.org",
        ];
        const res = co2.perDomain(pageXrayRun);
        const resWithGreen = co2.perDomain(pageXrayRun, greenDomains);

        for (const obj of res) {
          expect(typeof obj.co2).toBe("number");
        }
        for (let i = 0; i < greenDomains.length; i++) {
          expect(resWithGreen[i].co2).toBeLessThan(res[i].co2);
        }
      });
    });
  });

  describe("Sustainable Web Design model as simple option", () => {
    // the SWD model should have slightly higher values as
    // we include more of the system in calculations for the
    // same levels of data transfer

    // We're not passing in a model parameter here to check that SWD is used by default
    beforeAll(() => {
      co2 = new CO2();
      har = JSON.parse(
        fs.readFileSync(
          path.resolve(__dirname, "../data/fixtures/tgwf.har"),
          "utf8"
        )
      );
    });

    describe("perByte", () => {
      it("returns a CO2 number for data transfer", () => {
        co2.perByte(MILLION);
        expect(co2.perByte(MILLION).total.toPrecision(5)).toBe(
          SWD.MILLION_GREY.toPrecision(5)
        );
      });

      it("returns a lower CO2 number for data transfer from domains using entirely 'green' power", () => {
        expect(co2.perByte(MILLION, false).total.toPrecision(5)).toBe(
          SWD.MILLION_GREY.toPrecision(5)
        );

        expect(co2.perByte(MILLION, true).total.toPrecision(5)).toBe(
          SWD.MILLION_GREEN.toPrecision(5)
        );
      });
    });

    describe("perVisit", () => {
      it("returns a CO2 number for data transfer per visit with caching assumptions from the Sustainable Web Design model", () => {
        co2.perVisit(MILLION);
        expect(co2.perVisit(MILLION).toPrecision(5)).toBe(
          SWD.MILLION_PERVISIT_GREY.toPrecision(5)
        );
      });

      it("returns a lower CO2 number for data transfer from domains using entirely 'green' power", () => {
        expect(co2.perVisit(MILLION, false).toPrecision(5)).toBe(
          SWD.MILLION_PERVISIT_GREY.toPrecision(5)
        );

        expect(co2.perVisit(MILLION, true).toPrecision(5)).toBe(
          SWD.MILLION_PERVISIT_GREEN.toPrecision(5)
        );
      });
    });

    describe("perPage", () => {
      it("returns CO2 for total transfer for page", () => {
        const pages = pagexray.convert(har);
        const pageXrayRun = pages[0];

        expect(co2.perPage(pageXrayRun).toPrecision(5)).toBe(
          SWD.TGWF_GREY_VALUE.toPrecision(5)
        );
      });
      it("returns lower CO2 for page served from green site", () => {
        const pages = pagexray.convert(har);
        const pageXrayRun = pages[0];
        const green = [
          "www.thegreenwebfoundation.org",
          "fonts.googleapis.com",
          "ajax.googleapis.com",
          "assets.digitalclimatestrike.net",
          "cdnjs.cloudflare.com",
          "graphite.thegreenwebfoundation.org",
          "analytics.thegreenwebfoundation.org",
          "fonts.gstatic.com",
          "api.thegreenwebfoundation.org",
        ];
        expect(co2.perPage(pageXrayRun, green)).toBeLessThan(
          SWD.TGWF_GREY_VALUE
        );
      });
      it("returns a lower CO2 number where *some* domains use green power", () => {
        const pages = pagexray.convert(har);
        const pageXrayRun = pages[0];
        // green can be true, or a array containing entries
        const green = [
          "www.thegreenwebfoundation.org",
          "fonts.googleapis.com",
          "ajax.googleapis.com",
          "assets.digitalclimatestrike.net",
          "cdnjs.cloudflare.com",
          "graphite.thegreenwebfoundation.org",
          "analytics.thegreenwebfoundation.org",
          "fonts.gstatic.com",
          "api.thegreenwebfoundation.org",
        ];
        expect(co2.perPage(pageXrayRun, green).toPrecision(5)).toBe(
          SWD.TGWF_MIXED_VALUE.toPrecision(5)
        );
      });
    });
    describe("perDomain", () => {
      it("shows object listing Co2 for each domain", () => {
        const pages = pagexray.convert(har);
        const pageXrayRun = pages[0];
        const res = co2.perDomain(pageXrayRun);

        const domains = [
          "thegreenwebfoundation.org",
          "www.thegreenwebfoundation.org",
          "maxcdn.bootstrapcdn.com",
          "fonts.googleapis.com",
          "ajax.googleapis.com",
          "assets.digitalclimatestrike.net",
          "cdnjs.cloudflare.com",
          "graphite.thegreenwebfoundation.org",
          "analytics.thegreenwebfoundation.org",
          "fonts.gstatic.com",
          "api.thegreenwebfoundation.org",
        ];

        for (const obj of res) {
          expect(domains.indexOf(obj.domain)).toBeGreaterThan(-1);
          expect(typeof obj.co2).toBe("number");
        }
      });
      it("shows lower Co2 for green domains", () => {
        const pages = pagexray.convert(har);
        const pageXrayRun = pages[0];

        const greenDomains = [
          "www.thegreenwebfoundation.org",
          "fonts.googleapis.com",
          "ajax.googleapis.com",
          "maxcdn.bootstrapcdn.com",
          "assets.digitalclimatestrike.net",
          "cdnjs.cloudflare.com",
          "graphite.thegreenwebfoundation.org",
          "analytics.thegreenwebfoundation.org",
          "fonts.gstatic.com",
          "api.thegreenwebfoundation.org",
        ];
        const res = co2.perDomain(pageXrayRun);
        const resWithGreen = co2.perDomain(pageXrayRun, greenDomains);

        for (const obj of res) {
          expect(typeof obj.co2).toBe("number");
        }
        for (let i = 0; i < greenDomains.length; i++) {
          expect(resWithGreen[i].co2).toBeLessThan(res[i].co2);
        }
      });
    });
  });

  describe("Error checking", () => {
    // Test for error if incorrect model is passed
    it("throws an error if model is not valid", () => {
      expect(() => (co2 = new CO2({ model: "1direction" }))).toThrowError(
        `"1direction" is not a valid model. Please use "1byte" for the OneByte model, and "swd" for the Sustainable Web Design model.\nSee https://developers.thegreenwebfoundation.org/co2js/models/ to learn more about the models available in CO2.js.`
      );
    });

    // Test that an error is thrown when using the OneByte model with the perVisit method.
    it("throws an error if perVisit method is not supported by model", () => {
      expect(() => {
        co2 = new CO2({ model: "1byte" });
        co2.perVisit(10);
      }).toThrowError(
        `The perVisit() method is not supported in the model you are using. Try using perByte() instead.\nSee https://developers.thegreenwebfoundation.org/co2js/methods/ to learn more about the methods available in CO2.js.`
      );
    });
  });

  // Test that grid intensity data can be imported and used
  describe("Importing grid intensity", () => {
    describe("average intensity", () => {
      it("imports average intensity data", () => {
        expect(averageIntensity).toHaveProperty("type", "average");
      });
    });

    describe("marginal intensity", () => {
      it("imports average intensity data", () => {
        expect(marginalIntensity).toHaveProperty("type", "marginal");
      });
    });
  });
});
