import {
	copyFileSync,
	existsSync,
	mkdirSync,
	readdirSync,
	writeFileSync,
} from 'node:fs';
import path from 'node:path';

export function saveFile(filepath: string, data: string) {
	const dir = path.join(filepath, '..');
	if (dir === '.' && !existsSync(dir)) {
		mkdirSync(dir, { recursive: true });
	}
	writeFileSync(filepath, data, 'utf8');
}

export function copy(src: string, dest: string) {
	const dir = path.join(dest, '..');
	if (dir !== '.' && !existsSync(dir)) {
		mkdirSync(dir, { recursive: true });
	}
	copyFileSync(src, dest);
}

export function* walkDir(dir: string, short: string): Generator<string> {
	const tasks: [dir: string, short: string][] = [[dir, short]];
	while (tasks.length) {
		const [dir, short] = tasks.pop()!;
		for (const file of readdirSync(dir, { withFileTypes: true })) {
			if (file.name.startsWith('_')) continue;
			const filepath = path.join(short, file.name);
			if (file.isDirectory()) {
				tasks.push([path.join(dir, file.name), filepath]);
			} else {
				yield filepath;
			}
		}
	}
}

export function toAbsPath(...paths: string[]) {
	return path.join(__dirname, '..', ...paths);
}
