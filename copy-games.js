import fs from 'fs';
import path from 'path';

const sourceDirectory = path.join(process.cwd(), 'src/games');
const distributionDirectory = path.join(process.cwd(), 'dist/games');
const isWatchMode = process.argv.includes('--watch');

function removeDistributionFile(distributionPath) {
    if (fs.existsSync(distributionPath)) {
        fs.rmSync(distributionPath, { recursive: true, force: true });
        console.log(`[Asset Deleted] ${path.relative(distributionDirectory, distributionPath)}`);
    }
}

function handleAssetChange(sourcePath) {
    const relativePath = path.relative(sourceDirectory, sourcePath);
    const distributionPath = path.join(distributionDirectory, relativePath);

    if (fs.existsSync(sourcePath)) {
        if (sourcePath.endsWith('.ts')) return;
        if (fs.statSync(sourcePath).isFile()) {
            fs.mkdirSync(path.dirname(distributionPath), { recursive: true });
            fs.copyFileSync(sourcePath, distributionPath);
            console.log(`[Asset Updated] ${relativePath}`);
        }
        return;
    }

    // The source file or folder is gone, so remove its copy from dist
    if (sourcePath.endsWith('.ts')) {
        // tsc compiled this file, so remove its output too
        const compiledPath = distributionPath.replace(/\.ts$/, '.js');
        removeDistributionFile(compiledPath);
        removeDistributionFile(`${compiledPath}.map`);
    } else {
        removeDistributionFile(distributionPath);
    }
}

function copyRecursive(currentDirectory) {
    const entries = fs.readdirSync(currentDirectory, { withFileTypes: true });

    for (const entry of entries) {
        const entryPath = path.join(currentDirectory, entry.name);
        if (entry.isDirectory()) {
            copyRecursive(entryPath);
        } else {
            handleAssetChange(entryPath);
        }
    }
}

if (fs.existsSync(sourceDirectory)) {
    fs.mkdirSync(distributionDirectory, { recursive: true });
    copyRecursive(sourceDirectory);
    console.log('Initial game assets copied.');

    if (isWatchMode) {
        console.log('Watching for asset changes...');
        fs.watch(sourceDirectory, { recursive: true }, (eventType, fileName) => {
            if (fileName) {
                handleAssetChange(path.join(sourceDirectory, fileName));
            }
        });
    }
}