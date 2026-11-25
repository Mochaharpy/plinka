import fs from 'fs';
import path from 'path';

const srcDir = path.join(process.cwd(), 'src/games');
const distDir = path.join(process.cwd(), 'dist/games');
const isWatch = process.argv.includes('--watch');

function copyFile(srcPath) {
    const relativePath = path.relative(srcDir, srcPath);
    const destPath = path.join(distDir, relativePath);
    
    if (!srcPath.endsWith('.ts')) {
        fs.mkdirSync(path.dirname(destPath), { recursive: true });
        fs.copyFileSync(srcPath, destPath);
        console.log(`[Asset Updated] ${relativePath}`);
    }
}

function copyRecursive(currentDir) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });

    for (const entry of entries) {
        const srcPath = path.join(currentDir, entry.name);
        if (entry.isDirectory()) {
            copyRecursive(srcPath);
        } else {
            copyFile(srcPath);
        }
    }
}

if (fs.existsSync(srcDir)) {
    fs.mkdirSync(distDir, { recursive: true });
    copyRecursive(srcDir);
    console.log('Initial game assets copied.');

    if (isWatch) {
        console.log('Watching for asset changes...');
        fs.watch(srcDir, { recursive: true }, (eventType, filename) => {
            if (filename) {
                const srcPath = path.join(srcDir, filename);
                if (fs.existsSync(srcPath) && fs.statSync(srcPath).isFile()) {
                    copyFile(srcPath);
                }
            }
        });
    }
}