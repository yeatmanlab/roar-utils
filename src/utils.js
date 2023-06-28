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

function getLanguage() {
  let results = new RegExp('[\?&]lng=([^&#]*)').exec(window.location.href);
  if (results == null) {
    // default to English
     return 'en';
  }
  return decodeURI(results[1]) || 0;
}

function getDevice() {
  if (deviceType === 'touchOnly' || (deviceType === 'hybrid' && primaryInput === 'touch')) {
    return 'mobile'
  }
  return 'keyboard'
}


export function generateAssetObject(json, bucketUri) {
  let assets = { images: {}, video: {}, audio: {} };
  const lng = getLanguage();
  const device = getDevice();

  const getAssetType = (filePath) => {
    const mimeType = mime.lookup(filePath);
    if (!mimeType) {
      throw new Error(`Unrecognized file extension in path: ${filePath}`);
    }
    if (mimeType.startsWith('image/')) return 'images';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    throw new Error(`Unsupported MIME type for file: ${filePath}. Only image, video, and audio files are supported.`);
  }

  const handleAssets = (obj, type) => {
    obj[type].forEach((filePath) => {
      const assetType = getAssetType(filePath);
      const parsedFileName = path.parse(filePath).name;
      const camelizedFileName = camelize(parsedFileName);
      const formattedValue = `${bucketUri}/${type === 'languageSpecific' ? lng : 'shared'}/${device}/${filePath}`;
      assets[assetType][camelizedFileName] = formattedValue;
    });
  };

  const handleGroupAssets = (groupObject) => {
    ['languageSpecific', 'shared'].forEach((type) => {
      handleAssets(groupObject, type);
    });
  };

  if (json.preload) {
    Object.values(json.preload).forEach((groupObject) => {
      handleGroupAssets(groupObject);
    });
  } else if (json.all) {
    handleGroupAssets(json.all);
  }

  return assets;
}


export function createPreloadTrials(jsonData, bucketUri) {
  let preloadTrials = {};
  const lng = getLanguage()
  const device = getDevice()

  let topLevelKey = jsonData.hasOwnProperty('preload') ? 'preload' : 'all';

  // Iterate over groups ('preload') or asset types ('all')
  for (let key in jsonData[topLevelKey]) {
      if (topLevelKey === 'preload') {
          let groupAssets = jsonData[topLevelKey][key];
          preloadTrials[key] = generatePreloadTrial(groupAssets, bucketUri, lng, device);
      } else {
          preloadTrials[topLevelKey] = generatePreloadTrial(jsonData[topLevelKey], bucketUri, lng, device);
          break;
      }
  }

  return preloadTrials;
}

function generatePreloadTrial(groupAssets, bucketUri, lng, device) {
  let trial = {
      type: jsPsychPreload,
      images: [],
      audio: [],
      video: [],
      message: 'The experiment is loading',
      show_progress_bar: true,
      continue_after_error: false,
      error_message: '',
      show_detailed_errors: true,
      max_load_time: null,
      on_error: null,
      on_success: null
  };

  ['languageSpecific', 'shared'].forEach(type => {
      if (groupAssets[type]) {
          groupAssets[type].forEach(asset => {
              let mimeType = mime.lookup(asset);
              if (mimeType.startsWith('image/')) {
                  trial.images.push(`${bucketUri}/${type === 'languageSpecific' ? lng : 'shared'}/${device}/${asset}`);
              }
              else if (mimeType.startsWith('audio/')) {
                  trial.audio.push(`${bucketUri}/${type === 'languageSpecific' ? lng : 'shared'}/${device}/${asset}`);
              }
              else if (mimeType.startsWith('video/')) {
                  trial.video.push(`${bucketUri}/${type === 'languageSpecific' ? lng : 'shared'}/${device}/${asset}`);
              }
              else {
                  throw new Error('Invalid MIME type. Only image, audio, and video file types are allowed.');
              }
          });
      }
  });

  return trial;
}
 

