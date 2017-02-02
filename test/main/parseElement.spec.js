const Scraperoo = require('../../index.js');
const cheerio = require('cheerio');

test('parseElements should return a list of specified attributes', () => {
    const {
        parseElements
    } = Scraperoo;

    const html = `
      <html>
        <body>
          <img src="one.jpg" />
          <img src="two.jpg" />
          <img src="three.jpg" />
        </body>
      </html>
    `;

    const $ = cheerio.load(html);

    return parseElements([], $, 'img', 'src')
        .then((elArray) => {
            expect(elArray).toEqual([
                'one.jpg',
                'two.jpg',
                'three.jpg'
            ]);
        });

});
