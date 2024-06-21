const { readFile } = require('fs/promises');
const path = require('path');
const { render } = require('stylus');

async function compileStyle(dir) {
  let filename = path.join(dir, 'style.styl');
  let file;
  try {
    file = await readFile(filename, 'utf8');
  } catch (e) {
    console.error(e);
    console.log('Failed to load style file: ' + dir);
    return '';
  }
  let css;
  try {
    css = render(file, {
      filename,
      paths: [dir],
    });
  } catch (error) {
    console.error(error);
    console.log('Failed to compile style file: ' + dir);
    return '';
  }
  return css;
}

module.exports = { compileStyle };
