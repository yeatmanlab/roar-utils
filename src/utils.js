import path from 'path-browserify';
// for local testing
import fs from 'fs'



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
// For testing function locally
let assetStructure

try {
  const rawData = fs.readFileSync('./assetStructure.json');
  assetStructure = JSON.parse(rawData);

  generateAssetObject(assetStructure, 'google.com', 'en', 'keyboard')
} catch (error) {
  console.error('Error reading JSON file:', error);
}
//

export function generateAssetObject(json, bucketUri, lng, device) {
  const assetTypes = ["images", "audio", "video"];
  let assets = {};

  const handleAssets = (obj, type) => {
    obj[type].languageSpecific.forEach((filePath) => {
      const parsedFileName = path.parse(filePath).name;
      const camelizedFileName = camelize(parsedFileName)

      const formattedValue = `${bucketUri}/${lng}/${device}/${filePath}`;
      
      if (!assets[type]) {
        assets[type] = {};
      }

      assets[type][camelizedFileName] = formattedValue;
    });

    obj[type].shared.forEach((filePath) => {
      const parsedFileName = path.parse(filePath).name;
      const camelizedFileName = camelize(parsedFileName)

      const formattedValue = `${bucketUri}/shared/${device}/${filePath}`;
      
      if (!assets[type]) {
        assets[type] = {};
      }

      assets[type][camelizedFileName] = formattedValue;
    });

  };

  if (json.preload) {
    json.preload.forEach((preloadObject) => {
      assetTypes.forEach((type) => {
        handleAssets(preloadObject, type);
      });
    });
  } else if (json.all) {
    assetTypes.forEach((type) => {
      handleAssets(json.all, type);
    });
  }

  return assets;
}