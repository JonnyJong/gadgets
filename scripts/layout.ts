import path from 'node:path';
import { renderFile } from 'pug';

export function compileLayout(src: string, dir: string, title: string) {
	const body = renderFile(path.join(src, 'index.pug'));
	return `<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${title}</title><link rel="shortcut icon" href="${dir}icon.png"><link rel="stylesheet" href="${dir}index.css"><script src="${dir}index.js" defer></script></head><body>${body}</body></html>`;
}
