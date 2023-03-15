import path from 'path-browserify';

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
Plays the correct audio based on user response. Takes in 3 arguments:
- responseIsCorrect (boolean): if the user's response was correct or not, ex. true
- correct audio (string): path to the audio file, ex. "http://localhost:8080/audio/feedbackCorrect.mp3"
- incorrect audio (string): path to the audio file 
*/
export function playFeedbackAudio(responseIsCorrect, correctAudio, inCorrrectAudio) {
  if (responseIsCorrect) {
    new Audio(correctAudio).play()
  } else {
    new Audio(inCorrrectAudio).play()
  }
}