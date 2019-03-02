const fs = require('fs');
const { readdir, stat } = fs.promises;
const path = require('path');
const cheerio = require('cheerio');
const buildStartTime = Date.now();

(async () => {
  const filePaths = await getSrcFileRelativePaths();
  const htmlFiles = filePaths.filter(filePath => filePath.includes('.html'));

  const processedHtmlFiles = htmlFiles.map(filePath =>
    processHtmlFile(filePath)
  );

  const body = processedHtmlFiles.join('');

  const $ = cheerio.load(body);
  const spaScript = fs.readFileSync('./spa.js', 'utf8');
  $('body').prepend(`<script>${spaScript}</script>`);
  const site = $.html();

  fs.writeFile('./dist/index.html', site, err => {
    if (err) throw err;
    const buildTime = Date.now() - buildStartTime;
    console.log(`Built successfully in ${buildTime} ms`);
  });
})();

function processHtmlFile(filePath) {
  const prefixedFilePath = './src' + filePath;

  const sourceHtml = fs.readFileSync(prefixedFilePath, 'utf8');

  const $ = cheerio.load(
    `<div data-route="${filePath}" class="page" hidden></div>`
  );

  $('.page').append(sourceHtml);

  $('a').each((_, element) => {
    const linkUrl = $(element).attr('href');
    $(element).attr('href', `javascript:void(0)`);
    $(element).attr('data-href', linkUrl);
    $(element).attr('onclick', 'SPA.followLink(this)');
  });

  $('script').each((_, element) => {
    const attr = $(element).attr('scoped');
    if (typeof attr !== typeof undefined && attr !== false) {
      const scriptContent = $(element).html();

      $(element).html(
        `SPA.scopedPageScripts['${filePath}'] = (state) => {${scriptContent}};`
      );
    }
  });

  return $('body').html();
}

async function getSrcFileRelativePaths() {
  const srcFileAbsolutePaths = await getAbsoluteFilePathsInDirectory('./src');
  const srcDirectoryDepth = __dirname.split(path.sep).length + 1;

  const srcFileRelativePaths = srcFileAbsolutePaths.map(
    file =>
      '/' +
      file
        .split(path.sep)
        .slice(srcDirectoryDepth)
        .join('/')
  );
  return srcFileRelativePaths;
}

async function getAbsoluteFilePathsInDirectory(dir) {
  const subdirs = await readdir(dir);
  const files = await Promise.all(
    subdirs.map(async subdir => {
      const res = path.resolve(dir, subdir);
      return (await stat(res)).isDirectory()
        ? getAbsoluteFilePathsInDirectory(res)
        : res;
    })
  );
  return Array.prototype.concat(...files);
}
