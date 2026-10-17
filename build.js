const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

async function build() {
  console.log('--- Starting NoName Laundry Bangkok Build ---');

  const rootDir = __dirname;
  const distDir = path.join(rootDir, 'dist');
  const publicDir = path.join(rootDir, 'public');
  const publicDistDir = path.join(publicDir, 'dist');

  // 1. Ensure required directories exist & clean old chunks
  fs.mkdirSync(distDir, { recursive: true });
  fs.mkdirSync(publicDir, { recursive: true });
  fs.mkdirSync(publicDistDir, { recursive: true });

  for (const dir of [distDir, publicDistDir]) {
    for (const file of fs.readdirSync(dir)) {
      if (file.endsWith('.js') || file.endsWith('.map')) {
        try { fs.unlinkSync(path.join(dir, file)); } catch (e) {}
      }
    }
  }

  const bundleOut = path.join(distDir, 'app.js');

  // 2. Bundle with esbuild (code-splitting + local React production bundle)
  let bundled = false;
  try {
    const esbuild = require('esbuild');
    await esbuild.build({
      entryPoints: { app: path.join(rootDir, 'js', 'index.jsx') },
      bundle: true,
      outdir: distDir,
      entryNames: '[name]',
      chunkNames: 'chunk-[hash]',
      format: 'esm',
      splitting: true,
      minify: true,
      sourcemap: false,
      define: {
        'process.env.NODE_ENV': '"production"'
      }
    });
    bundled = true;
    console.log('Bundled via esbuild JS API (code-splitting + bundled React).');
  } catch (err) {
    console.warn('esbuild JS API failed, attempting CLI fallback...', err.message);
    const winExe = 'C:\\Users\\jsiri\\AppData\\Local\\npm-cache\\_npx\\2778af9cee32ff87\\node_modules\\@esbuild\\win32-x64\\esbuild.exe';
    const esbuildCmd = fs.existsSync(winExe) ? `"${winExe}"` : 'npx esbuild';
    try {
      execSync(`${esbuildCmd} app=js/index.jsx --bundle --outdir=dist --entry-names=[name] --chunk-names=chunk-[hash] --format=esm --splitting --minify --define:process.env.NODE_ENV=\\"production\\"`, {
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

  // 3. Mirror all bundled files (app.js + lazy chunks) to public/dist/
  if (fs.existsSync(distDir)) {
    for (const file of fs.readdirSync(distDir)) {
      const srcFile = path.join(distDir, file);
      if (fs.statSync(srcFile).isFile()) {
        fs.copyFileSync(srcFile, path.join(publicDistDir, file));
      }
    }
    if (fs.existsSync(bundleOut)) {
      const stat = fs.statSync(bundleOut);
      console.log(`Entry bundle ready: dist/app.js (${(stat.size / 1024).toFixed(1)} KB)`);
    }
  }

  // 4. Inject inline critical CSS + modulepreload hints into HTML files and copy to public/
  const criticalCssPath = path.join(rootDir, 'css', 'critical.min.css');
  const criticalCss = fs.existsSync(criticalCssPath) ? fs.readFileSync(criticalCssPath, 'utf8').trim() : '';

  // Extract top-level static chunk imports from dist/app.js to modulepreload them in parallel
  const staticChunks = [];
  if (fs.existsSync(bundleOut)) {
    const appCode = fs.readFileSync(bundleOut, 'utf8').slice(0, 2000);
    const importRegex = /from\s*["']\.\/(chunk-[A-Za-z0-9_-]+\.js)["']/g;
    let match;
    while ((match = importRegex.exec(appCode)) !== null) {
      if (!staticChunks.includes(match[1])) {
        staticChunks.push(match[1]);
      }
    }
  }

  const preloadLinks = staticChunks
    .map((chunk) => `    <link rel="modulepreload" href="/dist/${chunk}" />`)
    .join('\n');

  const perfAssetsBlock = [
    '<!-- START_PERF_ASSETS -->',
    criticalCss ? `    <style id="critical-css">${criticalCss}</style>` : '',
    '    <link rel="preload" href="/css/tailwind.min.css?v=perf_v3" as="style" onload="this.onload=null;this.rel=\'stylesheet\'" />',
    '    <noscript><link rel="stylesheet" href="/css/tailwind.min.css?v=perf_v3" /></noscript>',
    preloadLinks,
    '    <!-- END_PERF_ASSETS -->'
  ].filter(Boolean).join('\n');

  function updateAndCopyHtml(srcHtmlPath, destHtmlPath, label) {
    if (!fs.existsSync(srcHtmlPath)) return;
    let html = fs.readFileSync(srcHtmlPath, 'utf8');
    const perfRegex = /<!-- START_PERF_ASSETS -->[\s\S]*?<!-- END_PERF_ASSETS -->/;
    if (perfRegex.test(html)) {
      html = html.replace(perfRegex, perfAssetsBlock);
      fs.writeFileSync(srcHtmlPath, html, 'utf8');
    }
    fs.writeFileSync(destHtmlPath, html, 'utf8');
    console.log(`Updated & copied ${label} (${staticChunks.length} modulepreload chunks + inline critical CSS)`);
  }

  updateAndCopyHtml(path.join(rootDir, 'index.html'), path.join(publicDir, 'index.html'), 'index.html');

  const cities = ['bangkok', 'pattaya'];
  for (const city of cities) {
    const citySrcDir = path.join(rootDir, city);
    const cityDestDir = path.join(publicDir, city);
    if (fs.existsSync(citySrcDir)) {
      fs.mkdirSync(cityDestDir, { recursive: true });
      updateAndCopyHtml(
        path.join(citySrcDir, 'index.html'),
        path.join(cityDestDir, 'index.html'),
        `${city}/index.html`
      );
    }
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

  // 6. Copy images directory to public/images if present
  const imagesDir = path.join(rootDir, 'images');
  if (fs.existsSync(imagesDir)) {
    const publicImagesDir = path.join(publicDir, 'images');
    fs.mkdirSync(publicImagesDir, { recursive: true });
    for (const file of fs.readdirSync(imagesDir)) {
      const srcFile = path.join(imagesDir, file);
      if (fs.statSync(srcFile).isFile()) {
        fs.copyFileSync(srcFile, path.join(publicImagesDir, file));
      }
    }
    console.log('Copied images directory -> public/images');
  }

  // 7. Copy SEO assets (robots.txt, sitemap.xml, manifest.json) to public/
  const seoFiles = ['robots.txt', 'sitemap.xml', 'manifest.json'];
  for (const f of seoFiles) {
    const srcPath = path.join(rootDir, f);
    if (fs.existsSync(srcPath)) {
      fs.copyFileSync(srcPath, path.join(publicDir, f));
      console.log(`Copied ${f} -> public/${f}`);
    }
  }

  console.log('--- Build Complete: Output directory "public" successfully generated! ---');
}

build().catch((err) => {
  console.error('Build failed with error:', err);
  process.exit(1);
});
