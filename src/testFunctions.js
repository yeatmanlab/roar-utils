// This file holds the test version of utility functions. 
// For example functions that normally depend on the browser environment or use packages that depend on the browser environment.
// import { getAssetType, getFormattedURL } from "./utils";
import path from 'path-browserify';
import mime from 'mime-types';

export function camelize(string) {
    return string.replace(/^([A-Z])|[\s-_](\w)/g, (_0, p1, p2, _1) => {
      if (p2) return p2.toUpperCase();
      return p1.toLowerCase();
    });
  }

  export function camelizeFiles(files) {
    const obj = {};
  
    for (const filePath of files) {
      const fileName = path.parse(filePath).name;
      obj[camelize(fileName)] = filePath;
    }
  
    return obj;
  }
  
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

export function generateAssetObject(json, bucketURI, language) {
    let assets = { images: {}, video: {}, audio: {} };
    const lng = 'en';
    const device = 'desktop';
  
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
      if (Array.isArray(groupObject)) {
        handleAssets(groupObject, 'default');
      } else {
        if (groupObject.languageSpecific) {
          if (Array.isArray(groupObject.languageSpecific)) {
            handleAssets(groupObject.languageSpecific, 'languageSpecific');
          } else {
            Object.entries(groupObject.languageSpecific).forEach(([type, filePaths]) => {
              handleAssets(filePaths, type, true, isDefault);
            });
          }
        }
        if (groupObject.device) {
          handleAssets(groupObject.device, 'device');
        }
        if (groupObject.shared) {
          if (Array.isArray(groupObject.shared)) {
            handleAssets(groupObject.shared, 'shared');
          } else {
            // Here we handle the case where 'shared' is an object containing arrays
            Object.entries(groupObject.shared).forEach(([type, filePaths]) => {
              if (type === 'device') {
                handleAssets(filePaths, 'shared/device'); // Special case for 'device' nested in 'shared'
              } else {
                handleAssets(filePaths, 'shared');
              }
            });
          }
        }
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

export function createPreloadTrials(jsonData, bucketURI, language) {
    let preloadTrials = {};
    const lng = 'en';
    const device = 'desktop';

    function handleAssets(assets, group, type, nestedInLangSpecific = false, isDefault = false) {
        assets.forEach((filePath) => {
            let assetType = getAssetType(filePath);
            const formattedURL = getFormattedURL(bucketURI, filePath, lng, device, type, nestedInLangSpecific, isDefault);

            // Initialize preloadTrials[group] if it does not exist
            if (!preloadTrials[group]) {
                preloadTrials[group] = {
                    type: 'jsPsychPreload',
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
        if (Array.isArray(groupObject)) {
            handleAssets(groupObject, group, 'default');
        } else {
            if (groupObject.languageSpecific) {
                if (Array.isArray(groupObject.languageSpecific)) {
                    handleAssets(groupObject.languageSpecific, group, 'languageSpecific');
                } else {
                    Object.entries(groupObject.languageSpecific).forEach(([type, filePaths]) => {
                        handleAssets(filePaths, group, type, true, isDefault);
                    });
                }
            }
            if (groupObject.device) {
                handleAssets(groupObject.device, group, 'device');
            }
            if (groupObject.shared) {
                if (Array.isArray(groupObject.shared)) {
                    handleAssets(groupObject.shared, group, 'shared');
                } else {
                    // Here we handle the case where 'shared' is an object containing arrays
                    Object.entries(groupObject.shared).forEach(([type, filePaths]) => {
                        if (type === 'device') {
                            handleAssets(filePaths, group, 'shared/device'); // Special case for 'device' nested in 'shared'
                        } else {
                            handleAssets(filePaths, group, 'shared');
                        }
                    });
                }
            }
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