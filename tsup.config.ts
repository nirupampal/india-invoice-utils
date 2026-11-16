import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  target: 'es2020',
  platform: 'neutral',
  dts: true,
  clean: true,
  splitting: false,
  treeshake: true,
  outExtension: ({ format }) => ({ js: format === 'esm' ? '.js' : '.cjs' }),
});
