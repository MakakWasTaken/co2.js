import captureHar from "capture-har";

/**
 * Fetches a URL and returns a HAR object.
 * @param {string} url The url to generate a har for.
 */
const getHar = async (url) => {
  const response = await captureHar(
    {
      url,
    },
    { withContent: false }
  );
  return response;
};

export { getHar };
export default getHar;
