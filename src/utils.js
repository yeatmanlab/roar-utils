/* eslint-disable no-underscore-dangle */
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
Plays the correct audio based on user response.
If user response does not matter, it will play a neutral feedback audio.
Takes in 3 parameters:
- responseIsCorrect (boolean || null): if the user's response was correct/incorrect
OR null if it does matter, ex. true OR null
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
 * Returns the formatted URL based on different conditions for asset type,
 * nesting and default values.
 *
 * @param {string} bucketURI - The bucket URI where the assets are stored.
 * Ex. 'https://storage.googleapis.com/${bucketName}
 * @param {string} filePath - The file path of the asset.
 * @param {string} lng - The language identifier as a ISO 639-1 code. Ex. 'en' for English
 * @param {string} device - The device identifier.
 * @param {string} type - The type of asset category. Can be one of the following:
 * 'device', 'shared', 'shared/device', 'languageSpecific', 'default'.
 * @param {boolean} nested - Indicates if the asset is nested in language specific data.
 *  Default is false.
 * @param {boolean} isDefault - Indicates if the asset is from default data. Default is false.
 * @returns {string} The formatted URL based on the given conditions.
 * Ex. 'https://storage.googleapis.com/${bucketName}/${lng}/${device}/${file}'
 */

export function getFormattedURL(bucketURI, filePath, lng, device, type, nested, isDefault) {
  if ((isDefault && nested && type === 'device') || (nested && type === 'device')) {
    return `${bucketURI}/${lng}/${device}/${filePath}`;
  }
  if ((isDefault && nested && type === 'shared') || (nested && type === 'shared')) {
    return `${bucketURI}/${lng}/shared/${filePath}`;
  }
  if (type === 'device') {
    return `${bucketURI}/${device}/${filePath}`;
  }
  if (type === 'shared/device') {
    return `${bucketURI}/shared/${device}/${filePath}`;
  }
  if (type === 'languageSpecific') {
    return `${bucketURI}/${lng}/${filePath}`;
  }
  if (type === 'default') {
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
  throw new Error(
    `Unsupported MIME type for file: ${asset}. Only image, audio, and video files are supported.`,
  );
}

/**
 * Calculates and returns age data based on the provided birth month, birth year,
 * age, and age in months.
 *
 * @function getAgeData
 *
 * @param {string|number|null} birthMonth - The month of birth (1-12).
 * If not provided, it will be calculated based on other parameters.
 * @param {string|number|null} birthYear - The year of birth.
 * If not provided, it will be calculated based on other parameters.
 * @param {string|number|null} age - The age in years.
 * If not provided, it will be calculated based on other parameters.
 * @param {string|number|null} ageMonths - The age in months.
 * If not provided, it will be calculated based on other parameters.
 *
 * @returns {Object} ageData - The calculated age data.
 * @returns {number|null} ageData.age - The calculated age in years.
 * @returns {number|null} ageData.ageMonths - The calculated age in months.
 * @returns {number|null} ageData.birthMonth - The calculated or provided month of birth.
 * @returns {number|null} ageData.birthYear - The calculated or provided year of birth.
 */

export const getAgeData = (birthMonth, birthYear, age, ageMonths) => {
  // milliseconds per year (accounting for leap years)
  const msPerYear = 1000 * 60 * 60 * 24 * 365.25;
  const currDate = new Date();

  const safeNumber = (value) => {
    const numValue = Number(value);
    return Object.is(numValue, NaN) || numValue === 0 ? null : numValue;
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
export const median = (array) => {
  array.sort((a, b) => b - a);
  const { length } = array;
  if (length % 2 === 0) {
    return (array[length / 2] + array[length / 2 - 1]) / 2;
  }
  return array[Math.floor(length / 2)];
};

/**
 * Returns a function that evaluates the reliability of a run based on the following criteria:
 *
 * @param {number} RESPONSE_TIME_LOW_THRESHOLD - The minimum acceptable response time threshold in MS.
 * @param {number} RESPONSE_TIME_HIGH_THRESHOLD - The maximum acceptable response time threshold in MS.
 * @param {number} RESPONSE_SIMILARITY_THRESHOLD - The maximum acceptable response threshold as a number of identical responses
 * @param {number} ACCURACY_THRESHOLD - The minimum acceptable accuracy threshold.
 * @param {array} ignoredReliabilityFlags - An array of flags that should be ignored when evaluating reliability.
 * @returns {function} baseValidityEvaluator - A function that evaluates the reliability of a run.
 */
export function CreateEvaluateValidity({
  RESPONSE_TIME_LOW_THRESHOLD = 400,
  RESPONSE_TIME_HIGH_THRESHOLD = 10000,
  RESPONSE_SIMILARITY_THRESHOLD = 5,
  ACCURACY_THRESHOLD = 0.2,
  ignoredReliabilityFlags = ['responseTimeTooSlow', 'responsesTooSimilar', 'accuracyTooLow'],
}) {
  return function baseEvaluateValidity({ responseTimes, responses, correct }) {
    const flags = [];

    // verifies if responseTimes lie above or below a threshold
    if (median(responseTimes) <= RESPONSE_TIME_LOW_THRESHOLD) {
      flags.push('responseTimeTooFast');
    }

    if (median(responseTimes) >= RESPONSE_TIME_HIGH_THRESHOLD) {
      flags.push('responseTimeTooSlow');
    }

    const isSimilar = responses.length >= RESPONSE_SIMILARITY_THRESHOLD && responses
      .slice(responses.length - RESPONSE_SIMILARITY_THRESHOLD)
      .every((val, i, arr) => val === arr[0]);
    // Calculate response similarity based on maxIdenticalResponse
    if (isSimilar) {
      flags.push('responsesTooSimilar');
    }

    // Calculate accuracy based on the number of correct responses
    const numCorrect = correct?.filter((x) => x === 1).length ?? 0;
    if (numCorrect / correct.length <= ACCURACY_THRESHOLD) {
      flags.push('accuracyTooLow');
    }

    const isReliable = flags.filter((x) => !ignoredReliabilityFlags.includes(x)).length === 0;

    return { flags, isReliable };
  };
}

/**
 * Tracks response times and invokes callback function when response times
 * exceed specified thresholds.
 *
 * @class ResponseTimeTracker
 * @param {Function} evaluateValidity function to be called to generate an decision on the
 *    reliability of a run
 * @param {Function} addEngagementFlags function passed through to update the run's
 *  firekit object with flags tripped
 * @param {number} minResponsesRequired The minimum number of responses required before
 *   checking for threshold exceedance.
 * @property {Array<number>} _responseTimes An array to store the response times.
 * @property {Array<number>} _responses An array to store the responses
 * (keypresses or button choices).
 * @property {Array<number>} _correct An array to store the correctness of the responses.
 */
export class ValidityEvaluator {
  constructor({
    evaluateValidity = () => {},
    addEngagementFlags = () => {},
    minResponsesRequired = 0,
  }) {
    this.evaluateValidity = evaluateValidity;
    this.addEngagementFlags = addEngagementFlags;
    this.minResponsesRequired = minResponsesRequired;
    this._responseTimes = [];
    this._responses = [];
    this._correct = [];
  }

  /**
   *  @function startNewBlockValidation Called when a new block is started to reset the
   * data arrays and update the evaluateValidity function if needed
   * @param {Function} evaluateValidity
   */
  startNewBlockValidation(evaluateValidity = this.evaluateValidity) {
    this.evaluateValidity = evaluateValidity;
    this._responseTimes = [];
    this._responses = [];
    this._correct = [];
  }

  /**
   * Updates ValidityEvaluator arrays (responseTimes, response, and accuracy) with
   *
   * @function addResponseData
   * @param {number} responseTime Time it took for a user to respond to a stimulus
   * @param {string} response  Choice that a user responded with
   * ex: left_arrow, right_arrow, button_3
   * @param {number} isCorrect 1 if a user answered correctly, 0if answered incorrectly
   */
  addResponseData(responseTime, response, isCorrect) {
    // TODO: make response data arrays private
    this._responseTimes.push(responseTime);
    this._responses.push(response);
    this._correct.push(isCorrect);

    if (this._responseTimes.length >= this.minResponsesRequired) {
      const { flags, isReliable } = this.evaluateValidity({
        responseTimes: this._responseTimes,
        responses: this._responses,
        correct: this._correct,
      });

      if (flags?.length > 0) {
        this.addEngagementFlags(flags, isReliable);
      } else {
        // If responseData has exceeded the threshold, mark the run as reliable
        this.addEngagementFlags(flags, true);
      }
    }
  }
}
