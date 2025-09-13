import { readdirSync, watch } from 'node:fs';
import path from 'node:path';
import { compileLayout } from './layout';
import { compileStyle } from './style';
import { copy, saveFile, toAbsPath, walkDir } from './utils';

const EXTS = ['.pug', '.styl', '.ts'];

interface CompileOptions {
	src: string;
	dist: string;
	dir: string;
	name: string;
	files?: string[];
	allowError?: boolean;
}

function compile({ src, dist, dir, name, files, allowError }: CompileOptions) {
	try {
		const html = compileLayout(src, dir, `${name} | Jonny's Blog`);
		saveFile(path.join(dist, 'index.html'), html);
	} catch (error) {
		if (!allowError) throw error;
	}
	try {
		const css = compileStyle(src);
		saveFile(path.join(dist, 'index.css'), css);
	} catch (error) {
		if (!allowError) throw error;
	}
	try {
		for (const file of files?.values() ?? walkDir(src, '.')) {
			if (EXTS.includes(path.extname(file))) continue;
			copy(path.join(src, file), path.join(dist, file));
		}
	} catch (error) {
		if (!allowError) throw error;
	}
}

function main(allowError?: boolean) {
	const homeFiles: string[] = [];
	const targets: string[] = [];
	// Targets
	for (const dirent of readdirSync(toAbsPath('src'), { withFileTypes: true })) {
		if (dirent.name.startsWith('_')) continue;
		if (dirent.isDirectory()) {
			targets.push(dirent.name);
			continue;
		}
		if (!dirent.isFile()) continue;
		homeFiles.push(dirent.name);
	}
	// Compile: Home
	console.log('Compiling home page...');
	compile({
		src: toAbsPath('src'),
		dist: toAbsPath('dist'),
		dir: '/',
		name: 'Gadgets',
		files: homeFiles,
		allowError,
	});
	// Compile: Targets
	for (const target of targets) {
		console.log(`Compiling ${target}...`);
		const name = target
			.replace(/-/g, ' ')
			.replace(/^[a-z]/, (s) => s.toUpperCase());
		compile({
			src: toAbsPath('src', target),
			dist: toAbsPath('dist', target),
			dir: `/${target}/`,
			name: `${name} - Gadgets`,
			allowError,
		});
	}
}

function update() {
	try {
		main(true);
	} catch (error) {
		console.error(error);
	}
}

if (process.argv.includes('-w')) {
	const watcher = watch(toAbsPath('src'));
	let timer: NodeJS.Timeout | null = null;
	watcher.on('change', () => {
		if (timer !== null) clearTimeout(timer);
		timer = setTimeout(() => {
			timer = null;
			update();
		}, 100);
	});
	update();
} else {
	main();
}
