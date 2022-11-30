import PageXRay from "./pagexray";

export namespace co2 {
  interface CO2Options {
    model: string;
  }

  interface CO2Result {
    co2: number;
    transferSize: number;
  }

  class CO2 {
    model: any;
    constructor(options: CO2Options);

    perByte(bytes: number, green: boolean): number;
    perVisit(bytes: number, green: boolean): number;
    perDomain(
      pageXray: PageXRay,
      greenDomains: string[]
    ): CO2Result &
      {
        domain: string;
      }[];
    perPage(pageXray: PageXRay, green: boolean): number;
    perContentType(
      pageXray: PageXRay,
      greenDomains: boolean
    ): CO2Result &
      {
        type: string;
      }[];
    dirtiestResources(
      pageXray: PageXRay,
      greenDomains: string[]
    ): CO2Result &
      {
        url: string;
      }[];
    perParty(
      pageXRay: PageXRay,
      greenDomains: string[]
    ): {
      firstParty: number;
      thirdParty: number;
    };
  }
}

export namespace hosting {
  function check(domain: string | string[], db: string): boolean | string[];
}

export namespace averageIntensity {
  const data: { [key: string]: string };
  const type: string;
  const year: string;
}

export namespace marginalIntensity {
  const data: { [key: string]: string };
  const type: string;
  const year: string;
}

export function getPageXray(url: string): Promise<PageXRay>;
