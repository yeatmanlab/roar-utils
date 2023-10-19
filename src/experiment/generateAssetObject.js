import path from 'path-browserify';
import { getAssetType, getDevice, getFormattedURL, getLanguage, camelize } from '../utils';

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