import { CO2EstimateTraceResultPerByte, CO2EstimateTraceResultPerVisit } from "./src/co2";

// Take the imported javascript functions and make them available to the
// typescript compiler.

declare module '@tgwf/co2' {
  interface CO2Config {
    model: '1byte' | 'swd';
    results: 'segments' | undefined
  }

  interface Options {
    gridItensity?: {
      device?: {
        value: number;
        country?: string
      } | number,
      dataCenter?: {
        value: number;
        country?: string
      } | number,
      network?: {
        value: number;
        country?: string
      } | number,
    }
    dataReloadRatio?: number;
    firstVisitPercentage?: number
    returnVisitPercentage?: number
  }

  export class co2 {
    constructor(config: CO2Config);
    
    perByte: (bytes: number, green?: boolean) => number;
    perVisit: (bytes: number, green?: boolean) => number;
    perByteTrace: (bytes: number, green?: boolean, options?: Object) => CO2EstimateTraceResultPerByte;
    perVisitTrace: (bytes: number, green?: boolean, options?: Object) => CO2EstimateTraceResultPerVisit;

    perDomain: (pageXray: any, greenDomains: string[]) => {
      domain: string;
      co2: number;
      transferSize: any;
    }[];
    perPage: (pageXray: any, greenDomains: string[]) => number
    perContentType: (pageXray: any, greenDomains: string[]) => {
      type: string;
      co2: any;
      transferSize: any;
    }[]
    dirtiestResources: (pageXray: any, greenDomains: string[]) => {
      url: any;
      co2: number;
      transferSize: any;
    }[]
    perParty: (pageXray: any, greenDomains: string[]) => {
      firstParty: number;
      thirdParty: number;
    }
  }

  export interface hosting {
    check (domain: string): Promise<boolean>
    check (domains: string[]): Promise<string[]>
  }

  interface Intensity {
    data: {
      [key: string]: number
    }
    type: 'marginal' | 'average'
  }

  export const averageIntensity: Intensity
  export const marginalIntensity: Intensity
}
