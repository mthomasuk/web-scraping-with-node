const Scraperoo = require('../../index.js');
const Server = require('../../server.js');

test('scrapeUrl should return an array of URLs that are relative to a given page and do not cross sub-domains', () => {
    const {
        scrapeUrl
    } = Scraperoo;

    const html = `
      <html>
        <body>
          <a href="/one" />
          <a href="www.google.com" />
          <a href="/two" />
          <a href="http://0.0.0.0:3002/three" />
        </body>
      </html>
    `;

    Server.spawn(html, 3002);

    return scrapeUrl('http://0.0.0.0:3002')
        .then((urls) => {
            expect(urls).toEqual([
                'http://0.0.0.0:3002/one',
                'http://0.0.0.0:3002/two',
                'http://0.0.0.0:3002/three'
            ]);
            Server.kill();
        });

});
