import path from 'path-browserify';
import mime from 'mime-types';
import jsPsychPreload from '@jspsych/plugin-preload';
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
  let audioToPlay

  if (responseIsCorrect || responseIsCorrect === null) {
    audioToPlay = audio1
  } else {
    audioToPlay = audio2
  }

  new Audio(audioToPlay).play()
}

// Gets the app language based on the lng query string. Using this because ROAR apps use i18next.
export function getLanguage(setLanguage) {
  if (setLanguage) return setLanguage

  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('lng') || 'en';
}

// Gets the device type based on the device inputs
export function getDevice() {
  if (deviceType === 'touchOnly' || (deviceType === 'hybrid' && primaryInput === 'touch')) {
    return 'mobile'
  }
  return 'desktop'
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
  } else if ((isDefault && nested && type === 'shared') || (nested && type === 'shared')) {
      return `${bucketURI}/${lng}/shared/${filePath}`;
  } else if (type === 'device') {
      return `${bucketURI}/${device}/${filePath}`;
  } else if (type === 'shared/device') {
      return `${bucketURI}/shared/${device}/${filePath}`;
  } else if (type === 'languageSpecific') {
      return `${bucketURI}/${lng}/${filePath}`;
  } else if (type === 'default') {
      return `${bucketURI}/${filePath}`;
  } else {
      return `${bucketURI}/shared/${filePath}`;
  }
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



 

