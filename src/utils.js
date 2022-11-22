import path from 'path';

// converts a string to camel case
export function camelize(string) {
  return string.replace(
    /_([a-z])/g,
    (groups) => groups[1].toUpperCase(),
  );
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
