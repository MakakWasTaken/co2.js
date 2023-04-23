import puppeteer from "puppeteer";
import PuppeteerHar from "./puppeteer-har";

/**
 * Fetches a URL and returns a HAR object.
 * @param {string} url The url to generate a har for.
 */
const fetchHar = async (url: string): Promise<any | undefined> => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  const har = new PuppeteerHar(page);
  await har.start();

  await page.goto(url);

  const response = await har.stop();
  await browser.close();
  return response;
};

export { fetchHar };
export default fetchHar;
