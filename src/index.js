// global modules
import jsPsychPreload from '@jspsych/plugin-preload';

// assets
import feedbackCorrect from '../assets/audio/feedbackCorrect.mp3';
import feedbackIncorrect from '../assets/audio/feedbackIncorrect.mp3';
import feedbackNeutral from '../assets/audio/feedbackNeutral.mp3';

// local modules
import { camelizeFiles } from './utils';

// constants
export const CORRECT_KEY_PRESS = 'ArrowLeft';
export const CORRECT_KEY_TEXT = 'left arrow key';
export const WRONG_KEY_PRESS = 'ArrowRight';
export const WRONG_KEY_TEXT = 'right arrow key';

const audioFiles = [
  feedbackCorrect,
  feedbackIncorrect,
  feedbackNeutral,
];
export const audioContent = camelizeFiles(audioFiles);
export const preloadAudio = {
  type: jsPsychPreload,
  audio: audioFiles,
};
