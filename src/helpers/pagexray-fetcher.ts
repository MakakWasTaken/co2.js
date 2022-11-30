import { getHar } from "./har-fetcher";
// @ts-ignore
import pagexray from "pagexray";

/**
 * Takes an url as argument and returns a promise that resolves to a PageXray object
 * @param {string} url The url to fetch
 * @returns {Promise<PageXray>} A promise that resolves to a PageXray object
 */
export const getPageXray = async (url: string) => {
  // Get har
  const har = await getHar(url);
  // Get pageXray
  const pages = pagexray.convert(har);
  const pageXrayRun = pages[0];
  return pageXrayRun;
};
export default getPageXray;
