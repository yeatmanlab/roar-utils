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
export const getGrade = (inputGrade, gradeMin = 0, gradeMax = 13) => {
  const parsedGrade = Number(inputGrade);
  const gradeStringMap = {
    k: 0,
    tk: 0,
    pk: 0,
    preschool: 0,
    prekindergarten: 0,
    transitionalkindergarten: 0,
    kindergarten: 0,
    infanttoddler: 0,
    infant: 0,
    toddler: 0,
    first: 1,
    firstgrade: 1,
    second: 2,
    secondgrade: 2,
    third: 3,
    thirdgrade: 3,
    fourth: 4,
    fourthgrade: 4,
    fifth: 5,
    fifthgrade: 5,
    sixth: 6,
    sixthgrade: 6,
    seventh: 7,
    seventhgrade: 7,
    eighth: 8,
    eighthgrade: 8,
    ninth: 9,
    ninthgrade: 9,
    tenth: 10,
    tenthgrade: 10,
    eleventh: 11,
    eleventhgrade: 11,
    twelfth: 12,
    twelfthgrade: 12,
    freshman: 9,
    sophomore: 10,
    junior: 11,
    senior: 12,
    postgraduate: 13,
    university: 13,
    graduate: 13,
    master: 13,
    doctorate: 13,
    masters: 13,
  };

  // if inputGrade is null or undefined, return undefined to avoid an error with undefined.toLowerCase()
  if (inputGrade === null || inputGrade === undefined) {
    return undefined;
  }

  if (Number.isNaN(parsedGrade)) {
    // Grade is a string. Remove any whitespace and hyphens. Make lowercase.
    // And refer to the gradeStringMap for the mapping.
    const spaceRegex = /\s/g;
    const hyphenRegex = /-/g;
    const standardizedGradeString = inputGrade
      .toLowerCase()
      .replace(spaceRegex, '')
      .replace(hyphenRegex, '');
    const grade = gradeStringMap[standardizedGradeString];
    if (grade === undefined) return undefined;
    if (grade < gradeMin) return gradeMin;
    if (grade > gradeMax) return gradeMax;
    return grade;
  } else if (parsedGrade < gradeMin) {
    return gradeMin;
  } else if (parsedGrade > gradeMax) {
    return gradeMax;
  }

  // grade is within range and is a number
  return parsedGrade;
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
 * @param {number} responseTimeLowThreshold - The minimum acceptable response time threshold in MS.
 * @param {number} responseTimeHighThreshold - The maximum acceptable response time threshold in MS.
 * @param {number} accuracyThreshold - The minimum acceptable accuracy threshold.
 * @param {array} includedReliabilityFlags - An array of flags that should be included
 * when evaluating reliability.
 * @returns {function} baseValidityEvaluator - A function that evaluates the reliability of a run.
 */
export function createEvaluateValidity({
  responseTimeLowThreshold = 400,
  responseTimeHighThreshold = 10000,
  accuracyThreshold = 0.2,
  minResponsesRequired = 0,
  includedReliabilityFlags = ['responseTimeTooFast'],
}) {
  return function baseEvaluateValidity({ responseTimes, responses, correct, completed }) {
    const flags = [];
    let isReliable = false;
    if (responseTimes.length < minResponsesRequired) {
      flags.push('notEnoughResponses');
    } else {
      // verifies if responseTimes lie above or below a threshold
      if (median(responseTimes) <= responseTimeLowThreshold) {
        flags.push('responseTimeTooFast');
      }

      if (median(responseTimes) >= responseTimeHighThreshold) {
        flags.push('responseTimeTooSlow');
      }
      if (completed === false && includedReliabilityFlags.includes('incomplete')) {
        flags.push('incomplete');
      }

      // TODO: Calculate response similarity based on maxChainLength

      // Calculate accuracy based on the number of correct responses
      const numCorrect = correct?.filter((x) => x === 1).length ?? 0;
      if (numCorrect / correct.length <= accuracyThreshold) {
        flags.push('accuracyTooLow');
      }
      isReliable = flags.filter((x) => includedReliabilityFlags.includes(x)).length === 0;
    }
    const filteredFlags = flags.filter((x) => includedReliabilityFlags.includes(x));
    return { filteredFlags, isReliable };
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
  constructor({ evaluateValidity = createEvaluateValidity(), handleEngagementFlags = () => {} }) {
    this.evaluateValidity = evaluateValidity;
    this.handleEngagementFlags = handleEngagementFlags;
    this._responseTimes = [];
    this._responses = [];
    this._correct = [];
    this._preserveFlags = [];
    this.currentBlock = undefined;
    this.reliabilityByBlock = {};
    this.completed = false;
  }

  /**
   * Takes in array of flags and returns array of flags with current block appended to each flag
   * @function appendCurrentBlockToFlags
   * @param {Array<string>} flags
   */
  appendCurrentBlockToFlags(flags) {
    if (this.currentBlock !== undefined) {
      // We only want to append for block based flags, incomplete would be a global flag
      return flags.map((flag) => (flag !== 'incomplete' ? `${flag}_${this.currentBlock}` : flag));
    }
    return flags;
  }

  /**
   * Returns true if all blocks so far are reliable, false if not
   * @function calculateReliabilityWithBlocks
   */
  calculateReliabilityWithBlocks() {
    return Object.values(this.reliabilityByBlock).every((x) => x === true);
  }

  /**
   *  @function startNewBlockValidation Called when a new block is started to reset the
   * data arrays and update the evaluateValidity function if needed
   * For block-scoped assessments, this function must be called with the first block name
   * before beginning the first block
   * @param {Function} evaluateValidity
   * @param {String} currentBlock The name of the current block
   */
  startNewBlockValidation(currentBlock, evaluateValidity = this.evaluateValidity) {
    // Compute and store flags from the previous block
    // The first conditional prevents a tooFewResponses flag from being
    // stored erroneously before the initial block begins
    if (this._responseTimes.length > 0 && currentBlock !== undefined) {
      const flags = this.calculateAndUpdateFlags();
      // Update new flags to preserveFlags array
      this._preserveFlags = [...this._preserveFlags, ...this.appendCurrentBlockToFlags(flags)];
    }
    this.currentBlock = currentBlock;

    this.evaluateValidity = evaluateValidity;
    this._responseTimes = [];
    this._responses = [];
    this._correct = [];
    this.completed = false;
  }

  /**
   *  @function markAsCompleted Called when a block or task is completed.
   * For block-scoped assessments, this function must be called at the completion
   * of each block
   * */
  markAsCompleted() {
    this.completed = true;
    this.calculateAndUpdateFlags();
  }

  /**
   *  @function calculateAndUpdateFlags Helper function to calculate flag and reliability
   * and use the handleEngagementFlags function to update the run's firekit object
   * @return {Array<string>} flags
   * */
  calculateAndUpdateFlags() {
    const { flags, isReliable } = this.evaluateValidity({
      responseTimes: this._responseTimes,
      responses: this._responses,
      correct: this._correct,
      completed: this.completed,
    });

    // Case for block based assessments
    if (this.currentBlock !== undefined) {
      this.reliabilityByBlock[this.currentBlock] = isReliable;

      // Please note that calling this function with a new set of engagement flags
      // will overwrite the previous set.
      this.handleEngagementFlags(
        [...this._preserveFlags, ...this.appendCurrentBlockToFlags(flags)],
        this.calculateReliabilityWithBlocks(),
        this.reliabilityByBlock,
      );
    } else {
      // Please note that calling this function with a new set of engagement flags
      // will overwrite the previous set.
      this.handleEngagementFlags(flags, isReliable);
    }
    return flags;
  }

  /**
   * Updates ValidityEvaluator arrays (responseTimes, response, and accuracy) with
   *
   * @function addResponseData
   * @param {number} responseTime Time it took for a user to respond to a stimulus
   * @param {string} response  Choice that a user responded with
   * ex: left_arrow, right_arrow, button_3
   * @param {number} isCorrect 1 if a user answered correctly, 0 if answered incorrectly
   */
  addResponseData(responseTime, response, isCorrect) {
    this._responseTimes.push(responseTime);
    this._responses.push(response);
    this._correct.push(isCorrect);

    this.calculateAndUpdateFlags();
  }
}
