"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.preloadAudio = exports.audioContent = exports.WRONG_KEY_TEXT = exports.WRONG_KEY_PRESS = exports.CORRECT_KEY_TEXT = exports.CORRECT_KEY_PRESS = void 0;
var _pluginPreload = _interopRequireDefault(require("@jspsych/plugin-preload"));
var _feedbackCorrect = _interopRequireDefault(require("../assets/audio/feedbackCorrect.mp3"));
var _feedbackIncorrect = _interopRequireDefault(require("../assets/audio/feedbackIncorrect.mp3"));
var _feedbackNeutral = _interopRequireDefault(require("../assets/audio/feedbackNeutral.mp3"));
var _utils = require("./utils");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
// global modules

// assets

// local modules

// constants
var CORRECT_KEY_PRESS = 'ArrowLeft';
exports.CORRECT_KEY_PRESS = CORRECT_KEY_PRESS;
var CORRECT_KEY_TEXT = 'left arrow key';
exports.CORRECT_KEY_TEXT = CORRECT_KEY_TEXT;
var WRONG_KEY_PRESS = 'ArrowRight';
exports.WRONG_KEY_PRESS = WRONG_KEY_PRESS;
var WRONG_KEY_TEXT = 'right arrow key';
exports.WRONG_KEY_TEXT = WRONG_KEY_TEXT;
var audioFiles = [_feedbackCorrect["default"], _feedbackIncorrect["default"], _feedbackNeutral["default"]];
var audioContent = (0, _utils.camelizeFiles)(audioFiles);
exports.audioContent = audioContent;
var preloadAudio = {
  type: _pluginPreload["default"],
  audio: audioFiles
};
exports.preloadAudio = preloadAudio;