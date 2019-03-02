const fs = require('fs');
const { readdir, stat } = fs.promises;
const path = require('path');
const cheerio = require('cheerio');

(async () => {
  const filePaths = await getSrcFileRelativePaths();
  const htmlFiles = filePaths.filter(filePath => filePath.includes('.html'));

  const processedHtmlFiles = htmlFiles.map(filePath =>
    processHtmlFile(filePath)
  );

  const body = processedHtmlFiles.join('');

  const $ = cheerio.load(body);
  const spaScript = fs.readFileSync('./spa.js', 'utf8');
  $('body').append(`<script>${spaScript}</script>`);
  const site = $.html();

  fs.writeFile('./dist/index.html', site, err => {
    if (err) throw err;
    console.log('Built successfully!');
  });
})();

function processHtmlFile(filePath) {
  const prefixedFilePath = './src' + filePath;

  const sourceHtml = fs.readFileSync(prefixedFilePath, 'utf8');

  scriptProcessedSource = sourceHtml.replace(/{{([^}}]+)}}/g, (_, fn) => {
    return `<script>console.log((${fn})());</script>`;
  });

  const $ = cheerio.load(
    `<div data-route="${filePath}" class="page" hidden></div>`
  );

  $('.page').append(scriptProcessedSource);

  $('a').each((_, element) => {
    const linkUrl = $(element).attr('href');
    $(element).attr('href', `javascript:void(0)`);
    $(element).attr('data-href', linkUrl);
    $(element).attr('onclick', 'SPA.followLink(this)');
  });

  return $('body')
    .html()
    .replace(/{{([^}}]+)}}/g, () => {
      return '';
    });
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
