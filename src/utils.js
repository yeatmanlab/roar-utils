import path from 'path-browserify';

// converts a string to camel case
export function camelize(string) {
  return string.replace(/^([A-Z])|[\s-_](\w)/g, function(match, p1, p2, offset) {
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
