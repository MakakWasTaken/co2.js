import { fetchHar } from "./har-fetcher";
// @ts-ignore
import pagexray from "pagexray";
import { PageXRay } from "../co2";
import { PuppeteerLaunchOptions } from "puppeteer";

/**
 * Takes an url as argument and returns a promise that resolves to a PageXray object
 * @param {string} url The url to fetch
 * @returns {Promise<PageXray>} A promise that resolves to a PageXray object
 */
export const getPageXray = async (
  url: string,
  options?: PuppeteerLaunchOptions
): Promise<PageXRay | undefined> => {
  // Get har
  const har = await fetchHar(url, options);

  if (!har) {
    throw new Error("Unable to get har file");
  }
  // Get pageXray
  const pages = pagexray.convert(har);
  if (pages.length > 0) {
    const pageXrayRun = pages[0];
    return pageXrayRun;
  }
  return undefined;
};
export default getPageXray;
