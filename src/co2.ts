"use strict";

import OneByte from "./1byte";
import { GLOBAL_GRID_INTENSITY, RENEWABLES_GRID_INTENSITY } from "./constants";
import SustainableWebDesign from "./sustainable-web-design";

export interface PageXRay {
  domains: {
    [key: string]: {
      transferSize: number;
      contentSize: number;
      headerSize: number;
      requests: number;
      timings: {
        blocked: number;
        dns: number;
        connect: number;
        send: number;
        wait: number;
        receive: number;
      };
    };
  };
  assets: any[];
  firstPartyRegEx: RegExp;
}

export interface CO2Options {
  model: string;
  results?: string;
}

interface CO2Result {
  co2: number;
  transferSize: number;
}

class CO2 {
  model: SustainableWebDesign | OneByte;

  constructor(options?: CO2Options) {
    // Using optional chaining allows an empty object to be passed
    // in without breaking the code.
    if (!options?.model || options?.model === "swd") {
      this.model = new SustainableWebDesign();
    } else if (options?.model === "1byte") {
      this.model = new OneByte();
    } else {
      throw new Error(
        `"${options.model}" is not a valid model. Please use "1byte" for the OneByte model, and "swd" for the Sustainable Web Design model.\nSee https://developers.thegreenwebfoundation.org/co2js/models/ to learn more about the models available in CO2.js.`
      );
    }

    if (options?.results === "segment") {
      this.model.results = {
        segment: true,
      };
    } else {
      this.model.results = {
        segment: false,
      };
    }
  }

  /**
   * Accept a figure in bytes for data transfer, and a boolean for whether
   * the domain shows as 'green', and return a CO2 figure for energy used to shift the corresponding
   * the data transfer.
   *
   * @param {number} bytes
   * @param {boolean} green
   * @return {number} the amount of CO2 in grammes
   */
  perByte(
    bytes: number,
    green?: boolean
  ): {
    [key: string]: number;
    total: number;
  } {
    if (this.model instanceof OneByte) {
      return this.model.perByte(bytes, green);
    } else {
      return this.model.perByte(bytes, green, this.model.results?.segment);
    }
  }

  /**
   * Accept a figure in bytes for data transfer, and a boolean for whether
   * the domain shows as 'green', and return a CO2 figure for energy used to shift the corresponding
   * the data transfer.
   *
   * @param {number} bytes
   * @param {boolean} green
   * @return {number} the amount of CO2 in grammes
   */
  perVisit(bytes: number, green: boolean = false): number {
    if (this.model instanceof SustainableWebDesign) {
      return this.model.perVisit(bytes, green, this.model.results?.segment)
        .total;
    } else {
      throw new Error(
        `The perVisit() method is not supported in the model you are using. Try using perByte() instead.\nSee https://developers.thegreenwebfoundation.org/co2js/methods/ to learn more about the methods available in CO2.js.`
      );
    }
  }

  perDomain(
    pageXray: PageXRay,
    greenDomains: string[] = []
  ): { domain: string; co2: number; transferSize: number }[] {
    const co2PerDomain: {
      domain: string;
      co2: number;
      transferSize: number;
    }[] = [];
    for (const domain of Object.keys(pageXray.domains)) {
      let co2;
      if (greenDomains && greenDomains.indexOf(domain) > -1) {
        co2 = this.perByte(pageXray.domains[domain].transferSize, true);
      } else {
        co2 = this.perByte(pageXray.domains[domain].transferSize);
      }
      co2PerDomain.push({
        domain,
        co2: co2.total,
        transferSize: pageXray.domains[domain].transferSize,
      });
    }
    co2PerDomain.sort((a, b) => b.co2 - a.co2);

    return co2PerDomain;
  }

  perPage(pageXray: PageXRay, greenDomains: string[] = []): number {
    // Accept an xray object, and if we receive a boolean as the second
    // argument, we assume every request we make is sent to a server
    // running on renwewable power.

    // if we receive an array of domains, return a number accounting the
    // reduced CO2 from green hosted domains

    const domainCO2 = this.perDomain(pageXray, greenDomains);
    let totalCO2 = 0;
    for (const domain of domainCO2) {
      totalCO2 += domain.co2;
    }
    return totalCO2;
  }

  perContentType(
    pageXray: PageXRay,
    greenDomains: string[] = []
  ): { type: string; co2: number; transferSize: number }[] {
    const co2PerContentType: { [key: string]: CO2Result & { type?: string } } =
      {};
    for (const asset of pageXray.assets) {
      const domain = new URL(asset.url).hostname;
      const transferSize = asset.transferSize;
      const co2ForTransfer = this.perByte(
        transferSize,
        greenDomains && greenDomains.indexOf(domain) > -1
      );
      const contentType = asset.type;
      if (!co2PerContentType[contentType]) {
        co2PerContentType[contentType] = { co2: 0, transferSize: 0 };
      }
      co2PerContentType[contentType].co2 += co2ForTransfer.total;
      co2PerContentType[contentType].transferSize += transferSize;
    }
    // restructure and sort
    const all: { type: string; co2: number; transferSize: number }[] = [];
    for (const type of Object.keys(co2PerContentType)) {
      all.push({
        type,
        co2: co2PerContentType[type].co2,
        transferSize: co2PerContentType[type].transferSize,
      });
    }
    all.sort((a, b) => b.co2 - a.co2);
    return all;
  }

  dirtiestResources(
    pageXray: PageXRay,
    greenDomains: string[] = []
  ): {
    url: string;
    co2: number;
    transferSize: number;
  }[] {
    const allAssets: {
      url: string;
      co2: number;
      transferSize: number;
    }[] = [];
    for (const asset of pageXray.assets) {
      const domain = new URL(asset.url).hostname;
      const transferSize = asset.transferSize;
      const co2ForTransfer = this.perByte(
        transferSize,
        greenDomains && greenDomains.indexOf(domain) > -1
      );
      allAssets.push({
        url: asset.url,
        co2: co2ForTransfer.total,
        transferSize,
      });
    }
    allAssets.sort((a, b) => b.co2 - a.co2);

    return allAssets.slice(0, allAssets.length > 10 ? 10 : allAssets.length);
  }

  perParty(
    pageXray: PageXRay,
    greenDomains: string[] = []
  ): {
    firstParty: number;
    thirdParty: number;
  } {
    let firstParty = 0;
    let thirdParty = 0;
    // calculate co2 per first/third party
    const firstPartyRegEx = pageXray.firstPartyRegEx;
    for (const d of Object.keys(pageXray.domains)) {
      if (!d.match(firstPartyRegEx)) {
        thirdParty += this.perByte(
          pageXray.domains[d].transferSize,
          greenDomains && greenDomains.indexOf(d) > -1
        ).total;
      } else {
        firstParty += this.perByte(
          pageXray.domains[d].transferSize,
          greenDomains && greenDomains.indexOf(d) > -1
        ).total;
      }
    }
    return { firstParty, thirdParty };
  }
}

export { CO2 };
export default CO2;
