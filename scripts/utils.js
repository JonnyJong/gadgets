const { existsSync } = require('fs');
const { mkdir, writeFile, copyFile, readdir } = require('fs/promises');
const path = require('path');

async function saveFile(filepath, data) {
  let dir = path.join(filepath, '..');
  if (dir !== '.' && !existsSync(dir)) {
    await mkdir(dir, { recursive: true });
  }
  try {
    await writeFile(filepath, data, 'utf8');
  } catch (error) {
    console.error(error);
    console.log('Error saving file:' + filepath);
  }
}

async function copy(src, dest) {
  let dir = path.join(dest, '..');
  if (dir !== '.' && !existsSync(dir)) {
    await mkdir(dir, { recursive: true });
  }
  try {
    await copyFile(src, dest);
  } catch (error) {
    console.error(error);
    console.log('Error copying file:' + src);
  }
}

async function walkDir(dir, short) {
  let files = [];
  for (const file of await readdir(dir, { withFileTypes: true })) {
    if (file.name.startsWith('_')) continue;
    const filepath = path.join(short, file.name);
    if (file.isDirectory()) {
      files.push(...(await walkDir(path.join(dir, file.name), filepath)));
    } else {
      files.push(filepath);
    }
  }
  return files;
}

module.exports = { saveFile, copy, walkDir };
