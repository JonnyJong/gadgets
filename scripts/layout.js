const path = require('path');
const { renderFile } = require('pug');

function pack(body, title, srcPath) {
  return `<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${title}</title><link rel="shortcut icon" href="${srcPath}icon.png"><link rel="stylesheet" href="/base.css"><link rel="stylesheet" href="${srcPath}style.css"><script src="${srcPath}script.js" defer></script></head><body>${body}</body></html>`;
  // <footer><a href="https://jonnys.top" class="author"><img src="https://jonnys.top/img/avatar.svg"><span>Jonny</span></a></footer>
}

function compileLayout(dir, options) {
  let srcPath = '/' + path.parse(dir).name + '/';
  if (dir === './src') {
    srcPath = '/';
  }
  return new Promise((resolve) => {
    renderFile(path.join(dir, 'index.pug'), options, (err, body) => {
      if (err) {
        console.error(err);
        console.log('Error rendering layout for' + dir);
        resolve('');
        return;
      }
      resolve(pack(body, options.title, srcPath));
    });
  });
}

module.exports = { compileLayout };
