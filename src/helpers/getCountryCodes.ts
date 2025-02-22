/**
 * This function maps a given country name to the ISO country codes.
 * @param {string} field - The field to search on. This can be "ember_country_name" or "unfccc_country_name".
 * @param {string} input - The input value to search for.
 * @returns {object} - Returns an object with the country code (2-digit and 3-digit).
 * @example
 * getCountryCodes('ember_country_name', 'united states of america')
 * returns { country_code_iso_2: 'US', country_code_iso_3: 'USA' }
 */

import mapCountries from "./mapCountries";
const countries = mapCountries();

// Search the countries array based on an input value. We run the search on the "country_name" property.
// If a match is found, we return the country code (2-digit and 3-digit).
const getCountryCodes = (field: string, input: string) => {
  const mappedCountry = countries.find((country) => {
    if (country[field]?.toLowerCase() === input) {
      const { country_code_iso_2, country_code_iso_3 } = country;
      return { country_code_iso_2, country_code_iso_3 };
    }
  });
  if (mappedCountry) {
    const { country_code_iso_2, country_code_iso_3 } = mappedCountry;
    return {
      country_code_iso_2: country_code_iso_2.toUpperCase(),
      country_code_iso_3: country_code_iso_3.toUpperCase(),
    };
  }
};

export default getCountryCodes;
