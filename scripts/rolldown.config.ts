import path from 'node:path';
import { defineConfig } from 'rolldown';

export default defineConfig({
	input: path.join(__dirname, 'index.ts'),
	output: {
		file: path.join(__dirname, 'index.js'),
		format: 'cjs',
	},
	external: (id) => !(id.startsWith('.') || path.isAbsolute(id)),
	tsconfig: path.join(__dirname, '../tsconfig.node.json'),
});
