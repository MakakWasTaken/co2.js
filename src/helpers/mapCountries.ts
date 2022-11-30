/**
 * Generates an array of objects from the countries.csv file.
 * @returns {array} - Returns an array of objects.
 */

import fs from "fs";
import parseCSVRow from "../../src/helpers/parseCSVRow";
const countries = fs.readFileSync("data/fixtures/countries.csv");

const countryArray: { [key: string]: string }[] = [];

const countriesRows = countries.toString().split("\n");

const countryHeaders = parseCSVRow(countriesRows[0]);

const mapCountries = () => {
  for (let i = 1; i < countriesRows.length; i++) {
    const countryObject: { [key: string]: string } = {};
    const currentArrayString = countriesRows[i];

    if (
      currentArrayString.length === 0 ||
      currentArrayString === countriesRows[0]
    )
      continue;

    const jsonProperties = parseCSVRow(currentArrayString);

    for (const column in countryHeaders) {
      if (!column || column === "") continue;
      countryObject[countryHeaders[column].replace("\r", "")] = jsonProperties[
        column
      ].replace("\r", "");
    }

    countryArray.push(countryObject);
  }

  return countryArray;
};

export default mapCountries;
