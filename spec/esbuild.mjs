import * as esbuild from 'esbuild';
import fs from 'fs';

// ESBUILD configuration for use in production environment
const { metafile } = await esbuild.build({
  entryPoints: ['index.ts'],
  bundle: true,
  tsconfig: 'spec/tsconfig.json',
  platform: 'neutral',
  minify: true,
  outfile: 'dist/min.js',
  metafile: true
});

// Display the meta information and write it to disk for later use
console.log(await esbuild.analyzeMetafile(metafile));
fs.writeFileSync('dist/meta.json', JSON.stringify(metafile, null, 2));
