import axios from "axios";
import { AxiosHarTracker, HarFile } from "./axios-har";

const axiosTracker = new AxiosHarTracker(axios);

/**
 * Fetches a URL and returns a HAR object.
 * @param {string} url The url to generate a har for.
 */
const fetchHar = async (url: string): Promise<HarFile | undefined> => {
  await axios.get(url);
  return axiosTracker.getGeneratedHar();
};

export { fetchHar };
export default fetchHar;
