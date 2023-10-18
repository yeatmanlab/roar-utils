import os from 'node:os';
import path from 'path-browserify';
import { camelize, camelizeFiles, getAgeData, getGrade } from '../src/utils';
import { generateAssetObject, createPreloadTrials, } from '../src/experiment'

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
  for (let i = 0; i < 10; i++) {
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
      "structure": "Multilingual and Multidevice",
      "preload": {
          "group1": {
                  "languageSpecific": {
                      "device": ["pic.jpg", "audio_asset1.mp3", "video_asset1.mp4"],
                      "shared": ["image_asset1.png", "nestedLang_video1.mp4"]
                  },
                  "shared": ["image_asset2.png","shared_audio_asset1.mp3", "shared_video_asset1.mp4"]
          },
          "group2": {
              "languageSpecific": {
                  "device": ["image_asset3.png", "audio_asset2.mp3", "video_asset2.mp4"],
                  "shared": ["nestedLang_shared_image2.png", "nestedLang_shared_video2.mp4"]
              },
              "shared": {
                  "device": ["nestedShared_image_asset2.png", "audio_asset3.mp3", "video_asset2.mp4"]
              }
          }
      }
    }, 
    {
      audioAsset1: "google.com/en/desktop/audio_asset1.mp3", 
      imageAsset1: "google.com/en/shared/image_asset1.png", 
      imageAsset2: "google.com/shared/image_asset2.png", 
      videoAsset2: "google.com/shared/desktop/video_asset2.mp4"
    },
  ],
  [
    {
      "structure": "Multilingual and Multidevice",
      "default": {
      "languageSpecific": {
          "device": ["audio_asset1.mp3", "video_asset2.mp4"],
          "shared": ["image_asset1.png", "nestedLang_shared_video2.mp4"]
      },
      "shared": ["image_asset2.png", "shared_audio_asset2.mp3", "video_asset2.mp4"]
  }}, {
        audioAsset1: "google.com/en/desktop/audio_asset1.mp3", 
        imageAsset1: "google.com/en/shared/image_asset1.png", 
        imageAsset2: "google.com/shared/image_asset2.png", 
        videoAsset2: "google.com/shared/video_asset2.mp4"
      }
  ], 
  [
    {
      "structure": "Only Multilingual",
      "preload": {
        "group1": {
            "languageSpecific": ["image_asset1.png", "audio_asset1.mp3", "path/to/video_asset1.mp4"],
            "shared": ["image_asset2.png", "path/to/shared_audio_asset1.mp3", "path/to/shared_video_asset1.mp4"]
        },
        "group2": {
            "languageSpecific": ["image_asset3.png", "path/to/audio_asset2.mp3", "video_asset2.mp4"] ,
            "shared": ["image_asset3.png", "path/to/shared_audio_asset1.mp3", "path/to/shared_video_asset1.mp4"]
        }
    }}, 
    {
      audioAsset1: "google.com/en/audio_asset1.mp3", 
      imageAsset1: "google.com/en/image_asset1.png", 
      imageAsset2: "google.com/shared/image_asset2.png", 
      videoAsset2: "google.com/en/video_asset2.mp4"
    }
  ],
  [
    {
      "structure": "Only Multilingual",
      "default": {
        "languageSpecific": ["image_asset1.png", "audio_asset1.mp3", "video_asset2.mp4"],
        "shared": ["image_asset2.png", "shared_audio_asset2.mp3", "shared_video_asset2.mp4"]
      }
    },
    {
      audioAsset1: "google.com/en/audio_asset1.mp3", 
      imageAsset1: "google.com/en/image_asset1.png", 
      imageAsset2: "google.com/shared/image_asset2.png", 
      videoAsset2: "google.com/en/video_asset2.mp4"
    }
  ],
  [
    {
      "structure": "Only Multidevice",
      "preload": {
        "group1": {
            "device": ["image_asset1.png", "audio_asset1.mp3", "video_asset1.mp4", "image_asset2.png"],
            "shared": ["shared_image_asset1.png", "shared_audio_asset1.mp3", "shared_video_asset1.mp4"]
        },
        "group2": {
            "device": ["audio_asset2.mp3", "video_asset2.mp4"],
            "shared": ["shared_image_asset2.png", "shared_audio_asset2.mp3", "video_asset2.mp4"]
        }
      }
    },
    {
      audioAsset1: "google.com/desktop/audio_asset1.mp3", 
      imageAsset1: "google.com/desktop/image_asset1.png", 
      imageAsset2: "google.com/desktop/image_asset2.png", 
      videoAsset2: "google.com/shared/video_asset2.mp4"
    }
  ],
  [
    {
      "structure": "Only Multidevice",
      "default": {
        "device": ["image_asset1.png", "audio_asset1.mp3", "video_asset1.mp4"],
        "shared": ["image_asset2.png", "shared_audio_asset1.mp3", "video_asset2.mp4"]
      }
    }, 
    {
      audioAsset1: "google.com/desktop/audio_asset1.mp3", 
      imageAsset1: "google.com/desktop/image_asset1.png", 
      imageAsset2: "google.com/shared/image_asset2.png", 
      videoAsset2: "google.com/shared/video_asset2.mp4"
    }
  ],
  [
    {
      "structure": "No Multilingual and No multidevice",
      "preload": {
        "group1": ["image_asset1.png", "audio_asset1.mp3", "video_asset1.mp4", "image_asset2.png",],
        "group2": [ "audio_asset2.mp3", "video_asset2.mp4"]
      }
    },
    {
      audioAsset1: "google.com/audio_asset1.mp3", 
      imageAsset1: "google.com/image_asset1.png", 
      imageAsset2: "google.com/image_asset2.png", 
      videoAsset2: "google.com/video_asset2.mp4"
    }
  ],
  [
    {
      "structure": "No Multilingual and No multidevice",
      "default": ["image_asset1.png", "audio_asset1.mp3", "image_asset2.jpg", "video_asset2.mp4"]
    }, 
    {
      audioAsset1: "google.com/audio_asset1.mp3", 
      imageAsset1: "google.com/image_asset1.png", 
      imageAsset2: "google.com/image_asset2.jpg", 
      videoAsset2: "google.com/video_asset2.mp4"
    },
  ]
]

test('Generates correct asset object structure for all possible inputs', () => {
  for (const struc of structures) {
    const assetObj = generateAssetObject(struc[0], 'google.com')
    
    expect(assetObj.audio.audioAsset1).toBe(struc[1].audioAsset1)
    expect(assetObj.images.imageAsset1).toBe(struc[1].imageAsset1)
    expect(assetObj.images.imageAsset2).toBe(struc[1].imageAsset2)
    expect(assetObj.video.videoAsset2).toBe(struc[1].videoAsset2)
  }
})

test('Creates the correct preload trials from all possible inputs', () => {
  for (const struc of structures) {
    const preloadTrials = createPreloadTrials(struc[0], 'google.com')

    if (struc[0].preload) {
      expect(preloadTrials.group1).toBeDefined()
      expect(preloadTrials.group1.audio).toContain(struc[1].audioAsset1)
      expect(preloadTrials.group1.images).toContain(struc[1].imageAsset1)
      expect(preloadTrials.group1.images).toContain(struc[1].imageAsset2)
      expect(preloadTrials.group2.video).toContain(struc[1].videoAsset2)
    } else {
      expect(preloadTrials.default).toBeDefined()
      expect(preloadTrials.default.audio).toContain(struc[1].audioAsset1)
      expect(preloadTrials.default.images).toContain(struc[1].imageAsset1)
      expect(preloadTrials.default.images).toContain(struc[1].imageAsset2)
      expect(preloadTrials.default.video).toContain(struc[1].videoAsset2)
    }
  }
})

const testDate = new Date()

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
    expectedBirthMonth: 12 + (testDate.getMonth() + 1 - 254) % 12,
    expectedBirthYear: testDate.getFullYear() - Math.round(254 / 12),
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

]

test('Sets the correct age fields for all possible inputs', () => {
  for (const poss of agePossibilities) {
    console.table(poss);
    const ageData = getAgeData(poss.birthMonth, poss.birthYear, poss.age, poss.ageMonths)

    let expectedAge = null, expectedAgeMonths = null;

    if (poss.ageMonths || poss.age || poss.birthYear) {
      expectedAge = testDate.getFullYear() - poss.expectedBirthYear;
      expectedAgeMonths = (testDate.getFullYear() - poss.expectedBirthYear) * 12 + (testDate.getMonth() + 1 - poss.expectedBirthMonth);
    }

    expect(ageData.birthMonth).toBe(poss.expectedBirthMonth)
    expect(ageData.birthYear).toBe(poss.expectedBirthYear)
    expect(ageData.age).toBe(expectedAge)
    expect(ageData.ageMonths).toBe(expectedAgeMonths)
  }
})

test('Correctly parses grade', () => {
  // Test with default gradeMin and gradeMax
  expect(getGrade("K")).toBe(0)
  expect(getGrade("4")).toBe(4)
  expect(getGrade(5)).toBe(5)
  expect(getGrade("20")).toBe(12)
  expect(getGrade(20)).toBe(12)
  expect(getGrade("-5")).toBe(0)
  expect(getGrade(-5)).toBe(0)

  expect(getGrade("K", 2, 8)).toBe(2)
  expect(getGrade("4", 2, 8)).toBe(4)
  expect(getGrade(5, 2, 8)).toBe(5)
  expect(getGrade("20", 2, 8)).toBe(8)
  expect(getGrade(20, 2, 8)).toBe(8)
  expect(getGrade("-5", 2, 8)).toBe(2)
  expect(getGrade(-5, 2, 8)).toBe(2)
});