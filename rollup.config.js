import terser from '@rollup/plugin-terser';
import nodeResolve from '@rollup/plugin-node-resolve';
const plugins = [terser()];

export default [{
	input: 'trusted-types.js',
	output: [{
		file: 'trusted-types.cjs',
		format: 'cjs',
	}, {
		file: 'trusted-types.min.js',
		format: 'iife',
		plugins,
	}]
}, {
	input: 'harden.js',
	output: [{
		file: 'harden.cjs',
		format: 'cjs',
	}, {
		file: 'harden.min.js',
		format: 'iife',
		plugins,
	}]
}, {
	input: 'bundle.js',
	plugins: [nodeResolve()],
	external: [
		'@aegisjsproject/trusted-types/trusted-types.js',
		'@aegisjsproject/trusted-types/harden.js',
	],
	output: {
		file: 'bundle.cjs',
		format: 'cjs',
	}
}, {
	input: 'bundle.js',
	plugins: [nodeResolve()],
	output: {
		file: 'bundle.min.js',
		format: 'iife',
		plugins,
	}
}];
