import * as esbuild from 'esbuild';
import fs from 'fs';
import path from 'path';

const gamesSourceDirectory = path.join(process.cwd(), 'src/games');
const gamesDistributionDirectory = path.join(process.cwd(), 'dist/games');
const isWatchMode = process.argv.includes('--watch');

function collectGameTypeScriptFiles() {
    return fs
        .readdirSync(gamesSourceDirectory, { recursive: true })
        .filter((relativeFilePath) => relativeFilePath.endsWith('.ts'))
        .filter((relativeFilePath) => !relativeFilePath.endsWith('.d.ts'))
        .map((relativeFilePath) => path.join(gamesSourceDirectory, relativeFilePath));
}

const buildOptions = {
    entryPoints: collectGameTypeScriptFiles(),
    outbase: gamesSourceDirectory,
    outdir: gamesDistributionDirectory,
    bundle: true,
    format: 'esm',
    target: 'es2022',
    platform: 'browser',
    sourcemap: true,
};

if (isWatchMode) {
    const buildContext = await esbuild.context(buildOptions);
    await buildContext.watch();
    console.log('Watching game TypeScript for changes...');
} else {
    await esbuild.build(buildOptions);
    console.log('Game TypeScript bundled.');
}