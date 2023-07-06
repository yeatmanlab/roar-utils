import os from 'node:os';
import path from 'path-browserify';
// import {  } from '../src/utils';
import { generateAssetObject, createPreloadTrials, camelize, camelizeFiles } from '../src/testFunctions'

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

const structures = [
  [{"preload": {
          "group1": {
                  "languageSpecific": {
                      "device": ["pic.jpg", "audio_asset1.mp3", "video_asset1.mp4"],
                      "shared": ["image_asset1.png", "nestedLang_video1.mp4"]
                  },
                  "shared": ["image_asset2.png", "shared_audio_asset1.mp3", "shared_video_asset1.mp4"]
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
    }}, 
    {
      audioAsset1: "google.com/en/desktop/audio_asset1.mp3", 
      imageAsset1: "google.com/en/shared/image_asset1.png", 
      imageAsset2: "google.com/shared/image_asset2.png", 
      videoAsset2: "google.com/shared/desktop/video_asset2.mp4"
    }
  ],
  [
    {"default": {
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
    {"preload": {
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
      "preload": {
        "group1": {
            "device": ["image_asset1.png", "audio_asset1.mp3", "video_asset1.mp4"],
            "shared": ["shared_image_asset1.png", "shared_audio_asset1.mp3", "shared_video_asset1.mp4"]
        },
        "group2": {
            "device": ["image_asset2.png", "audio_asset2.mp3", "video_asset2.mp4"],
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
      "preload": {
        "group1": ["image_asset1.png", "audio_asset1.mp3", "video_asset1.mp4"],
        "group2": ["image_asset2.png", "audio_asset2.mp3", "video_asset2.mp4"]
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
      "default": ["image_asset1.png", "audio_asset1.mp3", "image_asset2.jpg", "video_asset2.mp4"]
    }, 
    {
      audioAsset1: "google.com/audio_asset1.mp3", 
      imageAsset1: "google.com/image_asset1.png", 
      imageAsset2: "google.com/image_asset2.jpg", 
      videoAsset2: "google.com/video_asset2.mp4"
    }
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

})