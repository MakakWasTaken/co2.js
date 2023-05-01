"use strict";

/**
 * Sustainable Web Design
 *
 * Updated calculations and figures from
 * https://sustainablewebdesign.org/calculating-digital-emissions/
 *
 */
import debugFactory from "debug";
const log = debugFactory("tgwf:sustainable-web-design");

import {
  fileSize,
  KWH_PER_GB,
  END_USER_DEVICE_ENERGY,
  NETWORK_ENERGY,
  DATACENTER_ENERGY,
  PRODUCTION_ENERGY,
  GLOBAL_GRID_INTENSITY,
  RENEWABLES_GRID_INTENSITY,
  FIRST_TIME_VIEWING_PERCENTAGE,
  PERCENTAGE_OF_DATA_LOADED_ON_SUBSEQUENT_LOAD,
} from "./constants";
import { formatNumber } from "./helpers";
import { data as averageIntensity } from "./data/average-intensities";

interface SustainableWebDesignOptions {
  test?: number;
  gridIntensity?: {
    device: {
      value: number;
      country?: keyof typeof averageIntensity;
    };
    network: {
      value: number;
      country?: keyof typeof averageIntensity;
    };
    dataCenter: {
      value: number;
      country?: keyof typeof averageIntensity;
    };
  };
  dataReloadRatio?: number;
  firstVisitPercentage?: number;
}

class SustainableWebDesign {
  options?: SustainableWebDesignOptions;
  results?: {
    segment: boolean;
  };

  constructor(options?: SustainableWebDesignOptions) {
    this.options = options;
  }

  /**
   * Accept a figure for bytes transferred and return an object representing
   * the share of the total enrgy use of the entire system, broken down
   * by each corresponding system component
   *
   * @param {number}  bytes - the data transferred in bytes
   * @return {object} Object containing the energy in kilowatt hours, keyed by system component
   */
  energyPerByteByComponent(bytes: number): {
    consumerDeviceEnergy: number;
    networkEnergy: number;
    productionEnergy: number;
    dataCenterEnergy: number;
  } {
    const transferedBytesToGb = bytes / fileSize.GIGABYTE;
    const energyUsage = transferedBytesToGb * KWH_PER_GB;

    // return the total energy, with breakdown by component
    return {
      consumerDeviceEnergy: energyUsage * END_USER_DEVICE_ENERGY,
      networkEnergy: energyUsage * NETWORK_ENERGY,
      productionEnergy: energyUsage * PRODUCTION_ENERGY,
      dataCenterEnergy: energyUsage * DATACENTER_ENERGY,
    };
  }
  /**
   * Accept an object keys by the different system components, and
   * return an object with the co2 figures key by the each component
   *
   * @param {object} energyByComponent - energy grouped by the four system components
   * @param {number} [carbonIntensity] - carbon intensity to apply to the datacentre values
   * @return {number} the total number in grams of CO2 equivalent emissions
   */
  co2byComponent(
    energyByComponent: {
      [key: string]: number;
    },
    carbonIntensity: boolean | number = GLOBAL_GRID_INTENSITY,
    options: SustainableWebDesignOptions = {}
  ): {
    [key: string]: number;
  } {
    let deviceCarbonIntensity = GLOBAL_GRID_INTENSITY;
    let networkCarbonIntensity = GLOBAL_GRID_INTENSITY;
    let dataCenterCarbonIntensity = GLOBAL_GRID_INTENSITY;

    const globalEmissions = GLOBAL_GRID_INTENSITY;

    if (options?.gridIntensity) {
      const { device, network, dataCenter } = options.gridIntensity;

      // The carbon intensity value for the device country
      if (device?.value) {
        deviceCarbonIntensity = device.value;
      } else if (device?.country) {
        // If the user has set a country for the device, then we use the average intensity for that country
        deviceCarbonIntensity = Number.parseFloat(
          averageIntensity[device.country]
        );
      }

      // The carbon intensity value for the network country
      if (network?.value) {
        networkCarbonIntensity = network.value;
      } else if (network?.country) {
        // If the user has set a country for the network, then we use the average intensity for that country
        networkCarbonIntensity = Number.parseFloat(
          averageIntensity[network.country]
        );
      }

      // If the user has set a carbon intensity value for the datacentre, then that overrides everything and is used
      if (dataCenter?.value) {
        dataCenterCarbonIntensity = dataCenter.value;
      } else if (dataCenter?.country) {
        // If the user has set a country for the dataCenter, then we use the average intensity for that country
        dataCenterCarbonIntensity = Number.parseFloat(
          averageIntensity[dataCenter.country]
        );
      }
    }

    // If the user passes in a TRUE value (green web host), it means that it is a renewable datacenter, then use the renewables intensity value
    if (carbonIntensity === true) {
      dataCenterCarbonIntensity = RENEWABLES_GRID_INTENSITY;
    }

    const returnCO2ByComponent: { [key: string]: number } = {};
    for (const [key, value] of Object.entries(energyByComponent)) {
      // we update the datacentre, as that's what we have information
      // about.
      if (key.startsWith("dataCenterEnergy")) {
        returnCO2ByComponent[key.replace("Energy", "CO2")] =
          value * dataCenterCarbonIntensity;
      } else if (key.startsWith("consumerDeviceEnergy")) {
        returnCO2ByComponent[key.replace("Energy", "CO2")] =
          value * deviceCarbonIntensity;
      } else if (key.startsWith("networkEnergy")) {
        returnCO2ByComponent[key.replace("Energy", "CO2")] =
          value * networkCarbonIntensity;
      } else {
        // Use the global intensity for the remaining segments
        returnCO2ByComponent[key.replace("Energy", "CO2")] =
          value * globalEmissions;
      }
    }

    return returnCO2ByComponent;
  }

  /**
   * Accept a figure for bytes transferred and return a single figure for CO2
   * emissions. Where information exists about the origin data is being
   * fetched from, a different carbon intensity figure
   * is applied for the datacentre share of the carbon intensity.
   *
   * @param bytes - the data transferred in bytes
   * @param [carbonIntensity] the carbon intensity for datacentre (average figures, not marginal ones)
   * @param [segmentResults] whether to return the results broken down by component
   * @return the total number in grams of CO2 equivalent emissions
   */
  perByte(
    bytes: number,
    carbonIntensity = false,
    segmentResults = false,
    options: SustainableWebDesignOptions = {}
  ): {
    [key: string]: number;
    total: number;
  } {
    const energyBycomponent = this.energyPerByteByComponent(bytes);

    // otherwise when faced with non numeric values throw an error
    if (typeof carbonIntensity !== "boolean") {
      throw new Error(
        `perByte expects a boolean for the carbon intensity value. Received: ${carbonIntensity}`
      );
    }

    const co2ValuesbyComponent = this.co2byComponent(
      energyBycomponent,
      carbonIntensity,
      options
    );

    // pull out our values…
    const co2Values = Object.values(co2ValuesbyComponent);
    const co2ValuesSum = co2Values.reduce(
      (prevValue, currentValue) => prevValue + currentValue
    );

    if (segmentResults) {
      return { ...co2ValuesbyComponent, total: co2ValuesSum };
    }

    return { total: co2ValuesSum };
  }

  /**
   * Accept a figure for bytes transferred and return a single figure for CO2
   * emissions. This method applies caching assumptions from the original Sustainable Web Design model.
   *
   * @param {number} bytes - the data transferred in bytes
   * @param {number} `carbonIntensity` the carbon intensity for datacentre (average figures, not marginal ones)
   * @return {number} the total number in grams of CO2 equivalent emissions
   */
  perVisit(
    bytes: number,
    carbonIntensity = false,
    segmentResults = false,
    options: SustainableWebDesignOptions = {}
  ) {
    const energyBycomponent = this.energyPerVisitByComponent(bytes);

    if (typeof carbonIntensity !== "boolean") {
      // otherwise when faced with non numeric values throw an error
      throw new Error(
        `perVisit expects a boolean for the carbon intensity value. Received: ${carbonIntensity}`
      );
    }

    const firstMap: { [key: string]: number } = {};
    const returnMap: { [key: string]: number } = {};

    Object.entries(energyBycomponent).forEach(([key, value]) => {
      firstMap[key] = value.first;
      returnMap[key] = value.return;
    });

    const firstCo2ValuesbyComponent = this.co2byComponent(
      firstMap,
      carbonIntensity,
      options
    );

    const returnCo2ValuesByComponent = this.co2byComponent(
      returnMap,
      carbonIntensity,
      options
    );

    // pull out our values…
    const co2Values = [
      ...Object.values(firstCo2ValuesbyComponent),
      ...Object.values(returnCo2ValuesByComponent),
    ];
    const co2ValuesSum = co2Values.reduce(
      (prevValue, currentValue) => prevValue + currentValue
    );

    if (segmentResults) {
      return {
        ...firstCo2ValuesbyComponent,
        ...returnCo2ValuesByComponent,
        total: co2ValuesSum,
      };
    }

    // so we can return their sum
    return { total: co2ValuesSum };
  }

  /**
   * Accept a figure for bytes transferred and return the number of kilowatt hours used
   * by the total system for this data transfer
   *
   * @param {number} bytes
   * @return {number} the number of kilowatt hours used
   */
  energyPerByte(bytes: number): number {
    const energyByComponent = this.energyPerByteByComponent(bytes);

    // pull out our values…
    const energyValues = Object.values(energyByComponent);

    // so we can return their sum
    return energyValues.reduce(
      (prevValue, currentValue) => prevValue + currentValue
    );
  }

  /**
   * Accept a figure for bytes transferred, and return an object containing figures
   * per system component, with the caching assumptions applied. This tries to account
   * for webpages being loaded from a cache by browsers, so if you had a thousand page views,
   * and tried to work out the energy per visit, the numbers would reflect the reduced amounts
   * of transfer.
   *
   * @param {number} bytes - the data transferred in bytes for loading a webpage
   * @param {number} firstView - what percentage of visits are loading this page for the first time
   * @param {number} returnView - what percentage of visits are loading this page for subsequent times
   * @param {number} dataReloadRatio - what percentage of a page is reloaded on each subsequent page view
   *
   * @return {object} Object containing the energy in kilowatt hours, keyed by system component
   */
  energyPerVisitByComponent(
    bytes: number,
    options: SustainableWebDesignOptions = {},
    firstView = FIRST_TIME_VIEWING_PERCENTAGE,
    dataReloadRatio = PERCENTAGE_OF_DATA_LOADED_ON_SUBSEQUENT_LOAD
  ): { [key: string]: { first: number; return: number } } {
    if (options.dataReloadRatio) {
      dataReloadRatio = options.dataReloadRatio;
    }

    if (options.firstVisitPercentage) {
      firstView = options.firstVisitPercentage;
    }

    const returnView = 1 - firstView;

    const energyBycomponent = this.energyPerByteByComponent(bytes);
    const cacheAdjustedSegmentEnergy: {
      [key: string]: { first: number; return: number };
    } = {};

    log({ energyBycomponent });
    // const energyValues = Object.values(energyBycomponent);

    // for this, we want
    for (const [key, value] of Object.entries(energyBycomponent)) {
      // represent the first load
      cacheAdjustedSegmentEnergy[key] = {
        first: value * firstView,
        return: value * returnView * dataReloadRatio,
      };
    }
    log({ cacheAdjustedSegmentEnergy });

    return cacheAdjustedSegmentEnergy;
  }

  /**
   * Accept a figure for bytes, and return the total figure for energy per visit
   *
   * @param {number} bytes
   * @return {number} the total energy use for the visit, after applying the caching assumptions
   */
  energyPerVisit(
    bytes: number,
    options: SustainableWebDesignOptions = {},
    firstView = FIRST_TIME_VIEWING_PERCENTAGE,
    dataReloadRatio = PERCENTAGE_OF_DATA_LOADED_ON_SUBSEQUENT_LOAD
  ): number {
    let firstVisits = 0;
    let subsequentVisits = 0;

    const energyBycomponent = this.energyPerVisitByComponent(
      bytes,
      options,
      firstView,
      dataReloadRatio
    );

    Object.values(energyBycomponent).forEach((val) => {
      firstVisits += val.first;
      subsequentVisits += val.return;
    });

    return firstVisits + subsequentVisits;
  }

  // TODO: this method looks like it applies the carbon intensity
  // change to the *entire* system, not just the datacenter.
  emissionsPerVisitInGrams(
    energyPerVisit: number,
    carbonintensity: number = GLOBAL_GRID_INTENSITY
  ) {
    return formatNumber(energyPerVisit * carbonintensity);
  }

  annualEnergyInKwh(energyPerVisit: number, monthlyVisitors = 1000) {
    return energyPerVisit * monthlyVisitors * 12;
  }

  annualEmissionsInGrams(co2grams: number, monthlyVisitors = 1000) {
    return co2grams * monthlyVisitors * 12;
  }

  annualSegmentEnergy(annualEnergy: number) {
    return {
      consumerDeviceEnergy: formatNumber(annualEnergy * END_USER_DEVICE_ENERGY),
      networkEnergy: formatNumber(annualEnergy * NETWORK_ENERGY),
      dataCenterEnergy: formatNumber(annualEnergy * DATACENTER_ENERGY),
      productionEnergy: formatNumber(annualEnergy * PRODUCTION_ENERGY),
    };
  }
}

export { SustainableWebDesign };
export default SustainableWebDesign;
