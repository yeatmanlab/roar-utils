import path from 'path-browserify';
import mime from 'mime-types';
import { deviceType, primaryInput } from 'detect-it';

// converts a string to camel case
export function camelize(string) {
  return string.replace(/^([A-Z])|[\s-_](\w)/g, (_0, p1, p2, _1) => {
    if (p2) return p2.toUpperCase();
    return p1.toLowerCase();
  });
}

// get an object where the key is camelize(filename) and the value is the filename
export function camelizeFiles(files) {
  const obj = {};

  for (const filePath of files) {
    const fileName = path.parse(filePath).name;
    obj[camelize(fileName)] = filePath;
  }

  return obj;
}

/*
Plays the correct audio based on user response. If user response does not matter, it will play a neutral feedback audio. Takes in 3 parameters:
- responseIsCorrect (boolean || null): if the user's response was correct/incorrect OR null if it does matter, ex. true OR null
- correct/neutral audio (string): path to the audio file, ex. "http://localhost:8080/audio/feedbackAudio.mp3"
- incorrect audio (string): path to the audio file
*/

/*
Examples of the function can be called

playFeedbackAudio(true, 'correct.mp3', 'incorrect.mp3')
playFeedbackAudio(null, 'neutral.mp3',)
*/

export function playFeedbackAudio(responseIsCorrect, audio1, audio2) {
  let audioToPlay;

  if (responseIsCorrect || responseIsCorrect === null) {
    audioToPlay = audio1;
  } else {
    audioToPlay = audio2;
  }

  new Audio(audioToPlay).play();
}

// Gets the app language based on the lng query string. Using this because ROAR apps use i18next.
export function getLanguage(setLanguage) {
  if (setLanguage) return setLanguage;

  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('lng') || 'en';
}

// Gets the device type based on the device inputs
export function getDevice() {
  if (deviceType === 'touchOnly' || (deviceType === 'hybrid' && primaryInput === 'touch')) {
    return 'mobile';
  }
  return 'desktop';
}

// Returns device-level information of user through the browser window object.
export function getDeviceInfo() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const { language } = window.navigator;
  const { userAgent } = window.navigator;
  const { userAgentData } = window.navigator;

  return {
    screen: { width, height },
    language,
    userAgent,
    platform: userAgentData.platform,
    mobile: userAgentData.mobile,
    engine: userAgentData.brands[0].brand,
    engineVersion: userAgentData.brands[0].version,
    browser: userAgentData.brands[1].brand,
    browserVersion: userAgentData.brands[1].version,
  };
}

/**
 * Returns the formatted URL based on different conditions for asset type, nesting and default values.
 *
 * @param {string} bucketURI - The bucket URI where the assets are stored. Ex. 'https://storage.googleapis.com/${bucketName}
 * @param {string} filePath - The file path of the asset.
 * @param {string} lng - The language identifier as a ISO 639-1 code. Ex. 'en' for English
 * @param {string} device - The device identifier.
 * @param {string} type - The type of asset category. Can be one of the following: 'device', 'shared', 'shared/device', 'languageSpecific', 'default'.
 * @param {boolean} nested - Indicates if the asset is nested in language specific data. Default is false.
 * @param {boolean} isDefault - Indicates if the asset is from default data. Default is false.
 * @returns {string} The formatted URL based on the given conditions. Ex. 'https://storage.googleapis.com/${bucketName}/${lng}/${device}/${file}'
 */

export function getFormattedURL(bucketURI, filePath, lng, device, type, nested, isDefault) {
  if ((isDefault && nested && type === 'device') || (nested && type === 'device')) {
    return `${bucketURI}/${lng}/${device}/${filePath}`;
  } if ((isDefault && nested && type === 'shared') || (nested && type === 'shared')) {
    return `${bucketURI}/${lng}/shared/${filePath}`;
  } if (type === 'device') {
    return `${bucketURI}/${device}/${filePath}`;
  } if (type === 'shared/device') {
    return `${bucketURI}/shared/${device}/${filePath}`;
  } if (type === 'languageSpecific') {
    return `${bucketURI}/${lng}/${filePath}`;
  } if (type === 'default') {
    return `${bucketURI}/${filePath}`;
  }
  return `${bucketURI}/shared/${filePath}`;
}

export function getAssetType(asset) {
  const mimeType = mime.lookup(asset);
  if (!mimeType) {
    throw new Error(`Unrecognized file extension in path: ${asset}`);
  }
  if (mimeType.startsWith('image/')) return 'images';
  if (mimeType.startsWith('audio/')) return 'audio';
  if (mimeType.startsWith('video/')) return 'video';
  throw new Error(`Unsupported MIME type for file: ${asset}. Only image, audio, and video files are supported.`);
}

/**
 * Calculates and returns age data based on the provided birth month, birth year, age, and age in months.
 *
 * @function getAgeData
 *
 * @param {string|number|null} birthMonth - The month of birth (1-12). If not provided, it will be calculated based on other parameters.
 * @param {string|number|null} birthYear - The year of birth. If not provided, it will be calculated based on other parameters.
 * @param {string|number|null} age - The age in years. If not provided, it will be calculated based on other parameters.
 * @param {string|number|null} ageMonths - The age in months. If not provided, it will be calculated based on other parameters.
 *
 * @returns {Object} ageData - The calculated age data.
 * @returns {number|null} ageData.age - The calculated age in years.
 * @returns {number|null} ageData.ageMonths - The calculated age in months.
 * @returns {number|null} ageData.birthMonth - The calculated or provided month of birth.
 * @returns {number|null} ageData.birthYear - The calculated or provided year of birth.
 */

export const getAgeData = (birthMonth, birthYear, age, ageMonths) => {
  const msPerYear = 1000 * 60 * 60 * 24 * 365.25; // milliseconds per year (accounting for leap years)
  const currDate = new Date();

  const safeNumber = (value) => {
    const numValue = Number(value);
    return (Object.is(numValue, NaN) || numValue === 0) ? null : numValue;
  };

  const bm = safeNumber(birthMonth);
  const by = safeNumber(birthYear);
  const yearsOld = safeNumber(age);
  const ageM = safeNumber(ageMonths);

  const ageData = {
    age: yearsOld,
    ageMonths: ageM,
  };

  if (bm && by) {
    ageData.birthMonth = bm;
    ageData.birthYear = by;

    const birthDate = new Date(by, bm - 1, currDate.getDate());
    const decimalYear = (currDate - birthDate) / msPerYear;
    ageData.age = Math.floor(decimalYear);
    ageData.ageMonths = ageM || Math.floor(decimalYear * 12);
  } else if (by) {
    ageData.birthYear = by;
    ageData.birthMonth = currDate.getMonth() + 1;

    const birthDate = new Date(by, ageData.birthMonth - 1, currDate.getDate());
    const decimalYear = (currDate - birthDate) / msPerYear;
    ageData.age = Math.floor(decimalYear);
    ageData.ageMonths = ageM || Math.floor(decimalYear * 12);
  } else if (ageM) {
    const birthDate = new Date();
    birthDate.setMonth(birthDate.getMonth() - ageM);
    ageData.birthYear = birthDate.getFullYear();
    ageData.birthMonth = birthDate.getMonth() + 1;
    ageData.age = Math.floor((currDate - birthDate) / msPerYear);
  } else if (yearsOld) {
    ageData.birthYear = currDate.getFullYear() - yearsOld;
    ageData.birthMonth = currDate.getMonth() + 1;
    ageData.ageMonths = yearsOld * 12;
  } else {
    ageData.birthMonth = null;
    ageData.birthYear = null;
  }

  return ageData;
};

/**
 * Return grade after min/max filtering and accounting for string values.
 *
 * @function getGrade
 *
 * @param {string|number|null} inputGrade - The input grade.
 * @param {number} gradeMin - The minimum grade. Default is 0 (for Kindergarten).
 * @param {number} gradeMax - The maximum grade. Default is 12.
 *
 * @returns {number} numeric grade
 */
export const getGrade = (inputGrade, gradeMin = 0, gradeMax = 12) => {
  const parsedGrade = Number(inputGrade);
  let grade;

  if (Number.isNaN(parsedGrade)) {
    // Assume grade is K, TK, or PK
    grade = gradeMin;
  } else if (parsedGrade < gradeMin) {
    grade = gradeMin;
  } else if (parsedGrade > gradeMax) {
    grade = gradeMax;
  } else {
    // grade is within range and is a number
    grade = parsedGrade;
  }

  return grade;
};

/**
 * Return grade after min/max filtering and accounting for string values.
 *
 * @const median
 *
 * @param {array} array - Array of response times.
 *
 * @returns {number} median of array of response times 
 */
const median = (array) => {
  array.sort((a, b) => b - a);
  const { length } = array;
  if (length % 2 === 0) {
    return (array[length / 2] + array[(length / 2) - 1]) / 2;
  }
  return array[Math.floor(length / 2)];
};

/**
 * Tracks response times and invokes callback function when response times  
 * exceed specified thresholds.
 *
 * @class ResponseTimeTracker
 * @param {number} minThreshold The minimum acceptable response time threshold.
 * @param {number} maxThreshold The maximum acceptable response time threshold.
 * @param {Function} method The method used to calculate a reduction of response times.
 * @param {Function} thresholdExceededCallback Callback function to be triggered
 *   when the response time exceeds the specified thresholds.
 * @param {number} minResponsesRequired The minimum number of responses required before
 *   checking for threshold exceedance.
 */
export class ResponseTimeTracker {
  constructor({
    minThreshold = 0,
    maxThreshold = Number.MAX_SAFE_INTEGER,
    method = median,
    thresholdExceededCallback = () => {},
    minResponsesRequired = 0,
  }) {
    this.minThreshold = minThreshold;
    this.maxThreshold = maxThreshold;
    this.minResponsesRequired = minResponsesRequired;
    this.method = method;
    this.thresholdExceededCallback = thresholdExceededCallback;
    this.responseTimes = [];
  }

  addResponseTime(responseTime) {
    this.responseTimes.push(responseTime);
    if (this.responseTimes.length >= this.minResponsesRequired) {
      const reduction = this.method(this.responseTimes);
      if (reduction > this.maxThreshold || reduction < this.minThreshold) {
        this.thresholdExceededCallback();
      }
    }
  }
}
