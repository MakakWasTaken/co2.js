import { LaunchOptions, chromium } from "playwright";
import { PlaywrightHar } from "playwright-har";

/**
 * Fetches a URL and returns a HAR object.
 * @param {string} url The url to generate a har for.
 */
const fetchHar = async (
  url: string,
  options?: LaunchOptions
): Promise<any | undefined> => {
  const browser = await chromium.launch(options);
  const context = await browser.newContext();
  const page = await context.newPage();

  const playwrightHar = new PlaywrightHar(page);
  await playwrightHar.start();

  await page.goto(url);

  const response = await playwrightHar.stop();
  await browser.close();
  return response;
};

export { fetchHar };
export default fetchHar;
