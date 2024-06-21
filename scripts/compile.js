const { readdir } = require('fs/promises');
const path = require('path');
const { compileLayout } = require('./layout');
const { compileStyle } = require('./style');
const { saveFile, walkDir, copy } = require('./utils');
const config = require('../config');

/**
 * @param {string} name
 * @returns {string}
 */
async function compile(name) {
  let srcDir = path.join('./src', name);
  let distDir = path.join('./dist', name);
  let title = name.replace(/-/g, ' ').replace(/^[a-z]/, (s) => s.toUpperCase());
  let html = await compileLayout(srcDir, {
    title: title + " - Gadget | Jonny's Blog",
  });
  let css = await compileStyle(srcDir);
  await saveFile(path.join(distDir, 'index.html'), html);
  await saveFile(path.join(distDir, 'style.css'), css);
  for (const file of await walkDir(srcDir, '.')) {
    if (['index.pug', 'style.styl'].includes(file) || file.endsWith('.ts'))
      continue;
    await copy(path.join(srcDir, file), path.join(distDir, file));
  }
  return title;
}

async function compileHome(items) {
  let html = await compileLayout('./src', {
    title: "Gadget | Jonny's Blog",
    items: items,
  });
  let css = await compileStyle('./src');
  await saveFile('./dist/index.html', html);
  await saveFile('./dist/style.css', css);
}

async function main() {
  // Items
  let dirents = await readdir('./src', { withFileTypes: true });
  dirents = dirents
    .filter((dirent) => !dirent.name.startsWith('_'))
    .filter((dirent) => dirent.isDirectory());
  let items = [];
  for (const dirent of dirents) {
    let title = await compile(dirent.name);
    if (title === '') continue;
    items.push({
      name: dirent.name,
      title,
      nick: config.names[dirent.name],
    });
  }
  // Home
  compileHome(items);
}

if (require.main === module) {
  main();
}
