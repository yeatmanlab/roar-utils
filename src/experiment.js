import jsPsychPreload from '@jspsych/plugin-preload';
import path from 'path-browserify';
import { getAssetType, getDevice, getFormattedURL, getLanguage, camelize } from './utils.js';

// Takes in a JSON file, a cloud storage bucket URI, and optionally a language code and returns an object with the the asset paths mapped to thier file names, categorized by media type.
// Ex.
// {
//   images: {
//     image1: 'path/to/image1.jpg'
//   }
//   audio: {
//     audio1: 'path/to/audio1.mp3'
//   }
// }

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
  
  
  // Takes in a JSON file, a cloud storage bucket URI, and optionally a language code and returns an object with groups of preload trials
  // Ex.
  // const preloadTrials = {
  //   preloadStageId1: {
  //     type: jsPsychPreload,
  //     images: [`${bucketUri}/${lng}/${device}/path/to/image_asset1.png`],
  //     audios: [`${bucketUri}/${lng}/${device}/path/to/audio_asset1.png`],
  //     videos: [`${bucketUri}/${lng}/${device}/path/to/video_asset1.png`],
  //     ...otherPreloadOptions
  //   },
  //   preloadStageId2: {
  //     type: jsPsychPreload,
  //     images: [`${bucketUri}/${lng}/${device}/path/to/image_asset2.png`],
  //     audios: [`${bucketUri}/${lng}/${device}/path/to/audio_asset2.png`],
  //     videos: [`${bucketUri}/${lng}/${device}/path/to/video_asset2.png`],
  //     ...otherPreloadOptions
  //   },
  // }
  
  
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