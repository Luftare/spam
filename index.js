const fs = require('fs');

const cheerio = require('cheerio');
const script = `
<script>
  function toRoute(route) {
    console.log('going to:', route);
  }
</script>
`;

fs.readFile('./public/index.html', 'utf8', (err, res) => {
  if (err) throw err;

  const $ = cheerio.load('<div class="page"></div>');

  $('.page').append(res);
  $('.page').append(script);

  $('a').each((i, element) => {
    const linkUrl = $(element).attr('href');
    $(element).attr('href', `javascript:void(0)`);
    $(element).attr('onclick', `toRoute('${linkUrl}')`);
  });

  const page = $('body').html();

  fs.writeFile('./dist/index.html', page, err => {
    if (err) throw err;
    console.log('Saved!');
  });
});
