import { readdirSync } from 'node:fs';
import path from 'node:path';
import { defineConfig, RolldownOptions } from 'rolldown';

const external = (id: string) => !(id.startsWith('.') || path.isAbsolute(id));

export default () => {
	const targets = ['.'];
	for (const dirent of readdirSync(path.join(__dirname, 'src'), {
		withFileTypes: true,
	})) {
		if (!dirent.isDirectory()) continue;
		if (dirent.name.startsWith('_')) continue;
		targets.push(dirent.name);
	}
	return defineConfig(
		targets.map<RolldownOptions>((target) => {
			return {
				input: path.join(__dirname, 'src', target, 'index.ts'),
				output: {
					file: path.join(__dirname, 'dist', target, 'index.js'),
					format: 'cjs',
				},
				external,
			};
		}),
	);
};
