/* eslint-disable no-undef */
import os from 'node:os';
import path from 'path-browserify';
import {
  ValidityEvaluator,
  camelize,
  camelizeFiles,
  getAgeData,
  getGrade,
  createEvaluateValidity,
} from '../src/utils';
import { generateAssetObject, createPreloadTrials } from '../src/experiment';

test('test the camelize function', () => {
  const values = [
    ['roar_utils', 'roarUtils'],
    ['roar_Utils', 'roarUtils'],
    ['Roar_Utils', 'roarUtils'],
    ['rOaRuTiLs', 'rOaRuTiLs'],
    ['rOaR_uTiLs', 'rOaRUTiLs'],
    ['roarUtils', 'roarUtils'],
  ];

  for (const value of values) expect(camelize(value[0])).toBe(value[1]);
});

test('test the camelizeFiles function', () => {
  // generate a list of random paths
  const paths = [];
  const values = [];
  for (let i = 0; i < 10; i += 1) {
    const fileName = (Math.random() + 1).toString(36).substring(7);
    const filePath = path.join(os.tmpdir(), fileName);
    paths.push(filePath);
    values.push([fileName, filePath]);
  }

  const obj = camelizeFiles(paths);
  for (const value of values) {
    const key = camelize(value[0]);
    expect(obj).toHaveProperty(key);
    expect(obj[key]).toBe(value[1]);
  }
});

// 4 structures, each can be preloaded in groups or at once (default)

const structures = [
  [
    {
      structure: 'Multilingual and Multidevice',
      preload: {
        group1: {
          languageSpecific: {
            device: ['pic.jpg', 'audio_asset1.mp3', 'video_asset1.mp4'],
            shared: ['image_asset1.png', 'nestedLang_video1.mp4'],
          },
          shared: ['image_asset2.png', 'shared_audio_asset1.mp3', 'shared_video_asset1.mp4'],
        },
        group2: {
          languageSpecific: {
            device: ['image_asset3.png', 'audio_asset2.mp3', 'video_asset2.mp4'],
            shared: ['nestedLang_shared_image2.png', 'nestedLang_shared_video2.mp4'],
          },
          shared: {
            device: ['nestedShared_image_asset2.png', 'audio_asset3.mp3', 'video_asset2.mp4'],
          },
        },
      },
    },
    {
      audioAsset1: 'google.com/en/desktop/audio_asset1.mp3',
      imageAsset1: 'google.com/en/shared/image_asset1.png',
      imageAsset2: 'google.com/shared/image_asset2.png',
      videoAsset2: 'google.com/shared/desktop/video_asset2.mp4',
    },
  ],
  [
    {
      structure: 'Multilingual and Multidevice',
      default: {
        languageSpecific: {
          device: ['audio_asset1.mp3', 'video_asset2.mp4'],
          shared: ['image_asset1.png', 'nestedLang_shared_video2.mp4'],
        },
        shared: ['image_asset2.png', 'shared_audio_asset2.mp3', 'video_asset2.mp4'],
      },
    },
    {
      audioAsset1: 'google.com/en/desktop/audio_asset1.mp3',
      imageAsset1: 'google.com/en/shared/image_asset1.png',
      imageAsset2: 'google.com/shared/image_asset2.png',
      videoAsset2: 'google.com/shared/video_asset2.mp4',
    },
  ],
  [
    {
      structure: 'Only Multilingual',
      preload: {
        group1: {
          languageSpecific: ['image_asset1.png', 'audio_asset1.mp3', 'path/to/video_asset1.mp4'],
          shared: [
            'image_asset2.png',
            'path/to/shared_audio_asset1.mp3',
            'path/to/shared_video_asset1.mp4',
          ],
        },
        group2: {
          languageSpecific: ['image_asset3.png', 'path/to/audio_asset2.mp3', 'video_asset2.mp4'],
          shared: [
            'image_asset3.png',
            'path/to/shared_audio_asset1.mp3',
            'path/to/shared_video_asset1.mp4',
          ],
        },
      },
    },
    {
      audioAsset1: 'google.com/en/audio_asset1.mp3',
      imageAsset1: 'google.com/en/image_asset1.png',
      imageAsset2: 'google.com/shared/image_asset2.png',
      videoAsset2: 'google.com/en/video_asset2.mp4',
    },
  ],
  [
    {
      structure: 'Only Multilingual',
      default: {
        languageSpecific: ['image_asset1.png', 'audio_asset1.mp3', 'video_asset2.mp4'],
        shared: ['image_asset2.png', 'shared_audio_asset2.mp3', 'shared_video_asset2.mp4'],
      },
    },
    {
      audioAsset1: 'google.com/en/audio_asset1.mp3',
      imageAsset1: 'google.com/en/image_asset1.png',
      imageAsset2: 'google.com/shared/image_asset2.png',
      videoAsset2: 'google.com/en/video_asset2.mp4',
    },
  ],
  [
    {
      structure: 'Only Multidevice',
      preload: {
        group1: {
          device: ['image_asset1.png', 'audio_asset1.mp3', 'video_asset1.mp4', 'image_asset2.png'],
          shared: ['shared_image_asset1.png', 'shared_audio_asset1.mp3', 'shared_video_asset1.mp4'],
        },
        group2: {
          device: ['audio_asset2.mp3', 'video_asset2.mp4'],
          shared: ['shared_image_asset2.png', 'shared_audio_asset2.mp3', 'video_asset2.mp4'],
        },
      },
    },
    {
      audioAsset1: 'google.com/desktop/audio_asset1.mp3',
      imageAsset1: 'google.com/desktop/image_asset1.png',
      imageAsset2: 'google.com/desktop/image_asset2.png',
      videoAsset2: 'google.com/shared/video_asset2.mp4',
    },
  ],
  [
    {
      structure: 'Only Multidevice',
      default: {
        device: ['image_asset1.png', 'audio_asset1.mp3', 'video_asset1.mp4'],
        shared: ['image_asset2.png', 'shared_audio_asset1.mp3', 'video_asset2.mp4'],
      },
    },
    {
      audioAsset1: 'google.com/desktop/audio_asset1.mp3',
      imageAsset1: 'google.com/desktop/image_asset1.png',
      imageAsset2: 'google.com/shared/image_asset2.png',
      videoAsset2: 'google.com/shared/video_asset2.mp4',
    },
  ],
  [
    {
      structure: 'No Multilingual and No multidevice',
      preload: {
        group1: ['image_asset1.png', 'audio_asset1.mp3', 'video_asset1.mp4', 'image_asset2.png'],
        group2: ['audio_asset2.mp3', 'video_asset2.mp4'],
      },
    },
    {
      audioAsset1: 'google.com/audio_asset1.mp3',
      imageAsset1: 'google.com/image_asset1.png',
      imageAsset2: 'google.com/image_asset2.png',
      videoAsset2: 'google.com/video_asset2.mp4',
    },
  ],
  [
    {
      structure: 'No Multilingual and No multidevice',
      default: ['image_asset1.png', 'audio_asset1.mp3', 'image_asset2.jpg', 'video_asset2.mp4'],
    },
    {
      audioAsset1: 'google.com/audio_asset1.mp3',
      imageAsset1: 'google.com/image_asset1.png',
      imageAsset2: 'google.com/image_asset2.jpg',
      videoAsset2: 'google.com/video_asset2.mp4',
    },
  ],
];

test('Generates correct asset object structure for all possible inputs', () => {
  for (const struc of structures) {
    const assetObj = generateAssetObject(struc[0], 'google.com');

    expect(assetObj.audio.audioAsset1).toBe(struc[1].audioAsset1);
    expect(assetObj.images.imageAsset1).toBe(struc[1].imageAsset1);
    expect(assetObj.images.imageAsset2).toBe(struc[1].imageAsset2);
    expect(assetObj.video.videoAsset2).toBe(struc[1].videoAsset2);
  }
});

test('Creates the correct preload trials from all possible inputs', () => {
  for (const struc of structures) {
    const preloadTrials = createPreloadTrials(struc[0], 'google.com');

    if (struc[0].preload) {
      expect(preloadTrials.group1).toBeDefined();
      expect(preloadTrials.group1.audio).toContain(struc[1].audioAsset1);
      expect(preloadTrials.group1.images).toContain(struc[1].imageAsset1);
      expect(preloadTrials.group1.images).toContain(struc[1].imageAsset2);
      expect(preloadTrials.group2.video).toContain(struc[1].videoAsset2);
    } else {
      expect(preloadTrials.default).toBeDefined();
      expect(preloadTrials.default.audio).toContain(struc[1].audioAsset1);
      expect(preloadTrials.default.images).toContain(struc[1].imageAsset1);
      expect(preloadTrials.default.images).toContain(struc[1].imageAsset2);
      expect(preloadTrials.default.video).toContain(struc[1].videoAsset2);
    }
  }
});

const testDate = new Date();

const agePossibilities = [
  {
    birthMonth: 8,
    birthYear: 2009,
    age: null,
    ageMonths: null,
    expectedBirthMonth: 8,
    expectedBirthYear: 2009,
  },
  {
    birthMonth: 5,
    birthYear: 2000,
    age: 23,
    ageMonths: null,
    expectedBirthMonth: 5,
    expectedBirthYear: 2000,
  },
  {
    birthMonth: null,
    birthYear: 2007,
    age: null,
    ageMonths: null,
    expectedBirthMonth: testDate.getMonth() + 1,
    expectedBirthYear: 2007,
  },
  {
    birthMonth: null,
    birthYear: null,
    age: null,
    ageMonths: 254,
    expectedBirthMonth: 12 + ((testDate.getMonth() + 1 - 254) % 12),
    expectedBirthYear: testDate.getFullYear() - Math.floor(254 / 12),
  },
  {
    birthMonth: null,
    birthYear: null,
    age: 12,
    ageMonths: null,
    expectedBirthMonth: testDate.getMonth() + 1,
    expectedBirthYear: testDate.getFullYear() - 12,
  },
  {
    birthMonth: 9,
    birthYear: null,
    age: null,
    ageMonths: null,
    expectedBirthMonth: null,
    expectedBirthYear: null,
  },
  {
    birthMonth: null,
    birthYear: null,
    age: null,
    ageMonths: null,
    expectedBirthMonth: null,
    expectedBirthYear: null,
  },
];

test('Sets the correct age fields for all possible inputs', () => {
  for (const poss of agePossibilities) {
    const ageData = getAgeData(poss.birthMonth, poss.birthYear, poss.age, poss.ageMonths);

    let expectedAge = null;
    let expectedAgeMonths = null;

    if (poss.ageMonths || poss.age || poss.birthYear) {
      if (!poss.birthMonth && poss.ageMonths) {
        expectedAge = Math.floor(poss.ageMonths / 12);
      } else if (testDate.getMonth() + 1 < poss.expectedBirthMonth) {
        expectedAge = testDate.getFullYear() - poss.expectedBirthYear - 1;
      } else {
        expectedAge = testDate.getFullYear() - poss.expectedBirthYear;
      }
      expectedAgeMonths = (testDate.getFullYear() - poss.expectedBirthYear) * 12
        + (testDate.getMonth() + 1 - poss.expectedBirthMonth);
    }

    expect(ageData.birthMonth).toBe(poss.expectedBirthMonth);
    expect(ageData.birthYear).toBe(poss.expectedBirthYear);
    expect(ageData.age).toBe(expectedAge);
    expect(ageData.ageMonths).toBe(expectedAgeMonths);
  }
});

test('Correctly parses grade', () => {
  // Test with default gradeMin and gradeMax
  expect(getGrade('K')).toBe(0);
  expect(getGrade('4')).toBe(4);
  expect(getGrade(5)).toBe(5);
  expect(getGrade('20')).toBe(13);
  expect(getGrade(20)).toBe(13);
  expect(getGrade('-5')).toBe(0);
  expect(getGrade(-5)).toBe(0);
  expect(getGrade('Transitional-kindergarten')).toBe(0);
  expect(getGrade('Pre Kindergarten')).toBe(0);
  expect(getGrade('sophomore')).toBe(10);

  expect(getGrade('K', 2, 8)).toBe(2);
  expect(getGrade('4', 2, 8)).toBe(4);
  expect(getGrade(5, 2, 8)).toBe(5);
  expect(getGrade('20', 2, 8)).toBe(8);
  expect(getGrade(20, 2, 8)).toBe(8);
  expect(getGrade('-5', 2, 8)).toBe(2);
  expect(getGrade(-5, 2, 8)).toBe(2);
  expect(getGrade('Transitional-kindergarten', 2, 8)).toBe(2);
  expect(getGrade('Pre Kindergarten', 2, 8)).toBe(2);
  expect(getGrade('sophomore', 2, 8)).toBe(8);
  expect(getGrade(undefined, 2, 8)).toBe(undefined);
});

const testAddFlags = jest.fn();

describe('BaseValidityEvaluator properly adds flags', () => {
  let validityEval;

  beforeEach(() => {
    validityEval = new ValidityEvaluator({
      evaluateValidity: new createEvaluateValidity({
        minResponsesRequired: 4,
      }),
      handleEngagementFlags: testAddFlags,
    });
  });
  test('SampleEvaluator flags a run with too little responses', () => {
    validityEval.addResponseData(550, 'right_arrow', 0);
    validityEval.addResponseData(450, 'left_arrow', 1);
    expect(validityEval._correct.length).toBe(2);
    expect(validityEval._responses.length).toBe(2);
    expect(validityEval._responseTimes.length).toBe(2);
    expect(testAddFlags).toHaveBeenLastCalledWith(['notEnoughResponses'], false);
  });
  test('SampleEvaluator flags a run with too low of a median response time', () => {
    validityEval.addResponseData(550, 'right_arrow', 0);
    validityEval.addResponseData(450, 'left_arrow', 1);
    validityEval.addResponseData(250, 'left_arrow', 1);
    validityEval.addResponseData(250, 'right_arrow', 0);
    validityEval.addResponseData(250, 'left_arrow', 1);
    validityEval.addResponseData(250, 'left_arrow', 1);
    expect(validityEval._correct.length).toBe(6);
    expect(validityEval._responses.length).toBe(6);
    expect(validityEval._responseTimes.length).toBe(6);
    expect(testAddFlags).toHaveBeenLastCalledWith(['responseTimeTooFast'], false);
  });
  test('SampleEvaluator flags a run with too high of a median response time', () => {
    validityEval.addResponseData(550, 'right_arrow', 0);
    validityEval.addResponseData(10050, 'left_arrow', 1);
    validityEval.addResponseData(650, 'right_arrow', 1);
    validityEval.addResponseData(15000, 'right_arrow', 0);
    validityEval.addResponseData(13000, 'left_arrow', 1);
    validityEval.addResponseData(12000, 'left_arrow', 1);
    expect(validityEval._correct.length).toBe(6);
    expect(validityEval._responses.length).toBe(6);
    expect(validityEval._responseTimes.length).toBe(6);
    expect(testAddFlags).toHaveBeenLastCalledWith(['responseTimeTooSlow'], true);
  });
  test('SampleEvaluator does not flag a run with similar responses but not too similar of responses', () => {
    validityEval.addResponseData(550, 'right_arrow', 0);
    validityEval.addResponseData(1050, 'right_arrow', 1);
    validityEval.addResponseData(650, 'right_arrow', 1);
    validityEval.addResponseData(900, 'right_arrow', 0);
    validityEval.addResponseData(1000, 'left_arrow', 1);
    validityEval.addResponseData(1200, 'right_arrow', 1);
    expect(validityEval._correct.length).toBe(6);
    expect(validityEval._responses.length).toBe(6);
    expect(validityEval._responseTimes.length).toBe(6);
    expect(testAddFlags).toHaveBeenLastCalledWith([], true);
  });
  test('SampleEvaluator flags a run with too low of an accuracy', () => {
    validityEval.addResponseData(550, 'left_arrow', 0);
    validityEval.addResponseData(1050, 'left_arrow', 0);
    validityEval.addResponseData(650, 'right_arrow', 0);
    validityEval.addResponseData(900, 'right_arrow', 1);
    validityEval.addResponseData(1000, 'right_arrow', 0);
    validityEval.addResponseData(1200, 'left_arrow', 0);
    expect(validityEval._correct.length).toBe(6);
    expect(validityEval._responses.length).toBe(6);
    expect(validityEval._responseTimes.length).toBe(6);
    expect(testAddFlags).toHaveBeenLastCalledWith(['accuracyTooLow'], true);
  });
});

describe('ValidityEvaluator tests with custom validation parameters', () => {
  let validityEval;

  beforeEach(() => {
    validityEval = new ValidityEvaluator({
      evaluateValidity: new createEvaluateValidity({
        responseTimeLowThreshold: 500,
        responseTimeHighThreshold: 800,
        includedReliabilityFlags: ['responseTimeTooFast'],
        minResponsesRequired: 4,
      }),
      handleEngagementFlags: testAddFlags,
    });
  });
  test('SampleEvaluator does not flag a run with a satisfactory median response time', () => {
    validityEval.addResponseData(400, 'right_arrow', 0);
    validityEval.addResponseData(600, 'left_arrow', 1);
    validityEval.addResponseData(650, 'left_arrow', 1);
    validityEval.addResponseData(530, 'right_arrow', 0);
    validityEval.addResponseData(520, 'left_arrow', 1);
    validityEval.addResponseData(510, 'left_arrow', 1);
    expect(testAddFlags).toHaveBeenLastCalledWith([], true);
  });
  test('SampleEvaluator flags a run that breaches the upper threshold median response time', () => {
    validityEval.addResponseData(800, 'right_arrow', 0);
    validityEval.addResponseData(920, 'left_arrow', 1);
    validityEval.addResponseData(950, 'left_arrow', 1);
    validityEval.addResponseData(910, 'left_arrow', 1);
    validityEval.addResponseData(910, 'left_arrow', 1);
    validityEval.addResponseData(910, 'right_arrow', 1);
    expect(testAddFlags).toHaveBeenLastCalledWith(['responseTimeTooSlow'], true);
  });
  test('SampleEvaluator flags a run with too low of a median response time, but still returns the run as reliable as the responseTimeTooFast flag is blacklisted', () => {
    validityEval.addResponseData(550, 'right_arrow', 0);
    validityEval.addResponseData(450, 'left_arrow', 1);
    validityEval.addResponseData(250, 'left_arrow', 1);
    validityEval.addResponseData(250, 'right_arrow', 0);
    validityEval.addResponseData(250, 'left_arrow', 1);
    validityEval.addResponseData(250, 'left_arrow', 1);
    expect(testAddFlags).toHaveBeenLastCalledWith(['responseTimeTooFast'], false);
  });
});

describe('ValidatyEvaluatorTests across Multiple Blocks', () => {
  let validityEval;

  beforeEach(() => {
    validityEval = new ValidityEvaluator({
      evaluateValidity: new createEvaluateValidity({
        responseTimeLowThreshold: 500,
        responseTimeHighThreshold: 800,
        includedReliabilityFlags: ['responseTimeTooFast', 'incomplete'],
        minResponsesRequired: 4,
      }),
      handleEngagementFlags: testAddFlags,
    });
    validityEval.startNewBlockValidation('DEL');
  });

  test('Tests that startNewBlockValidation properly clears response arrays', () => {
    validityEval.addResponseData(550, 'right_arrow', 0);
    validityEval.addResponseData(550, 'left_arrow', 1);
    validityEval.addResponseData(550, 'left_arrow', 1);
    validityEval.startNewBlockValidation('FSM');

    expect(validityEval._responseTimes.length).toBe(0);
    expect(validityEval._responses.length).toBe(0);
    expect(validityEval._correct.length).toBe(0);
    expect(testAddFlags).toHaveBeenLastCalledWith(['notEnoughResponses_DEL'], false, {
      DEL: false,
    });
  });

  test('Test that a block terminated midway properly sets reliability', () => {
    validityEval.addResponseData(550, 'right_arrow', 0);
    validityEval.addResponseData(550, 'left_arrow', 1);
    validityEval.addResponseData(550, 'left_arrow', 1);
    validityEval.addResponseData(550, 'right_arrow', 0);
    validityEval.addResponseData(550, 'left_arrow', 1);
    validityEval.addResponseData(550, 'left_arrow', 1);
    validityEval.markAsCompleted();

    validityEval.startNewBlockValidation('FSM');
    validityEval.addResponseData(550, 'right_arrow', 0);
    validityEval.addResponseData(550, 'left_arrow', 1);
    validityEval.addResponseData(550, 'left_arrow', 1);
    validityEval.addResponseData(550, 'right_arrow', 0);
    validityEval.addResponseData(550, 'left_arrow', 1);
    validityEval.addResponseData(550, 'left_arrow', 1);

    expect(testAddFlags).toHaveBeenLastCalledWith(['incomplete'], false, { DEL: true, FSM: false });
  });

  test('Test for a reliable run with no flags', () => {
    validityEval.addResponseData(600, 'right_arrow', 0);
    validityEval.addResponseData(620, 'left_arrow', 1);
    validityEval.addResponseData(650, 'left_arrow', 1);
    validityEval.addResponseData(710, 'left_arrow', 1);
    validityEval.addResponseData(910, 'left_arrow', 1);
    validityEval.addResponseData(910, 'right_arrow', 1);
    validityEval.markAsCompleted();

    validityEval.startNewBlockValidation('FSM');
    validityEval.addResponseData(520, 'left_arrow', 1);
    validityEval.addResponseData(550, 'left_arrow', 1);
    validityEval.addResponseData(610, 'left_arrow', 0);
    validityEval.addResponseData(810, 'left_arrow', 0);
    validityEval.addResponseData(610, 'right_arrow', 1);
    validityEval.markAsCompleted();

    validityEval.startNewBlockValidation('LSM');
    validityEval.addResponseData(620, 'left_arrow', 1);
    validityEval.addResponseData(650, 'left_arrow', 1);
    validityEval.addResponseData(610, 'left_arrow', 1);
    validityEval.addResponseData(510, 'left_arrow', 1);
    validityEval.addResponseData(910, 'right_arrow', 1);
    validityEval.markAsCompleted();
    expect(testAddFlags).toHaveBeenLastCalledWith([], true, {
      DEL: true,
      FSM: true,
      LSM: true,
    });
  });

  test('Test for flag retention with preserveFlags', () => {
    validityEval.addResponseData(800, 'right_arrow', 0);
    validityEval.addResponseData(920, 'left_arrow', 1);
    validityEval.addResponseData(950, 'left_arrow', 1);
    validityEval.addResponseData(910, 'left_arrow', 1);
    validityEval.addResponseData(910, 'left_arrow', 1);
    validityEval.addResponseData(910, 'right_arrow', 1);
    validityEval.markAsCompleted();

    validityEval.startNewBlockValidation('FSM');
    validityEval.addResponseData(520, 'left_arrow', 0);
    validityEval.addResponseData(550, 'left_arrow', 0);
    validityEval.addResponseData(610, 'left_arrow', 0);
    validityEval.addResponseData(810, 'left_arrow', 0);
    validityEval.addResponseData(610, 'right_arrow', 1);
    validityEval.markAsCompleted();

    validityEval.startNewBlockValidation('LSM');
    validityEval.addResponseData(320, 'left_arrow', 1);
    validityEval.addResponseData(350, 'left_arrow', 1);
    validityEval.addResponseData(310, 'left_arrow', 1);
    validityEval.addResponseData(310, 'left_arrow', 1);
    validityEval.addResponseData(310, 'right_arrow', 1);
    validityEval.markAsCompleted();
    expect(testAddFlags).toHaveBeenLastCalledWith(
      ['responseTimeTooSlow_DEL', 'accuracyTooLow_FSM', 'responseTimeTooFast_LSM'],
      false,
      {
        DEL: true,
        FSM: true,
        LSM: false,
      },
    );
  });

  test('Test for multiple flag retention per block with _preserveFlags', () => {
    validityEval.addResponseData(400, 'right_arrow', 0);
    validityEval.addResponseData(420, 'left_arrow', 0);
    validityEval.addResponseData(450, 'left_arrow', 0);
    validityEval.addResponseData(410, 'left_arrow', 0);
    validityEval.addResponseData(410, 'left_arrow', 0);
    validityEval.addResponseData(410, 'right_arrow', 1);
    validityEval.markAsCompleted();

    validityEval.startNewBlockValidation('FSM');
    validityEval.addResponseData(520, 'left_arrow', 0);
    validityEval.addResponseData(550, 'left_arrow', 0);
    validityEval.addResponseData(310, 'left_arrow', 0);
    validityEval.addResponseData(310, 'left_arrow', 0);
    validityEval.addResponseData(310, 'right_arrow', 1);
    validityEval.markAsCompleted();

    validityEval.startNewBlockValidation('LSM');
    validityEval.addResponseData(320, 'left_arrow', 0);
    validityEval.addResponseData(350, 'left_arrow', 0);
    validityEval.addResponseData(310, 'left_arrow', 0);
    validityEval.addResponseData(310, 'left_arrow', 0);
    validityEval.addResponseData(310, 'right_arrow', 1);
    validityEval.markAsCompleted();

    expect(testAddFlags).toHaveBeenLastCalledWith(
      [
        'responseTimeTooFast_DEL',
        'accuracyTooLow_DEL',
        'responseTimeTooFast_FSM',
        'accuracyTooLow_FSM',
        'responseTimeTooFast_LSM',
        'accuracyTooLow_LSM',
      ],
      false,
      {
        DEL: false,
        FSM: false,
        LSM: false,
      },
    );
  });

  test('Tests that only finishing the first block run is marked as incomplete', () => {
    validityEval.addResponseData(400, 'right_arrow', 0);
    validityEval.addResponseData(600, 'left_arrow', 1);
    validityEval.addResponseData(650, 'left_arrow', 1);
    validityEval.addResponseData(530, 'right_arrow', 0);
    validityEval.addResponseData(520, 'left_arrow', 1);
    validityEval.addResponseData(510, 'left_arrow', 1);

    expect(testAddFlags).toHaveBeenLastCalledWith(['incomplete'], false, { DEL: false });
  });
});

describe('ValidityEvaluator with incomplete flag for a non-block based assessment', () => {
  let validityEval;

  beforeEach(() => {
    validityEval = new ValidityEvaluator({
      evaluateValidity: new createEvaluateValidity({
        responseTimeLowThreshold: 500,
        responseTimeHighThreshold: 800,
        includedReliabilityFlags: ['responseTimeTooFast', 'incomplete'],
        minResponsesRequired: 2,
      }),
      handleEngagementFlags: testAddFlags,
    });
  });

  test('Test that an incomplete run is flagged as unreliable', () => {
    validityEval.addResponseData(400, 'right_arrow', 0);
    validityEval.addResponseData(600, 'left_arrow', 1);
    validityEval.addResponseData(600, 'right_arrow', 0);
    validityEval.addResponseData(600, 'left_arrow', 1);
    validityEval.addResponseData(400, 'right_arrow', 0);
    validityEval.addResponseData(600, 'left_arrow', 1);
    validityEval.addResponseData(600, 'right_arrow', 0);
    validityEval.addResponseData(600, 'left_arrow', 1);
    expect(testAddFlags).toHaveBeenLastCalledWith(['incomplete'], false);
  });

  test('Test that an complete run is flagged as reliable', () => {
    validityEval.addResponseData(400, 'right_arrow', 0);
    validityEval.addResponseData(600, 'left_arrow', 1);
    validityEval.addResponseData(600, 'right_arrow', 0);
    validityEval.addResponseData(600, 'left_arrow', 1);
    validityEval.addResponseData(400, 'right_arrow', 0);
    validityEval.addResponseData(600, 'left_arrow', 1);
    validityEval.addResponseData(600, 'right_arrow', 0);
    validityEval.addResponseData(600, 'left_arrow', 1);
    validityEval.markAsCompleted();
    expect(testAddFlags).toHaveBeenLastCalledWith([], true);
  });
});
