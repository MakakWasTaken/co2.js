import fileSize from "./file-size";

// SUSTAINABLE WEB DESIGN CONSTANTS
// this refers to the estimated total energy use for the internet around 2000 TWh,
// divided by the total transfer it enables around 2500 exabytes

/**
 * This metric was changed from 0.81 to 0.75. This was done to better match the
 * information from Andrae's study (https://pisrt.org/psr-press/journals/easl-vol-3-issue-2-2020/new-perspectives-on-internet-electricity-use-in-2030/)
 * and also the study from Aslan et al. (https://onlinelibrary.wiley.com/doi/epdf/10.1111/jiec.12630)
 */
const KWH_PER_GB = 0.75;

// these constants outline how the energy is attributed to
// different parts of the system in the SWD model
const END_USER_DEVICE_ENERGY = 0.52;
const NETWORK_ENERGY = 0.14;
const DATACENTER_ENERGY = 0.15;
const PRODUCTION_ENERGY = 0.19;

// These carbon intensity figures https://ember-climate.org/data/data-explorer
// - Global carbon intensity for 2021
const GLOBAL_GRID_INTENSITY = 442;
const RENEWABLES_GRID_INTENSITY = 50;

// Taken from: https://gitlab.com/wholegrain/carbon-api-2-0/-/blob/master/includes/carbonapi.php

const FIRST_TIME_VIEWING_PERCENTAGE = 0.75;
const RETURNING_VISITOR_PERCENTAGE = 0.25;
const PERCENTAGE_OF_DATA_LOADED_ON_SUBSEQUENT_LOAD = 0.02;

export {
  fileSize,
  KWH_PER_GB,
  END_USER_DEVICE_ENERGY,
  NETWORK_ENERGY,
  DATACENTER_ENERGY,
  PRODUCTION_ENERGY,
  GLOBAL_GRID_INTENSITY,
  RENEWABLES_GRID_INTENSITY,
  FIRST_TIME_VIEWING_PERCENTAGE,
  RETURNING_VISITOR_PERCENTAGE,
  PERCENTAGE_OF_DATA_LOADED_ON_SUBSEQUENT_LOAD,
};
