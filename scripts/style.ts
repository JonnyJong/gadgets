import fs from 'node:fs';
import path from 'node:path';
import { render } from 'stylus';

export function compileStyle(src: string) {
	const filename = path.join(src, 'index.styl');
	const file = fs.readFileSync(filename, 'utf8');
	return render(file, {
		filename,
		paths: [src],
	});
}
