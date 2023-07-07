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
function getLanguage(setLanguage) {
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

function getFormattedURL(bucketURI, filePath, lng, device, type, nested, isDefault) {
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

function getAssetType(asset) {
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
 * Generates an asset object from a given JSON object, bucket URI and language.
 *
 * @param {object} json - The JSON object containing data about assets. It may contain properties: 'preload' and 'default', each having their own structure.
 * @param {string} bucketURI - The bucket URI where the assets are stored.
 * @param {string} language - (Optional) The language identifier as a ISO 639-1 code. Ex. 'en' for English
 * @returns {object} assets - The generated asset object, structured as follows: { images: {}, video: {}, audio: {} }. Each sub-object is a collection of assets by type. Each asset key is a camelized file name, and the value is a formatted URL.
 *
 * @example
 * 
 * JSON structure for an app that has multilingual and multidevice support
 * 
 * const json = {
 *   "default": {
 *       "languageSpecific": {
 *           "device": ["image_asset2.png", "audio_asset2.mp3",,
 *           "shared": ["shared_video1.mp4",]
 *       },
 *       "shared": ["shared_image_asset2.png", "shared_audio_asset2.mp3"]
 *   }
 * };
 * 
 * const bucketURI = 'https://storage.googleapis.com';
 * const language = 'en';
 * 
 * generateAssetObject(json, bucketURI, language);
 * 
 *  Outputs: 
 *     {
 *       images: {
 *         imageAsset2: 'https://storage.googleapis.com/en/desktop/image_asset2.png',
 *         sharedImageAsset2: 'https://storage.googleapis.com/en/shared/shared_image_asset2.png',
 *       },
 *       video: {
 *         sharedVideo1: 'https://storage.googleapis.com/en/shared/shared_video1.mp4',
 *       },
 *       audio: {
 *         audioAsset2: 'https://storage.googleapis.com/en/desktop/audio_asset2.mp3',
 *         sharedAudioAsset2: 'https://storage.googleapis.com/shared/desktop/shared_audio_asset2.mp3'
 *       }
 *     }
 */


export function generateAssetObject(json, bucketURI, language) {
  let assets = { images: {}, video: {}, audio: {} };
  const lng = getLanguage(language);
  const device = getDevice();

  const handleAssets = (arr, type, nestedInLangSpecific = false, isDefault = false) => {
    arr.forEach((filePath) => {
      const assetType = getAssetType(filePath);
      const parsedFileName = path.parse(filePath).name;
      const camelizedFileName = camelize(parsedFileName);
      const formattedURL = getFormattedURL(bucketURI, filePath, lng, device, type, nestedInLangSpecific, isDefault);

      assets[assetType][camelizedFileName] = formattedURL;
    });
  };

  const handleGroupAssets = (groupObject, isDefault = false) => {
    // Handles the case where groupObject is an array.
    if (Array.isArray(groupObject)) {
        handleAssets(groupObject, 'default');
        return;
    }

    // Handles the case where groupObject is language-specific.
    if (groupObject.languageSpecific) {
        if (Array.isArray(groupObject.languageSpecific)) {
            handleAssets(groupObject.languageSpecific, 'languageSpecific');
        } else {
            handleAssetsForAllTypes(groupObject.languageSpecific, isDefault);
        }
    }

    // Handles the case where groupObject is device-specific.
    if (groupObject.device) {
        handleAssets(groupObject.device, 'device');
    }

    // Handles the case where groupObject is shared.
    if (groupObject.shared) {
        handleSharedAssets(groupObject.shared);
    }
  };

  const handleAssetsForAllTypes = (object, isDefault) => {
      Object.entries(object).forEach(([type, filePaths]) => {
          handleAssets(filePaths, type, true, isDefault);
      });
  };

  const handleSharedAssets = (sharedObject) => {
      if (Array.isArray(sharedObject)) {
          handleAssets(sharedObject, 'shared');
      } else {
          Object.entries(sharedObject).forEach(([type, filePaths]) => {
              const assetType = type === 'device' ? 'shared/device' : 'shared';
              handleAssets(filePaths, assetType);
          });
      }
  };

  if (json.preload) {
    Object.entries(json.preload).forEach(([group, groupObject]) => {
      handleGroupAssets(groupObject);
    });
  }

  if (json.default) {
    handleGroupAssets(json.default, true);
  }

  return assets;
}

/**
 * Creates jsPsych preload trial(s) for a jsPsych experiment from a given JSON object, bucket URI, and language.
 *
 * @param {object} jsonData - The JSON object containing data about assets. It may contain properties: 'preload' and 'default', each having their own structure.
 * @param {string} bucketURI - The bucket URI where the assets are stored.
 * @param {string} language - (Optional) The language identifier as a ISO 639-1 code. Ex. 'en' for English
 * @returns {object} preloadTrials - The generated preload trials object, structured as follows:
 *  - For each group (or 'default'), there's a key in the object.
 *  - Each value is an object with properties corresponding to jsPsych preload plugin parameters, and separate arrays for 'images', 'audio', and 'video' URLs.
 *
 * @example
 * 
 * const jsonData = {
 *   preload: {
 *     image: ['file1.jpg', 'file2.jpg'],
 *     video: ['file1.mp4', 'file2.mp4'],
 *     audio: ['file1.mp3', 'file2.mp3']
 *   },
 *   default: {
 *     image: ['file3.jpg', 'file4.jpg'],
 *     video: ['file3.mp4', 'file4.mp4'],
 *     audio: ['file3.mp3', 'file4.mp3']
 *   }
 * };
 * 
 *  const bucketURI = 'https://bucket.example.com';
 *  const language = 'en';
 * 
 * createPreloadTrials(jsonData, bucketURI, language);
 * 
 * // Outputs: 
 * // {
 * //   default: {
 * //     type: jsPsychPreload,
 * //     message: 'The experiment is loading',
 * //     show_progress_bar: true,
 * //     continue_after_error: false,
 * //     error_message: '',
 * //     show_detailed_errors: true,
 * //     max_load_time: null,
 * //     on_error: null,
 * //     on_success: null,
 * //     images: ['https://bucket.example.com/en/file1.jpg', 'https://bucket.example.com/en/file2.jpg'],
 * //     video: [...],
 * //     audio: [...]
 * //   },
 * // }
 */

export function createPreloadTrials(jsonData, bucketURI, language) {
  let preloadTrials = {};
  const lng = getLanguage(language);
  const device = getDevice();

  function handleAssets(assets, group, type, nestedInLangSpecific = false, isDefault = false) {
      assets.forEach((filePath) => {
          let assetType = getAssetType(filePath);
          const formattedURL = getFormattedURL(bucketURI, filePath, lng, device, type, nestedInLangSpecific, isDefault);

          // Initialize preloadTrials[group] if it does not exist
          if (!preloadTrials[group]) {
              preloadTrials[group] = {
                  type: jsPsychPreload,
                  message: 'The experiment is loading',
                  show_progress_bar: true,
                  continue_after_error: false,
                  error_message: '',
                  show_detailed_errors: true,
                  max_load_time: null,
                  on_error: null,
                  on_success: null,
                  images: [],
                  audio: [],
                  video: []
              };
          }

          // Add formattedURL to the corresponding array in preloadTrials[group]
          preloadTrials[group][assetType].push(formattedURL);
      });
  }

  function handleGroupAssets(group, groupObject, isDefault = false) {

    // Handles the case where groupObject is an array.
    if (Array.isArray(groupObject)) {
        handleAssets(groupObject, group, 'default');
        return;
    }

    // Handles the case where groupObject is language-specific.
    if (groupObject.languageSpecific) {
        handleLanguageSpecificAssets(group, groupObject.languageSpecific, isDefault);
    }

    // Handles the case where groupObject is device-specific.
    if (groupObject.device) {
        handleAssets(groupObject.device, group, 'device');
    }

    // Handles the case where groupObject is shared.
    if (groupObject.shared) {
        handleSharedAssets(group, groupObject.shared);
    }
  }

  // Helper function to handle language specific assets.
  function handleLanguageSpecificAssets(group, languageSpecificObject, isDefault) {
    if (Array.isArray(languageSpecificObject)) {
        handleAssets(languageSpecificObject, group, 'languageSpecific');
    } else {
        handleAssetsForAllTypes(group, languageSpecificObject, isDefault);
    }
  }

  // Extracted the common logic to handle assets for all types into a separate function.
  function handleAssetsForAllTypes(group, object, isDefault) {
    Object.entries(object).forEach(([type, filePaths]) => {
        handleAssets(filePaths, group, type, true, isDefault);
    });
  }

  // Helper function to handle shared assets.
  function handleSharedAssets(group, sharedObject) {
    if (Array.isArray(sharedObject)) {
        handleAssets(sharedObject, group, 'shared');
    } else {
        Object.entries(sharedObject).forEach(([type, filePaths]) => {
            const assetType = type === 'device' ? 'shared/device' : 'shared';
            handleAssets(filePaths, group, assetType);
        });
    }
  }

  if (jsonData.preload) {
      Object.entries(jsonData.preload).forEach(([group, groupObject]) => {
          handleGroupAssets(group, groupObject);
      });
  }

  if (jsonData.default) {
      handleGroupAssets('default', jsonData.default, true);
  }

  return preloadTrials;
}



 

