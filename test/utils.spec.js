import os from 'node:os';
import path from 'path-browserify';
import { camelize, camelizeFiles } from '../src/utils';

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
