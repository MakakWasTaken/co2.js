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
export default PageXRay;
