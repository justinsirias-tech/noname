const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

async function build() {
  console.log('--- Starting NoName Laundry Bangkok Build ---');

  const rootDir = __dirname;
  const distDir = path.join(rootDir, 'dist');
  const publicDir = path.join(rootDir, 'public');
  const publicDistDir = path.join(publicDir, 'dist');

  // 1. Ensure required directories exist
  fs.mkdirSync(distDir, { recursive: true });
  fs.mkdirSync(publicDir, { recursive: true });
  fs.mkdirSync(publicDistDir, { recursive: true });

  const bundleOut = path.join(distDir, 'app.js');

  // 2. Attempt to bundle using esbuild
  let bundled = false;
  try {
    const esbuild = require('esbuild');
    await esbuild.build({
      entryPoints: [path.join(rootDir, 'js', 'index.jsx')],
      bundle: true,
      outfile: bundleOut,
      format: 'esm',
      external: ['react', 'react-dom', 'react-dom/client'],
      minify: true,
      sourcemap: false
    });
    bundled = true;
    console.log('Bundled via esbuild JS API.');
  } catch (err) {
    console.warn('esbuild JS API failed, attempting CLI fallback...');
    const winExe = 'C:\\Users\\jsiri\\AppData\\Local\\npm-cache\\_npx\\2778af9cee32ff87\\node_modules\\@esbuild\\win32-x64\\esbuild.exe';
    const esbuildCmd = fs.existsSync(winExe) ? `"${winExe}"` : 'npx esbuild';
    try {
      execSync(`${esbuildCmd} js/index.jsx --bundle --outfile=dist/app.js --format=esm --external:react --external:react-dom --external:react-dom/client --minify`, {
        cwd: rootDir,
        stdio: 'inherit'
      });
      bundled = true;
      console.log('Bundled via CLI.');
    } catch (cliErr) {
      if (fs.existsSync(bundleOut)) {
        console.warn('Using existing dist/app.js bundle as fallback.');
        bundled = true;
      } else {
        throw cliErr;
      }
    }
  }

  // 3. Mirror bundled file to public/dist/app.js
  if (fs.existsSync(bundleOut)) {
    const stat = fs.statSync(bundleOut);
    console.log(`Bundle ready: dist/app.js (${(stat.size / 1024).toFixed(1)} KB)`);
    fs.copyFileSync(bundleOut, path.join(publicDistDir, 'app.js'));
  }

  // 4. Copy index.html to public/index.html
  const rootIndexHtml = path.join(rootDir, 'index.html');
  if (fs.existsSync(rootIndexHtml)) {
    fs.copyFileSync(rootIndexHtml, path.join(publicDir, 'index.html'));
    console.log('Copied index.html -> public/index.html');
  }

  // 5. Copy css directory to public/css if present
  const cssDir = path.join(rootDir, 'css');
  if (fs.existsSync(cssDir)) {
    const publicCssDir = path.join(publicDir, 'css');
    fs.mkdirSync(publicCssDir, { recursive: true });
    for (const file of fs.readdirSync(cssDir)) {
      const srcFile = path.join(cssDir, file);
      if (fs.statSync(srcFile).isFile()) {
        fs.copyFileSync(srcFile, path.join(publicCssDir, file));
      }
    }
    console.log('Copied css directory -> public/css');
  }

  console.log('--- Build Complete: Output directory "public" successfully generated! ---');
}

build().catch((err) => {
  console.error('Build failed with error:', err);
  process.exit(1);
});
